import { store, playAudio, preloadAudioUrls, speakKoreanTTS } from "../store.js";
import { analyzePronunciationRules, appendJamoToText } from "../korean-engine.js";
import { HANGEUL_DATA, GRAMMAR_COMPARISONS, HANJA_ROOTS, FREQUENT_TOPIK_EXPRESSIONS, TEXTBOOK_SERIES } from "../curated-content.js";
import { renderChapterExercises } from "../chapter-exercises.js";

export function renderTheoryView(root, db, navigate, params = {}) {
  const sub = params.sub || "index";
  if (sub === "vocab-book") return renderVocabBookIndex(root, db, navigate, params.book || "sc1");
  if (sub === "lesson-detail") return renderLessonDetail(root, db, navigate, params.book || "sc1", Number(params.lesson || 1), params.tab || "vocab");
  if (sub === "vocab-review") return renderVocabReviewArena(root, db, navigate, params);
  if (sub === "hangeul") return renderHangeulLab(root, navigate);
  if (sub === "grammar-list") return renderGrammarList(root, db, navigate, params.mode || "sc1");
  if (sub === "frequent") return renderFrequentTopikView(root, navigate);
  if (sub === "hanja") return renderHanjaView(root, navigate);
  if (sub === "textbook-detail") return renderTextbookOverview(root, db, navigate, params.bookId || "sc1");

  // Default: Migii 3-Tier Theory Screen (/theory)
  const allVocab = [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank, ...db.customVocab];
  const sc1Mastered = db.sc1Vocab.filter((c) => store.isMastered(c.id)).length;
  const tp1Mastered = db.topik1Bank.filter((c) => store.isMastered(c.id)).length;
  const sjMastered = db.sejongVocab.filter((c) => store.isMastered(c.id)).length;
  const unlearnedList = allVocab.filter((c) => !store.isMastered(c.id));
  const starredList = allVocab.filter((c) => store.state.srs[c.id]?.starred);
  const dueIds = store.getDueCardIds(allVocab);

  root.innerHTML = `
    <div class="container-web">
      <!-- TIER 1: TỪ VỰNG (Học từ vựng & Ôn từ vựng tách rõ như yêu cầu) -->
      <div class="section-head" style="margin-top:4px;">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          <h2>Từ vựng (Học từ &amp; Ôn tập SRS)</h2>
          <select id="theory-vocab-select" class="box-select">
            <option value="sc1">Sơ cấp 1 · Giáo trình Tổng Hợp (537 từ)</option>
            <option value="topik1">Từ vựng &amp; Câu điền khuyết TOPIK I (440 mục)</option>
            <option value="sejong1">Giáo trình Sejong (129 từ)</option>
            ${db.customDecks.map((d) => `<option value="${d.deckId}">${d.title} (${d.count} từ)</option>`).join("")}
          </select>
        </div>
        <button class="btn-orange" id="btn-start-srs-top">
          🔁 Vào Phòng Ôn Từ Vựng (${dueIds.length} thẻ đến hạn)
        </button>
      </div>

      <div class="grid-2">
        <div class="theory-card" data-go-book="sc1">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-vocab-badge">Aa</div>
            <div>
              <strong style="font-size:17px;display:block;">Từ vựng Tiếng Hàn Tổng Hợp · Sơ cấp 1</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">Trọn bộ 15 Bài · Đầy đủ giọng nữ Kyuri &amp; ghi chú biến âm</span>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <span style="color:var(--success);font-weight:700;">✔ ${sc1Mastered}/${db.sc1Vocab.length}</span>
          </div>
        </div>

        <div class="theory-card" data-go-review="all">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-vocab-badge" style="background:rgba(254,154,5,0.14);color:var(--yellow-2);border-color:rgba(254,154,5,0.3);">Ôn</div>
            <div>
              <strong style="font-size:17px;display:block;">Từ vựng chưa thuộc &amp; Đánh dấu sao</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">4 chế độ: Flashcard · Trắc nghiệm · Nghe gõ Hangeul · Ghép cặp</span>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <span style="color:var(--yellow-2);font-weight:700;">★ ${starredList.length} · Chưa thuộc ${unlearnedList.length}</span>
          </div>
        </div>

        <div class="theory-card" data-go-book="topik1">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-vocab-badge">T1</div>
            <div>
              <strong style="font-size:17px;display:block;">Từ vựng &amp; Ngữ cảnh TOPIK I (Cấp 1–2)</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">440 mục kèm câu điền khuyết Cloze &amp; giải thích ngữ pháp</span>
            </div>
          </div>
          <span style="color:var(--success);font-weight:700;flex-shrink:0;">✔ ${tp1Mastered}/${db.topik1Bank.length}</span>
        </div>

        <div class="theory-card" data-go-book="sejong1">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-vocab-badge">SJ</div>
            <div>
              <strong style="font-size:17px;display:block;">Từ vựng Giao tiếp Sejong (Bài 3, 4, 6, 7)</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">Vị trí, Sinh hoạt, Giao thông chỉ đường &amp; Lời mời</span>
            </div>
          </div>
          <span style="color:var(--success);font-weight:700;flex-shrink:0;">✔ ${sjMastered}/${db.sejongVocab.length}</span>
        </div>
      </div>

      <!-- TIER 2: NGỮ PHÁP, PHÁT ÂM & CÂU THƯỜNG GẶP TOPIK 1-2 -->
      <div class="section-head">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          <h2>Ngữ pháp, Biến âm &amp; Câu thường gặp TOPIK 1, 2</h2>
        </div>
      </div>

      <div class="grid-2">
        <div class="theory-card" id="card-hangeul-lab">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-grammar-badge" style="font-family:var(--font-ko);font-size:18px;">한글</div>
            <div>
              <strong style="font-size:17px;display:block;">Bảng chữ cái Hangeul, Bàn phím Hàn &amp; 7 Quy tắc Biến âm</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">Soi tự động nối âm [도길], căng âm [학꾜], biến âm mũi [안녕하심니까]</span>
            </div>
          </div>
          <span style="color:var(--primary-1);font-weight:700;">Mở Lab →</span>
        </div>

        <div class="theory-card" id="card-frequent-topik">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-grammar-badge">HOT</div>
            <div>
              <strong style="font-size:17px;display:block;">Kho Câu &amp; Biểu hiện thường gặp TOPIK 1, 2</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">Mẫu câu phản xạ tủ, Phó từ nối câu, Từ đồng nghĩa &amp; Quán dụng ngữ</span>
            </div>
          </div>
          <span style="color:var(--yellow-2);font-weight:700;">${FREQUENT_TOPIK_EXPRESSIONS.length} chủ điểm</span>
        </div>

        <div class="theory-card" id="card-sc1-grammar">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-grammar-badge">ABC</div>
            <div>
              <strong style="font-size:17px;display:block;">Ngữ pháp Tiếng Hàn Tổng Hợp · Sơ cấp 1 (Bài 1–15)</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">51 cấu trúc kèm 102 câu ví dụ phát âm giọng nữ Kyuri</span>
            </div>
          </div>
          <span style="color:var(--success);font-weight:700;">${db.sc1Grammar.length} cấu trúc</span>
        </div>

        <div class="theory-card" id="card-grammar-compare">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="icon-grammar-badge">VS</div>
            <div>
              <strong style="font-size:17px;display:block;">Phân biệt các cặp Ngữ pháp dễ nhầm lẫn</strong>
              <span style="font-size:13.5px;color:var(--text-muted);">은/는 vs 이/가 · -아서 vs -(으)니까 · 안 vs 못 · 에 vs 에서</span>
            </div>
          </div>
          <span style="color:var(--primary-1);font-weight:700;">${GRAMMAR_COMPARISONS.length} bảng so sánh</span>
        </div>
      </div>

      <!-- TIER 3: KỆ SÁCH 6 CỘT GIÁO TRÌNH TIẾNG HÀN TỔNG HỢP & HÁN HÀN -->
      <div class="section-head">
        <h2>Kệ sách Giáo trình Tiếng Hàn Tổng Hợp (Quyển 1 → 6) &amp; Âm Hán – Hàn</h2>
        <button class="btn-outline-teal" id="btn-open-hanja">🌳 Mở Sơ đồ Gốc từ Âm Hán – Hàn</button>
      </div>

      <div class="grid-books-6">
        ${TEXTBOOK_SERIES.map((bk) => `
          <div class="book-cover" data-book-id="${bk.id}" style="background:${bk.color};">
            <div>
              <span style="display:inline-block;background:rgba(255,255,255,0.22);padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;margin-bottom:10px;">
                ${bk.badge}
              </span>
              <h4>${bk.title}</h4>
            </div>
            <div>
              <div style="font-size:12px;opacity:0.92;margin-bottom:6px;">${bk.topikTarget}</div>
              <div style="font-size:11.5px;background:rgba(0,0,0,0.2);padding:5px 8px;border-radius:6px;">
                Mở giáo trình →
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  root.querySelector("#theory-vocab-select").addEventListener("change", (e) => {
    navigate("theory", { sub: "vocab-book", book: e.target.value });
  });
  root.querySelector("#btn-start-srs-top").addEventListener("click", () => navigate("theory", { sub: "vocab-review" }));
  root.querySelectorAll("[data-go-book]").forEach((el) => {
    el.addEventListener("click", () => navigate("theory", { sub: "vocab-book", book: el.dataset.goBook }));
  });
  root.querySelectorAll("[data-go-review]").forEach((el) => {
    el.addEventListener("click", () => navigate("theory", { sub: "vocab-review" }));
  });
  root.querySelector("#card-hangeul-lab").addEventListener("click", () => navigate("theory", { sub: "hangeul" }));
  root.querySelector("#card-frequent-topik").addEventListener("click", () => navigate("theory", { sub: "frequent" }));
  root.querySelector("#card-sc1-grammar").addEventListener("click", () => navigate("theory", { sub: "grammar-list", mode: "sc1" }));
  root.querySelector("#card-grammar-compare").addEventListener("click", () => navigate("theory", { sub: "grammar-list", mode: "compare" }));
  root.querySelector("#btn-open-hanja").addEventListener("click", () => navigate("theory", { sub: "hanja" }));
  root.querySelectorAll("[data-book-id]").forEach((el) => {
    el.addEventListener("click", () => {
      const bid = el.dataset.bookId;
      if (bid === "sc1") navigate("theory", { sub: "vocab-book", book: "sc1" });
      else navigate("theory", { sub: "textbook-detail", bookId: bid });
    });
  });
}

// Drill-down 3-Column Lesson Grid (Exact Migii /vi/theory/vocabulary/1/1 layout, 0 locks!)
function renderVocabBookIndex(root, db, navigate, bookKey) {
  let items = db.sc1Vocab;
  let bookTitle = "Giáo trình Tiếng Hàn Tổng Hợp · Sơ cấp 1";
  if (bookKey === "topik1") {
    items = db.topik1Bank;
    bookTitle = "Từ vựng & Câu điền khuyết TOPIK I (Cấp 1–2)";
  } else if (bookKey === "sejong1") {
    items = db.sejongVocab;
    bookTitle = "Từ vựng Giao tiếp Sejong";
  } else if (bookKey.startsWith("custom_")) {
    const found = db.customDecks.find((d) => d.deckId === bookKey);
    if (found) {
      items = found.items;
      bookTitle = found.title;
    }
  }

  const groups = new Map();
  items.forEach((it) => {
    if (!groups.has(it.lesson)) {
      groups.set(it.lesson, { lesson: it.lesson, title: it.lessonTitle, words: [] });
    }
    groups.get(it.lesson).words.push(it);
  });

  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button id="bc-back-theory">Lý thuyết</button>
        <span>▶</span>
        <span>${bookTitle}</span>
      </div>

      <div class="section-head" style="margin-top:0;">
        <h2>${bookTitle}</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-orange" id="btn-review-this-book">🔁 Ôn Quiz bộ này</button>
        </div>
      </div>

      <div class="grid-3">
        ${Array.from(groups.values()).map((g) => {
          const mastered = g.words.filter((w) => store.isMastered(w.id)).length;
          const pct = Math.round((mastered / g.words.length) * 100);
          return `
            <div class="box-kind clickable" data-open-lesson="${g.lesson}">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <div class="icon-vocab-badge">B${String(g.lesson).padStart(2, "0")}</div>
                <div>
                  <strong style="font-size:16.5px;display:block;">Bài ${String(g.lesson).padStart(2, "0")}: ${g.title}</strong>
                  <span style="font-size:13.5px;color:var(--text-muted);">${g.words.length} từ · Đã thuộc ${mastered}/${g.words.length}</span>
                </div>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  root.querySelector("#bc-back-theory").addEventListener("click", () => navigate("theory"));
  root.querySelector("#btn-review-this-book").addEventListener("click", () => navigate("theory", { sub: "vocab-review", book: bookKey }));
  root.querySelectorAll("[data-open-lesson]").forEach((card) => {
    card.addEventListener("click", () => {
      navigate("theory", { sub: "lesson-detail", book: bookKey, lesson: Number(card.dataset.openLesson) });
    });
  });
}

// Complete Lesson Study View (Tabs: Từ vựng · Ngữ pháp bài học · Hội thoại & Văn hóa · Ôn nhanh bài này)
function renderLessonDetail(root, db, navigate, bookKey, lessonNum, activeTab = "vocab") {
  let pool = db.sc1Vocab;
  if (bookKey === "topik1") pool = db.topik1Bank;
  else if (bookKey === "sejong1") pool = db.sejongVocab;
  else if (bookKey.startsWith("custom_")) {
    pool = db.customDecks.find((d) => d.deckId === bookKey)?.items || [];
  }

  const words = pool.filter((w) => w.lesson === lessonNum);
  const grammars = bookKey === "sc1" ? db.sc1Grammar.filter((g) => g.lesson === lessonNum) : [];
  const lessonTitle = words[0]?.lessonTitle || `Bài ${lessonNum}`;
  const textbookMeta = TEXTBOOK_SERIES[0].lessons.find((l) => l.num === lessonNum);

  // Preload chapter audio into LRU RAM cache immediately so play button responds in 0ms
  preloadAudioUrls([
    ...words.slice(0, 36).map((w) => w.wordAudio),
    ...words.slice(0, 18).map((w) => w.exampleAudio),
    ...grammars.map((g) => g.example1Audio)
  ]);

  store.state.lastLesson = {
    book: bookKey,
    lesson: lessonNum,
    title: `Bài ${String(lessonNum).padStart(2, "0")} · ${lessonTitle}`
  };
  store.save();

  let hideMeaning = false;

  function renderContent() {
    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <button id="bc-theory">Lý thuyết</button>
          <span>▶</span>
          <button id="bc-book">Danh sách bài</button>
          <span>▶</span>
          <span>Bài ${String(lessonNum).padStart(2, "0")} · ${lessonTitle}</span>
        </div>

        <div class="section-head" style="margin-top:0;">
          <h2>Bài ${String(lessonNum).padStart(2, "0")} · ${lessonTitle}</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-orange" id="btn-quiz-lesson">🎯 Kiểm tra &amp; Ôn từ bài này (${words.length} từ)</button>
            <button class="btn-outline-teal" id="btn-shadow-lesson">🎙️ Tập nói Shadowing bài này</button>
          </div>
        </div>

        <div class="skill-pills-row">
          <button class="btn-skill ${activeTab === "vocab" ? "active" : ""}" data-tab="vocab">1. Từ vựng (${words.length})</button>
          ${grammars.length ? `<button class="btn-skill ${activeTab === "grammar" ? "active" : ""}" data-tab="grammar">2. Ngữ pháp (${grammars.length})</button>` : ""}
          <button class="btn-skill ${activeTab === "exercises" ? "active" : ""}" data-tab="exercises">
            ✍️ Bài tập chương (Dịch câu &amp; TOPIK)
            <span class="badge-mia">MỚI</span>
          </button>
          ${textbookMeta ? `<button class="btn-skill ${activeTab === "dialogue" ? "active" : ""}" data-tab="dialogue">Hội thoại &amp; Văn hóa</button>` : ""}
        </div>

        <div id="lesson-tab-body"></div>
      </div>
    `;

    root.querySelector("#bc-theory").addEventListener("click", () => navigate("theory"));
    root.querySelector("#bc-book").addEventListener("click", () => navigate("theory", { sub: "vocab-book", book: bookKey }));
    root.querySelector("#btn-quiz-lesson").addEventListener("click", () => navigate("theory", { sub: "vocab-review", book: bookKey, lesson: lessonNum }));
    root.querySelector("#btn-shadow-lesson").addEventListener("click", () => navigate("practice", { sub: "skills", skill: "shadowing", lesson: lessonNum }));
    root.querySelectorAll("[data-tab]").forEach((b) => {
      b.addEventListener("click", () => {
        navigate("theory", { sub: "lesson-detail", book: bookKey, lesson: lessonNum, tab: b.dataset.tab });
      });
    });

    const body = root.querySelector("#lesson-tab-body");

    if (activeTab === "vocab") {
      body.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
          <span style="font-size:14px;color:var(--text-muted);">Bấm loa 🔊 để nghe giọng đọc chuẩn Kyuri cho từng từ và cả câu ví dụ.</span>
          <button class="btn-outline-teal" id="btn-toggle-meaning" style="padding:6px 14px;font-size:13.5px;">
            ${hideMeaning ? "👁️ Hiện nghĩa tiếng Việt" : "🙈 Ẩn nghĩa để tự dò bài"}
          </button>
        </div>
        <div class="grid-2">
          ${words.map((w) => {
            const starred = store.state.srs[w.id]?.starred;
            const mastered = store.isMastered(w.id);
            const pronCheck = analyzePronunciationRules(w.korean);
            return `
              <div class="box-kind" style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <span class="ko" style="font-size:23px;font-weight:800;color:var(--primary-1);">${w.korean}</span>
                    ${pronCheck.hasChange ? `<span class="ko" style="font-size:13.5px;background:rgba(254,154,5,0.14);color:#C26A00;padding:2px 8px;border-radius:99px;font-weight:600;">[${pronCheck.pronounced}]</span>` : ""}
                    ${w.pronunciation ? `<span style="font-size:13px;color:var(--text-muted);">/${w.pronunciation}/</span>` : ""}
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <button class="btn-audio" data-play="${w.wordAudio}" data-tts="${w.korean}" title="Nghe từ vựng">🔊</button>
                    <button class="btn-audio" data-star="${w.id}" title="Đánh dấu từ khó" style="background:${starred ? "rgba(254,154,5,0.2)" : "#F2F4F7"};color:${starred ? "var(--yellow-2)" : "#888"};">★</button>
                    <button class="btn-audio" data-master="${w.id}" title="Đánh dấu đã thuộc" style="background:${mastered ? "rgba(58,202,116,0.2)" : "#F2F4F7"};color:${mastered ? "var(--success)" : "#888"};">✔</button>
                  </div>
                </div>

                <div style="font-size:16.5px;font-weight:600;color:var(--text-main);${hideMeaning ? "filter:blur(6px);user-select:none;" : ""}">
                  ${w.vietnamese}
                </div>

                ${w.exampleKo ? `
                  <div style="background:#F8FAFB;border-radius:10px;padding:10px 12px;margin-top:2px;border-left:3px solid var(--primary);">
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                      <span class="ko" style="font-size:15px;font-weight:600;">${w.exampleKo}</span>
                      ${w.exampleAudio ? `<button class="btn-audio" style="width:30px;height:30px;font-size:12px;" data-play="${w.exampleAudio}" data-tts="${w.exampleKo}" title="Nghe câu ví dụ">▶</button>` : ""}
                    </div>
                    <div style="font-size:13.5px;color:var(--text-muted);margin-top:3px;${hideMeaning ? "filter:blur(5px);" : ""}">${w.exampleVi}</div>
                  </div>
                ` : ""}

                ${w.note ? `<div style="font-size:12.5px;color:var(--primary-4);background:var(--primary-3);padding:5px 10px;border-radius:8px;">💡 ${w.note}</div>` : ""}
              </div>
            `;
          }).join("")}
        </div>
      `;

      body.querySelector("#btn-toggle-meaning").addEventListener("click", () => {
        hideMeaning = !hideMeaning;
        renderContent();
      });

      body.querySelectorAll("[data-play]").forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          if (btn.dataset.play) preloadAudioUrls([btn.dataset.play]);
        });
        btn.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          if (btn.dataset.play) playAudio(btn.dataset.play);
          else speakKoreanTTS(btn.dataset.tts);
        });
        btn.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (btn.dataset.play) playAudio(btn.dataset.play);
            else speakKoreanTTS(btn.dataset.tts);
          }
        });
      });

      body.querySelectorAll("[data-star]").forEach((btn) => {
        btn.addEventListener("click", () => {
          store.toggleStar(btn.dataset.star);
          renderContent();
        });
      });

      body.querySelectorAll("[data-master]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.master;
          store.rateCard(id, store.isMastered(id) ? 0 : 3);
          renderContent();
        });
      });
    } else if (activeTab === "exercises") {
      renderChapterExercises(body, db, bookKey, lessonNum);
    } else if (activeTab === "grammar") {
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${grammars.map((g) => `
            <div class="box-kind">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                <h3 class="ko" style="margin:0;font-size:21px;color:var(--primary-1);">${g.pattern}</h3>
                <span class="badge-orange" style="background:rgba(254,154,5,0.14);">${g.meaning}</span>
              </div>
              <p style="margin:0 0 6px;font-size:14.5px;"><strong>Công thức kết hợp:</strong> <span class="ko">${g.construction}</span></p>
              <p style="margin:0 0 12px;font-size:14.5px;color:var(--text-muted);">${g.usage}</p>
              <div class="grid-2">
                <div style="background:#F8FAFB;padding:12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <div>
                    <div class="ko" style="font-weight:700;">${g.example1Ko}</div>
                    <div style="font-size:13.5px;color:var(--text-muted);">${g.example1Vi}</div>
                  </div>
                  ${g.example1Audio ? `<button class="btn-audio" data-play="${g.example1Audio}">🔊</button>` : ""}
                </div>
                ${g.example2Ko ? `
                  <div style="background:#F8FAFB;padding:12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div>
                      <div class="ko" style="font-weight:700;">${g.example2Ko}</div>
                      <div style="font-size:13.5px;color:var(--text-muted);">${g.example2Vi}</div>
                    </div>
                    ${g.example2Audio ? `<button class="btn-audio" data-play="${g.example2Audio}">🔊</button>` : ""}
                  </div>
                ` : ""}
              </div>
              ${g.note ? `<div style="margin-top:10px;font-size:13px;color:var(--primary-4);background:var(--primary-3);padding:7px 12px;border-radius:8px;">📌 Lưu ý: ${g.note}</div>` : ""}
            </div>
          `).join("")}
        </div>
      `;
      body.querySelectorAll("[data-play]").forEach((btn) => {
        btn.addEventListener("click", () => playAudio(btn.dataset.play));
      });
    } else if (activeTab === "dialogue" && textbookMeta) {
      let muteRole = "none";
      const renderDlg = () => {
        const speakers = [...new Set(textbookMeta.dialogue.map((d) => d.speaker))];
        body.innerHTML = `
          <div class="box-kind" style="margin-bottom:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
              <h3 style="margin:0;font-size:18px;">Hội thoại mẫu (Đóng vai giao tiếp A – B)</h3>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn-outline-teal" data-mute="none" style="padding:5px 12px;font-size:13px;">Hiện tất cả</button>
                ${speakers.map((sp) => `<button class="btn-outline-teal" data-mute="${sp}" style="padding:5px 12px;font-size:13px;">Che lời ${sp} để tự nói</button>`).join("")}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${textbookMeta.dialogue.map((line) => `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;background:#F8FAFB;padding:12px 16px;border-radius:12px;">
                  <div>
                    <strong class="ko" style="color:var(--primary-1);margin-right:8px;">${line.speaker}:</strong>
                    <span class="ko" style="font-size:16.5px;font-weight:600;${muteRole === line.speaker ? "filter:blur(7px);" : ""}">${line.ko}</span>
                    <div style="font-size:13.5px;color:var(--text-muted);margin-top:3px;">${line.vi}</div>
                  </div>
                  <button class="btn-audio" data-speak="${line.ko}">🔊</button>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="prediction-banner">
            <div>
              <strong style="color:var(--primary-1);font-size:16px;">🏯 Góc Văn hóa Hàn Quốc (문화)</strong>
              <p style="margin:6px 0 0;font-size:14.5px;">${textbookMeta.culture}</p>
            </div>
          </div>
        `;
        body.querySelectorAll("[data-mute]").forEach((b) => {
          b.addEventListener("click", () => { muteRole = b.dataset.mute; renderDlg(); });
        });
        body.querySelectorAll("[data-speak]").forEach((b) => {
          b.addEventListener("click", () => speakKoreanTTS(b.dataset.speak));
        });
      };
      renderDlg();
    }
  }

  renderContent();
}

// Vocabulary Review Arena: 4 Active Modes (1. Flashcard SRS · 2. Trắc nghiệm · 3. Nghe gõ Hangeul · 4. Ghép cặp tốc độ)
function renderVocabReviewArena(root, db, navigate, params = {}) {
  let pool = [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank, ...db.customVocab];
  let scopeLabel = "Tất cả kho từ vựng";
  if (params.book === "sc1") { pool = db.sc1Vocab; scopeLabel = "Sơ cấp 1"; }
  else if (params.book === "topik1") { pool = db.topik1Bank; scopeLabel = "TOPIK I"; }
  else if (params.book === "sejong1") { pool = db.sejongVocab; scopeLabel = "Sejong"; }
  if (params.lesson) {
    pool = pool.filter((w) => w.lesson === Number(params.lesson));
    scopeLabel += ` · Bài ${params.lesson}`;
  }

  // Prioritize due SRS cards or starred/unmastered cards
  const sortedDeck = [...pool].sort((a, b) => {
    const sa = store.state.srs[a.id];
    const sb = store.state.srs[b.id];
    const starDiff = (sb?.starred ? 1 : 0) - (sa?.starred ? 1 : 0);
    if (starDiff !== 0) return starDiff;
    return (sa?.level || 0) - (sb?.level || 0);
  });

  let mode = params.mode || "flashcard"; // flashcard | mcq | typing | match
  let idx = 0;
  let flipped = false;
  let score = 0;

  function renderArena() {
    const card = sortedDeck[idx % sortedDeck.length];
    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <button id="bc-back">Lý thuyết &amp; Từ vựng</button>
          <span>▶</span>
          <span>Phòng Ôn Từ Vựng (${scopeLabel})</span>
        </div>

        <div class="skill-pills-row">
          <button class="btn-skill ${mode === "flashcard" ? "active" : ""}" data-mode="flashcard">1. Lật thẻ SRS</button>
          <button class="btn-skill ${mode === "mcq" ? "active" : ""}" data-mode="mcq">2. Trắc nghiệm 4 đáp án</button>
          <button class="btn-skill ${mode === "typing" ? "active" : ""}" data-mode="typing">3. Nghe &amp; Gõ Hangeul</button>
          <button class="btn-skill ${mode === "match" ? "active" : ""}" data-mode="match">4. Ghép cặp tốc độ</button>
        </div>

        <div id="arena-stage"></div>
      </div>
    `;

    root.querySelector("#bc-back").addEventListener("click", () => {
      if (params.lesson && params.book) {
        navigate("theory", { sub: "lesson-detail", book: params.book, lesson: params.lesson });
      } else if (params.book) {
        navigate("theory", { sub: "vocab-book", book: params.book });
      } else {
        navigate("theory");
      }
    });
    root.querySelectorAll("[data-mode]").forEach((b) => {
      b.addEventListener("click", () => {
        navigate("theory", { sub: "vocab-review", book: params.book, lesson: params.lesson, mode: b.dataset.mode });
      });
    });

    const stage = root.querySelector("#arena-stage");

    if (mode === "flashcard") {
      // Preload current + next 8 cards into RAM audio cache for instant 0ms playback!
      const upcomingAudio = [];
      for (let k = 0; k < 9; k++) {
        const c = sortedDeck[(idx + k) % sortedDeck.length];
        if (c?.wordAudio) upcomingAudio.push(c.wordAudio);
        if (c?.exampleAudio) upcomingAudio.push(c.exampleAudio);
      }
      preloadAudioUrls(upcomingAudio);

      const pron = analyzePronunciationRules(card.korean);
      const playCardAudio = () => {
        if (card.wordAudio) playAudio(card.wordAudio);
        else if (card.exampleAudio) playAudio(card.exampleAudio);
        else speakKoreanTTS(card.korean);
      };
      const triggerRate = (quality) => {
        store.rateCard(card.id, quality);
        idx += 1;
        flipped = false;
        renderArena();
      };
      const toggleFlip3D = () => {
        flipped = !flipped;
        const inner = stage.querySelector("#fc-3d-inner");
        if (inner) inner.classList.toggle("is-flipped", flipped);
      };

      stage.innerHTML = `
        <div class="flashcard-stage card-pop">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:14px;color:var(--text-muted);flex-wrap:wrap;gap:6px;">
            <span>Thẻ ${(idx % sortedDeck.length) + 1} / ${sortedDeck.length}</span>
            <span>Mức ghi nhớ SRS: Cấp ${store.state.srs[card.id]?.level || 0}/6</span>
          </div>

          <div class="flashcard-3d-scene">
            <div class="flashcard-3d-inner ${flipped ? "is-flipped" : ""}" id="fc-3d-inner">
              <!-- FRONT FACE -->
              <div class="flashcard-face">
                <span style="font-size:11.5px;font-weight:700;color:var(--primary);letter-spacing:0.06em;margin-bottom:8px;">MẶT TRƯỚC · TỪ VỰNG</span>
                <div class="ko" style="font-size:44px;font-weight:800;color:var(--primary-1);margin-bottom:6px;">${card.korean}</div>
                ${pron.hasChange ? `<div class="ko" style="font-size:15.5px;color:var(--yellow-2);font-weight:700;margin-bottom:10px;">Phát âm: [${pron.pronounced}]</div>` : ""}
                <button type="button" class="btn-outline-teal fc-play-trigger" style="margin-bottom:16px;">
                  🔊 Nghe giọng Kyuri <kbd class="keycap">R</kbd>
                </button>
                <div style="color:var(--text-muted);font-size:13.5px;">
                  👆 Chạm thẻ hoặc bấm <kbd class="keycap">Space</kbd> để lật 3D · Phím <kbd class="keycap">1</kbd>–<kbd class="keycap">4</kbd> chọn Quên → Dễ
                </div>
              </div>

              <!-- BACK FACE -->
              <div class="flashcard-face flashcard-face-back">
                <span style="font-size:11.5px;font-weight:700;color:var(--yellow-2);letter-spacing:0.06em;margin-bottom:6px;">MẶT SAU · NGHĨA &amp; VÍ DỤ</span>
                <div class="ko" style="font-size:26px;font-weight:800;color:var(--primary-1);">${card.korean}</div>
                <div style="font-size:23px;font-weight:800;color:var(--text-main);margin:6px 0 10px;">${card.vietnamese}</div>
                ${card.exampleKo ? `
                  <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;padding:10px 14px;width:100%;max-width:500px;margin-bottom:10px;">
                    <div class="ko" style="font-size:16.5px;font-weight:700;color:var(--text-main);">${card.exampleKo}</div>
                    <div style="font-size:13.5px;color:var(--text-muted);margin-top:2px;">${card.exampleVi}</div>
                  </div>
                ` : ""}
                <button type="button" class="btn-outline-teal fc-ex-trigger" style="padding:6px 14px;font-size:13px;">
                  🔊 Nghe câu ví dụ Kyuri
                </button>
              </div>
            </div>
          </div>

          <div class="srs-rating-grid">
            <button class="box-kind clickable srs-btn" data-rate="0" style="border-color:#FFD3D6;">
              <div class="srs-btn-top"><kbd class="keycap keycap-danger">1</kbd><strong style="color:var(--danger);">Quên</strong></div>
              <small>5 phút</small>
            </button>
            <button class="box-kind clickable srs-btn" data-rate="1" style="border-color:#FFE5B4;">
              <div class="srs-btn-top"><kbd class="keycap keycap-warn">2</kbd><strong style="color:var(--yellow-2);">Khó</strong></div>
              <small>12 giờ</small>
            </button>
            <button class="box-kind clickable srs-btn" data-rate="2" style="border-color:#BCECE6;">
              <div class="srs-btn-top"><kbd class="keycap keycap-teal">3</kbd><strong style="color:var(--primary-1);">Tốt</strong></div>
              <small>1–3 ngày</small>
            </button>
            <button class="box-kind clickable srs-btn" data-rate="3" style="border-color:#C3F3D7;">
              <div class="srs-btn-top"><kbd class="keycap keycap-ok">4</kbd><strong style="color:var(--success);">Dễ</strong></div>
              <small>7+ ngày</small>
            </button>
          </div>
        </div>
      `;

      stage.querySelector(".fc-play-trigger").addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        playCardAudio();
      });
      stage.querySelector(".fc-play-trigger").addEventListener("click", (e) => e.stopPropagation());

      const exTrig = stage.querySelector(".fc-ex-trigger");
      if (exTrig) {
        exTrig.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
          if (card.exampleAudio) playAudio(card.exampleAudio);
          else playCardAudio();
        });
        exTrig.addEventListener("click", (e) => e.stopPropagation());
      }

      stage.querySelector("#fc-3d-inner").addEventListener("click", toggleFlip3D);
      stage.querySelectorAll("[data-rate]").forEach((btn) => {
        btn.addEventListener("click", () => triggerRate(Number(btn.dataset.rate)));
      });

      if (window._cjduzArenaKeyHandler) {
        window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
      }
      window._cjduzArenaKeyHandler = (ev) => {
        if (!document.body.contains(stage)) {
          window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
          return;
        }
        const tag = (document.activeElement?.tagName || "").toUpperCase();
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.getElementById("quick-modal-bg") || document.getElementById("auth-modal-bg")) {
          return;
        }
        if (ev.key === "1" || ev.key === "2" || ev.key === "3" || ev.key === "4") {
          ev.preventDefault();
          const btn = stage.querySelector(`[data-rate="${Number(ev.key) - 1}"]`);
          if (btn) btn.style.transform = "scale(0.96)";
          setTimeout(() => triggerRate(Number(ev.key) - 1), 65);
        } else if (ev.code === "Space" || ev.key === "Enter") {
          ev.preventDefault();
          toggleFlip3D();
        } else if (ev.key === "r" || ev.key === "R") {
          ev.preventDefault();
          playCardAudio();
        }
      };
      window.addEventListener("keydown", window._cjduzArenaKeyHandler);
    } else if (mode === "mcq") {
      const distractors = pool
        .filter((w) => w.id !== card.id && w.vietnamese !== card.vietnamese)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [card, ...distractors].sort(() => Math.random() - 0.5);

      stage.innerHTML = `
        <div class="flashcard-stage">
          <div class="box-kind" style="text-align:center;padding:26px 20px;">
            <div style="font-size:14px;color:var(--text-muted);margin-bottom:8px;">Điểm hiện tại: <strong>${score}</strong> · Chọn nghĩa đúng (Phím <kbd class="keycap">1</kbd>–<kbd class="keycap">4</kbd>):</div>
            <div class="ko" style="font-size:36px;font-weight:800;color:var(--primary-1);margin-bottom:10px;">${card.korean}</div>
            <button class="btn-outline-teal" id="mcq-audio" style="margin-bottom:20px;">🔊 Nghe phát âm <kbd class="keycap">R</kbd></button>
            <div class="grid-2" style="text-align:left;">
              ${options.map((opt, i) => `
                <button class="box-kind clickable" data-ans="${opt.id}" data-mcq-idx="${i}" style="font-size:15.5px;font-weight:600;display:flex;align-items:center;gap:8px;">
                  <kbd class="keycap">${i + 1}</kbd>
                  <span>${opt.vietnamese}</span>
                </button>
              `).join("")}
            </div>
            <div id="mcq-feedback" style="margin-top:14px;font-weight:600;"></div>
          </div>
        </div>
      `;
      stage.querySelector("#mcq-audio").addEventListener("click", () => {
        if (card.wordAudio) playAudio(card.wordAudio); else speakKoreanTTS(card.korean);
      });
      let answeredMcq = false;
      stage.querySelectorAll("[data-ans]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (answeredMcq) return;
          answeredMcq = true;
          const ok = btn.dataset.ans === card.id;
          const fb = stage.querySelector("#mcq-feedback");
          store.rateCard(card.id, ok ? 2 : 0);
          if (ok) {
            score += 10;
            btn.style.borderColor = "var(--success)";
            btn.style.background = "rgba(58,202,116,0.12)";
            fb.innerHTML = `<span style="color:var(--success)">✔ Chính xác! ${card.exampleKo ? `Ví dụ: ${card.exampleKo}` : ""}</span>`;
            setTimeout(() => { idx += 1; renderArena(); }, 850);
          } else {
            btn.style.borderColor = "var(--danger)";
            fb.innerHTML = `<span style="color:var(--danger)">✘ Chưa đúng! Đáp án là: "${card.vietnamese}".</span> <button class="btn-primary" id="mcq-next" style="margin-left:10px;padding:5px 14px;">Câu tiếp →</button>`;
            stage.querySelector("#mcq-next").addEventListener("click", () => { idx += 1; renderArena(); });
          }
        });
      });

      if (window._cjduzArenaKeyHandler) {
        window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
      }
      window._cjduzArenaKeyHandler = (ev) => {
        if (!document.body.contains(stage)) {
          window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
          return;
        }
        const tag = (document.activeElement?.tagName || "").toUpperCase();
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.getElementById("quick-modal-bg") || document.getElementById("auth-modal-bg")) return;
        if (["1", "2", "3", "4"].includes(ev.key) && !answeredMcq) {
          ev.preventDefault();
          const b = stage.querySelector(`[data-mcq-idx="${Number(ev.key) - 1}"]`);
          if (b) b.click();
        } else if ((ev.code === "Space" || ev.key === "Enter") && stage.querySelector("#mcq-next")) {
          ev.preventDefault();
          stage.querySelector("#mcq-next").click();
        } else if (ev.key === "r" || ev.key === "R") {
          ev.preventDefault();
          stage.querySelector("#mcq-audio")?.click();
        }
      };
      window.addEventListener("keydown", window._cjduzArenaKeyHandler);
    } else {
      if (window._cjduzArenaKeyHandler) {
        window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
        window._cjduzArenaKeyHandler = null;
      }
    }
    if (mode === "typing") {
      stage.innerHTML = `
        <div class="flashcard-stage">
          <div class="box-kind" style="padding:26px;">
            <div style="text-align:center;">
              <div style="font-size:14px;color:var(--text-muted);margin-bottom:6px;">Nghe âm thanh &amp; nghĩa tiếng Việt rồi gõ lại chữ Hangeul:</div>
              <div style="font-size:24px;font-weight:700;margin-bottom:10px;">${card.vietnamese}</div>
              <button class="btn-primary" id="type-play-btn" style="margin-bottom:16px;">🔊 Phát âm thanh gợi ý</button>
            </div>

            <div style="display:flex;gap:8px;">
              <input id="ko-type-input" class="ko" type="text" placeholder="Gõ chữ tiếng Hàn hoặc bấm bàn phím ảo bên dưới..." style="flex:1;padding:12px 16px;border-radius:12px;border:2px solid var(--primary);font-size:20px;font-weight:700;" />
              <button class="btn-orange" id="type-check-btn">Kiểm tra</button>
            </div>
            <div id="type-feedback" style="margin-top:12px;font-weight:600;text-align:center;"></div>

            <!-- Virtual Korean Keyboard -->
            <div class="kr-keyboard">
              ${HANGEUL_DATA.keyboardRows.map((row) => `
                <div class="kr-key-row">
                  ${row.map((cell) => `<button type="button" class="kr-key" data-jamo="${cell.k}"><span>${cell.k}</span><small>${cell.en}</small></button>`).join("")}
                </div>
              `).join("")}
              <div class="kr-key-row">
                <button type="button" class="kr-key" data-special="space" style="min-width:140px;">Space (Cách)</button>
                <button type="button" class="kr-key" data-special="back" style="min-width:90px;">⌫ Xóa</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const inp = stage.querySelector("#ko-type-input");
      const playFn = () => { if (card.wordAudio) playAudio(card.wordAudio); else speakKoreanTTS(card.korean); };
      stage.querySelector("#type-play-btn").addEventListener("click", playFn);
      playFn();

      stage.querySelectorAll("[data-jamo]").forEach((k) => {
        k.addEventListener("click", () => {
          inp.value = appendJamoToText(inp.value, k.dataset.jamo);
          inp.focus();
        });
      });
      stage.querySelectorAll("[data-special]").forEach((k) => {
        k.addEventListener("click", () => {
          if (k.dataset.special === "space") inp.value += " ";
          if (k.dataset.special === "back") inp.value = inp.value.slice(0, -1);
          inp.focus();
        });
      });

      const verify = () => {
        const cleanUser = inp.value.trim().replace(/\?|\./g, "");
        const cleanTarget = card.korean.trim().replace(/\?|\./g, "");
        const fb = stage.querySelector("#type-feedback");
        if (cleanUser === cleanTarget) {
          store.rateCard(card.id, 3);
          fb.innerHTML = `<span style="color:var(--success)">✔ Tuyệt vời! Chính tả Hangeul chuẩn 100%: <span class="ko">${card.korean}</span></span>`;
          setTimeout(() => { idx += 1; renderArena(); }, 1000);
        } else {
          store.rateCard(card.id, 0);
          fb.innerHTML = `<span style="color:var(--danger)">Đáp án đúng là: <strong class="ko" style="font-size:20px;">${card.korean}</strong></span> <button class="btn-outline-teal" id="type-next" style="margin-left:8px;padding:4px 12px;">Từ tiếp →</button>`;
          stage.querySelector("#type-next").addEventListener("click", () => { idx += 1; renderArena(); });
        }
      };
      stage.querySelector("#type-check-btn").addEventListener("click", verify);
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") verify(); });
    } else if (mode === "match") {
      const six = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
      const tiles = [
        ...six.map((w) => ({ uid: `k_${w.id}`, pairId: w.id, text: w.korean, isKo: true })),
        ...six.map((w) => ({ uid: `v_${w.id}`, pairId: w.id, text: w.vietnamese, isKo: false }))
      ].sort(() => Math.random() - 0.5);

      let firstPick = null;
      let matchedCount = 0;

      stage.innerHTML = `
        <div class="box-kind">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <strong>Chọn 1 từ tiếng Hàn ghép với nghĩa tiếng Việt tương ứng:</strong>
            <button class="btn-outline-teal" id="match-reload" style="padding:5px 14px;">🔄 Đổi ván mới</button>
          </div>
          <div class="grid-3" id="match-grid">
            ${tiles.map((t) => `
              <button type="button" class="box-kind clickable ${t.isKo ? "ko" : ""}" data-uid="${t.uid}" data-pair="${t.pairId}" style="text-align:center;font-weight:${t.isKo ? "800" : "600"};font-size:${t.isKo ? "20px" : "15px"};min-height:78px;">
                ${t.text}
              </button>
            `).join("")}
          </div>
        </div>
      `;

      stage.querySelector("#match-reload").addEventListener("click", renderArena);
      stage.querySelectorAll("[data-uid]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.disabled) return;
          if (!firstPick) {
            firstPick = btn;
            btn.style.borderColor = "var(--yellow-2)";
            btn.style.background = "rgba(254,154,5,0.12)";
            return;
          }
          if (firstPick === btn) return;
          if (firstPick.dataset.pair === btn.dataset.pair) {
            firstPick.disabled = true;
            btn.disabled = true;
            firstPick.style.background = "rgba(58,202,116,0.18)";
            btn.style.background = "rgba(58,202,116,0.18)";
            firstPick.style.borderColor = "var(--success)";
            btn.style.borderColor = "var(--success)";
            store.rateCard(btn.dataset.pair, 2);
            firstPick = null;
            matchedCount += 1;
            if (matchedCount === six.length) {
              setTimeout(renderArena, 700);
            }
          } else {
            const prev = firstPick;
            firstPick = null;
            btn.style.borderColor = "var(--danger)";
            setTimeout(() => {
              prev.style.borderColor = "transparent";
              prev.style.background = "#FFFFFF";
              btn.style.borderColor = "transparent";
            }, 400);
          }
        });
      });
    }
  }

  renderArena();
}

// Hangeul & 7 Pronunciation Rules Interactive Lab
function renderHangeulLab(root, navigate) {
  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button id="bc-theory">Lý thuyết</button><span>▶</span><span>Phòng Lab Hangeul &amp; 7 Quy tắc Biến âm</span>
      </div>

      <!-- Live Pronunciation Rule Analyzer -->
      <div class="outline-ai" style="margin-bottom:26px;">
        <h3 style="margin:0 0 8px;">🔍 Máy soi 7 Quy tắc Biến âm Tiếng Hàn tự động</h3>
        <p style="margin:0 0 12px;font-size:14.5px;color:var(--text-muted);">
          Nhập hoặc bấm thử các từ bên dưới để xem cách chuyển từ mặt chữ Hangeul sang phát âm chuẩn bản xứ:
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          ${["독일", "학교", "안녕하십니까", "같이", "설날", "좋다", "읽습니다", "한국어"].map((sample) => `
            <button type="button" class="btn-outline-teal ko" data-sample="${sample}" style="padding:5px 13px;font-size:14px;">${sample}</button>
          `).join("")}
        </div>
        <div style="display:flex;gap:10px;">
          <input id="pron-input" class="ko" value="안녕하십니까" style="flex:1;padding:10px 16px;border-radius:99px;border:1.5px solid var(--primary);font-size:18px;font-weight:700;" />
          <button class="btn-primary" id="pron-speak">🔊 Đọc mẫu</button>
        </div>
        <div id="pron-result" style="margin-top:14px;"></div>
      </div>

      <div class="section-head"><h2>14 Phụ âm cơ bản &amp; 5 Phụ âm căng (Bấm thẻ để nghe)</h2></div>
      <div class="grid-3">
        ${[...HANGEUL_DATA.basicConsonants, ...HANGEUL_DATA.tenseConsonants].map((c) => `
          <div class="box-kind clickable" data-speak="${c.sample.split("(")[0].trim()}">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="ko" style="font-size:32px;font-weight:800;color:var(--primary-1);">${c.ch}</span>
              <span class="badge-orange" style="background:rgba(254,154,5,0.12);">${c.sound}</span>
            </div>
            <div style="font-weight:600;margin-top:4px;">${c.name} · Ví dụ: <span class="ko">${c.sample}</span></div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">${c.tip}</div>
          </div>
        `).join("")}
      </div>

      <div class="section-head"><h2>Nguyên âm đơn &amp; Nguyên âm ghép</h2></div>
      <div class="grid-3">
        ${HANGEUL_DATA.vowels.map((v) => `
          <div class="box-kind clickable" data-speak="${v.sample.split("(")[0].trim()}">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="ko" style="font-size:28px;font-weight:800;color:var(--primary-1);">${v.ch}</span>
              <span style="font-weight:700;color:var(--yellow-2);">[${v.sound}]</span>
            </div>
            <div style="font-size:14px;margin-top:6px;">Ví dụ: <strong class="ko">${v.sample}</strong></div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  root.querySelector("#bc-theory").addEventListener("click", () => navigate("theory"));

  const inp = root.querySelector("#pron-input");
  const out = root.querySelector("#pron-result");
  const updatePron = () => {
    const res = analyzePronunciationRules(inp.value);
    out.innerHTML = `
      <div style="background:#F8FAFB;padding:14px 18px;border-radius:12px;">
        <div style="font-size:18px;">Chữ viết: <strong class="ko">${res.original}</strong> → Phát âm chuẩn: <strong class="ko" style="color:var(--yellow-2);font-size:22px;">[${res.pronounced}]</strong></div>
        ${res.rules.length
          ? `<ul style="margin:8px 0 0;padding-left:20px;font-size:14px;color:var(--primary-4);">${res.rules.map((r) => `<li><strong>${r.rule}:</strong> <span class="ko">${r.detail}</span></li>`).join("")}</ul>`
          : `<div style="font-size:13.5px;color:var(--text-muted);margin-top:4px;">Đọc giữ nguyên âm gốc trên mặt chữ.</div>`}
      </div>
    `;
  };
  updatePron();
  inp.addEventListener("input", updatePron);
  root.querySelector("#pron-speak").addEventListener("click", () => speakKoreanTTS(inp.value));
  root.querySelectorAll("[data-sample]").forEach((b) => {
    b.addEventListener("click", () => { inp.value = b.dataset.sample; updatePron(); speakKoreanTTS(inp.value); });
  });
  root.querySelectorAll("[data-speak]").forEach((b) => {
    b.addEventListener("click", () => speakKoreanTTS(b.dataset.speak));
  });
}

// Grammar List + Confusing Grammar Comparison View
function renderGrammarList(root, db, navigate, mode = "sc1") {
  let searchQ = "";
  function render() {
    const filtered = db.sc1Grammar.filter((g) =>
      !searchQ || g.pattern.toLowerCase().includes(searchQ) || g.meaning.toLowerCase().includes(searchQ)
    );
    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <button id="bc-theory">Lý thuyết</button><span>▶</span><span>Ngữ pháp &amp; So sánh cấu trúc</span>
        </div>

        <div class="skill-pills-row">
          <button class="btn-skill ${mode === "sc1" ? "active" : ""}" data-m="sc1">51 Ngữ pháp Sơ cấp 1 (Giọng Kyuri)</button>
          <button class="btn-skill ${mode === "compare" ? "active" : ""}" data-m="compare">Bảng phân biệt Ngữ pháp dễ nhầm</button>
        </div>

        ${mode === "sc1" ? `
          <input id="gram-search" value="${searchQ}" placeholder="Tìm nhanh cấu trúc (VD: 입니다, 아서, 고 싶다)..." style="width:100%;max-width:460px;padding:10px 18px;border-radius:99px;border:1.5px solid var(--primary);margin-bottom:18px;" />
          <div class="grid-2">
            ${filtered.map((g) => `
              <div class="box-kind">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <strong class="ko" style="font-size:20px;color:var(--primary-1);">${g.pattern}</strong>
                  <span style="font-size:12.5px;background:var(--primary-3);color:var(--primary-4);padding:3px 10px;border-radius:99px;font-weight:700;">Bài ${g.lesson}</span>
                </div>
                <div style="font-weight:600;margin-bottom:4px;">${g.meaning}</div>
                <div style="font-size:13.5px;color:var(--text-muted);margin-bottom:10px;">${g.construction} — ${g.usage}</div>
                <div style="background:#F8FAFB;padding:10px 12px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <div>
                    <div class="ko" style="font-weight:600;">${g.example1Ko}</div>
                    <div style="font-size:13px;color:var(--text-muted);">${g.example1Vi}</div>
                  </div>
                  ${g.example1Audio ? `<button class="btn-audio" data-play="${g.example1Audio}">🔊</button>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:18px;">
            ${GRAMMAR_COMPARISONS.map((cmp) => `
              <div class="box-kind">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
                  <h3 style="margin:0;font-size:19px;color:var(--primary-1);">${cmp.title}</h3>
                  <span class="badge-orange" style="background:rgba(254,154,5,0.14);">${cmp.level}</span>
                </div>
                <div class="grid-2">
                  <div style="background:var(--primary-3);padding:14px;border-radius:10px;">
                    <strong class="ko" style="font-size:17px;color:var(--primary-4);">${cmp.left.name}</strong>
                    <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;">${cmp.left.points.map((p) => `<li>${p}</li>`).join("")}</ul>
                  </div>
                  <div style="background:rgba(254,154,5,0.1);padding:14px;border-radius:10px;">
                    <strong class="ko" style="font-size:17px;color:#B45309;">${cmp.right.name}</strong>
                    <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;">${cmp.right.points.map((p) => `<li>${p}</li>`).join("")}</ul>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;

    root.querySelector("#bc-theory").addEventListener("click", () => navigate("theory"));
    root.querySelectorAll("[data-m]").forEach((b) => b.addEventListener("click", () => navigate("theory", { sub: "grammar-list", mode: b.dataset.m })));
    const sInp = root.querySelector("#gram-search");
    if (sInp) {
      sInp.addEventListener("input", (e) => { searchQ = e.target.value.toLowerCase(); render(); root.querySelector("#gram-search").focus(); });
    }
    root.querySelectorAll("[data-play]").forEach((b) => b.addEventListener("click", () => playAudio(b.dataset.play)));
  }
  render();
}

// Kho Câu & Biểu Hiện Thường Gặp TOPIK 1 & TOPIK 2
function renderFrequentTopikView(root, navigate) {
  let cat = "all";
  function render() {
    const items = FREQUENT_TOPIK_EXPRESSIONS.filter((x) => cat === "all" || x.category === cat);
    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <button id="bc-theory">Lý thuyết</button><span>▶</span><span>Ôn các câu &amp; biểu hiện thường gặp TOPIK 1, 2</span>
        </div>

        <div class="section-head" style="margin-top:0;">
          <h2>Kho Câu &amp; Biểu Hiện Thường Gặp Nhất Đề Thi TOPIK 1 &amp; 2</h2>
        </div>

        <div class="skill-pills-row">
          <button class="btn-skill ${cat === "all" ? "active" : ""}" data-cat="all">Tất cả (${FREQUENT_TOPIK_EXPRESSIONS.length})</button>
          <button class="btn-skill ${cat === "dialogue" ? "active" : ""}" data-cat="dialogue">Câu phản xạ Hội thoại Nghe</button>
          <button class="btn-skill ${cat === "conjunction" ? "active" : ""}" data-cat="conjunction">Phó từ liên kết (Điền khuyết)</button>
          <button class="btn-skill ${cat === "synonym" ? "active" : ""}" data-cat="synonym">Cặp Đồng nghĩa Câu 5–8</button>
          <button class="btn-skill ${cat === "idiom" ? "active" : ""}" data-cat="idiom">Quán dụng ngữ hay gặp</button>
        </div>

        <div class="grid-2">
          ${items.map((item) => `
            <div class="box-kind">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
                <strong class="ko" style="font-size:19px;color:var(--primary-1);">${item.ko}</strong>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                  <span class="badge-orange" style="background:rgba(254,154,5,0.14);font-size:12px;">${item.level}</span>
                  <button class="btn-audio" data-speak="${item.ko.split("＝")[0].split("/")[0].trim()}">🔊</button>
                </div>
              </div>
              <div style="font-weight:700;margin-bottom:6px;">${item.vi}</div>
              <div class="ko" style="font-size:14px;color:var(--text-muted);background:#F8FAFB;padding:8px 12px;border-radius:8px;margin-bottom:8px;">
                Ví dụ: ${item.usage}
              </div>
              <div style="font-size:13px;color:var(--primary-4);background:var(--primary-3);padding:6px 10px;border-radius:8px;">
                🎯 <strong>Mẹo phòng thi:</strong> ${item.tip}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    root.querySelector("#bc-theory").addEventListener("click", () => navigate("theory"));
    root.querySelectorAll("[data-cat]").forEach((b) => b.addEventListener("click", () => { cat = b.dataset.cat; render(); }));
    root.querySelectorAll("[data-speak]").forEach((b) => b.addEventListener("click", () => speakKoreanTTS(b.dataset.speak)));
  }
  render();
}

// Hanja Etymology Bridge View
function renderHanjaView(root, navigate) {
  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button id="bc-theory">Lý thuyết</button><span>▶</span><span>Sơ đồ Gốc từ Âm Hán – Hàn</span>
      </div>
      <div class="section-head" style="margin-top:0;">
        <h2>Sơ đồ Cầu nối Âm Hán – Hàn (Học 1 gốc chữ nhớ 6 từ TOPIK)</h2>
      </div>
      <div class="grid-2">
        ${HANJA_ROOTS.map((r) => `
          <div class="box-kind">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <div class="icon-vocab-badge ko" style="font-size:24px;">${r.root}</div>
              <div>
                <strong style="font-size:18px;color:var(--primary-1);">Gốc "${r.root}" — Âm Hán Việt: ${r.hanViet}</strong>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${r.words.map((w) => `
                <div style="display:flex;justify-content:space-between;align-items:center;background:#F8FAFB;padding:8px 12px;border-radius:8px;">
                  <div>
                    <strong class="ko" style="font-size:16px;color:var(--text-main);">${w.ko}</strong>
                    <span style="font-size:13px;color:var(--yellow-2);font-weight:700;margin:0 6px;">[${w.hv}]</span>
                    <span style="font-size:14px;color:var(--text-muted);">— ${w.vi}</span>
                  </div>
                  <button class="btn-audio" style="width:28px;height:28px;font-size:12px;" data-speak="${w.ko}">🔊</button>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  root.querySelector("#bc-theory").addEventListener("click", () => navigate("theory"));
  root.querySelectorAll("[data-speak]").forEach((b) => b.addEventListener("click", () => speakKoreanTTS(b.dataset.speak)));
}

// Textbook Overview for Books 2..6 + Importer Link
function renderTextbookOverview(root, db, navigate, bookId) {
  const bk = TEXTBOOK_SERIES.find((b) => b.id === bookId) || TEXTBOOK_SERIES[1];
  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button id="bc-theory">Lý thuyết &amp; Giáo trình</button><span>▶</span><span>${bk.title}</span>
      </div>
      <div class="prediction-banner" style="margin-bottom:22px;">
        <div>
          <span class="badge-orange" style="margin-bottom:8px;">${bk.topikTarget}</span>
          <h2 style="margin:0 0 6px;">${bk.title}</h2>
          <p style="margin:0;color:var(--text-muted);">${bk.subtitle} — Bạn có thể kéo-thả thêm gói thẻ Anki (.apkg) của quyển này tại mục Công cụ để đồng bộ âm thanh tự động.</p>
        </div>
        <button class="btn-primary" id="btn-import-more">📥 Kéo-thả thêm file .apkg</button>
      </div>
      <div class="grid-2">
        ${(bk.syllabus || []).map((topic, i) => `
          <div class="box-kind">
            <strong style="font-size:16.5px;color:var(--primary-1);">Chủ điểm ${i + 1}: ${topic}</strong>
            <p style="margin:6px 0 12px;font-size:14px;color:var(--text-muted);">Luyện tập kết hợp tại phòng Ôn cấu trúc đề TOPIK &amp; Kho câu thường gặp.</p>
            <button class="btn-outline-teal" data-go-prac="1" style="padding:6px 14px;font-size:13.5px;">Luyện đề liên quan →</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;
  root.querySelector("#bc-theory").addEventListener("click", () => navigate("theory"));
  root.querySelector("#btn-import-more").addEventListener("click", () => navigate("check-tools", { tab: "import" }));
  root.querySelectorAll("[data-go-prac]").forEach((b) => b.addEventListener("click", () => navigate("practice", { sub: bk.bookNum <= 2 ? "topik1" : "topik2" })));
}
