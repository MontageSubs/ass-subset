'use strict';
function runWorker() {
const DRAW_FONT_NAME = 'ASSDrawSubset';
const PROJECT_URL = 'https://github.com/MontageSubs/ass-subset';
const EM = 1024;
const TARGET = 820;
const MARGIN = (EM - TARGET) / 2;
const PROGRESS_INTERVAL = 5000;
const SYSTEM_FONTS = new Set([
  'arial', 'arial black', 'comic sans ms', 'courier new', 'georgia',
  'impact', 'tahoma', 'times new roman', 'trebuchet ms', 'verdana',
  'webdings', 'wingdings', 'wingdings 2', 'wingdings 3', 'symbol',
  'calibri', 'cambria', 'candara', 'consolas', 'constantia', 'corbel',
  'courier', 'garamond', 'book antiqua',
  'franklin gothic medium', 'lucida console', 'lucida sans unicode', 'lucida sans',
  'microsoft sans serif', 'palatino linotype',
  'aptos', 'aptos display', 'aptos narrow', 'aptos mono',
  'bahnschrift', 'bahnschrift condensed', 'bahnschrift light', 'bahnschrift semicondensed',
  'cascadia code', 'cascadia mono', 'gadugi',
  'segoe ui', 'segoe ui light', 'segoe ui semibold', 'segoe ui bold',
  'segoe print', 'segoe script', 'segoe ui symbol', 'segoe ui historic',
  'sf pro display', 'sf pro text', 'sf pro rounded', 'sf pro compact',
  'sf mono', 'sf compact display', 'sf compact text', 'sf compact rounded',
  'new york',
  'helvetica', 'helvetica neue', 'helvetica neue light', 'helvetica neue medium',
  'helvetica neue bold', 'helvetica neue thin', 'geneva', 'monaco', 'menlo',
  'liberation sans', 'liberation serif', 'liberation mono',
  'dejavu sans', 'dejavu serif', 'dejavu sans mono',
  'freesans', 'freeserif', 'freemono',
  'unifont', 'ipix',
  'roboto', 'roboto light', 'roboto regular', 'roboto medium', 'roboto bold',
  'roboto thin', 'roboto black', 'roboto mono', 'roboto mono light',
  'open sans', 'open sans light', 'open sans bold',
  'ubuntu', 'ubuntu light', 'ubuntu medium', 'ubuntu mono',
  'inter', 'fira sans', 'fira sans light', 'fira sans bold', 'fira mono', 'fira code',
  'inconsolata', 'source code pro', 'source sans pro', 'jetbrains mono',
  'noto sans', 'noto serif', 'noto mono',
  'noto sans cjk sc', 'noto sans cjk tc', 'noto sans cjk jp', 'noto sans cjk kr', 'noto sans cjk hk',
  'noto serif cjk sc', 'noto serif cjk tc', 'noto serif cjk jp', 'noto serif cjk kr',
  'noto sans arabic', 'noto sans hebrew', 'noto sans thai', 'noto sans devanagari',
  'noto sans tamil', 'noto sans telugu', 'noto sans kannada', 'noto sans malayalam',
  'noto sans georgian', 'noto sans armenian', 'noto sans myanmar',
  'microsoft yahei', 'microsoft yahei ui', '微软雅黑', '微软正黑',
  'microsoft jhenghei', 'microsoft jhenghei ui', '微軟正黑體',
  'simsun', '宋体', 'nsimsun', 'simsun-extb',
  'simhei', '黑体',
  'simkai', 'kaiti', '楷体', 'kaiti_gb2312', 'kaiti sc', 'kaiti tc',
  'fangsong', '仿宋', 'fangsong_gb2312',
  'dengxian', '等线', 'dengxian light', 'dengxian regular', 'dengxian bold',
  'fzshuti', '方正舒体', 'fzyaoti', '方正姚体',
  'pingfang sc', '苹方-简', 'pingfang tc', '苹方-繁', 'pingfang hk', '苹方-港',
  'hiragino sans gb', '冬青黑体简体中文', 'hiragino sans', 'hiragino sans w3', 'hiragino sans w4',
  'heiti sc', '黑体-简', 'heiti tc', '黑体-繁',
  'st heiti sc', 'st heiti tc', 'stheitisc', 'stheitist',
  'st song', '华文宋体', 'stfangsong', '华文仿宋', 'stkaiti', '华文楷体', 'stxihei', '华文细黑', 'stheiti', '华文黑体',
  'wqy microhei', 'wqy zenhei',
  'hiragino mincho pron', 'hiragino kaku gothic pron',
  'meiryo', 'meiryo ui', 'メイリオ',
  'ms gothic', 'ms pgothic', 'ms mincho', 'ms pmincho',
  'yu gothic', 'yu gothic ui', '游ゴシック', 'yu mincho', '游明朝',
  'batang', 'batangche', 'dotum', 'dotumche', 'gulim', 'gulimche', 'malgun gothic',
  '맑은 고딕', '나눔고딕', 'nanum gothic', '나눔명조', 'nanum myeongjo', '나눔바른고딕', 'nanum barun gothic',
  'mingliu', '細明體', 'pmingliu', '新細明體', 'mingliu-extb', 'dfkai-sb', '標楷體',
  'droid sans', 'droid sans fallback', 'droid serif', 'droid mono', 'droid sans thai',
  'arial unicode ms', 'simplified arabic', 'traditional arabic',
  'arial hebrew', 'arial hebrew expert',
  'shruti', 'mangal', 'vrinda',
  'aparajita', 'chandas', 'utsaah',
  'cordia new', 'thai sans serif',
  'sylfaen',
  'iskoola pota', 'kalimati',
  'ebrima', 'leelawadee ui', 'nirmala ui',
  'assdrawsubset_montagesubs', 'assdrawsubset',
]);
const SECTION_SPLIT_RE = /\r?\n(?=\[(?:Script Info|V?\d+(?:\.\d+)*\+?\s+Styles|Styles|Events|Fonts|Graphics|Aegisub\s+(?:Extradata|Project\s+Garbage))\])/i;
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
function genRandFontName() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let r = '';
  const len = 7 + Math.floor(Math.random() * 2);
  for (let i = 0; i < len; i++) r += chars[Math.floor(Math.random() * 26)];
  return r;
}
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
  const randFontMap = {};
  let hasRandFonts = false;
  let randMapMissing = false;
  for (let li = 0; li < totalLines; li++) {
    if (li % PROGRESS_INTERVAL === 0) emitProgress(id, 'parse', li, totalLines);
    const t = lines[li].trim();
    if (!t) continue;
    if (t.startsWith('[')) {
      if (section === '[fonts]' && currentEmbedFont && !/^\[(?:Script Info|V?\d+(?:\.\d+)*\+?\s+Styles|Styles|Events|Fonts|Graphics|Aegisub)/i.test(t)) {
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
      const randM = t.match(/^;\s*Font Subset:\s*([A-Z]{7,8})\s*-\s*(.+)$/);
      if (randM) { randFontMap[randM[1].trim()] = randM[2].trim(); }
    }
    if (section.includes('styles')) {
      if (/^format\s*:/i.test(t) && !styleFmt) {
        const flds = t.replace(/^format\s*:\s*/i, '').split(',').map(f => f.trim().toLowerCase());
        styleFmt = {
          nameIdx: flds.indexOf('name'),
          fontIdx: flds.indexOf('fontname'),
          boldIdx: flds.indexOf('bold'),
          italicIdx: flds.indexOf('italic'),
        };
      }
      if (/^style\s*:/i.test(t) && styleFmt) {
        const parts = t.replace(/^style\s*:\s*/i, '').split(',');
        const sName = parts[styleFmt.nameIdx]?.trim();
        const sFont = normFont(parts[styleFmt.fontIdx]?.trim() || 'Arial');
        const sBold = parseInt(parts[styleFmt.boldIdx]?.trim() || '0') !== 0;
        const sItalic = styleFmt.italicIdx >= 0 ? parseInt(parts[styleFmt.italicIdx]?.trim() || '0') !== 0 : false;
        if (sName) styles[sName] = { font: sFont, bold: sBold, italic: sItalic };
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

  const applyRandResolution = (map) => {
    for (const [rk, ov] of Object.entries(map)) {
      const rkL = rk.toLowerCase();
      if (fontChars[rk]) {
        if (!fontChars[ov]) fontChars[ov] = fontChars[rk];
        delete fontChars[rk];
      }
      const matchingKeys = Object.keys(embeddedFonts).filter(k => k.toLowerCase().startsWith(rkL));
      for (const ekKey of matchingKeys) {
        const newKey = ov + ekKey.slice(rk.length);
        if (!embeddedFonts[newKey]) embeddedFonts[newKey] = embeddedFonts[ekKey];
        delete embeddedFonts[ekKey];
      }
    }
  };

  applyRandResolution(randFontMap);

  const isRandFontName = (n) => /^[A-Z]{7,8}$/.test(n);
  const fontInternalMapRe = /FontSubsetMap:\s*\{original:\s*(.+?),\s*subset:\s*([A-Z]{7,8}),\s*ass-subset:\s*([\d.]+)\}/;

  const potentialRandEmbedded = Object.keys(embeddedFonts).some(embName => {
    const baseEmbName = embName.replace(/(_B0|_I0|_BI0|_0)\.ttf$/i, '');
    return !isAnyDrawFont(baseEmbName) && isRandFontName(baseEmbName);
  });

  if (Object.keys(randFontMap).length > 0 || potentialRandEmbedded) {
    hasRandFonts = true;
    const discoveredFromId10 = {};
    for (const [embName, embLines] of Object.entries(embeddedFonts)) {
      const baseEmbName = embName.replace(/(_B0|_I0|_BI0|_0)\.ttf$/i, '');
      if (isAnyDrawFont(baseEmbName)) continue;
      if (!isRandFontName(baseEmbName) && !randFontMap[baseEmbName]) continue;
      try {
        const buf = assUUDecode(embLines);
        const desc = readFontDescriptionRaw(buf.buffer);
        if (desc) {
          const m = desc.match(fontInternalMapRe);
          if (m) {
            const origName = m[1].trim();
            const subsetName = m[2].trim();
            if (!discoveredFromId10[subsetName]) discoveredFromId10[subsetName] = origName;
          }
        }
      } catch (_) { }
    }
    for (const [rk, ov] of Object.entries(discoveredFromId10)) {
      if (randFontMap[rk] !== ov) {
        randFontMap[rk] = ov;
        applyRandResolution({ [rk]: ov });
      }
    }
    const resolvedRandKeys = new Set(Object.keys(randFontMap).map(v => v.toLowerCase()));
    for (const [embName] of Object.entries(embeddedFonts)) {
      const baseEmbName = embName.replace(/(_B0|_I0|_BI0|_0)\.ttf$/i, '');
      if (isAnyDrawFont(baseEmbName)) continue;
      if (isRandFontName(baseEmbName) && !resolvedRandKeys.has(baseEmbName.toLowerCase())) {
        randMapMissing = true;
      }
    }
  }
  const externalFonts = {};
  for (const [name, weights] of Object.entries(fontChars)) {
    if (!SYSTEM_FONTS.has(name.toLowerCase()) && !isAnyDrawFont(name)) {
      externalFonts[name] = {
        normal: Array.from(weights.normal || []),
        bold: Array.from(weights.bold || []),
        italic: Array.from(weights.italic || []),
        boldItalic: Array.from(weights.boldItalic || []),
      };
    }
  }
  const systemFontsReferenced = {};
  for (const [name, weights] of Object.entries(fontChars)) {
    if (SYSTEM_FONTS.has(name.toLowerCase()) && !isAnyDrawFont(name)) {
      const totalChars = (weights.normal?.size || 0) + (weights.bold?.size || 0) + (weights.italic?.size || 0) + (weights.boldItalic?.size || 0);
      if (totalChars > 0) {
        systemFontsReferenced[name] = {
          normal: Array.from(weights.normal || []),
          bold: Array.from(weights.bold || []),
          italic: Array.from(weights.italic || []),
          boldItalic: Array.from(weights.boldItalic || []),
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
  let existingGlyphCount = 0;
  let orphanGlyphCount = 0;
  if (hasExistingDrawSubset) {
    if (existingSubsetFontBuffer) {
      try {
        const existingFont = opentype.parse(existingSubsetFontBuffer);
        const existingChars = new Set();
        for (let i = 1; i < existingFont.glyphs.length; i++) {
          const g = existingFont.glyphs.get(i);
          if (g && g.unicode && g.unicode > 0) existingChars.add(String.fromCodePoint(g.unicode));
        }
        existingGlyphCount = existingChars.size;
        const refChars = Array.from(subsetReferencedChars.keys());
        const orphanCount = Array.from(existingChars).filter(ch => !subsetReferencedChars.has(ch)).length;
        subsetNeedsUpdate = existingChars.size !== refChars.length ||
          !refChars.every(ch => existingChars.has(ch));
        orphanGlyphCount = orphanCount;
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
    existingGlyphCount,
    orphanGlyphCount,
    existingSubsetFontBuffer,
    subsetReferencedChars: Array.from(subsetReferencedChars.entries()).map(([char, firstSeenMs]) => ({ char, firstSeenMs })),
    embeddedFonts,
    originalDrawFontName,
    hasBOM,
    detectedNewline,
    randFontMap,
    hasRandFonts,
    randMapMissing,
  };
}
function parseDialogueText(text, styleInfo, tStart, tEnd, tMs,
  fontChars, drawings, subsetReferencedChars, styles) {
  const segs = text.split(/(\{[^}]*\})/);
  let font = styleInfo.font;
  let bold = styleInfo.bold ? 700 : 400;
  let italic = styleInfo.italic || false;
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
          font = s.font; bold = s.bold ? 700 : 400; italic = s.italic || false;
        }
        const fm = inner.match(/\\fn([^\\}]*)/);
        if (fm) font = normFont(fm[1].trim()) || styleInfo.font;
        const bm = inner.match(/\\b(\d+)/);
        if (bm) { const bv = parseInt(bm[1]); bold = bv === 0 ? 0 : bv === 1 ? 700 : bv >= 100 ? bv : 0; }
        const im = inner.match(/\\i(\d+)/);
        if (im) italic = parseInt(im[1]) !== 0;
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
        const weight = (bold >= 600 && italic) ? 'boldItalic' : (bold >= 600) ? 'bold' : italic ? 'italic' : 'normal';
        if (!fontChars[font]) fontChars[font] = { normal: new Set(), bold: new Set(), italic: new Set(), boldItalic: new Set() };
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
function buildDrawingFont(uniqueDrawingsArray, existingFontBuffer, referencedCharsArray, id, familyName, onProgress, fileName) {
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

  const totalItems = allItems.length;
  for (let _i = 0; _i < totalItems; _i++) {
    const item = allItems[_i];
    if (onProgress && _i % 50 === 0) onProgress(_i, totalItems);
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
  if (onProgress) onProgress(totalItems, totalItems);

  const drawFamilyName = familyName || DRAW_FONT_NAME;
  let drawVersion = '1.0';
  if (existingFontBuffer && existingFontBuffer.byteLength > 0) {
    try {
      const exFont = opentype.parse(existingFontBuffer);
      const exVer = exFont.tables?.name?.version;
      if (exVer) {
        const verStr = (typeof exVer['en'] === 'string' && exVer['en'].trim()) ? exVer['en'].trim() :
          (Object.values(exVer).find(v => typeof v === 'string' && v.trim()) || '');
        const numMatch = verStr.match(/(\d+)\.(\d+)/);
        if (numMatch) {
          let major = parseInt(numMatch[1], 10);
          let minor = parseInt(numMatch[2], 10);
          minor += 1;
          if (minor >= 10) { major += 1; minor = 0; }
          drawVersion = `${major}.${minor}`;
        }
      }
    } catch (_) {}
  }
  const font = new opentype.Font({
    familyName: drawFamilyName,
    styleName: 'Regular',
    unitsPerEm: EM,
    ascender: TARGET,
    descender: -(EM - TARGET),
    glyphs: glyphs
  });
  const drawDateStr = buildSubsetDateString();

  font.names = {
    copyright: { en: `MontageSubs; Subsetted via ASS Subsetter (${PROJECT_URL}) on ${drawDateStr}` },
    fontFamily: { en: drawFamilyName },
    fontSubfamily: { en: 'Regular' },
    fullName: { en: drawFamilyName },
    version: { en: drawVersion },
    postScriptName: { en: drawFamilyName.replace(/\s+/g, '') + '-Regular' },
    manufacturer: { en: 'MontageSubs' },
    designer: { en: 'MontageSubs (ASS Subsetter)' },
    description: { en: `ASS Subsetter - Drawing Command Font generated for ${fileName || 'unknown subtitle'}` },
    manufacturerURL: { en: PROJECT_URL },
    designerURL: { en: PROJECT_URL },
    license: { en: 'MIT; MontageSubs (ASS Subsetter)' },
    licenseURL: { en: PROJECT_URL },
  };
  return {
    ttf: repairFontBuffer(new Uint8Array(font.toArrayBuffer())),
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

const NAME_ID_FAMILY         = 1;
const NAME_ID_SUBFAMILY      = 2;
const NAME_ID_FULL           = 4;
const NAME_ID_VERSION        = 5;
const NAME_ID_POSTSCRIPT     = 6;
const NAME_ID_DESCRIPTION    = 10;
const NAME_ID_PREF_FAMILY    = 16;
const NAME_ID_PREF_SUBFAMILY = 17;

const MAGIC_TTF   = 0x00010000;
const MAGIC_OTF   = 0x4F54544F;
const MAGIC_TTC   = 0x74746366;
const MAGIC_TRUE  = 0x74727565;
const MAGIC_WOFF  = 0x774F4646;
const MAGIC_WOFF2 = 0x774F4632;

function platformPriority(platformId, languageId) {
  if (platformId === 3 && languageId === 0x0409) return 0;
  if (platformId === 3) return 1;
  if (platformId === 1 && languageId === 0x0000) return 2;
  if (platformId === 1) return 3;
  return 4;
}

function readNameTableRaw(buffer, tableOffset) {
  const view = new DataView(buffer);
  if (tableOffset + 6 > buffer.byteLength) return null;
  const count  = view.getUint16(tableOffset + 2, false);
  const strOff = tableOffset + view.getUint16(tableOffset + 4, false);
  const records = [];
  for (let i = 0; i < count; i++) {
    const base = tableOffset + 6 + i * 12;
    if (base + 12 > buffer.byteLength) break;
    records.push({
      platformId: view.getUint16(base,      false),
      encodingId: view.getUint16(base + 2,  false),
      languageId: view.getUint16(base + 4,  false),
      nameId:     view.getUint16(base + 6,  false),
      length:     view.getUint16(base + 8,  false),
      offset:     view.getUint16(base + 10, false),
    });
  }
  return { records, strOff };
}

function decodeNameRecord(buffer, strOff, rec) {
  const start = strOff + rec.offset;
  if (start < 0 || start + rec.length > buffer.byteLength) return '';
  const bytes = new Uint8Array(buffer, start, rec.length);
  if (rec.platformId === 3 || rec.platformId === 0) {
    let s = '';
    for (let i = 0; i + 1 < bytes.length; i += 2) {
      s += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
    }
    return s.trim();
  }
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s.trim();
}

function bestNameValue(records, strOff, buffer, nameId) {
  const candidates = records.filter(r => r.nameId === nameId);
  if (candidates.length === 0) return '';
  candidates.sort((a, b) => platformPriority(a.platformId, a.languageId) - platformPriority(b.platformId, b.languageId));
  for (const rec of candidates) {
    const val = decodeNameRecord(buffer, strOff, rec);
    if (val) return val;
  }
  return '';
}

function locateTableInBuffer(buffer, sfntOffset) {
  const view = new DataView(buffer);
  if (sfntOffset + 6 > buffer.byteLength) return {};
  const numTables = view.getUint16(sfntOffset + 4, false);
  const result = {};
  for (let i = 0; i < numTables; i++) {
    const pos = sfntOffset + 12 + i * 16;
    if (pos + 16 > buffer.byteLength) break;
    const tag = String.fromCharCode(
      view.getUint8(pos), view.getUint8(pos + 1),
      view.getUint8(pos + 2), view.getUint8(pos + 3)
    );
    result[tag] = {
      offset: view.getUint32(pos + 8,  false),
      length: view.getUint32(pos + 12, false),
    };
  }
  return result;
}

function locateWoffTableInBuffer(buffer) {
  const view = new DataView(buffer);
  if (buffer.byteLength < 48) return {};
  const numTables = view.getUint16(12, false);
  const result = {};
  for (let i = 0; i < numTables; i++) {
    const pos = 44 + i * 20;
    if (pos + 20 > buffer.byteLength) break;
    const tag = String.fromCharCode(
      view.getUint8(pos), view.getUint8(pos + 1),
      view.getUint8(pos + 2), view.getUint8(pos + 3)
    );
    const offset      = view.getUint32(pos + 4,  false);
    const compLength  = view.getUint32(pos + 8,  false);
    const origLength  = view.getUint32(pos + 12, false);
    result[tag] = { offset, compLength, origLength };
  }
  return result;
}

function extractWoffTable(buffer, entry) {
  const { offset, compLength, origLength } = entry;
  const raw = new Uint8Array(buffer, offset, compLength);
  if (compLength === origLength) return raw.buffer.slice(offset, offset + origLength);
  const inflated = new Uint8Array(origLength);
  let si = 0, di = 0;
  while (si < raw.length) {
    const bfinal = raw[si] & 1;
    const btype  = (raw[si] >> 1) & 3;
    si++;
    if (btype === 0) {
      si = (si + 3) & ~3;
      if (si + 4 > raw.length) break;
      const len  = raw[si] | (raw[si + 1] << 8);
      si += 4;
      for (let k = 0; k < len && si < raw.length && di < origLength; k++) inflated[di++] = raw[si++];
    } else {
      break;
    }
    if (bfinal) break;
  }
  const tmp = new ArrayBuffer(origLength);
  new Uint8Array(tmp).set(inflated);
  return tmp;
}

function parseFontMetaFromBuffer(buffer, sfntOffset) {
  const view = new DataView(buffer);
  const tables = locateTableInBuffer(buffer, sfntOffset);
  return extractMetaFromTables(buffer, tables, false);
}

function parseFontMetaFromWoff(buffer) {
  const woffTables = locateWoffTableInBuffer(buffer);
  const nameEntry = woffTables['name'];
  const os2Entry  = woffTables['OS/2'];

  const syntheticBuffer = buffer;
  const allNames    = new Set();
  const familyNames = new Set();
  let weight = 400, isItalic = false, version = '', subfamilyName = '', description = '';

  if (nameEntry) {
    const nameBuf = extractWoffTable(buffer, nameEntry);
    const raw = readNameTableRaw(nameBuf, 0);
    if (raw) {
      extractNamesFromRaw(nameBuf, raw.records, raw.strOff, allNames, familyNames,
        (v) => { if (!version) version = v; },
        (v) => { if (!subfamilyName) subfamilyName = v; },
        (v) => { if (!description) description = v; }
      );
    }
  }

  if (os2Entry) {
    const os2Buf = extractWoffTable(buffer, os2Entry);
    const os2View = new DataView(os2Buf);
    if (os2Buf.byteLength >= 64) {
      const wc = os2View.getUint16(4, false);
      if (wc) weight = wc;
      const fsSel = os2View.getUint16(62, false);
      isItalic = !!(fsSel & 1);
    }
  }

  applySubfamilyFallbacks(subfamilyName, weight, isItalic,
    (w) => { weight = w; }, (it) => { isItalic = it; });

  return { allNames, familyNames, weight, isItalic, version, subfamilyName, description };
}

function extractNamesFromRaw(buffer, records, strOff, allNames, familyNames, onVersion, onSubfamily, onDescription) {
  const FAMILY_IDS  = new Set([NAME_ID_FAMILY, NAME_ID_FULL, NAME_ID_PREF_FAMILY]);
  const INCLUDE_IDS = new Set([
    NAME_ID_FAMILY, NAME_ID_FULL, NAME_ID_PREF_FAMILY,
    NAME_ID_POSTSCRIPT, NAME_ID_SUBFAMILY, NAME_ID_PREF_SUBFAMILY,
    NAME_ID_VERSION, NAME_ID_DESCRIPTION,
  ]);

  const byId = new Map();
  for (const rec of records) {
    if (!INCLUDE_IDS.has(rec.nameId)) continue;
    const existing = byId.get(rec.nameId) || [];
    existing.push(rec);
    byId.set(rec.nameId, existing);
  }

  for (const [nameId, recs] of byId) {
    recs.sort((a, b) => platformPriority(a.platformId, a.languageId) - platformPriority(b.platformId, b.languageId));
    const seen = new Set();
    for (const rec of recs) {
      const val = decodeNameRecord(buffer, strOff, rec);
      if (!val || seen.has(val)) continue;
      seen.add(val);
      if (nameId !== NAME_ID_VERSION && nameId !== NAME_ID_DESCRIPTION) allNames.add(val);
      if (FAMILY_IDS.has(nameId)) familyNames.add(val);
    }
    const best = recs.length > 0 ? decodeNameRecord(buffer, strOff, recs[0]) : '';
    if (nameId === NAME_ID_VERSION) onVersion(best);
    if (nameId === NAME_ID_PREF_SUBFAMILY) onSubfamily(best);
    if (nameId === NAME_ID_SUBFAMILY) onSubfamily(best);
    if (nameId === NAME_ID_DESCRIPTION) onDescription(best);
  }
}

function applySubfamilyFallbacks(subfamilyName, weight, isItalic, setWeight, setItalic) {
  if (!isItalic && subfamilyName) {
    const sub = subfamilyName.toLowerCase();
    if (sub.includes('italic') || sub.includes('oblique')) setItalic(true);
  }
  if (weight === 400 && subfamilyName) {
    const sub = subfamilyName.toLowerCase();
    if (sub.includes('bold'))                                      setWeight(700);
    else if (sub.includes('light'))                                setWeight(300);
    else if (sub.includes('thin'))                                 setWeight(100);
    else if (sub.includes('medium'))                               setWeight(500);
    else if (sub.includes('semibold') || sub.includes('demibold')) setWeight(600);
    else if (sub.includes('black')    || sub.includes('heavy'))    setWeight(900);
  }
}

function extractMetaFromTables(buffer, tables, _unused) {
  const view = new DataView(buffer);
  const allNames    = new Set();
  const familyNames = new Set();
  let weight = 400, isItalic = false, version = '', subfamilyName = '', description = '';

  if (tables['name']) {
    const raw = readNameTableRaw(buffer, tables['name'].offset);
    if (raw) {
      let prefSubSet = false;
      extractNamesFromRaw(buffer, raw.records, raw.strOff, allNames, familyNames,
        (v) => { if (!version) version = v; },
        (v) => {
          const isPref = raw.records.some(r => r.nameId === NAME_ID_PREF_SUBFAMILY);
          if (isPref && !prefSubSet) { subfamilyName = v; prefSubSet = true; }
          else if (!isPref && !subfamilyName) subfamilyName = v;
        },
        (v) => { if (!description) description = v; }
      );
    }
  }

  if (tables['OS/2']) {
    const os2 = tables['OS/2'].offset;
    if (os2 + 64 <= buffer.byteLength) {
      const wc = view.getUint16(os2 + 4, false);
      if (wc) weight = wc;
      const fsSel = view.getUint16(os2 + 62, false);
      isItalic = !!(fsSel & 1);
    }
  }

  applySubfamilyFallbacks(subfamilyName, weight, isItalic,
    (w) => { weight = w; }, (it) => { isItalic = it; });

  return { allNames, familyNames, weight, isItalic, version, subfamilyName, description };
}

function readFontDescriptionRaw(buffer) {
  if (buffer.byteLength < 4) return '';
  const view = new DataView(buffer);
  const magic = view.getUint32(0, false);
  if (magic === MAGIC_WOFF2) return '';
  if (magic === MAGIC_WOFF) {
    const woffTables = locateWoffTableInBuffer(buffer);
    if (!woffTables['name']) return '';
    const nameBuf = extractWoffTable(buffer, woffTables['name']);
    const raw = readNameTableRaw(nameBuf, 0);
    if (!raw) return '';
    return bestNameValue(raw.records, raw.strOff, nameBuf, NAME_ID_DESCRIPTION);
  }
  const isTTC = magic === MAGIC_TTC;
  const sfntOffset = isTTC ? view.getUint32(12, false) : 0;
  const tables = locateTableInBuffer(buffer, sfntOffset);
  if (!tables['name']) return '';
  const raw = readNameTableRaw(buffer, tables['name'].offset);
  if (!raw) return '';
  return bestNameValue(raw.records, raw.strOff, buffer, NAME_ID_DESCRIPTION);
}

function weightScore(weight) {
  const dist = Math.abs(weight - 400);
  if (dist === 0) return 0;
  if (Math.abs(weight - 500) < dist) return Math.abs(weight - 500) + 1;
  return dist + 2;
}

function matchFontBuffer(buffer, requiredFonts, id) {
  if (buffer.byteLength < 4) return { results: [], isTTC: false };
  const view = new DataView(buffer);
  const magic = view.getUint32(0, false);
  const results = [];
  const reqLowers = requiredFonts.map(r => r.toLowerCase());

  const commitResult = (meta, ttcIndex) => {
    const { allNames, familyNames, weight, isItalic, version, subfamilyName } = meta;
    const allNamesLower    = new Set([...allNames].map(n => n.toLowerCase()));
    const familyNamesLower = new Set([...familyNames].map(n => n.toLowerCase()));
    for (let ri = 0; ri < requiredFonts.length; ri++) {
      if (allNamesLower.has(reqLowers[ri])) {
        results.push({
          matchedFor:    requiredFonts[ri],
          weight, isItalic,
          isFamilyMatch: familyNamesLower.has(reqLowers[ri]),
          subfamilyName, version,
          allNames:   Array.from(allNames),
          familyNames: Array.from(familyNames),
          ttcIndex,
        });
      }
    }
  };

  try {
    if (magic === MAGIC_WOFF2) {
      const fontObj = opentype.parse(buffer);
      const allNames    = new Set();
      const familyNames = new Set();
      for (const [prop, val] of Object.entries(fontObj.tables?.name || {})) {
        if (val && typeof val === 'object') {
          for (const v of Object.values(val)) {
            const s = decodeFontName(v, '');
            if (s) allNames.add(s);
          }
        }
      }
      ['fontFamily', 'fullName', 'preferredFamily'].forEach(f => {
        const val = fontObj.tables?.name?.[f];
        if (val && typeof val === 'object') {
          for (const v of Object.values(val)) {
            const s = decodeFontName(v, '');
            if (s) familyNames.add(s);
          }
        }
      });
      const wc = fontObj.tables?.os2?.usWeightClass;
      const weight = wc || 400;
      const fsSel = fontObj.tables?.os2?.fsSelection;
      const isItalic = fsSel !== undefined ? !!(fsSel & 1) : false;
      const sub = (fontObj.names?.preferredSubfamily?.en || fontObj.names?.fontSubfamily?.en || '').trim();
      const ver = (fontObj.names?.version?.en || '').trim();
      commitResult({ allNames, familyNames, weight, isItalic, version: ver, subfamilyName: sub }, -1);
    } else if (magic === MAGIC_WOFF) {
      commitResult(parseFontMetaFromWoff(buffer), -1);
    } else if (magic === MAGIC_TTC) {
      const numFonts = view.getUint32(8, false);
      for (let i = 0; i < numFonts; i++) {
        const sfntOffset = view.getUint32(12 + i * 4, false);
        try { commitResult(parseFontMetaFromBuffer(buffer, sfntOffset), i); } catch (_) { }
      }
    } else {
      commitResult(parseFontMetaFromBuffer(buffer, 0), -1);
    }
  } catch (e) {
    emitLog(id, 'log.font.parse_fail', 'err', { error: e.message });
  }

  const isTTC = magic === MAGIC_TTC;
  return { results, isTTC };
}
function extractOrigNameLangKeys(origFont, fieldName, targetValue) {
  const nameTable = origFont.tables?.name;
  if (!nameTable || !nameTable[fieldName]) return [];
  const targetLower = targetValue.toLowerCase().trim();
  const keys = [];
  for (const [langKey, val] of Object.entries(nameTable[fieldName])) {
    const decoded = (typeof val === 'string') ? val.trim() : '';
    if (decoded.toLowerCase() === targetLower) keys.push(langKey);
  }
  return keys;
}
function getOrigNameField(origFont, fieldName) {
  const nameTable = origFont.tables?.name;
  if (!nameTable || !nameTable[fieldName]) return null;
  return nameTable[fieldName];
}
function buildSubsetDateString() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const h = String(now.getUTCHours()).padStart(2, '0');
  const mi = String(now.getUTCMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi} UTC`;
}
function calcTableChecksum(u8, offset, length) {
  let cs = 0;
  const padded = (length + 3) & ~3;
  for (let i = 0; i < padded; i += 4) {
    const b0 = i < length ? u8[offset + i] : 0;
    const b1 = (i + 1) < length ? u8[offset + i + 1] : 0;
    const b2 = (i + 2) < length ? u8[offset + i + 2] : 0;
    const b3 = (i + 3) < length ? u8[offset + i + 3] : 0;
    cs = (cs + ((b0 << 24 | b1 << 16 | b2 << 8 | b3) >>> 0)) >>> 0;
  }
  return cs;
}
function repairFontBuffer(u8) {
  if (u8.length < 12) return u8;
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const sfntVer = view.getUint32(0, false);
  const isTTC = sfntVer === 0x74746366;
  if (isTTC) return u8;
  const numTables = view.getUint16(4, false);
  if (numTables === 0 || 12 + numTables * 16 > u8.length) return u8;
  const LTAG = 0x6c746167;
  let headOffset = -1;
  let headLength = -1;
  const removeTags = new Set();
  for (let i = 0; i < numTables; i++) {
    const base = 12 + i * 16;
    const tag = view.getUint32(base, false);
    const offset = view.getUint32(base + 8, false);
    const length = view.getUint32(base + 12, false);
    if (tag === 0x68656164) { headOffset = offset; headLength = length; }
    if (tag === LTAG) removeTags.add(i);
  }
  let out = u8;
  if (removeTags.size > 0) {
    const oldNumTables = numTables;
    const newNumTables = oldNumTables - removeTags.size;
    const oldHeaderSize = 12 + oldNumTables * 16;
    const newHeaderSize = 12 + newNumTables * 16;
    const dataShift = oldHeaderSize - newHeaderSize;
    const newLen = u8.length - dataShift;
    out = new Uint8Array(newLen);
    const outView = new DataView(out.buffer);
    outView.setUint32(0, sfntVer, false);
    outView.setUint16(4, newNumTables, false);
    outView.setUint16(6, view.getUint16(6, false), false);
    outView.setUint16(8, view.getUint16(8, false), false);
    outView.setUint16(10, view.getUint16(10, false), false);
    let ni = 0;
    for (let i = 0; i < oldNumTables; i++) {
      if (removeTags.has(i)) continue;
      const oldBase = 12 + i * 16;
      const newBase = 12 + ni * 16;
      const oldOffset = view.getUint32(oldBase + 8, false);
      const length = view.getUint32(oldBase + 12, false);
      const newOffset = oldOffset - dataShift;
      outView.setUint32(newBase, view.getUint32(oldBase, false), false);
      outView.setUint32(newBase + 4, view.getUint32(oldBase + 4, false), false);
      outView.setUint32(newBase + 8, newOffset, false);
      outView.setUint32(newBase + 12, length, false);
      out.set(u8.slice(oldOffset, oldOffset + length), newOffset);
      ni++;
    }
    if (headOffset !== -1) headOffset -= dataShift;
    u8 = out;
  }
  const outView = new DataView(out.buffer, out.byteOffset, out.byteLength);
  const finalNumTables = outView.getUint16(4, false);
  for (let i = 0; i < finalNumTables; i++) {
    const base = 12 + i * 16;
    const tag = outView.getUint32(base, false);
    const offset = outView.getUint32(base + 8, false);
    const length = outView.getUint32(base + 12, false);
    if (offset + length > out.length) continue;
    let cs;
    if (tag === 0x68656164) {
      const savedCSA = [out[offset+8], out[offset+9], out[offset+10], out[offset+11]];
      out[offset+8] = out[offset+9] = out[offset+10] = out[offset+11] = 0;
      cs = calcTableChecksum(out, offset, length);
      out[offset+8] = savedCSA[0]; out[offset+9] = savedCSA[1];
      out[offset+10] = savedCSA[2]; out[offset+11] = savedCSA[3];
    } else {
      cs = calcTableChecksum(out, offset, length);
    }
    outView.setUint32(base + 4, cs, false);
  }
  if (headOffset !== -1 && headOffset >= 0 && headOffset + headLength <= out.length) {
    out[headOffset+8] = out[headOffset+9] = out[headOffset+10] = out[headOffset+11] = 0;
    let total = 0;
    const padLen = (out.length + 3) & ~3;
    for (let i = 0; i < padLen; i += 4) {
      const b0 = i < out.length ? out[i] : 0;
      const b1 = (i+1) < out.length ? out[i+1] : 0;
      const b2 = (i+2) < out.length ? out[i+2] : 0;
      const b3 = (i+3) < out.length ? out[i+3] : 0;
      total = (total + ((b0 << 24 | b1 << 16 | b2 << 8 | b3) >>> 0)) >>> 0;
    }
    const csa = (0xB1B0AFBA - total + 0x100000000) >>> 0;
    out[headOffset+8]  = (csa >>> 24) & 0xFF;
    out[headOffset+9]  = (csa >>> 16) & 0xFF;
    out[headOffset+10] = (csa >>> 8)  & 0xFF;
    out[headOffset+11] =  csa         & 0xFF;
  }
  return out;
}
const NAME_ID_MAP = {
  copyright: 0, fontFamily: 1, fontSubfamily: 2, uniqueSubfamilyID: 3,
  fullName: 4, version: 5, postScriptName: 6, trademark: 7,
  manufacturer: 8, designer: 9, description: 10, manufacturerURL: 11,
  designerURL: 12, license: 13, licenseURL: 14,
  preferredFamily: 16, preferredSubfamily: 17,
};
function modifyNameTable(buffer, newNames) {
  const ensureTTF = (buf) => {
    const v = new DataView(buf instanceof ArrayBuffer ? buf : buf.buffer ?? buf);
    const sig = buf.byteLength >= 4 ? v.getUint32(0, false) : 0;
    if (sig === 0x774F4646 || sig === 0x774F4632) {
      const font = opentype.parse(buf);
      return new Uint8Array(font.toArrayBuffer()).buffer;
    }
    return buf instanceof ArrayBuffer ? buf : buf.buffer ?? buf;
  };
  buffer = ensureTTF(buffer);

  const view = new DataView(buffer);
  const numTables = view.getUint16(4, false);
  let nameDirOffset = -1;
  for (let i = 0; i < numTables; i++) {
    const base = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(base), view.getUint8(base + 1),
      view.getUint8(base + 2), view.getUint8(base + 3)
    );
    if (tag === 'name') { nameDirOffset = base; break; }
  }
  if (nameDirOffset === -1) return buffer;

  const nameTableOffset = view.getUint32(nameDirOffset + 8, false);
  const nameView = new DataView(buffer, nameTableOffset);
  const count = nameView.getUint16(2, false);
  const storageOffset = nameView.getUint16(4, false);

  const newRecords = [];
  const stringChunks = [];
  let strPos = 0;

  const resolveValue = (entries, platformID, encodingID) => {
    const str = entries['en'] || Object.values(entries).find(v => typeof v === 'string') || '';
    if (platformID === 3 || platformID === 0) {
      const buf = new Uint8Array(str.length * 2);
      const dv = new DataView(buf.buffer);
      for (let i = 0; i < str.length; i++) dv.setUint16(i * 2, str.charCodeAt(i), false);
      return buf;
    }
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const cp = str.charCodeAt(i);
      bytes.push(cp <= 0xFF ? cp : 0x3F);
    }
    return new Uint8Array(bytes);
  };

  for (let i = 0; i < count; i++) {
    const rec = nameTableOffset + 6 + i * 12;
    const platformID = view.getUint16(rec, false);
    const encodingID = view.getUint16(rec + 2, false);
    const languageID = view.getUint16(rec + 4, false);
    const nameID = view.getUint16(rec + 6, false);
    const origLen = view.getUint16(rec + 8, false);
    const origStrOff = view.getUint16(rec + 10, false);

    let bytes = null;
    for (const [field, entries] of Object.entries(newNames)) {
      if (NAME_ID_MAP[field] === nameID) {
        bytes = resolveValue(entries, platformID, encodingID);
        break;
      }
    }
    if (!bytes) {
      const origAbsOff = nameTableOffset + storageOffset + origStrOff;
      const safeLen = Math.min(origLen, Math.max(0, buffer.byteLength - origAbsOff));
      bytes = safeLen > 0 ? new Uint8Array(buffer, origAbsOff, safeLen) : new Uint8Array(0);
    }
    const aligned = new Uint8Array(bytes);
    newRecords.push({ platformID, encodingID, languageID, nameID, length: aligned.length, strOff: strPos });
    stringChunks.push(aligned);
    strPos += aligned.length;
  }

  for (const [field, entries] of Object.entries(newNames)) {
    const nameID = NAME_ID_MAP[field];
    if (nameID === undefined) continue;
    const alreadyHas3 = newRecords.some(r => r.nameID === nameID && r.platformID === 3);
    const alreadyHas1 = newRecords.some(r => r.nameID === nameID && r.platformID === 1);
    for (const platformID of [3, 1]) {
      if (platformID === 3 && alreadyHas3) continue;
      if (platformID === 1 && alreadyHas1) continue;
      const bytes = resolveValue(entries, platformID, 0);
      newRecords.push({ platformID, encodingID: platformID === 3 ? 1 : 0, languageID: platformID === 3 ? 0x0409 : 0, nameID, length: bytes.length, strOff: strPos });
      stringChunks.push(bytes);
      strPos += bytes.length;
    }
  }

  newRecords.sort((a, b) => a.platformID - b.platformID || a.encodingID - b.encodingID || a.languageID - b.languageID || a.nameID - b.nameID);

  const newStorageOffset = 6 + newRecords.length * 12;
  const newNameTableSize = newStorageOffset + strPos;
  const newNameU8 = new Uint8Array(newNameTableSize);
  const newNameView = new DataView(newNameU8.buffer);
  newNameView.setUint16(0, 0, false);
  newNameView.setUint16(2, newRecords.length, false);
  newNameView.setUint16(4, newStorageOffset, false);
  for (let i = 0; i < newRecords.length; i++) {
    const r = newRecords[i];
    const base = 6 + i * 12;
    newNameView.setUint16(base, r.platformID, false);
    newNameView.setUint16(base + 2, r.encodingID, false);
    newNameView.setUint16(base + 4, r.languageID, false);
    newNameView.setUint16(base + 6, r.nameID, false);
    newNameView.setUint16(base + 8, r.length, false);
    newNameView.setUint16(base + 10, r.strOff, false);
  }
  let writePos = newStorageOffset;
  for (const chunk of stringChunks) {
    newNameU8.set(chunk, writePos);
    writePos += chunk.length;
  }

  const origNameTableLen = view.getUint32(nameDirOffset + 12, false);
  const paddedOrig = (origNameTableLen + 3) & ~3;
  const paddedNew = (newNameTableSize + 3) & ~3;
  const delta = paddedNew - paddedOrig;
  const newTotalLen = buffer.byteLength + delta;
  const out = new Uint8Array(newTotalLen);
  const origOffset = nameTableOffset;
  const afterOrig = origOffset + paddedOrig;

  out.set(new Uint8Array(buffer, 0, origOffset));
  out.set(new Uint8Array(buffer, afterOrig), afterOrig + delta);

  if (delta !== 0) {
    const outView = new DataView(out.buffer);
    const finalNumTables = outView.getUint16(4, false);
    for (let i = 0; i < finalNumTables; i++) {
      const base = 12 + i * 16;
      const off = outView.getUint32(base + 8, false);
      if (off >= afterOrig) outView.setUint32(base + 8, off + delta, false);
    }
  }
  out.set(newNameU8, origOffset);
  const outView = new DataView(out.buffer);
  outView.setUint32(nameDirOffset + 12, newNameTableSize, false);
  return out.buffer;
}
async function subsetFont(fontBuffer, charArray, fontName, isTTC, targetWeight, ttcIndex, id, wantAscii, wantFullFont) {
  let orig;
  const isTargetBold = (targetWeight === 'bold' || targetWeight === 'boldItalic');
  const isTargetItalic = (targetWeight === 'italic' || targetWeight === 'boldItalic');
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
  const charSet = new Set(charArray.map(c => c));
  let fullCharArray;
  if (wantAscii !== false) {
    const asciiChars = [];
    for (let cp = 0x20; cp <= 0x7E; cp++) {
      const ch = String.fromCharCode(cp);
      const g = orig.charToGlyph(ch);
      if (g && g.index !== 0) asciiChars.push(ch);
    }
    const asciiOnly = asciiChars.filter(c => !charSet.has(c));
    fullCharArray = [...asciiOnly, ...charArray];
  } else {
    fullCharArray = charArray;
  }
  let glyphs = [];
  let skipped = 0;
  if (wantFullFont) {
    for (let i = 0; i < orig.glyphs.length; i++) {
      glyphs.push(orig.glyphs.get(i));
    }
  } else {
    const origNotdef = orig.glyphs.get(0);
    const notdef = new opentype.Glyph({
      name: '.notdef', unicode: 0,
      advanceWidth: origNotdef?.advanceWidth || 500,
      path: new opentype.Path()
    });
    glyphs.push(notdef);
    const seen = new Set([0]);
    const total = fullCharArray.length;
    for (let ci = 0; ci < total; ci++) {
      if (ci % 500 === 0) {
        emitProgress(id, 'subset', ci, total);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      const char = fullCharArray[ci];
      const cp = char.codePointAt(0);
      if (seen.has(cp)) continue;
      const origGlyph = orig.charToGlyph(char);
      if (!origGlyph || origGlyph.index === 0) { skipped++; continue; }
      const rendered = orig.getPath(char, 0, 0, orig.unitsPerEm);
      const newPath = new opentype.Path();
      for (const cmd of rendered.commands) {
        switch (cmd.type) {
          case 'M': newPath.moveTo(Math.round(cmd.x), Math.round(-cmd.y)); break;
          case 'L': newPath.lineTo(Math.round(cmd.x), Math.round(-cmd.y)); break;
          case 'C': newPath.curveTo(Math.round(cmd.x1), Math.round(-cmd.y1), Math.round(cmd.x2), Math.round(-cmd.y2), Math.round(cmd.x), Math.round(-cmd.y)); break;
          case 'Q': newPath.quadraticCurveTo(Math.round(cmd.x1), Math.round(-cmd.y1), Math.round(cmd.x), Math.round(-cmd.y)); break;
          case 'Z': newPath.close(); break;
        }
      }
      glyphs.push(new opentype.Glyph({
        name: origGlyph.name || `glyph_${cp}`,
        unicode: cp, advanceWidth: origGlyph.advanceWidth, path: newPath
      }));
      seen.add(cp);
    }
  }
  const origSubfamilyField = getOrigNameField(orig, 'preferredSubfamily') || getOrigNameField(orig, 'fontSubfamily');
  let origSubfamilyStr = '';
  if (origSubfamilyField) {
    const enVal = origSubfamilyField['en'];
    if (typeof enVal === 'string' && enVal.trim()) {
      origSubfamilyStr = enVal.trim();
    } else {
      const anyVal = Object.values(origSubfamilyField).find(v => typeof v === 'string' && v.trim());
      if (anyVal) origSubfamilyStr = anyVal.trim();
    }
  }
  const canonicalSubfamily = isTargetBold && isTargetItalic ? 'Bold Italic' : isTargetBold ? 'Bold' : isTargetItalic ? 'Italic' : 'Regular';
  const subfamilyName = origSubfamilyStr || canonicalSubfamily;
  const newFont = new opentype.Font({
    familyName: fontName,
    styleName: canonicalSubfamily,
    unitsPerEm: orig.unitsPerEm,
    ascender: orig.ascender,
    descender: orig.descender,
    glyphs
  });
  if (orig.tables?.os2) {
    newFont.tables.os2 = Object.assign({}, orig.tables.os2);
    newFont.tables.os2.usWeightClass = orig.tables.os2.usWeightClass;
    newFont.tables.os2.fsSelection = orig.tables.os2.fsSelection;
  }
  const dateStr = buildSubsetDateString();
  const subsetSuffix = `; Subsetted via ASS Subsetter (${PROJECT_URL}) on ${dateStr}`;
  const vendorSuffix = '; MontageSubs (ASS Subsetter)';
  const familyLangKeys = extractOrigNameLangKeys(orig, 'fontFamily', fontName);
  const langKeysForFamily = familyLangKeys.length > 0 ? familyLangKeys : ['en'];
  if (!langKeysForFamily.includes('en')) langKeysForFamily.push('en');
  const familyEntry = {};
  const fullNameEntry = {};
  const subfamilyEntry = {};
  const preferredSubfamilyEntry = {};
  for (const lk of langKeysForFamily) {
    familyEntry[lk] = fontName;
    fullNameEntry[lk] = fontName + (subfamilyName !== 'Regular' ? ' ' + subfamilyName : '');
    subfamilyEntry[lk] = canonicalSubfamily;
    preferredSubfamilyEntry[lk] = subfamilyName;
  }
  const origPsField = getOrigNameField(orig, 'postScriptName');
  let origPsName = '';
  if (origPsField) {
    const enVal = origPsField['en'];
    if (typeof enVal === 'string' && enVal.trim() && /^[\x20-\x7E]+$/.test(enVal.trim())) {
      origPsName = enVal.trim();
    } else {
      for (const val of Object.values(origPsField)) {
        if (typeof val === 'string' && val.trim() && /^[\x20-\x7E]+$/.test(val.trim())) {
          origPsName = val.trim();
          break;
        }
      }
    }
  }
  const asciiFamilyBase = origPsName
    ? origPsName.replace(/-(?:Bold|Regular|Italic|BoldItalic|Heavy|Black|Light|Thin|Medium|SemiBold|ExtraLight|ExtraBold|UltraLight|UltraBold)$/i, '')
    : fontName.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, '') || 'Font';
  const psName = asciiFamilyBase + '-' + subfamilyName.replace(/\s+/g, '');
  const origVersion = getOrigNameField(orig, 'version');
  let firstVersionVal = 'Version 1.000';
  if (origVersion) {
    for (const val of Object.values(origVersion)) {
      if (typeof val === 'string' && val.trim()) { firstVersionVal = val.trim(); break; }
    }
  }
  const normalizedVersion = {};
  for (const lk of langKeysForFamily) normalizedVersion[lk] = firstVersionVal;
  const origCopyright = getOrigNameField(orig, 'copyright');
  let baseCopyrightStr = '';
  if (origCopyright) {
    const enVal = origCopyright['en'];
    if (typeof enVal === 'string' && enVal.trim()) {
      baseCopyrightStr = enVal.trim();
    } else {
      const anyVal = Object.values(origCopyright).find(v => typeof v === 'string' && v.trim());
      if (anyVal) baseCopyrightStr = anyVal.trim();
    }
  }
  const copyrightStr = (baseCopyrightStr || 'MontageSubs') + subsetSuffix;
  const copyrightEntry = {};
  for (const lk of langKeysForFamily) copyrightEntry[lk] = copyrightStr;
  const origDesigner = getOrigNameField(orig, 'designer');
  let baseDesignerStr = '';
  if (origDesigner) {
    const enVal = origDesigner['en'];
    if (typeof enVal === 'string' && enVal.trim()) {
      baseDesignerStr = enVal.trim();
    } else {
      const anyVal = Object.values(origDesigner).find(v => typeof v === 'string' && v.trim());
      if (anyVal) baseDesignerStr = anyVal.trim();
    }
  }
  const designerStr = (baseDesignerStr || 'MontageSubs (ASS Subsetter)') + vendorSuffix;
  const designerEntry = {};
  for (const lk of langKeysForFamily) designerEntry[lk] = designerStr;

  const origRealManufacturer = getOrigNameField(orig, 'manufacturer');
  let baseRealManufacturerStr = '';
  if (origRealManufacturer) {
    const enVal = origRealManufacturer['en'];
    if (typeof enVal === 'string' && enVal.trim()) {
      baseRealManufacturerStr = enVal.trim();
    } else {
      const anyVal = Object.values(origRealManufacturer).find(v => typeof v === 'string' && v.trim());
      if (anyVal) baseRealManufacturerStr = anyVal.trim();
    }
  }

  const realManufacturerStr = baseRealManufacturerStr ? (baseRealManufacturerStr + '; MontageSubs') : 'MontageSubs';
  const realManufacturerEntry = {};
  for (const lk of langKeysForFamily) realManufacturerEntry[lk] = realManufacturerStr;

  const origLicense = getOrigNameField(orig, 'license');
  const origLicenseURL = getOrigNameField(orig, 'licenseURL');

  const descriptionEntry = {};
  const urlEntry = {};
  for (const lk of langKeysForFamily) {
    descriptionEntry[lk] = `ASS Subsetter (${PROJECT_URL})`;
    urlEntry[lk] = PROJECT_URL;
  }
  
  const newNames = {
    copyright: copyrightEntry,
    fontFamily: familyEntry,
    fontSubfamily: subfamilyEntry,
    preferredSubfamily: preferredSubfamilyEntry,
    fullName: fullNameEntry,
    version: normalizedVersion,
    postScriptName: { en: psName },
    manufacturer: realManufacturerEntry,
    designer: designerEntry,
    description: descriptionEntry,
    manufacturerURL: urlEntry,
    designerURL: urlEntry,
  };
  if (origLicense) {
    newNames.license = {};
    for (const lk of langKeysForFamily) {
      const origVal = origLicense[lk] || origLicense['en'] || Object.values(origLicense).find(v => typeof v === 'string') || '';
      if (origVal) newNames.license[lk] = origVal;
    }
    if (Object.keys(newNames.license).length === 0) delete newNames.license;
  }
  if (origLicenseURL) {
    newNames.licenseURL = {};
    for (const lk of langKeysForFamily) {
      const origVal = origLicenseURL[lk] || origLicenseURL['en'] || Object.values(origLicenseURL).find(v => typeof v === 'string') || '';
      if (origVal) newNames.licenseURL[lk] = origVal;
    }
    if (Object.keys(newNames.licenseURL).length === 0) delete newNames.licenseURL;
  }
  newFont.names = newNames;
  let rawTTF;
  if (wantFullFont) {
    const baseBuffer = isTTC && ttcIndex !== undefined && ttcIndex !== -1 ? extractTTFFromTTC(fontBuffer, ttcIndex) : fontBuffer;
    rawTTF = repairFontBuffer(new Uint8Array(modifyNameTable(baseBuffer, newNames)));
  } else {
    rawTTF = repairFontBuffer(new Uint8Array(newFont.toArrayBuffer()));
  }

  return {
    ttf: rawTTF,
    skipped,
    origSize: fontBuffer.byteLength,
    usedChars: charArray
  };
}
function applyRandFontNamesInLine(line, randFontNames) {
  const isRestoring = randFontNames.some(e => e.restoring);
  const m = line.match(/^([^:]*?:\s*)(.*)/s);
  if (!m) return line;
  const prefix = m[1];
  const content = m[2];
  const segs = content.split(/(\{[^}]*\})/);
  let result = prefix;
  for (const seg of segs) {
    if (seg.startsWith('{')) {
      const inner = seg.slice(1, -1);
      const fm = inner.match(/\\fn([^\\}]*)/);
      if (fm) {
        const fn = normFont(fm[1].trim());
        const rEntry = isRestoring
          ? randFontNames.find(e => e.rand.toLowerCase() === fn.toLowerCase())
          : randFontNames.find(e => e.orig.toLowerCase() === fn.toLowerCase());
        if (rEntry) {
          const newName = isRestoring ? rEntry.orig : rEntry.rand;
          result += '{' + inner.replace(/\\fn[^\\}]*/, '\\fn' + newName) + '}';
          continue;
        }
      }
      result += seg;
    } else {
      result += seg;
    }
  }
  return result;
}
function rewriteASS(rawContent, opts, id) {
  const { drawingDataToChar, drawFontFamily, drawTTF, embeddedFonts, drawCharRemap, targetNewline, randFontNames, wantStrip, retainRawFonts } = opts;
  const nl = targetNewline || '\n';
  const blocks = rawContent.split(SECTION_SPLIT_RE);
  const totalBlocks = blocks.length;
  const processedBlocks = [];
  let eventsIndex = -1;
  const subsetStyles = new Set();
  let styleFmt = null;
  let eventFmt = null;

  for (let i = 0; i < totalBlocks; i++) {
    if (i % 5 === 0) emitProgress(id, 'rewrite', i, totalBlocks);
    const block = blocks[i];
    const trimmed = block.trim();
    if (!trimmed) continue;
    const header = (trimmed.match(/^\[([^\]]+)\]/i)?.[1] || '').toLowerCase();
    if (header === 'fonts') continue;
    if (header === 'script info') {
      const lines = block.split(/\r?\n/);
      const cleanLines = lines.filter(l => !/^;\s*Font Subset:/i.test(l.trim()));
      let insertAfter = 0;
      for (let li = 0; li < cleanLines.length; li++) {
        if (/^\[Script Info\]/i.test(cleanLines[li].trim())) { insertAfter = li + 1; break; }
      }
      if (opts.activeRandMap && opts.activeRandMap.length > 0 && !wantStrip) {
        const mapLines = opts.activeRandMap.map(e => `; Font Subset: ${e.rand} - ${e.orig}`);
        cleanLines.splice(insertAfter, 0, ...mapLines);
      } else {
        while (insertAfter < cleanLines.length && cleanLines[insertAfter].trim() === '') {
          cleanLines.splice(insertAfter, 1);
        }
      }
      processedBlocks.push(cleanLines.join(nl));
    } else if (header.includes('styles')) {
      const lines = block.split(/\r?\n/);
      const newLines = lines.map(l => {
        if (/^format\s*:/i.test(l)) {
          const flds = l.replace(/^format\s*:/i, '').split(',').map(f => f.trim().toLowerCase());
          styleFmt = { nameIdx: flds.indexOf('name'), fontIdx: flds.indexOf('fontname') };
          return l;
        }
        if (/^style\s*:/i.test(l) && styleFmt) {
          const parts = l.replace(/^style\s*:\s*/i, '').split(',');
          const sName = parts[styleFmt.nameIdx]?.trim();
          const sFont = normFont(parts[styleFmt.fontIdx]?.trim() || '');
          if (sName && sFont.toLowerCase() === drawFontFamily.toLowerCase()) subsetStyles.add(sName);
          if (randFontNames && randFontNames.length > 0) {
            const isRestoring2 = randFontNames.some(e => e.restoring);
            if (isRestoring2) {
              const rEntry2 = randFontNames.find(e => e.rand.toLowerCase() === sFont.toLowerCase());
              if (rEntry2) { parts[styleFmt.fontIdx] = parts[styleFmt.fontIdx].replace(sFont, rEntry2.orig); return 'Style: ' + parts.join(','); }
            } else {
              const rEntry = randFontNames.find(e => e.orig.toLowerCase() === sFont.toLowerCase());
              if (rEntry) { parts[styleFmt.fontIdx] = parts[styleFmt.fontIdx].replace(sFont, rEntry.rand); return 'Style: ' + parts.join(','); }
            }
          }
        }
        return l;
      });
      processedBlocks.push(newLines.join(nl));
    } else if (header === 'events') {
      eventsIndex = processedBlocks.length;
      const lines = block.split(/\r?\n/);
      const newLines = lines.map(l => {
        if (/^format\s*:/i.test(l)) {
          const flds = l.replace(/^format\s*:/i, '').split(',').map(f => f.trim().toLowerCase());
          eventFmt = { styleIdx: flds.indexOf('style'), textIdx: flds.indexOf('text') };
          return l;
        }
        if (/^dialogue\s*:/i.test(l.trim()) && eventFmt) {
          let processed = l;
          if (opts.drawCharRemap && opts.drawCharRemap.size > 0) {
            const rest2 = processed.replace(/^dialogue\s*:/i, '');
            const parts2 = rest2.split(',');
            const sName2 = parts2[eventFmt.styleIdx]?.trim();
            processed = renameSubsetCharsInLine(processed, opts.drawCharRemap, drawFontFamily, subsetStyles.has(sName2), subsetStyles);
          }
          if (drawingDataToChar && drawingDataToChar.length > 0) {
            processed = replaceDrawingsInLine(processed, drawingDataToChar, drawFontFamily);
          }
          if (randFontNames && randFontNames.length > 0) {
            processed = applyRandFontNamesInLine(processed, randFontNames);
          }

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
  const hasRetainFonts = retainRawFonts && retainRawFonts.length > 0;
  if (!wantStrip && (drawTTF || (embeddedFonts && embeddedFonts.length > 0))) {
    const newFontLines = ['[Fonts]'];
    const encodeAndAppend = (embName, ttfData) => {
      newFontLines.push(`fontname: ${embName}`);
      const enc = assUUEncode(ttfData);
      for (let j = 0; j < enc.length; j += 80) newFontLines.push(enc.slice(j, j + 80));
      newFontLines.push('');
    };
    if (drawTTF) encodeAndAppend(drawFontFamily + '_0.ttf', drawTTF);
    if (embeddedFonts && embeddedFonts.length > 0) {
      embeddedFonts.forEach(ef => {
        const slotSuffix = ef.weightSlot === 'bold' ? '_B0.ttf' : ef.weightSlot === 'italic' ? '_I0.ttf' : ef.weightSlot === 'boldItalic' ? '_BI0.ttf' : '_0.ttf';
        const baseName = ef.name.replace(/(_B|_I|_BI)$/, '');
        encodeAndAppend(baseName + slotSuffix, ef.ttf);
      });
    }
    finalSec = newFontLines.join(nl);
  } else if (wantStrip && hasRetainFonts) {
    const newFontLines = ['[Fonts]'];
    for (const { name, lines } of retainRawFonts) {
      newFontLines.push(`fontname: ${name}`);
      for (const l of lines) newFontLines.push(l);
      newFontLines.push('');
    }
    finalSec = newFontLines.join(nl);
  }

  if (finalSec) {
    if (eventsIndex !== -1) {
      processedBlocks.splice(eventsIndex, 0, finalSec);
    } else {
      processedBlocks.push(finalSec);
    }
  }
  emitProgress(id, 'rewrite', totalBlocks, totalBlocks);
  return processedBlocks.join(nl);
}

function renameSubsetCharsInLine(line, charRemap, fontFamily, initialIsSubset, subsetStyles) {
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
      if (rm) {
        const sn = rm[1].trim();
        isSubsetFont = sn === '' ? !!initialIsSubset : (subsetStyles && subsetStyles.has(sn));
      }
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
async function doConvert(data, id) {
  const { text, fonts, forceHasBOM, fileName } = data;
  let options = data.options;
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
      if (parsed.hasExistingDrawSubset) {
        const oldCount = parsed.subsetReferencedChars.length;
        const newCount = totalDrawings;
        const added = newCount;
        const removed = Math.max(0, oldCount - newCount);
        if (newCount === 0) {
          emitLog(id, 'log.draw.building.delete', 'info', { removed, total: 0 });
        } else if (removed > 0) {
          emitLog(id, 'log.draw.building.delta', 'info', { added, removed, total: oldCount + added - removed });
        } else {
          emitLog(id, 'log.draw.building.incremental', 'info', { added, total: oldCount + added });
        }
      } else {
        emitLog(id, 'log.draw.building', 'info', { unique: totalDrawings, total: parsed.drawings });
      }
      const result = buildDrawingFont(
        newDrawings,
        parsed.existingSubsetFontBuffer,
        parsed.subsetReferencedChars,
        id,
        drawFontFamily,
        (cur, total) => emitProgress(id, 'draw', cur, total),
        fileName
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

  function libassWeightScore(fontWeight, requestedWeight) {
    return Math.abs(fontWeight - requestedWeight);
  }
  function selectBestFont(candidates, requestedWeight, requestedItalic) {
    let best = null, bestScore = Infinity;
    for (const c of candidates) {
      const wScore = libassWeightScore(c.weight || 400, requestedWeight);
      const iScore = (!!c.isItalic === !!requestedItalic) ? 0 : 10000;
      const score = wScore + iScore;
      if (score < bestScore) { bestScore = score; best = c; }
    }
    return best;
  }
  const subsetFontGroup = async (charInfo, fontNameStr) => {
    const candidates = fonts.filter(f => f.matchedFor.toLowerCase() === fontNameStr.toLowerCase());
    if (candidates.length === 0) {
      emitLog(id, 'log.font.missing', 'warn', { name: fontNameStr, weight: 'normal' });
      return;
    }
    if (!options.wantMultiWeight) {
      const allChars = Array.from(new Set([
        ...(charInfo.normal || []),
        ...(charInfo.bold || []),
        ...(charInfo.italic || []),
        ...(charInfo.boldItalic || [])
      ]));
      if (allChars.length === 0) return;
      const best = selectBestFont(candidates, 400, false);
      if (!best) return;
      emitLog(id, 'log.font.subsetting', 'info', { name: fontNameStr, weight: 'normal', chars: allChars.length });
      try {
        const result = await subsetFont(best.buffer, allChars, fontNameStr, best.isTTC, 'normal', best.ttcIndex, id, options.wantAscii, options.wantFullFont);
        embeddedFonts.push({ name: fontNameStr, ttf: result.ttf, usedChars: result.usedChars, weight: best.weight, weightSlot: 'normal' });
        emitLog(id, 'log.font.subset_done', 'ok', { name: fontNameStr, weight: 'normal', origKB: (result.origSize / 1024).toFixed(0), newKB: (result.ttf.length / 1024).toFixed(0), pct: ((1 - result.ttf.length / result.origSize) * 100).toFixed(0), skipped: result.skipped });
      } catch (e) {
        emitLog(id, 'log.font.subset_fail', 'err', { name: fontNameStr, error: e.message });
      }
      return;
    }
    const weightSlots = [
      { key: 'normal', chars: charInfo.normal || [], reqW: 400, reqI: false },
      { key: 'bold', chars: charInfo.bold || [], reqW: 700, reqI: false },
      { key: 'italic', chars: charInfo.italic || [], reqW: 400, reqI: true },
      { key: 'boldItalic', chars: charInfo.boldItalic || [], reqW: 700, reqI: true },
    ];
    const fileKeyFor = (c) => (c.file?.name || c.name || '') + '::' + (c.ttcIndex ?? -1);
    const libassScore = (c, reqW, reqI) => Math.abs((c.weight || 400) - reqW) + (!!c.isItalic === !!reqI ? 0 : 10000);
    const slotBestMap = new Map();
    for (const slot of weightSlots) {
      if (slot.chars.length === 0) continue;
      let best = null, bestScore = Infinity;
      for (const c of candidates) {
        const s = libassScore(c, slot.reqW, slot.reqI);
        if (s < bestScore) { bestScore = s; best = c; }
      }
      if (!best) continue;
      slotBestMap.set(slot.key, { candidate: best, slot, score: bestScore });
    }
    const fileMap = new Map();
    for (const [slotKey, { candidate, slot }] of slotBestMap) {
      const fk = fileKeyFor(candidate);
      if (!fileMap.has(fk)) fileMap.set(fk, { candidate, slots: [] });
      fileMap.get(fk).slots.push(slot);
    }
    const hasExactItalicMatch = candidates.some(c => c.isItalic);
    if (!hasExactItalicMatch && fileMap.size > 1) {
      const slotOrder = { normal: 0, bold: 1, italic: 2, boldItalic: 3 };
      const italicFallbackKeys = ['italic', 'boldItalic'];
      for (const italicSlotKey of italicFallbackKeys) {
        const entry = slotBestMap.get(italicSlotKey);
        if (!entry) continue;
        const italicFk = fileKeyFor(entry.candidate);
        const otherFileKey = Array.from(fileMap.keys()).find(fk => fk !== italicFk);
        if (!otherFileKey) continue;
        fileMap.get(italicFk).slots = fileMap.get(italicFk).slots.filter(s => s.key !== italicSlotKey);
        const targetGroup = fileMap.get(otherFileKey);
        if (!targetGroup.slots.some(s => s.key === italicSlotKey)) {
          const mergeIntoSlot = italicSlotKey === 'boldItalic'
            ? (targetGroup.slots.find(s => s.key === 'bold') || targetGroup.slots[0])
            : (targetGroup.slots.find(s => s.key === 'normal') || targetGroup.slots[0]);
          if (mergeIntoSlot) {
            const italicChars = entry.slot.chars;
            const existing = mergeIntoSlot.chars;
            mergeIntoSlot.chars = Array.from(new Set([...existing, ...italicChars]));
          }
        }
        if (fileMap.get(italicFk).slots.length === 0) fileMap.delete(italicFk);
      }
    }
    for (const [, { candidate, slots }] of fileMap) {
      const mergedChars = Array.from(new Set(slots.flatMap(s => s.chars)));
      if (mergedChars.length === 0) continue;
      const slotOrder = { normal: 0, bold: 1, italic: 2, boldItalic: 3 };
      const primarySlot = slots.reduce((a, b) => (slotOrder[a.key] ?? 9) <= (slotOrder[b.key] ?? 9) ? a : b);
      const wLabel = primarySlot.key;
      emitLog(id, 'log.font.subsetting', 'info', { name: fontNameStr, weight: wLabel, chars: mergedChars.length });
      try {
        const result = await subsetFont(candidate.buffer, mergedChars, fontNameStr, candidate.isTTC, primarySlot.key, candidate.ttcIndex, id, options.wantAscii, options.wantFullFont);
        embeddedFonts.push({ name: fontNameStr, ttf: result.ttf, usedChars: result.usedChars, weight: candidate.weight, weightSlot: primarySlot.key });
        emitLog(id, 'log.font.subset_done', 'ok', { name: fontNameStr, weight: wLabel, origKB: (result.origSize / 1024).toFixed(0), newKB: (result.ttf.length / 1024).toFixed(0), pct: ((1 - result.ttf.length / result.origSize) * 100).toFixed(0), skipped: result.skipped });
      } catch (e) {
        emitLog(id, 'log.font.subset_fail', 'err', { name: fontNameStr, error: e.message });
      }
    }
  };

  const unresolvableRandBases = new Set();
  if (parsed.randMapMissing && parsed.embeddedFonts) {
    const isRandFontNameLocal = (n) => /^[A-Z]{7,8}$/.test(n);
    for (const embName of Object.keys(parsed.embeddedFonts)) {
      const baseEmbName = embName.replace(/(_B0|_I0|_BI0|_0)\.ttf$/i, '');
      if (isAnyDrawFont(baseEmbName)) continue;
      if (isRandFontNameLocal(baseEmbName) && !parsed.randFontMap?.[baseEmbName]) {
        unresolvableRandBases.add(baseEmbName.toLowerCase());
      }
    }
  }
  if (options.wantFont) {
    const extFonts = parsed.externalFonts;
    const fontNames = Object.keys(extFonts);
    if (fontNames.length === 0) emitLog(id, 'log.font.none_external', 'info', {});
    for (const fontName of fontNames) await subsetFontGroup(extFonts[fontName], fontName);
  }
  if (options.wantSystemFont && parsed.systemFontsReferenced) {
    for (const fontName of Object.keys(parsed.systemFontsReferenced))
      await subsetFontGroup(parsed.systemFontsReferenced[fontName], fontName);
  }
  const finalEmbeddedFonts = [];
  const processedNames = new Set();
  const strippedNames = [];
  embeddedFonts.forEach(ef => {
    finalEmbeddedFonts.push(ef);
    const n = ef.name.toLowerCase();
    processedNames.add(n + '_0.ttf');
    processedNames.add(n + '_b0.ttf');
    processedNames.add(n + '_i0.ttf');
    processedNames.add(n + '_bi0.ttf');
  });
  if (parsed.embeddedFonts) {
    for (const [name, lines] of Object.entries(parsed.embeddedFonts)) {
      const slotMatch = name.match(/^(.+?)(_B0|_I0|_BI0|_0)\.ttf$/i);
      const baseName = slotMatch ? slotMatch[1] : name.replace(/_\d+\.ttf$/i, '');
      const slotSuffix = slotMatch ? slotMatch[2].toUpperCase() : '_0';
      const weightSlotFromName = slotSuffix === '_B0' ? 'bold' : slotSuffix === '_I0' ? 'italic' : slotSuffix === '_BI0' ? 'boldItalic' : 'normal';
      const baseNameLower = baseName.toLowerCase();
      if (isAnyDrawFont(baseNameLower)) continue;
      if (processedNames.has(name.toLowerCase())) continue;
      if (unresolvableRandBases.has(baseNameLower)) {
        if (options.wantStrip) continue;
      } else if (options.wantStrip) {
        if (!strippedNames.includes(baseName)) strippedNames.push(baseName);
        continue;
      }
      try {
        const buf = assUUDecode(lines);
        finalEmbeddedFonts.push({ name: baseName, ttf: buf, weightSlot: weightSlotFromName });
        processedNames.add(name.toLowerCase());
      } catch (_) { }
    }
  }

  if (!options.wantDraw && !drawTTF && parsed.hasExistingDrawSubset && parsed.existingSubsetFontBuffer) {
    drawTTF = new Uint8Array(parsed.existingSubsetFontBuffer);
  }
  const pureOriginalText = text.startsWith('\uFEFF') ? text.slice(1) : text;
  emitLog(id, 'log.rewrite.start', 'info', {});
  const APP_VERSION = (function () {
    if (typeof document !== 'undefined') {
      const m = document.querySelector('meta[name="version"]');
      if (m) return m.getAttribute('content') || '2.6';
    }
    return '2.6';
  })();
  let randFontNames = null;
  let rewriteRandFontNames = null;
  const freshlySubsettedNames = new Set(embeddedFonts.map(ef => ef.name.replace(/(_B|_I|_BI)$/, '')));

  if (options.wantRandFont && !options.wantStrip) {
    const usedNames = new Set();
    randFontNames = [];

    const oldOrigToRand = {};
    if (parsed.hasRandFonts && !parsed.randMapMissing) {
      for (const [r, o] of Object.entries(parsed.randFontMap)) {
        oldOrigToRand[o.toLowerCase()] = r;
        usedNames.add(r);
      }
    }

    for (const orig of freshlySubsettedNames) {
      if (isAnyDrawFont(orig.toLowerCase())) continue;
      let rand;
      const origLower = orig.toLowerCase();

      if (oldOrigToRand[origLower]) {
        rand = oldOrigToRand[origLower];
      } else {
        do { rand = genRandFontName(); } while (usedNames.has(rand));
        usedNames.add(rand);
      }
      randFontNames.push({ orig, rand });
    }

    const origToRandMap = new Map(randFontNames.map(e => [e.orig.toLowerCase(), e]));

    for (const ef of finalEmbeddedFonts) {
      const baseName = ef.name.replace(/(_B|_I|_BI)$/, '');
      const isFresh = freshlySubsettedNames.has(baseName) || freshlySubsettedNames.has(baseName.toLowerCase());
      
      if (isFresh) {
        const entry = origToRandMap.get(baseName.toLowerCase());
        if (entry) {
          const newBaseName = ef.name.replace(new RegExp('^' + entry.orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), entry.rand);
          const mapLine = `FontSubsetMap: {original: ${entry.orig}, subset: ${entry.rand}, ass-subset: ${APP_VERSION}}`;
          const descEntry = { en: `${mapLine}; ASS Subsetter (${PROJECT_URL})` };
          ef.ttf = repairFontBuffer(new Uint8Array(modifyNameTable(ef.ttf.buffer, {
            fontFamily: { en: entry.rand },
            preferredFamily: { en: entry.rand },
            fullName: { en: entry.rand },
            postScriptName: { en: entry.rand.replace(/\s+/g, '') },
            description: descEntry,
          })));
          ef.name = newBaseName;
        }
      } else {
        const oldRand = Object.keys(parsed.randFontMap || {}).find(r => parsed.randFontMap[r].toLowerCase() === baseName.toLowerCase());
        if (oldRand) {
          ef.name = ef.name.replace(new RegExp('^' + parsed.randFontMap[oldRand].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), oldRand);
        }
      }
    }

    for (const [r, o] of Object.entries(parsed.randFontMap || {})) {
      if (!randFontNames.some(e => e.orig.toLowerCase() === o.toLowerCase())) {
        randFontNames.push({ orig: o, rand: r });
      }
    }

    if (randFontNames.length > 0) emitLog(id, 'log.font.rand_applied', 'info', { count: randFontNames.filter(e => freshlySubsettedNames.has(e.orig) || freshlySubsettedNames.has(e.orig.toLowerCase())).length });
    rewriteRandFontNames = randFontNames;
  } else if (!options.wantStrip && parsed.hasRandFonts) {
    randFontNames = [];
    rewriteRandFontNames = [];
    for (const [r, o] of Object.entries(parsed.randFontMap || {})) {
      const origLower = o.toLowerCase();
      if (freshlySubsettedNames.has(o) || freshlySubsettedNames.has(origLower)) {
        rewriteRandFontNames.push({ rand: r, orig: o, restoring: true });
      } else {
        randFontNames.push({ orig: o, rand: r });
      }
    }
    for (const ef of finalEmbeddedFonts) {
      const baseName = ef.name.replace(/(_B|_I|_BI)$/, '');
      const isFresh = freshlySubsettedNames.has(baseName) || freshlySubsettedNames.has(baseName.toLowerCase());
      if (!isFresh) {
        const oldRand = Object.keys(parsed.randFontMap || {}).find(r => parsed.randFontMap[r].toLowerCase() === baseName.toLowerCase());
        if (oldRand) {
          ef.name = ef.name.replace(new RegExp('^' + parsed.randFontMap[oldRand].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), oldRand);
        }
      }
    }
  } else if (options.wantStrip && parsed.hasRandFonts && Object.keys(parsed.randFontMap || {}).length > 0) {
    rewriteRandFontNames = Object.entries(parsed.randFontMap).map(([rand, orig]) => ({ rand, orig, restoring: true }));
    for (const ef of finalEmbeddedFonts) {
      const entry = rewriteRandFontNames.find(e => e.rand.toLowerCase() === ef.name.replace(/(_B|_I|_BI)$/, '').toLowerCase());
      if (entry) ef.name = ef.name.replace(new RegExp('^' + entry.rand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), entry.orig);
    }
  }
  const retainRawFonts = [];
  if (options.wantStrip && unresolvableRandBases.size > 0 && parsed.embeddedFonts) {
    for (const [name, lines] of Object.entries(parsed.embeddedFonts)) {
      const slotMatch = name.match(/^(.+?)(_B0|_I0|_BI0|_0)\.ttf$/i);
      const baseName = slotMatch ? slotMatch[1] : name.replace(/_\d+\.ttf$/i, '');
      if (unresolvableRandBases.has(baseName.toLowerCase())) {
        retainRawFonts.push({ name, lines });
      }
    }
  }

  const finalText = rewriteASS(pureOriginalText, {
    drawingDataToChar: drawingDataToChar,
    drawFontFamily,
    drawTTF,
    embeddedFonts: finalEmbeddedFonts,
    drawCharRemap: drawCharRemap,
    targetNewline: parsed.detectedNewline,
    wantStrip: options.wantStrip,
    activeRandMap: randFontNames,
    randFontNames: rewriteRandFontNames,
    retainRawFonts,
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
    fontBuffers.push({ name: ef.name, buffer: ef.ttf.buffer, isDrawing: false, weight: ef.weight, weightSlot: ef.weightSlot || 'normal', usedChars: ef.usedChars || null });
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
      strippedNames,
    },
    detailedDrawings: options.wantDraw ? Array.from(parsed.uniqueDrawings.values()).map(d => ({
      char: drawMap.get(d.data) || d.char,
      count: d.count,
      firstStart: d.firstStart, firstEnd: d.firstEnd,
      lastStart: d.lastStart, lastEnd: d.lastEnd
    })) : []
  };
}
self.onmessage = async function (e) {
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
        const result = await doConvert(e.data, id);
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