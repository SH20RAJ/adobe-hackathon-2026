#!/usr/bin/env python3
"""
Generate PNG and ICO assets for OmniAudit-GEO:
- public/icon-192.png
- public/icon-512.png
- public/apple-touch-icon.png
- public/favicon.ico
- public/og-image.png
"""

import os

from PIL import Image, ImageDraw, ImageFont

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "omniaudit-geo", "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)


def create_brand_icon(size):
    """Creates an Adobe Spectrum branded icon at the given square size."""
    img = Image.new("RGBA", (size, size), (20, 20, 20, 255))
    draw = ImageDraw.Draw(img)

    # Outer rounded rect
    margin = int(size * 0.12)
    radius = int(size * 0.2)
    inner_box = [margin, margin, size - margin, size - margin]

    # Adobe Red background
    draw.rounded_rectangle(inner_box, radius=radius, fill=(235, 16, 0, 255))

    # Adobe 'A' geometry
    w = size - 2 * margin
    h = size - 2 * margin
    left_x = margin + int(w * 0.18)
    right_x = margin + int(w * 0.82)
    mid_x = size // 2
    top_y = margin + int(h * 0.18)
    bot_y = margin + int(h * 0.82)
    bar_w = int(w * 0.18)

    # Left diagonal leg
    draw.polygon([(mid_x, top_y), (left_x, bot_y), (left_x + bar_w, bot_y)], fill=(255, 255, 255, 255))

    # Right diagonal leg
    draw.polygon([(mid_x, top_y), (right_x, bot_y), (right_x - bar_w, bot_y)], fill=(255, 255, 255, 255))

    # Inner triangle
    tri_w = int(w * 0.16)
    tri_h = int(h * 0.22)
    tri_bot = bot_y - int(h * 0.05)
    draw.polygon(
        [(mid_x, tri_bot - tri_h), (mid_x - tri_w // 2, tri_bot), (mid_x + tri_w // 2, tri_bot)],
        fill=(255, 255, 255, 255),
    )

    # Celery status dot
    dot_r = max(2, int(size * 0.06))
    dot_x = size - margin - dot_r
    dot_y = margin + dot_r
    draw.ellipse(
        [dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
        fill=(39, 194, 129, 255),
        outline=(20, 20, 20, 255),
        width=max(1, int(size * 0.015)),
    )

    return img


def create_og_image():
    """Creates a 1200x630 OpenGraph social share image."""
    w, h = 1200, 630
    img = Image.new("RGBA", (w, h), (20, 20, 20, 255))
    draw = ImageDraw.Draw(img)

    # Radial glow around top-left
    for r in range(400, 0, -20):
        alpha = int(35 * (1 - r / 400))
        draw.ellipse([-100 - r, -100 - r, 300 + r, 300 + r], fill=(235, 16, 0, alpha))

    # Subtle grid lines
    for x in range(0, w, 80):
        draw.line([(x, 0), (x, h)], fill=(30, 30, 30, 80), width=1)
    for y in range(0, h, 80):
        draw.line([(0, y), (w, y)], fill=(30, 30, 30, 80), width=1)

    # Brand logo block
    logo_size = 96
    icon = create_brand_icon(logo_size)
    img.paste(icon, (80, 80), icon)

    # Try loading system font or fallback
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/SFPro-Bold.otf", 56)
        font_sub = ImageFont.truetype("/System/Library/Fonts/SFPro-Medium.otf", 26)
        font_small = ImageFont.truetype("/System/Library/Fonts/SFPro-Regular.otf", 18)
        font_mono = ImageFont.truetype("/System/Library/Fonts/SFMono-Bold.otf", 20)
    except (OSError, Exception):
        try:
            font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 56)
            font_sub = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26)
            font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
            font_mono = ImageFont.truetype("/System/Library/Fonts/Courier.dfont", 20)
        except (OSError, Exception):
            font_title = font_sub = font_small = font_mono = ImageFont.load_default()

    # Draw typography
    draw.text((200, 95), "Adobe OmniAudit", font=font_title, fill=(255, 255, 255, 255))
    draw.text((705, 95), "GEO", font=font_title, fill=(235, 16, 0, 255))

    draw.text(
        (80, 220), "Autonomous Brand AI-Readiness & Search Optimization", font=font_sub, fill=(240, 240, 240, 255)
    )
    draw.text(
        (80, 265),
        "Auditing AI Discoverability (ACPI) and On-site Retention (CRS) for Modern Answer Engines",
        font=font_small,
        fill=(160, 160, 160, 255),
    )

    # Feature pill cards
    pills = [
        ("Off-Site ACPI: 94.2/100", (235, 16, 0)),
        ("On-Site CRS: 91.5/100", (39, 194, 129)),
        ("Sub-15ms Edge Latency", (20, 115, 230)),
        ("Model Context Protocol (MCP)", (230, 134, 25)),
    ]

    x_offset = 80
    for text, col in pills:
        box = [x_offset, 340, x_offset + 250, 410]
        draw.rounded_rectangle(box, radius=12, fill=(30, 30, 30, 255), outline=col + (200,), width=2)
        draw.text((x_offset + 20, 362), text, font=font_mono, fill=(255, 255, 255, 255))
        x_offset += 270

    # Bottom footer branding
    draw.line([(80, 530), (w - 80, 530)], fill=(40, 40, 40, 255), width=1)
    draw.text(
        (80, 555),
        "Adobe University Hackathon 2026 · Round 3 CRP · agentskills.io Specification",
        font=font_small,
        fill=(140, 140, 140, 255),
    )
    draw.text((w - 380, 555), "https://omniaudit-geo.shraj.workers.dev", font=font_mono, fill=(235, 16, 0, 255))

    return img


def main():
    print("Generating icons and images...")
    # 1. Icons
    icon_192 = create_brand_icon(192)
    icon_192.save(os.path.join(PUBLIC_DIR, "icon-192.png"))
    print("✓ public/icon-192.png")

    icon_512 = create_brand_icon(512)
    icon_512.save(os.path.join(PUBLIC_DIR, "icon-512.png"))
    print("✓ public/icon-512.png")

    apple_icon = create_brand_icon(180)
    apple_icon.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"))
    print("✓ public/apple-touch-icon.png")

    # 2. Favicon .ico
    icon_32 = create_brand_icon(32)
    icon_32.save(os.path.join(PUBLIC_DIR, "favicon.ico"), format="ICO")
    print("✓ public/favicon.ico")

    # 3. OpenGraph
    og = create_og_image()
    og.save(os.path.join(PUBLIC_DIR, "og-image.png"))
    print("✓ public/og-image.png")

    print("Asset generation complete!")


if __name__ == "__main__":
    main()
