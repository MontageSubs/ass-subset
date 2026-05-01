#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ============================================================================
# Name: font_name_inspector.py
# Version: 1.1
# Organization: MontageSubs (蒙太奇字幕组)
# Contributors: Meow P (小p)
# License: MIT License
# Source: https://github.com/MontageSubs/ass-subset/scripts/python/
#
# Description / 描述:
#    A diagnostic tool designed to inspect and analyze font metadata,
#    name tables, and structure information from TrueType and TrueType
#    Collection font files.
#    用于诊断和解析字体元数据、名称表和结构信息的工具。
#
# Dependencies / 依赖:
#    - fontTools (pip install fonttools)
#
# Usage / 用法:
#    python font_name_inspector.py [font_file]
#    python font_name_inspector.py font.ttf
#
# Output / 输出:
#    Displays all font tables and detailed name table entries including
#    platform, encoding, language, and text values.
#    显示所有字体表及名称表的详细条目。
#
# ============================================================================

import sys
import os
import re
import struct
from fontTools.ttLib import TTFont
from fontTools.ttLib.ttCollection import TTCollection

PLATFORM = {
    0: "Unicode", 1: "macOS", 2: "ISO", 3: "Windows", 4: "Custom", 5: "UNIX"
}

LANGUAGE = {
    0x0000: "Neutral",
    0x0401: "Arabic (Saudi Arabia)", 0x0801: "Arabic (Iraq)", 0x0C01: "Arabic (Egypt)", 
    0x1001: "Arabic (Libya)", 0x1401: "Arabic (Algeria)", 0x1801: "Arabic (Morocco)", 
    0x1C01: "Arabic (Tunisia)", 0x2001: "Arabic (Oman)", 0x2401: "Arabic (Yemen)", 
    0x2801: "Arabic (Syria)", 0x2C01: "Arabic (Jordan)", 0x3001: "Arabic (Lebanon)", 
    0x3401: "Arabic (Kuwait)", 0x3801: "Arabic (UAE)", 0x3C01: "Arabic (Bahrain)", 
    0x4001: "Arabic (Qatar)", 0x4401: "Arabic (Palestine)",
    0x0402: "Bulgarian", 0x0403: "Catalan", 0x0404: "Chinese (Traditional)",
    0x0405: "Czech", 0x0406: "Danish", 0x0407: "German", 0x0408: "Greek", 
    0x0409: "English (US)", 0x040A: "Spanish", 0x040B: "Finnish", 0x040C: "French", 
    0x040D: "Hebrew", 0x040E: "Hungarian", 0x040F: "Icelandic", 0x0410: "Italian", 
    0x0411: "Japanese", 0x0412: "Korean", 0x0413: "Dutch", 0x0414: "Norwegian (Bokmål)", 
    0x0415: "Polish", 0x0416: "Portuguese (Brazil)", 0x0417: "Romansh", 0x0418: "Romanian", 
    0x0419: "Russian", 0x041A: "Croatian", 0x041B: "Slovak", 0x041C: "Albanian",
    0x041D: "Swedish", 0x041E: "Thai", 0x041F: "Turkish", 0x0420: "Urdu",
    0x0421: "Indonesian", 0x0422: "Ukrainian", 0x0423: "Belarusian", 0x0424: "Slovenian",
    0x0425: "Estonian", 0x0426: "Latvian", 0x0427: "Lithuanian", 0x0428: "Tajik",
    0x0429: "Persian", 0x042A: "Vietnamese", 0x042B: "Armenian", 0x042C: "Azeri (Cyrillic)",
    0x042D: "Basque", 0x042E: "Sorbian", 0x042F: "Macedonian", 0x0430: "Sutu",
    0x0431: "Tsonga", 0x0432: "Tswana", 0x0433: "Venda", 0x0434: "Xhosa",
    0x0435: "Zulu", 0x0436: "Afrikaans", 0x0437: "Georgian", 0x0438: "Faroese",
    0x0439: "Farsi", 0x043A: "Sindhi", 0x043B: "Kashmiri (Perso-Arabic)", 0x043C: "Kashmiri (Devanagari)",
    0x043D: "Nepali (India)", 0x043E: "Nepali", 0x043F: "Punjabi", 0x0440: "Gujarati",
    0x0441: "Oriya", 0x0442: "Tamil", 0x0443: "Telugu", 0x0444: "Kannada",
    0x0445: "Malayalam", 0x0446: "Assamese", 0x0447: "Marathi", 0x0448: "Sanskrit",
    0x0449: "Mongolian (Cyrillic)", 0x044A: "Tibetan", 0x044B: "Welsh", 0x044C: "Khmer",
    0x044D: "Lao", 0x044E: "Burmese", 0x044F: "Galician", 0x0450: "Konkani",
    0x0451: "Manipuri", 0x0453: "Syriac", 0x0454: "Sinhalese", 0x0455: "Cherokee",
    0x0456: "Inuktitut", 0x0457: "Amharic", 0x0458: "Tamazight (Latin)", 0x045B: "Divehi",
    0x045C: "Bashkir", 0x045D: "Luxembourgish", 0x045E: "Uzbek (Cyrillic)", 0x045F: "Uzbek (Latin)",
    0x0460: "Kazakh", 0x0461: "Kyrgyz (Cyrillic)", 0x0462: "Turkmen", 0x0463: "Mongolian (Mongolia)",
    0x0464: "Pashto", 0x0465: "Filipino", 0x0466: "Dhivehi", 0x0467: "Edo",
    0x0468: "Fulah", 0x0469: "Hausa", 0x046A: "Ilocano", 0x046B: "Igbo",
    0x046C: "Kanuri", 0x046D: "Guarani", 0x046E: "Haitian Creole", 0x046F: "Latin",
    0x0470: "Songhai", 0x0471: "Tigrinya", 0x0472: "Tigre", 0x0473: "Geez",
    0x0474: "Sami (Northern)", 0x0475: "Sami (Lule)", 0x0476: "Sami (Southern)", 0x0477: "Sami (Inari)",
    0x0478: "Sami (Skolt)", 0x047C: "Maori", 0x047D: "Mapudungun", 0x047E: "Mohawk",
    0x047F: "Yakut", 0x0480: "Qiche", 0x0481: "Kinyarwanda", 0x0482: "Wolof",
    0x0483: "Dari", 0x0484: "Scottish Gaelic", 0x0485: "Irish Gaelic", 0x0486: "Breton",
    0x0487: "Uyghur", 0x0488: "Mi'kmaq", 0x0489: "Occitan",
    0x0804: "Chinese (Simplified)", 0x0816: "Portuguese (Portugal)", 0x080A: "Spanish (Mexico)",
    0x0C0A: "Spanish (Spain)", 0x0C0C: "French (Canada)", 0x0C51: "Quechua (Peru)",
    0x1004: "Chinese (Singapore)", 0x1009: "English (Canada)", 0x100C: "French (Switzerland)",
    0x1401: "Arabic (Algeria)", 0x1407: "German (Switzerland)", 0x1409: "English (New Zealand)",
    0x140C: "French (Belgium)", 0x1809: "English (Ireland)", 0x180A: "Spanish (Argentina)",
    0x1C09: "English (South Africa)", 0x1C0A: "Spanish (Colombia)", 0x2009: "English (Jamaica)",
    0x200A: "Spanish (Peru)", 0x2409: "English (Caribbean)", 0x240A: "Spanish (Venezuela)",
    0x2809: "English (Belize)", 0x280A: "Spanish (Chile)", 0x2C0A: "Spanish (Ecuador)",
    0x2C09: "English (Trinidad)", 0x3009: "English (Zimbabwe)", 0x300A: "Spanish (Bolivia)",
    0x3409: "English (Philippines)", 0x340A: "Spanish (Paraguay)", 0x3C0A: "Spanish (Uruguay)",
    0x4009: "English (India)", 0x4409: "English (Malaysia)", 0x4809: "English (Singapore)",
}


MAX_COLUMN_WIDTH = 80
SEPARATOR_WIDTH = 100

def extract_version():
    script_path = os.path.abspath(__file__)
    with open(script_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('# Version:'):
                match = re.search(r'# Version:\s*(\S+)', line)
                if match:
                    return match.group(1)
    return "unknown"

VERSION = extract_version()

def check_dependencies():
    try:
        import fontTools.ttLib
    except ImportError:
        print("Error: fontTools is not installed.")
        print("  pip install fontTools")
        sys.exit(1)

class FontAnalyzer:
    def __init__(self, font_path):
        self.font_path = font_path
        self.is_ttc = False
        self.columns_cache = None
        self.validate_file()
    
    def validate_file(self):
        try:
            if not os.path.exists(self.font_path):
                raise FileNotFoundError(f"Font file not found: {self.font_path}")
            
            if not os.access(self.font_path, os.R_OK):
                raise PermissionError(f"Permission denied: {self.font_path}")
            
            with open(self.font_path, 'rb') as f:
                tag = f.read(4)
                if tag == b'ttcf':
                    self.is_ttc = True
        except FileNotFoundError as e:
            print(f"Error: {str(e)}")
            sys.exit(1)
        except PermissionError as e:
            print(f"Error: {str(e)}")
            sys.exit(1)
        except Exception as e:
            print(f"Error: Failed to validate font: {str(e)}")
            sys.exit(1)
    
    def analyze(self):
        try:
            if self.is_ttc:
                self._analyze_ttc()
            else:
                self._analyze_ttf()
        except Exception as e:
            print(f"Error: {str(e)}")
            sys.exit(1)
    
    def _analyze_ttc(self):
        try:
            ttc = TTCollection(self.font_path)
        except struct.error:
            raise RuntimeError("Invalid TTC format")
        except Exception as e:
            raise RuntimeError(f"Failed to load TTC: {str(e)}")
        
        print(f"Font Name Inspector v{VERSION}")
        print("=" * SEPARATOR_WIDTH)
        print(f"Font file: {self.font_path}")
        print(f"Type: TTC Collection ({len(ttc)} fonts)\n")
        
        for i, font in enumerate(ttc):
            print(f"=== Font {i} ===\n")
            self._show_tables(font)
            print()
            self._analyze_name_table(font)
            if i < len(ttc) - 1:
                print("\n" + "=" * SEPARATOR_WIDTH + "\n")
    
    def _analyze_ttf(self):
        try:
            font = TTFont(self.font_path)
        except Exception as e:
            raise RuntimeError(f"Failed to load TTF: {str(e)}")
        
        print(f"Font Name Inspector v{VERSION}")
        print("=" * SEPARATOR_WIDTH)
        print(f"Font file: {self.font_path}")
        print(f"Type: TTF")
        
        self._show_tables(font)
        print()
        self._analyze_name_table(font)
    
    def _show_tables(self, font):
        tables = sorted(font.keys())
        print(f"Total tables: {len(tables)}")
        print("Tables:")
        for table in tables:
            print(f"  {table}")
    
    def _analyze_name_table(self, font):
        if 'name' not in font:
            print("Warning: 'name' table not found")
            return
        
        try:
            name_table = font['name']
            records = sorted(name_table.names, key=lambda x: (x.nameID, x.platformID, x.langID))
        except Exception as e:
            raise RuntimeError(f"Failed to read name table: {str(e)}")
        
        if not records:
            print("Warning: No name records found")
            return
        
        self._cache_active_columns(records)
        values = [[self._get_column_value(col, record) for col in self.columns_cache] for record in records]
        widths = self._calculate_widths(self.columns_cache, values)
        
        print(f"\nname table ({len(records)} entries)\n")
        
        header = " | ".join(f"{col:<{widths[col]}}" for col in self.columns_cache)
        separator = "-" * SEPARATOR_WIDTH
        print(header)
        print(separator)
        
        prev_id = None
        for record, row_values in zip(records, values):
            if prev_id is not None and record.nameID != prev_id:
                print(separator)
            
            row = " | ".join(f"{val:<{widths[col]}}" for col, val in zip(self.columns_cache, row_values))
            print(row)
            prev_id = record.nameID
    
    def _cache_active_columns(self, records):
        if self.columns_cache is not None:
            return
        
        columns = []
        
        if all(hasattr(r, 'nameID') for r in records):
            columns.append('NameID')
        
        if all(hasattr(r, 'platformID') for r in records):
            columns.append('Platform')
        
        if all(hasattr(r, 'platEncID') for r in records):
            columns.append('Encoding')
        
        if all(hasattr(r, 'langID') for r in records):
            columns.append('Language')
        
        if any(hasattr(r, 'varID') and r.varID for r in records):
            columns.append('VarID')
        
        columns.append('Value')
        
        self.columns_cache = columns
    
    def _calculate_widths(self, columns, values):
        widths = {col: min(len(col), MAX_COLUMN_WIDTH) for col in columns}
        for row in values:
            for col, val in zip(columns, row):
                widths[col] = min(max(widths[col], len(val)), MAX_COLUMN_WIDTH)
        return widths
    
    def _get_column_value(self, col, record):
        if col == 'NameID':
            return str(record.nameID)
        elif col == 'Platform':
            return f"{record.platformID} ({PLATFORM.get(record.platformID, '?')})"
        elif col == 'Encoding':
            return str(record.platEncID)
        elif col == 'Language':
            lang_code = hex(record.langID)
            lang_name = LANGUAGE.get(record.langID, "Unknown")
            return f"{lang_code} ({lang_name})"
        elif col == 'VarID':
            return str(getattr(record, 'varID', '-'))
        elif col == 'Value':
            return self._extract_value(record)
        
        return "-"
    
    def _extract_value(self, record):
        try:
            return record.toUnicode()
        except UnicodeDecodeError:
            return f"[UnicodeDecodeError: platform={record.platformID}, encoding={record.platEncID}]"
        except AttributeError:
            return "[ERROR: Unsupported encoding]"
        except Exception as e:
            return f"[ERROR: {type(e).__name__}]"

def main():
    if len(sys.argv) < 2:
        print("Error: Font file not specified.")
        print("Usage: python font_name_inspector.py <font_file>")
        sys.exit(1)
    
    arg = sys.argv[1]
    
    if arg in ['-h', '--help']:
        print(f"Font Name Inspector v{VERSION} - Font Metadata Inspector")
        print("Usage: python font_name_inspector.py <font_file>")
        sys.exit(0)
    
    if arg in ['-v', '--version']:
        print(f"Font Name Inspector v{VERSION}")
        sys.exit(0)
    
    analyzer = FontAnalyzer(arg)
    analyzer.analyze()

if __name__ == '__main__':
    check_dependencies()
    main()
