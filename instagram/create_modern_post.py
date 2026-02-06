#!/usr/bin/env python3
"""
Instagram Post v3 - SUPER MODERN
Bold typography, glow effects, minimal but impactful
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

# Paths
BASE_DIR = "/Users/eddy/clawd/starnberg-events/instagram"
HERO_IMAGE = f"{BASE_DIR}/flux-magical.webp"
OUTPUT = f"{BASE_DIR}/weekend-modern.png"
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

# Boost saturation slightly
enhancer = ImageEnhance.Color(img)
img = enhancer.enhance(1.15)

# Create glow layer for text
glow_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)

# Main layer
main_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
draw = ImageDraw.Draw(main_layer)

# === COLORS (from image palette) ===
ORANGE = (255, 165, 80)
PINK = (255, 130, 180)
WHITE = (255, 255, 255)
CREAM = (255, 250, 245)

# === GLOW TEXT FUNCTION ===
def draw_glow_text(text, pos, font, color, glow_color, glow_radius=8):
    x, y = pos
    # Draw glow (multiple offset layers)
    for offset in range(glow_radius, 0, -2):
        alpha = int(60 * (1 - offset / glow_radius))
        glow_draw.text((x, y), text, font=font, fill=(*glow_color, alpha))
    # Draw main text
    draw.text(pos, text, font=font, fill=color)

# === TOP: Date pill ===
pill_font = load_font("semibold", 24)
pill_text = "7. - 8. FEBRUAR"
pill_bbox = draw.textbbox((0, 0), pill_text, font=pill_font)
pill_w = pill_bbox[2] - pill_bbox[0] + 40
pill_h = 44
pill_x = (WIDTH - pill_w) // 2
pill_y = 50

# Pill background with glow
for i in range(15, 0, -3):
    alpha = int(40 * (1 - i / 15))
    glow_draw.rounded_rectangle(
        [(pill_x - i, pill_y - i), (pill_x + pill_w + i, pill_y + pill_h + i)],
        radius=22 + i,
        fill=(255, 130, 180, alpha)
    )
draw.rounded_rectangle(
    [(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)],
    radius=22,
    fill=(255, 255, 255, 25),
    outline=(255, 255, 255, 100),
    width=1
)
draw.text((pill_x + 20, pill_y + 10), pill_text, font=pill_font, fill=WHITE)

# === MAIN HEADLINE - HUGE ===
headline_font = load_font("bold", 120)
small_font = load_font("medium", 38)

# "WOVON" - top
draw_glow_text("WOVON", (60, 160), headline_font, WHITE, PINK, 12)

# "TRÄUMST" - middle
draw_glow_text("TRÄUMST", (60, 280), headline_font, WHITE, ORANGE, 12)

# "DU?" - with orange glow
draw_glow_text("DU?", (60, 400), headline_font, ORANGE, ORANGE, 20)

# === BOTTOM INFO BAR ===
bar_y = HEIGHT - 180
bar_height = 140

# Gradient bar background
for y in range(bar_height):
    alpha = int(200 * (y / bar_height) ** 0.5)
    draw.rectangle([(0, bar_y + y), (WIDTH, bar_y + y + 1)], fill=(0, 0, 0, alpha))

# Event info
info_font = load_font("semibold", 32)
detail_font = load_font("regular", 24)

# Main event
draw.text((50, bar_y + 25), "WILLI WEITZEL LIVE", font=info_font, fill=WHITE)
draw.text((50, bar_y + 65), "Sa 15:00  ·  BecCult Pöcking", font=detail_font, fill=CREAM)

# More events - right aligned
more_font = load_font("regular", 20)
more_text = "+ Montgolfiade · Theater · mehr"
more_bbox = draw.textbbox((0, 0), more_text, font=more_font)
draw.text((WIDTH - more_bbox[2] - 50, bar_y + 35), more_text, font=more_font, fill=(200, 200, 200))

# Brand
brand_font = load_font("medium", 22)
brand_text = "pöcking-events.de"
brand_bbox = draw.textbbox((0, 0), brand_text, font=brand_font)
draw.text((WIDTH - brand_bbox[2] - 50, bar_y + 70), brand_text, font=brand_font, fill=ORANGE)

# === COMPOSITE ===
# Apply gaussian blur to glow layer
glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=6))

# Composite: image + glow + main
img = Image.alpha_composite(img, glow_layer)
img = Image.alpha_composite(img, main_layer)

# Save
img = img.convert("RGB")
img.save(OUTPUT, "PNG", quality=95)
print(f"✓ Saved: {OUTPUT}")
print(f"  Size: {os.path.getsize(OUTPUT) / 1024:.0f} KB")
