#!/usr/bin/env python3
"""
Instagram Post Generator - Jung von Matt Style
Combines Flux hero image with elegant typography overlay
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

# Paths
BASE_DIR = "/Users/eddy/clawd/starnberg-events/instagram"
HERO_IMAGE = f"{BASE_DIR}/flux-test-family.webp"
OUTPUT = f"{BASE_DIR}/weekend-post-final.png"
FONT_DIR = "/Users/eddy/clawd/starnberg-events/public/fonts"

# Load fonts
def load_font(name, size):
    font_map = {
        "bold": f"{FONT_DIR}/space-grotesk-700.ttf",
        "semibold": f"{FONT_DIR}/space-grotesk-600.ttf", 
        "medium": f"{FONT_DIR}/space-grotesk-500.ttf",
        "regular": f"{FONT_DIR}/space-grotesk-400.ttf",
    }
    return ImageFont.truetype(font_map.get(name, font_map["regular"]), size)

# Instagram dimensions (4:5)
WIDTH = 1080
HEIGHT = 1350

# Load and process hero image
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

# Slightly darken and warm up
enhancer = ImageEnhance.Brightness(img)
img = enhancer.enhance(0.85)

# Create gradient overlay (dark at bottom for text)
gradient = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
draw_grad = ImageDraw.Draw(gradient)

# Bottom gradient for text area
for y in range(HEIGHT // 2, HEIGHT):
    alpha = int(180 * ((y - HEIGHT // 2) / (HEIGHT // 2)) ** 1.5)
    draw_grad.rectangle([(0, y), (WIDTH, y + 1)], fill=(0, 0, 0, alpha))

# Top subtle gradient for hook
for y in range(0, 200):
    alpha = int(120 * (1 - y / 200) ** 2)
    draw_grad.rectangle([(0, y), (WIDTH, y + 1)], fill=(0, 0, 0, alpha))

img = Image.alpha_composite(img, gradient)

# Draw
draw = ImageDraw.Draw(img)

# Colors
WHITE = (255, 255, 255)
GOLD = (255, 200, 100)
TEAL = (100, 210, 200)

# === TOP: Emotional Hook ===
hook_font = load_font("bold", 52)
hook_text = "Dieses Wochenende"
hook_bbox = draw.textbbox((0, 0), hook_text, font=hook_font)
hook_x = (WIDTH - (hook_bbox[2] - hook_bbox[0])) // 2
draw.text((hook_x, 45), hook_text, font=hook_font, fill=WHITE)

subhook_font = load_font("medium", 32)
subhook_text = "am Starnberger See"
subhook_bbox = draw.textbbox((0, 0), subhook_text, font=subhook_font)
subhook_x = (WIDTH - (subhook_bbox[2] - subhook_bbox[0])) // 2
draw.text((subhook_x, 105), subhook_text, font=subhook_font, fill=TEAL)

# === BOTTOM: Events ===
events = [
    {
        "title": "Willi live – Und wovon träumst du?",
        "details": "Sa 15:00 · BecCult Pöcking",
        "highlight": True
    },
    {
        "title": "Montgolfiade Tegernsee",
        "details": "Sa + So ab 8:00 · 25. Jubiläum",
        "highlight": False
    },
    {
        "title": "Theaterzwerge: Die Träne der Elfe",
        "details": "Sa 16:00 · Herrsching",
        "highlight": False
    },
]

y_pos = 920
title_font = load_font("semibold", 36)
details_font = load_font("regular", 26)

for event in events:
    # Colored bullet instead of emoji
    bullet_color = GOLD if event.get("highlight") else TEAL
    draw.ellipse([(50, y_pos + 12), (66, y_pos + 28)], fill=bullet_color)
    
    # Title
    title_color = GOLD if event.get("highlight") else WHITE
    draw.text((85, y_pos + 2), event["title"], font=title_font, fill=title_color)
    
    # Details
    draw.text((85, y_pos + 45), event["details"], font=details_font, fill=(200, 200, 200))
    
    y_pos += 110

# === FOOTER: Branding ===
brand_font = load_font("medium", 24)
brand_text = "pöcking-events.de"
brand_bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
brand_x = (WIDTH - (brand_bbox[2] - brand_bbox[0])) // 2
draw.text((brand_x, HEIGHT - 55), brand_text, font=brand_font, fill=TEAL)

# Subtle top tag
tag_font = load_font("regular", 20)
tag_text = "7. – 8. Februar 2026"
tag_bbox = draw.textbbox((0, 0), tag_text, font=tag_font)
draw.text((WIDTH - tag_bbox[2] - 40, 50), tag_text, font=tag_font, fill=(200, 200, 200, 180))

# Save
img = img.convert("RGB")
img.save(OUTPUT, "PNG", quality=95)
print(f"✓ Saved: {OUTPUT}")
print(f"  Size: {os.path.getsize(OUTPUT) / 1024:.0f} KB")
