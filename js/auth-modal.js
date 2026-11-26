import { store, DEFAULT_ROADMAP_PROFILE } from "./store.js";

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
  return `
    <div style="background:var(--primary-3);border-radius:12px;padding:14px;margin:10px 0;">
      <strong style="display:block;color:var(--primary-4);font-size:13.5px;margin-bottom:8px;">
        🌼 Thiết lập Lộ trình Cá nhân hóa riêng cho tài khoản của bạn:
      </strong>
      <div style="display:flex;flex-direction:column;gap:9px;">
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:3px;">1. Trình độ xuất phát</label>
          <select id="${prefix}-stage" class="box-select" style="width:100%;">
            <option value="zero" ${current.startStage === "zero" ? "selected" : ""}>Mất gốc / Bắt đầu từ Bảng chữ cái Hangeul</option>
            <option value="sc1" ${current.startStage === "sc1" ? "selected" : ""}>Đã biết Hangeul → Học Giáo trình Tổng Hợp Sơ cấp 1</option>
            <option value="sc2" ${current.startStage === "sc2" ? "selected" : ""}>Đã có nền cơ bản → Tăng tốc đỗ TOPIK I (Cấp 2)</option>
            <option value="tc3" ${current.startStage === "tc3" ? "selected" : ""}>Đã đỗ TOPIK I → Luyện Trung cấp TOPIK II &amp; Viết 원고지</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:600;margin-bottom:3px;">2. Trọng tâm ưu tiên</label>
          <select id="${prefix}-track" class="box-select" style="width:100%;">
            <option value="balanced" ${current.focusTrack === "balanced" ? "selected" : ""}>Song hành: Thi đỗ TOPIK + Dịch câu &amp; Shadowing</option>
            <option value="topik_intensive" ${current.focusTrack === "topik_intensive" ? "selected" : ""}>Cày 20 Đề TOPIK &amp; Bài tập dịch câu thực chiến</option>
            <option value="speaking_first" ${current.focusTrack === "speaking_first" ? "selected" : ""}>Ưu tiên Video Shadowing Shorts &amp; Phản xạ Giao tiếp</option>
          </select>
        </div>
        <div class="grid-2" style="gap:8px;">
          <div>
            <label style="display:block;font-size:12px;font-weight:600;margin-bottom:3px;">3. Thời lượng/ngày</label>
            <select id="${prefix}-mins" class="box-select" style="width:100%;">
              <option value="15" ${Number(current.dailyMinutes) === 15 ? "selected" : ""}>15 phút/ngày</option>
              <option value="30" ${Number(current.dailyMinutes) === 30 ? "selected" : ""}>30 phút/ngày</option>
              <option value="60" ${Number(current.dailyMinutes) === 60 ? "selected" : ""}>60 phút/ngày</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;margin-bottom:3px;">4. Cấp độ mục tiêu</label>
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
  if (!prefix || !container.querySelector(`#${prefix}-stage`)) return null;
  return {
    startStage: container.querySelector(`#${prefix}-stage`).value,
    focusTrack: container.querySelector(`#${prefix}-track`).value,
    dailyMinutes: Number(container.querySelector(`#${prefix}-mins`).value),
    targetLevel: container.querySelector(`#${prefix}-target`).value
  };
}

// FULL-SCREEN MANDATORY EMAIL AUTH GATE (Blocks access until user registers/logs in with Email or Google)
export async function renderMandatoryAuthGate(appRoot, onAuthenticated) {
  const cfg = await fetchAuthConfig();
  let view = "register"; // register | login | verify-otp | forgot | reset-otp
  let pendingEmail = "";
  let devOtpHint = "";
  let statusMsg = "";
  let statusType = "info";

  const draft = {
    name: "",
    email: "",
    password: "",
    ...DEFAULT_ROADMAP_PROFILE
  };

  function draw() {
    const alertHTML = statusMsg ? `
      <div style="margin-bottom:12px;padding:10px 14px;border-radius:10px;font-size:13.5px;font-weight:600;background:${statusType === "error" ? "rgba(255,90,96,0.13)" : "rgba(58,202,116,0.15)"};color:${statusType === "error" ? "var(--danger)" : "var(--primary-4)"};">
        ${statusMsg}
        ${devOtpHint ? `<div style="margin-top:6px;background:#FFF;padding:6px 10px;border-radius:8px;color:#B45309;">Mã OTP: <strong>${devOtpHint}</strong></div>` : ""}
      </div>
    ` : "";

    let formCard = "";
    if (view === "register") {
      formCard = `
        <div style="display:flex;gap:8px;margin-bottom:14px;">
          <button type="button" class="btn-skill active" style="flex:1;" data-v="register">Đăng ký Email mới</button>
          <button type="button" class="btn-skill" style="flex:1;" data-v="login">Đã có tài khoản</button>
        </div>

        <div id="gate-google-slot" style="margin-bottom:10px;">
          <button type="button" class="google-btn" id="gate-google-btn">
            ${GOOGLE_SVG}
            <span>Đăng ký / Đăng nhập nhanh bằng Google</span>
          </button>
        </div>
        <div style="text-align:center;font-size:12px;color:var(--text-muted);margin:8px 0;">— hoặc Đăng ký bằng Email cá nhân (Bắt buộc) —</div>

        <form id="gate-reg-form" style="display:flex;flex-direction:column;gap:9px;">
          <div class="grid-2" style="gap:8px;">
            <input id="gr-name" required value="${draft.name}" placeholder="Họ tên / Biệt danh..." style="padding:10px 14px;border-radius:99px;border:1.5px solid #D5DCE2;" />
            <input id="gr-email" type="email" required value="${draft.email}" placeholder="Email của bạn..." style="padding:10px 14px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          </div>
          <input id="gr-pw" type="password" required minlength="6" placeholder="Mật khẩu (tối thiểu 6 ký tự)..." style="padding:10px 14px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          ${roadmapSelectorHTML("gr", draft)}
          <button type="submit" class="btn-primary" style="width:100%;padding:12px;">
            🌼 Hoàn tất Đăng ký &amp; Mở khóa Lộ trình riêng
          </button>
        </form>
      `;
    } else if (view === "login") {
      formCard = `
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button type="button" class="btn-skill" style="flex:1;" data-v="register">Đăng ký Email mới</button>
          <button type="button" class="btn-skill active" style="flex:1;" data-v="login">Đã có tài khoản</button>
        </div>

        <button type="button" class="google-btn" id="gate-google-btn" style="margin-bottom:12px;">
          ${GOOGLE_SVG}
          <span>Đăng nhập bằng tài khoản Google</span>
        </button>

        <form id="gate-login-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="gl-email" type="email" required placeholder="Địa chỉ Email đã đăng ký..." style="padding:11px 16px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          <input id="gl-pw" type="password" required placeholder="Mật khẩu..." style="padding:11px 16px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <button type="button" data-v="forgot" style="background:none;border:none;color:var(--primary-1);font-weight:600;cursor:pointer;padding:0;">Quên mật khẩu?</button>
            <span style="color:var(--text-muted);">Hỗ trợ: ${cfg.senderEmail}</span>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;padding:12px;margin-top:4px;">Đăng nhập vào hệ thống</button>
        </form>
      `;
    } else if (view === "verify-otp") {
      formCard = `
        <h3 style="margin:0 0 8px;">Nhập mã xác thực Email</h3>
        <p style="margin:0 0 12px;font-size:14px;color:var(--text-muted);">Mã OTP 6 chữ số đã được gửi từ <strong>${cfg.senderEmail}</strong> tới <strong>${pendingEmail}</strong>:</p>
        <form id="gate-otp-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="go-otp" required maxlength="6" placeholder="6 chữ số OTP..." style="text-align:center;font-size:24px;font-weight:800;letter-spacing:6px;padding:12px;border-radius:12px;border:2px solid var(--primary);" />
          <button type="submit" class="btn-primary">Xác thực &amp; Vào học ngay</button>
          <button type="button" class="btn-outline-teal" data-v="register" style="justify-content:center;">← Quay lại</button>
        </form>
      `;
    } else if (view === "forgot") {
      formCard = `
        <h3 style="margin:0 0 8px;">Khôi phục mật khẩu</h3>
        <p style="margin:0 0 12px;font-size:14px;color:var(--text-muted);">Nhập Email đăng ký để nhận mã khôi phục từ <strong>${cfg.senderEmail}</strong>:</p>
        <form id="gate-forgot-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="gf-email" type="email" required placeholder="Địa chỉ Email của bạn..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--primary);" />
          <button type="submit" class="btn-primary">Gửi mã khôi phục</button>
          <button type="button" class="btn-outline-teal" data-v="login" style="justify-content:center;">← Quay lại Đăng nhập</button>
        </form>
      `;
    } else if (view === "reset-otp") {
      formCard = `
        <h3 style="margin:0 0 8px;">Đặt mật khẩu mới</h3>
        <form id="gate-reset-form" style="display:flex;flex-direction:column;gap:10px;">
          <input id="grs-otp" required maxlength="6" placeholder="Mã OTP 6 số..." style="text-align:center;font-size:20px;font-weight:800;letter-spacing:5px;padding:10px;border-radius:12px;border:1.5px solid var(--primary);" />
          <input id="grs-pw" type="password" required minlength="6" placeholder="Mật khẩu mới..." style="padding:11px 16px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          <button type="submit" class="btn-primary">Lưu mật khẩu &amp; Đăng nhập</button>
        </form>
      `;
    }

    appRoot.innerHTML = `
      <div class="container-web" style="padding-top:32px;">
        <div class="grid-2" style="align-items:center;gap:28px;">
          <!-- Left Pitch Card -->
          <div class="achieve-card" style="padding:30px 28px;border-radius:22px;">
            <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.18);padding:5px 14px;border-radius:99px;width:fit-content;font-size:13px;font-weight:700;">
              🌼 YÊU CẦU ĐĂNG KÝ TÀI KHOẢN EMAIL ĐỂ BẮT ĐẦU HỌC
            </div>
            <h1 style="margin:6px 0;font-size:29px;line-height:1.28;font-weight:800;">
              Hệ sinh thái Tiếng Hàn Tổng Hợp, Video Shadowing &amp; 20 Đề TOPIK Thật
            </h1>
            <p style="margin:0 0 10px;opacity:0.92;font-size:15px;">
              Đăng ký miễn phí bằng Email để hệ thống <strong>CJDUZ</strong> khởi tạo riêng cho bạn một lộ trình cá nhân hóa và lưu trữ toàn bộ tiến độ học tập:
            </p>
            <ul class="achieve-list" style="font-size:15px;gap:10px;">
              <li><span>✔</span><span><strong>Từ vựng &amp; Flashcard 3D giọng Kyuri:</strong> Cache âm thanh phản hồi tức thì, phím tắt 1–4.</span></li>
              <li><span>✔</span><span><strong>Bài tập từng chương &amp; Luyện dịch câu:</strong> Dịch câu Hàn–Việt &amp; bài tập chuẩn cấu trúc TOPIK.</span></li>
              <li><span>✔</span><span><strong>20 Đề thi TOPIK chính thức (Kỳ 37 → 102):</strong> Giọng đọc Neural Hàn tự nhiên, chuẩn thang điểm thật.</span></li>
              <li><span>✔</span><span><strong>Shadowing YouTube Shorts thực chiến:</strong> Tự động chạy phụ đề karaoke, bấm chữ tra từ &amp; tạm dừng như xem clip thật.</span></li>
              <li><span>✔</span><span><strong>Mỗi tài khoản 1 lộ trình riêng:</strong> Cá nhân hóa 100% theo trình độ &amp; quỹ thời gian của bạn.</span></li>
            </ul>
          </div>

          <!-- Right Mandatory Auth Form -->
          <div class="box-kind" style="padding:26px;border-radius:20px;">
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
      prefix: "gr",
      onSuccess: () => onAuthenticated()
    });
  }

  draw();
}

export async function openAuthModal(modalRoot, initialView = "profile", onCompleted = () => {}) {
  if (!store.isAuthenticated()) {
    modalRoot.innerHTML = "";
    onCompleted();
    return;
  }
  const u = store.session.user;
  const rp = store.state.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
  let msg = "";

  function renderProfileModal() {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="auth-modal-bg">
        <div class="modal-panel" style="max-width:520px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <strong style="font-size:18.5px;color:var(--primary-1);">🌼 Hồ sơ Học viên CJDUZ</strong>
            <button type="button" id="close-auth-modal" style="background:#F2F4F7;border:none;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;">×</button>
          </div>

          ${msg ? `<div style="margin-bottom:12px;padding:9px 12px;border-radius:8px;background:rgba(58,202,116,0.15);color:var(--primary-4);font-weight:600;font-size:13.5px;">${msg}</div>` : ""}

          <div style="display:flex;align-items:center;gap:14px;background:#F8FAFB;padding:14px;border-radius:12px;margin-bottom:12px;">
            <div style="width:48px;height:48px;border-radius:50%;background:var(--primary);color:#FFF;display:grid;place-items:center;font-weight:800;font-size:20px;">
              ${(u.name || u.email)[0].toUpperCase()}
            </div>
            <div>
              <strong style="font-size:17px;display:block;">${u.name}</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">${u.email}</span>
            </div>
          </div>

          ${roadmapSelectorHTML("prof", store.state.roadmapProfile || rp)}

          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:14px;">
            <button type="button" class="btn-primary" id="btn-save-prof">💾 Lưu lộ trình riêng</button>
            <button type="button" class="btn-outline-teal" id="btn-logout-acc" style="border-color:var(--danger);color:var(--danger);">Đăng xuất tài khoản</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { modalRoot.innerHTML = ""; onCompleted(); };
    modalRoot.querySelector("#close-auth-modal").addEventListener("click", close);
    modalRoot.querySelector("#auth-modal-bg").addEventListener("click", (e) => {
      if (e.target.id === "auth-modal-bg") close();
    });
    modalRoot.querySelector("#btn-save-prof").addEventListener("click", () => {
      const nextRp = readRoadmapInputs(modalRoot, "prof");
      store.updateRoadmapProfile(nextRp, false);
      msg = "✔ Đã cập nhật lộ trình cá nhân hóa thành công!";
      renderProfileModal();
    });
    modalRoot.querySelector("#btn-logout-acc").addEventListener("click", () => {
      store.logout();
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
          const rp = readRoadmapInputs(container, ctx.prefix) || DEFAULT_ROADMAP_PROFILE;
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential, roadmapProfile: rp, initialState: {} })
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
        const rp = readRoadmapInputs(container, ctx.prefix) || DEFAULT_ROADMAP_PROFILE;
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devGoogleEmail: testEm, roadmapProfile: rp, initialState: {} })
        });
        const data = await res.json();
        if (data.ok) {
          store.applyAuthenticatedUser(data.token, data.user);
          ctx.onSuccess();
        } else {
          ctx.setAlert(data.error);
        }
      } else {
        ctx.setAlert("Vui lòng điền Email & Mật khẩu vào biểu mẫu ngay bên dưới để đăng ký tài khoản ngay lập tức!");
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
      const rp = readRoadmapInputs(container, "gr");
      Object.assign(ctx.draft, rp);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ctx.draft.name,
          email: ctx.draft.email,
          password: ctx.draft.password,
          roadmapProfile: rp,
          initialState: {}
        })
      });
      const data = await res.json();
      if (data.ok) {
        if (data.autoActivated && data.token && data.user) {
          store.applyAuthenticatedUser(data.token, data.user);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.ok) {
        store.applyAuthenticatedUser(data.token, data.user);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ctx.getPendingEmail(), otp })
      });
      const data = await res.json();
      if (data.ok) {
        store.applyAuthenticatedUser(data.token, data.user);
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
