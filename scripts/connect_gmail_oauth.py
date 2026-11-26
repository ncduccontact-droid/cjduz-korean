#!/usr/bin/env python3
"""
One-click helper to connect Google Sign-In + 24/7 Gmail OTP Sender (nguyenchiduc2808@gmail.com)
to the live Cloudflare Worker at https://docusync.online
"""
import os
import sys
import json
import webbrowser
import urllib.parse
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler

WEB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(WEB_DIR, ".env")

env = {}
if os.path.exists(ENV_FILE):
    for line in open(ENV_FILE, encoding="utf-8"):
        s = line.strip()
        if s and not s.startswith("#") and "=" in s:
            k, v = s.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID") or env.get("GOOGLE_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GMAIL_CLIENT_SECRET") or env.get("GMAIL_CLIENT_SECRET", "")
CF_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN") or env.get("CLOUDFLARE_API_TOKEN", "")
CF_ACCOUNT = os.environ.get("CLOUDFLARE_ACCOUNT_ID") or env.get("CLOUDFLARE_ACCOUNT_ID", "8428fefdc1f55c3c2b035ac0cb20bee9")

if not CLIENT_ID or not CLIENT_SECRET:
    print("Vui lòng điền GOOGLE_CLIENT_ID và GMAIL_CLIENT_SECRET vào file web/.env trước khi chạy!")
    sys.exit(1)

REDIRECT_URI = "http://localhost:8989/callback"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
    "client_id": CLIENT_ID,
    "redirect_uri": REDIRECT_URI,
    "response_type": "code",
    "scope": "https://www.googleapis.com/auth/gmail.send email profile",
    "access_type": "offline",
    "prompt": "consent",
    "login_hint": "nguyenchiduc2808@gmail.com"
})

auth_code_box = {}


class CallbackHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        if "code" in qs:
            auth_code_box["code"] = qs["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write("<h2>✅ Đã xác thực nguyenchiduc2808@gmail.com thành công! Bạn có thể đóng tab này.</h2>".encode("utf-8"))
        else:
            self.send_response(400)
            self.end_headers()


print("Đang mở trang cấp quyền Google cho nguyenchiduc2808@gmail.com...")
print(AUTH_URL)
webbrowser.open(AUTH_URL)

srv = HTTPServer(("127.0.0.1", 8989), CallbackHandler)
while "code" not in auth_code_box:
    srv.handle_request()

token_req = urllib.request.Request(
    "https://oauth2.googleapis.com/token",
    data=urllib.parse.urlencode({
        "code": auth_code_box["code"],
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    }).encode("utf-8"),
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    method="POST"
)
tok_data = json.loads(urllib.request.urlopen(token_req).read().decode("utf-8"))
refresh_tok = tok_data.get("refresh_token", "")
if not refresh_tok:
    print("Không nhận được refresh_token:", tok_data)
    sys.exit(1)

# Upload encrypted secrets directly to Cloudflare Worker cjduz-korean!
for s_name, s_val in [
    ("GOOGLE_CLIENT_ID", CLIENT_ID),
    ("GMAIL_CLIENT_SECRET", CLIENT_SECRET),
    ("GMAIL_CLIENT_ID", CLIENT_ID),
    ("GMAIL_REFRESH_TOKEN", refresh_tok)
]:
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT}/workers/scripts/cjduz-korean/secrets",
        data=json.dumps({"name": s_name, "text": s_val, "type": "secret_text"}).encode("utf-8"),
        headers={"Authorization": f"Bearer {CF_TOKEN}", "Content-Type": "application/json"},
        method="PUT"
    )
    urllib.request.urlopen(req)
    print(f"✔ Đã gắn secret {s_name} lên Cloudflare Worker (https://docusync.online)!")

print("\n🎉 Hoàn tất! Google Login & gửi mail tự động 24/7 từ nguyenchiduc2808@gmail.com đã hoạt động trên https://docusync.online!")
