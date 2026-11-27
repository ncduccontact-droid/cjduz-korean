import { store, getBookWords, evaluateRoadmapScore } from "../store.js?v=20261127-13";
import { ico, daisyLogoSVG } from "../icons.js?v=20261127-13";
import { getGuidedStudyPlan, STAGE_LABELS } from "./roadmap.js?v=20261127-13";

export const ADMIN_QR_IMG_SRC = "/media/vietqr_admin_v2.jpg?v=20261127-13";

export function renderAdminSupportCardHTML(extraStyle = "") {
  return `
    <section class="donate-cute-card" ${extraStyle ? `style="${extraStyle}"` : ""}>
      <div class="donate-top-left">
        <div style="display:flex;align-items:center;gap:7px;">
          ${daisyLogoSVG(24)}
          <strong style="font-size:15px;color:var(--text-main);">Ủng hộ admin nhée &gt;&lt;</strong>
        </div>
        <div class="donate-bank-box">
          <strong style="color:var(--primary-1);">VIETCOMBANK</strong>
          <span class="donate-sep">·</span>
          <strong style="color:var(--text-main);font-variant-numeric:tabular-nums;">0201000736282</strong>
          <span class="donate-sep">·</span>
          <span style="font-weight:600;color:var(--text-secondary);">NGUYEN CHI DUC</span>
        </div>
        <div class="donate-btn-row">
          <button type="button" class="btn-outline-teal" data-copy-stk="1" style="min-height:36px;padding:5px 12px;font-size:12.5px;">Sao chép STK</button>
          <button type="button" class="btn-soft-jade" data-zoom-qr="1" style="min-height:36px;padding:5px 12px;font-size:12.5px;">Phóng to QR</button>
        </div>
      </div>

      <img src="${ADMIN_QR_IMG_SRC}" alt="VietQR VIETCOMBANK 0201000736282 NGUYEN CHI DUC" class="donate-qr-thumb" data-zoom-qr="1" title="Phóng to mã QR" />
    </section>
  `;
}

export function bindAdminSupportCardEvents(scopeEl, modalRoot = null) {
  if (!scopeEl) return;

  const openQrModal = () => {
    const targetModal = modalRoot || document.getElementById("modal-root");
    if (!targetModal) return;
    targetModal.innerHTML = `
      <div class="modal-backdrop" id="qr-modal-bg">
        <div class="modal-panel" style="max-width:380px;text-align:center;padding:22px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong style="font-size:16px;color:var(--text-main);display:flex;align-items:center;gap:8px;">
              ${daisyLogoSVG(26)} Ủng hộ admin nhée &gt;&lt;
            </strong>
            <button type="button" id="close-qr-modal" aria-label="Đóng mã QR" style="background:#F1F5F9;border:none;width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer;color:var(--text-secondary);">×</button>
          </div>
          <img src="${ADMIN_QR_IMG_SRC}" alt="VietQR VIETCOMBANK 0201000736282 NGUYEN CHI DUC" style="width:100%;max-width:260px;border-radius:14px;border:1px solid var(--border-card);padding:6px;background:#FFF;margin-bottom:12px;" />
          <div style="background:#F8FAFC;border-radius:12px;padding:11px 14px;font-size:13.5px;line-height:1.6;">
            <div style="font-weight:800;color:var(--primary-1);">VIETCOMBANK</div>
            <div style="font-size:17px;font-weight:800;color:var(--text-main);font-variant-numeric:tabular-nums;">0201000736282</div>
            <div style="font-weight:700;color:var(--text-secondary);">NGUYEN CHI DUC</div>
          </div>
        </div>
      </div>
    `;
    targetModal.querySelector("#close-qr-modal")?.addEventListener("click", () => { targetModal.innerHTML = ""; });
    targetModal.querySelector("#qr-modal-bg")?.addEventListener("click", (e) => {
      if (e.target.id === "qr-modal-bg") targetModal.innerHTML = "";
    });
  };

  scopeEl.querySelectorAll("[data-copy-stk]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const b = e.currentTarget;
      navigator.clipboard?.writeText("0201000736282").catch(() => {});
      b.textContent = "Đã chép STK";
      setTimeout(() => { b.textContent = "Sao chép STK"; }, 2000);
    });
  });

  scopeEl.querySelectorAll("[data-zoom-qr]").forEach((el) => {
    el.addEventListener("click", openQrModal);
  });
}

export function renderHomeView(root, db, navigate, startGuidedStep = null, openProfileSettings = null, modalRoot = null) {
  const s = store.state;
  const extraWords = (db.books6 || []).filter((b) => b.bookId !== "q1").flatMap((b) => b.vocab || []);
  const allVocab = [...db.sc1Vocab, ...extraWords, ...db.sejongVocab, ...db.topik1Bank];
  const dueCount = store.getDueCardIds(allVocab).length;

  const plan = getGuidedStudyPlan(db, navigate, startGuidedStep);
  const evalObj = evaluateRoadmapScore(db);
  const { profile, bookId, days, activeDay, nextTask, completedDaysCount } = plan;
  const activeBookLabel = STAGE_LABELS[profile.startBook] || STAGE_LABELS[bookId] || STAGE_LABELS.q1;
  const scorePctBar = Math.min(100, Math.round((evalObj.estimatedScore / evalObj.maxScore) * 100));
  const passLinePct = Math.round((evalObj.passScore / evalObj.maxScore) * 100);
  const hasAnyProgress = activeDay.doneSteps > 0 || completedDaysCount > 0 || Object.keys(s.srs || {}).length > 0;
  const primaryLabel = hasAnyProgress ? "Học tiếp" : "Bắt đầu bài";

  const recentScores = (s.scoreHistory || []).slice(0, 4);

  const levels = (db.books6 || []).map((bk) => {
    const bw = getBookWords(db, bk.bookId);
    const bm = bw.filter((w) => store.isMastered(w.id)).length;
    const pct = bw.length ? Math.round((bm / bw.length) * 100) : 0;
    const shortLevel = bk.levelBadge.split("·")[1]?.trim() || bk.levelBadge;
    return {
      bookId: bk.bookId,
      bookNum: bk.bookNum,
      shortLevel,
      mastered: bm,
      totalWords: bw.length,
      pct,
      action: () => navigate("theory", { sub: "index", book: bk.bookId })
    };
  });

  root.innerHTML = `
    <div class="container-web">
      ${renderAdminSupportCardHTML("margin-bottom:16px;")}

      <section class="today-plan-grid">
        <div class="box-kind home-hero-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
            <span style="font-size:13px;font-weight:650;color:var(--primary-1);display:inline-flex;align-items:center;gap:6px;">
              ${ico("compass", 16)} Ngày ${activeDay.day}/${days.length} · Bước ${nextTask.stepIdx + 1}/${activeDay.totalSteps}
            </span>
            <span class="badge-orange nw">${activeDay.doneSteps}/${activeDay.totalSteps} xong</span>
          </div>

          <h1 class="title-hero ko" style="margin-bottom:6px;">
            ${nextTask.label}
          </h1>
          <div style="font-size:14px;color:var(--text-muted);margin-bottom:16px;">
            ${activeBookLabel} · ${nextTask.hint}
          </div>

          <div class="spot-actions" style="margin-bottom:18px;">
            <button type="button" class="btn-primary" id="btn-start-next-step">
              ${ico("play", 16)} ${primaryLabel}
            </button>
            ${dueCount > 0 ? `
              <button type="button" class="btn-soft-jade" id="btn-home-due-srs">
                ${ico("cards", 16)} Ôn ${dueCount} từ đến hạn
              </button>
            ` : ""}
          </div>

          <div class="today-stepper">
            ${activeDay.tasks.map((t) => {
              const isCurrent = !t.done && t.stepIdx === nextTask.stepIdx;
              const cleanCat = t.tag.replace(/^Bước\s*\d+\s*·\s*/i, "");
              return `
                <div class="today-step-row ${t.done ? "is-done" : (isCurrent ? "is-next" : "")}">
                  <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                    <button type="button" class="step-check-btn ${t.done ? "checked" : ""}" data-home-chk="${activeDay.day}" data-sidx="${t.stepIdx}" data-stotal="${activeDay.totalSteps}" aria-label="Đánh dấu bước ${t.stepIdx + 1}">
                      ${t.done ? "✓" : (t.stepIdx + 1)}
                    </button>
                    <div style="min-width:0;flex:1;">
                      <div class="step-title ko" style="${t.done ? "text-decoration:line-through;color:var(--text-muted);" : ""}">
                        ${t.label}
                      </div>
                      <div class="step-sub">${cleanCat} · ${t.hint}</div>
                    </div>
                  </div>

                  ${isCurrent ? `
                    <span style="font-size:12px;font-weight:700;color:var(--primary-1);white-space:nowrap;">Đang học</span>
                  ` : `
                    <button type="button" class="btn-step-quiet nw" data-home-go="${t.stepIdx}">
                      ${t.done ? "Xem lại" : "Mở"}
                    </button>
                  `}
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="box-kind" style="display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;">
              <strong style="font-size:15.5px;color:var(--text-main);display:inline-flex;align-items:center;gap:7px;">
                ${ico("chart", 18)} Tiến độ học tập
              </strong>
              <button type="button" class="badge-orange" id="btn-home-edit-profile" style="cursor:pointer;border:none;font-family:inherit;">
                ${activeBookLabel} · Đổi
              </button>
            </div>

            <div style="background:var(--bg-subtle);border:1px solid var(--border-light);border-radius:14px;padding:15px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;font-size:12.5px;color:var(--text-muted);">
                <span>Ước tính ${evalObj.gradeName}</span>
                <span style="color:var(--primary-1);font-weight:650;">Đỗ ≥ ${evalObj.passScore}/${evalObj.maxScore}đ</span>
              </div>
              <div class="stat-num" style="color:var(--text-main);margin-bottom:10px;">
                ${evalObj.estimatedScore} <span style="font-size:14px;color:var(--text-muted);font-weight:600;">/ ${evalObj.maxScore}đ</span>
              </div>
              <div style="position:relative;">
                <div class="progress-track" style="height:8px;background:#E2E8F0;">
                  <div class="progress-fill" style="width:${scorePctBar}%;${evalObj.passed ? "background:var(--success);" : ""}"></div>
                </div>
                <div style="position:absolute;left:${passLinePct}%;top:-2px;bottom:-2px;width:2px;background:#475569;border-radius:2px;" title="Mốc đạt ${evalObj.passScore}đ"></div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
              ${evalObj.pillars.map((p) => `
                <div style="background:var(--bg-subtle);border-radius:11px;padding:9px 11px;">
                  <div style="font-size:12px;color:var(--text-muted);">${p.label}</div>
                  <div style="font-size:13.5px;color:var(--text-main);font-weight:700;margin-top:2px;">${p.detail}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding-top:10px;border-top:1px solid var(--border-light);flex-wrap:wrap;">
            <span style="font-size:13px;color:var(--text-muted);">Lộ trình: <strong style="color:var(--text-main);">${completedDaysCount}/30 ngày</strong></span>
            <button type="button" class="btn-text-link" id="btn-open-roadmap">
              Xem lộ trình →
            </button>
          </div>
        </div>
      </section>

      ${recentScores.length > 0 ? `
        <div class="section-head">
          <h2>Lịch sử điểm gần đây</h2>
          <button type="button" class="btn-text-link" id="btn-home-all-scores">Xem tất cả (${s.scoreHistory.length}) →</button>
        </div>
        <div class="grid-2">
          ${recentScores.map((item) => `
            <div class="box-kind" style="padding:13px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
              <div style="min-width:0;">
                <span class="meta-chip" style="margin-bottom:4px;">${item.category}</span>
                <strong class="ko" style="display:block;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.title}</strong>
                <span style="font-size:12px;color:var(--text-muted);">${item.date} · Đúng ${item.correctCount}/${item.totalCount}</span>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <strong style="font-size:17px;color:${item.pct >= 70 ? "var(--success)" : "var(--primary-1)"};">${item.score}/${item.maxScore}đ</strong>
                <div style="font-size:11.5px;color:var(--text-muted);">${item.pct}%</div>
              </div>
            </div>
          `).join("")}
        </div>
      ` : ""}

      <div class="section-head">
        <h2>Học nhanh</h2>
        ${s.mistakes.length > 0 ? `
          <button type="button" class="btn-text-link" id="btn-mia-check">Sổ tay câu sai (${s.mistakes.length}) →</button>
        ` : ""}
      </div>
      <div class="grid-2">
        <button type="button" class="theory-card" data-quick="vocab-review">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;text-align:left;">
            <div class="icon-vocab-badge">${ico("cards", 23)}</div>
            <div style="min-width:0;">
              <strong style="font-size:15px;display:block;color:var(--text-main);">Lật thẻ &amp; Trắc nghiệm từ</strong>
              <span style="font-size:12.5px;color:var(--text-muted);">Chia phần 8–15 từ · SRS</span>
            </div>
          </div>
          <span class="card-chevron">›</span>
        </button>

        <button type="button" class="theory-card" data-quick="grammar-studio">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;text-align:left;">
            <div class="icon-grammar-badge">${ico("layers", 23)}</div>
            <div style="min-width:0;">
              <strong style="font-size:15px;display:block;color:var(--text-main);">Ngữ pháp &amp; So sánh</strong>
              <span style="font-size:12.5px;color:var(--text-muted);">Theo bài · Thi TOPIK · Tương đồng</span>
            </div>
          </div>
          <span class="card-chevron">›</span>
        </button>

        <button type="button" class="theory-card" data-quick="chapter-translate">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;text-align:left;">
            <div class="icon-vocab-badge">${ico("workbook", 23)}</div>
            <div style="min-width:0;">
              <strong style="font-size:15px;display:block;color:var(--text-main);">Bài tập &amp; Dịch câu</strong>
              <span style="font-size:12.5px;color:var(--text-muted);">Chấm điểm cuối bài &amp; lưu lịch sử</span>
            </div>
          </div>
          <span class="card-chevron">›</span>
        </button>

        <button type="button" class="theory-card" data-quick="exams-20">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;text-align:left;">
            <div class="icon-grammar-badge">${ico("exam", 23)}</div>
            <div style="min-width:0;">
              <strong style="font-size:15px;display:block;color:var(--text-main);">30 Đề thi TOPIK</strong>
              <span style="font-size:12.5px;color:var(--text-muted);">Full 70/104 câu &amp; từng dạng</span>
            </div>
          </div>
          <span class="card-chevron">›</span>
        </button>
      </div>

      <div class="section-head">
        <h2>Giáo trình Quyển 1–6</h2>
      </div>
      <div class="home-books-grid">
        ${levels.map((lv, idx) => `
          <button type="button" class="achieve-card clickable" data-lv-idx="${idx}" style="text-align:left;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
              <strong style="font-size:14.5px;color:var(--text-main);display:inline-flex;align-items:center;gap:5px;">
                ${ico("book", 16)} Quyển ${lv.bookNum}
              </strong>
              <span class="badge-orange nw" style="padding:2px 7px;font-size:11px;">${lv.shortLevel}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${lv.pct}%"></div>
            </div>
            <div style="font-size:12.5px;color:var(--text-muted);">
              Đã thuộc <strong style="color:var(--text-secondary);">${lv.mastered}/${lv.totalWords}</strong> từ
            </div>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  bindAdminSupportCardEvents(root, modalRoot);

  root.querySelector("#btn-start-next-step").addEventListener("click", () => nextTask.go());
  root.querySelector("#btn-home-due-srs")?.addEventListener("click", () => navigate("theory", { sub: "vocab-review" }));
  root.querySelector("#btn-home-all-scores")?.addEventListener("click", () => navigate("check-tools", { tab: "analytics" }));

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
  root.querySelector("#btn-mia-check")?.addEventListener("click", () => navigate("check-tools", { tab: "mistakes" }));

  root.querySelectorAll("[data-quick]").forEach((el) => {
    el.addEventListener("click", () => {
      const q = el.dataset.quick;
      if (q === "vocab-review") navigate("theory", { sub: "vocab-review", book: bookId, lesson: s.lastLesson?.lesson || 1, part: 1 });
      if (q === "grammar-studio") navigate("theory", { sub: "grammar-list", mode: "topik", book: bookId, lesson: s.lastLesson?.lesson || 1 });
      if (q === "chapter-translate") navigate("theory", { sub: "lesson-detail", book: bookId, lesson: s.lastLesson?.lesson || 1, tab: "workbook" });
      if (q === "exams-20") navigate("mock-test", { sub: evalObj.examLevel, viewMode: "exams", category: "curated" });
    });
  });

  root.querySelectorAll("[data-lv-idx]").forEach((card) => {
    card.addEventListener("click", () => levels[Number(card.dataset.lvIdx)].action());
  });
}
