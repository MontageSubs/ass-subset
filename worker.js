'use strict';
function runWorker() {
const DRAW_FONT_NAME = 'ASSDrawSubset_MontageSubs';
const EM = 1024;
const TARGET = 820;
const MARGIN = (EM - TARGET) / 2;
const PROGRESS_INTERVAL = 5000;
const SYSTEM_FONTS = new Set([
  'arial', 'arial black', 'comic sans ms', 'courier new', 'georgia',
  'impact', 'tahoma', 'times new roman', 'trebuchet ms', 'verdana',
  'webdings', 'wingdings', 'symbol',
  'calibri', 'cambria', 'candara', 'consolas', 'constantia', 'corbel',
  'franklin gothic medium', 'lucida console', 'lucida sans unicode',
  'microsoft sans serif', 'palatino linotype', 'segoe ui', 'segoe print', 'segoe script',
  'segoe ui emoji',
  'microsoft yahei', 'microsoft yahei ui', '微软雅黑',
  'simsun', '宋体', 'nsimsun', 'simsun-extb',
  'simhei', '黑体',
  'simkai', 'kaiti', '楷体', 'kaiti_gb2312', 'kaiti sc', 'kaiti tc',
  'fangsong', '仿宋', 'fangsong_gb2312',
  'dengxian', '等线',
  'fzshuti', '方正舒体', 'fzyaoti', '方正姚体',
  'microsoft jhenghei', 'microsoft jhenghei ui', '微軟正黑體',
  'mingliu', '細明體', 'pmingliu', '新細明體', 'mingliu-extb', 'dfkai-sb', '標楷體',
  'meiryo', 'meiryo ui', 'メイリオ', 'ms gothic', 'ms pgothic', 'ms mincho', 'ms pmincho',
  'yu gothic', 'yu gothic ui', '游ゴシック', 'yu mincho', '游明朝',
  'batang', 'batangche', 'dotum', 'dotumche', 'gulim', 'gulimche', 'malgun gothic',
  '맑은 고딕', '나눔고딕', 'nanum gothic',
  'helvetica', 'helvetica neue', 'geneva', 'monaco',
  'pingfang sc', '苹方-简', 'pingfang tc', '苹方-繁', 'pingfang hk', '苹方-港',
  'hiragino sans gb', '冬青黑体简体中文', 'hiragino sans',
  'st heiti sc', 'st heiti tc', 'stheitisc', 'stheitist',
  'st song', '华文宋体', 'stfangsong', '华文仿宋', 'stkaiti', '华文楷体', 'stxihei', '华文细黑',
  'hiragino mincho pron', 'hiragino kaku gothic pron',
  'liberation sans', 'liberation serif', 'liberation mono',
  'noto sans', 'noto serif', 'noto sans cjk sc', 'noto sans cjk tc', 'noto sans cjk jp',
  'noto sans cjk kr', 'wqy microhei', 'wqy zenhei', 'droid sans', 'droid sans fallback',
  'assdrawsubset_montagesubs', 'assdrawsubset',
]);
const isAnyDrawFont = (n) => {
  return n.toLowerCase().startsWith('assdrawsubset');
};
function emitProgress(id, phase, current, total) {
  self.postMessage({ type: 'progress', id, phase, current, total });
}
function emitLog(id, key, level, params) {
  self.postMessage({ type: 'log', id, key, level, params: params || {} });
}
function assUUEncode(uint8Array) {
  let out = '';
  const n = uint8Array.length;
  for (let i = 0; i < n; i += 3) {
    const rem = n - i;
    const b0 = uint8Array[i];
    const b1 = rem > 1 ? uint8Array[i + 1] : 0;
    const b2 = rem > 2 ? uint8Array[i + 2] : 0;
    const v = (b0 << 16) | (b1 << 8) | b2;
    out += String.fromCharCode(((v >> 18) & 0x3f) + 33);
    out += String.fromCharCode(((v >> 12) & 0x3f) + 33);
    if (rem > 1) out += String.fromCharCode(((v >> 6) & 0x3f) + 33);
    if (rem > 2) out += String.fromCharCode((v & 0x3f) + 33);
  }
  return out;
}
function assUUDecode(encodedLines) {
  const enc = encodedLines.join('');
  const bytes = [];
  const n = enc.length;
  for (let i = 0; i < n; i += 4) {
    const rem = n - i;
    const c0 = enc.charCodeAt(i) - 33;
    const c1 = (i + 1 < n) ? enc.charCodeAt(i + 1) - 33 : 0;
    const v0 = (c0 << 18) | (c1 << 12);
    bytes.push((v0 >> 16) & 0xFF);
    if (rem > 2) {
      const c2 = enc.charCodeAt(i + 2) - 33;
      const v1 = v0 | (c2 << 6);
      bytes.push((v1 >> 8) & 0xFF);
      if (rem > 3) {
        const c3 = enc.charCodeAt(i + 3) - 33;
        const v2 = v1 | c3;
        bytes.push(v2 & 0xFF);
      }
    }
  }
  return new Uint8Array(bytes);
}
function extractTTFFromTTC(buffer, index) {
  const view = new DataView(buffer);
  const tag = view.getUint32(0, false);
  if (tag !== 0x74746366) return buffer;
  const numFonts = view.getUint32(8, false);
  if (index >= numFonts) throw new Error(`TTC index ${index} out of range (max ${numFonts - 1})`);
  const offsetTablePos = view.getUint32(12 + index * 4, false);
  const numTables = view.getUint16(offsetTablePos + 4, false);
  const headerSize = 12 + numTables * 16;
  let totalDataSize = 0;
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const recordPos = offsetTablePos + 12 + i * 16;
    const t = {
      tag: view.getUint32(recordPos, false),
      checksum: view.getUint32(recordPos + 4, false),
      offset: view.getUint32(recordPos + 8, false),
      length: view.getUint32(recordPos + 12, false)
    };
    tables.push(t);
    totalDataSize += (t.length + 3) & ~3;
  }
  const newBuffer = new ArrayBuffer(headerSize + totalDataSize);
  const newView = new DataView(newBuffer);
  const newU8 = new Uint8Array(newBuffer);
  const oldU8 = new Uint8Array(buffer);
  for (let i = 0; i < 12; i++) newU8[i] = oldU8[offsetTablePos + i];
  let currentOffset = headerSize;
  for (let i = 0; i < numTables; i++) {
    const t = tables[i];
    const recordPos = 12 + i * 16;
    newView.setUint32(recordPos, t.tag);
    newView.setUint32(recordPos + 4, t.checksum);
    newView.setUint32(recordPos + 8, currentOffset);
    newView.setUint32(recordPos + 12, t.length);
    newU8.set(oldU8.slice(t.offset, t.offset + t.length), currentOffset);
    currentOffset += (t.length + 3) & ~3;
  }
  return newBuffer;
}
function assTimeToMs(s) {
  const m = s.match(/(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  return (parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3])) * 1000;
}
function normFont(name) { return name.replace(/^@/, '').trim(); }
function parseASSText(text, id, forceHasBOM) {
  const hasBOM = forceHasBOM || text.startsWith('\uFEFF');
  const pureText = hasBOM ? (text.startsWith('\uFEFF') ? text.slice(1) : text) : text;

  const crlfMatches = pureText.match(/\r\n/g) || [];
  const crlfCount = crlfMatches.length;
  const lfCount = (pureText.split('\n').length - 1) - crlfCount;
  const detectedNewline = crlfCount >= lfCount ? '\r\n' : '\n';

  const lines = pureText.split(/\r?\n/);
  const totalLines = lines.length;
  let section = '';
  let evtFmt = null;
  let styleFmt = null;
  const styles = {};
  const fontChars = {};
  const drawings = [];
  let playResX = 0, playResY = 0;
  const embeddedFonts = {};
  let currentEmbedFont = null;
  let originalDrawFontName = DRAW_FONT_NAME;
  let hasExistingDrawSubset = false;
  const subsetReferencedChars = new Map();
  for (let li = 0; li < totalLines; li++) {
    if (li % PROGRESS_INTERVAL === 0) emitProgress(id, 'parse', li, totalLines);
    const t = lines[li].trim();
    if (!t) continue;
    if (t.startsWith('[')) {
      if (section === '[fonts]' && currentEmbedFont && !/^\[(?:Script Info|v4[^\]]*Styles|Styles|Events|Fonts|Graphics|Aegisub)/i.test(t)) {
        embeddedFonts[currentEmbedFont].push(t);
        continue;
      }
      section = t.toLowerCase();
      currentEmbedFont = null;
      continue;
    }
    if (section === '[script info]') {
      const resXM = t.match(/^PlayResX\s*:\s*(\d+)/i);
      if (resXM) playResX = parseInt(resXM[1]);
      const resYM = t.match(/^PlayResY\s*:\s*(\d+)/i);
      if (resYM) playResY = parseInt(resYM[1]);
    }
    if (section.includes('styles')) {
      if (/^format\s*:/i.test(t) && !styleFmt) {
        const flds = t.replace(/^format\s*:\s*/i, '').split(',').map(f => f.trim().toLowerCase());
        styleFmt = {
          nameIdx: flds.indexOf('name'),
          fontIdx: flds.indexOf('fontname'),
          boldIdx: flds.indexOf('bold'),
        };
      }
      if (/^style\s*:/i.test(t) && styleFmt) {
        const parts = t.replace(/^style\s*:\s*/i, '').split(',');
        const sName = parts[styleFmt.nameIdx]?.trim();
        const sFont = normFont(parts[styleFmt.fontIdx]?.trim() || 'Arial');
        const sBold = parseInt(parts[styleFmt.boldIdx]?.trim() || '0') !== 0;
        if (sName) styles[sName] = { font: sFont, bold: sBold };
      }
    }
    if (section === '[fonts]') {
      if (/^fontname:\s*/i.test(t)) {
        currentEmbedFont = t.replace(/^fontname:\s*/i, '').trim();
        embeddedFonts[currentEmbedFont] = [];
        if (isAnyDrawFont(currentEmbedFont)) {
          hasExistingDrawSubset = true;
          if (!originalDrawFontName || originalDrawFontName === DRAW_FONT_NAME) {
            originalDrawFontName = currentEmbedFont.replace(/_\d+\.ttf$/i, '');
          }
        }
      } else if (currentEmbedFont && t.length > 0) {
        embeddedFonts[currentEmbedFont].push(t);
      }
    }
    if (section === '[events]') {
      if (/^format\s*:/i.test(t)) {
        const flds = t.replace(/^format\s*:\s*/i, '').split(',').map(f => f.trim().toLowerCase());
        evtFmt = {
          styleIdx: flds.indexOf('style'),
          textIdx: flds.indexOf('text'),
          startIdx: flds.indexOf('start'),
          endIdx: flds.indexOf('end'),
        };
      }
      if (/^dialogue\s*:/i.test(t) && evtFmt) {
        const rest = t.replace(/^dialogue\s*:\s*/i, '');
        const parts = rest.split(',');
        const styleName = parts[evtFmt.styleIdx]?.trim();
        const styleInfo = styles[styleName] || { font: 'Arial', bold: false };
        const textPart = parts.slice(evtFmt.textIdx).join(',');
        const tStart = parts[evtFmt.startIdx]?.trim() || '';
        const tEnd = parts[evtFmt.endIdx]?.trim() || '';
        const tMs = assTimeToMs(tStart);
        parseDialogueText(textPart, styleInfo, tStart, tEnd, tMs,
          fontChars, drawings, subsetReferencedChars, styles);
      }
    }
  }
  emitProgress(id, 'parse', totalLines, totalLines);
  const uniqueDrawings = buildUniqueDrawings(drawings);
  const externalFonts = {};
  for (const [name, weights] of Object.entries(fontChars)) {
    if (!SYSTEM_FONTS.has(name.toLowerCase()) && !isAnyDrawFont(name)) {
      externalFonts[name] = {
        normal: Array.from(weights.normal || []),
        bold: Array.from(weights.bold || []),
      };
    }
  }
  const systemFontsReferenced = {};
  for (const [name, weights] of Object.entries(fontChars)) {
    if (SYSTEM_FONTS.has(name.toLowerCase()) && !isAnyDrawFont(name)) {
      const totalChars = (weights.normal?.size || 0) + (weights.bold?.size || 0);
      if (totalChars > 0) {
        systemFontsReferenced[name] = {
          normal: Array.from(weights.normal || []),
          bold: Array.from(weights.bold || []),
        };
      }
    }
  }
  let existingSubsetFontBuffer = null;
  if (hasExistingDrawSubset) {
    const key = Object.keys(embeddedFonts).find(k => isAnyDrawFont(k));
    if (key && embeddedFonts[key].length > 0) {
      try {
        existingSubsetFontBuffer = assUUDecode(embeddedFonts[key]).buffer;
      } catch (_) { }
    }
  }
  let subsetNeedsUpdate = false;
  if (hasExistingDrawSubset) {
    if (existingSubsetFontBuffer) {
      try {
        const existingFont = opentype.parse(existingSubsetFontBuffer);
        const existingChars = new Set();
        for (let i = 1; i < existingFont.glyphs.length; i++) {
          const g = existingFont.glyphs.get(i);
          if (g && g.unicode && g.unicode > 0) existingChars.add(String.fromCodePoint(g.unicode));
        }
        const refChars = Array.from(subsetReferencedChars.keys());
        subsetNeedsUpdate = existingChars.size !== refChars.length ||
          !refChars.every(ch => existingChars.has(ch));
      } catch (_) {
        subsetNeedsUpdate = true;
      }
    } else {
      subsetNeedsUpdate = true;
    }
  }
  return {
    styles,
    externalFonts,
    systemFontsReferenced,
    drawings: drawings.length,
    uniqueDrawings: Array.from(uniqueDrawings.entries()).map(([data, meta]) => ({ data, ...meta })),
    playResX, playResY,
    lineCount: totalLines,
    hasExistingDrawSubset,
    subsetNeedsUpdate,
    existingSubsetFontBuffer,
    subsetReferencedChars: Array.from(subsetReferencedChars.entries()).map(([char, firstSeenMs]) => ({ char, firstSeenMs })),
    embeddedFonts,
    originalDrawFontName,
    hasBOM,
    detectedNewline,
  };
}
function parseDialogueText(text, styleInfo, tStart, tEnd, tMs,
  fontChars, drawings, subsetReferencedChars, styles) {
  const segs = text.split(/(\{[^}]*\})/);
  let font = styleInfo.font;
  let bold = styleInfo.bold;
  let drawing = false, drawData = '', drawTag = '';
  let isDrawSubsetFont = isAnyDrawFont(font);
  for (const seg of segs) {
    if (seg.startsWith('{')) {
      const inner = seg.slice(1, -1);
      const pm = inner.match(/\\p(\d+)/i);
      if (pm) {
        const lvl = parseInt(pm[1]);
        if (lvl > 0 && !drawing) { drawing = true; drawTag = seg; drawData = ''; }
        else if (lvl === 0 && drawing) {
          drawing = false;
          const clean = drawData.trim().replace(/\s+/g, ' ');
          if (clean) drawings.push({ tagBlock: drawTag, data: clean, tStart, tEnd, tMs });
        }
      }
      if (!drawing) {
        const rm = inner.match(/\\r([^\\}]*)/);
        if (rm) {
          const sn = rm[1].trim();
          const s = (sn && styles && styles[sn]) ? styles[sn] : styleInfo;
          font = s.font; bold = s.bold;
        }
        const fm = inner.match(/\\fn([^\\}]*)/);
        if (fm) font = normFont(fm[1].trim()) || styleInfo.font;
        const bm = inner.match(/\\b(\d+)/);
        if (bm) bold = parseInt(bm[1]) !== 0;
        isDrawSubsetFont = isAnyDrawFont(font);
      }
    } else if (seg) {
      if (drawing) {
        drawData += (drawData.length > 0 && !drawData.endsWith(' ') ? ' ' : '') + seg;
      } else if (isDrawSubsetFont) {
        for (const ch of seg) {
          if (ch !== '\n' && ch !== '\r' && ch.trim() !== '') {
            if (!subsetReferencedChars.has(ch)) subsetReferencedChars.set(ch, tMs);
          }
        }
      } else {
        const weight = bold ? 'bold' : 'normal';
        if (!fontChars[font]) fontChars[font] = { normal: new Set(), bold: new Set() };
        const clean = seg.replace(/\\[Nn]/g, '').replace(/\\h/g, ' ').replace(/\\([{}\\])/g, '$1');
        for (const ch of clean) {
          if (ch !== '\n' && ch !== '\r' && (ch.trim() !== '' || ch === ' ')) {
            fontChars[font][weight].add(ch);
          }
        }
      }
    }
  }
  if (drawing && drawData.trim()) {
    drawings.push({ tagBlock: drawTag, data: drawData.trim().replace(/\s+/g, ' '), tStart, tEnd, tMs });
  }
}
function getVisibleChar(index) {
  const skip = new Set([
    44, 123, 125, 92, 58, 59,
    32, 45,
  ]);
  const priority = [];
  for (let i = 65; i <= 90; i++) priority.push(i);
  for (let i = 97; i <= 122; i++) priority.push(i);
  if (index < priority.length) return String.fromCharCode(priority[index]);

  let charCode = 33;
  let found = priority.length;
  while (found <= index) {
    const isPri = (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
    const isCtl = (charCode < 32 || (charCode >= 127 && charCode <= 160));
    if (!isPri && !isCtl && !skip.has(charCode)) {
      if (found === index) return String.fromCharCode(charCode);
      found++;
    }
    charCode++;
  }
  return String.fromCharCode(charCode);
}
function buildUniqueDrawings(drawings) {
  const meta = new Map();
  for (const d of drawings) {
    if (!meta.has(d.data)) {
      meta.set(d.data, { count: 0, firstStart: d.tStart, firstEnd: d.tEnd, firstMs: d.tMs, lastStart: d.tStart, lastEnd: d.tEnd });
    }
    const m = meta.get(d.data);
    m.count++;
    m.lastStart = d.tStart;
    m.lastEnd = d.tEnd;
  }
  const sortedByTime = Array.from(meta.entries()).sort((a, b) => a[1].firstMs - b[1].firstMs);
  const seen = new Map();
  for (let i = 0; i < sortedByTime.length; i++) {
    const [data, m] = sortedByTime[i];
    seen.set(data, {
      count: m.count,
      firstStart: m.firstStart, firstEnd: m.firstEnd, firstMs: m.firstMs,
      lastStart: m.lastStart, lastEnd: m.lastEnd
    });
  }
  return seen;
}
function parseDrawCmds(drawStr) {
  const toks = drawStr.split(/\s+/).filter(Boolean);
  const cmds = [], pts = [];
  let cmd = null, i = 0;
  while (i < toks.length) {
    const tok = toks[i];
    if (/^[a-zA-Z]$/.test(tok)) { cmd = tok.toLowerCase(); i++; continue; }
    if (cmd === null || isNaN(parseFloat(tok))) { i++; continue; }
    switch (cmd) {
      case 'm': case 'n': {
        const x = parseFloat(toks[i]), y = parseFloat(toks[i + 1]);
        i += 2;
        if (!isNaN(x) && !isNaN(y)) { cmds.push({ t: 'M', x, y }); pts.push(x, y); }
        break;
      }
      case 'l': {
        const x = parseFloat(toks[i]), y = parseFloat(toks[i + 1]);
        i += 2;
        if (!isNaN(x) && !isNaN(y)) { cmds.push({ t: 'L', x, y }); pts.push(x, y); }
        break;
      }
      case 'b': {
        if (i + 5 < toks.length + 1) {
          const x1 = parseFloat(toks[i]), y1 = parseFloat(toks[i + 1]),
            x2 = parseFloat(toks[i + 2]), y2 = parseFloat(toks[i + 3]),
            x = parseFloat(toks[i + 4]), y = parseFloat(toks[i + 5]);
          if (![x1, y1, x2, y2, x, y].some(isNaN)) {
            cmds.push({ t: 'C', x1, y1, x2, y2, x, y }); pts.push(x1, y1, x2, y2, x, y);
          }
          i += 6;
        } else { i = toks.length; }
        break;
      }
      case 's': case 'p': {
        const x = parseFloat(toks[i]), y = parseFloat(toks[i + 1]);
        i += 2;
        if (!isNaN(x) && !isNaN(y)) { cmds.push({ t: 'L', x, y }); pts.push(x, y); }
        break;
      }
      case 'c': case 'e': { cmds.push({ t: 'Z' }); i++; break; }
      default: i++;
    }
  }
  return { cmds, pts };
}
function buildDrawGlyph(drawStr, charCode) {
  const { cmds, pts } = parseDrawCmds(drawStr);
  const path = new opentype.Path();
  if (pts.length === 0) {
    return new opentype.Glyph({ name: `draw_${charCode}`, unicode: charCode, advanceWidth: EM, path });
  }
  let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
  for (let i = 0; i < pts.length; i += 2) {
    if (pts[i] < xmin) xmin = pts[i]; if (pts[i] > xmax) xmax = pts[i];
    if (pts[i + 1] < ymin) ymin = pts[i + 1]; if (pts[i + 1] > ymax) ymax = pts[i + 1];
  }
  const gw = xmax - xmin || 1, gh = ymax - ymin || 1;
  const scale = TARGET / Math.max(gw, gh);
  const ox = MARGIN + (TARGET - gw * scale) / 2;
  const oy = MARGIN + (TARGET - gh * scale) / 2;
  const tx = x => (x - xmin) * scale + ox;
  const ty = y => (ymax - y) * scale + oy;
  let hasContent = false;
  for (const c of cmds) {
    switch (c.t) {
      case 'M': path.moveTo(tx(c.x), ty(c.y)); hasContent = true; break;
      case 'L': path.lineTo(tx(c.x), ty(c.y)); hasContent = true; break;
      case 'C': path.curveTo(tx(c.x1), ty(c.y1), tx(c.x2), ty(c.y2), tx(c.x), ty(c.y)); hasContent = true; break;
      case 'Z': path.close(); break;
    }
  }
  if (hasContent) path.close();
  return new opentype.Glyph({ name: `draw_${charCode}`, unicode: charCode, advanceWidth: EM, path });
}
function buildDrawingFont(uniqueDrawingsArray, existingFontBuffer, referencedCharsArray, id, familyName) {
  const referencedCharsMap = new Map();
  referencedCharsArray.forEach(item => referencedCharsMap.set(item.char, item.firstSeenMs));

  if (uniqueDrawingsArray.length === 0 && existingFontBuffer && existingFontBuffer.byteLength > 0) {
    try {
      const existingFont = opentype.parse(existingFontBuffer);
      const existingChars = new Set();
      for (let i = 1; i < existingFont.glyphs.length; i++) {
        const g = existingFont.glyphs.get(i);
        if (g && g.unicode && g.unicode > 0) existingChars.add(String.fromCodePoint(g.unicode));
      }
      const sameChars = existingChars.size === referencedCharsMap.size &&
        Array.from(referencedCharsMap.keys()).every(ch => existingChars.has(ch));
      if (sameChars) {
        return {
          ttf: new Uint8Array(existingFontBuffer),
          dataToCharArr: [],
          charRemap: new Map()
        };
      }
    } catch (_) { }
  }

  const allItems = [];
  if (existingFontBuffer && existingFontBuffer.byteLength > 0) {
    try {
      const existingFont = opentype.parse(existingFontBuffer);
      for (let i = 1; i < existingFont.glyphs.length; i++) {
        const g = existingFont.glyphs.get(i);
        if (!g || !g.unicode || g.unicode === 0) continue;
        const ch = String.fromCodePoint(g.unicode);
        if (!referencedCharsMap.has(ch)) continue;
        allItems.push({ type: 'existing', oldChar: ch, g, t: referencedCharsMap.get(ch) });
      }
    } catch (_) { }
  }
  uniqueDrawingsArray.forEach(d => allItems.push({ type: 'new', data: d.data, t: d.firstMs }));
  allItems.sort((a, b) => a.t - b.t);

  const notdef = new opentype.Glyph({
    name: '.notdef', unicode: 0, advanceWidth: EM, path: new opentype.Path()
  });
  const glyphs = [notdef];
  const charRemap = new Map();
  const drawingDataToChar = {};
  const usedCodepoints = new Set([0]);
  let safeIdx = 0;
  const getNextSafeChar = () => {
    while (true) {
      const c = getVisibleChar(safeIdx++);
      if (!usedCodepoints.has(c.codePointAt(0))) return c;
    }
  };

  for (const item of allItems) {
    const char = getNextSafeChar();
    const cp = char.codePointAt(0);
    usedCodepoints.add(cp);
    if (item.type === 'existing') {
      if (item.oldChar !== char) charRemap.set(item.oldChar, char);
      glyphs.push(new opentype.Glyph({
        name: item.g.name || `draw_${cp}`,
        unicode: cp, advanceWidth: EM, path: item.g.path
      }));
    } else {
      drawingDataToChar[item.data] = char;
      glyphs.push(buildDrawGlyph(item.data, cp));
    }
  }

  const font = new opentype.Font({
    familyName: familyName || DRAW_FONT_NAME,
    styleName: 'Regular',
    unitsPerEm: EM,
    ascender: TARGET,
    descender: -(EM - TARGET),
    glyphs: glyphs
  });
  return {
    ttf: new Uint8Array(font.toArrayBuffer()),
    dataToCharArr: Object.entries(drawingDataToChar).map(([d, c]) => ({ data: d, char: c })),
    charRemap
  };
}
function decodeFontName(v, key) {
  if (typeof v === 'string') return v.trim();
  if (v && (Array.isArray(v) || (typeof Uint8Array !== 'undefined' && v instanceof Uint8Array))) {
    if (key && (key.includes('p3e1') || key === 'zh' || key.startsWith('zh-'))) {
      let str = '';
      for (let i = 0; i < v.length; i += 2) {
        if (i + 1 < v.length) str += String.fromCharCode((v[i] << 8) | v[i + 1]);
      }
      return str.trim();
    }
  }
  return '';
}


function extractFontNames(fontObj) {
  const names = new Set();
  const nameTable = fontObj.tables?.name;
  if (nameTable) {
    for (const [prop, val] of Object.entries(nameTable)) {
      if (val && typeof val === 'object') {
        for (const [lang, v] of Object.entries(val)) {
          const res = decodeFontName(v, lang);
          if (res) names.add(res);
        }
      }
    }
  }
  const nObj = fontObj.names || {};
  for (const [prop, val] of Object.entries(nObj)) {
    if (val && typeof val === 'object') {
      for (const [lang, v] of Object.entries(val)) {
        const res = decodeFontName(v, lang);
        if (res) names.add(res);
      }
    }
  }
  return names;
}
function extractFamilyNames(fontObj) {
  const names = new Set();
  const nameTable = fontObj.tables?.name;
  if (nameTable) {
    ['fontFamily', 'fullName', 'preferredFamily'].forEach(prop => {
      const val = nameTable[prop];
      if (val && typeof val === 'object') {
        for (const [lang, v] of Object.entries(val)) {
          const res = decodeFontName(v, lang);
          if (res) names.add(res);
        }
      }
    });
  }
  const nObj = fontObj.names || {};
  ['fontFamily', 'preferredFamily'].forEach(field => {
    const val = nObj[field];
    if (val && typeof val === 'object') {
      for (const [lang, v] of Object.entries(val)) {
        const res = decodeFontName(v, lang);
        if (res) names.add(res);
      }
    }
  });
  return names;
}
function getFontWeight(fontObj) {
  const wc = fontObj.tables?.os2?.usWeightClass;
  if (wc) return wc;
  const sub = (fontObj.names?.fontSubfamily?.en || '').toLowerCase();
  if (sub.includes('bold')) return 700;
  if (sub.includes('light')) return 300;
  if (sub.includes('thin')) return 100;
  if (sub.includes('medium')) return 500;
  if (sub.includes('semibold') || sub.includes('demibold')) return 600;
  if (sub.includes('black') || sub.includes('heavy')) return 900;
  return 400;
}
function matchFontBuffer(buffer, requiredFonts, id) {
  const view = new DataView(buffer);
  const isTTC = buffer.byteLength >= 4 && view.getUint32(0, false) === 0x74746366;
  const results = [];
  const processSingleFont = (fontObj, index) => {
    const allNames = extractFontNames(fontObj);
    const familyNames = extractFamilyNames(fontObj);
    const weight = getFontWeight(fontObj);
    const allNamesLower = new Set([...allNames].map(n => n.toLowerCase()));
    const familyNamesLower = new Set([...familyNames].map(n => n.toLowerCase()));
    for (const req of requiredFonts) {
      const reqLower = req.toLowerCase();
      if (allNamesLower.has(reqLower)) {
        const isFamilyMatch = familyNamesLower.has(reqLower);
        results.push({
          matchedFor: req,
          weight,
          isFamilyMatch,
          allNames: Array.from(allNames),
          familyNames: Array.from(familyNames),
          ttcIndex: index
        });
      }
    }
  };
  try {
    if (isTTC) {
      const numFonts = view.getUint32(8, false);
      for (let i = 0; i < numFonts; i++) {
        try {
          const subBuffer = extractTTFFromTTC(buffer, i);
          processSingleFont(opentype.parse(subBuffer), i);
        } catch (_) { }
      }
    } else {
      processSingleFont(opentype.parse(buffer), -1);
    }
  } catch (e) {
    emitLog(id, 'log.font.parse_fail', 'err', { error: e.message });
  }
  return { results, isTTC };
}
function subsetFont(fontBuffer, charArray, fontName, isTTC, targetWeight, ttcIndex, id) {
  let orig;
  const isTargetBold = (targetWeight === 'bold');
  try {
    if (isTTC && ttcIndex !== undefined && ttcIndex !== -1) {
      const subBuffer = extractTTFFromTTC(fontBuffer, ttcIndex);
      orig = opentype.parse(subBuffer);
    } else {
      orig = opentype.parse(fontBuffer);
    }
  } catch (e) {
    throw new Error(`Font parse failed: ${e.message}`);
  }
  const origNotdef = orig.glyphs.get(0);
  const notdef = new opentype.Glyph({
    name: '.notdef', unicode: 0,
    advanceWidth: origNotdef?.advanceWidth || 500,
    path: new opentype.Path()
  });
  const glyphs = [notdef];
  const seen = new Set([0]);
  let skipped = 0;
  const total = charArray.length;
  for (let ci = 0; ci < total; ci++) {
    if (ci % 500 === 0) emitProgress(id, 'subset', ci, total);
    const char = charArray[ci];
    const cp = char.codePointAt(0);
    if (seen.has(cp)) continue;
    const origGlyph = orig.charToGlyph(char);
    if (!origGlyph || origGlyph.index === 0) { skipped++; continue; }
    const rendered = orig.getPath(char, 0, 0, orig.unitsPerEm);
    const newPath = new opentype.Path();
    for (const cmd of rendered.commands) {
      switch (cmd.type) {
        case 'M': newPath.moveTo(cmd.x, -cmd.y); break;
        case 'L': newPath.lineTo(cmd.x, -cmd.y); break;
        case 'C': newPath.curveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y); break;
        case 'Q': newPath.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y); break;
        case 'Z': newPath.close(); break;
      }
    }
    glyphs.push(new opentype.Glyph({
      name: origGlyph.name || `glyph_${cp}`,
      unicode: cp, advanceWidth: origGlyph.advanceWidth, path: newPath
    }));
    seen.add(cp);
  }
  const newFont = new opentype.Font({
    familyName: fontName,
    styleName: isTargetBold ? 'Bold' : 'Regular',
    unitsPerEm: orig.unitsPerEm,
    ascender: orig.ascender,
    descender: orig.descender,
    glyphs
  });
  if (orig.tables?.os2) {
    newFont.tables.os2 = Object.assign({}, orig.tables.os2);
  }
  if (newFont.tables.name) {
    const setNameEntry = (nameId, value) => {
      if (!newFont.tables.name.names) newFont.tables.name.names = {};
      if (!newFont.tables.name.names[nameId]) newFont.tables.name.names[nameId] = {};
      newFont.tables.name.names[nameId] = { en: value };
    };
    setNameEntry('1', fontName);
    setNameEntry('4', fontName + (isTargetBold ? ' Bold' : ''));
    setNameEntry('6', fontName.replace(/\s+/g, '') + (isTargetBold ? '-Bold' : '-Regular'));
    setNameEntry('16', fontName);
  }
  return {
    ttf: new Uint8Array(newFont.toArrayBuffer()),
    skipped,
    origSize: fontBuffer.byteLength
  };
}
function rewriteASS(rawContent, opts, id) {
  const { drawingDataToChar, drawFontFamily, drawTTF, embeddedFonts, drawCharRemap, targetNewline } = opts;
  const nl = targetNewline || '\n';
  const blockRegex = /\r?\n(?=\[(?:Script Info|v4\+\s+Styles|v4\s+Styles|Styles|Events|Fonts|Graphics|Aegisub\s+(?:Extradata|Project\s+Garbage))\])/i;
  const blocks = rawContent.split(blockRegex);
  const totalBlocks = blocks.length;
  const processedBlocks = [];
  let fontInsertIndex = -1;
  let originalFontsBlock = null;
  const subsetStyles = new Set();
  let styleFmt = null;
  let eventFmt = null;

  for (let i = 0; i < totalBlocks; i++) {
    if (i % 5 === 0) emitProgress(id, 'rewrite', i, totalBlocks);
    const block = blocks[i];
    const trimmed = block.trim();
    if (!trimmed) continue;

    const header = (trimmed.match(/^\[([^\]]+)\]/i)?.[1] || '').toLowerCase();
    if (header === 'fonts') {
      if (fontInsertIndex === -1) fontInsertIndex = processedBlocks.length;
      originalFontsBlock = block;
      continue;
    }

    if (header.includes('styles')) {
      const lines = block.split(/\r?\n/);
      for (const l of lines) {
        if (/^format\s*:/i.test(l)) {
          const flds = l.replace(/^format\s*:/i, '').split(',').map(f => f.trim().toLowerCase());
          styleFmt = { nameIdx: flds.indexOf('name'), fontIdx: flds.indexOf('fontname') };
        } else if (/^style\s*:/i.test(l) && styleFmt) {
          const parts = l.replace(/^style\s*:/i, '').split(',');
          const sName = parts[styleFmt.nameIdx]?.trim();
          const sFont = normFont(parts[styleFmt.fontIdx]?.trim() || '');
          if (sName && sFont.toLowerCase() === drawFontFamily.toLowerCase()) {
            subsetStyles.add(sName);
          }
        }
      }
      processedBlocks.push(block);
    } else if (header === 'events') {
      if (!drawingDataToChar || drawingDataToChar.length === 0) {
        processedBlocks.push(block);
        continue;
      }
      const lines = block.split(/\r?\n/);
      const newLines = lines.map(l => {
        if (/^format\s*:/i.test(l)) {
          const flds = l.replace(/^format\s*:/i, '').split(',').map(f => f.trim().toLowerCase());
          eventFmt = { styleIdx: flds.indexOf('style'), textIdx: flds.indexOf('text') };
          return l;
        }
        if (/^dialogue\s*:/i.test(l.trim()) && eventFmt) {
          const rest = l.replace(/^dialogue\s*:/i, '');
          const parts = rest.split(',');
          const sName = parts[eventFmt.styleIdx]?.trim();
          const initialIsSubset = subsetStyles.has(sName);

          let processed = l;
          if (opts.drawCharRemap && opts.drawCharRemap.size > 0) {
            processed = renameSubsetCharsInLine(processed, opts.drawCharRemap, drawFontFamily, initialIsSubset);
          }
          processed = replaceDrawingsInLine(processed, drawingDataToChar, drawFontFamily);
          return processed;
        }
        return l;
      });
      processedBlocks.push(newLines.join(nl));
    } else {
      processedBlocks.push(block);
    }
  }

  let finalSec = null;
  if (drawTTF || (embeddedFonts && embeddedFonts.length > 0)) {
    const newFontLines = ['[Fonts]'];
    const encodeAndAppend = (fontName, ttfData) => {
      newFontLines.push(`fontname: ${fontName}_0.ttf`);
      const enc = assUUEncode(ttfData);
      for (let j = 0; j < enc.length; j += 80) newFontLines.push(enc.slice(j, j + 80));
      newFontLines.push('');
    };
    if (drawTTF) encodeAndAppend(drawFontFamily, drawTTF);
    if (embeddedFonts) embeddedFonts.forEach(ef => encodeAndAppend(ef.name, ef.ttf));
    finalSec = newFontLines.join(nl);
  } else if (originalFontsBlock) {
    finalSec = originalFontsBlock;
  }

  if (finalSec) {
    if (fontInsertIndex !== -1 && fontInsertIndex < processedBlocks.length) {
      processedBlocks.splice(fontInsertIndex, 0, finalSec);
    } else {
      processedBlocks.push(finalSec);
    }
  }
  emitProgress(id, 'rewrite', totalBlocks, totalBlocks);
  return processedBlocks.join(nl);
}

function renameSubsetCharsInLine(line, charRemap, fontFamily, initialIsSubset) {
  const m = line.match(/^([^:]*?:\s*)(.*)$/s);
  if (!m) return line;
  const prefix = m[1];
  const content = m[2];
  const segs = content.split(/(\{[^}]*\})/);
  let isSubsetFont = !!initialIsSubset;
  let result = prefix;
  for (const seg of segs) {
    if (seg.startsWith('{')) {
      const inner = seg.slice(1, -1);
      const fm = inner.match(/\\fn([^\\}]*)/);
      if (fm) {
        const fn = normFont(fm[1].trim());
        isSubsetFont = fn.toLowerCase() === fontFamily.toLowerCase();
      }
      const rm = inner.match(/\\r([^\\}]*)/);
      if (rm) isSubsetFont = false;
      result += seg;
    } else {
      if (isSubsetFont) {
        let remapped = '';
        for (const ch of seg) remapped += charRemap.has(ch) ? charRemap.get(ch) : ch;
        result += remapped;
      } else {
        result += seg;
      }
    }
  }
  return result;
}
function replaceDrawingsInLine(line, dataToCharArr, fontFamily) {
  if (!dataToCharArr || dataToCharArr.length === 0) return line;
  const m = line.match(/^([^:]*?:\s*)(.*)$/);
  if (!m) return line;
  const prefix = m[1];
  const content = m[2];

  const segs = content.split(/(\{[^}]*\})/);
  let drawing = false;
  let rawSegs = [];
  let drawDataStr = '';
  let startTag = '';
  let result = prefix;

  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (seg.startsWith('{')) {
      const pm = seg.match(/\\p(\d+)/i);
      if (pm) {
        const lvl = parseInt(pm[1]);
        if (lvl > 0 && !drawing) {
          drawing = true;
          startTag = seg;
          rawSegs = [];
          drawDataStr = '';
          continue;
        } else if (lvl === 0 && drawing) {
          drawing = false;
          const clean = drawDataStr.trim().replace(/\s+/g, ' ');
          const entry = dataToCharArr.find(e => e.data === clean);
          if (entry) {
            const newStart = startTag.replace(/\\p[1-9]/i, `\\fn${fontFamily}\\p0`);
            const cleanEnd = seg.replace(/\\p0/i, '');
            const hasOtherTags = cleanEnd.replace(/[{}]/g, '').trim().length > 0;
            result += newStart + entry.char + (hasOtherTags ? cleanEnd : '');
          } else {
            result += startTag + rawSegs.join('') + seg;
          }
          continue;
        }
      }
      if (drawing) {
        rawSegs.push(seg);
      } else {
        result += seg;
      }
    } else {
      if (drawing) {
        rawSegs.push(seg);
        if (seg.trim() !== '') {
          drawDataStr += (drawDataStr.length > 0 && !drawDataStr.endsWith(' ') ? ' ' : '') + seg;
        }
      } else {
        result += seg;
      }
    }
  }

  if (drawing) {
    const clean = drawDataStr.trim().replace(/\s+/g, ' ');
    const entry = dataToCharArr.find(e => e.data === clean);
    if (entry) {
      const newStart = startTag.replace(/\\p[1-9]/i, `\\fn${fontFamily}\\p0`);
      result += newStart + entry.char;
    } else {
      result += startTag + rawSegs.join('');
    }
  }

  return result;
}
function doConvert(data, id) {
  const { text, fonts, options, forceHasBOM } = data;
  emitLog(id, 'log.convert.start', 'info', {});
  const parsed = parseASSText(text, id, forceHasBOM);
  let drawTTF = null, drawingDataToChar = null, drawCharRemap = null;
  const drawFontFamily = parsed.originalDrawFontName || DRAW_FONT_NAME;
  const embeddedFonts = [];
  if (options.wantDraw) {
    const newDrawings = parsed.uniqueDrawings;
    const totalDrawings = newDrawings.length;
    const hasReferencedChars = parsed.subsetReferencedChars.length > 0;
    if (totalDrawings > 0 || (parsed.hasExistingDrawSubset && hasReferencedChars)) {
      emitLog(id, 'log.draw.building', 'info', {
        unique: totalDrawings, total: parsed.drawings
      });
      const result = buildDrawingFont(
        newDrawings,
        parsed.existingSubsetFontBuffer,
        parsed.subsetReferencedChars,
        id,
        drawFontFamily
      );
      drawTTF = result.ttf;
      drawingDataToChar = result.dataToCharArr;
      drawCharRemap = result.charRemap;
      emitLog(id, 'log.draw.done', 'ok', {
        size: (drawTTF.length / 1024).toFixed(1)
      });
    } else {
      emitLog(id, 'log.draw.none', 'info', {});
    }
  } else if (parsed.hasExistingDrawSubset && parsed.existingSubsetFontBuffer) {
    drawTTF = new Uint8Array(parsed.existingSubsetFontBuffer);
  }
  if (options.wantFont) {
    const extFonts = parsed.externalFonts;
    const fontNames = Object.keys(extFonts);
    if (fontNames.length === 0) {
      emitLog(id, 'log.font.none_external', 'info', {});
    }
    for (const fontName of fontNames) {
      const charInfo = extFonts[fontName];
      const allChars = new Set([...charInfo.normal, ...charInfo.bold]);
      const chars = Array.from(allChars);
      const fontFile = fonts.find(f => f.matchedFor.toLowerCase() === fontName.toLowerCase());
      if (!fontFile) {
        emitLog(id, 'log.font.missing', 'warn', { name: fontName, weight: '...' });
        continue;
      }
      emitLog(id, 'log.font.subsetting', 'info', {
        name: fontName, weight: 'Regular', chars: chars.length
      });
      try {
        const result = subsetFont(fontFile.buffer, chars, fontName, fontFile.isTTC, 'Regular', fontFile.ttcIndex, id);
        embeddedFonts.push({ name: fontName, ttf: result.ttf });
        const origKB = (result.origSize / 1024).toFixed(0);
        const newKB = (result.ttf.length / 1024).toFixed(0);
        const pct = ((1 - result.ttf.length / result.origSize) * 100).toFixed(0);
        emitLog(id, 'log.font.subset_done', 'ok', {
          name: fontName, weight: 'Merged', origKB, newKB, pct,
          skipped: result.skipped
        });
      } catch (e) {
        emitLog(id, 'log.font.subset_fail', 'err', { name: fontName, error: e.message });
      }
    }
    if (options.wantSystemFont && parsed.systemFontsReferenced) {
      for (const fontName of Object.keys(parsed.systemFontsReferenced)) {
        const charInfo = parsed.systemFontsReferenced[fontName];
        const allChars = new Set([...charInfo.normal, ...charInfo.bold]);
        const chars = Array.from(allChars);
        const fontFile = fonts.find(f => f.matchedFor.toLowerCase() === fontName.toLowerCase());
        if (!fontFile) continue;
        try {
          const result = subsetFont(fontFile.buffer, chars, fontName, fontFile.isTTC, 'Regular', fontFile.ttcIndex, id);
          embeddedFonts.push({ name: fontName, ttf: result.ttf });
          emitLog(id, 'log.font.subset_done', 'ok', {
            name: fontName, weight: 'Merged',
            origKB: (result.origSize / 1024).toFixed(0),
            newKB: (result.ttf.length / 1024).toFixed(0),
            pct: ((1 - result.ttf.length / result.origSize) * 100).toFixed(0),
            skipped: result.skipped
          });
        } catch (e) {
          emitLog(id, 'log.font.subset_fail', 'err', { name: fontName, error: e.message });
        }
      }
    }
  }
  const finalEmbeddedFonts = [];
  const processedNames = new Set();
  embeddedFonts.forEach(ef => {
    finalEmbeddedFonts.push(ef);
    processedNames.add(ef.name.toLowerCase());
  });
  if (parsed.embeddedFonts) {
    for (const [name, lines] of Object.entries(parsed.embeddedFonts)) {
      const baseName = name.replace(/_\d+\.ttf$/i, '');
      const baseNameLower = baseName.toLowerCase();
      if (isAnyDrawFont(baseNameLower)) continue;
      if (processedNames.has(baseNameLower)) continue;
      try {
        const buf = assUUDecode(lines);
        finalEmbeddedFonts.push({ name: baseName, ttf: buf });
        processedNames.add(baseNameLower);
      } catch (_) { }
    }
  }
  if (!drawTTF && parsed.hasExistingDrawSubset && parsed.existingSubsetFontBuffer) {
    drawTTF = new Uint8Array(parsed.existingSubsetFontBuffer);
  }
  const pureOriginalText = text.startsWith('\uFEFF') ? text.slice(1) : text;
  emitLog(id, 'log.rewrite.start', 'info', {});
  const finalText = rewriteASS(pureOriginalText, {
    drawingDataToChar: drawingDataToChar,
    drawFontFamily,
    drawTTF,
    embeddedFonts: finalEmbeddedFonts,
    drawCharRemap: drawCharRemap,
    targetNewline: parsed.detectedNewline
  }, id);

  const finalOutput = parsed.hasBOM ? '\uFEFF' + finalText : finalText;

  const origSize = new Blob([text]).size;
  const newSize = new Blob([finalOutput]).size;
  const delta = newSize - origSize;

  emitLog(id, 'log.convert.done', 'ok', {
    origKB: (origSize / 1024).toFixed(0),
    newKB: (newSize / 1024).toFixed(0),
    delta: (delta / 1024).toFixed(1),
    embCount: finalEmbeddedFonts.length + (drawTTF ? 1 : 0)
  });
  const fontBuffers = [];
  if (drawTTF) fontBuffers.push({ name: drawFontFamily, buffer: drawTTF.buffer, isDrawing: true });
  for (const ef of finalEmbeddedFonts) {
    fontBuffers.push({ name: ef.name, buffer: ef.ttf.buffer, isDrawing: false, weight: ef.weight });
  }
  const drawMap = new Map((drawingDataToChar || []).map(e => [e.data, e.char]));
  return {
    finalText: finalOutput,
    origSize, newSize,
    fontBuffers,
    stats: {
      embeddedCount: finalEmbeddedFonts.length + (drawTTF ? 1 : 0),
      drawingCount: parsed.drawings,
      uniqueDrawings: parsed.uniqueDrawings.length,
    },
    detailedDrawings: options.wantDraw ? Array.from(parsed.uniqueDrawings.values()).map(d => ({
      char: drawMap.get(d.data) || d.char,
      count: d.count,
      firstStart: d.firstStart, firstEnd: d.firstEnd,
      lastStart: d.lastStart, lastEnd: d.lastEnd
    })) : []
  };
}
self.onmessage = function (e) {
  const { type, id } = e.data;
  try {
    switch (type) {
      case 'init': {
        try {
          const path = (typeof OPENTYPE_PATH !== 'undefined') ? OPENTYPE_PATH : e.data.opentypePath;
          importScripts(path);
        } catch (err) {
          self.postMessage({ type: 'error', id, error: 'Failed to load opentype.js: ' + err.message });
          return;
        }
        self.postMessage({ type: 'ready', id });
        break;
      }
      case 'parseASS': {
        const text = typeof e.data.text === 'string'
          ? e.data.text
          : new TextDecoder().decode(new Uint8Array(e.data.buffer));
        const result = parseASSText(text, id);
        self.postMessage({ type: 'result', id, op: 'parseASS', ...result });
        break;
      }
      case 'matchFont': {
        const result = matchFontBuffer(e.data.buffer, e.data.requiredFonts, id);
        self.postMessage({ type: 'result', id, op: 'matchFont', ...result });
        break;
      }
      case 'convert': {
        const result = doConvert(e.data, id);
        const transfers = result.fontBuffers.map(f => f.buffer);
        self.postMessage({ type: 'result', id, op: 'convert', ...result }, transfers);
        break;
      }
      default:
        self.postMessage({ type: 'error', id, error: `Unknown message type: ${type}` });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id, error: err.message + '\n' + (err.stack || '') });
  }
};
}
if (typeof window === 'undefined') {
runWorker();
}