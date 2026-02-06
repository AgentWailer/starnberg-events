#!/usr/bin/env python3
"""
Create Instagram Reel with multiple clips and text overlays
"""

from moviepy import VideoFileClip, TextClip, CompositeVideoClip, concatenate_videoclips
import os

BASE_DIR = "/Users/eddy/clawd/starnberg-events/instagram"
FONT_PATH = "/Users/eddy/clawd/starnberg-events/public/fonts/space-grotesk-700.ttf"
FONT_REGULAR = "/Users/eddy/clawd/starnberg-events/public/fonts/space-grotesk-500.ttf"

def make_text(txt, font_size=80, color='white', font=FONT_PATH):
    return TextClip(
        text=txt, 
        font_size=font_size, 
        color=color, 
        font=font,
        stroke_color='black', 
        stroke_width=2
    )

print("Loading videos...")

# Load all 4 videos and trim to ~1.5 seconds each
clip1 = VideoFileClip(f"{BASE_DIR}/hd-video-family-walk.mp4").subclipped(0, 1.5)
clip2 = VideoFileClip(f"{BASE_DIR}/hd-video-dandelion.mp4").subclipped(0, 1.5)
clip3 = VideoFileClip(f"{BASE_DIR}/hd-video-balloons.mp4").subclipped(0, 1.5)
clip4 = VideoFileClip(f"{BASE_DIR}/hd-video-picnic.mp4").subclipped(0, 1.5)

# Resize all to same dimensions (take from first clip)
target_size = clip1.size
clip2 = clip2.resized(target_size)
clip3 = clip3.resized(target_size)
clip4 = clip4.resized(target_size)

w, h = target_size
print(f"Target size: {w}x{h}")

# Add text to each clip
print("Adding text overlays...")

# Clip 1: "DIESES"
text1 = make_text("DIESES", font_size=100, color='white')
text1 = text1.with_position(('center', 'center')).with_duration(1.5)
clip1 = CompositeVideoClip([clip1, text1])

# Clip 2: "WOCHENENDE"
text2 = make_text("WOCHENENDE", font_size=90, color='white')
text2 = text2.with_position(('center', 'center')).with_duration(1.5)
clip2 = CompositeVideoClip([clip2, text2])

# Clip 3: "AM SEE"
text3 = make_text("AM SEE", font_size=100, color='#FFB347')
text3 = text3.with_position(('center', 'center')).with_duration(1.5)
clip3 = CompositeVideoClip([clip3, text3])

# Clip 4: Branding
text4a = make_text("7.-8. Februar", font_size=50, color='white')
text4a = text4a.with_position(('center', h*0.35)).with_duration(1.5)
text4b = make_text("pöcking-events.de", font_size=40, color='#64D2C8', font=FONT_REGULAR)
text4b = text4b.with_position(('center', h*0.55)).with_duration(1.5)
clip4 = CompositeVideoClip([clip4, text4a, text4b])

# Concatenate all clips
print("Concatenating clips...")
final = concatenate_videoclips([clip1, clip2, clip3, clip4], method="compose")

# Write output
output_path = f"{BASE_DIR}/reel-multiclip.mp4"
print(f"Rendering to {output_path}...")
final.write_videofile(output_path, codec='libx264', audio=False, fps=24, logger=None)

print(f"\n✅ Multi-clip Reel created: {output_path}")
print(f"   Duration: {final.duration:.1f}s")
print(f"   Size: {os.path.getsize(output_path) / 1024 / 1024:.1f} MB")
