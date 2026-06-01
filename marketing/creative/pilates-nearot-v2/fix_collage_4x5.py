# -*- coding: utf-8 -*-
"""ממיר את קולאז' Gemini (3:4) ל-4:5 בלי לחתוך כלום — מוסיף שוליים עדינים בצדדים.
גם מייצר תמונת בדיקה שמראה מה הפיד היה חותך מה-3:4 המקורי."""
from PIL import Image, ImageDraw

SRC = r'C:/Users/USER/Downloads/Gemini_Generated_Image_b71auvb71auvb71a.png'
OUT = 'ad-nearot-collage-4x5.png'
CHK = '_crop-check.png'

src = Image.open(SRC).convert('RGB')
W, H = src.size            # 1792 x 2390  (3:4)

# --- crop-check: what FB 4:5 feed would cut from the 3:4 ---
ch = int(round(W * 5 / 4))         # 2240 = 4:5 height at this width
top = (H - ch) // 2                # 75 px cut top, 75 px cut bottom
chk = src.copy()
ov = Image.new('RGBA', (W, top), (255, 0, 0, 110))
chk.paste(Image.blend(chk.crop((0, 0, W, top)), Image.new('RGB',(W,top),(255,0,0)), 0.45), (0, 0))
chk.paste(Image.blend(chk.crop((0, top+ch, W, H)), Image.new('RGB',(W,H-(top+ch)),(255,0,0)), 0.45), (0, top+ch))
d = ImageDraw.Draw(chk)
d.line([0, top, W, top], fill=(255, 0, 0), width=10)
d.line([0, top+ch, W, top+ch], fill=(255, 0, 0), width=10)
chk.save(CHK)
print('crop-check saved:', CHK, '| FB would cut top', top, 'px and bottom', top, 'px (~%.1f%% each)' % (100*top/H))

# --- fix: pad sides to reach 4:5 (nothing cut) ---
target_w = int(round(H * 4 / 5))   # 1912
pad = (target_w - W) // 2          # 60 px each side
# sample background color (cream) from a few corners, average
pts = [(4,4),(W-5,4),(4,H-5),(W-5,H-5)]
cols = [src.getpixel(p) for p in pts]
bg = tuple(sum(c[i] for c in cols)//len(cols) for i in range(3))
canvas = Image.new('RGB', (target_w, H), bg)
canvas.paste(src, (pad, 0))
canvas.save(OUT, quality=95)
print('fixed saved:', OUT, '| new size', canvas.size, '| ratio %.3f (4:5=0.800)' % (target_w/H), '| pad', pad, 'px each side, bg', bg)
