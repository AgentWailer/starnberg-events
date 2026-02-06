#!/usr/bin/env python3
"""
Create multiple Instagram post variants
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os

BASE_DIR = "/Users/eddy/clawd/starnberg-events/instagram"
FONT_DIR = "/Users/eddy/clawd/starnberg-events/public/fonts"

def load_font(name, size):
    font_map = {
        "bold": f"{FONT_DIR}/space-grotesk-700.ttf",
        "semibold": f"{FONT_DIR}/space-grotesk-600.ttf", 
        "medium": f"{FONT_DIR}/space-grotesk-500.ttf",
        "regular": f"{FONT_DIR}/space-grotesk-400.ttf",
    }
    return ImageFont.truetype(font_map.get(name, font_map["regular"]), size)

WIDTH = 1080
HEIGHT = 1350

def load_and_crop(path):
    img = Image.open(path).convert("RGBA")
    img_ratio = img.width / img.height
    target_ratio = WIDTH / HEIGHT
    if img_ratio > target_ratio:
        new_height = HEIGHT
        new_width = int(HEIGHT * img_ratio)
    else:
        new_width = WIDTH
        new_height = int(WIDTH / img_ratio)
    img = img.resize((new_width, new_height), Image.LANCZOS)
    left = (new_width - WIDTH) // 2
    top = (new_height - HEIGHT) // 2
    return img.crop((left, top, left + WIDTH, top + HEIGHT))

# === VARIANT 1: Minimal/Clean (Aerial) ===
print("Creating Variant 1: Minimal Clean...")
img1 = load_and_crop(f"{BASE_DIR}/flux-aerial.webp")
draw1 = ImageDraw.Draw(img1)

# Just a simple, elegant text at bottom
font_big = load_font("bold", 64)
font_small = load_font("regular", 28)

# Add slight gradient at bottom
for y in range(HEIGHT - 250, HEIGHT):
    alpha = int(150 * ((y - (HEIGHT - 250)) / 250) ** 1.2)
    draw1.rectangle([(0, y), (WIDTH, y + 1)], fill=(0, 0, 0, alpha))

draw1.text((60, HEIGHT - 180), "Stille finden.", font=font_big, fill=(255, 255, 255))
draw1.text((60, HEIGHT - 105), "Dieses Wochenende am See.", font=font_small, fill=(220, 220, 220))
draw1.text((60, HEIGHT - 60), "pöcking-events.de", font=load_font("medium", 22), fill=(150, 200, 200))

img1.convert("RGB").save(f"{BASE_DIR}/variant-minimal.png", quality=95)
print("  ✓ variant-minimal.png")

# === VARIANT 2: Bold/Typographic (Magical) ===
print("Creating Variant 2: Bold Typographic...")
img2 = load_and_crop(f"{BASE_DIR}/flux-magical.webp")
draw2 = ImageDraw.Draw(img2)

# Big stacked text
font_huge = load_font("bold", 140)
font_med = load_font("medium", 36)

# Light overlay for readability
overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 60))
img2 = Image.alpha_composite(img2, overlay)
draw2 = ImageDraw.Draw(img2)

draw2.text((50, 100), "DIESES", font=font_huge, fill=(255, 255, 255))
draw2.text((50, 250), "WOCHEN", font=font_huge, fill=(255, 255, 255))
draw2.text((50, 400), "ENDE", font=font_huge, fill=(255, 180, 100))

# Bottom info
draw2.text((50, HEIGHT - 120), "Willi live · Montgolfiade · Theater", font=font_med, fill=(255, 255, 255))
draw2.text((50, HEIGHT - 70), "7.-8. Februar  |  pöcking-events.de", font=load_font("regular", 24), fill=(200, 200, 200))

img2.convert("RGB").save(f"{BASE_DIR}/variant-bold.png", quality=95)
print("  ✓ variant-bold.png")

# === VARIANT 3: Story/Quote Style (Original family) ===
print("Creating Variant 3: Quote Style...")
img3 = load_and_crop(f"{BASE_DIR}/flux-test-family.webp")

# Warm it up
img3 = ImageEnhance.Color(img3).enhance(1.1)

draw3 = ImageDraw.Draw(img3)

# Add cinematic bars top and bottom
bar_height = 80
draw3.rectangle([(0, 0), (WIDTH, bar_height)], fill=(0, 0, 0, 255))
draw3.rectangle([(0, HEIGHT - bar_height), (WIDTH, HEIGHT)], fill=(0, 0, 0, 255))

# Quote in center of top bar
quote_font = load_font("medium", 26)
quote = '"Die schönsten Momente teilt man."'
quote_bbox = draw3.textbbox((0, 0), quote, font=quote_font)
quote_x = (WIDTH - (quote_bbox[2] - quote_bbox[0])) // 2
draw3.text((quote_x, 25), quote, font=quote_font, fill=(255, 255, 255))

# Info in bottom bar
info_font = load_font("regular", 22)
draw3.text((50, HEIGHT - 55), "7.-8. Feb · Events für Familien", font=info_font, fill=(200, 200, 200))
draw3.text((WIDTH - 250, HEIGHT - 55), "pöcking-events.de", font=info_font, fill=(255, 180, 100))

img3.convert("RGB").save(f"{BASE_DIR}/variant-quote.png", quality=95)
print("  ✓ variant-quote.png")

# === VARIANT 4: Gradient Overlay Modern ===
print("Creating Variant 4: Gradient Modern...")
img4 = load_and_crop(f"{BASE_DIR}/flux-magical.webp")

# Create colorful gradient overlay
gradient = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
grad_draw = ImageDraw.Draw(gradient)

for y in range(HEIGHT):
    # Purple to orange gradient
    r = int(80 + (175 * y / HEIGHT))
    g = int(20 + (80 * y / HEIGHT))  
    b = int(140 - (60 * y / HEIGHT))
    alpha = int(100 * (1 - abs(y - HEIGHT/2) / (HEIGHT/2)) ** 0.5)
    grad_draw.rectangle([(0, y), (WIDTH, y + 1)], fill=(r, g, b, alpha))

img4 = Image.alpha_composite(img4, gradient)
draw4 = ImageDraw.Draw(img4)

# Modern text layout
font_title = load_font("bold", 72)
font_sub = load_font("medium", 32)

draw4.text((WIDTH//2 - 200, 80), "WOCHENENDE", font=font_title, fill=(255, 255, 255))
draw4.text((WIDTH//2 - 100, 160), "AM SEE", font=font_title, fill=(255, 200, 120))

# Bottom card
card_y = HEIGHT - 200
draw4.rounded_rectangle([(40, card_y), (WIDTH - 40, HEIGHT - 40)], radius=20, fill=(0, 0, 0, 150))
draw4.text((70, card_y + 30), "Willi Weitzel live  ·  Montgolfiade  ·  Theater", font=load_font("semibold", 26), fill=(255, 255, 255))
draw4.text((70, card_y + 75), "Sa + So  ·  7.-8. Februar 2026", font=load_font("regular", 22), fill=(200, 200, 200))
draw4.text((70, card_y + 115), "pöcking-events.de", font=load_font("medium", 24), fill=(255, 180, 100))

img4.convert("RGB").save(f"{BASE_DIR}/variant-gradient.png", quality=95)
print("  ✓ variant-gradient.png")

print("\n✅ All 4 variants created!")
