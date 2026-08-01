# -*- coding: utf-8 -*-
"""מייצר preview רשמי של מטא לקולאז' המתוקן — פיד + סטורי + אינסטגרם — בלי לגעת במודעה החיה.
מעלה את התמונה (asset בלבד), קורא את ה-spec הקיים, ומבקש generatepreviews. שומר preview.html."""
import os, sys, json, urllib.request, urllib.parse, webbrowser

TOKEN_FILE = r'C:/Users/USER/meta-token-temp.txt'
t = open(TOKEN_FILE, encoding='utf-8-sig').read().strip()
API = 'https://graph.facebook.com/v21.0/'
ACT = 'act_9773300439396945'
OLD_CREATIVE = '1053694076980391'
HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, 'ad-nearot-collage-4x5.png')

def g(path, params):
    params['access_token'] = t
    return json.load(urllib.request.urlopen(API + path + '?' + urllib.parse.urlencode(params), timeout=40))

# 1) upload image asset (does NOT touch the live ad)
import requests
with open(IMG, 'rb') as f:
    r = requests.post(API + ACT + '/adimages', files={'filename': (os.path.basename(IMG), f, 'image/png')},
                      data={'access_token': t}, timeout=120).json()
if 'images' not in r:
    print('upload failed:', json.dumps(r, ensure_ascii=False)[:400]); sys.exit(1)
new_hash = list(r['images'].values())[0]['hash']
# save hash so the swap step reuses it (no double upload)
open(os.path.join(HERE, '_collage_hash.txt'), 'w').write(new_hash)
print('uploaded. hash:', new_hash)

# 2) read existing spec, swap image only
c = g(OLD_CREATIVE, {'fields': 'object_story_spec'})
spec = c['object_story_spec']
spec['link_data']['image_hash'] = new_hash
creative_param = json.dumps({'object_story_spec': spec}, ensure_ascii=False)

# 3) generate previews for feed + story + instagram
FORMATS = [('פיד פייסבוק', 'MOBILE_FEED_STANDARD'),
           ('סטורי / Reels', 'INSTAGRAM_STORY'),
           ('פיד אינסטגרם', 'INSTAGRAM_STANDARD')]
iframes = []
for label, fmt in FORMATS:
    try:
        res = g(ACT + '/generatepreviews', {'creative': creative_param, 'ad_format': fmt})
        body = res['data'][0]['body']
        iframes.append((label, body))
        print('preview OK:', label)
    except Exception as e:
        print('preview FAIL', label, str(e)[:200])
        iframes.append((label, '<p style="color:red">לא נוצר preview: %s</p>' % str(e)[:200]))

# 4) build a single HTML page with all previews side by side
html = '<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>STEPS — תצוגה מקדימה</title>'
html += '<style>body{font-family:Arial;background:#f0f0f0;margin:0;padding:20px}h1{text-align:center}'
html += '.row{display:flex;gap:24px;justify-content:center;flex-wrap:wrap}.col{background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.1)}'
html += '.col h2{text-align:center;font-size:18px;margin:4px 0 12px}</style></head><body>'
html += '<h1>פילאטיס נערות — קולאז\' מתוקן 4:5 — תצוגה מקדימה אמיתית של מטא</h1><div class="row">'
for label, body in iframes:
    html += '<div class="col"><h2>%s</h2>%s</div>' % (label, body)
html += '</div></body></html>'
out = os.path.join(HERE, 'preview.html')
open(out, 'w', encoding='utf-8').write(html)
print('saved:', out)
print('OPENING IN BROWSER...')
os.startfile(out)
