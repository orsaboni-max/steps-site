# -*- coding: utf-8 -*-
"""מחליף את תמונת מודעת פילאטיס נערות לגרסה המתוקנת (4:5, safe zone) דרך Graph API.
בטוח: יוצר קריאייטיב חדש ומצביע את המודעה אליו. הישן נשאר. לא מוחק כלום.
אם המבנה מורכב (תמונות נפרדות לכל מיקום) — לא נוגע, רק מדפיס כדי שקלוד ידייק."""
import os, sys, json, urllib.request, urllib.parse, copy

TOK = os.environ.get('META_ADS_ACCESS_TOKEN')
if not TOK:
    print('❌ META_ADS_ACCESS_TOKEN לא נמצא במשתני הסביבה. (זה הטוקן ששמרת.)'); sys.exit(1)

API = 'https://graph.facebook.com/v21.0/'
ACT = 'act_9773300439396945'
AD_ID = '120245072895190590'
OLD_CREATIVE = '1053694076980391'
IMG = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ad-nearot-collage-4x5.png')

if not os.path.exists(IMG):
    print('❌ קובץ התמונה לא נמצא:', IMG); sys.exit(1)

def api_get(path, fields):
    url = API + path + '?' + urllib.parse.urlencode({'fields': fields, 'access_token': TOK})
    return json.load(urllib.request.urlopen(url, timeout=30))

def api_post(path, data):
    body = urllib.parse.urlencode(data).encode()
    return json.load(urllib.request.urlopen(urllib.request.Request(API + path, data=body), timeout=60))

def upload_image(path):
    try:
        import requests
    except ImportError:
        print('❌ צריך להתקין ספרייה: הרץ  pip install requests  ואז הרץ שוב את הסקריפט.'); sys.exit(1)
    with open(path, 'rb') as f:
        r = requests.post(API + ACT + '/adimages',
                          files={'filename': (os.path.basename(path), f, 'image/png')},
                          data={'access_token': TOK}, timeout=120)
    j = r.json()
    if 'images' not in j:
        print('❌ העלאת תמונה נכשלה:', json.dumps(j, ensure_ascii=False)[:400]); sys.exit(1)
    return list(j['images'].values())[0]['hash']

print('1) קורא את המודעה הקיימת...')
c = api_get(OLD_CREATIVE, 'name,object_story_spec,asset_feed_spec')
oss = c.get('object_story_spec')
afs = c.get('asset_feed_spec')
print('   שם הקריאייטיב:', c.get('name'))

simple = bool(oss) and 'link_data' in oss and 'image_hash' in oss['link_data'] and not afs
if not simple:
    print()
    print('⚠️  מבנה מורכב (כנראה תמונות נפרדות לפיד/סטורי). לא נגעתי בכלום.')
    print('⚠️  העתק לקלוד את כל מה שמתחת לשורה הזו:')
    print('----- SPEC START -----')
    print(json.dumps({'object_story_spec': oss, 'asset_feed_spec': afs}, ensure_ascii=False, indent=2))
    print('----- SPEC END -----')
    sys.exit(0)

print('2) מעלה את התמונה המתוקנת...')
new_hash = upload_image(IMG)
print('   הצליח. image_hash:', new_hash)

print('3) בונה קריאייטיב חדש (אותו טקסט + וואטסאפ, תמונה חדשה)...')
new_oss = copy.deepcopy(oss)
new_oss['link_data']['image_hash'] = new_hash
newc = api_post(ACT + '/adcreatives', {
    'name': 'Nearot Pilates COLLAGE 4:5 (safe-zone) 2026-06-01',
    'object_story_spec': json.dumps(new_oss, ensure_ascii=False),
    'access_token': TOK,
})
if 'id' not in newc:
    print('❌ יצירת קריאייטיב נכשלה:', json.dumps(newc, ensure_ascii=False)[:400]); sys.exit(1)
print('   קריאייטיב חדש:', newc['id'])

print('4) מצביע את המודעה לקריאייטיב החדש...')
upd = api_post(AD_ID, {'creative': json.dumps({'creative_id': newc['id']}), 'access_token': TOK})
print('   תוצאה:', json.dumps(upd, ensure_ascii=False))
print()
print('✅ בוצע! המודעה עודכנה לתמונה המתוקנת. תיכנס לבדיקה קצרה של מטא ותחזור לרוץ.')
print('   (אם רוצים — לבטל: מחזירים את המודעה לקריאייטיב', OLD_CREATIVE, ')')
