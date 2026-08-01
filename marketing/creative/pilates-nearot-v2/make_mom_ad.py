# -*- coding: utf-8 -*-
"""בונה מודעת 'אמא' לחוג נערות: תמונת Nano Banana + לוגו STEPS + כותרת + CTA, 4:5 safe-zone."""
import os
from PIL import Image, ImageDraw, ImageFont
from bidi.algorithm import get_display

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, 'mom-base.png')
LOGO = os.path.join(HERE, '..', 'steps-logo-white-hq.png')
OUT  = os.path.join(HERE, 'ad-mom-4x5.png')
GOLD, WHITE, DARK = (228, 194, 122), (255, 255, 255), (17, 17, 17)
FB = "C:/Windows/Fonts/arialbd.ttf"

def he(t): return get_display(t)
def f(s): return ImageFont.truetype(FB, s)
def centered(d, cx, y, t, fnt, fill, stroke=5, sf=(0, 0, 0)):
    bb = d.textbbox((0, 0), t, font=fnt, stroke_width=stroke); w = bb[2]-bb[0]
    d.text((cx-w/2-bb[0], y-bb[1]), t, font=fnt, fill=fill, stroke_width=stroke, stroke_fill=sf)
    return bb[3]-bb[1]
def scrim(im, top):
    W, H = im.size; g = Image.new("L", (1, H), 0)
    for y in range(H):
        a = max(0, 1-y/(H*0.42)) if top else max(0, (y-(H*0.72))/(H*0.28))
        g.putpixel((0, y), int((150 if top else 185)*a))
    return Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), im, g.resize((W, H)))

im = Image.open(BASE).convert("RGB")
im = scrim(im, True); im = scrim(im, False)
im = im.convert("RGBA"); W, H = im.size; cx = W//2

# logo (white transparent) near top, inside safe zone
logo = Image.open(LOGO).convert("RGBA")
lw = int(W*0.48); lh = int(logo.height*lw/logo.width)
im.paste(logo.resize((lw, lh)), ((W-lw)//2, int(H*0.07)), logo.resize((lw, lh)))

d = ImageDraw.Draw(im)
y = int(H*0.22)
y += centered(d, cx, y, he("אמא, חיפשת לבת שלך"), f(82), GOLD) + 18
y += centered(d, cx, y, he("מסגרת משלה?"), f(82), GOLD) + 26
centered(d, cx, y, he("פילאטיס מכשירים לנערות 12–15"), f(56), WHITE)

# CTA pill (bottom safe zone)
cta = he("לתיאום אימון היכרות"); cf = f(58)
bb = d.textbbox((0, 0), cta, font=cf); tw, th = bb[2]-bb[0], bb[3]-bb[1]
by, px, py = int(H*0.85), 66, 34
d.rounded_rectangle([cx-tw//2-px, by-th//2-py, cx+tw//2+px, by+th//2+py], radius=90, fill=GOLD)
d.text((cx-tw/2-bb[0], by-th/2-bb[1]), cta, font=cf, fill=DARK)

im.convert("RGB").save(OUT, quality=95)
print("saved", OUT, im.size)
