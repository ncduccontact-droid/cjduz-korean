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

export async function openAuthModal(modalRoot, initialView = null, onCompleted = () => {}) {
  const cfg = await fetchAuthConfig();
  let view = initialView || (store.session.mode === "user" ? "profile" : "login"); // login | register | verify-otp | forgot | reset-otp | profile
  let pendingEmail = "";
  let devOtpHint = "";
  let statusMsg = "";
  let statusType = "info"; // info | error | ok

  let regDraft = {
    name: "",
    email: "",
    password: "",
    startStage: store.state.roadmapProfile?.startStage || DEFAULT_ROADMAP_PROFILE.startStage,
    focusTrack: store.state.roadmapProfile?.focusTrack || DEFAULT_ROADMAP_PROFILE.focusTrack,
    dailyMinutes: store.state.roadmapProfile?.dailyMinutes || DEFAULT_ROADMAP_PROFILE.dailyMinutes,
    targetLevel: store.state.targetLevel || DEFAULT_ROADMAP_PROFILE.targetLevel
  };

  function setStatus(msg, type = "info") {
    statusMsg = msg;
    statusType = type;
  }

  function closeModal() {
    modalRoot.innerHTML = "";
    onCompleted();
  }

  function roadmapSelectorHTML(prefix, current) {
    return `
      <div style="background:var(--primary-3);border-radius:12px;padding:14px;margin:12px 0;">
        <strong style="display:block;color:var(--primary-4);font-size:14px;margin-bottom:10px;">
          🌼 Thiết lập Lộ trình Cá nhân hóa riêng cho tài khoản này:
        </strong>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div>
            <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:4px;">1. Xuất phát điểm hiện tại của bạn</label>
            <select id="${prefix}-stage" class="box-select" style="width:100%;">
              <option value="zero" ${current.startStage === "zero" ? "selected" : ""}>Mất gốc / Học từ Bảng chữ cái Hangeul &amp; Biến âm</option>
              <option value="sc1" ${current.startStage === "sc1" ? "selected" : ""}>Đã biết Hangeul → Học Giáo trình Tổng Hợp Sơ cấp 1</option>
              <option value="sc2" ${current.startStage === "sc2" ? "selected" : ""}>Đã có nền cơ bản → Tăng tốc đỗ TOPIK I (Cấp 2)</option>
              <option value="tc3" ${current.startStage === "tc3" ? "selected" : ""}>Đã đỗ TOPIK I → Luyện Trung cấp TOPIK II &amp; Viết 원고지</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:4px;">2. Trọng tâm lộ trình ưu tiên</label>
            <select id="${prefix}-track" class="box-select" style="width:100%;">
              <option value="balanced" ${current.focusTrack === "balanced" ? "selected" : ""}>Song hành cả 2: Thi đỗ TOPIK + Giao tiếp phản xạ</option>
              <option value="topik_intensive" ${current.focusTrack === "topik_intensive" ? "selected" : ""}>Cày điểm TOPIK thực chiến (Tăng cấu trúc đề &amp; câu tủ)</option>
              <option value="speaking_first" ${current.focusTrack === "speaking_first" ? "selected" : ""}>Ưu tiên Nghe – Nói – Shadowing giao tiếp đời sống</option>
            </select>
          </div>
          <div class="grid-2" style="gap:10px;">
            <div>
              <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:4px;">3. Quỹ thời gian/ngày</label>
              <select id="${prefix}-mins" class="box-select" style="width:100%;">
                <option value="15" ${Number(current.dailyMinutes) === 15 ? "selected" : ""}>15 phút/ngày (10 từ)</option>
                <option value="30" ${Number(current.dailyMinutes) === 30 ? "selected" : ""}>30 phút/ngày (20 từ)</option>
                <option value="60" ${Number(current.dailyMinutes) === 60 ? "selected" : ""}>60 phút/ngày (35 từ)</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:12.5px;font-weight:600;margin-bottom:4px;">4. Cấp độ mục tiêu</label>
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

  function render() {
    const statusBanner = statusMsg ? `
      <div style="margin-bottom:14px;padding:10px 14px;border-radius:10px;font-size:13.5px;font-weight:600;background:${statusType === "error" ? "rgba(255,90,96,0.13)" : (statusType === "ok" ? "rgba(58,202,116,0.16)" : "var(--primary-3)")};color:${statusType === "error" ? "var(--danger)" : "var(--primary-4)"};">
        ${statusMsg}
        ${devOtpHint ? `<div style="margin-top:6px;padding:6px 10px;background:#FFF;border-radius:8px;color:#B45309;">🔑 Chế độ xem thử cục bộ (chưa điền App Password Gmail): Mã OTP là <strong style="font-size:16px;letter-spacing:2px;">${devOtpHint}</strong></div>` : ""}
      </div>
    ` : "";

    let bodyHTML = "";

    if (view === "profile" && store.session.user) {
      const u = store.session.user;
      const rp = store.state.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
      bodyHTML = `
        <div style="display:flex;align-items:center;gap:14px;background:#F8FAFB;padding:14px;border-radius:12px;margin-bottom:14px;">
          <div style="width:48px;height:48px;border-radius:50%;background:var(--primary);color:#FFF;display:grid;place-items:center;font-weight:800;font-size:20px;">
            ${(u.name || u.email)[0].toUpperCase()}
          </div>
          <div>
            <strong style="font-size:17px;display:block;">${u.name}</strong>
            <span style="font-size:13.5px;color:var(--text-muted);">${u.email} · Kết nối qua ${u.authProvider === "google" ? "Google" : "Email đã xác thực"}</span>
          </div>
        </div>

        ${roadmapSelectorHTML("prof", rp)}

        <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:14px;">
          <button type="button" class="btn-primary" id="btn-save-profile-roadmap">💾 Cập nhật lộ trình riêng của tôi</button>
          <button type="button" class="btn-outline-teal" id="btn-logout-account" style="border-color:var(--danger);color:var(--danger);">Đăng xuất / Đổi tài khoản</button>
        </div>
      `;
    } else if (view === "login") {
      bodyHTML = `
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button type="button" class="btn-skill active" style="flex:1;" data-v="login">Đăng nhập</button>
          <button type="button" class="btn-skill" style="flex:1;" data-v="register">Đăng ký lộ trình mới</button>
        </div>

        <div id="google-gsi-slot" style="margin-bottom:12px;">
          <button type="button" class="google-btn" id="btn-google-oauth">
            ${GOOGLE_SVG}
            <span>Tiếp tục nhanh bằng tài khoản Google</span>
          </button>
        </div>

        <div style="text-align:center;font-size:12.5px;color:var(--text-muted);margin:12px 0;">— hoặc dùng Email cá nhân —</div>

        <form id="form-login" style="display:flex;flex-direction:column;gap:10px;">
          <input id="login-email" type="email" required placeholder="Địa chỉ Email của bạn..." style="padding:11px 16px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          <input id="login-pw" type="password" required placeholder="Mật khẩu..." style="padding:11px 16px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:13.5px;">
            <button type="button" id="link-forgot-pw" style="background:none;border:none;color:var(--primary-1);font-weight:600;cursor:pointer;padding:0;">Quên mật khẩu?</button>
            <span style="color:var(--text-muted);font-size:12px;">Hỗ trợ bởi ${cfg.senderEmail}</span>
          </div>
          <button type="submit" class="btn-primary" style="width:100%;margin-top:4px;">Đăng nhập vào lộ trình của tôi</button>
        </form>

        <div style="border-top:1px solid #EEE;margin-top:16px;padding-top:14px;text-align:center;">
          <button type="button" class="btn-outline-teal" id="btn-continue-trial" style="width:100%;justify-content:center;">
            🌼 Tiếp tục chế độ Dùng thử miễn phí (Chưa cần đăng ký)
          </button>
        </div>
      `;
    } else if (view === "register") {
      bodyHTML = `
        <div style="display:flex;gap:8px;margin-bottom:14px;">
          <button type="button" class="btn-skill" style="flex:1;" data-v="login">Đăng nhập</button>
          <button type="button" class="btn-skill active" style="flex:1;" data-v="register">Đăng ký lộ trình mới</button>
        </div>

        <button type="button" class="google-btn" id="btn-google-oauth" style="margin-bottom:12px;">
          ${GOOGLE_SVG}
          <span>Đăng ký 1 chạm bằng Google (Lưu lộ trình bên dưới)</span>
        </button>

        <form id="form-register" style="display:flex;flex-direction:column;gap:10px;">
          <div class="grid-2" style="gap:10px;">
            <input id="reg-name" required value="${regDraft.name}" placeholder="Tên hiển thị của bạn..." style="padding:10px 15px;border-radius:99px;border:1.5px solid #D5DCE2;" />
            <input id="reg-email" type="email" required value="${regDraft.email}" placeholder="Email nhận mã xác thực..." style="padding:10px 15px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          </div>
          <input id="reg-pw" type="password" required minlength="6" placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)..." style="padding:10px 15px;border-radius:99px;border:1.5px solid #D5DCE2;" />

          ${roadmapSelectorHTML("reg", regDraft)}

          <button type="submit" class="btn-primary" style="width:100%;">
            📩 Gửi mã xác thực đăng ký từ ${cfg.senderEmail}
          </button>
        </form>
      `;
    } else if (view === "verify-otp") {
      bodyHTML = `
        <p style="margin:0 0 12px;font-size:14.5px;color:var(--text-muted);">
          Hệ thống <strong>${cfg.senderEmail}</strong> đã tạo mã xác thực 6 chữ số gửi tới <strong>${pendingEmail}</strong>. Nhập mã bên dưới để kích hoạt tài khoản &amp; lộ trình riêng:
        </p>
        <form id="form-verify-otp" style="display:flex;flex-direction:column;gap:12px;">
          <input id="otp-code-inp" required maxlength="6" placeholder="Nhập 6 chữ số OTP..." style="text-align:center;font-size:24px;font-weight:800;letter-spacing:6px;padding:12px;border-radius:12px;border:2px solid var(--primary);" />
          <button type="submit" class="btn-primary">✔ Xác thực &amp; Bắt đầu học ngay</button>
          <button type="button" class="btn-outline-teal" data-v="register" style="justify-content:center;">← Quay lại sửa Email</button>
        </form>
      `;
    } else if (view === "forgot") {
      bodyHTML = `
        <h3 style="margin:0 0 6px;font-size:18px;">Khôi phục mật khẩu qua Email</h3>
        <p style="margin:0 0 14px;font-size:14px;color:var(--text-muted);">
          Nhập email bạn đã đăng ký — hệ thống sẽ dùng địa chỉ <strong>${cfg.senderEmail}</strong> gửi mã khôi phục mật khẩu cho bạn.
        </p>
        <form id="form-forgot" style="display:flex;flex-direction:column;gap:10px;">
          <input id="forgot-email" type="email" required placeholder="Nhập địa chỉ Email đã đăng ký..." style="padding:11px 16px;border-radius:99px;border:1.5px solid var(--primary);" />
          <button type="submit" class="btn-primary">📩 Nhận mã khôi phục mật khẩu</button>
          <button type="button" class="btn-outline-teal" data-v="login" style="justify-content:center;">← Quay lại Đăng nhập</button>
        </form>
      `;
    } else if (view === "reset-otp") {
      bodyHTML = `
        <h3 style="margin:0 0 6px;font-size:18px;">Đặt lại mật khẩu mới</h3>
        <p style="margin:0 0 12px;font-size:14px;color:var(--text-muted);">
          Nhập mã OTP đã gửi tới <strong>${pendingEmail}</strong> và mật khẩu mới của bạn:
        </p>
        <form id="form-reset-pw" style="display:flex;flex-direction:column;gap:10px;">
          <input id="reset-otp-inp" required maxlength="6" placeholder="Mã OTP 6 số..." style="text-align:center;font-size:20px;font-weight:800;letter-spacing:5px;padding:10px;border-radius:12px;border:1.5px solid var(--primary);" />
          <input id="reset-new-pw" type="password" required minlength="6" placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..." style="padding:11px 16px;border-radius:99px;border:1.5px solid #D5DCE2;" />
          <button type="submit" class="btn-primary">Lưu mật khẩu mới &amp; Đăng nhập</button>
        </form>
      `;
    }

    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="auth-modal-bg">
        <div class="modal-panel" style="max-width:540px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <strong style="font-size:18.5px;color:var(--primary-1);">🌼 Tài khoản &amp; Lộ trình Cá nhân CJDUZ</strong>
            <button type="button" id="close-auth-modal" style="background:#F2F4F7;border:none;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;">×</button>
          </div>
          ${statusBanner}
          ${bodyHTML}
        </div>
      </div>
    `;

    modalRoot.querySelector("#close-auth-modal").addEventListener("click", closeModal);
    modalRoot.querySelector("#auth-modal-bg").addEventListener("click", (e) => {
      if (e.target.id === "auth-modal-bg") closeModal();
    });

    modalRoot.querySelectorAll("[data-v]").forEach((b) => {
      b.addEventListener("click", () => {
        view = b.dataset.v;
        statusMsg = "";
        devOtpHint = "";
        render();
      });
    });

    const trialBtn = modalRoot.querySelector("#btn-continue-trial");
    if (trialBtn) {
      trialBtn.addEventListener("click", () => {
        store.logoutToTrial();
        closeModal();
      });
    }

    const forgotLink = modalRoot.querySelector("#link-forgot-pw");
    if (forgotLink) {
      forgotLink.addEventListener("click", () => { view = "forgot"; statusMsg = ""; render(); });
    }

    // Google OAuth Handler (Real Google Identity Services if GOOGLE_CLIENT_ID is set, or Local Dev Dialog on localhost)
    const googleBtn = modalRoot.querySelector("#btn-google-oauth");
    if (googleBtn) {
      if (cfg.googleClientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: cfg.googleClientId,
          callback: async (response) => {
            const rp = readRoadmapInputs(modalRoot, view === "register" ? "reg" : null) || store.state.roadmapProfile;
            const res = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: response.credential, roadmapProfile: rp, initialState: store.state })
            });
            const data = await res.json();
            if (data.ok) {
              store.applyAuthenticatedUser(data.token, data.user);
              closeModal();
            } else {
              setStatus(data.error || "Đăng nhập Google thất bại", "error");
              render();
            }
          }
        });
        const slot = modalRoot.querySelector("#google-gsi-slot");
        if (slot) {
          window.google.accounts.id.renderButton(slot, { theme: "outline", size: "large", shape: "pill", width: 460 });
        }
      }

      googleBtn.addEventListener("click", async () => {
        if (cfg.googleClientId && window.google?.accounts?.id) {
          window.google.accounts.id.prompt();
          return;
        }
        // On localhost preview before GOOGLE_CLIENT_ID is pasted into .env, allow instant test with any Gmail!
        const testEmail = window.prompt("Nhập địa chỉ Gmail để đăng nhập thử nghiệm nhanh trên localhost (Khi lên docusync.online và điền GOOGLE_CLIENT_ID sẽ mở popup Google chính thức):", "hocvien.demo@gmail.com");
        if (!testEmail) return;
        const rp = readRoadmapInputs(modalRoot, view === "register" ? "reg" : null) || store.state.roadmapProfile;
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ devGoogleEmail: testEmail, roadmapProfile: rp, initialState: store.state })
        });
        const data = await res.json();
        if (data.ok) {
          store.applyAuthenticatedUser(data.token, data.user);
          closeModal();
        } else {
          setStatus(data.error, "error");
          render();
        }
      });
    }

    // Login Form
    const formLogin = modalRoot.querySelector("#form-login");
    if (formLogin) {
      formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = modalRoot.querySelector("#login-email").value;
        const password = modalRoot.querySelector("#login-pw").value;
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.ok) {
          store.applyAuthenticatedUser(data.token, data.user);
          closeModal();
        } else {
          setStatus(data.error, "error");
          render();
        }
      });
    }

    // Register Form
    const formReg = modalRoot.querySelector("#form-register");
    if (formReg) {
      formReg.addEventListener("submit", async (e) => {
        e.preventDefault();
        regDraft.name = modalRoot.querySelector("#reg-name").value;
        regDraft.email = modalRoot.querySelector("#reg-email").value;
        regDraft.password = modalRoot.querySelector("#reg-pw").value;
        const rp = readRoadmapInputs(modalRoot, "reg");
        Object.assign(regDraft, rp);

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: regDraft.name,
            email: regDraft.email,
            password: regDraft.password,
            roadmapProfile: rp,
            initialState: store.session.mode === "trial" ? store.state : {}
          })
        });
        const data = await res.json();
        if (data.ok) {
          pendingEmail = data.email;
          devOtpHint = data.devOtpPreview || "";
          setStatus(
            data.mailSent
              ? `Đã gửi email chứa mã OTP từ ${data.sender} tới ${data.email}!`
              : `Đã khởi tạo mã xác thực từ ${data.sender}.`,
            "ok"
          );
          view = "verify-otp";
          render();
        } else {
          setStatus(data.error, "error");
          render();
        }
      });
    }

    // Verify OTP Form
    const formVerify = modalRoot.querySelector("#form-verify-otp");
    if (formVerify) {
      formVerify.addEventListener("submit", async (e) => {
        e.preventDefault();
        const otp = modalRoot.querySelector("#otp-code-inp").value;
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: pendingEmail, otp })
        });
        const data = await res.json();
        if (data.ok) {
          store.applyAuthenticatedUser(data.token, data.user);
          closeModal();
        } else {
          setStatus(data.error, "error");
          render();
        }
      });
    }

    // Forgot Password Form
    const formForgot = modalRoot.querySelector("#form-forgot");
    if (formForgot) {
      formForgot.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = modalRoot.querySelector("#forgot-email").value;
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.ok) {
          pendingEmail = data.email;
          devOtpHint = data.devOtpPreview || "";
          setStatus(
            data.mailSent
              ? `Đã gửi mã khôi phục từ ${data.sender} tới ${data.email}!`
              : `Đã tạo mã khôi phục mật khẩu từ ${data.sender}.`,
            "ok"
          );
          view = "reset-otp";
          render();
        } else {
          setStatus(data.error, "error");
          render();
        }
      });
    }

    // Reset Password Form
    const formReset = modalRoot.querySelector("#form-reset-pw");
    if (formReset) {
      formReset.addEventListener("submit", async (e) => {
        e.preventDefault();
        const otp = modalRoot.querySelector("#reset-otp-inp").value;
        const newPassword = modalRoot.querySelector("#reset-new-pw").value;
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: pendingEmail, otp, newPassword })
        });
        const data = await res.json();
        if (data.ok) {
          store.applyAuthenticatedUser(data.token, data.user);
          closeModal();
        } else {
          setStatus(data.error, "error");
          render();
        }
      });
    }

    // Profile Roadmap Update & Logout
    const saveProfBtn = modalRoot.querySelector("#btn-save-profile-roadmap");
    if (saveProfBtn) {
      saveProfBtn.addEventListener("click", () => {
        const rp = readRoadmapInputs(modalRoot, "prof");
        store.updateRoadmapProfile(rp, false);
        setStatus("✔ Đã lưu lộ trình cá nhân hóa mới cho tài khoản của bạn!", "ok");
        render();
      });
    }
    const logoutBtn = modalRoot.querySelector("#btn-logout-account");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        store.logoutToTrial();
        closeModal();
      });
    }
  }

  render();
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
