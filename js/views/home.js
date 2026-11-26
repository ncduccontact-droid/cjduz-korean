import { store, getBookWords, evaluateRoadmapScore } from "../store.js?v=20261126-12";
import { ico, daisyLogoSVG } from "../icons.js?v=20261126-12";
import { getGuidedStudyPlan, STAGE_LABELS } from "./roadmap.js?v=20261126-12";

export function renderHomeView(root, db, navigate, startGuidedStep = null, openProfileSettings = null, modalRoot = null) {
  const s = store.state;
  const extraWords = (db.books6 || []).filter((b) => b.bookId !== "q1").flatMap((b) => b.vocab || []);
  const allVocab = [...db.sc1Vocab, ...extraWords, ...db.sejongVocab, ...db.topik1Bank];
  const dueCount = store.getDueCardIds(allVocab).length;
  const daysLeft = Math.max(0, Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000));

  const plan = getGuidedStudyPlan(db, navigate, startGuidedStep);
  const evalObj = evaluateRoadmapScore(db);
  const { profile, bookId, days, activeDay, nextTask, completedDaysCount } = plan;
  const roadmapPct = Math.round((completedDaysCount / days.length) * 100);
  const activeBookLabel = STAGE_LABELS[profile.startBook] || STAGE_LABELS[bookId] || STAGE_LABELS.q1;
  const scorePctBar = Math.min(100, Math.round((evalObj.estimatedScore / evalObj.maxScore) * 100));
  const passLinePct = Math.round((evalObj.passScore / evalObj.maxScore) * 100);

  const levels = (db.books6 || []).map((bk) => {
    const bw = getBookWords(db, bk.bookId);
    const bm = bw.filter((w) => store.isMastered(w.id)).length;
    const partCnt = bk.chapters.reduce((a, c) => a + (c.parts?.length || 1), 0);
    return {
      badge: `QUYỂN ${bk.bookNum}`,
      sub: bk.levelBadge,
      items: [
        `${bk.chapters.length} chương · ${partCnt} phần nhỏ (${bm}/${bw.length} từ)`,
        `Đủ Sách giáo trình & Sách bài tập 익힘책`,
        `Chuẩn ${bk.scale.gradeName}: ≥ ${bk.scale.passScore}/${bk.scale.maxScore}đ`
      ],
      action: () => navigate("theory", { sub: "index", book: bk.bookId })
    };
  });

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
                        <span style="font-size:11.5px;font-weight:800;color:${t.done ? "#15803D" : (isNext ? "var(--primary)" : "var(--primary-1)")};">
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

        <!-- RIGHT: ROADMAP SCORE SCALE EVALUATION & PROFILE RESET -->
        <div class="box-kind" style="display:flex;flex-direction:column;justify-content:space-between;padding:20px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <strong style="font-size:15.5px;color:var(--primary-1);">${ico("chart", 17)} Đánh giá theo lộ trình</strong>
              <span class="badge-orange">${activeBookLabel}</span>
            </div>

            <!-- Calibrated Score Box -->
            <div style="background:var(--primary-3);border:1.5px solid var(--border-card);border-radius:14px;padding:12px 14px;margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">
                <span style="font-size:12px;font-weight:700;color:var(--text-muted);">Thang ${evalObj.gradeName}</span>
                <span style="font-size:11.5px;font-weight:800;color:var(--primary-1);">Mốc đạt: ${evalObj.passScore}/${evalObj.maxScore}đ</span>
              </div>
              <div style="font-size:24px;font-weight:800;color:var(--primary);line-height:1.2;margin-bottom:6px;">
                ${evalObj.estimatedScore} <span style="font-size:14px;color:var(--text-muted);font-weight:700;">/ ${evalObj.maxScore} điểm</span>
              </div>
              <div style="position:relative;margin-bottom:6px;">
                <div class="progress-track" style="height:8px;background:#FFFFFF;">
                  <div class="progress-fill" style="width:${scorePctBar}%;background:${evalObj.passed ? "var(--success)" : "var(--primary)"};"></div>
                </div>
                <div style="position:absolute;left:${passLinePct}%;top:-2px;bottom:-2px;width:2px;background:var(--primary-4);"></div>
              </div>
              <div style="font-size:12px;font-weight:600;color:${evalObj.passed ? "var(--success)" : "var(--primary-4)"};">
                ${evalObj.statusLabel}
              </div>
            </div>

            <!-- Mini 4-Pillar Grid -->
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px;">
              ${evalObj.pillars.map((p) => `
                <div style="background:var(--bg-body);border:1px solid var(--border-card);border-radius:10px;padding:6px 9px;font-size:12px;">
                  <div style="display:flex;justify-content:space-between;">
                    <span style="color:var(--text-muted);font-weight:600;">${p.label}</span>
                    <strong style="color:var(--primary-1);">${p.pct}%</strong>
                  </div>
                  <div style="font-size:11px;color:var(--text-main);font-weight:600;">${p.detail}</div>
                </div>
              `).join("")}
            </div>

            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:4px;">
              <span>Tiến độ 30 ngày: <strong style="color:var(--primary-1);">${completedDaysCount}/30 (${roadmapPct}%)</strong></span>
              <span>Còn <strong>${daysLeft} ngày</strong> thi</span>
            </div>
            <input type="date" id="home-exam-date" value="${s.examDate}" style="width:100%;padding:6px 12px;border-radius:99px;border:1.5px solid var(--border-card);font-size:13px;font-weight:600;" />
          </div>

          <div style="display:flex;flex-direction:column;gap:7px;margin-top:12px;">
            <button type="button" class="btn-outline-teal" id="btn-open-roadmap" style="width:100%;justify-content:center;padding:7px 12px;font-size:13px;">
              ${ico("compass", 15)} Lộ trình 30 ngày &amp; Thang điểm
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
          <span class="meta-chip" style="color:var(--primary-1);">15 chương</span>
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
            <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;">
              ${daisyLogoSVG(26)}
              <strong style="font-size:15px;color:var(--primary-4);">Tiếp sức Admin duy trì D ● TOPIK</strong>
            </div>
            <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">
              Mời Admin một ly trà nhỏ nếu web giúp bạn học vui hơn nha 💙
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:8px;">
              <span class="meta-chip" style="background:#FFFFFF;color:var(--primary-1);font-weight:800;">VIETCOMBANK</span>
              <span class="meta-chip" style="background:#FFFFFF;color:var(--text-main);font-weight:800;">0201000736282</span>
              <span class="meta-chip" style="background:#FFFFFF;">NGUYEN CHI DUC</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn-outline-teal" id="btn-copy-stk" style="padding:5px 12px;font-size:12.5px;">
                Sao chép STK
              </button>
              <button type="button" class="btn-primary" id="btn-zoom-qr" style="padding:5px 13px;font-size:12.5px;">
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
            <strong style="font-size:17px;color:var(--primary-4);display:flex;align-items:center;gap:8px;">
              ${daisyLogoSVG(28)} Ủng hộ Admin D ● TOPIK
            </strong>
            <button type="button" id="close-qr-modal" style="background:var(--bg-body);border:1.5px solid var(--border-card);width:32px;height:32px;border-radius:10px;font-size:18px;cursor:pointer;">×</button>
          </div>
          <p style="margin:0 0 12px;font-size:13.5px;color:var(--text-muted);">
            Cảm ơn bạn đã đồng hành và tiếp thêm động lực cho D ● TOPIK 💙
          </p>
          <img src="/media/vietqr_admin.jpg" alt="VietQR VIETCOMBANK 0201000736282 NGUYEN CHI DUC" style="width:100%;max-width:270px;border-radius:16px;border:2px solid var(--border-card);padding:6px;background:#FFF;margin-bottom:12px;" />
          <div style="background:var(--bg-body);border:1px solid var(--border-card);border-radius:14px;padding:10px 14px;font-size:13.5px;line-height:1.6;">
            <div>Ngân hàng: <strong style="color:var(--primary-1);">VIETCOMBANK</strong></div>
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

  const targetSel = root.querySelector("#home-target-select");
  if (targetSel) {
    targetSel.addEventListener("change", (e) => {
      store.state.targetLevel = e.target.value;
      store.save();
      renderHomeView(root, db, navigate, startGuidedStep, openProfileSettings, modalRoot);
    });
  }
  root.querySelector("#home-exam-date").addEventListener("change", (e) => {
    store.state.examDate = e.target.value;
    store.save();
    renderHomeView(root, db, navigate, startGuidedStep, openProfileSettings, modalRoot);
  });

  root.querySelectorAll("[data-quick]").forEach((el) => {
    el.addEventListener("click", () => {
      const q = el.dataset.quick;
      if (q === "vocab-review") navigate("theory", { sub: "vocab-review", book: bookId, lesson: s.lastLesson?.lesson || 1, part: 1 });
      if (q === "chapter-translate") navigate("theory", { sub: "lesson-detail", book: bookId, lesson: s.lastLesson?.lesson || 1, tab: "workbook" });
      if (q === "shorts-shadowing") navigate("practice", { sub: "skills", skill: "shadowing" });
      if (q === "exams-20") navigate("mock-test", { sub: evalObj.examLevel, viewMode: "exams", category: "curated" });
    });
  });

  root.querySelectorAll("[data-lv-idx]").forEach((btn) => {
    btn.addEventListener("click", () => levels[Number(btn.dataset.lvIdx)].action());
  });
}
