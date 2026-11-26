import { store, playAudio, preloadAudioUrls, speakKoreanTTS } from "../store.js?v=20261126-5";

/**
 * Hydrates a 70-question TOPIK I or 104-question TOPIK II exam from normalized slots + itemPool.
 */
export function hydrateExamQuestions(exam, itemPool = {}, scope = "full") {
  if (!exam || !Array.isArray(exam.slots)) return [];
  const filteredSlots = exam.slots.filter((sl) => {
    if (!scope || scope === "full") return true;
    if (scope === "listening" || scope === "writing" || scope === "reading") return sl.section === scope;
    return sl.typeId === scope;
  });

  return filteredSlots.map((sl) => {
    const base = itemPool[sl.itemId] || {};
    if (sl.isWriting || base.subType) {
      return {
        ...base,
        id: `${exam.id}_q${sl.num}`,
        rawItemId: sl.itemId,
        num: sl.num,
        paperNum: sl.paperNum,
        section: sl.section,
        sectionLabel: sl.sectionLabel,
        typeId: sl.typeId,
        sec: sl.sec,
        pts: sl.pts,
        isWriting: true
      };
    }

    let options = Array.isArray(base.options) ? [...base.options] : [];
    let answer = Number(base.answer || 0);
    const shift = Number(sl.optShift || 0) % 4;
    if (shift > 0 && options.length === 4) {
      const correctText = options[answer];
      options = [...options.slice(shift), ...options.slice(0, shift)];
      answer = options.indexOf(correctText);
    }

    return {
      ...base,
      id: `${exam.id}_q${sl.num}`,
      rawItemId: sl.itemId,
      num: sl.num,
      paperNum: sl.paperNum,
      section: sl.section,
      sectionLabel: sl.sectionLabel,
      typeId: sl.typeId,
      groupRange: sl.groupRange || "",
      sec: sl.sec,
      pts: sl.pts,
      options,
      answer,
      isWriting: false
    };
  });
}

function scoreWritingResponse(q, draftObj = {}) {
  if (q.subType === "q51" || q.subType === "q52") {
    const a = (draftObj.a || "").trim();
    const b = (draftObj.b || "").trim();
    let pts = 0;
    if (a.length >= 4) {
      pts += 2;
      if ((q.keywordsA || []).some((kw) => a.includes(kw))) pts += 2;
      if (q.subType === "q51" && /(습니다|ㅂ니다|바랍니다|십시오|세요)/.test(a)) pts += 1;
      if (q.subType === "q52" && /(다|는다|인다|것이다)\.?$/.test(a)) pts += 1;
    }
    if (b.length >= 4) {
      pts += 2;
      if ((q.keywordsB || []).some((kw) => b.includes(kw))) pts += 2;
      if (q.subType === "q51" && /(습니다|ㅂ니다|바랍니다|십시오|세요)/.test(b)) pts += 1;
      if (q.subType === "q52" && /(다|는다|인다|것이다)\.?$/.test(b)) pts += 1;
    }
    return Math.min(q.pts || 10, pts);
  }

  const text = (draftObj.essay || "").trim();
  const len = text.length;
  if (!len) return 0;

  if (q.subType === "q53") {
    let pts = 0;
    if (len >= 180 && len <= 330) pts += 14;
    else if (len >= 100) pts += 8;
    else pts += 3;
    const kwHits = (q.keywords || []).filter((kw) => text.includes(kw)).length;
    pts += Math.min(10, kwHits * 3);
    if (/(다\.|는다\.|인다\.|보인다|전망된다|나타났다)/.test(text)) pts += 6;
    return Math.min(30, pts);
  }

  // q54 (50 pts, 600~700 chars)
  let pts = 0;
  if (len >= 550 && len <= 740) pts += 24;
  else if (len >= 320) pts += 15;
  else if (len >= 120) pts += 7;
  else pts += 3;
  const kwHits = (q.keywords || []).filter((kw) => text.includes(kw)).length;
  pts += Math.min(16, kwHits * 3);
  if (/(다\.|는다\.|것이다|해야 한다|필요하다)/.test(text)) pts += 10;
  return Math.min(50, pts);
}

function renderMiniWongokjiPreview(text, maxCells = 300) {
  const clean = (text || "").replace(/\r/g, "");
  const cells = [];
  clean.split("\n").forEach((para, pi) => {
    if (pi > 0 && cells.length % 20 !== 0) {
      while (cells.length % 20 !== 0) cells.push("");
    }
    if (para.length > 0) {
      cells.push(" ");
      for (const ch of Array.from(para)) cells.push(ch);
    }
  });
  const rows = Math.min(36, Math.max(6, Math.ceil(Math.max(cells.length, Math.min(160, maxCells)) / 20)));
  while (cells.length < rows * 20) cells.push("");
  return `
    <div class="wongokji-scroll-wrap" style="margin-top:10px;">
      <div style="display:grid;grid-template-columns:repeat(20, 26px);border:1.5px solid #DC2626;width:max-content;background:#FFFDF9;">
        ${cells.slice(0, rows * 20).map((c) => `
          <div class="ko" style="width:26px;height:26px;border:0.5px solid #FCA5A5;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#1E293B;">${c === " " ? "" : (c || "")}</div>
        `).join("")}
      </div>
    </div>
  `;
}

export function renderMockTestView(root, db, navigate, params = {}, registerCleanup = () => {}) {
  const sys = db.topikFullSystem || { taxonomy: { topik1: {}, topik2: {} }, itemPool: {}, exams: { topik1: [], topik2: [] } };
  const levelKey = params.sub === "topik2" ? "topik2" : "topik1";
  const viewMode = params.viewMode || "exams"; // exams | segments
  const category = params.category || "all";   // all | curated | niied | sejong_ibt | trend
  const skill = params.skill || "listening";   // listening | reading | writing
  const typeId = params.typeId || null;

  // 1. EXAM ROOM OR EXAM SEGMENT OVERVIEW (/de-thi/:lv/de/:examId/...)
  if (params.examId) {
    const allExams = [...(sys.exams.topik1 || []), ...(sys.exams.topik2 || [])];
    const exam = allExams.find((x) => x.id === params.examId);
    if (!exam) {
      return navigate("mock-test", { sub: levelKey, viewMode: "exams", category: "all" });
    }
    if (params.action === "room") {
      return renderExamRoom(root, sys, exam, params.scope || "full", navigate, registerCleanup);
    }
    return renderSingleExamOverview(root, sys, exam, navigate);
  }

  // 2. SEGMENTED QUESTION-TYPE DRILL ROOM (/de-thi/:lv/tung-phan/:skill/:typeId)
  if (viewMode === "segments" && typeId) {
    return renderTypeMasteryDrill(root, sys, levelKey, skill, typeId, navigate);
  }

  // 3. MAIN HUB: 2 TOP-LEVEL MODES (KIỂU 1: FULL ĐỀ 70/104 CÂU vs KIỂU 2: LUYỆN ĐỀ TỪNG PHẦN / TỪNG DẠNG)
  const rawExams = sys.exams[levelKey] || [];
  const curatedCount = rawExams.filter((e) => e.curated).length;
  const filteredExams = rawExams.filter((e) => {
    if (category === "curated") return Boolean(e.curated);
    if (category === "all") return true;
    return e.category === category;
  });

  const lvTaxonomy = sys.taxonomy[levelKey] || { listening: [], reading: [], writing: [] };
  const activeTypes = lvTaxonomy[skill] || lvTaxonomy.listening || [];

  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button type="button" id="bc-home">Trang chủ</button>
        <span>▶</span>
        <span>Trung tâm Luyện Đề TOPIK (${levelKey === "topik1" ? "TOPIK I · Full 70 câu" : "TOPIK II · Full 104 câu"})</span>
      </div>

      <!-- 2-MODE MASTER SWITCHER BANNER -->
      <div class="box-kind" style="padding:18px 22px;margin-bottom:20px;background:linear-gradient(135deg,#E6F7F5 0%,#FFFFFF 100%);border:1.5px solid var(--primary);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:14px;">
          <div>
            <strong style="font-size:18.5px;color:var(--primary-1);display:block;">
              🎯 Chọn phương thức luyện đề ${levelKey === "topik1" ? "TOPIK I (Chuẩn 70 câu · 200 điểm)" : "TOPIK II (Chuẩn 104 câu · 300 điểm)"}
            </strong>
            <span style="font-size:13.5px;color:var(--text-muted);">
              Chuyển linh hoạt giữa <strong>Kiểu 1: Vào thi Full Đề như thật</strong> và <strong>Kiểu 2: Luyện nhuần nhuyễn từng phần (Nghe · Đọc · Viết từ Dạng 1 → Dạng cuối)</strong>
            </span>
          </div>

          <div style="display:flex;gap:8px;background:#F1F5F9;padding:5px;border-radius:99px;">
            <button type="button" id="lv-btn-t1" style="padding:8px 18px;border-radius:99px;border:none;font-weight:800;cursor:pointer;background:${levelKey === "topik1" ? "var(--primary)" : "transparent"};color:${levelKey === "topik1" ? "#FFF" : "var(--text-main)"};">
              TOPIK I (70 câu)
            </button>
            <button type="button" id="lv-btn-t2" style="padding:8px 18px;border-radius:99px;border:none;font-weight:800;cursor:pointer;background:${levelKey === "topik2" ? "var(--primary)" : "transparent"};color:${levelKey === "topik2" ? "#FFF" : "var(--text-main)"};">
              TOPIK II (104 câu)
            </button>
          </div>
        </div>

        <div class="grid-2" style="gap:12px;">
          <button type="button" id="mode-card-exams" style="text-align:left;padding:15px 18px;border-radius:14px;cursor:pointer;border:2px solid ${viewMode === "exams" ? "var(--primary)" : "#CBD5E1"};background:${viewMode === "exams" ? "#FFFFFF" : "rgba(255,255,255,0.65)"};box-shadow:${viewMode === "exams" ? "var(--shadow-el)" : "none"};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <strong style="font-size:16px;color:var(--primary-1);">📝 Kiểu 1: Vào làm Full Đề thi thật (${rawExams.length} đề)</strong>
              ${viewMode === "exams" ? `<span class="badge-orange">ĐANG CHỌN</span>` : ""}
            </div>
            <div style="font-size:13px;color:var(--text-muted);">
              Trọn vẹn ${levelKey === "topik1" ? "70 câu (30 Nghe + 40 Đọc · 100 phút)" : "104 câu (50 Nghe + 4 Viết + 50 Đọc · 180 phút)"}, có <strong>⭐ Đề thi tuyển chọn</strong> &amp; ghi rõ nguồn NIIED / Sejong / IBT.
            </div>
          </button>

          <button type="button" id="mode-card-segments" style="text-align:left;padding:15px 18px;border-radius:14px;cursor:pointer;border:2px solid ${viewMode === "segments" ? "var(--yellow-2)" : "#CBD5E1"};background:${viewMode === "segments" ? "#FFFBEB" : "rgba(255,255,255,0.65)"};box-shadow:${viewMode === "segments" ? "var(--shadow-el)" : "none"};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <strong style="font-size:16px;color:#B45309;">🧩 Kiểu 2: Luyện đề từng phần · Từng dạng (Dạng 1 → ${levelKey === "topik1" ? "Dạng 8" : "Dạng 10"})</strong>
              ${viewMode === "segments" ? `<span class="badge-orange">ĐANG CHỌN</span>` : ""}
            </div>
            <div style="font-size:13px;color:var(--text-muted);">
              Bóc tách cả <strong>Phần Nghe</strong>, <strong>Phần Đọc</strong>${levelKey === "topik2" ? ", <strong>Phần Viết</strong>" : ""} từ Dạng 1 đến Dạng cuối — chấm tức thì &amp; lặp câu sai đến khi nhuần nhuyễn 100%.
            </div>
          </button>
        </div>
      </div>

      ${viewMode === "exams" ? `
        <!-- FILTER PILLS INCLUDING ⭐ ĐỀ THI TUYỂN CHỌN -->
        <div class="exam-nav" style="margin-bottom:18px;flex-wrap:wrap;">
          <button class="${category === "all" ? "active" : ""}" data-cat="all">📚 Tất cả Full đề (${rawExams.length})</button>
          <button class="${category === "curated" ? "active" : ""}" data-cat="curated">⭐ Đề thi tuyển chọn (${curatedCount})</button>
          <button class="${category === "niied" ? "active" : ""}" data-cat="niied">🏛️ Đề chính thức NIIED (Kỳ 35 → 64)</button>
          <button class="${category === "sejong_ibt" ? "active" : ""}" data-cat="sejong_ibt">💻 Đề TOPIK IBT &amp; Học viện Sejong</button>
          <button class="${category === "trend" ? "active" : ""}" data-cat="trend">🔥 Xu hướng mới 2024–2025 (Kỳ 96 &amp; 102)</button>
        </div>

        <div class="grid-2">
          ${filteredExams.map((ex) => {
            const past = store.state.examHistory.find((h) => h.examId === ex.id);
            return `
              <div class="box-kind" style="padding:22px;display:flex;flex-direction:column;justify-content:space-between;border:${ex.curated ? "1.5px solid rgba(254,154,5,0.45)" : "1px solid transparent"};">
                <div>
                  ${ex.ribbon ? `<div class="test-tape">${ex.ribbon}</div>` : ""}
                  <h3 style="margin:0 0 6px;font-size:18px;padding-right:78px;">${ex.title}</h3>
                  <div style="font-size:13px;color:var(--primary-1);font-weight:700;margin-bottom:6px;">
                    📋 ${ex.structureDesc}
                  </div>
                  ${ex.curated && ex.curatedNote ? `
                    <div style="font-size:13px;background:#FFFBEB;color:#92400E;padding:7px 11px;border-radius:8px;margin-bottom:8px;border-left:3px solid var(--yellow-2);">
                      ⭐ <strong>Điểm nổi bật:</strong> ${ex.curatedNote}
                    </div>
                  ` : ""}
                  <div style="font-size:12.5px;color:#475569;background:#F8FAFC;padding:7px 11px;border-radius:8px;margin-bottom:10px;">
                    📌 <strong>Nguồn đề:</strong> ${ex.sourceOrg}
                    ${ex.sourceUrl ? ` · <a href="${ex.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--primary-1);font-weight:700;text-decoration:underline;">${ex.sourceUrl.replace("https://", "")}</a>` : ""}
                  </div>
                  <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">
                    ⏱️ <strong>${ex.minutes} phút</strong> &nbsp;|&nbsp; 🎯 Điểm đỗ: <strong>${ex.passScore}/${ex.maxScore}đ</strong> &nbsp;|&nbsp; 📝 Số lượng: <strong>Đủ ${ex.totalQuestions} câu chuẩn</strong>
                  </div>
                  ${past ? `
                    <div style="font-size:13px;color:var(--success);font-weight:700;margin-bottom:10px;">
                      ✔ Lần thi gần nhất: ${past.score}/${past.maxScore} điểm (${past.grade})
                    </div>
                  ` : ""}
                </div>

                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                  <button type="button" class="btn-primary" data-quick-full="${ex.id}" style="flex:1;justify-content:center;">
                    ⚡ Vào làm Full ${ex.totalQuestions} câu
                  </button>
                  <button type="button" class="btn-outline-teal" data-open-seg="${ex.id}">
                    🧩 Chia phần / Từng dạng
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <!-- KIỂU 2: SEGMENTED SKILL & QUESTION-TYPE MASTERY HUB -->
        <div class="skill-pills-row" style="margin-bottom:18px;">
          <button type="button" class="btn-skill ${skill === "listening" ? "active" : ""}" data-seg-sk="listening">
            🎧 Phần Nghe · 듣기 (${lvTaxonomy.listening.length} Dạng · ${levelKey === "topik1" ? "Câu 1~30" : "Câu 1~50"})
          </button>
          <button type="button" class="btn-skill ${skill === "reading" ? "active" : ""}" data-seg-sk="reading">
            📖 Phần Đọc · 읽기 (${lvTaxonomy.reading.length} Dạng · ${levelKey === "topik1" ? "Câu 31~70" : "Đọc 1~50"})
          </button>
          ${levelKey === "topik2" ? `
            <button type="button" class="btn-skill ${skill === "writing" ? "active" : ""}" data-seg-sk="writing">
              ✍️ Phần Viết · 쓰기 (3 Dạng · Câu 51~54 원고지)
            </button>
          ` : ""}
        </div>

        <div class="grid-2">
          ${activeTypes.map((tp) => {
            const poolItems = Object.values(sys.itemPool).filter((it) => it.typeId === tp.id);
            const st = store.state.partStats[tp.id] || { correct: 0, total: 0 };
            const pct = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
            const masteredBadge = st.total >= 4 && pct >= 85
              ? `<span style="background:rgba(58,202,116,0.16);color:#15803D;padding:3px 10px;border-radius:99px;font-size:12px;font-weight:800;">✔ Đã nhuần nhuyễn (${pct}%)</span>`
              : `<span style="background:var(--primary-3);color:var(--primary-1);padding:3px 10px;border-radius:99px;font-size:12px;font-weight:700;">${poolItems.length} câu luyện · ${tp.ptsDesc}</span>`;

            return `
              <div class="box-kind clickable" data-drill-type="${tp.id}" style="display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
                    <span class="badge-orange" style="background:rgba(254,154,5,0.14);">${tp.code} · ${tp.range}</span>
                    ${masteredBadge}
                  </div>
                  <strong style="font-size:16.5px;display:block;margin-bottom:4px;">${tp.title}</strong>
                  <div class="ko" style="font-size:13px;color:var(--primary-1);font-weight:600;margin-bottom:8px;">유형: ${tp.koTitle} (Mỗi đề thật: ${tp.countPerExam} câu)</div>
                  <div style="font-size:13.5px;color:var(--text-muted);margin-bottom:12px;">💡 <strong>Mẹo ăn điểm:</strong> ${tp.tip}</div>
                </div>

                <div>
                  <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;">
                    <span>Đã luyện đúng: <strong>${st.correct}/${st.total} lượt</strong></span>
                    <span>Độ nhuần nhuyễn: <strong style="color:var(--primary-1);">${pct}%</strong></span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill ${st.total > 0 && pct < 60 ? "danger" : ""}" style="width:${pct}%"></div>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>
  `;

  root.querySelector("#bc-home").addEventListener("click", () => navigate("home"));
  root.querySelector("#lv-btn-t1").addEventListener("click", () => navigate("mock-test", { sub: "topik1", viewMode, category, skill }));
  root.querySelector("#lv-btn-t2").addEventListener("click", () => navigate("mock-test", { sub: "topik2", viewMode, category, skill: skill === "writing" ? "listening" : skill }));
  root.querySelector("#mode-card-exams").addEventListener("click", () => navigate("mock-test", { sub: levelKey, viewMode: "exams", category }));
  root.querySelector("#mode-card-segments").addEventListener("click", () => navigate("mock-test", { sub: levelKey, viewMode: "segments", skill }));

  root.querySelectorAll("[data-cat]").forEach((b) => {
    b.addEventListener("click", () => navigate("mock-test", { sub: levelKey, viewMode: "exams", category: b.dataset.cat }));
  });
  root.querySelectorAll("[data-quick-full]").forEach((b) => {
    b.addEventListener("click", () => navigate("mock-test", { sub: levelKey, examId: b.dataset.quickFull, action: "room", scope: "full" }));
  });
  root.querySelectorAll("[data-open-seg]").forEach((b) => {
    b.addEventListener("click", () => navigate("mock-test", { sub: levelKey, examId: b.dataset.openSeg, action: "overview" }));
  });
  root.querySelectorAll("[data-seg-sk]").forEach((b) => {
    b.addEventListener("click", () => navigate("mock-test", { sub: levelKey, viewMode: "segments", skill: b.dataset.segSk }));
  });
  root.querySelectorAll("[data-drill-type]").forEach((card) => {
    card.addEventListener("click", () => navigate("mock-test", { sub: levelKey, viewMode: "segments", skill, typeId: card.dataset.drillType }));
  });
}

// ============================================================================
// SINGLE EXAM SEGMENT OVERVIEW (/de-thi/:lv/de/:examId)
// Lets user either enter Full 70/104 Exam OR practice individual sections/types of THIS exam!
// ============================================================================
function renderSingleExamOverview(root, sys, exam, navigate) {
  const lvTax = sys.taxonomy[exam.level] || { listening: [], reading: [], writing: [] };

  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button type="button" id="bc-home">Trang chủ</button>
        <span>▶</span>
        <button type="button" id="bc-list">Kho đề ${exam.level === "topik1" ? "TOPIK I" : "TOPIK II"}</button>
        <span>▶</span>
        <span>${exam.title}</span>
      </div>

      <div class="prediction-banner" style="margin-bottom:20px;">
        <div>
          <span class="badge-orange" style="margin-bottom:8px;">${exam.ribbon || "ĐỀ CHUẨN"} · ĐỦ ${exam.totalQuestions} CÂU</span>
          <h2 style="margin:0 0 6px;color:var(--primary-1);">${exam.title}</h2>
          <div style="font-size:14px;color:var(--text-muted);margin-bottom:6px;">${exam.structureDesc}</div>
          <div style="font-size:13px;color:#334155;">📌 <strong>Nguồn:</strong> ${exam.sourceOrg}</div>
        </div>
        <button type="button" class="btn-primary" id="btn-launch-full" style="font-size:16px;padding:13px 24px;">
          ⚡ Vào Thi Full Đề (${exam.totalQuestions} câu · ${exam.minutes} phút)
        </button>
      </div>

      <!-- SECTION-BY-SECTION ENTRY -->
      <div class="section-head" style="margin-top:6px;">
        <h2>Chia theo từng kỹ năng lớn của đề này</h2>
      </div>
      <div class="${exam.level === "topik2" ? "grid-3" : "grid-2"}" style="margin-bottom:22px;">
        <div class="box-kind">
          <strong style="font-size:17px;color:var(--primary-1);display:block;margin-bottom:6px;">🎧 Phần Nghe · 듣기</strong>
          <p style="font-size:13.5px;color:var(--text-muted);margin:0 0 12px;">
            ${exam.level === "topik1" ? "Câu 1 → Câu 30 (30 câu · 100 điểm · 40 phút)" : "Câu 1 → Câu 50 (50 câu · 100 điểm · 60 phút)"} — Giọng đọc Hàn tự nhiên .mp3.
          </p>
          <button type="button" class="btn-outline-teal" data-scope="listening">Làm riêng Phần Nghe →</button>
        </div>

        ${exam.level === "topik2" ? `
          <div class="box-kind">
            <strong style="font-size:17px;color:#B45309;display:block;margin-bottom:6px;">✍️ Phần Viết · 쓰기</strong>
            <p style="font-size:13.5px;color:var(--text-muted);margin:0 0 12px;">
              Câu 51 → Câu 54 (4 câu tự luận · 100 điểm · 50 phút) — Có ô điền ㉠㉡, giấy kẻ ô 원고지 &amp; bài mẫu.
            </p>
            <button type="button" class="btn-outline-teal" data-scope="writing">Làm riêng Phần Viết →</button>
          </div>
        ` : ""}

        <div class="box-kind">
          <strong style="font-size:17px;color:var(--primary-1);display:block;margin-bottom:6px;">📖 Phần Đọc · 읽기</strong>
          <p style="font-size:13.5px;color:var(--text-muted);margin:0 0 12px;">
            ${exam.level === "topik1" ? "Câu 31 → Câu 70 (40 câu · 100 điểm · 60 phút)" : "Đọc 1 → 50 / Toàn đề 55 → 104 (50 câu · 100 điểm · 70 phút)"}.
          </p>
          <button type="button" class="btn-outline-teal" data-scope="reading">Làm riêng Phần Đọc →</button>
        </div>
      </div>

      <!-- QUESTION-TYPE BREAKDOWN INSIDE THIS EXAM -->
      <div class="section-head">
        <h2>Chia nhỏ từng dạng câu hỏi trong đề này (Dạng 1 → Dạng cuối)</h2>
      </div>
      <div class="grid-2">
        ${[
          ...lvTax.listening.map((t) => ({ ...t, secIcon: "🎧 Nghe" })),
          ...(lvTax.writing || []).map((t) => ({ ...t, secIcon: "✍️ Viết" })),
          ...lvTax.reading.map((t) => ({ ...t, secIcon: "📖 Đọc" }))
        ].map((tp) => `
          <div class="box-kind clickable" data-scope="${tp.id}" style="padding:16px 18px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <div>
              <span style="font-size:12px;font-weight:700;color:var(--primary-1);">${tp.secIcon} · ${tp.range}</span>
              <strong style="display:block;font-size:15px;margin-top:2px;">${tp.title}</strong>
            </div>
            <span class="btn-outline-teal" style="padding:5px 12px;font-size:12.5px;flex-shrink:0;">Luyện (${tp.countPerExam} câu) →</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  root.querySelector("#bc-home").addEventListener("click", () => navigate("home"));
  root.querySelector("#bc-list").addEventListener("click", () => navigate("mock-test", { sub: exam.level, viewMode: "exams" }));
  root.querySelector("#btn-launch-full").addEventListener("click", () => {
    navigate("mock-test", { sub: exam.level, examId: exam.id, action: "room", scope: "full" });
  });
  root.querySelectorAll("[data-scope]").forEach((el) => {
    el.addEventListener("click", () => {
      navigate("mock-test", { sub: exam.level, examId: exam.id, action: "room", scope: el.dataset.scope });
    });
  });
}

// ============================================================================
// QUESTION-TYPE MASTERY DRILL ROOM ("LUYỆN NHUẦN NHUYỄN CÁC PHẦN")
// ============================================================================
function renderTypeMasteryDrill(root, sys, levelKey, skill, typeId, navigate) {
  const lvTax = sys.taxonomy[levelKey] || {};
  const allTypes = [...(lvTax.listening || []), ...(lvTax.reading || []), ...(lvTax.writing || [])];
  const tpMeta = allTypes.find((t) => t.id === typeId);
  if (!tpMeta) {
    return navigate("mock-test", { sub: levelKey, viewMode: "segments", skill });
  }

  const baseItems = Object.values(sys.itemPool).filter((it) => it.typeId === typeId);
  let activeQueue = [...baseItems];
  let retryRound = 0;
  const pickedMap = {};
  const writingDrafts = {};

  preloadAudioUrls(activeQueue.slice(0, 12).map((q) => q.audioSrc).filter(Boolean));

  function draw() {
    const answeredCount = activeQueue.filter((q) => pickedMap[q.id] !== undefined).length;
    const wrongItems = activeQueue.filter((q) => !q.subType && pickedMap[q.id] !== undefined && pickedMap[q.id] !== q.answer);
    const correctCount = activeQueue.filter((q) => !q.subType && pickedMap[q.id] === q.answer).length;

    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <button type="button" id="bc-seg-hub">← Danh sách các dạng ${skill === "listening" ? "Nghe" : (skill === "writing" ? "Viết" : "Đọc")}</button>
          <span>▶</span>
          <span>${tpMeta.title}</span>
        </div>

        <div class="prediction-banner" style="padding:16px 22px;margin-bottom:18px;">
          <div>
            <span class="badge-orange" style="margin-bottom:6px;">${tpMeta.code} · ${tpMeta.range} (${tpMeta.ptsDesc}) ${retryRound > 0 ? `· Vòng ôn câu sai #${retryRound}` : ""}</span>
            <h2 style="margin:0 0 4px;font-size:19px;color:var(--primary-1);">${tpMeta.title}</h2>
            <div style="font-size:14px;color:var(--text-muted);">💡 <strong>Chiến thuật làm nhanh:</strong> ${tpMeta.tip}</div>
          </div>
          <div style="text-align:right;">
            ${!tpMeta.id.includes("_w_") ? `
              <div style="font-weight:800;font-size:16px;color:var(--primary-1);margin-bottom:6px;">
                Đúng ${correctCount} / ${activeQueue.length} câu
              </div>
              ${wrongItems.length > 0 ? `
                <button type="button" class="btn-orange" id="btn-retry-wrong">
                  🔁 Luyện lại ${wrongItems.length} câu sai đến khi thuộc 100%
                </button>
              ` : (answeredCount === activeQueue.length && activeQueue.length > 0 ? `
                <span style="background:rgba(58,202,116,0.18);color:#15803D;padding:6px 14px;border-radius:99px;font-weight:800;display:inline-block;">
                  🎉 Đã nhuần nhuyễn 100% dạng này!
                </span>
              ` : "")}
            ` : ""}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px;">
          ${activeQueue.map((q, qi) => {
            if (q.subType) {
              const dr = writingDrafts[q.id] || { a: "", b: "", essay: "", checked: false };
              const earned = dr.checked ? scoreWritingResponse(q, dr) : 0;
              return `
                <div class="box-kind" style="padding:22px;">
                  <strong class="ko" style="font-size:16.5px;color:var(--primary-1);display:block;margin-bottom:10px;">${q.question}</strong>
                  <pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:14px;border-radius:10px;font-size:15.5px;line-height:1.75;border:1px solid #E2E8F0;margin:0 0 12px;">${q.passage}</pre>
                  ${q.subType === "q51" || q.subType === "q52" ? `
                    <div class="grid-2" style="margin-bottom:12px;">
                      <div>
                        <label style="font-size:13px;font-weight:700;display:block;margin-bottom:4px;">Điền vào ( ㉠ ):</label>
                        <input class="ko" data-wa="${q.id}" value="${dr.a}" placeholder="Nhập câu tiếng Hàn cho ( ㉠ )..." style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid #CBD5E1;" />
                      </div>
                      <div>
                        <label style="font-size:13px;font-weight:700;display:block;margin-bottom:4px;">Điền vào ( ㉡ ):</label>
                        <input class="ko" data-wb="${q.id}" value="${dr.b}" placeholder="Nhập câu tiếng Hàn cho ( ㉡ )..." style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid #CBD5E1;" />
                      </div>
                    </div>
                  ` : `
                    <textarea class="ko" data-wessay="${q.id}" rows="${q.subType === "q54" ? 8 : 5}" placeholder="Nhập bài viết tiếng Hàn (${q.subType === "q54" ? "600~700 chữ" : "200~300 chữ"})..." style="width:100%;padding:12px;border-radius:10px;border:1.5px solid #CBD5E1;font-size:15.5px;">${dr.essay}</textarea>
                    <div style="font-size:12.5px;color:var(--text-muted);margin:4px 0 10px;">Số ký tự hiện tại: <strong>${(dr.essay || "").length}자</strong></div>
                    ${renderMiniWongokjiPreview(dr.essay, q.subType === "q54" ? 640 : 280)}
                  `}
                  <div style="margin-top:12px;">
                    <button type="button" class="btn-primary" data-wcheck="${q.id}">Chấm điểm &amp; Xem đáp án mẫu NIIED</button>
                  </div>
                  ${dr.checked ? `
                    <div style="margin-top:14px;background:var(--primary-3);padding:14px;border-radius:10px;font-size:14px;color:var(--primary-4);">
                      <strong style="display:block;margin-bottom:6px;">🎯 Điểm ước tính: ${earned} / ${q.pts}점</strong>
                      ${q.modelA ? `<div class="ko">• <strong>Đáp án mẫu (㉠):</strong> ${q.modelA}</div><div class="ko">• <strong>Đáp án mẫu (㉡):</strong> ${q.modelB}</div>` : `<div class="ko" style="white-space:pre-wrap;margin-bottom:6px;"><strong>Bài viết mẫu:</strong>\n${q.modelAnswer}</div>`}
                      <div style="margin-top:6px;"><strong>Hướng dẫn:</strong> ${q.explain}</div>
                    </div>
                  ` : ""}
                </div>
              `;
            }

            const picked = pickedMap[q.id];
            return `
              <div class="box-kind" style="padding:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
                  <strong class="ko" style="font-size:16.5px;color:var(--primary-1);">Câu ${qi + 1}/${activeQueue.length}. ${q.question}</strong>
                  ${q.audioSrc ? `
                    <button type="button" class="btn-primary" data-play-mp3="${q.audioSrc}" style="padding:7px 15px;font-size:13.5px;">
                      🔊 Phát Audio giọng Hàn chuẩn
                    </button>
                  ` : ""}
                </div>
                ${q.passage ? `<pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:14px;border-radius:10px;font-size:16px;line-height:1.75;margin:0 0 12px;border-left:3px solid var(--primary);">${q.passage}</pre>` : ""}
                <div class="grid-2">
                  ${q.options.map((opt, oi) => {
                    let bg = "#FFFFFF";
                    let border = "#E5E7EB";
                    if (picked !== undefined) {
                      if (oi === q.answer) { bg = "rgba(58,202,116,0.16)"; border = "var(--success)"; }
                      else if (oi === picked) { bg = "rgba(255,90,96,0.14)"; border = "var(--danger)"; }
                    }
                    return `
                      <button type="button" class="ko" data-pick-q="${q.id}" data-oi="${oi}" style="text-align:left;padding:11px 14px;border-radius:10px;border:1.5px solid ${border};background:${bg};cursor:pointer;font-size:15.5px;font-weight:500;">
                        ${["①", "②", "③", "④"][oi]} ${opt}
                      </button>
                    `;
                  }).join("")}
                </div>
                ${picked !== undefined ? `
                  <div style="margin-top:12px;background:var(--primary-3);padding:11px 14px;border-radius:10px;font-size:14px;color:var(--primary-4);">
                    <strong>${picked === q.answer ? "✔ Chính xác!" : "✘ Chưa đúng — Hãy đọc kỹ lời thoại/giải thích để nhớ sâu:"}</strong>
                    ${q.audioText ? `<div class="ko" style="margin-top:4px;"><strong>Lời thoại (대본):</strong> ${q.audioText}</div>` : ""}
                    <div style="margin-top:4px;"><strong>Giải thích:</strong> ${q.explain}</div>
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    root.querySelector("#bc-seg-hub").addEventListener("click", () => {
      navigate("mock-test", { sub: levelKey, viewMode: "segments", skill });
    });

    const retryBtn = root.querySelector("#btn-retry-wrong");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        activeQueue = [...wrongItems];
        activeQueue.forEach((w) => { delete pickedMap[w.id]; });
        retryRound += 1;
        window.scrollTo({ top: 0, behavior: "smooth" });
        draw();
      });
    }

    root.querySelectorAll("[data-play-mp3]").forEach((b) => {
      b.addEventListener("pointerdown", () => playAudio(b.dataset.playMp3));
    });

    root.querySelectorAll("[data-pick-q]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qObj = activeQueue.find((x) => x.id === btn.dataset.pickQ);
        const oi = Number(btn.dataset.oi);
        pickedMap[qObj.id] = oi;
        store.recordQuestionResult(typeId, tpMeta.title, qObj, oi);
        draw();
      });
    });

    root.querySelectorAll("[data-wa]").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        writingDrafts[inp.dataset.wa] = { ...(writingDrafts[inp.dataset.wa] || {}), a: e.target.value };
      });
    });
    root.querySelectorAll("[data-wb]").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        writingDrafts[inp.dataset.wb] = { ...(writingDrafts[inp.dataset.wb] || {}), b: e.target.value };
      });
    });
    root.querySelectorAll("[data-wessay]").forEach((ta) => {
      ta.addEventListener("input", (e) => {
        writingDrafts[ta.dataset.wessay] = { ...(writingDrafts[ta.dataset.wessay] || {}), essay: e.target.value };
      });
    });
    root.querySelectorAll("[data-wcheck]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.wcheck;
        writingDrafts[qid] = { ...(writingDrafts[qid] || {}), checked: true };
        const qObj = activeQueue.find((x) => x.id === qid);
        const pts = scoreWritingResponse(qObj, writingDrafts[qid]);
        store.recordQuestionResult(typeId, tpMeta.title, { id: qid, question: qObj.question, options: ["Đạt yêu cầu"], answer: 0 }, pts >= qObj.pts * 0.6 ? 0 : -1);
        draw();
      });
    });
  }

  draw();
}

// ============================================================================
// FULL 70-QUESTION / 104-QUESTION (OR SECTION-SCOPED) EXAM ROOM
// ============================================================================
function renderExamRoom(root, sys, exam, scope, navigate, registerCleanup) {
  const questions = hydrateExamQuestions(exam, sys.itemPool, scope);
  if (!questions.length) {
    return navigate("mock-test", { sub: exam.level, examId: exam.id, action: "overview" });
  }

  const isFullExam = scope === "full";
  const isSegmentPractice = !isFullExam;
  const totalMaxPts = questions.reduce((acc, q) => acc + (q.pts || 2), 0);
  const durationMinutes = isFullExam
    ? exam.minutes
    : (exam.sectionMinutes?.[scope] || Math.max(10, Math.ceil(questions.length * 1.4)));

  let qIdx = 0;
  let secRemaining = durationMinutes * 60;
  let submitted = false;
  let showWongokjiGrid = false;
  const answers = {};
  const writingAnswers = {};
  const instantChecked = {};
  const flagged = new Set();

  preloadAudioUrls(questions.slice(0, 12).map((q) => q.audioSrc).filter(Boolean));

  const timer = setInterval(() => {
    if (submitted) return clearInterval(timer);
    secRemaining -= 1;
    if (secRemaining <= 0) {
      clearInterval(timer);
      submitExam();
    } else {
      const el = root.querySelector("#exam-clock");
      if (el) {
        const m = String(Math.floor(secRemaining / 60)).padStart(2, "0");
        const s = String(secRemaining % 60).padStart(2, "0");
        el.textContent = `⏱️ ${m}:${s}`;
      }
    }
  }, 1000);

  const keyListener = (ev) => {
    const tag = (ev.target?.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (ev.key === "ArrowRight" && qIdx < questions.length - 1) {
      qIdx += 1;
      drawRoom(lastSummary);
    } else if (ev.key === "ArrowLeft" && qIdx > 0) {
      qIdx -= 1;
      drawRoom(lastSummary);
    }
  };
  window.addEventListener("keydown", keyListener);

  registerCleanup(() => {
    clearInterval(timer);
    window.removeEventListener("keydown", keyListener);
  });

  function computeGrade(score, maxScore) {
    if (!isFullExam) {
      const pct = Math.round((score / Math.max(1, maxScore)) * 100);
      return `Hoàn thành phân khúc (${pct}% điểm tối đa)`;
    }
    if (maxScore === 200) {
      if (score >= 140) return "Đạt TOPIK I · Cấp 2 (2급)";
      if (score >= 80) return "Đạt TOPIK I · Cấp 1 (1급)";
      return "Chưa đạt Cấp 1 (< 80/200đ)";
    }
    if (score >= 230) return "Đạt TOPIK II · Cấp 6 (6급)";
    if (score >= 190) return "Đạt TOPIK II · Cấp 5 (5급)";
    if (score >= 150) return "Đạt TOPIK II · Cấp 4 (4급)";
    if (score >= 120) return "Đạt TOPIK II · Cấp 3 (3급)";
    return "Chưa đạt Cấp 3 (< 120/300đ)";
  }

  let lastSummary = null;

  function submitExam() {
    submitted = true;
    clearInterval(timer);
    let earnedScore = 0;
    let listenScore = 0;
    let writeScore = 0;
    let readScore = 0;
    let correctCount = 0;

    questions.forEach((q) => {
      if (q.isWriting) {
        const wPts = scoreWritingResponse(q, writingAnswers[q.id] || {});
        earnedScore += wPts;
        writeScore += wPts;
        if (wPts >= q.pts * 0.6) correctCount += 1;
      } else {
        const u = answers[q.id];
        if (u === q.answer) {
          earnedScore += q.pts;
          correctCount += 1;
          if (q.section === "listening") listenScore += q.pts;
          if (q.section === "reading") readScore += q.pts;
        }
        store.recordQuestionResult(q.typeId || exam.id, exam.title, q, u !== undefined ? u : -1);
      }
    });

    const grade = computeGrade(earnedScore, totalMaxPts);
    if (isFullExam) {
      store.state.examHistory.unshift({
        examId: exam.id,
        examTitle: exam.title,
        score: earnedScore,
        maxScore: totalMaxPts,
        grade,
        correctCount,
        totalCount: questions.length,
        date: new Date().toLocaleDateString("vi-VN")
      });
      store.save();
    }

    lastSummary = { score: earnedScore, listenScore, writeScore, readScore, grade, correctCount };
    window.scrollTo({ top: 0, behavior: "smooth" });
    drawRoom(lastSummary);
  }

  function drawRoom(resultSummary = null) {
    const q = questions[qIdx];
    preloadAudioUrls(questions.slice(qIdx, qIdx + 5).map((x) => x.audioSrc).filter(Boolean));

    const m = String(Math.floor(secRemaining / 60)).padStart(2, "0");
    const s = String(secRemaining % 60).padStart(2, "0");

    const listenList = questions.map((item, i) => ({ item, i })).filter((x) => x.item.section === "listening");
    const writeList = questions.map((item, i) => ({ item, i })).filter((x) => x.item.section === "writing");
    const readList = questions.map((item, i) => ({ item, i })).filter((x) => x.item.section === "reading");

    const showAnswerFeedback = submitted || Boolean(instantChecked[q.id]);

    root.innerHTML = `
      <div class="container-web">
        <!-- Top Exam Action Bar -->
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <button type="button" class="btn-outline-teal" id="btn-back-overview">
            ← Quay lại đề / Chọn phần khác
          </button>
          <div style="text-align:center;">
            <strong style="font-size:16.5px;display:block;">${exam.title}</strong>
            <span style="font-size:12px;color:var(--text-muted);">📌 Nguồn: ${exam.sourceOrg}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span id="exam-clock" style="background:#FFF;border:2px solid var(--primary);padding:6px 15px;border-radius:99px;font-weight:800;color:var(--primary-1);">
              ⏱️ ${m}:${s}
            </span>
            ${!submitted ? `<button type="button" class="btn-orange" id="btn-submit-exam">Nộp bài &amp; Chấm điểm</button>` : ""}
          </div>
        </div>

        <!-- Section Jump Bar (1교시 듣기 / 쓰기 / 2교시 읽기) -->
        <div class="skill-pills-row" style="margin-bottom:14px;">
          ${listenList.length ? `
            <button type="button" class="btn-skill ${q.section === "listening" ? "active" : ""}" id="jump-sec-listen">
              🎧 1교시 · 듣기 (${listenList.length} câu)
            </button>
          ` : ""}
          ${writeList.length ? `
            <button type="button" class="btn-skill ${q.section === "writing" ? "active" : ""}" id="jump-sec-write">
              ✍️ 1교시 · 쓰기 (${writeList.length} câu · 51~54)
            </button>
          ` : ""}
          ${readList.length ? `
            <button type="button" class="btn-skill ${q.section === "reading" ? "active" : ""}" id="jump-sec-read">
              📖 ${exam.level === "topik2" ? "2교시" : "1교시"} · 읽기 (${readList.length} câu)
            </button>
          ` : ""}
        </div>

        ${resultSummary ? `
          <div class="prediction-banner" style="margin-bottom:18px;">
            <div>
              <h2 style="margin:0 0 6px;color:var(--primary-1);">
                🎉 Tổng điểm: ${resultSummary.score} / ${totalMaxPts} điểm — ${resultSummary.grade}
              </h2>
              <div style="font-size:14px;">
                Đúng <strong>${resultSummary.correctCount}/${questions.length}</strong> câu
                ${isFullExam ? ` · Chi tiết: 🎧 Nghe <strong>${resultSummary.listenScore}/100đ</strong> ${exam.level === "topik2" ? `· ✍️ Viết <strong>${resultSummary.writeScore}/100đ</strong>` : ""} · 📖 Đọc <strong>${resultSummary.readScore}/100đ</strong>` : ""}
              </div>
            </div>
            <button type="button" class="btn-primary" id="btn-go-mistakes">Mở Sổ tay câu sai →</button>
          </div>
        ` : ""}

        <div class="exam-room-grid">
          <!-- LEFT: QUESTION SHEET -->
          <div class="box-kind" style="padding:22px;">
            <div style="background:#F1F5F9;padding:8px 14px;border-radius:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <strong class="ko" style="font-size:14px;color:#334155;">※ ${q.sec}</strong>
              <span style="font-size:13px;font-weight:800;color:var(--primary-1);">
                Câu ${q.num}${exam.level === "topik2" && q.section === "reading" ? ` (읽기 ${q.paperNum}번)` : ""} · [${q.pts}점]
              </span>
            </div>

            ${q.isWriting ? (() => {
              const dr = writingAnswers[q.id] || { a: "", b: "", essay: "" };
              return `
                <strong class="ko" style="font-size:17px;display:block;margin-bottom:12px;">${q.question}</strong>
                <pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:16px;border-radius:10px;font-size:16px;line-height:1.75;margin:0 0 14px;border:1px solid #E2E8F0;">${q.passage}</pre>
                ${q.subType === "q51" || q.subType === "q52" ? `
                  <div class="grid-2">
                    <div>
                      <label style="font-weight:700;font-size:13.5px;display:block;margin-bottom:5px;">Đáp án ô ( ㉠ ):</label>
                      <input id="room-wa" class="ko" value="${dr.a || ""}" placeholder="Nhập biểu hiện tiếng Hàn..." style="width:100%;padding:10px 14px;border-radius:8px;border:1.5px solid var(--primary);" />
                    </div>
                    <div>
                      <label style="font-weight:700;font-size:13.5px;display:block;margin-bottom:5px;">Đáp án ô ( ㉡ ):</label>
                      <input id="room-wb" class="ko" value="${dr.b || ""}" placeholder="Nhập biểu hiện tiếng Hàn..." style="width:100%;padding:10px 14px;border-radius:8px;border:1.5px solid var(--primary);" />
                    </div>
                  </div>
                ` : `
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
                    <span style="font-size:13px;color:var(--text-muted);">Độ dài hiện tại: <strong id="w-char-cnt">${(dr.essay || "").length}</strong> chữ (Yêu cầu: ${q.subType === "q54" ? "600~700" : "200~300"} chữ)</span>
                    <button type="button" class="btn-outline-teal" id="toggle-wongokji" style="padding:4px 12px;font-size:12.5px;">
                      ${showWongokjiGrid ? "Ẩn giấy kẻ ô 원고지" : "👁️ Xem trên giấy kẻ ô 원고지"}
                    </button>
                  </div>
                  <textarea id="room-wessay" class="ko" rows="${q.subType === "q54" ? 9 : 6}" placeholder="Nhập bài làm tiếng Hàn (văn phong -다/는다)..." style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--primary);font-size:15.5px;line-height:1.7;">${dr.essay || ""}</textarea>
                  ${showWongokjiGrid ? renderMiniWongokjiPreview(dr.essay || "", q.subType === "q54" ? 660 : 280) : ""}
                `}
                ${showAnswerFeedback ? `
                  <div style="margin-top:16px;background:var(--primary-3);padding:14px;border-radius:10px;font-size:14px;color:var(--primary-4);">
                    <strong>🎯 Điểm câu này: ${scoreWritingResponse(q, dr)} / ${q.pts}점</strong>
                    ${q.modelA ? `<div class="ko" style="margin-top:4px;">• (㉠): <strong>${q.modelA}</strong></div><div class="ko">• (㉡): <strong>${q.modelB}</strong></div>` : `<div class="ko" style="white-space:pre-wrap;margin-top:6px;"><strong>Bài viết mẫu chuẩn NIIED:</strong>\n${q.modelAnswer}</div>`}
                    <div style="margin-top:6px;"><strong>Giải thích:</strong> ${q.explain}</div>
                  </div>
                ` : ""}
              `;
            })() : `
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
                <strong class="ko" style="font-size:17px;">${q.paperNum}. ${q.question}</strong>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  ${q.audioSrc ? `
                    <button type="button" class="btn-primary" id="btn-q-play" style="padding:7px 16px;font-size:13.5px;">
                      🔊 Phát Audio giọng Hàn chuẩn
                    </button>
                  ` : ""}
                  <button type="button" class="btn-outline-teal" id="btn-q-flag" style="padding:6px 12px;font-size:13px;${flagged.has(q.id) ? "background:rgba(254,154,5,0.16);border-color:var(--yellow-2);color:#B45309;" : ""}">
                    🚩 ${flagged.has(q.id) ? "Đã gắn cờ" : "Gắn cờ"}
                  </button>
                </div>
              </div>

              ${q.passage ? `<pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:16px;border-radius:10px;font-size:16.5px;line-height:1.78;margin:0 0 16px;border:1px solid #E2E8F0;">${q.passage}</pre>` : ""}

              <div style="display:flex;flex-direction:column;gap:10px;">
                ${q.options.map((opt, oi) => {
                  const chosen = answers[q.id] === oi;
                  let border = chosen ? "var(--primary)" : "#E5E7EB";
                  let bg = chosen ? "var(--primary-3)" : "#FFFFFF";
                  if (showAnswerFeedback) {
                    if (oi === q.answer) { border = "var(--success)"; bg = "rgba(58,202,116,0.16)"; }
                    else if (chosen) { border = "var(--danger)"; bg = "rgba(255,90,96,0.14)"; }
                  }
                  return `
                    <button type="button" class="ko" data-pick="${oi}" style="text-align:left;padding:12px 16px;border-radius:10px;border:2px solid ${border};background:${bg};cursor:pointer;font-size:16px;font-weight:500;">
                      ${["①", "②", "③", "④"][oi]} ${opt}
                    </button>
                  `;
                }).join("")}
              </div>

              ${isSegmentPractice && !submitted && answers[q.id] !== undefined && !instantChecked[q.id] ? `
                <div style="margin-top:12px;">
                  <button type="button" class="btn-outline-teal" id="btn-instant-check" style="padding:6px 14px;font-size:13px;">
                    ✔ Kiểm tra đáp án &amp; giải thích câu này ngay
                  </button>
                </div>
              ` : ""}

              ${showAnswerFeedback ? `
                <div style="margin-top:16px;background:var(--primary-3);padding:12px 16px;border-radius:10px;font-size:14px;color:var(--primary-4);">
                  ${q.audioText ? `<div class="ko" style="margin-bottom:4px;"><strong>Lời thoại Audio (대본):</strong> ${q.audioText}</div>` : ""}
                  <div><strong>Giải thích đáp án:</strong> ${q.explain}</div>
                </div>
              ` : ""}
            `}

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;gap:10px;">
              <button type="button" class="btn-outline-teal" id="btn-prev-q" ${qIdx === 0 ? "disabled" : ""}>← Câu trước</button>
              <span style="font-size:13px;color:var(--text-muted);">Đã làm: <strong>${Object.keys(answers).length + Object.keys(writingAnswers).length}/${questions.length}</strong> câu</span>
              <button type="button" class="btn-primary" id="btn-next-q" ${qIdx === questions.length - 1 ? "disabled" : ""}>Câu tiếp theo →</button>
            </div>
          </div>

          <!-- RIGHT: COMPACT SCROLLABLE OMR ANSWER SHEET PALETTE (70 / 104 QUESTIONS) -->
          <div class="box-kind" style="max-height:76vh;overflow-y:auto;padding:16px;">
            ${listenList.length ? `
              <strong style="display:block;margin-bottom:6px;font-size:13.5px;color:var(--primary-1);">🎧 Phiếu OMR · 듣기 (${listenList.length} câu)</strong>
              <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-bottom:14px;">
                ${listenList.map(({ item, i }) => renderOmrCell(item, i)).join("")}
              </div>
            ` : ""}

            ${writeList.length ? `
              <strong style="display:block;margin-bottom:6px;font-size:13.5px;color:#B45309;">✍️ Tự luận · 쓰기 (51~54)</strong>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:14px;">
                ${writeList.map(({ item, i }) => renderOmrCell(item, i)).join("")}
              </div>
            ` : ""}

            ${readList.length ? `
              <strong style="display:block;margin-bottom:6px;font-size:13.5px;color:var(--primary-1);">📖 Phiếu OMR · 읽기 (${readList.length} câu)</strong>
              <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:5px;">
                ${readList.map(({ item, i }) => renderOmrCell(item, i)).join("")}
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    `;

    function renderOmrCell(item, i) {
      const wDraft = writingAnswers[item.id];
      const hasAns = item.isWriting
        ? Boolean(wDraft?.a || wDraft?.b || wDraft?.essay)
        : answers[item.id] !== undefined;
      const isFl = flagged.has(item.id);
      let bg = hasAns ? "var(--primary)" : "#F2F4F7";
      let col = hasAns ? "#FFFFFF" : "var(--text-main)";
      if (submitted) {
        const ok = item.isWriting
          ? scoreWritingResponse(item, wDraft || {}) >= item.pts * 0.6
          : answers[item.id] === item.answer;
        bg = ok ? "var(--success)" : "var(--danger)";
        col = "#FFFFFF";
      } else if (isFl) {
        bg = "var(--yellow-2)";
        col = "#FFFFFF";
      }
      return `
        <button type="button" data-jump="${i}" title="Câu ${item.num}" style="height:31px;border-radius:6px;border:${i === qIdx ? "2px solid #0F172A" : "none"};background:${bg};color:${col};font-weight:700;font-size:12px;cursor:pointer;padding:0;">
          ${item.num}
        </button>
      `;
    }

    root.querySelector("#btn-back-overview").addEventListener("click", () => {
      navigate("mock-test", { sub: exam.level, examId: exam.id, action: "overview" });
    });

    const subBtn = root.querySelector("#btn-submit-exam");
    if (subBtn) subBtn.addEventListener("click", submitExam);

    const misBtn = root.querySelector("#btn-go-mistakes");
    if (misBtn) misBtn.addEventListener("click", () => navigate("check-tools", { tab: "mistakes" }));

    const jListen = root.querySelector("#jump-sec-listen");
    if (jListen) jListen.addEventListener("click", () => { qIdx = listenList[0].i; drawRoom(resultSummary); });
    const jWrite = root.querySelector("#jump-sec-write");
    if (jWrite) jWrite.addEventListener("click", () => { qIdx = writeList[0].i; drawRoom(resultSummary); });
    const jRead = root.querySelector("#jump-sec-read");
    if (jRead) jRead.addEventListener("click", () => { qIdx = readList[0].i; drawRoom(resultSummary); });

    const playBtn = root.querySelector("#btn-q-play");
    if (playBtn) {
      playBtn.addEventListener("pointerdown", () => {
        if (q.audioSrc) playAudio(q.audioSrc);
        else if (q.audioText) speakKoreanTTS(q.audioText, 0.96);
      });
    }

    const flagBtn = root.querySelector("#btn-q-flag");
    if (flagBtn) {
      flagBtn.addEventListener("click", () => {
        if (flagged.has(q.id)) flagged.delete(q.id);
        else flagged.add(q.id);
        drawRoom(resultSummary);
      });
    }

    const instBtn = root.querySelector("#btn-instant-check");
    if (instBtn) {
      instBtn.addEventListener("click", () => {
        instantChecked[q.id] = true;
        drawRoom(resultSummary);
      });
    }

    root.querySelectorAll("[data-pick]").forEach((b) => {
      b.addEventListener("click", () => {
        if (submitted) return;
        answers[q.id] = Number(b.dataset.pick);
        if (isSegmentPractice) instantChecked[q.id] = true;
        drawRoom(resultSummary);
      });
    });

    const wa = root.querySelector("#room-wa");
    if (wa) wa.addEventListener("input", (e) => { writingAnswers[q.id] = { ...(writingAnswers[q.id] || {}), a: e.target.value }; });
    const wb = root.querySelector("#room-wb");
    if (wb) wb.addEventListener("input", (e) => { writingAnswers[q.id] = { ...(writingAnswers[q.id] || {}), b: e.target.value }; });
    const wessay = root.querySelector("#room-wessay");
    if (wessay) {
      wessay.addEventListener("input", (e) => {
        writingAnswers[q.id] = { ...(writingAnswers[q.id] || {}), essay: e.target.value };
        const cntEl = root.querySelector("#w-char-cnt");
        if (cntEl) cntEl.textContent = String(e.target.value.length);
      });
    }
    const togWg = root.querySelector("#toggle-wongokji");
    if (togWg) togWg.addEventListener("click", () => { showWongokjiGrid = !showWongokjiGrid; drawRoom(resultSummary); });

    root.querySelectorAll("[data-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        qIdx = Number(b.dataset.jump);
        drawRoom(resultSummary);
      });
    });

    root.querySelector("#btn-prev-q").addEventListener("click", () => {
      if (qIdx > 0) { qIdx -= 1; drawRoom(resultSummary); }
    });
    root.querySelector("#btn-next-q").addEventListener("click", () => {
      if (qIdx < questions.length - 1) { qIdx += 1; drawRoom(resultSummary); }
    });
  }

  drawRoom();
}
