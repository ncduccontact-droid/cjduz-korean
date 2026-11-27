// Cloudflare Pages Functions Serverless API (/api/*) for docusync.online
// Uses Cloudflare D1 (env.DB), Google OAuth token verification, and transactional email from nguyenchiduc2808@gmail.com

function jsonResp(data, status = 200, cookieVal = null) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };
  if (cookieVal !== null) {
    headers["Set-Cookie"] = cookieVal === ""
      ? "cjduz_token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly; Secure"
      : `cjduz_token=${cookieVal}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly; Secure`;
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function extractToken(request, body = null) {
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ") && authHeader.slice(7).trim()) {
    return authHeader.slice(7).trim();
  }
  const cookieHdr = request.headers.get("Cookie") || "";
  for (const part of cookieHdr.split(";")) {
    const [k, v] = part.trim().split("=", 2);
    if (k === "cjduz_token" && v) return v.trim();
  }
  if (body && typeof body.token === "string" && body.token.trim()) {
    return body.token.trim();
  }
  return "";
}

async function pbkdf2Hash(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex || Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");
  const keyMat = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" },
    keyMat,
    256
  );
  const hex = Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${salt}$${hex}`;
}

async function verifyPw(password, stored) {
  if (!stored || !stored.includes("$")) return false;
  const [salt] = stored.split("$");
  const candidate = await pbkdf2Hash(password, salt);
  return candidate === stored;
}

function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomOtp() {
  const n = (crypto.getRandomValues(new Uint32Array(1))[0] % 900000) + 100000;
  return String(n);
}

// Sends transactional email via Gmail OAuth2 REST API (refresh token) or Resend/SMTP HTTP Bridge from nguyenchiduc2808@gmail.com
async function sendTransactionalEmail(env, toEmail, subject, htmlContent) {
  const sender = env.GMAIL_SENDER || "nguyenchiduc2808@gmail.com";

  // Option A: Gmail OAuth2 Refresh Token (100% native HTTPS on Cloudflare Workers sending from nguyenchiduc2808@gmail.com!)
  if (env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN) {
    const tokRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GMAIL_CLIENT_ID,
        client_secret: env.GMAIL_CLIENT_SECRET,
        refresh_token: env.GMAIL_REFRESH_TOKEN,
        grant_type: "refresh_token"
      })
    });
    const tokData = await tokRes.json();
    if (tokData.access_token) {
      const rawMime = [
        `From: "D - TOPIK" <${sender}>`,
        `To: ${toEmail}`,
        `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "",
        htmlContent
      ].join("\r\n");
      const rawB64Url = btoa(unescape(encodeURIComponent(rawMime))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokData.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: rawB64Url })
      });
      if (sendRes.ok) return { sent: true, via: "gmail_api" };
    }
  }

  return { sent: false, via: "pending_gmail_credentials" };
}

function otpHtml(title, name, code, sender) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:540px;margin:0 auto;border:1px solid #BCE9DF;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(110deg,#CCFBF1 0%,#E0FCF6 50%,#CFF7EE 100%);color:#073B36;padding:18px 24px;font-weight:800;font-size:19px;border-bottom:2px solid #84DEC9;">D <span style="color:#0D9488;">●</span> TOPIK · docusync.online</div>
      <div style="padding:24px;color:#083833;">
        <h2 style="margin:0 0 10px;color:#0D9488;">${title}</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <div style="background:#E6FAF5;border:1px solid #BCE9DF;border-radius:12px;padding:16px;text-align:center;margin:18px 0;">
          <span style="font-size:30px;font-weight:800;letter-spacing:6px;color:#0A7067;">${code}</span>
        </div>
        <p style="font-size:13px;color:#466E69;">Hỗ trợ học viên bởi ${sender} · Hiệu lực 15 phút.</p>
      </div>
    </div>
  `;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const sender = env.GMAIL_SENDER || "nguyenchiduc2808@gmail.com";

  if (request.method === "GET" && path === "/api/tts") {
    const q = (url.searchParams.get("q") || "").trim().slice(0, 200);
    if (!q) return new Response("Missing q", { status: 400 });
    try {
      const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ko&q=${encodeURIComponent(q)}`;
      const upstream = await fetch(ttsUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
      });
      if (!upstream.ok) return new Response("TTS upstream error", { status: 502 });
      return new Response(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=2592000, immutable"
        }
      });
    } catch {
      return new Response("TTS fetch failed", { status: 502 });
    }
  }

  if (request.method === "GET" && path === "/api/auth/config") {
    return jsonResp({
      ok: true,
      googleClientId: env.GOOGLE_CLIENT_ID || "",
      senderEmail: sender,
      smtpConfigured: Boolean(env.GMAIL_REFRESH_TOKEN)
    });
  }

  if (request.method === "GET" && path === "/api/custom-decks") {
    return jsonResp([]);
  }

  if (!env.DB) {
    return jsonResp({ ok: false, error: "Cloudflare D1 binding (DB) chưa được gắn vào dự án Pages." }, 500);
  }

  const now = Math.floor(Date.now() / 1000);
  let bearer = extractToken(request);

  if (request.method === "GET" && path === "/api/user/me") {
    const row = await env.DB.prepare(`
      SELECT u.id, u.email, u.name, u.avatar, u.auth_provider, u.roadmap_profile_json, u.state_json
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ?
    `).bind(bearer, now).first();
    if (!row) return jsonResp({ ok: false, error: "Phiên hết hạn" }, 401);
    return jsonResp({
      ok: true,
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        avatar: row.avatar,
        authProvider: row.auth_provider,
        roadmapProfile: JSON.parse(row.roadmap_profile_json || "{}"),
        state: JSON.parse(row.state_json || "{}")
      }
    });
  }

  if (request.method !== "POST") return jsonResp({ ok: false, error: "Not found" }, 404);
  const body = await request.json().catch(() => ({}));

  if (path === "/api/auth/register") {
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim() || email.split("@")[0];
    const password = body.password || "";
    if (!email.includes("@") || password.length < 6) {
      return jsonResp({ ok: false, error: "Email hoặc mật khẩu (tối thiểu 6 ký tự) chưa hợp lệ." }, 400);
    }
    const exists = await env.DB.prepare("SELECT id, verified FROM users WHERE email = ?").bind(email).first();
    if (exists && exists.verified === 1) {
      return jsonResp({ ok: false, error: "Email này đã đăng ký." }, 400);
    }
    const code = randomOtp();
    const pwHash = await pbkdf2Hash(password);
    const rp = body.roadmapProfile || {};
    const st = { ...(body.initialState || {}), roadmapProfile: rp };
    const mailRes = await sendTransactionalEmail(env, email, `[D ● TOPIK] Mã xác thực đăng ký: ${code}`, otpHtml("Xác thực đăng ký D ● TOPIK", name, code, sender));

    // If Gmail OAuth credentials are not bound yet, activate account immediately on D1 so users can sign up & get personalized roadmaps right away
    if (!mailRes.sent) {
      await env.DB.prepare(`
        INSERT INTO users(email, name, password_hash, auth_provider, verified, roadmap_profile_json, state_json, created_at)
        VALUES (?, ?, ?, 'email', 1, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET name=excluded.name, password_hash=excluded.password_hash, verified=1, roadmap_profile_json=excluded.roadmap_profile_json, state_json=excluded.state_json
      `).bind(email, name, pwHash, JSON.stringify(rp), JSON.stringify(st), now).run();
      const u = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
      const token = randomToken();
      await env.DB.prepare("INSERT INTO sessions(token, user_id, expires_at) VALUES (?, ?, ?)").bind(token, u.id, now + 30 * 86400).run();
      return jsonResp({
        ok: true,
        autoActivated: true,
        token,
        user: { id: u.id, email, name, authProvider: "email", roadmapProfile: rp, state: st }
      }, 200, token);
    }

    const payload = JSON.stringify({ name, password_hash: pwHash, roadmapProfile: rp, initialState: body.initialState || {} });
    await env.DB.prepare("INSERT OR REPLACE INTO otp_codes(email, purpose, code, payload_json, expires_at) VALUES (?, 'register', ?, ?, ?)").bind(email, code, payload, now + 900).run();
    return jsonResp({ ok: true, email, sender, mailSent: true });
  }

  if (path === "/api/auth/verify-otp") {
    const email = (body.email || "").trim().toLowerCase();
    const otp = (body.otp || "").trim();
    const row = await env.DB.prepare("SELECT code, payload_json, expires_at FROM otp_codes WHERE email = ? AND purpose = 'register'").bind(email).first();
    if (!row || row.expires_at < now || row.code !== otp) {
      return jsonResp({ ok: false, error: "Mã OTP không đúng hoặc đã hết hạn." }, 400);
    }
    const p = JSON.parse(row.payload_json);
    const rp = p.roadmapProfile || {};
    const st = { ...(p.initialState || {}), roadmapProfile: rp };
    await env.DB.prepare(`
      INSERT INTO users(email, name, password_hash, auth_provider, verified, roadmap_profile_json, state_json, created_at)
      VALUES (?, ?, ?, 'email', 1, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET name=excluded.name, password_hash=excluded.password_hash, verified=1, roadmap_profile_json=excluded.roadmap_profile_json, state_json=excluded.state_json
    `).bind(email, p.name, p.password_hash, JSON.stringify(rp), JSON.stringify(st), now).run();
    const u = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    await env.DB.prepare("DELETE FROM otp_codes WHERE email = ? AND purpose = 'register'").bind(email).run();
    const token = randomToken();
    await env.DB.prepare("INSERT INTO sessions(token, user_id, expires_at) VALUES (?, ?, ?)").bind(token, u.id, now + 30 * 86400).run();
    return jsonResp({ ok: true, token, user: { id: u.id, email, name: p.name, authProvider: "email", roadmapProfile: rp, state: st } }, 200, token);
  }

  if (path === "/api/auth/login") {
    const email = (body.email || "").trim().toLowerCase();
    const u = await env.DB.prepare("SELECT id, name, avatar, password_hash, verified, roadmap_profile_json, state_json FROM users WHERE email = ?").bind(email).first();
    if (!u || !u.verified || !(await verifyPw(body.password || "", u.password_hash))) {
      return jsonResp({ ok: false, error: "Email hoặc mật khẩu chưa chính xác." }, 401);
    }
    const token = randomToken();
    await env.DB.prepare("INSERT INTO sessions(token, user_id, expires_at) VALUES (?, ?, ?)").bind(token, u.id, now + 30 * 86400).run();
    return jsonResp({
      ok: true,
      token,
      user: { id: u.id, email, name: u.name, avatar: u.avatar, authProvider: "email", roadmapProfile: JSON.parse(u.roadmap_profile_json || "{}"), state: JSON.parse(u.state_json || "{}") }
    }, 200, token);
  }

  if (path === "/api/auth/google") {
    const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential || "")}`);
    if (!infoRes.ok) return jsonResp({ ok: false, error: "Google token không hợp lệ." }, 401);
    const info = await infoRes.json();
    if (env.GOOGLE_CLIENT_ID && info.aud !== env.GOOGLE_CLIENT_ID) {
      return jsonResp({ ok: false, error: "Google Client ID không khớp." }, 401);
    }
    const email = info.email.toLowerCase();
    const name = info.name || email.split("@")[0];
    let u = await env.DB.prepare("SELECT id, name, avatar, roadmap_profile_json, state_json FROM users WHERE email = ?").bind(email).first();
    if (!u) {
      const rp = body.roadmapProfile || {};
      const st = { ...(body.initialState || {}), roadmapProfile: rp };
      await env.DB.prepare("INSERT INTO users(email, name, avatar, auth_provider, verified, roadmap_profile_json, state_json, created_at) VALUES (?, ?, ?, 'google', 1, ?, ?, ?)").bind(email, name, info.picture || "", JSON.stringify(rp), JSON.stringify(st), now).run();
      u = await env.DB.prepare("SELECT id, name, avatar, roadmap_profile_json, state_json FROM users WHERE email = ?").bind(email).first();
      await sendTransactionalEmail(env, email, "[D ● TOPIK] Chào mừng bạn đến với D ● TOPIK!", otpHtml("Chào mừng bạn đăng ký thành công!", name, "WELCOME", sender));
    }
    const token = randomToken();
    await env.DB.prepare("INSERT INTO sessions(token, user_id, expires_at) VALUES (?, ?, ?)").bind(token, u.id, now + 30 * 86400).run();
    return jsonResp({
      ok: true,
      token,
      user: { id: u.id, email, name: u.name, avatar: u.avatar, authProvider: "google", roadmapProfile: JSON.parse(u.roadmap_profile_json || "{}"), state: JSON.parse(u.state_json || "{}") }
    });
  }

  if (path === "/api/auth/forgot-password") {
    const email = (body.email || "").trim().toLowerCase();
    const u = await env.DB.prepare("SELECT id, name FROM users WHERE email = ? AND verified = 1").bind(email).first();
    if (!u) return jsonResp({ ok: false, error: "Không tìm thấy tài khoản với email này." }, 404);
    const code = randomOtp();
    await env.DB.prepare("INSERT OR REPLACE INTO otp_codes(email, purpose, code, payload_json, expires_at) VALUES (?, 'reset', ?, '{}', ?)").bind(email, code, now + 900).run();
    const mailRes = await sendTransactionalEmail(env, email, `[D ● TOPIK] Mã khôi phục mật khẩu: ${code}`, otpHtml("Đặt lại mật khẩu D ● TOPIK", u.name, code, sender));
    return jsonResp({ ok: true, email, sender, mailSent: mailRes.sent });
  }

  if (path === "/api/auth/reset-password") {
    const email = (body.email || "").trim().toLowerCase();
    const row = await env.DB.prepare("SELECT code, expires_at FROM otp_codes WHERE email = ? AND purpose = 'reset'").bind(email).first();
    if (!row || row.expires_at < now || row.code !== (body.otp || "").trim()) {
      return jsonResp({ ok: false, error: "Mã OTP không đúng hoặc hết hạn." }, 400);
    }
    const pwHash = await pbkdf2Hash(body.newPassword || "");
    await env.DB.prepare("UPDATE users SET password_hash = ? WHERE email = ?").bind(pwHash, email).run();
    await env.DB.prepare("DELETE FROM otp_codes WHERE email = ? AND purpose = 'reset'").bind(email).run();
    const u = await env.DB.prepare("SELECT id, name, avatar, roadmap_profile_json, state_json FROM users WHERE email = ?").bind(email).first();
    const token = randomToken();
    await env.DB.prepare("INSERT INTO sessions(token, user_id, expires_at) VALUES (?, ?, ?)").bind(token, u.id, now + 30 * 86400).run();
    return jsonResp({ ok: true, token, user: { id: u.id, email, name: u.name, avatar: u.avatar, authProvider: "email", roadmapProfile: JSON.parse(u.roadmap_profile_json || "{}"), state: JSON.parse(u.state_json || "{}") } });
  }

  if (path === "/api/auth/logout") {
    bearer = bearer || extractToken(request, body);
    if (bearer) {
      await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(bearer).run();
    }
    return jsonResp({ ok: true }, 200, "");
  }

  if (path === "/api/auth/delete-account") {
    bearer = bearer || extractToken(request, body);
    const s = await env.DB.prepare("SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?").bind(bearer, now).first();
    if (!s) return jsonResp({ ok: false, error: "Phiên đăng nhập không hợp lệ." }, 401);
    const u = await env.DB.prepare("SELECT email FROM users WHERE id = ?").bind(s.user_id).first();
    await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(s.user_id).run();
    if (u && u.email) {
      await env.DB.prepare("DELETE FROM otp_codes WHERE email = ?").bind(u.email).run();
    }
    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(s.user_id).run();
    return jsonResp({ ok: true }, 200, "");
  }

  if (path === "/api/user/sync") {
    bearer = bearer || extractToken(request, body);
    const s = await env.DB.prepare("SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?").bind(bearer, now).first();
    if (!s) return jsonResp({ ok: false, error: "Unauthorized" }, 401);
    const st = body.state || {};
    const savedAt = Date.now();
    st.updatedAt = savedAt;
    await env.DB.prepare("UPDATE users SET roadmap_profile_json = ?, state_json = ? WHERE id = ?").bind(JSON.stringify(st.roadmapProfile || {}), JSON.stringify(st), s.user_id).run();
    return jsonResp({ ok: true, savedAt });
  }

  return jsonResp({ ok: false, error: "Not found" }, 404);
}
