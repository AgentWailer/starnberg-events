#!/usr/bin/env python3
"""
Instagram Post v2 - Editorial Magazine Style
Minimal text, maximum impact, integrated typography
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

# Paths
BASE_DIR = "/Users/eddy/clawd/starnberg-events/instagram"
HERO_IMAGE = f"{BASE_DIR}/flux-test-family.webp"
OUTPUT = f"{BASE_DIR}/weekend-editorial.png"
FONT_DIR = "/Users/eddy/clawd/starnberg-events/public/fonts"

def load_font(name, size):
    font_map = {
        "bold": f"{FONT_DIR}/space-grotesk-700.ttf",
        "semibold": f"{FONT_DIR}/space-grotesk-600.ttf", 
        "medium": f"{FONT_DIR}/space-grotesk-500.ttf",
        "regular": f"{FONT_DIR}/space-grotesk-400.ttf",
    }
    return ImageFont.truetype(font_map.get(name, font_map["regular"]), size)

# Instagram 4:5
WIDTH = 1080
HEIGHT = 1350

# Load hero
img = Image.open(HERO_IMAGE).convert("RGBA")

# Resize to cover
img_ratio = img.width / img.height
target_ratio = WIDTH / HEIGHT
if img_ratio > target_ratio:
    new_height = HEIGHT
    new_width = int(HEIGHT * img_ratio)
else:
    new_width = WIDTH
    new_height = int(WIDTH / img_ratio)
img = img.resize((new_width, new_height), Image.LANCZOS)

# Center crop
left = (new_width - WIDTH) // 2
top = (new_height - HEIGHT) // 2
img = img.crop((left, top, left + WIDTH, top + HEIGHT))

# Warm color grade
enhancer = ImageEnhance.Color(img)
img = enhancer.enhance(1.1)

# === GLASSMORPHISM CARD ===
# Create glass effect at bottom
glass_height = 280
glass_y = HEIGHT - glass_height - 40

# Extract region and blur it
glass_region = img.crop((40, glass_y, WIDTH - 40, glass_y + glass_height))
glass_blur = glass_region.filter(ImageFilter.GaussianBlur(radius=20))

# Create semi-transparent overlay
glass_overlay = Image.new('RGBA', (WIDTH - 80, glass_height), (255, 255, 255, 40))
glass_blur = glass_blur.convert('RGBA')
glass_combined = Image.alpha_composite(glass_blur, glass_overlay)

# Rounded corners effect (simple: just paste)
img.paste(glass_combined, (40, glass_y))

# Draw border on glass
draw = ImageDraw.Draw(img)
draw.rectangle(
    [(40, glass_y), (WIDTH - 40, glass_y + glass_height)],
    outline=(255, 255, 255, 80),
    width=1
)

# === TYPOGRAPHY ===

# Colors
WHITE = (255, 255, 255)
CREAM = (255, 248, 240)
GOLD = (255, 195, 85)

# Top left: Small date tag
date_font = load_font("medium", 22)
draw.text((50, 45), "7. - 8. FEB", font=date_font, fill=WHITE)

# Main headline - BIG, editorial style
# Split across lines for impact
headline_font_big = load_font("bold", 82)
headline_font_small = load_font("regular", 42)

# "Und wovon" - smaller, offset left
draw.text((50, 130), "Und wovon", font=headline_font_small, fill=CREAM)

# "träumst" - BIG
draw.text((50, 175), "träumst", font=headline_font_big, fill=WHITE)

# "du?" - BIG, gold accent
draw.text((50, 265), "du?", font=headline_font_big, fill=GOLD)

# === GLASS CARD CONTENT ===
card_x = 65
card_y = glass_y + 30

# Event title
title_font = load_font("semibold", 34)
draw.text((card_x, card_y), "Willi Weitzel live", font=title_font, fill=WHITE)

# Subtitle
subtitle_font = load_font("regular", 24)
draw.text((card_x, card_y + 45), "Die interaktive Familienshow", font=subtitle_font, fill=CREAM)

# Divider line
draw.line([(card_x, card_y + 90), (card_x + 300, card_y + 90)], fill=(255, 255, 255, 120), width=1)

# Details
details_font = load_font("medium", 26)
draw.text((card_x, card_y + 110), "Sa 15:00", font=details_font, fill=WHITE)
draw.text((card_x + 150, card_y + 110), "BecCult Pöcking", font=details_font, fill=GOLD)

# More events hint
hint_font = load_font("regular", 20)
draw.text((card_x, card_y + 160), "+ Montgolfiade · Theaterzwerge · Schäfflertanz", font=hint_font, fill=(220, 220, 220))

# Bottom branding - subtle
brand_font = load_font("medium", 18)
draw.text((card_x, card_y + 210), "pöcking-events.de", font=brand_font, fill=(180, 180, 180))

# Small accent element top right
draw.ellipse([(WIDTH - 80, 40), (WIDTH - 50, 70)], fill=GOLD)

# Save
img = img.convert("RGB")
img.save(OUTPUT, "PNG", quality=95)
print(f"✓ Saved: {OUTPUT}")
print(f"  Size: {os.path.getsize(OUTPUT) / 1024:.0f} KB")
