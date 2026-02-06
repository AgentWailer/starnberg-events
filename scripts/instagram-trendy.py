#!/usr/bin/env python3
"""
TRENDY Instagram Post Generator 2026
Based on research: Candid Camera Roll, Hyper-Individualism, Glass Morphism, Bold Typography
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json
import random
import math
from pathlib import Path
from datetime import datetime

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
EVENTS_FILE = PROJECT_DIR / "src/data/events.json"
OUTPUT_DIR = PROJECT_DIR / "instagram"
FONTS_DIR = PROJECT_DIR / "public/fonts"

FEED_SIZE = (1080, 1080)

# 2026 TRENDY Color Palette - Vibrant but soft
PALETTES = {
    'sunset': {
        'bg1': '#1a1a2e',
        'bg2': '#16213e',
        'accent1': '#ff6b6b',  # Coral
        'accent2': '#feca57',  # Yellow
        'accent3': '#48dbfb',  # Cyan
        'text': '#ffffff',
        'muted': '#a0a0a0',
    },
    'aurora': {
        'bg1': '#0d0d0d',
        'bg2': '#1a1a2e',
        'accent1': '#a855f7',  # Purple
        'accent2': '#06ffa5',  # Mint
        'accent3': '#ff6b9d',  # Pink
        'text': '#ffffff',
        'muted': '#888888',
    },
    'ocean': {
        'bg1': '#0a192f',
        'bg2': '#112240',
        'accent1': '#64ffda',  # Teal
        'accent2': '#f97316',  # Orange
        'accent3': '#818cf8',  # Indigo
        'text': '#e6f1ff',
        'muted': '#8892b0',
    }
}

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def load_font(name, size):
    font_map = {
        'regular': 'space-grotesk-400.ttf',
        'medium': 'space-grotesk-500.ttf',
        'semibold': 'space-grotesk-600.ttf',
        'bold': 'space-grotesk-700.ttf',
    }
    font_path = FONTS_DIR / font_map.get(name, font_map['regular'])
    try:
        return ImageFont.truetype(str(font_path), size)
    except:
        return ImageFont.load_default()

def add_grain(img, intensity=25):
    """Add film grain texture - very trendy in 2026"""
    import random
    pixels = img.load()
    width, height = img.size
    for _ in range(int(width * height * 0.03)):
        x = random.randint(0, width - 1)
        y = random.randint(0, height - 1)
        r, g, b = pixels[x, y][:3]
        noise = random.randint(-intensity, intensity)
        pixels[x, y] = (
            max(0, min(255, r + noise)),
            max(0, min(255, g + noise)),
            max(0, min(255, b + noise))
        )
    return img

def create_gradient_with_glow(size, palette):
    """Create gradient with glowing orbs - very 2026"""
    img = Image.new('RGB', size, hex_to_rgb(palette['bg1']))
    draw = ImageDraw.Draw(img)
    
    bg1 = hex_to_rgb(palette['bg1'])
    bg2 = hex_to_rgb(palette['bg2'])
    
    # Base gradient
    for y in range(size[1]):
        ratio = y / size[1]
        r = int(bg1[0] + (bg2[0] - bg1[0]) * ratio)
        g = int(bg1[1] + (bg2[1] - bg1[1]) * ratio)
        b = int(bg1[2] + (bg2[2] - bg1[2]) * ratio)
        draw.line([(0, y), (size[0], y)], fill=(r, g, b))
    
    # Add glowing orbs (blur circles)
    orb_layer = Image.new('RGBA', size, (0, 0, 0, 0))
    orb_draw = ImageDraw.Draw(orb_layer)
    
    # Random glowing circles
    colors = [palette['accent1'], palette['accent2'], palette['accent3']]
    for i in range(3):
        x = random.randint(0, size[0])
        y = random.randint(0, size[1])
        radius = random.randint(150, 350)
        color = hex_to_rgb(colors[i % len(colors)]) + (40,)  # Low alpha
        orb_draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=color)
    
    # Blur the orbs
    orb_layer = orb_layer.filter(ImageFilter.GaussianBlur(radius=80))
    
    # Composite
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, orb_layer)
    
    return img.convert('RGB')

def draw_glass_card(img, xy, radius=24, blur=True):
    """Draw a glass morphism card - big trend!"""
    x1, y1, x2, y2 = xy
    
    # Create semi-transparent overlay
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # Glass effect - semi-transparent white
    overlay_draw.rounded_rectangle(xy, radius=radius, fill=(255, 255, 255, 20))
    
    # Border glow
    overlay_draw.rounded_rectangle(xy, radius=radius, outline=(255, 255, 255, 60), width=1)
    
    return Image.alpha_composite(img.convert('RGBA'), overlay)

def format_date_short(date_str):
    date = datetime.strptime(date_str, "%Y-%m-%d")
    weekdays = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"]
    return f"{weekdays[date.weekday()]}", f"{date.day}.{date.month}."

def truncate_text(text, font, max_width, draw):
    if draw.textlength(text, font=font) <= max_width:
        return text
    while len(text) > 0 and draw.textlength(text + "…", font=font) > max_width:
        text = text[:-1]
    return text + "…"

def create_trendy_post(events, output_path):
    """Create a super trendy 2026-style Instagram post"""
    
    palette = PALETTES['aurora']  # Use aurora palette
    
    # Create gradient with glowing orbs
    img = create_gradient_with_glow(FEED_SIZE, palette)
    
    # Add glass cards
    img = draw_glass_card(img, (40, 280, FEED_SIZE[0]-40, FEED_SIZE[1]-100))
    
    draw = ImageDraw.Draw(img)
    
    # Fonts - BOLD and expressive
    font_hero = load_font('bold', 72)
    font_hero_accent = load_font('bold', 72)
    font_sub = load_font('medium', 28)
    font_event = load_font('semibold', 30)
    font_meta = load_font('regular', 20)
    font_day = load_font('bold', 18)
    font_small = load_font('regular', 16)
    
    # === HERO TEXT - Bold, stacked ===
    y = 60
    
    # "DIESES" in accent color
    draw.text((50, y), "DIESES", font=font_hero, fill=hex_to_rgb(palette['accent2']))
    y += 75
    
    # "WOCHENENDE" in white
    draw.text((50, y), "WOCHENENDE", font=font_hero, fill=hex_to_rgb(palette['text']))
    y += 85
    
    # Decorative line with gradient effect
    line_y = y + 10
    for i, x in enumerate(range(50, 400, 3)):
        alpha = 255 - int((i / 120) * 200)
        color = hex_to_rgb(palette['accent1'])
        draw.rectangle([x, line_y, x+2, line_y+4], fill=color)
    
    # Date subtitle
    y += 30
    draw.text((50, y), "7. – 8. FEB '26  ·  STARNBERGER SEE", 
              font=font_sub, fill=hex_to_rgb(palette['muted']))
    
    # === EVENT CARDS ===
    card_start_y = 320
    card_height = 110
    card_gap = 12
    max_events = 5
    
    for i, event in enumerate(events[:max_events]):
        card_y = card_start_y + i * (card_height + card_gap)
        
        # Score on the left - big and bold
        score = event.get('aiCuration', {}).get('scores', {}).get('overall', 0)
        
        if score >= 8:
            score_color = palette['accent2']  # Gold for high scores
        elif score >= 6:
            score_color = palette['accent1']  # Purple for mid
        else:
            score_color = palette['accent3']  # Pink for others
        
        # Score number - HUGE
        if score > 0:
            score_font = load_font('bold', 48)
            draw.text((65, card_y + 15), str(score), font=score_font, 
                      fill=hex_to_rgb(score_color))
            draw.text((65, card_y + 65), "/10", font=font_small, 
                      fill=hex_to_rgb(palette['muted']))
            content_x = 140
        else:
            content_x = 65
        
        # Day badge
        weekday, date_num = format_date_short(event.get('date', '2026-02-07'))
        
        # Draw day badge with accent background
        badge_color = hex_to_rgb(palette['accent1']) if weekday == "SA" else hex_to_rgb(palette['accent3'])
        draw.rounded_rectangle(
            [content_x, card_y + 12, content_x + 36, card_y + 32],
            radius=6,
            fill=badge_color
        )
        draw.text((content_x + 6, card_y + 12), weekday, font=font_day, 
                  fill=hex_to_rgb(palette['bg1']))
        
        # Time
        time_str = event.get('time', '')
        if time_str:
            draw.text((content_x + 45, card_y + 12), time_str, font=font_meta,
                      fill=hex_to_rgb(palette['muted']))
        
        # Event title - BOLD
        title = event.get('title', 'Event')
        title = truncate_text(title, font_event, FEED_SIZE[0] - content_x - 80, draw)
        draw.text((content_x, card_y + 40), title, font=font_event,
                  fill=hex_to_rgb(palette['text']))
        
        # Location with emoji
        location = event.get('location', '')
        if location:
            location_text = f"📍 {location}"
            location_text = truncate_text(location_text, font_meta, FEED_SIZE[0] - content_x - 80, draw)
            draw.text((content_x, card_y + 75), location_text, font=font_meta,
                      fill=hex_to_rgb(palette['muted']))
        
        # Category indicator - small dot
        category = event.get('category', '')
        cat_colors = {
            'kinder': '#ff6b9d',
            'familie': '#06ffa5', 
            'erwachsene': '#48dbfb'
        }
        if category in cat_colors:
            dot_x = FEED_SIZE[0] - 70
            draw.ellipse([dot_x, card_y + 45, dot_x + 16, card_y + 61],
                        fill=hex_to_rgb(cat_colors[category]))
    
    # === FOOTER ===
    footer_y = FEED_SIZE[1] - 75
    
    # URL
    draw.text((50, footer_y), "starnberg-events.pages.dev", 
              font=font_meta, fill=hex_to_rgb(palette['muted']))
    
    # CTA
    cta_text = "LINK IN BIO →"
    cta_x = FEED_SIZE[0] - 50 - draw.textlength(cta_text, font=font_meta)
    draw.text((cta_x, footer_y), cta_text, font=font_meta,
              fill=hex_to_rgb(palette['accent2']))
    
    # Add film grain for that 2026 aesthetic
    img = add_grain(img, intensity=15)
    
    # Save
    OUTPUT_DIR.mkdir(exist_ok=True)
    img.save(output_path, 'PNG', quality=95)
    print(f"✅ Saved trendy post: {output_path}")
    return output_path

def main():
    with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    weekend_events = [
        e for e in data['events']
        if e.get('date') in ['2026-02-07', '2026-02-08']
    ]
    
    weekend_events.sort(
        key=lambda e: e.get('aiCuration', {}).get('scores', {}).get('overall', 0),
        reverse=True
    )
    
    print(f"📅 Found {len(weekend_events)} weekend events")
    
    output_path = OUTPUT_DIR / "weekend-trendy-v2.png"
    create_trendy_post(weekend_events, output_path)

if __name__ == "__main__":
    main()
