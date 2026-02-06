#!/usr/bin/env python3
"""
Instagram Post Generator für Starnberg Events
Erstellt Wochenend-Highlight Grafiken
"""

from PIL import Image, ImageDraw, ImageFont
import json
from pathlib import Path
from datetime import datetime

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
EVENTS_FILE = PROJECT_DIR / "src/data/events.json"
OUTPUT_DIR = PROJECT_DIR / "instagram"
FONTS_DIR = PROJECT_DIR / "public/fonts"

# Instagram dimensions
FEED_SIZE = (1080, 1080)
STORY_SIZE = (1080, 1920)

# Brand colors (from website)
COLORS = {
    'bg_dark': '#0f172a',      # Dark blue background
    'bg_gradient_top': '#1e3a5f',
    'bg_gradient_bottom': '#0d1f3c',
    'primary': '#14b8a6',       # Teal accent
    'gold': '#fbbf24',          # Gold/highlight
    'text_white': '#f8fafc',
    'text_muted': '#94a3b8',
    'card_bg': '#1e293b',
    'kinder': '#f472b6',        # Pink
    'familie': '#34d399',       # Green
    'erwachsene': '#60a5fa',    # Blue
}

def load_font(name, size):
    """Load Space Grotesk font"""
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

def draw_rounded_rect(draw, xy, radius, fill):
    """Draw a rounded rectangle"""
    x1, y1, x2, y2 = xy
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
    draw.ellipse([x1, y1, x1 + 2*radius, y1 + 2*radius], fill=fill)
    draw.ellipse([x2 - 2*radius, y1, x2, y1 + 2*radius], fill=fill)
    draw.ellipse([x1, y2 - 2*radius, x1 + 2*radius, y2], fill=fill)
    draw.ellipse([x2 - 2*radius, y2 - 2*radius, x2, y2], fill=fill)

def create_gradient_background(size, color_top, color_bottom):
    """Create a vertical gradient background"""
    img = Image.new('RGB', size, color_top)
    draw = ImageDraw.Draw(img)
    
    # Parse colors
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    top = hex_to_rgb(color_top)
    bottom = hex_to_rgb(color_bottom)
    
    for y in range(size[1]):
        ratio = y / size[1]
        r = int(top[0] + (bottom[0] - top[0]) * ratio)
        g = int(top[1] + (bottom[1] - top[1]) * ratio)
        b = int(top[2] + (bottom[2] - top[2]) * ratio)
        draw.line([(0, y), (size[0], y)], fill=(r, g, b))
    
    return img

def truncate_text(text, font, max_width, draw):
    """Truncate text to fit within max_width"""
    if draw.textlength(text, font=font) <= max_width:
        return text
    while len(text) > 0 and draw.textlength(text + "…", font=font) > max_width:
        text = text[:-1]
    return text + "…"

def format_date_german(date_str):
    """Format date to German style"""
    date = datetime.strptime(date_str, "%Y-%m-%d")
    weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    return f"{weekdays[date.weekday()]} {date.day}.{date.month}."

def create_weekend_highlights_post(events, output_path):
    """Create a weekend highlights Instagram post"""
    
    # Create gradient background
    img = create_gradient_background(FEED_SIZE, '#1a365d', '#0f172a')
    draw = ImageDraw.Draw(img)
    
    # Fonts
    font_title = load_font('bold', 52)
    font_subtitle = load_font('medium', 28)
    font_event_title = load_font('semibold', 32)
    font_event_meta = load_font('regular', 22)
    font_score = load_font('bold', 36)
    font_footer = load_font('regular', 20)
    
    # Header
    y_offset = 60
    
    # Decorative line
    draw.rectangle([60, y_offset, 120, y_offset + 4], fill=COLORS['primary'])
    y_offset += 20
    
    # Title
    draw.text((60, y_offset), "Wochenend-", font=font_title, fill=COLORS['text_white'])
    y_offset += 60
    draw.text((60, y_offset), "Highlights", font=font_title, fill=COLORS['gold'])
    y_offset += 70
    
    # Subtitle with date
    if events:
        first_date = datetime.strptime(events[0]['date'], "%Y-%m-%d")
        date_range = f"{first_date.day}.–{first_date.day + 1}. Februar 2026"
        draw.text((60, y_offset), date_range, font=font_subtitle, fill=COLORS['text_muted'])
    y_offset += 60
    
    # Event cards
    card_height = 130
    card_padding = 16
    card_margin = 14
    max_events = 5
    
    for i, event in enumerate(events[:max_events]):
        card_y = y_offset + i * (card_height + card_margin)
        
        # Card background
        draw_rounded_rect(draw, 
            (40, card_y, FEED_SIZE[0] - 40, card_y + card_height), 
            radius=16, 
            fill=COLORS['card_bg']
        )
        
        # Score badge (if AI curation exists)
        score = event.get('aiCuration', {}).get('scores', {}).get('overall', 0)
        if score > 0:
            badge_x = 60
            badge_y = card_y + 20
            badge_w = 56
            badge_h = 56
            
            # Score background
            score_color = COLORS['primary'] if score >= 8 else COLORS['gold'] if score >= 6 else COLORS['text_muted']
            draw_rounded_rect(draw, 
                (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h),
                radius=12,
                fill=score_color
            )
            
            # Score text
            score_text = str(score)
            score_bbox = draw.textbbox((0, 0), score_text, font=font_score)
            score_w = score_bbox[2] - score_bbox[0]
            draw.text(
                (badge_x + (badge_w - score_w) // 2, badge_y + 8),
                score_text,
                font=font_score,
                fill=COLORS['bg_dark']
            )
            
            content_x = badge_x + badge_w + 16
        else:
            content_x = 60 + card_padding
        
        # Event title
        title = event.get('title', 'Event')
        title = truncate_text(title, font_event_title, FEED_SIZE[0] - content_x - 60, draw)
        draw.text(
            (content_x, card_y + card_padding + 4),
            title,
            font=font_event_title,
            fill=COLORS['text_white']
        )
        
        # Date & Time
        date_str = format_date_german(event.get('date', ''))
        time_str = event.get('time', '')
        meta_text = f"{date_str}"
        if time_str:
            meta_text += f" · {time_str} Uhr"
        
        draw.text(
            (content_x, card_y + card_padding + 44),
            meta_text,
            font=font_event_meta,
            fill=COLORS['text_muted']
        )
        
        # Location
        location = event.get('location', '')
        if location:
            location = truncate_text(f"📍 {location}", font_event_meta, FEED_SIZE[0] - content_x - 80, draw)
            draw.text(
                (content_x, card_y + card_padding + 74),
                location,
                font=font_event_meta,
                fill=COLORS['text_muted']
            )
        
        # Category badge
        category = event.get('category', '')
        if category:
            cat_colors = {
                'kinder': COLORS['kinder'],
                'familie': COLORS['familie'],
                'erwachsene': COLORS['erwachsene']
            }
            cat_labels = {
                'kinder': 'KINDER',
                'familie': 'FAMILIE',
                'erwachsene': 'ERWACHSENE'
            }
            cat_color = cat_colors.get(category, COLORS['text_muted'])
            cat_label = cat_labels.get(category, category.upper())
            
            cat_font = load_font('semibold', 16)
            cat_bbox = draw.textbbox((0, 0), cat_label, font=cat_font)
            cat_w = cat_bbox[2] - cat_bbox[0] + 16
            cat_x = FEED_SIZE[0] - 60 - cat_w
            cat_y = card_y + card_padding + 8
            
            draw_rounded_rect(draw,
                (cat_x, cat_y, cat_x + cat_w, cat_y + 24),
                radius=12,
                fill=cat_color + '33'  # Won't work with PIL, use alternative
            )
            # Simple rectangle as fallback
            draw.rounded_rectangle(
                (cat_x, cat_y, cat_x + cat_w, cat_y + 24),
                radius=8,
                outline=cat_color,
                width=2
            )
            draw.text(
                (cat_x + 8, cat_y + 2),
                cat_label,
                font=cat_font,
                fill=cat_color
            )
    
    # Footer
    footer_y = FEED_SIZE[1] - 80
    draw.line([(60, footer_y), (FEED_SIZE[0] - 60, footer_y)], fill=COLORS['card_bg'], width=1)
    
    draw.text(
        (60, footer_y + 20),
        "starnberg-events.pages.dev",
        font=font_footer,
        fill=COLORS['text_muted']
    )
    
    draw.text(
        (FEED_SIZE[0] - 60 - draw.textlength("🔗 Link in Bio", font=font_footer), footer_y + 20),
        "🔗 Link in Bio",
        font=font_footer,
        fill=COLORS['primary']
    )
    
    # Save
    OUTPUT_DIR.mkdir(exist_ok=True)
    img.save(output_path, 'PNG', quality=95)
    print(f"✅ Saved: {output_path}")
    return output_path

def main():
    # Load events
    with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Filter weekend events (Feb 7-8, 2026)
    weekend_events = [
        e for e in data['events']
        if e.get('date') in ['2026-02-07', '2026-02-08']
    ]
    
    # Sort by AI score
    weekend_events.sort(
        key=lambda e: e.get('aiCuration', {}).get('scores', {}).get('overall', 0),
        reverse=True
    )
    
    print(f"📅 Found {len(weekend_events)} weekend events")
    
    # Create post
    output_path = OUTPUT_DIR / "weekend-highlights-2026-02-07.png"
    create_weekend_highlights_post(weekend_events, output_path)

if __name__ == "__main__":
    main()
