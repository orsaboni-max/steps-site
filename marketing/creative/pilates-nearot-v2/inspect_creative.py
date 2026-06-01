# -*- coding: utf-8 -*-
"""קריאה בלבד: מאמת טוקן + מציג את מבנה הקריאייטיב הקיים. לא משנה כלום."""
import os, json, urllib.request, urllib.parse
t = os.environ.get('META_ADS_ACCESS_TOKEN')
if not t:
    print('NO TOKEN in env'); raise SystemExit(1)
API = 'https://graph.facebook.com/v21.0/'

def g(path, fields=None):
    q = {'access_token': t}
    if fields: q['fields'] = fields
    return json.load(urllib.request.urlopen(API + path + '?' + urllib.parse.urlencode(q), timeout=30))

me = g('me', 'name,id')
print('TOKEN OK — acts as:', me.get('name'), '| id:', me.get('id'))
print('-' * 40)

c = g('1053694076980391', 'name,object_story_spec,asset_feed_spec')
oss = c.get('object_story_spec'); afs = c.get('asset_feed_spec')
print('CREATIVE NAME:', c.get('name'))
print('object_story_spec keys:', list(oss.keys()) if oss else None)
if oss and 'link_data' in oss:
    ld = oss['link_data']
    print('  link_data keys:', list(ld.keys()))
    print('  image_hash present:', 'image_hash' in ld)
    print('  message:', (ld.get('message') or '')[:80])
    print('  call_to_action:', json.dumps(ld.get('call_to_action'), ensure_ascii=False))
print('asset_feed_spec:', 'YES — complex (placement customization)' if afs else 'none — simple')
if afs:
    print('  images:', len(afs.get('images', [])),
          '| customization_rules:', len(afs.get('asset_customization_rules', [])))
print('-' * 40)
print('STRUCTURE:', 'SIMPLE (one image, safe to swap)' if (oss and 'link_data' in oss and 'image_hash' in oss.get('link_data', {}) and not afs) else 'COMPLEX (needs care)')
