import os
import math
from PIL import Image, ImageDraw, ImageFont
import imageio

# Configuration
WIDTH, HEIGHT = 1920, 1080
FPS = 30
DURATION = 3.5  # seconds (snappy 3.5 seconds instead of 8 seconds)
TOTAL_FRAMES = int(DURATION * FPS)

# Colors
BG_COLOR = (22, 18, 14)          # #16120e - Deep warm chocolate
ACCENT_COLOR = (188, 149, 104)   # #bc9568 - Camel gold
TEXT_COLOR = (250, 246, 240)     # #FAF6F0 - Warm cream

def ease_in_out_cubic(t):
    return 4 * t * t * t if t < 0.5 else 1 - pow(-2 * t + 2, 3) / 2

def generate_frame(frame_num):
    # Create background
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    time = frame_num / FPS
    
    # Try to load a sans-serif font, fallback to default
    try:
        font_large = ImageFont.truetype("segui-black.ttf", 140)
        font_small = ImageFont.truetype("segoeui.ttf", 48)
    except Exception:
        try:
            font_large = ImageFont.truetype("arialbd.ttf", 140)
            font_small = ImageFont.truetype("arial.ttf", 48)
        except Exception:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()

    # Calculate center
    cx, cy = WIDTH // 2, HEIGHT // 2
    
    # 1. Circle expansion animation (0s to 1.5s)
    if time < 1.5:
        progress = min(1.0, time / 1.0)
        eased = ease_in_out_cubic(progress)
        radius = eased * 800
        if radius > 0:
            for r in range(int(radius), int(radius)+4):
                draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=ACCENT_COLOR)
    
    # 2. Main Text fade in (0.8s onwards)
    if time > 0.8:
        text_progress = min(1.0, (time - 0.8) / 1.0)
        text_eased = ease_in_out_cubic(text_progress)
        
        # Interpolate color
        r = int(BG_COLOR[0] + (TEXT_COLOR[0] - BG_COLOR[0]) * text_eased)
        g = int(BG_COLOR[1] + (TEXT_COLOR[1] - BG_COLOR[1]) * text_eased)
        b = int(BG_COLOR[2] + (TEXT_COLOR[2] - BG_COLOR[2]) * text_eased)
        current_text_color = (r, g, b)
        
        text = "MAGTEX"
        try:
            left, top, right, bottom = font_large.getbbox(text)
            tw = right - left
            th = bottom - top
        except:
            tw, th = draw.textsize(text, font=font_large) if hasattr(draw, 'textsize') else (600, 150)
            
        draw.text((cx - tw//2, cy - th//2 - 40), text, font=font_large, fill=current_text_color)
        
        # Subtitle fade in (1.8s onwards)
        if time > 1.8:
            sub_progress = min(1.0, (time - 1.8) / 0.8)
            sub_eased = ease_in_out_cubic(sub_progress)
            
            sr = int(BG_COLOR[0] + (ACCENT_COLOR[0] - BG_COLOR[0]) * sub_eased)
            sg = int(BG_COLOR[1] + (ACCENT_COLOR[1] - BG_COLOR[1]) * sub_eased)
            sb = int(BG_COLOR[2] + (ACCENT_COLOR[2] - BG_COLOR[2]) * sub_eased)
            current_sub_color = (sr, sg, sb)
            
            sub_text = "DISCLOSURE WITHOUT EXPOSURE"
            try:
                sleft, stop, sright, sbottom = font_small.getbbox(sub_text)
                stw = sright - sleft
            except:
                stw = draw.textsize(sub_text, font=font_small)[0] if hasattr(draw, 'textsize') else 800
                
            draw.text((cx - stw//2, cy + 60), sub_text, font=font_small, fill=current_sub_color)
            
    # 3. Fade out at the end (last 0.8s)
    if time > DURATION - 0.8:
        fade_out = min(1.0, (time - (DURATION - 0.8)) / 0.8)
        overlay = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
        img = Image.blend(img, overlay, fade_out)

    import numpy as np
    return np.array(img)

print("Starting video generation...")
output_path = os.path.join("public", "magtex_promo.mp4")

os.makedirs("public", exist_ok=True)

try:
    # Use output_params to move MOOV atom to the beginning (faststart) for web optimization
    writer = imageio.get_writer(
        output_path, 
        fps=FPS, 
        codec='libx264', 
        quality=8, 
        output_params=['-movflags', '+faststart']
    )
    
    for i in range(TOTAL_FRAMES):
        if i % 30 == 0:
            print(f"Generating frame {i}/{TOTAL_FRAMES} ({(i/TOTAL_FRAMES)*100:.1f}%)")
        frame = generate_frame(i)
        writer.append_data(frame)
        
    writer.close()
    print(f"Video successfully generated at {output_path}")
except Exception as e:
    print(f"Error generating video: {e}")
