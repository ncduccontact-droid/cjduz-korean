import { store, getBookWords, evaluateRoadmapScore } from "../store.js?v=20261127-02";
import { ico, daisyLogoSVG } from "../icons.js?v=20261127-02";
import { getGuidedStudyPlan, STAGE_LABELS } from "./roadmap.js?v=20261127-02";

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
    const pct = bw.length ? Math.round((bm / bw.length) * 100) : 0;
    const shortLevel = bk.levelBadge.split("·")[1]?.trim() || bk.levelBadge;
    return {
      bookNum: bk.bookNum,
      shortLevel,
      chaptersCount: bk.chapters.length,
      mastered: bm,
      totalWords: bw.length,
      pct,
      passDesc: `${bk.scale.gradeName} ≥ ${bk.scale.passScore}đ`,
      action: () => navigate("theory", { sub: "index", book: bk.bookId })
    };
  });

  root.innerHTML = `
    <div class="container-web">
      <section class="today-plan-grid">
        <!-- LEFT: TODAY'S FOCUSED STUDY PLAN -->
        <div class="box-kind">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:14px;">
            <div>
              <div style="font-size:12.5px;font-weight:600;color:var(--text-muted);margin-bottom:2px;">
                Lộ trình hôm nay · Ngày ${activeDay.day}/30
              </div>
              <h1 style="margin:0;font-size:19px;font-weight:750;color:var(--text-main);">
                ${activeDay.shortTopic}
              </h1>
            </div>
            <span class="badge-orange" style="flex-shrink:0;">
              ${activeDay.doneSteps}/${activeDay.totalSteps} bước
            </span>
          </div>

          <div class="next-up-spotlight">
            <div style="min-width:0;flex:1 1 200px;">
              <div style="font-size:12px;font-weight:650;color:var(--primary-1);margin-bottom:3px;">
                Bước tiếp theo (${nextTask.stepIdx + 1}/${activeDay.totalSteps})
              </div>
              <strong style="font-size:16.5px;display:block;color:var(--text-main);line-height:1.35;margin-bottom:2px;">
                ${nextTask.label}
              </strong>
              <span style="font-size:13px;color:var(--text-muted);">${nextTask.hint}</span>
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;width:auto;">
              <button type="button" class="btn-primary" id="btn-start-next-step">
                Bắt đầu học
              </button>
              ${dueCount > 0 ? `
                <button type="button" class="btn-soft-jade" id="btn-home-due-srs">
                  Ôn ${dueCount} từ đến hạn
                </button>
              ` : ""}
            </div>
          </div>

          <div class="today-stepper">
            ${activeDay.tasks.map((t) => {
              const isNext = !t.done && t.stepIdx === nextTask.stepIdx;
              const cleanCategory = t.tag.replace(/^Bước\s*\d+\s*·\s*/i, "");
              return `
                <div class="today-step-row ${t.done ? "is-done" : (isNext ? "is-next" : "")}">
                  <div style="display:flex;align-items:center;gap:11px;min-width:0;flex:1;">
                    <button type="button" class="step-check-btn ${t.done ? "checked" : ""}" data-home-chk="${activeDay.day}" data-sidx="${t.stepIdx}" data-stotal="${activeDay.totalSteps}" title="Đánh dấu hoàn thành">
                      ${t.done ? "✓" : (t.stepIdx + 1)}
                    </button>
                    <div style="min-width:0;flex:1;">
                      <div style="font-size:14px;font-weight:650;line-height:1.35;${t.done ? "text-decoration:line-through;color:var(--text-muted);" : "color:var(--text-main);"}">
                        ${t.label}
                      </div>
                      <div style="font-size:12px;color:var(--text-muted);margin-top:1px;">
                        ${cleanCategory} · ${t.hint}
                      </div>
                    </div>
                  </div>

                  <button type="button" class="${isNext ? "btn-soft-jade" : "btn-outline-teal"}" data-home-go="${t.stepIdx}" style="padding:6px 12px;font-size:12.5px;border-radius:9px;flex-shrink:0;">
                    ${t.done ? "Xem lại" : (isNext ? "Học tiếp" : "Mở")}
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- RIGHT: SCORE EVALUATION & GOAL -->
        <div class="box-kind" style="display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;">
              <strong style="font-size:15.5px;color:var(--text-main);">Năng lực hiện tại</strong>
              <button type="button" class="badge-orange" id="btn-home-edit-profile" style="cursor:pointer;border:none;font-family:inherit;" title="Đổi quyển đang học">
                ${activeBookLabel} · Đổi
              </button>
            </div>

            <div style="background:#F8FAFC;border-radius:14px;padding:14px 15px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">
                <span style="font-size:12px;font-weight:600;color:var(--text-muted);">Thang ${evalObj.gradeName}</span>
                <span style="font-size:12px;font-weight:650;color:var(--primary-1);">Đạt từ ${evalObj.passScore}/${evalObj.maxScore}đ</span>
              </div>
              <div style="font-size:26px;font-weight:800;color:var(--text-main);line-height:1.15;margin-bottom:8px;">
                ${evalObj.estimatedScore} <span style="font-size:13.5px;color:var(--text-muted);font-weight:600;">/ ${evalObj.maxScore} điểm</span>
              </div>
              <div style="position:relative;margin-bottom:7px;">
                <div class="progress-track" style="height:7px;background:#E2E8F0;">
                  <div class="progress-fill" style="width:${scorePctBar}%;${evalObj.passed ? "background:var(--success);" : ""}"></div>
                </div>
                <div style="position:absolute;left:${passLinePct}%;top:-2px;bottom:-2px;width:2px;background:#475569;border-radius:2px;"></div>
              </div>
              <div style="font-size:12px;font-weight:500;color:var(--text-secondary);">
                ${evalObj.statusLabel}
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px;">
              ${evalObj.pillars.map((p) => `
                <div style="background:#F8FAFC;border-radius:11px;padding:8px 10px;">
                  <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:12px;">
                    <span style="color:var(--text-muted);font-weight:500;">${p.label}</span>
                    <strong style="color:var(--primary-1);font-size:12.5px;">${p.pct}%</strong>
                  </div>
                  <div style="font-size:11.5px;color:var(--text-main);font-weight:600;margin-top:2px;">${p.detail}</div>
                </div>
              `).join("")}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;color:var(--text-muted);">
              <span>30 ngày: <strong style="color:var(--text-main);">${completedDaysCount}/30 (${roadmapPct}%)</strong></span>
              <label style="display:inline-flex;align-items:center;gap:6px;">
                <span>Thi sau <strong style="color:var(--text-main);">${daysLeft} ngày</strong></span>
                <input type="date" id="home-exam-date" value="${s.examDate}" style="padding:4px 8px;border-radius:8px;font-size:12px;font-weight:600;width:128px;" />
              </label>
            </div>
          </div>

          <button type="button" class="btn-outline-teal" id="btn-open-roadmap" style="width:100%;">
            ${ico("compass", 15)} Xem lộ trình 30 ngày chi tiết
          </button>
        </div>
      </section>

      <!-- 4 Core Study Modules -->
      <div class="section-head">
        <h2>Học nhanh theo kỹ năng</h2>
      </div>
      <div class="grid-2">
        <div class="theory-card" data-quick="vocab-review">
          <div style="display:flex;align-items:center;gap:13px;min-width:0;">
            <div class="icon-vocab-badge">${ico("cards", 20)}</div>
            <div style="min-width:0;">
              <strong style="font-size:15.5px;display:block;">Lật thẻ từ vựng 3D</strong>
              <span style="font-size:13px;color:var(--text-muted);">Chia theo phần nhỏ 8–15 từ, tự phát âm</span>
            </div>
          </div>
          <span class="card-chevron">›</span>
        </div>

        <div class="theory-card" data-quick="chapter-translate">
          <div style="display:flex;align-items:center;gap:13px;min-width:0;">
            <div class="icon-grammar-badge">${ico("pen", 20)}</div>
            <div style="min-width:0;">
              <strong style="font-size:15.5px;display:block;">Sách bài tập &amp; Dịch câu</strong>
              <span style="font-size:13px;color:var(--text-muted);">Thực hành ngữ pháp 익힘책 và ghép câu Hàn</span>
            </div>
          </div>
          <span class="card-chevron">›</span>
        </div>

        <div class="theory-card" data-quick="shorts-shadowing">
          <div style="display:flex;align-items:center;gap:13px;min-width:0;">
            <div class="icon-vocab-badge">${ico("video", 20)}</div>
            <div style="min-width:0;">
              <strong style="font-size:15.5px;display:block;">Shadowing YouTube Shorts</strong>
              <span style="font-size:13px;color:var(--text-muted);">Nhại giọng theo phụ đề chạy, chạm từ tra nghĩa</span>
            </div>
          </div>
          <span class="card-chevron">›</span>
        </div>

        <div class="theory-card" data-quick="exams-20">
          <div style="display:flex;align-items:center;gap:13px;min-width:0;">
            <div class="icon-grammar-badge">${ico("exam", 20)}</div>
            <div style="min-width:0;">
              <strong style="font-size:15.5px;display:block;">Kho 30 Đề thi TOPIK</strong>
              <span style="font-size:13px;color:var(--text-muted);">Làm full đề 70/104 câu hoặc luyện từng dạng</span>
            </div>
          </div>
          <span class="card-chevron">›</span>
        </div>
      </div>

      <!-- 6 Books Compact Grid (3 cols Web, 2 cols Mobile) -->
      <div class="section-head">
        <h2>Giáo trình Tiếng Hàn Tổng Hợp (Quyển 1–6)</h2>
      </div>
      <div class="home-books-grid">
        ${levels.map((lv, idx) => `
          <article class="achieve-card clickable" data-lv-idx="${idx}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
              <strong style="font-size:15.5px;color:var(--text-main);">Quyển ${lv.bookNum}</strong>
              <span class="badge-orange">${lv.shortLevel}</span>
            </div>
            <div style="font-size:12.5px;color:var(--text-muted);">
              ${lv.chaptersCount} bài · Thuộc <strong style="color:var(--text-secondary);">${lv.mastered}/${lv.totalWords}</strong> từ
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${lv.pct}%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text-muted);margin-top:auto;">
              <span>${lv.passDesc}</span>
              <span style="color:var(--primary-1);font-weight:650;">Mở ›</span>
            </div>
          </article>
        `).join("")}
      </div>

      <!-- Writing + Compact Support Card -->
      <div class="grid-2" style="margin-top:24px;align-items:stretch;">
        <section class="outline-ai" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="icon-vocab-badge">${ico("sparkle", 20)}</div>
            <div>
              <strong style="font-size:15.5px;display:block;">Phòng Viết 원고지 &amp; Sổ tay câu sai</strong>
              <span style="font-size:13px;color:var(--text-muted);">Luyện viết Câu 51–54 và ôn lại các câu làm nhầm</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-soft-jade" id="btn-mia-writing">${ico("pen", 14)} Viết 원고지</button>
            <button class="btn-outline-teal" id="btn-mia-check">Câu sai (${s.mistakes.length})</button>
          </div>
        </section>

        <section class="donate-cute-card">
          <div style="flex:1;min-width:190px;">
            <div style="display:flex;align-items:center;gap:7px;margin-bottom:3px;">
              ${daisyLogoSVG(24)}
              <strong style="font-size:14.5px;color:var(--text-main);">Ủng hộ duy trì D ● TOPIK</strong>
            </div>
            <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">
              Vietcombank · <strong style="color:var(--text-secondary);">0201000736282</strong> · NGUYEN CHI DUC
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn-outline-teal" id="btn-copy-stk" style="padding:6px 12px;font-size:12.5px;">
                Sao chép STK
              </button>
              <button type="button" class="btn-soft-jade" id="btn-zoom-qr" style="padding:6px 12px;font-size:12.5px;">
                Mở mã QR
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
        <div class="modal-panel" style="max-width:380px;text-align:center;padding:22px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <strong style="font-size:16px;color:var(--text-main);display:flex;align-items:center;gap:8px;">
              ${daisyLogoSVG(26)} Ủng hộ D ● TOPIK
            </strong>
            <button type="button" id="close-qr-modal" style="background:#F1F5F9;border:none;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer;color:var(--text-secondary);">×</button>
          </div>
          <p style="margin:0 0 12px;font-size:13px;color:var(--text-muted);">
            Cảm ơn bạn đã đồng hành cùng D ● TOPIK.
          </p>
          <img src="/media/vietqr_admin.jpg" alt="VietQR VIETCOMBANK 0201000736282 NGUYEN CHI DUC" style="width:100%;max-width:250px;border-radius:14px;border:1px solid var(--border-card);padding:6px;background:#FFF;margin-bottom:12px;" />
          <div style="background:#F8FAFC;border-radius:12px;padding:10px 14px;font-size:13px;line-height:1.6;">
            <div>Ngân hàng: <strong style="color:var(--primary-1);">VIETCOMBANK</strong></div>
            <div>Số tài khoản: <strong style="font-size:15px;color:var(--text-main);">0201000736282</strong></div>
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
    btn.textContent = "Đã chép STK";
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

  root.querySelectorAll("[data-lv-idx]").forEach((card) => {
    card.addEventListener("click", () => levels[Number(card.dataset.lvIdx)].action());
  });
}
