#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ============================================================================
# Name: draw_font_inspector.py
# Version: 1.3
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
#    python draw_font_inspector.py [font_file]
#    python draw_font_inspector.py ASSDrawSubset_0.ttf
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

DRAW_TABLE_SCHEMA = [
    {'name': 'data', 'length_type': 'uint16', 'data_type': 'utf8'},
    {'name': 'char', 'length_type': 'uint8', 'data_type': 'utf8'},
    {'name': 'flags', 'length_type': None, 'data_type': 'bitfield', 'size': 1, 'fields': [
        {'name': 'pLevel', 'mask': 0x0F, 'shift': 0},
        {'name': 'hasExplicitClose', 'mask': 0x10, 'shift': 4},
    ]},
]

def print_help():
    print(f"Draw Font Inspector v{VERSION} - Drawing Commands Font Inspector")
    print("\nUsage: python draw_font_inspector.py [options] [font_file]")
    print("\nOptions:")
    print("  -h, --help     Show this help message and exit")
    print("  -v, --version  Show version and exit")
    print("\nArguments:")
    print("  font_file      Path to TTF font file")
    print("                 Default: ASSDrawSubset_0.ttf")
    print("\nExamples:")
    print("  python draw_font_inspector.py")
    print("  python draw_font_inspector.py custom_font.ttf")
    print("  python draw_font_inspector.py -h")

def print_version():
    print(f"Draw Font Inspector v{VERSION}")

def check_dependencies():
    try:
        import fontTools.ttLib
    except ImportError:
        print("Error: fontTools is not installed.")
        print("\nPlease install it with:")
        print("  pip install fontTools")
        sys.exit(1)

def read_length_value(data, offset, length_type):
    if length_type == 'uint16':
        if offset + 2 > len(data):
            return None, None, None
        length = struct.unpack('>H', data[offset:offset+2])[0]
        return length, 2, offset + 2
    elif length_type == 'uint8':
        if offset + 1 > len(data):
            return None, None, None
        length = struct.unpack('B', data[offset:offset+1])[0]
        return length, 1, offset + 1
    return None, None, None

def parse_field(data, offset, field_def):
    field_name = field_def['name']
    length_type = field_def['length_type']
    data_type = field_def['data_type']
    
    if data_type == 'bitfield':
        field_size = field_def['size']
        if offset + field_size > len(data):
            return None, None
        byte_val = struct.unpack('B', data[offset:offset+field_size])[0]
        field_values = {}
        for subfield in field_def['fields']:
            mask = subfield['mask']
            shift = subfield['shift']
            value = (byte_val & mask) >> shift
            if mask == 0x0F:
                field_values[subfield['name']] = value
            else:
                field_values[subfield['name']] = bool(value)
        return field_values, offset + field_size
    
    length, len_header_size, data_offset = read_length_value(data, offset, length_type)
    if length is None:
        return None, None
    
    if data_offset + length > len(data):
        return None, None
    
    field_data = data[data_offset:data_offset+length]
    
    if data_type == 'utf8':
        try:
            field_value = field_data.decode('utf-8')
        except UnicodeDecodeError:
            field_value = field_data.decode('utf-8', errors='replace')
    else:
        field_value = field_data
    
    return field_value, data_offset + length

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
        print("\nUsage: python draw_font_inspector.py [font_file]")
        print(f"       python draw_font_inspector.py -h")
        sys.exit(1)
    
    from fontTools.ttLib import TTFont
    
    try:
        font = TTFont(font_file)
    except Exception as e:
        print(f"Error: Failed to load font file '{font_file}'")
        print(f"Details: {str(e)}")
        sys.exit(1)
    
    print(f"Draw Font Inspector v{VERSION} - Drawing Commands Font Inspector")
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
                entry_data = {}
                entry_offset = offset
                parse_error = False
                
                for field_def in DRAW_TABLE_SCHEMA:
                    field_value, new_offset = parse_field(data, entry_offset, field_def)
                    
                    if field_value is None:
                        print(f"Error: Failed to parse field '{field_def['name']}' at entry {i}, offset {entry_offset}")
                        parse_error = True
                        break
                    
                    entry_data[field_def['name']] = field_value
                    entry_offset = new_offset
                
                if parse_error:
                    break
                
                offset = entry_offset
                
                print(f"Entry {i}:")
                for field_def in DRAW_TABLE_SCHEMA:
                    field_name = field_def['name']
                    if field_def['data_type'] == 'bitfield':
                        field_value = entry_data[field_name]
                        for subfield in field_def['fields']:
                            print(f"  {subfield['name']}: {field_value[subfield['name']]}")
                    else:
                        print(f"  {field_name}: {entry_data[field_name]}")
                print()
        
        except Exception as e:
            print(f"Error: Failed to parse draw table")
            print(f"Details: {str(e)}")
            sys.exit(1)
    else:
        print("\nWarning: draw table not found in this font file")

if __name__ == '__main__':
    check_dependencies()
    main()
