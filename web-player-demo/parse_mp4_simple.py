#!/usr/bin/env python3
"""
简化版：只读取文件头部和关键盒子信息
"""

def get_file_boxes(filename):
    """获取文件中的关键盒子"""
    boxes = []
    with open(filename, 'rb') as f:
        file_size = len(f.read())
        f.seek(0)

        # 读取头部盒子
        pos = 0
        while pos < min(2000, file_size):
            f.seek(pos)
            size_bytes = f.read(4)
            if len(size_bytes) < 4:
                break

            size = int.from_bytes(size_bytes, byteorder='big')
            type_bytes = f.read(4)
            if len(type_bytes) < 4:
                break

            box_type = type_bytes.decode('ascii', errors='ignore')

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

            if actual_size > 8:
                pos += actual_size
            else:
                pos += 8

            if box_type == 'mdat' and actual_size > 1000000:
                # 找到 mdat 后，跳到文件末尾找 moov
                break

        # 如果没找到 moov，从文件末尾查找
        if not any(b['type'] == 'moov' for b in boxes):
            f.seek(max(0, file_size - 50000))
            tail_data = f.read(50000)

            # 在尾部数据中查找 moov
            moov_sig = b'moov'
            moov_idx = tail_data.rfind(moov_sig)
            if moov_idx >= 0:
                # moov 前面4字节是大小
                if moov_idx >= 4:
                    moov_size = int.from_bytes(tail_data[moov_idx-4:moov_idx], byteorder='big')
                    moov_offset = file_size - 50000 + moov_idx - 4
                    boxes.append({
                        'offset': moov_offset,
                        'size': moov_size,
                        'type': 'moov',
                        'hex_offset': f'0x{moov_offset:08X}'
                    })

    return boxes, file_size

for filename in ['bigmp4-moov-first.mp4', 'bigmp4-moov-end.mp4']:
    print(f"\n{'='*60}")
    print(f"文件: {filename}")
    print(f"{'='*60}\n")

    boxes, file_size = get_file_boxes(filename)

    moov = next((b for b in boxes if b['type'] == 'moov'), None)
    mdat = next((b for b in boxes if b['type'] == 'mdat'), None)
    ftyp = next((b for b in boxes if b['type'] == 'ftyp'), None)

    print("📦 盒子结构:")
    print(f"  ftyp: {ftyp['hex_offset']} (大小: {ftyp['size']} bytes)")
    if mdat:
        print(f"  mdat: {mdat['hex_offset']} (大小: {mdat['size']:,} bytes)")
    if moov:
        print(f"  moov: {moov['hex_offset']} (大小: {moov['size']:,} bytes)")

    if moov and mdat:
        if moov['offset'] < mdat['offset']:
            print(f"\n✅ Fast Start: 是 (moov 在前)")
        else:
            moov_percent = (moov['offset'] / file_size) * 100
            print(f"\n❌ Fast Start: 否 (moov 在后，位于 {moov_percent:.1f}% 处)")
