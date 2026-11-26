import { store } from "../store.js?v=20261126-8";
import { ico, daisyLogoSVG } from "../icons.js?v=20261126-8";
import { getGuidedStudyPlan, STAGE_LABELS } from "./roadmap.js?v=20261126-8";

export function renderHomeView(root, db, navigate, startGuidedStep = null, openProfileSettings = null, modalRoot = null) {
  const s = store.state;
  const allVocab = [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank];
  const masteredCount = allVocab.filter((c) => store.isMastered(c.id)).length;
  const dueCount = store.getDueCardIds(allVocab).length;
  const daysLeft = Math.max(0, Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000));

  const plan = getGuidedStudyPlan(db, navigate, startGuidedStep);
  const { profile, days, activeDay, nextTask, completedDaysCount } = plan;
  const roadmapPct = Math.round((completedDaysCount / days.length) * 100);
  const activeBookLabel = STAGE_LABELS[profile.startBook] || STAGE_LABELS[profile.startStage] || STAGE_LABELS.q1;

  const levels = [
    {
      badge: "TOPIK 1", sub: "Quyển 1 · Sơ cấp 1",
      items: [
        `Thuộc ${db.sc1Vocab.filter(c => store.isMastered(c.id)).length}/${db.sc1Vocab.length} từ Kyuri`,
        `${db.sc1Grammar.length} ngữ pháp nền tảng`,
        "Hangeul & 7 quy tắc biến âm"
      ],
      action: () => navigate("theory", { sub: "vocab-book", book: "sc1" })
    },
    {
      badge: "TOPIK 2", sub: "Quyển 2 · Sơ cấp 2",
      items: [
        `${db.topik1Bank.length} câu điền khuyết TOPIK I`,
        `${db.sejongVocab.length} từ giao tiếp Sejong`,
        "Mục tiêu ≥ 140/200đ TOPIK I"
      ],
      action: () => navigate("theory", { sub: "vocab-book", book: "topik1" })
    },
    {
      badge: "TOPIK 3", sub: "Quyển 3 · Trung cấp 1",
      items: [
        "Gốc từ Âm Hán – Hàn",
        "Tường thuật gián tiếp & liên từ",
        "Làm chủ Câu 1–20 TOPIK II"
      ],
      action: () => navigate("theory", { sub: "hanja" })
    },
    {
      badge: "TOPIK 4", sub: "Quyển 4 · Trung cấp 2",
      items: [
        "Từ đồng nghĩa & quán dụng ngữ",
        "Viết 원고지 Câu 51, 52 & 53",
        "Mục tiêu ≥ 150/300đ TOPIK II"
      ],
      action: () => navigate("practice", { sub: "topik2", skill: "writing" })
    },
    {
      badge: "TOPIK 5", sub: "Quyển 5 · Cao cấp 1",
      items: [
        "Đọc báo chí, kinh tế & xã hội",
        "Chuyên sâu Câu 32–50 TOPIK II",
        "Nghị luận 600–700 chữ (Câu 54)"
      ],
      action: () => navigate("mock-test", { sub: "topik2", viewMode: "exams", category: "curated" })
    },
    {
      badge: "TOPIK 6", sub: "Quyển 6 · Cao cấp 2",
      items: [
        "Hán–Hàn học thuật & thành ngữ",
        "Thi Full 104 câu bấm giờ thật",
        "Chinh phục mốc 230+/300 điểm"
      ],
      action: () => navigate("check-tools")
    }
  ];

  root.innerHTML = `
    <div class="container-web">
      <!-- SMART TODAY'S GUIDED STUDY PLAN ("HÔM NAY HỌC GÌ & HỌC TIẾP THEO CÁI GÌ?") -->
      <section class="today-plan-grid" style="margin-bottom:24px;">
        <div class="box-kind" style="background:linear-gradient(135deg,var(--primary-3) 0%,#FFFFFF 65%);padding:20px 22px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="badge-orange">📍 Hôm nay · Ngày ${activeDay.day}/30</span>
              <strong style="font-size:16.5px;color:var(--primary-1);">${activeDay.shortTopic}</strong>
            </div>
            <span class="meta-chip" style="background:#FFFFFF;color:var(--primary-1);">
              Đã xong ${activeDay.doneSteps}/${activeDay.totalSteps} bước hôm nay
            </span>
          </div>

          <div class="next-up-spotlight">
            <div>
              <div style="font-size:12px;font-weight:800;color:var(--yellow-lip);margin-bottom:3px;">
                HỌC TIẾP THEO · BƯỚC ${nextTask.stepIdx + 1}/${activeDay.totalSteps}
              </div>
              <strong style="font-size:18px;display:block;color:var(--text-main);margin-bottom:2px;">
                ${nextTask.label}
              </strong>
              <span style="font-size:13px;color:var(--text-muted);">${nextTask.hint}</span>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="btn-primary" id="btn-start-next-step" style="padding:10px 20px;font-size:14.5px;">
                ▶ Vào học Bước ${nextTask.stepIdx + 1} ngay
              </button>
              ${dueCount > 0 ? `
                <button type="button" class="btn-orange" id="btn-home-due-srs">
                  ${ico("cards", 16)} Ôn ${dueCount} từ đến hạn
                </button>
              ` : ""}
            </div>
          </div>

          <div class="today-stepper">
            ${activeDay.tasks.map((t) => {
              const isNext = !t.done && t.stepIdx === nextTask.stepIdx;
              return `
                <div class="today-step-row ${t.done ? "is-done" : (isNext ? "is-next" : "")}">
                  <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                    <button type="button" class="step-check-btn ${t.done ? "checked" : ""}" data-home-chk="${activeDay.day}" data-sidx="${t.stepIdx}" data-stotal="${activeDay.totalSteps}" title="Đánh dấu xong bước này">✓</button>
                    <div style="min-width:0;">
                      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:11.5px;font-weight:800;color:${t.done ? "#15803D" : (isNext ? "#B45309" : "var(--primary-1)")};">
                          ${t.tag}
                        </span>
                        <span style="font-size:12px;color:var(--text-muted);">· ${t.hint}</span>
                      </div>
                      <strong style="font-size:14.5px;display:block;${t.done ? "text-decoration:line-through;color:var(--text-muted);" : "color:var(--text-main);"}">
                        ${t.label}
                      </strong>
                    </div>
                  </div>

                  <button type="button" class="${isNext ? "btn-orange" : "btn-outline-teal"}" data-home-go="${t.stepIdx}" style="padding:6px 14px;font-size:13px;flex-shrink:0;">
                    ${t.done ? "Xem lại" : (isNext ? "Học tiếp →" : "Mở")}
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- RIGHT: OVERALL ROADMAP SUMMARY & PROFILE RESET -->
        <div class="box-kind" style="display:flex;flex-direction:column;justify-content:space-between;padding:20px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <strong style="font-size:16px;color:var(--primary-1);">${ico("compass", 18)} Lộ trình của bạn</strong>
              <span class="meta-chip" style="color:var(--primary-1);">${ico("cloud", 13)} Tự lưu Cloud</span>
            </div>

            <div style="background:var(--bg-body);border:1px solid var(--border-card);border-radius:14px;padding:12px 14px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
                <span>Đang theo: <strong>${activeBookLabel}</strong></span>
                <strong style="color:var(--primary-1);">${completedDaysCount}/30 ngày (${roadmapPct}%)</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${roadmapPct}%"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--text-muted);margin-top:8px;">
                <span>Đã thuộc: <strong style="color:var(--text-main);">${masteredCount} từ</strong></span>
                <span>Còn <strong style="color:var(--text-main);">${daysLeft} ngày</strong> thi</span>
              </div>
            </div>

            <label style="font-size:12px;font-weight:700;color:var(--text-muted);display:block;margin-bottom:4px;">Mục tiêu &amp; Ngày thi dự kiến</label>
            <select id="home-target-select" class="box-select" style="width:100%;margin-bottom:8px;">
              ${["TOPIK I - Cấp 1", "TOPIK I - Cấp 2", "TOPIK II - Cấp 3", "TOPIK II - Cấp 4", "TOPIK II - Cấp 5", "TOPIK II - Cấp 6"]
                .map((lv) => `<option value="${lv}" ${s.targetLevel === lv ? "selected" : ""}>${lv}</option>`)
                .join("")}
            </select>
            <input type="date" id="home-exam-date" value="${s.examDate}" style="width:100%;padding:7px 12px;border-radius:99px;border:1.5px solid var(--border-card);font-size:13.5px;font-weight:600;" />
          </div>

          <div style="display:flex;flex-direction:column;gap:7px;margin-top:12px;">
            <button type="button" class="btn-outline-teal" id="btn-open-roadmap" style="width:100%;justify-content:center;padding:7px 12px;font-size:13px;">
              ${ico("compass", 15)} Xem chi tiết 30 ngày
            </button>
            <button type="button" class="btn-outline-teal" id="btn-home-edit-profile" style="width:100%;justify-content:center;padding:7px 12px;font-size:13px;">
              ${ico("user", 15)} Đổi Quyển học (Hồ sơ học viên)
            </button>
          </div>
        </div>
      </section>

      <!-- 4 Core Study Modules -->
      <div class="section-head">
        <h2>Tự chọn học phần nhanh</h2>
      </div>
      <div class="grid-2">
        <div class="theory-card" data-quick="vocab-review">
          <div style="display:flex;align-items:center;gap:13px;">
            <div class="icon-vocab-badge">${ico("cards", 22)}</div>
            <div>
              <strong style="font-size:16.5px;display:block;">Lật thẻ 3D Từ vựng Kyuri</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">Lật thẻ tự phát âm · Phím tắt 1–4</span>
            </div>
          </div>
          <span class="meta-chip" style="color:var(--primary-1);">Học ngay</span>
        </div>

        <div class="theory-card" data-quick="chapter-translate">
          <div style="display:flex;align-items:center;gap:13px;">
            <div class="icon-grammar-badge">${ico("pen", 22)}</div>
            <div>
              <strong style="font-size:16.5px;display:block;">Bài tập chương &amp; Dịch câu</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">Dịch Việt → Hàn &amp; câu chuẩn TOPIK</span>
            </div>
          </div>
          <span class="meta-chip" style="color:#B45309;">15 chương</span>
        </div>

        <div class="theory-card" data-quick="shorts-shadowing">
          <div style="display:flex;align-items:center;gap:13px;">
            <div class="icon-vocab-badge">${ico("video", 22)}</div>
            <div>
              <strong style="font-size:16.5px;display:block;">Shadowing YouTube Shorts</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">Phụ đề chạy tự động · Chạm từ tra nghĩa</span>
            </div>
          </div>
          <span class="badge-orange">HOT</span>
        </div>

        <div class="theory-card" data-quick="exams-20">
          <div style="display:flex;align-items:center;gap:13px;">
            <div class="icon-grammar-badge">${ico("exam", 22)}</div>
            <div>
              <strong style="font-size:16.5px;display:block;">30 Đề Full &amp; Luyện từng dạng</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">TOPIK I (70 câu) · TOPIK II (104 câu)</span>
            </div>
          </div>
          <span class="badge-orange">${ico("star", 13)} Tuyển chọn</span>
        </div>
      </div>

      <!-- 6 TOPIK Level Cards -->
      <div class="section-head">
        <h2>Khung kiến thức 6 cấp TOPIK</h2>
      </div>
      <div class="grid-3">
        ${levels.map((lv, idx) => `
          <article class="achieve-card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <span class="badge-orange">${lv.badge}</span>
              <span style="font-size:12.5px;color:var(--primary-1);font-weight:700;">${lv.sub}</span>
            </div>
            <ul class="achieve-list">
              ${lv.items.map((it) => `<li><span style="color:var(--primary);font-weight:800;">•</span><span>${it}</span></li>`).join("")}
            </ul>
            <button type="button" class="btn-outline-teal" data-lv-idx="${idx}" style="margin-top:auto;width:100%;justify-content:center;padding:7px 14px;font-size:13.5px;">
              Mở học phần
            </button>
          </article>
        `).join("")}
      </div>

      <!-- Compact Writing + Cute Admin Support VietQR Strip -->
      <div class="grid-2" style="margin-top:24px;align-items:stretch;">
        <section class="outline-ai" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="icon-vocab-badge">${ico("sparkle", 22)}</div>
            <div>
              <strong style="font-size:16px;display:block;">Phòng Viết 원고지 &amp; Sổ tay câu sai</strong>
              <span style="font-size:13px;color:var(--text-muted);">Đếm ô Câu 51–54 &amp; rà dạng bài yếu</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-primary" id="btn-mia-writing" style="padding:8px 15px;font-size:13.5px;">${ico("pen", 15)} Viết 원고지</button>
            <button class="btn-outline-teal" id="btn-mia-check" style="padding:7px 14px;font-size:13.5px;">Câu sai (${s.mistakes.length})</button>
          </div>
        </section>

        <!-- CUTE COMPACT VIETQR DONATE ADMIN CARD -->
        <section class="donate-cute-card">
          <div style="flex:1;min-width:200px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              ${daisyLogoSVG(22)}
              <strong style="font-size:15px;color:#BE4B64;">Tiếp sức Admin duy trì CJDUZ</strong>
            </div>
            <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">
              Mời Admin một ly trà nhỏ nếu web giúp bạn học vui hơn nha 🌸
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:8px;">
              <span class="meta-chip" style="background:#FFFFFF;color:#0F766E;font-weight:800;">VIETCOMBANK</span>
              <span class="meta-chip" style="background:#FFFFFF;color:var(--text-main);font-weight:800;">0201000736282</span>
              <span class="meta-chip" style="background:#FFFFFF;">NGUYEN CHI DUC</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn-outline-teal" id="btn-copy-stk" style="padding:5px 12px;font-size:12.5px;border-color:#F5CAD6;color:#BE4B64;">
                Sao chép STK
              </button>
              <button type="button" class="btn-outline-teal" id="btn-zoom-qr" style="padding:5px 12px;font-size:12.5px;">
                Mở QR quét nhanh
              </button>
            </div>
          </div>

          <img src="/media/vietqr_admin.jpg" alt="VietQR ủng hộ Admin NGUYEN CHI DUC" class="donate-qr-thumb" id="img-donate-qr" title="Bấm để phóng to mã QR" />
        </section>
      </div>
    </div>
  `;

  function openQrModal() {
    const targetModal = modalRoot || document.getElementById("modal-root");
    if (!targetModal) return;
    targetModal.innerHTML = `
      <div class="modal-backdrop" id="qr-modal-bg">
        <div class="modal-panel" style="max-width:390px;text-align:center;padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <strong style="font-size:17px;color:#BE4B64;display:flex;align-items:center;gap:6px;">
              ${daisyLogoSVG(24)} Ủng hộ Admin CJDUZ
            </strong>
            <button type="button" id="close-qr-modal" style="background:var(--bg-body);border:1.5px solid var(--border-card);width:32px;height:32px;border-radius:10px;font-size:18px;cursor:pointer;">×</button>
          </div>
          <p style="margin:0 0 12px;font-size:13.5px;color:var(--text-muted);">
            Cảm ơn bạn đã đồng hành và tiếp thêm động lực cho CJDUZ 🌸
          </p>
          <img src="/media/vietqr_admin.jpg" alt="VietQR VIETCOMBANK 0201000736282 NGUYEN CHI DUC" style="width:100%;max-width:270px;border-radius:16px;border:2px solid #F5CAD6;padding:6px;background:#FFF;margin-bottom:12px;" />
          <div style="background:var(--bg-body);border:1px solid var(--border-card);border-radius:14px;padding:10px 14px;font-size:13.5px;line-height:1.6;">
            <div>Ngân hàng: <strong style="color:#0F766E;">VIETCOMBANK</strong></div>
            <div>Số tài khoản: <strong style="font-size:15.5px;color:var(--text-main);">0201000736282</strong></div>
            <div>Chủ TK: <strong>NGUYEN CHI DUC</strong></div>
          </div>
        </div>
      </div>
    `;
    targetModal.querySelector("#close-qr-modal").addEventListener("click", () => { targetModal.innerHTML = ""; });
    targetModal.querySelector("#qr-modal-bg").addEventListener("click", (e) => {
      if (e.target.id === "qr-modal-bg") targetModal.innerHTML = "";
    });
  }

  root.querySelector("#btn-copy-stk").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    navigator.clipboard?.writeText("0201000736282").catch(() => {});
    btn.textContent = "✔ Đã chép 0201000736282";
    setTimeout(() => { btn.textContent = "Sao chép STK"; }, 2200);
  });
  root.querySelector("#btn-zoom-qr").addEventListener("click", openQrModal);
  root.querySelector("#img-donate-qr").addEventListener("click", openQrModal);

  root.querySelector("#btn-start-next-step").addEventListener("click", () => nextTask.go());
  const dueBtn = root.querySelector("#btn-home-due-srs");
  if (dueBtn) dueBtn.addEventListener("click", () => navigate("theory", { sub: "vocab-review" }));

  root.querySelectorAll("[data-home-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.homeGo);
      activeDay.tasks[idx]?.go();
    });
  });

  root.querySelectorAll("[data-home-chk]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dy = Number(btn.dataset.homeChk);
      const si = Number(btn.dataset.sidx);
      const st = Number(btn.dataset.stotal);
      const cur = Boolean(store.state.roadmapStepDone?.[`d${dy}_${si}`]);
      store.setRoadmapStepDone(dy, si, st, !cur);
      renderHomeView(root, db, navigate, startGuidedStep, openProfileSettings, modalRoot);
    });
  });

  root.querySelector("#btn-open-roadmap").addEventListener("click", () => navigate("roadmap"));
  root.querySelector("#btn-home-edit-profile").addEventListener("click", () => {
    if (typeof openProfileSettings === "function") openProfileSettings();
    else navigate("roadmap");
  });
  root.querySelector("#btn-mia-writing").addEventListener("click", () => navigate("practice", { sub: "topik2", skill: "writing" }));
  root.querySelector("#btn-mia-check").addEventListener("click", () => navigate("check-tools", { tab: "mistakes" }));

  root.querySelector("#home-target-select").addEventListener("change", (e) => {
    store.state.targetLevel = e.target.value;
    store.save();
    renderHomeView(root, db, navigate, startGuidedStep, openProfileSettings, modalRoot);
  });
  root.querySelector("#home-exam-date").addEventListener("change", (e) => {
    store.state.examDate = e.target.value;
    store.save();
    renderHomeView(root, db, navigate, startGuidedStep, openProfileSettings, modalRoot);
  });

  root.querySelectorAll("[data-quick]").forEach((el) => {
    el.addEventListener("click", () => {
      const q = el.dataset.quick;
      if (q === "vocab-review") navigate("theory", { sub: "vocab-review" });
      if (q === "chapter-translate") navigate("practice", { sub: "skills", skill: "translate", lesson: s.lastLesson.lesson || 1 });
      if (q === "shorts-shadowing") navigate("practice", { sub: "skills", skill: "shadowing" });
      if (q === "exams-20") navigate("mock-test", { sub: "topik1", viewMode: "exams", category: "curated" });
    });
  });

  root.querySelectorAll("[data-lv-idx]").forEach((btn) => {
    btn.addEventListener("click", () => levels[Number(btn.dataset.lvIdx)].action());
  });
}
