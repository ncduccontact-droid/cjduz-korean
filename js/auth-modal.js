import { store, BOOK_SURVEY_OPTIONS, DEFAULT_ROADMAP_PROFILE } from "./store.js?v=20261126-8";
import { ico, daisyLogoSVG } from "./icons.js?v=20261126-8";

let authConfigCache = null;

async function fetchAuthConfig() {
  if (authConfigCache) return authConfigCache;
  try {
    const res = await fetch("/api/auth/config");
    authConfigCache = await res.json();
  } catch {
    authConfigCache = { googleClientId: "", senderEmail: "nguyenchiduc2808@gmail.com", smtpConfigured: false };
  }
  return authConfigCache;
}

const GOOGLE_SVG = `
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
`;

function roadmapSelectorHTML(prefix, current) {
  const curBook = current.startBook || "q1";
  return `
    <div style="background:var(--primary-3);border:1.5px solid var(--border-card);border-radius:16px;padding:14px;margin:10px 0;">
      <strong style="display:block;color:var(--primary-4);font-size:13.5px;margin-bottom:8px;">
        ${ico("compass", 15)} Cài đặt Lộ trình học (Chọn từ Quyển mấy):
      </strong>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">1. Bắt đầu từ Quyển / Trình độ</label>
          <select id="${prefix}-book" class="box-select" style="width:100%;">
            ${BOOK_SURVEY_OPTIONS.map((b) => `
              <option value="${b.id}" ${curBook === b.id ? "selected" : ""}>${b.badge} — ${b.sub}</option>
            `).join("")}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">2. Trọng tâm ưu tiên</label>
          <select id="${prefix}-track" class="box-select" style="width:100%;">
            <option value="balanced" ${current.focusTrack === "balanced" ? "selected" : ""}>Song hành TOPIK × Giao tiếp</option>
            <option value="topik_intensive" ${current.focusTrack === "topik_intensive" ? "selected" : ""}>Chuyên sâu luyện đề TOPIK</option>
            <option value="speaking_first" ${current.focusTrack === "speaking_first" ? "selected" : ""}>Ưu tiên Shadowing Shorts &amp; Phản xạ nói</option>
          </select>
        </div>
        <div class="grid-2" style="gap:8px;">
          <div>
            <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">3. Thời lượng/ngày</label>
            <select id="${prefix}-mins" class="box-select" style="width:100%;">
              <option value="15" ${Number(current.dailyMinutes) === 15 ? "selected" : ""}>15 phút/ngày</option>
              <option value="30" ${Number(current.dailyMinutes) === 30 ? "selected" : ""}>30 phút/ngày</option>
              <option value="60" ${Number(current.dailyMinutes) === 60 ? "selected" : ""}>60 phút/ngày</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">4. Cấp độ mục tiêu</label>
            <select id="${prefix}-target" class="box-select" style="width:100%;">
              ${["TOPIK I - Cấp 1", "TOPIK I - Cấp 2", "TOPIK II - Cấp 3", "TOPIK II - Cấp 4", "TOPIK II - Cấp 5", "TOPIK II - Cấp 6"]
                .map((lv) => `<option value="${lv}" ${current.targetLevel === lv ? "selected" : ""}>${lv}</option>`)
                .join("")}
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

function readRoadmapInputs(container, prefix) {
  if (!prefix || !container.querySelector(`#${prefix}-book`)) return null;
  const startBook = container.querySelector(`#${prefix}-book`).value;
  return {
    startBook,
    focusTrack: container.querySelector(`#${prefix}-track`).value,
    dailyMinutes: Number(container.querySelector(`#${prefix}-mins`).value),
    targetLevel: container.querySelector(`#${prefix}-target`).value
  };
}

// ============================================================================
// MANDATORY POST-SIGNUP ONBOARDING SURVEY ("CHỌN LỘ TRÌNH TỪ QUYỂN MẤY?")
// ============================================================================
export function renderOnboardingSurvey(appRoot, onFinished) {
  const cur = store.state.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
  let pickedBook = cur.startBook || "q1";
  let pickedTrack = cur.focusTrack || "balanced";
  let pickedMins = Number(cur.dailyMinutes || 30);
  const userName = store.session.user?.name || "bạn";

  function draw() {
    const activeOpt = BOOK_SURVEY_OPTIONS.find((b) => b.id === pickedBook) || BOOK_SURVEY_OPTIONS[1];
    appRoot.innerHTML = `
      <div class="container-narrow" style="padding-top:26px;">
        <div class="box-kind" style="padding:26px 28px;border-radius:24px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            ${daisyLogoSVG(42)}
            <div>
              <span class="badge-orange">Bước khởi đầu · Lộ trình cá nhân</span>
              <h1 style="margin:4px 0 0;font-size:22px;font-weight:800;">
                Chào ${userName}! Bạn muốn bắt đầu học từ Quyển mấy?
              </h1>
            </div>
          </div>
          <p style="margin:0 0 16px;font-size:14px;color:var(--text-muted);">
            Chọn đúng quyển hiện tại để hệ thống tự xếp bài học mỗi ngày trên Trang chủ. Bạn luôn có thể đổi lại bất cứ lúc nào trong mục <strong>Hồ sơ học viên</strong>.
          </p>

          <strong style="font-size:14px;color:var(--primary-1);display:block;margin-bottom:8px;">
            1. Chọn điểm xuất phát trong Bộ Giáo Trình Tiếng Hàn Tổng Hợp:
          </strong>
          <div class="survey-book-grid" style="margin-bottom:18px;">
            ${BOOK_SURVEY_OPTIONS.map((b) => `
              <button type="button" class="survey-book-card ${b.id === pickedBook ? "selected" : ""}" data-sbook="${b.id}">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                  <span class="badge-orange" style="${b.id === pickedBook ? "background:var(--primary);color:#FFF;border-color:var(--primary);" : ""}">${b.badge}</span>
                  <span style="font-size:11.5px;font-weight:700;color:var(--primary-1);">${b.defaultTarget}</span>
                </div>
                <strong style="font-size:15px;display:block;color:var(--text-main);">${b.title}</strong>
                <span style="font-size:12.5px;color:var(--text-muted);">${b.sub}</span>
              </button>
            `).join("")}
          </div>

          <div class="grid-2" style="margin-bottom:20px;">
            <div>
              <strong style="font-size:13.5px;color:var(--primary-1);display:block;margin-bottom:6px;">2. Định hướng ưu tiên:</strong>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${[
                  ["balanced", "Song hành TOPIK × Giao tiếp"],
                  ["topik_intensive", "Chuyên sâu giải đề TOPIK"],
                  ["speaking_first", "Ưu tiên Shadowing Shorts & Nói"]
                ].map(([val, label]) => `
                  <button type="button" class="btn-skill ${pickedTrack === val ? "active" : ""}" data-strack="${val}" style="justify-content:flex-start;padding:8px 14px;font-size:13.5px;">
                    ${label}
                  </button>
                `).join("")}
              </div>
            </div>

            <div>
              <strong style="font-size:13.5px;color:var(--primary-1);display:block;margin-bottom:6px;">3. Quỹ thời gian mỗi ngày:</strong>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${[
                  [15, "15 phút / ngày · Nhẹ nhàng"],
                  [30, "30 phút / ngày · Tiêu chuẩn"],
                  [60, "60 phút / ngày · Tăng tốc"]
                ].map(([val, label]) => `
                  <button type="button" class="btn-skill ${pickedMins === val ? "active" : ""}" data-smins="${val}" style="justify-content:flex-start;padding:8px 14px;font-size:13.5px;">
                    ${label}
                  </button>
                `).join("")}
              </div>
            </div>
          </div>

          <button type="button" class="btn-primary" id="btn-finish-survey" style="width:100%;padding:13px;font-size:15.5px;">
            ▶ Thiết lập lộ trình từ ${activeOpt.badge} &amp; Vào học ngay
          </button>
        </div>
      </div>
    `;

    appRoot.querySelectorAll("[data-sbook]").forEach((b) => {
      b.addEventListener("click", () => { pickedBook = b.dataset.sbook; draw(); });
    });
    appRoot.querySelectorAll("[data-strack]").forEach((b) => {
      b.addEventListener("click", () => { pickedTrack = b.dataset.strack; draw(); });
    });
    appRoot.querySelectorAll("[data-smins]").forEach((b) => {
      b.addEventListener("click", () => { pickedMins = Number(b.dataset.smins); draw(); });
    });
    appRoot.querySelector("#btn-finish-survey").addEventListener("click", () => {
      store.updateRoadmapProfile({
        startBook: pickedBook,
        focusTrack: pickedTrack,
        dailyMinutes: pickedMins,
        targetLevel: activeOpt.defaultTarget
      }, true);
      onFinished();
    });
  }

  draw();
}

// ============================================================================
// MANDATORY EMAIL AUTH GATE (Clean Signup -> Followed by Book Survey!)
// ============================================================================
export async function renderMandatoryAuthGate(appRoot, onAuthenticated) {
  const cfg = await fetchAuthConfig();
  let view = "register";
  let pendingEmail = "";
  let devOtpHint = "";
  let statusMsg = "";
  let statusType = "info";

  const draft = { name: "", email: "", password: "" };

  function draw() {
    const alertHTML = statusMsg ? `
      <div style="margin-bottom:12px;padding:10px 14px;border-radius:12px;font-size:13.5px;font-weight:600;background:${statusType === "error" ? "rgba(244,63,94,0.12)" : "rgba(34,197,94,0.14)"};color:${statusType === "error" ? "var(--danger)" : "var(--primary-4)"};">
        ${statusMsg}
        ${devOtpHint ? `<div style="margin-top:6px;background:#FFF;padding:6px 10px;border-radius:8px;color:#B45309;">Mã OTP: <strong>${devOtpHint}</strong></div>` : ""}
      </div>
    ` : "";

    let formCard = "";
    if (view === "register") {
      formCard = `
        <div style="display:flex;gap:8px;margin-bottom:14px;">
          <button type="button" class="btn-skill active" style="flex:1;justify-content:center;" data-v="register">Tạo tài khoản mới</button>
          <button type="button" class="btn-skill" style="flex:1;justify-content:center;" data-v="login">Đăng nhập</button>
        </div>

        <div id="gate-google-slot" style="margin-bottom:10px;">
          <button type="button" class="google-btn" id="gate-google-btn">
            ${GOOGLE_SVG}
            <span>Tiếp tục nhanh bằng Google</span>
          </button>
        </div>
        <div style="text-align:center;font-size:12px;color:var(--text-muted);margin:10px 0;">— hoặc đăng ký bằng Email (tiếp theo sẽ chọn Quyển học) —</div>

        <form id="gate-reg-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="gr-name" required value="${draft.name}" placeholder="Họ tên / Biệt danh của bạn..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--border-card);" />
          <input id="gr-email" type="email" required value="${draft.email}" placeholder="Email cá nhân (lưu tiến độ Cloud)..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--border-card);" />
          <input id="gr-pw" type="password" required minlength="6" placeholder="Mật khẩu (tối thiểu 6 ký tự)..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--border-card);" />
          <button type="submit" class="btn-primary" style="width:100%;padding:12px;margin-top:4px;">
            Tiếp tục → Khảo sát chọn Quyển học
          </button>
        </form>
      `;
    } else if (view === "login") {
      formCard = `
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button type="button" class="btn-skill" style="flex:1;justify-content:center;" data-v="register">Tạo tài khoản mới</button>
          <button type="button" class="btn-skill active" style="flex:1;justify-content:center;" data-v="login">Đăng nhập</button>
        </div>

        <button type="button" class="google-btn" id="gate-google-btn" style="margin-bottom:12px;">
          ${GOOGLE_SVG}
          <span>Đăng nhập bằng Google</span>
        </button>

        <form id="gate-login-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="gl-email" type="email" required placeholder="Email đã đăng ký..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--border-card);" />
          <input id="gl-pw" type="password" required placeholder="Mật khẩu..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--border-card);" />
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <button type="button" data-v="forgot" style="background:none;border:none;color:var(--primary-1);font-weight:700;cursor:pointer;padding:0;">Quên mật khẩu?</button>
            <span style="color:var(--text-muted);">${cfg.senderEmail}</span>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;padding:12px;margin-top:4px;">Đăng nhập vào tài khoản</button>
        </form>
      `;
    } else if (view === "verify-otp") {
      formCard = `
        <h3 style="margin:0 0 8px;">Xác thực Email</h3>
        <p style="margin:0 0 12px;font-size:14px;color:var(--text-muted);">Nhập mã OTP 6 chữ số gửi tới <strong>${pendingEmail}</strong>:</p>
        <form id="gate-otp-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="go-otp" required maxlength="6" placeholder="6 chữ số OTP..." style="text-align:center;font-size:24px;font-weight:800;letter-spacing:6px;padding:12px;border-radius:14px;border:2px solid var(--primary);" />
          <button type="submit" class="btn-primary">Xác thực &amp; Chọn lộ trình</button>
          <button type="button" class="btn-outline-teal" data-v="register" style="justify-content:center;">← Quay lại</button>
        </form>
      `;
    } else if (view === "forgot") {
      formCard = `
        <h3 style="margin:0 0 8px;">Khôi phục mật khẩu</h3>
        <form id="gate-forgot-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="gf-email" type="email" required placeholder="Nhập Email của bạn..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--primary);" />
          <button type="submit" class="btn-primary">Gửi mã khôi phục</button>
          <button type="button" class="btn-outline-teal" data-v="login" style="justify-content:center;">← Quay lại Đăng nhập</button>
        </form>
      `;
    } else if (view === "reset-otp") {
      formCard = `
        <h3 style="margin:0 0 8px;">Đặt mật khẩu mới</h3>
        <form id="gate-reset-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="grs-otp" required maxlength="6" placeholder="Mã OTP 6 số..." style="text-align:center;font-size:20px;font-weight:800;letter-spacing:5px;padding:10px;border-radius:12px;border:1.5px solid var(--primary);" />
          <input id="grs-pw" type="password" required minlength="6" placeholder="Mật khẩu mới..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--border-card);" />
          <button type="submit" class="btn-primary">Lưu mật khẩu &amp; Đăng nhập</button>
        </form>
      `;
    }

    appRoot.innerHTML = `
      <div class="container-web" style="padding-top:28px;">
        <div class="grid-2" style="align-items:center;gap:24px;">
          <div class="achieve-card" style="padding:26px;border-radius:22px;">
            <div style="display:flex;align-items:center;gap:10px;">
              ${daisyLogoSVG(38)}
              <span class="badge-orange">${ico("cloud", 14)} Đồng bộ 100% theo tài khoản</span>
            </div>
            <h1 style="margin:6px 0 4px;font-size:24px;line-height:1.32;font-weight:800;">
              Tiếng Hàn Tổng Hợp (Quyển 1–6), Shadowing Shorts &amp; 30 Đề Full TOPIK
            </h1>
            <ul class="achieve-list" style="font-size:14px;gap:8px;">
              <li><span style="color:var(--primary);font-weight:800;">•</span><span><strong>Khảo sát xếp lộ trình riêng:</strong> Tự chọn học từ Quyển 1 → Quyển 6.</span></li>
              <li><span style="color:var(--primary);font-weight:800;">•</span><span><strong>Lật thẻ 3D tự phát âm Kyuri:</strong> Âm thanh 0ms, chấm SRS phím 1–4.</span></li>
              <li><span style="color:var(--primary);font-weight:800;">•</span><span><strong>30 Full Đề NIIED / Sejong / IBT:</strong> Đủ 70 câu TOPIK I &amp; 104 câu TOPIK II.</span></li>
              <li><span style="color:var(--primary);font-weight:800;">•</span><span><strong>Shadowing YouTube Shorts:</strong> Phụ đề tự chạy, chạm từ tra nghĩa.</span></li>
            </ul>
          </div>

          <div class="box-kind" style="padding:24px;border-radius:22px;">
            ${alertHTML}
            ${formCard}
          </div>
        </div>
      </div>
    `;

    bindAuthHandlers(appRoot, cfg, {
      getView: () => view,
      setView: (v) => { view = v; statusMsg = ""; devOtpHint = ""; draw(); },
      setAlert: (msg, t = "error", hint = "") => { statusMsg = msg; statusType = t; devOtpHint = hint; draw(); },
      getPendingEmail: () => pendingEmail,
      setPendingEmail: (em) => { pendingEmail = em; },
      draft,
      onSuccess: () => onAuthenticated()
    });
  }

  draw();
}

// ============================================================================
// HỒ SƠ HỌC VIÊN MODAL (Allows re-setting Roadmap Book Q1->Q6 anytime!)
// ============================================================================
export async function openAuthModal(modalRoot, initialView = "profile", onCompleted = () => {}) {
  if (!store.isAuthenticated()) {
    modalRoot.innerHTML = "";
    onCompleted();
    return;
  }
  const u = store.session.user;
  let msg = "";

  function renderProfileModal() {
    const rp = store.state.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="auth-modal-bg">
        <div class="modal-panel" style="max-width:540px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong style="font-size:18.5px;color:var(--primary-1);display:flex;align-items:center;gap:8px;">
              ${daisyLogoSVG(26)} Hồ sơ Học viên
            </strong>
            <button type="button" id="close-auth-modal" style="background:var(--bg-body);border:1.5px solid var(--border-card);width:34px;height:34px;border-radius:10px;font-size:18px;cursor:pointer;">×</button>
          </div>

          ${msg ? `<div style="margin-bottom:12px;padding:9px 12px;border-radius:10px;background:rgba(34,197,94,0.14);color:var(--primary-4);font-weight:700;font-size:13.5px;">${msg}</div>` : ""}

          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--bg-body);border:1px solid var(--border-card);padding:12px 14px;border-radius:14px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:42px;height:42px;border-radius:13px;background:var(--primary);color:#FFF;display:grid;place-items:center;font-weight:800;font-size:17px;">
                ${(u.name || u.email)[0].toUpperCase()}
              </div>
              <div>
                <strong style="font-size:15.5px;display:block;">${u.name}</strong>
                <span style="font-size:12.5px;color:var(--text-muted);">${u.email}</span>
              </div>
            </div>
            <span class="meta-chip" style="color:var(--primary-1);">${ico("cloud", 14)} Đã lưu Cloud</span>
          </div>

          ${roadmapSelectorHTML("prof", rp)}

          <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--text-muted);cursor:pointer;margin:8px 0 14px;">
            <input type="checkbox" id="prof-reset-day1" />
            <span>Đặt lại tiến độ lộ trình về Ngày 1 theo quyển vừa chọn</span>
          </label>

          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn-primary" id="btn-save-prof">${ico("cloud", 16)} Lưu cài đặt lộ trình</button>
            <button type="button" class="btn-outline-teal" id="btn-logout-acc" style="border-color:var(--danger);color:var(--danger);">Đăng xuất</button>
          </div>
        </div>
      </div>
    `;

    const bookSel = modalRoot.querySelector("#prof-book");
    const targetSel = modalRoot.querySelector("#prof-target");
    if (bookSel && targetSel) {
      bookSel.addEventListener("change", () => {
        const opt = BOOK_SURVEY_OPTIONS.find((b) => b.id === bookSel.value);
        if (opt) targetSel.value = opt.defaultTarget;
      });
    }

    const close = () => { modalRoot.innerHTML = ""; onCompleted(); };
    modalRoot.querySelector("#close-auth-modal").addEventListener("click", close);
    modalRoot.querySelector("#auth-modal-bg").addEventListener("click", (e) => {
      if (e.target.id === "auth-modal-bg") close();
    });
    modalRoot.querySelector("#btn-save-prof").addEventListener("click", () => {
      const nextRp = readRoadmapInputs(modalRoot, "prof");
      const resetDays = Boolean(modalRoot.querySelector("#prof-reset-day1")?.checked);
      store.updateRoadmapProfile(nextRp, resetDays);
      msg = "✔ Đã cập nhật lộ trình học vào Hồ sơ học viên!";
      renderProfileModal();
    });
    modalRoot.querySelector("#btn-logout-acc").addEventListener("click", async () => {
      await store.logout();
      close();
    });
  }

  renderProfileModal();
}

function bindAuthHandlers(container, cfg, ctx) {
  container.querySelectorAll("[data-v]").forEach((b) => {
    b.addEventListener("click", () => ctx.setView(b.dataset.v));
  });

  const googleBtn = container.querySelector("#gate-google-btn");
  if (googleBtn) {
    if (cfg.googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: async (response) => {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential, roadmapProfile: DEFAULT_ROADMAP_PROFILE, initialState: { onboardingCompleted: false } })
          });
          const data = await res.json();
          if (data.ok) {
            store.applyAuthenticatedUser(data.token, data.user);
            ctx.onSuccess();
          } else {
            ctx.setAlert(data.error || "Đăng nhập Google không thành công.");
          }
        }
      });
      const slot = container.querySelector("#gate-google-slot");
      if (slot) {
        window.google.accounts.id.renderButton(slot, { theme: "outline", size: "large", shape: "pill", width: 420 });
      }
    }
    googleBtn.addEventListener("click", async () => {
      if (cfg.googleClientId && window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
        return;
      }
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        const testEm = window.prompt("Nhập Gmail thử nghiệm trên localhost:", "hocvien@gmail.com");
        if (!testEm) return;
        const res = await fetch("/api/auth/google", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devGoogleEmail: testEm, roadmapProfile: DEFAULT_ROADMAP_PROFILE, initialState: { onboardingCompleted: false } })
        });
        const data = await res.json();
        if (data.ok) {
          store.applyAuthenticatedUser(data.token, data.user);
          ctx.onSuccess();
        } else {
          ctx.setAlert(data.error);
        }
      } else {
        ctx.setAlert("Điền Email & Mật khẩu bên dưới để tạo tài khoản và chọn Quyển học ngay!");
      }
    });
  }

  const regForm = container.querySelector("#gate-reg-form");
  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      ctx.draft.name = container.querySelector("#gr-name").value.trim();
      ctx.draft.email = container.querySelector("#gr-email").value.trim();
      ctx.draft.password = container.querySelector("#gr-pw").value;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ctx.draft.name,
          email: ctx.draft.email,
          password: ctx.draft.password,
          roadmapProfile: DEFAULT_ROADMAP_PROFILE,
          initialState: { onboardingCompleted: false }
        })
      });
      const data = await res.json();
      if (data.ok) {
        if (data.autoActivated && data.token && data.user) {
          store.applyAuthenticatedUser(data.token, data.user);
          store.state.onboardingCompleted = false;
          ctx.onSuccess();
          return;
        }
        ctx.setPendingEmail(data.email);
        ctx.setView("verify-otp");
        ctx.setAlert(`Đã gửi mã OTP từ ${data.sender} tới ${data.email}`, "ok", data.devOtpPreview || "");
      } else {
        ctx.setAlert(data.error || "Đăng ký thất bại.");
      }
    });
  }

  const loginForm = container.querySelector("#gate-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = container.querySelector("#gl-email").value.trim();
      const password = container.querySelector("#gl-pw").value;
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.ok) {
        store.applyAuthenticatedUser(data.token, data.user);
        // Existing users who already had roadmapProfile without explicit onboardingCompleted=false skip straight in unless startBook wasn't chosen
        if (data.user.state && data.user.state.onboardingCompleted === undefined && data.user.state.roadmapProfile?.startBook) {
          store.state.onboardingCompleted = true;
        }
        ctx.onSuccess();
      } else {
        ctx.setAlert(data.error || "Email hoặc mật khẩu không đúng.");
      }
    });
  }

  const otpForm = container.querySelector("#gate-otp-form");
  if (otpForm) {
    otpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const otp = container.querySelector("#go-otp").value.trim();
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ctx.getPendingEmail(), otp })
      });
      const data = await res.json();
      if (data.ok) {
        store.applyAuthenticatedUser(data.token, data.user);
        store.state.onboardingCompleted = false;
        ctx.onSuccess();
      } else {
        ctx.setAlert(data.error || "Mã OTP không hợp lệ.");
      }
    });
  }

  const forgotForm = container.querySelector("#gate-forgot-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = container.querySelector("#gf-email").value.trim();
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.ok) {
        ctx.setPendingEmail(data.email);
        ctx.setView("reset-otp");
        ctx.setAlert(data.mailSent ? `Đã gửi mã khôi phục tới ${data.email}` : "Đã tạo mã khôi phục.", "ok", data.devOtpPreview || "");
      } else {
        ctx.setAlert(data.error || "Không tìm thấy tài khoản.");
      }
    });
  }

  const resetForm = container.querySelector("#gate-reset-form");
  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const otp = container.querySelector("#grs-otp").value.trim();
      const newPassword = container.querySelector("#grs-pw").value;
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ctx.getPendingEmail(), otp, newPassword })
      });
      const data = await res.json();
      if (data.ok) {
        store.applyAuthenticatedUser(data.token, data.user);
        ctx.onSuccess();
      } else {
        ctx.setAlert(data.error || "Không thể đặt lại mật khẩu.");
      }
    });
  }
}
