#!/usr/bin/env python3
"""
Create Instagram Reel with text overlays using moviepy 2.x
"""

from moviepy import VideoFileClip, TextClip, CompositeVideoClip
import os

BASE_DIR = "/Users/eddy/clawd/starnberg-events/instagram"
FONT_PATH = "/Users/eddy/clawd/starnberg-events/public/fonts/space-grotesk-700.ttf"
FONT_REGULAR = "/Users/eddy/clawd/starnberg-events/public/fonts/space-grotesk-500.ttf"

# Load the family walk video
print("Loading video...")
video = VideoFileClip(f"{BASE_DIR}/hd-video-family-walk.mp4")

# Get video dimensions
w, h = video.size
print(f"Video size: {w}x{h}, duration: {video.duration:.1f}s")

# Create text clips - moviepy 2.x syntax
def make_text(txt, font_size=80, color='white', font=FONT_PATH):
    return TextClip(
        text=txt, 
        font_size=font_size, 
        color=color, 
        font=font,
        stroke_color='black', 
        stroke_width=2
    )

print("Creating text overlays...")

# Main headline - staggered appearance
headline1 = make_text("DIESES", font_size=80, color='white')
headline1 = headline1.with_position(('center', h*0.12)).with_start(0.3).with_duration(2.5)

headline2 = make_text("WOCHENENDE", font_size=80, color='white')  
headline2 = headline2.with_position(('center', h*0.22)).with_start(0.6).with_duration(2.2)

headline3 = make_text("AM SEE", font_size=80, color='#FFB347')  # Orange
headline3 = headline3.with_position(('center', h*0.32)).with_start(0.9).with_duration(1.9)

# Subtext
subtext = make_text("Events für Familien", font_size=36, color='white', font=FONT_REGULAR)
subtext = subtext.with_position(('center', h*0.80)).with_start(2.0).with_duration(3.5)

# Branding
brand = make_text("pöcking-events.de", font_size=32, color='#64D2C8', font=FONT_REGULAR)
brand = brand.with_position(('center', h*0.90)).with_start(3.0).with_duration(2.5)

# Date badge
date_text = make_text("7.-8. FEB", font_size=24, color='white', font=FONT_REGULAR)
date_text = date_text.with_position((w*0.72, h*0.04)).with_start(0).with_duration(video.duration)

# Composite
print("Compositing...")
final = CompositeVideoClip([
    video,
    headline1,
    headline2, 
    headline3,
    subtext,
    brand,
    date_text
])

# Write output
output_path = f"{BASE_DIR}/reel-wochenende.mp4"
print(f"Rendering to {output_path}...")
final.write_videofile(output_path, codec='libx264', audio=False, fps=24, logger=None)

print(f"\n✅ Reel created: {output_path}")
print(f"   Duration: {video.duration:.1f}s")
print(f"   Size: {os.path.getsize(output_path) / 1024 / 1024:.1f} MB")
