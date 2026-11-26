import { store } from "../store.js";

export function renderHomeView(root, db, navigate) {
  const s = store.state;
  const allVocab = [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank];
  const masteredCount = allVocab.filter((c) => store.isMastered(c.id)).length;
  const dueCount = store.getDueCardIds(allVocab).length;
  const starredCount = allVocab.filter((c) => s.srs[c.id]?.starred).length;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(s.examDate).getTime() - Date.now()) / 86400000)
  );

  const levels = [
    { badge: "TOPIK 1 · Sơ cấp 1", desc: "Giáo trình Tổng Hợp Quyển 1", items: [
      `Đã thuộc ${db.sc1Vocab.filter(c => store.isMastered(c.id)).length}/${db.sc1Vocab.length} từ vựng giọng Kyuri`,
      `${db.sc1Grammar.length} cấu trúc ngữ pháp nền tảng (Bài 1–15)`,
      "Nắm vững Hangeul & 7 quy tắc nối âm, căng âm",
      "Giao tiếp chào hỏi, mua sắm, trường học, sinh hoạt"
    ], action: () => navigate("theory", { sub: "vocab-book", book: "sc1" }) },
    { badge: "TOPIK 2 · Sơ cấp 2", desc: "Giáo trình Tổng Hợp Quyển 2", items: [
      `Kho ${db.topik1Bank.length} câu điền khuyết & từ vựng TOPIK I`,
      `${db.sejongVocab.length} từ vựng hội thoại Sejong mở rộng`,
      "Luyện nghe phản xạ câu 1–30 & đọc hiểu câu 31–70",
      "Đạt chuẩn 140+/200 điểm đỗ TOPIK I Cấp 2"
    ], action: () => navigate("theory", { sub: "vocab-book", book: "topik1" }) },
    { badge: "TOPIK 3 · Trung cấp 1", desc: "Giáo trình Tổng Hợp Quyển 3", items: [
      "Mở rộng từ vựng qua Sơ đồ gốc từ Âm Hán – Hàn",
      "Câu tường thuật gián tiếp & liên từ nối câu",
      "Giao tiếp tự nhiên trong đời sống xã hội & du lịch",
      "Ăn trọn điểm nhóm câu 1–20 Nghe & Đọc TOPIK II"
    ], action: () => navigate("theory", { sub: "hanja" }) },
    { badge: "TOPIK 4 · Trung cấp 2", desc: "Giáo trình Tổng Hợp Quyển 4", items: [
      "Kho câu thường gặp, từ đồng nghĩa & quán dụng ngữ",
      "Viết giấy kẻ ô vuông 원고지 câu 51, 52 & biểu đồ 53",
      "Shadowing hội thoại công sở & chuyển 3 cấp kính ngữ",
      "Đạt chuẩn 150+/300 điểm du học & làm việc"
    ], action: () => navigate("practice", { sub: "topik2", skill: "writing" }) },
    { badge: "TOPIK 5 · Cao cấp 1", desc: "Giáo trình Tổng Hợp Quyển 5", items: [
      "Đọc hiểu tin tức báo chí, kinh tế, khoa học xã hội",
      "Luyện đề Hard Test phân loại câu 32–50 TOPIK II",
      "Trình bày biểu đồ & nêu quan điểm TOPIK Speaking",
      "Làm chủ cấu trúc nghị luận xã hội 600–700 chữ"
    ], action: () => navigate("mock-test", { sub: "topik2" }) },
    { badge: "TOPIK 6 · Cao cấp 2", desc: "Giáo trình Tổng Hợp Quyển 6", items: [
      "Tinh thông sắc thái từ Hán–Hàn học thuật & thành ngữ",
      "Xử lý trọn vẹn đề Full Test áp lực thời gian thật",
      "Sạch lỗi trong Sổ tay câu sai & Check tỷ lệ đúng >85%",
      "Chinh phục mốc 230+/300 điểm cao nhất kỳ thi TOPIK"
    ], action: () => navigate("check-tools") }
  ];

  root.innerHTML = `
    <div class="container-web">
      <!-- Pale Mint Hero Banner (#E0F2F0 like Migii .prediction-banner) -->
      <section class="prediction-banner">
        <div style="max-width: 690px;">
          <div style="display:inline-flex;align-items:center;gap:8px;background:#FFFFFF;color:var(--primary-1);padding:5px 14px;border-radius:99px;font-size:13.5px;font-weight:700;margin-bottom:10px;">
            <span>🎯 Mục tiêu: ${s.targetLevel}</span>
            <span>·</span>
            <span>Còn ${daysLeft} ngày tới kỳ thi</span>
          </div>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:var(--text-main);">
            Chào ${store.session.user?.name || "CJDUZ"}! Học tiếp lộ trình Tiếng Hàn Tổng Hợp &amp; TOPIK
          </h1>
          <p style="margin:0 0 18px;color:var(--text-muted);font-size:15.5px;">
            Đang học: <strong style="color:var(--primary-1)">${s.lastLesson.title}</strong> · Đã thuộc <strong>${masteredCount}</strong> từ · Cần ôn SRS hôm nay: <strong style="color:var(--yellow-2)">${dueCount} thẻ</strong> (Đánh dấu sao: ${starredCount}).
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <button class="btn-primary" id="btn-continue-lesson">
              ▶ Học tiếp ${s.lastLesson.title}
            </button>
            <button class="btn-orange" id="btn-review-now">
              🔁 Ôn từ vựng ngay (${dueCount > 0 ? `${dueCount} đến hạn` : "Luyện Quiz"})
            </button>
            <button class="btn-outline-teal" id="btn-go-shadowing">
              🎙️ Phòng tập nói Shadowing
            </button>
          </div>
        </div>

        <div style="background:#FFFFFF;border-radius:16px;padding:18px 22px;min-width:255px;box-shadow:var(--shadow-el);">
          <div style="font-size:13.5px;color:var(--text-muted);font-weight:600;margin-bottom:8px;">Thiết lập mục tiêu nhanh</div>
          <label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-muted);">Cấp độ mục tiêu</label>
          <select id="home-target-select" class="box-select" style="width:100%;margin-bottom:10px;">
            ${["TOPIK I - Cấp 1", "TOPIK I - Cấp 2", "TOPIK II - Cấp 3", "TOPIK II - Cấp 4", "TOPIK II - Cấp 5", "TOPIK II - Cấp 6"]
              .map((lv) => `<option value="${lv}" ${s.targetLevel === lv ? "selected" : ""}>${lv}</option>`)
              .join("")}
          </select>
          <label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-muted);">Ngày dự thi TOPIK</label>
          <input type="date" id="home-exam-date" value="${s.examDate}" style="width:100%;padding:7px 12px;border-radius:99px;border:1.5px solid var(--primary);font-size:14px;color:var(--text-main);" />
        </div>
      </section>

      <!-- Quick Shortcut Strip for User's Core Pillars -->
      <div class="section-head">
        <h2>Truy cập nhanh các khu luyện tập trọng tâm</h2>
      </div>
      <div class="grid-3" style="margin-bottom: 12px;">
        <div class="box-kind clickable" data-quick="vocab-review">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="font-size:17px;color:var(--primary-1);">📚 Học &amp; Ôn Từ Vựng Kyuri</strong>
            <span class="badge-orange" style="background:rgba(254,154,5,0.12);">1.106 mục</span>
          </div>
          <p style="margin:0;font-size:14px;color:var(--text-muted);">537 từ Sơ cấp 1 + 129 từ Sejong + 440 câu TOPIK I kèm 4 chế độ Quiz &amp; SRS.</p>
        </div>

        <div class="box-kind clickable" data-quick="frequent">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="font-size:17px;color:var(--primary-1);">⚡ Câu Thường Gặp TOPIK 1 &amp; 2</strong>
            <span class="badge-orange" style="background:rgba(254,154,5,0.12);">Tủ thực chiến</span>
          </div>
          <p style="margin:0;font-size:14px;color:var(--text-muted);">Mẫu câu phản xạ hội thoại, phó từ nối câu, từ đồng nghĩa &amp; quán dụng ngữ.</p>
        </div>

        <div class="box-kind clickable" data-quick="topik-matrix">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong style="font-size:17px;color:var(--primary-1);">🎯 Ôn Theo Cấu Trúc Đề TOPIK</strong>
            <span class="badge-orange" style="background:rgba(254,154,5,0.12);">Check % đúng</span>
          </div>
          <p style="margin:0;font-size:14px;color:var(--text-muted);">Luyện xoáy sâu từng dạng câu Nghe, Đọc, Viết 원고지 &amp; Sổ tay câu sai tự động.</p>
        </div>
      </div>

      <!-- 6 TOPIK Level Cards (#00B2A5 3x2 Grid like Migii Landing) -->
      <div class="section-head">
        <h2>Lộ trình chinh phục 6 cấp độ TOPIK &amp; Giáo trình Tổng Hợp</h2>
        <button class="btn-outline-teal" id="btn-open-roadmap">Xem lộ trình từng ngày →</button>
      </div>
      <div class="grid-3">
        ${levels.map((lv, idx) => `
          <article class="achieve-card">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <span class="badge-orange">${lv.badge}</span>
              <span style="font-size:12.5px;opacity:0.9;">${lv.desc}</span>
            </div>
            <ul class="achieve-list">
              ${lv.items.map((it) => `<li><span>✔</span><span>${it}</span></li>`).join("")}
            </ul>
            <button type="button" data-lv-idx="${idx}" style="margin-top:auto;background:rgba(255,255,255,0.18);color:#FFF;border:1px solid rgba(255,255,255,0.45);border-radius:99px;padding:8px 16px;font-weight:600;cursor:pointer;">
              Vào học cấp độ này
            </button>
          </article>
        `).join("")}
      </div>

      <!-- MIA AI & Smart Check Highlight Block (.outline-ai gradient border) -->
      <div class="section-head">
        <h2>Trợ thủ Luyện Viết 원고지, Shadowing &amp; Trung tâm Check</h2>
      </div>
      <section class="outline-ai" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;">
        <div style="max-width:720px;">
          <div style="display:inline-block;background:#00A699;color:#FFF;font-weight:700;font-size:12px;padding:3px 10px;border-radius:8px;margin-bottom:8px;">
            🌼 CJDUZ AI STUDIO · TRỢ THỦ LUYỆN THI
          </div>
          <h3 style="margin:0 0 6px;font-size:20px;">Tập nói Shadowing nhận diện giọng đọc, Viết ô vuông 원고지 câu 53–54 &amp; Check điểm yếu</h3>
          <p style="margin:0;color:var(--text-muted);font-size:14.5px;">
            Soi tự động quy tắc nối âm/căng âm trên từng câu tiếng Hàn, thu âm đối chiếu giọng mẫu Kyuri, đếm ký tự chuẩn giấy thi TOPIK II và thống kê tỷ lệ đúng theo từng dạng đề.
          </p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-primary" id="btn-mia-writing">Viết 원고지 Câu 51–54</button>
          <button class="btn-outline-teal" id="btn-mia-check">Mở Trung tâm Check (${s.mistakes.length} câu sai)</button>
        </div>
      </section>
    </div>
  `;

  root.querySelector("#btn-continue-lesson").addEventListener("click", () => {
    navigate("theory", { sub: "lesson-detail", book: s.lastLesson.book, lesson: s.lastLesson.lesson });
  });
  root.querySelector("#btn-review-now").addEventListener("click", () => {
    navigate("theory", { sub: "vocab-review" });
  });
  root.querySelector("#btn-go-shadowing").addEventListener("click", () => {
    navigate("practice", { sub: "skills", skill: "shadowing" });
  });
  root.querySelector("#btn-open-roadmap").addEventListener("click", () => navigate("roadmap"));
  root.querySelector("#btn-mia-writing").addEventListener("click", () => navigate("practice", { sub: "topik2", skill: "writing" }));
  root.querySelector("#btn-mia-check").addEventListener("click", () => navigate("check-tools"));

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
      if (q === "frequent") navigate("theory", { sub: "frequent" });
      if (q === "topik-matrix") navigate("practice", { sub: "topik1" });
    });
  });

  root.querySelectorAll("[data-lv-idx]").forEach((btn) => {
    btn.addEventListener("click", () => levels[Number(btn.dataset.lvIdx)].action());
  });
}
