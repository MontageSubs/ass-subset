#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ============================================================================
# Name: DrawInspector.py
# Version: 1.0
# Organization: MontageSubs (蒙太奇字幕组)
# Contributors: Meow P (小p)
# License: MIT License
# Source: https://github.com/MontageSubs/ass-subset/scripts/python/
#
# Description / 描述:
#    A diagnostic tool designed to inspect and parse drawing commands font 
#    (draw table) embedded in TrueType font files used by ASS Subsetter.
#    Provides detailed analysis of draw table entries, character mappings,
#    and shape metadata for debugging optimized subtitle fonts.
#    用于诊断和解析 ASS Subsetter 中使用的图形指令字体 (draw 表) 的工具。
#    提供 draw 表条目、字符映射和形状元数据的详细分析，用于调试优化后的
#    字幕字体。
#
# Dependencies / 依赖:
#    - fontTools (pip install fonttools)
#
# Usage / 用法:
#    python DrawInspector.py [font_file]
#    python DrawInspector.py ASSDrawSubset_0.ttf
#
# Output / 输出:
#    Displays all font tables and detailed draw table entries including 
#    drawing commands, character mappings, pLevel, and explicit close flags.
#    显示所有字体表及 draw 表的详细条目，包括绘图指令、字符映射、pLevel 
#    和显式关闭标志。
#
# ============================================================================

import sys
import os
import struct
import re

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

def print_help():
    print(f"DrawInspector v{VERSION} - Drawing Commands Font Inspector")
    print("\nUsage: python DrawInspector.py [options] [font_file]")
    print("\nOptions:")
    print("  -h, --help     Show this help message and exit")
    print("  -v, --version  Show version and exit")
    print("\nArguments:")
    print("  font_file      Path to TTF font file")
    print("                 Default: ASSDrawSubset_0.ttf")
    print("\nExamples:")
    print("  python DrawInspector.py")
    print("  python DrawInspector.py custom_font.ttf")
    print("  python DrawInspector.py -h")

def print_version():
    print(f"DrawInspector v{VERSION}")

def check_dependencies():
    try:
        import fontTools.ttLib
    except ImportError:
        print("Error: fontTools is not installed.")
        print("\nPlease install it with:")
        print("  pip install fontTools")
        sys.exit(1)

def main():
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg in ['-h', '--help']:
            print_help()
            sys.exit(0)
        if arg in ['-v', '--version']:
            print_version()
            sys.exit(0)
        font_file = arg
    else:
        font_file = 'ASSDrawSubset_0.ttf'
    
    if not os.path.exists(font_file):
        print(f"Error: Font file '{font_file}' not found.")
        print("\nUsage: python DrawInspector.py [font_file]")
        print(f"       python DrawInspector.py -h")
        sys.exit(1)
    
    from fontTools.ttLib import TTFont
    
    try:
        font = TTFont(font_file)
    except Exception as e:
        print(f"Error: Failed to load font file '{font_file}'")
        print(f"Details: {str(e)}")
        sys.exit(1)
    
    print(f"DrawInspector v{VERSION} - Drawing Commands Font Inspector")
    print("=" * 50)
    print(f"Font file: {font_file}")
    print(f"Total tables: {len(font)}\n")
    
    print("Tables:")
    for table_name in sorted(font.keys()):
        print(f"  {table_name}")
    
    if 'draw' in font:
        print("\n" + "=" * 50)
        print("draw table found")
        print("=" * 50)
        
        try:
            draw_table = font['draw']
            data = draw_table.data
            
            if len(data) < 4:
                print("Error: draw table data too short")
                sys.exit(1)
            
            offset = 0
            entry_count = struct.unpack('>I', data[offset:offset+4])[0]
            print(f"Entry count: {entry_count}\n")
            offset += 4
            
            for i in range(entry_count):
                if offset + 2 > len(data):
                    print(f"Error: Unexpected end of data at entry {i}")
                    break
                
                data_length = struct.unpack('>H', data[offset:offset+2])[0]
                offset += 2
                
                if offset + data_length > len(data):
                    print(f"Error: Insufficient data for entry {i}")
                    break
                
                data_bytes = data[offset:offset+data_length]
                offset += data_length
                
                if offset + 1 > len(data):
                    print(f"Error: Missing char_length at entry {i}")
                    break
                
                char_length = struct.unpack('B', data[offset:offset+1])[0]
                offset += 1
                
                if offset + char_length > len(data):
                    print(f"Error: Insufficient data for char at entry {i}")
                    break
                
                char_bytes = data[offset:offset+char_length]
                offset += char_length
                
                if offset + 1 > len(data):
                    print(f"Error: Missing flags at entry {i}")
                    break
                
                flags = struct.unpack('B', data[offset:offset+1])[0]
                offset += 1
                
                pLevel = flags & 0x0F
                hasExplicitClose = (flags >> 4) & 1
                
                print(f"Entry {i}:")
                print(f"  Data: {data_bytes.decode('utf-8', errors='replace')}")
                print(f"  Char: {char_bytes.decode('utf-8', errors='replace')}")
                print(f"  pLevel: {pLevel}")
                print(f"  hasExplicitClose: {hasExplicitClose}\n")
        
        except Exception as e:
            print(f"Error: Failed to parse draw table")
            print(f"Details: {str(e)}")
            sys.exit(1)
    else:
        print("\nWarning: draw table not found in this font file")

if __name__ == '__main__':
    check_dependencies()
    main()
