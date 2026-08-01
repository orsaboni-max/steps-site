# -*- coding: utf-8 -*-
"""מודעת נערות בסגנון 'זוהר/בוטיק': Heebo דק + לבן + צל רך + קו מפריד + CTA במסגרת. 4:5 safe-zone."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from bidi.algorithm import get_display

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, 'mom-base.png')
LOGO = os.path.join(HERE, '..', 'steps-logo-white-hq.png')
FONT = os.path.join(HERE, '..', 'fonts', 'Heebo.ttf')
OUT  = os.path.join(HERE, 'ad-nearot-glow-4x5.png')
WHITE = (255, 255, 255)

def he(t): return get_display(t)
def font(size, weight='Regular'):
    f = ImageFont.truetype(FONT, size)
    try: f.set_variation_by_name(weight)
    except Exception: pass
    return f

def soft_text(img, cx, y_top, text, fnt, fill=WHITE, blur=12, sh=6):
    """white text with a soft blurred shadow (the 'glow/boutique' look, no harsh stroke)."""
    bb = ImageDraw.Draw(img).textbbox((0, 0), text, font=fnt)
    w, h = bb[2]-bb[0], bb[3]-bb[1]
    x = cx - w/2 - bb[0]
    sl = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sl).text((x, y_top - bb[1] + sh), text, font=fnt, fill=(0, 0, 0, 150))
    img.alpha_composite(sl.filter(ImageFilter.GaussianBlur(blur)))
    ImageDraw.Draw(img).text((x, y_top - bb[1]), text, font=fnt, fill=fill)
    return h

def scrim(im, top):
    W, H = im.size; g = Image.new("L", (1, H), 0)
    for yy in range(H):
        a = max(0, 1-yy/(H*0.45)) if top else max(0, (yy-H*0.70)/(H*0.30))
        g.putpixel((0, yy), int((115 if top else 145)*a))
    return Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), im, g.resize((W, H)))

im = Image.open(BASE).convert("RGB")
im = scrim(im, True); im = scrim(im, False); im = im.convert("RGBA")
W, H = im.size; cx = W//2

# logo (white, transparent)
logo = Image.open(LOGO).convert("RGBA")
lw = int(W*0.44); lh = int(logo.height*lw/logo.width)
im.alpha_composite(logo.resize((lw, lh)), ((W-lw)//2, int(H*0.07)))

# title — Heebo SemiBold, soft shadow
y = int(H*0.205)
y += soft_text(im, cx, y, he("פילאטיס מכשירים לנערות"), font(88, 'SemiBold')) + 36

# thin divider
dl = int(W*0.28)
ImageDraw.Draw(im).line([cx-dl//2, y, cx+dl//2, y], fill=(255, 255, 255, 210), width=3)
y += 36

# subtitle — Heebo Light, with separator
soft_text(im, cx, y, he("נתניה פולג  |  גילאי 12–15"), font(52, 'Light'), blur=9, sh=4)

# CTA — thin outline pill (elegant, not heavy gold fill)
cta = he("לתיאום אימון היכרות"); cf = font(50, 'Regular')
d = ImageDraw.Draw(im); bb = d.textbbox((0, 0), cta, font=cf); tw, th = bb[2]-bb[0], bb[3]-bb[1]
by = int(H*0.85); px, py = 72, 36
d.rounded_rectangle([cx-tw//2-px, by-py-th//2, cx+tw//2+px, by+py-th//2+th], radius=100, outline=(255, 255, 255, 235), width=4)
soft_text(im, cx, by-th//2, cta, cf, blur=6, sh=3)

im.convert("RGB").save(OUT, quality=95)
print("saved", OUT, im.size)
