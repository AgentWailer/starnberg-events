#!/usr/bin/env python3
"""
Instagram-Bild für Starnberg Events
Thema: Willi Weitzel "Und wovon träumst du?"
Stil: Warm, menschlich, storytelling
"""

from PIL import Image, ImageDraw, ImageFont
import math

# Bildgröße
WIDTH = 1080
HEIGHT = 1080

# Warme Farbpalette
COLORS = {
    'bg_top': (255, 183, 120),      # Warmes Orange
    'bg_bottom': (255, 107, 107),   # Sanftes Korall-Rot
    'silhouette': (60, 40, 50),     # Warmes Dunkelbraun
    'text_main': (255, 255, 255),   # Weiß
    'text_sub': (255, 240, 230),    # Cremeweiß
    'star': (255, 248, 220),        # Warmes Gelb
    'glow': (255, 200, 150, 100),   # Warmes Glühen
}

def create_gradient_bg(draw, width, height):
    """Vertikaler Gradient von warm-orange zu korall"""
    for y in range(height):
        ratio = y / height
        r = int(COLORS['bg_top'][0] + (COLORS['bg_bottom'][0] - COLORS['bg_top'][0]) * ratio)
        g = int(COLORS['bg_top'][1] + (COLORS['bg_bottom'][1] - COLORS['bg_top'][1]) * ratio)
        b = int(COLORS['bg_top'][2] + (COLORS['bg_bottom'][2] - COLORS['bg_top'][2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

def draw_star(draw, x, y, size, color):
    """Zeichnet einen einfachen Stern"""
    points = []
    for i in range(5):
        angle_outer = math.radians(90 + i * 72)
        angle_inner = math.radians(90 + i * 72 + 36)
        
        outer_x = x + size * math.cos(angle_outer)
        outer_y = y - size * math.sin(angle_outer)
        points.append((outer_x, outer_y))
        
        inner_x = x + size * 0.4 * math.cos(angle_inner)
        inner_y = y - size * 0.4 * math.sin(angle_inner)
        points.append((inner_x, inner_y))
    
    draw.polygon(points, fill=color)

def draw_sparkle(draw, x, y, size, color):
    """Zeichnet einen Lichtfunken / Sparkle"""
    # Vertikale Linie
    draw.line([(x, y - size), (x, y + size)], fill=color, width=2)
    # Horizontale Linie
    draw.line([(x - size, y), (x + size, y)], fill=color, width=2)
    # Diagonalen (kürzer)
    small = size * 0.6
    draw.line([(x - small, y - small), (x + small, y + small)], fill=color, width=1)
    draw.line([(x + small, y - small), (x - small, y + small)], fill=color, width=1)

def draw_parent_child_silhouette(draw, center_x, base_y):
    """Zeichnet Silhouetten von Elternteil mit Kind an der Hand"""
    color = COLORS['silhouette']
    
    # Erwachsener (links)
    adult_x = center_x - 60
    adult_head_y = base_y - 180
    
    # Kopf
    draw.ellipse([adult_x - 25, adult_head_y - 25, adult_x + 25, adult_head_y + 25], fill=color)
    
    # Körper
    body_points = [
        (adult_x - 35, adult_head_y + 35),   # Linke Schulter
        (adult_x + 35, adult_head_y + 35),   # Rechte Schulter
        (adult_x + 25, base_y),               # Rechter Fuß
        (adult_x - 25, base_y),               # Linker Fuß
    ]
    draw.polygon(body_points, fill=color)
    
    # Arm nach unten zum Kind
    arm_points = [
        (adult_x + 30, adult_head_y + 50),
        (adult_x + 45, adult_head_y + 50),
        (adult_x + 85, base_y - 70),
        (adult_x + 75, base_y - 70),
    ]
    draw.polygon(arm_points, fill=color)
    
    # Kind (rechts)
    child_x = center_x + 50
    child_head_y = base_y - 100
    
    # Kopf (kleiner)
    draw.ellipse([child_x - 18, child_head_y - 18, child_x + 18, child_head_y + 18], fill=color)
    
    # Körper
    child_body = [
        (child_x - 22, child_head_y + 22),
        (child_x + 22, child_head_y + 22),
        (child_x + 18, base_y),
        (child_x - 18, base_y),
    ]
    draw.polygon(child_body, fill=color)
    
    # Arm nach oben zum Elternteil
    child_arm = [
        (child_x - 20, child_head_y + 30),
        (child_x - 28, child_head_y + 30),
        (child_x - 55, child_head_y - 10),
        (child_x - 45, child_head_y - 15),
    ]
    draw.polygon(child_arm, fill=color)
    
    # Hand-Verbindung (Herz-Detail)
    hand_x = (adult_x + 80 + child_x - 50) // 2
    hand_y = base_y - 75
    draw.ellipse([hand_x - 8, hand_y - 6, hand_x + 8, hand_y + 6], fill=color)

def create_image():
    """Hauptfunktion: Erstellt das Instagram-Bild"""
    
    # Bild erstellen
    img = Image.new('RGB', (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)
    
    # 1. Gradient-Hintergrund
    create_gradient_bg(draw, WIDTH, HEIGHT)
    
    # 2. Dekorative Elemente: Sterne und Sparkles
    star_positions = [
        (180, 150, 25),  # x, y, size
        (850, 200, 20),
        (120, 350, 15),
        (920, 420, 18),
        (300, 250, 12),
        (750, 300, 22),
        (500, 120, 28),  # Großer Stern oben mittig
    ]
    
    for x, y, size in star_positions:
        draw_star(draw, x, y, size, COLORS['star'])
    
    # Sparkles für magischen Effekt
    sparkle_positions = [
        (400, 180, 20),
        (700, 250, 15),
        (250, 280, 12),
        (600, 150, 18),
        (850, 350, 14),
    ]
    
    for x, y, size in sparkle_positions:
        draw_sparkle(draw, x, y, size, COLORS['star'])
    
    # 3. Silhouetten
    draw_parent_child_silhouette(draw, WIDTH // 2, HEIGHT - 180)
    
    # 4. Fonts laden
    font_path_bold = "/Users/eddy/clawd/starnberg-events/public/fonts/space-grotesk-700.ttf"
    font_path_regular = "/Users/eddy/clawd/starnberg-events/public/fonts/space-grotesk-400.ttf"
    font_path_medium = "/Users/eddy/clawd/starnberg-events/public/fonts/space-grotesk-500.ttf"
    
    try:
        font_main = ImageFont.truetype(font_path_bold, 72)
        font_sub = ImageFont.truetype(font_path_medium, 32)
        font_detail = ImageFont.truetype(font_path_regular, 26)
    except:
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_detail = ImageFont.load_default()
    
    # 5. Haupttext: "Wovon träumst du?"
    main_text = "Wovon träumst du?"
    
    # Text-Bounding-Box für Zentrierung
    bbox = draw.textbbox((0, 0), main_text, font=font_main)
    text_width = bbox[2] - bbox[0]
    text_x = (WIDTH - text_width) // 2
    text_y = 450
    
    # Schatten für Tiefe
    draw.text((text_x + 3, text_y + 3), main_text, font=font_main, fill=(80, 50, 50))
    # Haupttext
    draw.text((text_x, text_y), main_text, font=font_main, fill=COLORS['text_main'])
    
    # 6. Sub-Text: Event-Info
    sub_text = "Willi Weitzel live in Pöcking"
    bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
    sub_width = bbox_sub[2] - bbox_sub[0]
    sub_x = (WIDTH - sub_width) // 2
    sub_y = 540
    
    draw.text((sub_x, sub_y), sub_text, font=font_sub, fill=COLORS['text_sub'])
    
    # 7. Detail-Text: Datum und Ort
    detail_text = "Samstag, 7. Februar · 15:00 Uhr · BecCult"
    bbox_detail = draw.textbbox((0, 0), detail_text, font=font_detail)
    detail_width = bbox_detail[2] - bbox_detail[0]
    detail_x = (WIDTH - detail_width) // 2
    detail_y = 590
    
    draw.text((detail_x, detail_y), detail_text, font=font_detail, fill=COLORS['text_sub'])
    
    # 8. Kleiner Call-to-Action unten
    cta_text = "Tickets auf eventim.de"
    bbox_cta = draw.textbbox((0, 0), cta_text, font=font_detail)
    cta_width = bbox_cta[2] - bbox_cta[0]
    cta_x = (WIDTH - cta_width) // 2
    cta_y = HEIGHT - 80
    
    # Kleine Unterstreichung
    draw.rectangle([cta_x - 10, cta_y - 5, cta_x + cta_width + 10, cta_y + 35], 
                   fill=(255, 255, 255, 50), outline=None)
    draw.text((cta_x, cta_y), cta_text, font=font_detail, fill=COLORS['text_main'])
    
    # Bild speichern
    output_path = "/Users/eddy/clawd/starnberg-events/instagram/human-story-v1.png"
    img.save(output_path, "PNG", quality=95)
    print(f"✅ Bild gespeichert: {output_path}")
    
    return img

if __name__ == "__main__":
    create_image()
