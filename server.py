#!/usr/bin/env python3
import os
import re
import json
import html
import time
import hmac
import hashlib
import secrets
import sqlite3
import zipfile
import smtplib
import tempfile
import mimetypes
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote, urlencode

WEB_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(WEB_DIR, "data")
MEDIA_DIR = os.path.join(WEB_DIR, "media")
CUSTOM_DECKS_FILE = os.path.join(DATA_DIR, "custom_decks.json")
AUTH_DB_FILE = os.path.join(DATA_DIR, "cjduz_users.db")
MAIL_LOG_FILE = os.path.join(DATA_DIR, "mail_outbox.log")
ENV_FILE = os.path.join(WEB_DIR, ".env")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MEDIA_DIR, exist_ok=True)


def load_dotenv():
    if not os.path.exists(ENV_FILE):
        return
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            k, v = s.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


load_dotenv()

SENDER_EMAIL = os.environ.get("GMAIL_SENDER", "nguyenchiduc2808@gmail.com")


def init_auth_db():
    conn = sqlite3.connect(AUTH_DB_FILE)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar TEXT DEFAULT '',
            password_hash TEXT DEFAULT '',
            auth_provider TEXT DEFAULT 'email',
            verified INTEGER DEFAULT 0,
            roadmap_profile_json TEXT DEFAULT '{}',
            state_json TEXT DEFAULT '{}',
            created_at INTEGER NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS otp_codes (
            email TEXT NOT NULL,
            purpose TEXT NOT NULL,
            code TEXT NOT NULL,
            payload_json TEXT DEFAULT '{}',
            expires_at INTEGER NOT NULL,
            PRIMARY KEY (email, purpose)
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()


init_auth_db()


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return f"{salt}${dk.hex()}"


def verify_password(password, stored):
    if not stored or "$" not in stored:
        return False
    salt, expected = stored.split("$", 1)
    actual = hash_password(password, salt).split("$", 1)[1]
    return hmac.compare_digest(actual, expected)


def send_cjduz_email(to_email, subject, html_body):
    load_dotenv()
    app_pw = os.environ.get("GMAIL_APP_PASSWORD", "").strip()
    sender = os.environ.get("GMAIL_SENDER", SENDER_EMAIL).strip()

    with open(MAIL_LOG_FILE, "a", encoding="utf-8") as lf:
        lf.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] FROM={sender} TO={to_email} SUBJECT={subject}\n")

    if not app_pw:
        return False, "Chưa cấu hình GMAIL_APP_PASSWORD cho nguyenchiduc2808@gmail.com trong web/.env"

    msg = MIMEMultipart("alternative")
    msg["From"] = f"CJDUZ Korean <{sender}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as smtp:
            smtp.login(sender, app_pw)
            smtp.sendmail(sender, [to_email], msg.as_string())
        return True, "sent"
    except Exception as e:
        return False, str(e)


def build_otp_email_html(title, name, code, note):
    return f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:540px;margin:0 auto;border:1px solid #E0F2F0;border-radius:16px;overflow:hidden;">
      <div style="background:#00B2A5;color:#FFFFFF;padding:20px 24px;">
        <strong style="font-size:20px;letter-spacing:0.04em;">🌼 CJDUZ · Học Tiếng Hàn Tổng Hợp &amp; TOPIK</strong>
      </div>
      <div style="padding:24px;color:#363636;line-height:1.6;">
        <h2 style="margin:0 0 10px;color:#008B82;font-size:20px;">{html.escape(title)}</h2>
        <p>Xin chào <strong>{html.escape(name or 'bạn')}</strong>,</p>
        <p>{html.escape(note)}</p>
        <div style="background:#E0F2F0;border-radius:12px;padding:16px;text-align:center;margin:18px 0;">
          <span style="font-size:30px;font-weight:800;letter-spacing:6px;color:#006B66;">{html.escape(code)}</span>
        </div>
        <p style="font-size:13px;color:#575757;">Mã có hiệu lực trong 15 phút. Email được gửi tự động từ hệ thống hỗ trợ học viên <strong>{SENDER_EMAIL}</strong>.</p>
      </div>
    </div>
    """


def create_session(conn, user_id):
    token = secrets.token_urlsafe(32)
    expires = int(time.time()) + 30 * 86400
    conn.execute("INSERT INTO sessions(token, user_id, expires_at) VALUES (?, ?, ?)", (token, user_id, expires))
    conn.commit()
    return token


def get_user_by_token(token):
    if not token:
        return None
    conn = sqlite3.connect(AUTH_DB_FILE)
    cur = conn.cursor()
    row = cur.execute("""
        SELECT u.id, u.email, u.name, u.avatar, u.auth_provider, u.roadmap_profile_json, u.state_json
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ? AND s.expires_at > ?
    """, (token, int(time.time()))).fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0],
        "email": row[1],
        "name": row[2],
        "avatar": row[3],
        "authProvider": row[4],
        "roadmapProfile": json.loads(row[5] or "{}"),
        "state": json.loads(row[6] or "{}")
    }


def strip_tags(raw):
    if not raw:
        return ""
    text = re.sub(r'<audio[^>]*>.*?</audio>', '', raw, flags=re.S)
    text = re.sub(r'<button[^>]*>.*?</button>', '', text, flags=re.S)
    text = re.sub(r'\[sound:[^\]]+\]', '', text)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.I)
    text = re.sub(r'<[^>]+>', '', text)
    return html.unescape(text).strip()


def extract_sound(raw):
    if not raw:
        return ""
    m = re.search(r'\[sound:([^\]]+)\]', raw)
    if m:
        return m.group(1).strip()
    m2 = re.search(r'src="([^"]+\.mp3)"', raw)
    if m2:
        return m2.group(1).strip()
    return ""


def import_apkg_bytes(raw_bytes, filename):
    cards_out = []
    audio_count = 0
    deck_title = os.path.splitext(os.path.basename(filename))[0]
    with tempfile.NamedTemporaryFile(suffix=".apkg") as tf_zip:
        tf_zip.write(raw_bytes)
        tf_zip.flush()
        with zipfile.ZipFile(tf_zip.name, "r") as z:
            names = set(z.namelist())
            media_map = json.loads(z.read("media").decode("utf-8")) if "media" in names else {}
            file_to_zip = {v: k for k, v in media_map.items()}
            db_name = "collection.anki21" if "collection.anki21" in names else "collection.anki2"

            with tempfile.NamedTemporaryFile(suffix=".db") as tf_db:
                tf_db.write(z.read(db_name))
                tf_db.flush()
                conn = sqlite3.connect(tf_db.name)
                cur = conn.cursor()
                col = cur.execute("SELECT models, decks FROM col").fetchone()
                models = json.loads(col[0])
                decks = json.loads(col[1])
                for d in decks.values():
                    if d["name"] != "Default":
                        deck_title = d["name"].split("::")[0]
                        break
                model_fields = {int(mid): [f["name"] for f in m["flds"]] for mid, m in models.items()}
                rows = cur.execute("SELECT id, mid, flds FROM notes ORDER BY id").fetchall()
                for idx, (nid, mid, flds_raw) in enumerate(rows, 1):
                    fnames = model_fields.get(mid, [])
                    vals = flds_raw.split("\x1f")
                    dmap = {fnames[i]: vals[i] if i < len(vals) else "" for i in range(len(fnames))}
                    ko = strip_tags(dmap.get("Front") or dmap.get("Word") or dmap.get("GrammarPattern") or (vals[0] if vals else ""))
                    vi = strip_tags(dmap.get("VietnameseMeaning") or dmap.get("Definition") or dmap.get("Meaning") or dmap.get("Back") or (vals[1] if len(vals) > 1 else ""))
                    pron = strip_tags(dmap.get("Pronunciation") or dmap.get("Phonetic symbols") or "")
                    ex_ko = strip_tags(dmap.get("ExampleKorean") or dmap.get("Cloze") or "")
                    ex_vi = strip_tags(dmap.get("ExampleMeaning") or "")
                    w_aud = extract_sound(dmap.get("Audio", ""))
                    ex_aud = extract_sound(dmap.get("ExampleAudio", ""))
                    if ko:
                        cards_out.append({
                            "id": f"custom_{nid}_{idx}",
                            "book": f"custom_{re.sub(r'[^a-zA-Z0-9]', '_', filename)[:20]}",
                            "lesson": ((idx - 1) // 35) + 1,
                            "lessonTitle": f"{deck_title} · Phần {((idx - 1) // 35) + 1}",
                            "korean": ko,
                            "vietnamese": vi,
                            "pronunciation": pron,
                            "exampleKo": ex_ko,
                            "exampleVi": ex_vi,
                            "wordAudio": f"media/{w_aud}" if w_aud else "",
                            "exampleAudio": f"media/{ex_aud}" if ex_aud else "",
                            "note": strip_tags(dmap.get("ExtraNotes") or dmap.get("Notes") or "")
                        })
                conn.close()

            for fname, zkey in file_to_zip.items():
                if fname.lower().endswith((".mp3", ".ogg", ".wav", ".m4a")) and zkey in names:
                    out_p = os.path.join(MEDIA_DIR, fname)
                    if not os.path.exists(out_p):
                        with open(out_p, "wb") as out_f:
                            out_f.write(z.read(zkey))
                    audio_count += 1

    existing = []
    if os.path.exists(CUSTOM_DECKS_FILE):
        try:
            with open(CUSTOM_DECKS_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = []

    deck_entry = {
        "deckId": f"custom_{len(existing) + 1}",
        "title": deck_title,
        "filename": filename,
        "count": len(cards_out),
        "audioCount": audio_count,
        "items": cards_out
    }
    existing.append(deck_entry)
    with open(CUSTOM_DECKS_FILE, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)
    return deck_entry


class CJDUZKoreanHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def log_message(self, fmt, *args):
        pass

    def send_json(self, status, data):
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def read_json_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def get_bearer_token(self):
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return auth[7:].strip()
        return ""

    def is_local_dev(self):
        host = self.headers.get("Host", "")
        return host.startswith("localhost") or host.startswith("127.0.0.1")

    def do_GET(self):
        load_dotenv()
        path = unquote(self.path.split("?", 1)[0])

        if path == "/api/auth/config":
            return self.send_json(200, {
                "ok": True,
                "googleClientId": os.environ.get("GOOGLE_CLIENT_ID", ""),
                "senderEmail": os.environ.get("GMAIL_SENDER", SENDER_EMAIL),
                "smtpConfigured": bool(os.environ.get("GMAIL_APP_PASSWORD", "").strip())
            })

        if path == "/api/user/me":
            user = get_user_by_token(self.get_bearer_token())
            if not user:
                return self.send_json(401, {"ok": False, "error": "Phiên đăng nhập hết hạn"})
            return self.send_json(200, {"ok": True, "user": user})

        if path == "/api/custom-decks":
            decks = []
            if os.path.exists(CUSTOM_DECKS_FILE):
                try:
                    with open(CUSTOM_DECKS_FILE, "r", encoding="utf-8") as f:
                        decks = json.load(f)
                except Exception:
                    decks = []
            return self.send_json(200, decks)

        file_path = self.translate_path(self.path)
        range_header = self.headers.get("Range")
        if range_header and os.path.isfile(file_path):
            m = re.match(r"bytes=(\d+)-(\d*)", range_header)
            if m:
                file_size = os.path.getsize(file_path)
                start = int(m.group(1))
                end = int(m.group(2)) if m.group(2) else file_size - 1
                end = min(end, file_size - 1)
                if start <= end:
                    length = end - start + 1
                    ctype, _ = mimetypes.guess_type(file_path)
                    self.send_response(206)
                    self.send_header("Content-Type", ctype or "application/octet-stream")
                    self.send_header("Accept-Ranges", "bytes")
                    self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                    self.send_header("Content-Length", str(length))
                    self.end_headers()
                    with open(file_path, "rb") as f:
                        f.seek(start)
                        self.wfile.write(f.read(length))
                    return

        if not os.path.exists(file_path) and not path.startswith(("/media/", "/data/", "/css/", "/js/", "/api/")):
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        load_dotenv()
        path = unquote(self.path.split("?", 1)[0])

        if path == "/api/import-apkg":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                fname = unquote(self.headers.get("X-Filename", "uploaded_deck.apkg"))
                raw = self.rfile.read(length)
                deck_entry = import_apkg_bytes(raw, fname)
                return self.send_json(200, {"ok": True, "deck": deck_entry})
            except Exception as e:
                return self.send_json(400, {"ok": False, "error": str(e)})

        try:
            body = self.read_json_body()
        except Exception:
            return self.send_json(400, {"ok": False, "error": "Dữ liệu JSON không hợp lệ"})

        # 1. REGISTER WITH EMAIL -> SEND OTP FROM nguyenchiduc2808@gmail.com
        if path == "/api/auth/register":
            email = (body.get("email") or "").strip().lower()
            name = (body.get("name") or "").strip() or email.split("@")[0]
            password = body.get("password") or ""
            roadmap_profile = body.get("roadmapProfile") or {}
            initial_state = body.get("initialState") or {}

            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
                return self.send_json(400, {"ok": False, "error": "Địa chỉ email không hợp lệ."})
            if len(password) < 6:
                return self.send_json(400, {"ok": False, "error": "Mật khẩu cần tối thiểu 6 ký tự."})

            conn = sqlite3.connect(AUTH_DB_FILE)
            existing = conn.execute("SELECT id, verified FROM users WHERE email = ?", (email,)).fetchone()
            if existing and existing[1] == 1:
                conn.close()
                return self.send_json(400, {"ok": False, "error": "Email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập."})

            code = f"{secrets.randbelow(900000) + 100000}"
            payload = {
                "name": name,
                "password_hash": hash_password(password),
                "roadmapProfile": roadmap_profile,
                "initialState": initial_state
            }
            conn.execute("""
                INSERT OR REPLACE INTO otp_codes(email, purpose, code, payload_json, expires_at)
                VALUES (?, 'register', ?, ?, ?)
            """, (email, code, json.dumps(payload, ensure_ascii=False), int(time.time()) + 900))
            conn.commit()
            conn.close()

            sent, mail_msg = send_cjduz_email(
                email,
                f"[CJDUZ] Mã xác thực đăng ký tài khoản: {code}",
                build_otp_email_html(
                    "Xác thực đăng ký tài khoản CJDUZ",
                    name,
                    code,
                    "Cảm ơn bạn đã đăng ký học Tiếng Hàn trên CJDUZ! Nhập mã xác thực 6 chữ số dưới đây để kích hoạt lộ trình cá nhân hóa của riêng bạn:"
                )
            )
            resp = {
                "ok": True,
                "email": email,
                "sender": SENDER_EMAIL,
                "mailSent": sent,
                "mailNote": mail_msg
            }
            if not sent and self.is_local_dev():
                resp["devOtpPreview"] = code
            return self.send_json(200, resp)

        # 2. VERIFY REGISTRATION OTP
        if path == "/api/auth/verify-otp":
            email = (body.get("email") or "").strip().lower()
            otp = (body.get("otp") or "").strip()
            conn = sqlite3.connect(AUTH_DB_FILE)
            row = conn.execute(
                "SELECT code, payload_json, expires_at FROM otp_codes WHERE email = ? AND purpose = 'register'",
                (email,)
            ).fetchone()
            if not row or row[2] < int(time.time()) or row[0] != otp:
                conn.close()
                return self.send_json(400, {"ok": False, "error": "Mã xác thực không đúng hoặc đã hết hạn."})

            payload = json.loads(row[1])
            rp = payload.get("roadmapProfile") or {}
            st = payload.get("initialState") or {}
            st["roadmapProfile"] = rp
            if rp.get("targetLevel"):
                st["targetLevel"] = rp["targetLevel"]
            if rp.get("examDate"):
                st["examDate"] = rp["examDate"]

            existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if existing:
                uid = existing[0]
                conn.execute("""
                    UPDATE users SET name=?, password_hash=?, verified=1, roadmap_profile_json=?, state_json=?
                    WHERE id=?
                """, (payload["name"], payload["password_hash"], json.dumps(rp, ensure_ascii=False), json.dumps(st, ensure_ascii=False), uid))
            else:
                cur = conn.execute("""
                    INSERT INTO users(email, name, password_hash, auth_provider, verified, roadmap_profile_json, state_json, created_at)
                    VALUES (?, ?, ?, 'email', 1, ?, ?, ?)
                """, (email, payload["name"], payload["password_hash"], json.dumps(rp, ensure_ascii=False), json.dumps(st, ensure_ascii=False), int(time.time())))
                uid = cur.lastrowid

            conn.execute("DELETE FROM otp_codes WHERE email = ? AND purpose = 'register'", (email,))
            token = create_session(conn, uid)
            conn.close()
            return self.send_json(200, {
                "ok": True,
                "token": token,
                "user": {"id": uid, "email": email, "name": payload["name"], "authProvider": "email", "roadmapProfile": rp, "state": st}
            })

        # 3. LOGIN WITH EMAIL & PASSWORD
        if path == "/api/auth/login":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""
            conn = sqlite3.connect(AUTH_DB_FILE)
            row = conn.execute("""
                SELECT id, name, avatar, password_hash, verified, roadmap_profile_json, state_json
                FROM users WHERE email = ?
            """, (email,)).fetchone()
            if not row or row[4] == 0 or not verify_password(password, row[3]):
                conn.close()
                return self.send_json(401, {"ok": False, "error": "Email hoặc mật khẩu chưa chính xác."})
            token = create_session(conn, row[0])
            conn.close()
            return self.send_json(200, {
                "ok": True,
                "token": token,
                "user": {
                    "id": row[0],
                    "email": email,
                    "name": row[1],
                    "avatar": row[2],
                    "authProvider": "email",
                    "roadmapProfile": json.loads(row[5] or "{}"),
                    "state": json.loads(row[6] or "{}")
                }
            })

        # 4. GOOGLE OAUTH SIGN-IN / REGISTER
        if path == "/api/auth/google":
            cred = body.get("credential") or ""
            roadmap_profile = body.get("roadmapProfile") or {}
            initial_state = body.get("initialState") or {}

            g_email = ""
            g_name = ""
            g_avatar = ""

            if cred:
                try:
                    url = "https://oauth2.googleapis.com/tokeninfo?" + urlencode({"id_token": cred})
                    with urllib.request.urlopen(url, timeout=8) as resp:
                        info = json.loads(resp.read().decode("utf-8"))
                    expected_aud = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
                    if expected_aud and info.get("aud") != expected_aud:
                        return self.send_json(401, {"ok": False, "error": "Google Client ID không khớp."})
                    if str(info.get("email_verified")).lower() != "true":
                        return self.send_json(401, {"ok": False, "error": "Email Google chưa được xác minh."})
                    g_email = info["email"].lower()
                    g_name = info.get("name") or g_email.split("@")[0]
                    g_avatar = info.get("picture") or ""
                except Exception as e:
                    return self.send_json(401, {"ok": False, "error": f"Không xác thực được Google Token: {e}"})
            elif self.is_local_dev() and body.get("devGoogleEmail"):
                # Local preview simulation when GOOGLE_CLIENT_ID is not yet configured
                g_email = body["devGoogleEmail"].strip().lower()
                g_name = (body.get("devGoogleName") or g_email.split("@")[0]).strip()
            else:
                return self.send_json(400, {"ok": False, "error": "Chưa cấu hình GOOGLE_CLIENT_ID cho tên miền chính thức."})

            conn = sqlite3.connect(AUTH_DB_FILE)
            row = conn.execute(
                "SELECT id, name, avatar, roadmap_profile_json, state_json FROM users WHERE email = ?",
                (g_email,)
            ).fetchone()
            is_new = False
            if row:
                uid = row[0]
                rp = json.loads(row[3] or "{}")
                st = json.loads(row[4] or "{}")
                g_name = row[1] or g_name
                g_avatar = g_avatar or row[2]
            else:
                is_new = True
                rp = roadmap_profile
                st = initial_state
                st["roadmapProfile"] = rp
                cur = conn.execute("""
                    INSERT INTO users(email, name, avatar, auth_provider, verified, roadmap_profile_json, state_json, created_at)
                    VALUES (?, ?, ?, 'google', 1, ?, ?, ?)
                """, (g_email, g_name, g_avatar, json.dumps(rp, ensure_ascii=False), json.dumps(st, ensure_ascii=False), int(time.time())))
                uid = cur.lastrowid
                send_cjduz_email(
                    g_email,
                    "[CJDUZ] Chào mừng bạn đăng ký thành công bằng Google!",
                    build_otp_email_html(
                        "Tài khoản Google đã kết nối thành công!",
                        g_name,
                        "WELCOME",
                        "Lộ trình học Tiếng Hàn & luyện thi TOPIK cá nhân hóa của riêng bạn đã được khởi tạo trên CJDUZ."
                    )
                )

            token = create_session(conn, uid)
            conn.close()
            return self.send_json(200, {
                "ok": True,
                "isNewUser": is_new,
                "token": token,
                "user": {"id": uid, "email": g_email, "name": g_name, "avatar": g_avatar, "authProvider": "google", "roadmapProfile": rp, "state": st}
            })

        # 5. FORGOT PASSWORD -> SEND OTP FROM nguyenchiduc2808@gmail.com
        if path == "/api/auth/forgot-password":
            email = (body.get("email") or "").strip().lower()
            conn = sqlite3.connect(AUTH_DB_FILE)
            row = conn.execute("SELECT id, name FROM users WHERE email = ? AND verified = 1", (email,)).fetchone()
            if not row:
                conn.close()
                return self.send_json(404, {"ok": False, "error": "Không tìm thấy tài khoản nào đăng ký với email này."})

            code = f"{secrets.randbelow(900000) + 100000}"
            conn.execute("""
                INSERT OR REPLACE INTO otp_codes(email, purpose, code, payload_json, expires_at)
                VALUES (?, 'reset', ?, '{}', ?)
            """, (email, code, int(time.time()) + 900))
            conn.commit()
            conn.close()

            sent, mail_msg = send_cjduz_email(
                email,
                f"[CJDUZ] Mã khôi phục mật khẩu của bạn: {code}",
                build_otp_email_html(
                    "Yêu cầu đặt lại mật khẩu CJDUZ",
                    row[1],
                    code,
                    "Bạn vừa yêu cầu đặt lại mật khẩu. Nhập mã khôi phục 6 chữ số bên dưới để tạo mật khẩu mới:"
                )
            )
            resp = {"ok": True, "email": email, "sender": SENDER_EMAIL, "mailSent": sent, "mailNote": mail_msg}
            if not sent and self.is_local_dev():
                resp["devOtpPreview"] = code
            return self.send_json(200, resp)

        # 6. RESET PASSWORD WITH OTP
        if path == "/api/auth/reset-password":
            email = (body.get("email") or "").strip().lower()
            otp = (body.get("otp") or "").strip()
            new_pw = body.get("newPassword") or ""
            if len(new_pw) < 6:
                return self.send_json(400, {"ok": False, "error": "Mật khẩu mới cần ít nhất 6 ký tự."})

            conn = sqlite3.connect(AUTH_DB_FILE)
            row = conn.execute(
                "SELECT code, expires_at FROM otp_codes WHERE email = ? AND purpose = 'reset'",
                (email,)
            ).fetchone()
            if not row or row[1] < int(time.time()) or row[0] != otp:
                conn.close()
                return self.send_json(400, {"ok": False, "error": "Mã khôi phục không đúng hoặc đã hết hạn."})

            conn.execute("UPDATE users SET password_hash = ? WHERE email = ?", (hash_password(new_pw), email))
            conn.execute("DELETE FROM otp_codes WHERE email = ? AND purpose = 'reset'", (email,))
            u_row = conn.execute("SELECT id, name, avatar, roadmap_profile_json, state_json FROM users WHERE email = ?", (email,)).fetchone()
            token = create_session(conn, u_row[0])
            conn.close()
            return self.send_json(200, {
                "ok": True,
                "token": token,
                "user": {
                    "id": u_row[0],
                    "email": email,
                    "name": u_row[1],
                    "avatar": u_row[2],
                    "authProvider": "email",
                    "roadmapProfile": json.loads(u_row[3] or "{}"),
                    "state": json.loads(u_row[4] or "{}")
                }
            })

        # 7. SYNC PER-USER PROGRESS & PERSONALIZED ROADMAP
        if path == "/api/user/sync":
            user = get_user_by_token(self.get_bearer_token())
            if not user:
                return self.send_json(401, {"ok": False, "error": "Chưa đăng nhập"})
            new_state = body.get("state") or {}
            rp = new_state.get("roadmapProfile") or user["roadmapProfile"] or {}
            conn = sqlite3.connect(AUTH_DB_FILE)
            conn.execute(
                "UPDATE users SET roadmap_profile_json = ?, state_json = ? WHERE id = ?",
                (json.dumps(rp, ensure_ascii=False), json.dumps(new_state, ensure_ascii=False), user["id"])
            )
            conn.commit()
            conn.close()
            return self.send_json(200, {"ok": True})

        self.send_error(404)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8088"))
    server = ThreadingHTTPServer(("127.0.0.1", port), CJDUZKoreanHandler)
    print(f"CJDUZ Korean Web running at http://localhost:{port}")
    server.serve_forever()
