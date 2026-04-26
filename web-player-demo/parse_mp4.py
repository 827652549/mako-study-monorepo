#!/usr/bin/env python3
"""
解析 MP4 文件的盒子结构，特别关注 moov 和 mdat 的位置
"""

def parse_boxes(filename):
    """解析 MP4 文件的盒子结构"""
    boxes = []
    with open(filename, 'rb') as f:
        pos = 0
        file_size = len(f.read())
        f.seek(0)

        while pos < file_size:
            # 读取盒子大小 (4 bytes, big-endian)
            size_bytes = f.read(4)
            if len(size_bytes) < 4:
                break

            size = int.from_bytes(size_bytes, byteorder='big')
            # 读取盒子类型 (4 bytes, ASCII)
            type_bytes = f.read(4)
            if len(type_bytes) < 4:
                break

            box_type = type_bytes.decode('ascii', errors='ignore')

            # 处理扩展大小 (当 size == 1 时)
            if size == 1:
                ext_size = int.from_bytes(f.read(8), byteorder='big')
                actual_size = ext_size
            else:
                actual_size = size if size > 0 else file_size - pos

            boxes.append({
                'offset': pos,
                'size': actual_size,
                'type': box_type,
                'hex_offset': f'0x{pos:08X}'
            })

            # 跳过盒子内容
            if actual_size > 8:
                f.seek(pos + actual_size)
            else:
                f.seek(pos + 8)

            pos = f.tell()

            # 只解析前几个和最后几个盒子，避免解析整个大文件
            if pos > 1000 and box_type != 'mdat':
                # 如果我们在 mdat 之后，直接跳到文件末尾找 moov
                f.seek(file_size - 10000)
                pos = f.tell()

    return boxes, file_size

def print_structure(boxes, file_size, filename):
    """打印盒子结构"""
    print(f"\n{'='*60}")
    print(f"文件: {filename}")
    print(f"文件大小: {file_size:,} bytes ({file_size/1024/1024:.2f} MB)")
    print(f"{'='*60}\n")

    # 找出关键盒子的位置
    moov_box = next((b for b in boxes if b['type'] == 'moov'), None)
    mdat_box = next((b for b in boxes if b['type'] == 'mdat'), None)
    ftyp_box = next((b for b in boxes if b['type'] == 'ftyp'), None)

    print("📦 关键盒子位置:")
    print(f"  ftyp: 偏移 {ftyp_box['hex_offset']}, 大小 {ftyp_box['size']} bytes")

    if mdat_box:
        print(f"  mdat: 偏移 {mdat_box['hex_offset']}, 大小 {mdat_box['size']:,} bytes")

    if moov_box:
        print(f"  moov: 偏移 {moov_box['hex_offset']}, 大小 {moov_box['size']:,} bytes")
        moov_percent = (moov_box['offset'] / file_size) * 100
        print(f"         moov 位于文件 {moov_percent:.1f}% 处")

    print("\n📋 完整盒子结构:")
    for i, box in enumerate(boxes):
        if box['type'] in ['ftyp', 'moov', 'mdat', 'free']:
            print(f"  [{i}] {box['hex_offset']:>12} {box['type']:8} {box['size']:>10,} bytes")

    # 判断是否为 fast-start
    if moov_box and mdat_box:
        if moov_box['offset'] < mdat_box['offset']:
            print(f"\n✅ Fast Start: 是 (moov 在 mdat 之前)")
        else:
            print(f"\n❌ Fast Start: 否 (moov 在 mdat 之后，位于文件末尾)")

    return boxes

if __name__ == '__main__':
    files = ['bigmp4-moov-first.mp4', 'bigmp4-moov-end.mp4']

    for filename in files:
        try:
            boxes, file_size = parse_boxes(filename)
            print_structure(boxes, file_size, filename)
        except FileNotFoundError:
            print(f"❌ 文件不存在: {filename}")
