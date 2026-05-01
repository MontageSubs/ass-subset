#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ============================================================================
# Name: font_inspector.py
# Version: 1.0.1
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
#    python font_inspector.py [font_file]
#    python font_inspector.py font.ttf
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
    0x0: "Neutral", 0x409: "English (US)", 0x809: "English (UK)", 0xC09: "English (AU)",
    0x404: "Chinese (Trad)", 0x804: "Chinese (Simp)", 0xC04: "Chinese (HK)",
    0x1004: "Chinese (SG)", 0x1404: "Chinese (Macau)", 0x7C04: "Chinese (TW)",
    0x411: "Japanese", 0x412: "Korean", 0x40E: "Hungarian", 0x415: "Polish",
    0x419: "Russian", 0x407: "German", 0xC07: "German (AT)", 0x40C: "French",
    0x80C: "French (BE)", 0xC0C: "French (CA)", 0x100C: "French (CH)",
    0x410: "Italian", 0x810: "Italian (CH)", 0x4009: "English (IN)", 0x1009: "English (CA)",
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
        
        print(f"Font Inspector v{VERSION} - Font Metadata Inspector")
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
        
        print(f"Font Inspector v{VERSION} - Font Metadata Inspector")
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
        print("Usage: python FontInspector.py <font_file>")
        sys.exit(1)
    
    arg = sys.argv[1]
    
    if arg in ['-h', '--help']:
        print(f"Font Inspector v{VERSION} - Font Metadata Inspector")
        print("Usage: python font_inspector.py <font_file>")
        sys.exit(0)
    
    if arg in ['-v', '--version']:
        print(f"Font Inspector v{VERSION}")
        sys.exit(0)
    
    analyzer = FontAnalyzer(arg)
    analyzer.analyze()

if __name__ == '__main__':
    check_dependencies()
    main()
