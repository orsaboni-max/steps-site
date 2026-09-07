#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Build the STEPS social-share (OG) images: real photo + ink scrim + Hebrew title + logo.

No AI. PIL only. Run from the repo root:  python marketing/creative/og/make-og.py
Output: images/og/<page>.jpg  (1200x630, JPEG q82, <=150KB)
"""
import os
from PIL import Image, ImageDraw, ImageFont
from bidi.algorithm import get_display

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
FONT = os.path.join(ROOT, "marketing", "creative", "fonts", "Heebo.ttf")
LOGO = os.path.join(ROOT, "steps-logo-white.png")
OUT = os.path.join(ROOT, "images", "og")

W, H = 1200, 630
INK = (11, 11, 11)
BONE = (244, 242, 237)
YELLOW = (255, 212, 0)
PAD = 64

# page slug -> (source photo, Hebrew title, focal y in 0..1)
PAGES = [
    ("home",        "images/shoot2025/hero-main.jpg",  "סטודיו כושר לנשים בנתניה · פולג", 0.38),
    ("pilates",     "images/shoot2025/gallery-e.jpg",  "פילאטיס מכשירים בנתניה",          0.45),
    ("gym-women",   "images/shoot2025/gym-main.jpg",   "חדר כושר לנשים בנתניה",           0.35),
    ("barre",       "images/shoot2025/move-main.jpg",  "אימון בר בנתניה",                 0.38),
    ("kids",        "images/kids-hero.jpg",            "חוגי כושר לנוער 12–15",           0.35),
    ("nutrition",   "images/nutrition/hero-food.jpg",  "ליווי תזונה · 3 חודשים",          0.45),
    ("price",       "images/shoot2025/hero-main.jpg",  "כמה עולה פילאטיס מכשירים?",       0.45),
    ("or-gym",      "images/shoot2025/gym-alt.jpg",    "פילאטיס או חדר כושר?",            0.42),
    ("postpartum",  "images/shoot2025/pilates-alt.jpg","פילאטיס אחרי לידה",               0.40),
    ("beginners",   "images/shoot2025/gallery-f.jpg",  "השיעור הראשון על רפורמר",         0.40),
]


def cover(path, focal_y):
    """Resize + crop to exactly WxH, keeping the given vertical focal point."""
    im = Image.open(os.path.join(ROOT, path)).convert("RGB")
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    top = min(max(round(im.height * focal_y - H / 2), 0), im.height - H)
    left = (im.width - W) // 2
    return im.crop((left, top, left + W, top + H))


def scrim():
    """Vertical ink gradient: near-solid at the bottom (title), a light veil at the top (logo)."""
    g = Image.new("L", (1, H))
    for y in range(H):
        t = y / (H - 1)
        bottom = min(1.0, (max(t - 0.26, 0) / 0.74) ** 1.35 * 1.12)
        top = max(0.0, 0.42 * (1 - t / 0.22))
        g.putpixel((0, y), int(255 * max(bottom, top)))
    mask = g.resize((W, H))
    layer = Image.new("RGB", (W, H), INK)
    return layer, mask


def wrap(draw, text, font, max_w):
    lines, cur = [], ""
    for word in text.split(" "):
        trial = (cur + " " + word).strip()
        if draw.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


def build(slug, src, title, focal_y):
    img = cover(src, focal_y)
    layer, mask = scrim()
    img = Image.composite(layer, img, mask)
    d = ImageDraw.Draw(img)

    # title: shrink until it fits two lines inside the padded box
    max_w = W - 2 * PAD
    for size in range(72, 39, -2):
        font = ImageFont.truetype(FONT, size)
        lines = wrap(d, title, font, max_w)
        if len(lines) <= 2:
            break
    lh = round(size * 1.24)
    baseline = H - PAD
    y = baseline - lh * len(lines)
    for line in lines:
        d.text((W - PAD, y), get_display(line), font=font, fill=BONE, anchor="ra")
        y += lh

    # yellow rule above the title (RTL: anchored to the right edge)
    rule_y = baseline - lh * len(lines) - 26
    d.rectangle([W - PAD - 96, rule_y - 7, W - PAD, rule_y], fill=YELLOW)

    # logo, top-left — graphic mark, deliberately away from the Hebrew line
    logo = Image.open(LOGO).convert("RGBA")
    lw = 176
    logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    img.paste(logo, (PAD, PAD - 8), logo)

    path = os.path.join(OUT, slug + ".jpg")
    for q in (82, 78, 72, 66):
        img.save(path, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(path) <= 150 * 1024:
            break
    return path, os.path.getsize(path), q


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    sheet = Image.new("RGB", (W // 2 * 2, (H // 2) * 5), INK)
    for i, (slug, src, title, fy) in enumerate(PAGES):
        p, size, q = build(slug, src, title, fy)
        assert size <= 150 * 1024, (p, size)
        print(f"{slug:11s} q{q} {size/1024:6.1f}KB  {src}")
        sheet.paste(Image.open(p).resize((W // 2, H // 2), Image.LANCZOS),
                    ((i % 2) * (W // 2), (i // 2) * (H // 2)))
    sheet.save(os.path.join(ROOT, "marketing", "creative", "og", "contact-sheet.jpg"),
               "JPEG", quality=88, optimize=True)
    print("sheet -> marketing/creative/og/contact-sheet.jpg")
