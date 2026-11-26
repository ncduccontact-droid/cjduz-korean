import { store } from "../store.js?v=20261126-6";
import { ico } from "../icons.js?v=20261126-6";

export function renderHomeView(root, db, navigate) {
  const s = store.state;
  const allVocab = [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank];
  const masteredCount = allVocab.filter((c) => store.isMastered(c.id)).length;
  const dueCount = store.getDueCardIds(allVocab).length;
  const starredCount = allVocab.filter((c) => s.srs[c.id]?.starred).length;
  const daysLeft = Math.max(0, Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000));

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
      <!-- Clean, Low-Clutter Hero Card -->
      <section class="prediction-banner">
        <div style="max-width:650px;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <span class="badge-orange">${ico("star", 14)} ${s.targetLevel}</span>
            <span class="meta-chip">Còn ${daysLeft} ngày thi</span>
            <span class="meta-chip" style="color:var(--primary-1);">${ico("cloud", 14)} Đã đồng bộ tài khoản</span>
          </div>

          <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;">
            Chào ${store.session.user?.name || "bạn"}! Học tiếp ${s.lastLesson.title}
          </h1>

          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
            <span class="meta-chip">Đã thuộc: <strong style="color:var(--primary-1);">${masteredCount} từ</strong></span>
            <span class="meta-chip">Đến hạn ôn: <strong style="color:#D97706;">${dueCount} thẻ</strong></span>
            <span class="meta-chip">Đánh dấu sao: <strong>${starredCount}</strong></span>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <button class="btn-primary" id="btn-continue-lesson">
              ${ico("book", 17)} Học tiếp bài đang dở
            </button>
            <button class="btn-orange" id="btn-review-now">
              ${ico("cards", 17)} Ôn thẻ SRS ${dueCount > 0 ? `(${dueCount})` : ""}
            </button>
            <button class="btn-outline-teal" id="btn-go-shadowing">
              ${ico("video", 17)} Shadowing Shorts
            </button>
          </div>
        </div>

        <div class="box-kind" style="min-width:240px;padding:16px 18px;">
          <div style="font-size:13px;color:var(--text-muted);font-weight:700;margin-bottom:8px;">Mục tiêu của bạn</div>
          <select id="home-target-select" class="box-select" style="width:100%;margin-bottom:10px;">
            ${["TOPIK I - Cấp 1", "TOPIK I - Cấp 2", "TOPIK II - Cấp 3", "TOPIK II - Cấp 4", "TOPIK II - Cấp 5", "TOPIK II - Cấp 6"]
              .map((lv) => `<option value="${lv}" ${s.targetLevel === lv ? "selected" : ""}>${lv}</option>`)
              .join("")}
          </select>
          <input type="date" id="home-exam-date" value="${s.examDate}" style="width:100%;padding:7px 12px;border-radius:99px;border:1.5px solid var(--border-card);font-size:13.5px;font-weight:600;" />
        </div>
      </section>

      <!-- 4 Core Study Modules (Clean Icon + Short Label) -->
      <div class="section-head">
        <h2>4 bước học trọng tâm mỗi ngày</h2>
      </div>
      <div class="grid-2">
        <div class="theory-card" data-quick="vocab-review">
          <div style="display:flex;align-items:center;gap:13px;">
            <div class="icon-vocab-badge">${ico("cards", 22)}</div>
            <div>
              <strong style="font-size:16.5px;display:block;">Lật thẻ 3D Từ vựng Kyuri</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">Âm thanh 0ms · Phím tắt 1–4</span>
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

      <!-- 6 TOPIK Level Cards (Airy Soft-Pastel Cards) -->
      <div class="section-head">
        <h2>Lộ trình 6 cấp TOPIK</h2>
        <button class="btn-outline-teal" id="btn-open-roadmap">${ico("compass", 16)} Lộ trình 30 ngày</button>
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

      <!-- Compact Writing & Mistake Notebook Strip -->
      <section class="outline-ai" style="margin-top:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="icon-vocab-badge">${ico("sparkle", 22)}</div>
          <div>
            <strong style="font-size:17px;display:block;">Phòng Viết 원고지 &amp; Sổ tay câu sai</strong>
            <span style="font-size:13.5px;color:var(--text-muted);">Đếm ô tự động Câu 51–54 &amp; thống kê dạng bài yếu</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn-primary" id="btn-mia-writing">${ico("pen", 16)} Viết 원고지</button>
          <button class="btn-outline-teal" id="btn-mia-check">${ico("chart", 16)} Câu sai (${s.mistakes.length})</button>
        </div>
      </section>
    </div>
  `;

  root.querySelector("#btn-continue-lesson").addEventListener("click", () => {
    navigate("theory", { sub: "lesson-detail", book: s.lastLesson.book, lesson: s.lastLesson.lesson });
  });
  root.querySelector("#btn-review-now").addEventListener("click", () => navigate("theory", { sub: "vocab-review" }));
  root.querySelector("#btn-go-shadowing").addEventListener("click", () => navigate("practice", { sub: "skills", skill: "shadowing" }));
  root.querySelector("#btn-open-roadmap").addEventListener("click", () => navigate("roadmap"));
  root.querySelector("#btn-mia-writing").addEventListener("click", () => navigate("practice", { sub: "topik2", skill: "writing" }));
  root.querySelector("#btn-mia-check").addEventListener("click", () => navigate("check-tools", { tab: "mistakes" }));

  root.querySelector("#home-target-select").addEventListener("change", (e) => {
    store.state.targetLevel = e.target.value;
    store.save();
  });
  root.querySelector("#home-exam-date").addEventListener("change", (e) => {
    store.state.examDate = e.target.value;
    store.save();
    renderHomeView(root, db, navigate);
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
