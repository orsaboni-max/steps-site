# -*- coding: utf-8 -*-
"""שרת תצוגה מקומי: מגיש את הקבצים מהתיקייה (כל עריכה נראית מיד ברענון),
   ומעביר את /api/schedule לשרת החי כדי שמערכת השעות תציג שיעורים אמיתיים."""
import os, urllib.request, urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
UP = "https://stepsnetanya.co.il"
class H(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control','no-store')   # תמיד הגרסה הכי טרייה
        SimpleHTTPRequestHandler.end_headers(self)
    def do_GET(self):
        if self.path.startswith('/api/'):
            try:
                r = urllib.request.urlopen(urllib.request.Request(
                    UP + self.path, headers={'User-Agent':'Mozilla/5.0'}), timeout=25)
                b = r.read()
                self.send_response(200)
                self.send_header('Content-Type','application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(b)))
                self.end_headers(); self.wfile.write(b)
            except Exception as e:
                self.send_response(502); self.end_headers(); self.wfile.write(str(e).encode())
            return
        return SimpleHTTPRequestHandler.do_GET(self)
ThreadingHTTPServer(('127.0.0.1', int(os.environ.get('PORT', 5599))), H).serve_forever()
