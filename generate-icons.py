#!/usr/bin/env python3
"""
Icon Generator for API Extractor Chrome Extension
Run: python generate-icons.py
"""

from PIL import Image, ImageDraw
import os

def create_icon(size):
    """Create a simple API-themed icon"""
    # Create image with purple background
    img = Image.new('RGBA', (size, size), (102, 126, 234, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw network nodes icon
    line_width = max(1, size // 64)
    node_radius = size // 6
    
    # Positions
    top = (size // 2, size // 4)
    bottom_left = (size // 4, (size * 3) // 4)
    bottom_right = ((size * 3) // 4, (size * 3) // 4)
    
    # Draw lines connecting nodes
    draw.line([top, bottom_left], fill=(255, 255, 255, 255), width=line_width)
    draw.line([top, bottom_right], fill=(255, 255, 255, 255), width=line_width)
    draw.line([bottom_left, bottom_right], fill=(255, 255, 255, 255), width=line_width)
    
    # Draw circles (nodes)
    for pos in [top, bottom_left, bottom_right]:
        x, y = pos
        draw.ellipse(
            [x - node_radius, y - node_radius, x + node_radius, y + node_radius],
            fill=(255, 255, 255, 255)
        )
    
    return img

def main():
    sizes = [16, 48, 128]
    output_dir = os.path.join(os.path.dirname(__file__), 'images')
    
    # Ensure images directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    print("🎨 Generating API Extractor extension icons...\n")
    
    for size in sizes:
        filename = f'icon{size}.png'
        filepath = os.path.join(output_dir, filename)
        
        try:
            img = create_icon(size)
            img.save(filepath, 'PNG')
            print(f"✅ Created {filename} ({size}x{size})")
        except Exception as e:
            print(f"❌ Error creating {filename}: {e}")
    
    print("\n✨ Icon generation complete!")
    print("📌 You can now load the extension in Chrome:")
    print("   1. Go to chrome://extensions/")
    print("   2. Enable 'Developer mode'")
    print("   3. Click 'Load unpacked'")
    print("   4. Select this folder")

if __name__ == '__main__':
    main()
