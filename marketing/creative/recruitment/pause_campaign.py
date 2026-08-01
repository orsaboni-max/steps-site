# -*- coding: utf-8 -*-
"""מכבה (PAUSED) קמפיין דרושים עובדת קבלה דרך Graph API. בטוח: מוודא שם לפני כיבוי, מאמת אחרי."""
import os, sys, json, urllib.request, urllib.parse
t = open(r'C:/Users/USER/meta-token-temp.txt', encoding='utf-8-sig').read().strip()
API = 'https://graph.facebook.com/v21.0/'
CID = '120245448067960590'   # campaign: דרושים עובדת קבלה

def g(path, fields):
    return json.load(urllib.request.urlopen(API + path + '?' + urllib.parse.urlencode({'fields': fields, 'access_token': t}), timeout=30))
def post(path, data):
    data['access_token'] = t
    return json.load(urllib.request.urlopen(urllib.request.Request(API + path, data=urllib.parse.urlencode(data).encode()), timeout=30))

d = g(CID, 'name,effective_status')
name = d.get('name', '')
print('CAMPAIGN:', name)
print('STATUS NOW:', d.get('effective_status'))
if not any(k in name for k in ('דרוש', 'קבל', 'eception', 'ecept', 'Reception')):
    print('STOP: השם לא תואם "דרושים/קבלה" — לא מכבה. בדוק ID ידנית.'); sys.exit(1)

print('--> מכבה (PAUSED)...')
r = post(CID, {'status': 'PAUSED'})
print('result:', json.dumps(r, ensure_ascii=False))

d2 = g(CID, 'name,effective_status')
print('STATUS AFTER:', d2.get('effective_status'))
print('OK - הקמפיין כובה.' if d2.get('effective_status') in ('PAUSED', 'CAMPAIGN_PAUSED', 'ADSET_PAUSED') else 'WARN - בדוק סטטוס')
