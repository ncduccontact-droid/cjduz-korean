#!/usr/bin/env python3
"""
One-command Cloudflare Full-Stack Deployer for CJDUZ Korean (docusync.online)
Account: ncduc.contact@gmail.com (8428fefdc1f55c3c2b035ac0cb20bee9)
Deploys:
  1. Cloudflare Zone `docusync.online` (outputs 2 Nameservers for portal.inet.vn)
  2. Cloudflare D1 Database `cjduz-korean-db` + schema migration
  3. Cloudflare Worker + Static Assets (HTML/CSS/JS/JSON + 1,861 Kyuri MP3s)
  4. Worker Custom Domains `docusync.online` & `www.docusync.online`
"""
import os
import sys
import json
import uuid
import base64
import hashlib
import mimetypes
import urllib.request
import urllib.error

WEB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "8428fefdc1f55c3c2b035ac0cb20bee9")
WORKER_NAME = "cjduz-korean"
D1_NAME = "cjduz-korean-db"
DOMAIN = "docusync.online"

# Load web/.env if present
env_path = os.path.join(WEB_DIR, ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if s and not s.startswith("#") and "=" in s:
                k, v = s.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
if not API_TOKEN:
    print("Missing CLOUDFLARE_API_TOKEN in environment or web/.env!")
    sys.exit(1)


def cf_req(method, path, body=None, token=None, content_type="application/json"):
    import time as _time
    url = f"https://api.cloudflare.com/client/v4{path}"
    headers = {
        "Authorization": f"Bearer {token or API_TOKEN}",
        "User-Agent": "cjduz-deployer/1.0"
    }
    data = None
    if body is not None:
        if isinstance(body, (bytes, bytearray)):
            data = body
            headers["Content-Type"] = content_type
        else:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
    for attempt in range(5):
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8", errors="replace")
            if e.code in (429, 500, 502, 503, 504) and attempt < 4:
                wait_s = 2.0 * (attempt + 1)
                print(f"   [Retry {attempt+1}/4 after HTTP {e.code} on {path} in {wait_s:.0f}s...]")
                _time.sleep(wait_s)
                continue
            raise RuntimeError(f"HTTP {e.code} {method} {path}: {raw}")


def build_multipart(parts):
    boundary = f"----CJDUZBoundary{uuid.uuid4().hex}"
    buf = bytearray()
    for name, filename, ctype, content_bytes in parts:
        buf.extend(f"--{boundary}\r\n".encode())
        if filename:
            buf.extend(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode())
        else:
            buf.extend(f'Content-Disposition: form-data; name="{name}"\r\n'.encode())
        buf.extend(f"Content-Type: {ctype}\r\n\r\n".encode())
        buf.extend(content_bytes)
        buf.extend(b"\r\n")
    buf.extend(f"--{boundary}--\r\n".encode())
    return bytes(buf), f"multipart/form-data; boundary={boundary}"


# 1. Ensure Zone docusync.online
print(f"1. Checking Cloudflare Zone: {DOMAIN}...")
zones_res = cf_req("GET", f"/zones?name={DOMAIN}")
if zones_res["result"]:
    zone = zones_res["result"][0]
else:
    z_create = cf_req("POST", "/zones", {"name": DOMAIN, "account": {"id": ACCOUNT_ID}, "type": "full"})
    zone = z_create["result"]
print(f"   Zone ID: {zone['id']} | Status: {zone['status']}")
print(f"   Nameservers for portal.inet.vn: {', '.join(zone.get('name_servers', []))}")

# 2. Ensure D1 Database + Schema
print(f"2. Checking D1 Database: {D1_NAME}...")
d1_list = cf_req("GET", f"/accounts/{ACCOUNT_ID}/d1/database")["result"]
d1_db = next((d for d in d1_list if d["name"] == D1_NAME), None)
if not d1_db:
    d1_db = cf_req("POST", f"/accounts/{ACCOUNT_ID}/d1/database", {"name": D1_NAME})["result"]
d1_id = d1_db["uuid"]
print(f"   D1 UUID: {d1_id}")

schema_sql = open(os.path.join(WEB_DIR, "migrations", "0001_init.sql"), encoding="utf-8").read()
for stmt in [s.strip() for s in schema_sql.split(";") if s.strip()]:
    cf_req("POST", f"/accounts/{ACCOUNT_ID}/d1/database/{d1_id}/query", {"sql": stmt + ";"})
print("   D1 tables verified/migrated!")

# 3. Build Static Assets Manifest
print("3. Scanning static files & Kyuri MP3 assets...")
manifest = {}
hash_to_file = {}
allowed_Top = {"index.html", "_headers", "css", "js", "data", "media"}
skip_files = {"cjduz_users.db", "cjduz_users.db-journal", "mail_outbox.log", "custom_decks.json"}

for entry in os.listdir(WEB_DIR):
    if entry not in allowed_Top:
        continue
    full_top = os.path.join(WEB_DIR, entry)
    if os.path.isfile(full_top):
        raw = open(full_top, "rb").read()
        ext = os.path.splitext(entry)[1].lstrip(".")
        b64 = base64.b64encode(raw).decode("ascii")
        h = hashlib.sha256((b64 + ext).encode("utf-8")).hexdigest()[:32]
        manifest[f"/{entry}"] = {"hash": h, "size": len(raw)}
        hash_to_file[h] = (entry, b64.encode("ascii"), mimetypes.guess_type(entry)[0] or "text/html")
    else:
        for root_d, _, files in os.walk(full_top):
            for fn in files:
                if fn in skip_files or fn.startswith("."):
                    continue
                fp = os.path.join(root_d, fn)
                rel = "/" + os.path.relpath(fp, WEB_DIR).replace("\\", "/")
                raw = open(fp, "rb").read()
                ext = os.path.splitext(fn)[1].lstrip(".")
                b64 = base64.b64encode(raw).decode("ascii")
                h = hashlib.sha256((b64 + ext).encode("utf-8")).hexdigest()[:32]
                manifest[rel] = {"hash": h, "size": len(raw)}
                ctype = mimetypes.guess_type(fn)[0] or ("application/javascript" if fn.endswith(".js") else "application/octet-stream")
                hash_to_file[h] = (fn, b64.encode("ascii"), ctype)

print(f"   Total static assets in manifest: {len(manifest)}")
sess = cf_req("POST", f"/accounts/{ACCOUNT_ID}/workers/scripts/{WORKER_NAME}/assets-upload-session", {"manifest": manifest})["result"]
upload_jwt = sess["jwt"]
buckets = sess.get("buckets") or []
completion_jwt = upload_jwt

for bi, bucket in enumerate(buckets, 1):
    parts = []
    for h in bucket:
        fn, b64_bytes, ctype = hash_to_file[h]
        parts.append((h, h, ctype, b64_bytes))
    mp_body, mp_ctype = build_multipart(parts)
    print(f"   Uploading asset batch {bi}/{len(buckets)} ({len(bucket)} files)...")
    up_res = cf_req("POST", f"/accounts/{ACCOUNT_ID}/workers/assets/upload?base64=true", body=mp_body, token=upload_jwt, content_type=mp_ctype)
    if up_res.get("result", {}).get("jwt"):
        completion_jwt = up_res["result"]["jwt"]

# 4. Upload Worker ES Modules + Bindings (D1 + ASSETS + Vars)
print("4. Deploying Worker script + D1 & Assets bindings...")
metadata = {
    "main_module": "worker.js",
    "compatibility_date": "2026-11-01",
    "observability": {"enabled": True, "traces": {"enabled": True}},
    "assets": {
        "jwt": completion_jwt,
        "config": {"not_found_handling": "single-page-application"}
    },
    "bindings": [
        {"type": "assets", "name": "ASSETS"},
        {"type": "d1", "name": "DB", "id": d1_id},
        {"type": "plain_text", "name": "GMAIL_SENDER", "text": os.environ.get("GMAIL_SENDER", "nguyenchiduc2808@gmail.com")},
        {"type": "plain_text", "name": "GOOGLE_CLIENT_ID", "text": os.environ.get("GOOGLE_CLIENT_ID", "")}
    ]
}

worker_parts = [
    ("metadata", None, "application/json", json.dumps(metadata).encode("utf-8")),
    ("worker.js", "worker.js", "application/javascript+module", open(os.path.join(WEB_DIR, "worker.js"), "rb").read().replace(b"./functions/api/[[path]].js", b"./api_handler.js")),
    ("api_handler.js", "api_handler.js", "application/javascript+module", open(os.path.join(WEB_DIR, "functions", "api", "[[path]].js"), "rb").read())
]
w_body, w_ctype = build_multipart(worker_parts)
cf_req("PUT", f"/accounts/{ACCOUNT_ID}/workers/scripts/{WORKER_NAME}", body=w_body, content_type=w_ctype)

# Enable workers.dev subdomain route
try:
    cf_req("POST", f"/accounts/{ACCOUNT_ID}/workers/scripts/{WORKER_NAME}/subdomain", {"enabled": True})
except Exception:
    pass

# 5. Attach Custom Domains docusync.online & www.docusync.online
print(f"5. Attaching custom domains {DOMAIN} & www.{DOMAIN}...")
for host in [DOMAIN, f"www.{DOMAIN}"]:
    try:
        cf_req("PUT", f"/accounts/{ACCOUNT_ID}/workers/domains", {
            "hostname": host,
            "service": WORKER_NAME,
            "zone_id": zone["id"],
            "environment": "production"
        })
        print(f"   Attached https://{host} -> {WORKER_NAME}")
    except Exception as e:
        print(f"   Domain attach note ({host}): {e}")

# 6. Purge Cloudflare Edge Cache so new HTML/CSS/JS/JSON go live immediately
try:
    cf_req("POST", f"/zones/{zone['id']}/purge_cache", {"purge_everything": True})
    print(f"6. Purged Cloudflare Edge Cache for {DOMAIN}!")
except Exception as e:
    print(f"6. Cache purge note: {e}")

print("\n🎉 DEPLOYMENT COMPLETE!")
print(f"👉 Update Nameservers of {DOMAIN} on https://portal.inet.vn/ to:")
for ns in zone.get("name_servers", []):
    print(f"   - {ns}")
