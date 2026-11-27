import { store, normalizeBookId, getBookWords, getBookCurriculum, playAudio, preloadAudioUrls, speakKoreanTTS, bindHangulEnter, renderQuizHistoryPillHTML } from "../store.js?v=20261127-12";
import { ico } from "../icons.js?v=20261127-12";
import { analyzePronunciationRules, appendJamoToText } from "../korean-engine.js?v=20261127-12";
import { HANGEUL_DATA, HANJA_ROOTS, FREQUENT_TOPIK_EXPRESSIONS } from "../curated-content.js?v=20261127-12";
import { renderChapterExercises } from "../chapter-exercises.js?v=20261127-12";
import { renderGrammarStudioView, renderInlineLessonGrammarSection } from "../grammar-studio.js?v=20261127-12";

function buildSubPartsForLesson(db, bookKey, lessonNum, lessonWords) {
  const bookCur = getBookCurriculum(db, bookKey);
  const chapObj = bookCur?.chapters?.find((c) => c.lesson === lessonNum);
  if (chapObj?.parts?.length && !["topik1", "sejong1"].includes(bookKey) && !String(bookKey).startsWith("custom_")) {
    return chapObj.parts.map((pm) => {
      const pWords = lessonWords.filter((w) => Number(w.part || 1) === pm.part);
      return {
        part: pm.part,
        title: pm.title,
        words: pWords.length ? pWords : lessonWords.slice((pm.part - 1) * 12, pm.part * 12)
      };
    });
  }
  // Auto-chunk any supplementary deck (Sejong / TOPIK I bank / Custom Anki) into comfortable 12-word sub-parts so NEVER overwhelming!
  const chunkSize = 12;
  const parts = [];
  for (let i = 0; i < lessonWords.length; i += chunkSize) {
    const pNum = Math.floor(i / chunkSize) + 1;
    const slice = lessonWords.slice(i, i + chunkSize);
    parts.push({
      part: pNum,
      title: `Phần ${pNum} · Nhóm từ ${i + 1}–${i + slice.length}`,
      words: slice
    });
  }
  return parts.length ? parts : [{ part: 1, title: "Phần 1 · Từ vựng", words: lessonWords }];
}

export function renderTheoryView(root, db, navigate, params = {}) {
  const sub = params.sub || "index";
  if (sub === "vocab-book" || sub === "textbook-detail") {
    return renderVocabBookIndex(root, db, navigate, params.book || params.bookId || "q1");
  }
  if (sub === "lesson-detail") {
    return renderLessonDetail(root, db, navigate, params.book || "q1", Number(params.lesson || 1), params.tab || "vocab", params.part ? Number(params.part) : null);
  }
  if (sub === "vocab-review") return renderVocabReviewArena(root, db, navigate, params);
  if (sub === "hangeul") return renderHangeulLab(root, navigate);
  if (sub === "grammar-list") return renderGrammarStudioView(root, db, navigate, params);
  if (sub === "frequent") return renderFrequentTopikView(root, navigate);
  if (sub === "hanja") return renderHanjaView(root, navigate);

  // =========================================================================
  // DEFAULT HUB (/ly-thuyet): 6-BOOK TIERED VOCABULARY + TEXTBOOK + WORKBOOK
  // =========================================================================
  const defaultBook = normalizeBookId(params.book || store.state.roadmapProfile?.startBook || "q1");
  const books = db.books6 || [];
  const selectedBookKey = params.book === "sejong1" || params.book === "topik1" ? params.book : defaultBook;
  const activeCur = getBookCurriculum(db, selectedBookKey);
  const activePool = getBookWords(db, selectedBookKey);

  // Build chapter cards for selected book
  const chapterCards = [];
  if (selectedBookKey === "sejong1" || selectedBookKey === "topik1") {
    const map = new Map();
    activePool.forEach((w) => {
      if (!map.has(w.lesson)) map.set(w.lesson, { lesson: w.lesson, title: w.lessonTitle, words: [] });
      map.get(w.lesson).words.push(w);
    });
    map.forEach((g) => {
      chapterCards.push({
        lesson: g.lesson,
        title: g.title,
        koTitle: "",
        words: g.words,
        parts: buildSubPartsForLesson(db, selectedBookKey, g.lesson, g.words)
      });
    });
  } else if (activeCur?.chapters) {
    activeCur.chapters.forEach((ch) => {
      const cWords = activePool.filter((w) => w.lesson === ch.lesson);
      chapterCards.push({
        lesson: ch.lesson,
        title: ch.title,
        koTitle: ch.koTitle,
        words: cWords,
        parts: buildSubPartsForLesson(db, activeCur.bookId, ch.lesson, cWords)
      });
    });
  }

  const bookMastered = activePool.filter((w) => store.isMastered(w.id)).length;

  root.innerHTML = `
    <div class="container-web">
      <div class="skill-pills-row" style="margin-bottom:14px;">
        <button type="button" class="btn-skill active">Giáo trình Quyển 1–6</button>
        <button type="button" class="btn-skill" id="top-go-gram-lesson">Ngữ pháp theo bài</button>
        <button type="button" class="btn-skill" id="top-go-gram-topik">Ngữ pháp TOPIK</button>
        <button type="button" class="btn-skill" id="top-go-gram-sim">Ngữ pháp tương đồng</button>
        <button type="button" class="btn-skill" id="top-go-hangeul">Hangeul &amp; Biến âm</button>
        <button type="button" class="btn-skill" id="top-go-hanja">Âm Hán–Hàn</button>
        <button type="button" class="btn-skill" id="top-go-frequent">Quán dụng ngữ</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
        <div style="min-width:0;flex:1 1 200px;">
          <h1 class="title-hero" style="margin-bottom:2px;">
            ${selectedBookKey === "sejong1" ? "Từ vựng Sejong" : activeCur?.shortTitle || "Quyển 1 · Sơ cấp 1"}
          </h1>
          <span style="font-size:13px;color:var(--text-muted);">
            Đã thuộc <strong class="nw" style="color:var(--primary-1);">${bookMastered}/${activePool.length} từ</strong>
          </span>
        </div>
        <button type="button" class="btn-primary nw" id="btn-srs-current-part">
          Lật thẻ từ vựng
        </button>
      </div>

      <div class="book-tabs-bar">
        ${books.map((b) => {
          const bWords = getBookWords(db, b.bookId);
          const bMast = bWords.filter((w) => store.isMastered(w.id)).length;
          const isSel = selectedBookKey === b.bookId;
          return `
            <button type="button" class="btn-skill ${isSel ? "active" : ""}" data-pick-book="${b.bookId}">
              <span>Quyển ${b.bookNum}</span>
              <span style="opacity:0.78;font-size:12px;font-weight:500;">${bMast}/${bWords.length}</span>
            </button>
          `;
        }).join("")}
        <button type="button" class="btn-skill ${selectedBookKey === "sejong1" ? "active" : ""}" data-pick-book="sejong1">
          <span>Sejong</span>
          <span style="opacity:0.78;font-size:12px;font-weight:500;">${db.sejongVocab.length}</span>
        </button>
      </div>

      <div class="grid-3">
        ${chapterCards.map((ch) => {
          const chMast = ch.words.filter((w) => store.isMastered(w.id)).length;
          const pct = ch.words.length ? Math.round((chMast / ch.words.length) * 100) : 0;
          return `
            <div class="box-kind" style="display:flex;flex-direction:column;justify-content:space-between;gap:10px;padding:16px;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:6px;">
                  <strong style="font-size:15px;line-height:1.3;color:var(--text-main);">Bài ${String(ch.lesson).padStart(2, "0")} · ${ch.title}</strong>
                  <span style="font-size:12.5px;color:var(--text-muted);white-space:nowrap;">${chMast}/${ch.words.length}</span>
                </div>

                <div class="progress-track" style="margin-bottom:10px;">
                  <div class="progress-fill" style="width:${pct}%"></div>
                </div>

                <div style="display:flex;flex-direction:column;gap:5px;">
                  ${ch.parts.map((pt) => {
                    const pMast = pt.words.filter((w) => store.isMastered(w.id)).length;
                    const pDone = pt.words.length > 0 && pMast === pt.words.length;
                    return `
                      <button type="button" class="chapter-part-btn ko ${pDone ? "is-done" : ""}" data-open-part="${pt.part}" data-ls="${ch.lesson}">
                        <span style="font-weight:600;color:var(--text-main);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pt.title}</span>
                        <span style="font-weight:650;font-size:12.5px;color:${pDone ? "var(--success)" : "var(--primary)"};flex-shrink:0;">${pMast}/${pt.words.length} ›</span>
                      </button>
                    `;
                  }).join("")}
                </div>
              </div>

              <div style="display:flex;gap:6px;padding-top:8px;border-top:1px solid var(--border-light);">
                <button type="button" class="btn-step-quiet" data-open-tb="${ch.lesson}" style="flex:1;">Ngữ pháp</button>
                <button type="button" class="btn-step-quiet" data-open-wb="${ch.lesson}" style="flex:1;">Bài tập</button>
                <button type="button" class="btn-step-quiet" data-open-tr="${ch.lesson}" style="flex:1;">Dịch câu</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  root.querySelector("#top-go-gram-lesson").addEventListener("click", () => navigate("theory", { sub: "grammar-list", mode: "lesson", book: normalizeBookId(selectedBookKey), lesson: 1 }));
  root.querySelector("#top-go-gram-topik").addEventListener("click", () => navigate("theory", { sub: "grammar-list", mode: "topik" }));
  root.querySelector("#top-go-gram-sim").addEventListener("click", () => navigate("theory", { sub: "grammar-list", mode: "similar" }));
  root.querySelector("#top-go-hangeul").addEventListener("click", () => navigate("theory", { sub: "hangeul" }));
  root.querySelector("#top-go-hanja").addEventListener("click", () => navigate("theory", { sub: "hanja" }));
  root.querySelector("#top-go-frequent").addEventListener("click", () => navigate("theory", { sub: "frequent" }));

  root.querySelectorAll("[data-pick-book]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate("theory", { sub: "index", book: btn.dataset.pickBook });
    });
  });

  root.querySelector("#btn-srs-current-part").addEventListener("click", () => {
    const firstUnfinished = chapterCards[0] || { lesson: 1 };
    navigate("theory", { sub: "vocab-review", book: selectedBookKey, lesson: firstUnfinished.lesson, part: 1, mode: "flashcard" });
  });

  root.querySelectorAll("[data-open-part]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate("theory", {
        sub: "lesson-detail",
        book: selectedBookKey,
        lesson: Number(btn.dataset.ls),
        tab: "vocab",
        part: Number(btn.dataset.openPart)
      });
    });
  });

  root.querySelectorAll("[data-open-tb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate("theory", {
        sub: "lesson-detail",
        book: selectedBookKey,
        lesson: Number(btn.dataset.openTb),
        tab: "grammar"
      });
    });
  });

  root.querySelectorAll("[data-open-wb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate("theory", {
        sub: "lesson-detail",
        book: selectedBookKey,
        lesson: Number(btn.dataset.openWb),
        tab: "workbook"
      });
    });
  });

  root.querySelectorAll("[data-open-tr]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate("theory", {
        sub: "lesson-detail",
        book: selectedBookKey,
        lesson: Number(btn.dataset.openTr),
        tab: "translate"
      });
    });
  });
}

function renderVocabBookIndex(root, db, navigate, rawBookKey) {
  // Reuse the tiered book hub view focused on rawBookKey
  return renderTheoryView(root, db, navigate, { sub: "index", book: rawBookKey });
}

// =========================================================================
// COMPLETE LESSON STUDY VIEW: SUB-PART VOCAB + TEXTBOOK + WORKBOOK (Q1..Q6)
// =========================================================================
function renderLessonDetail(root, db, navigate, rawBookKey, lessonNum, activeTab = "vocab", requestedPart = null) {
  const bookKey = rawBookKey === "sc1" ? "q1" : (rawBookKey === "sc2" ? "q2" : rawBookKey);
  const bookCur = getBookCurriculum(db, bookKey);
  const pool = getBookWords(db, bookKey);
  const words = pool.filter((w) => w.lesson === lessonNum);
  const chapObj = bookCur?.chapters?.find((c) => c.lesson === lessonNum);

  const grammars = chapObj?.textbook?.grammars || (bookKey === "q1" ? db.sc1Grammar.filter((g) => g.lesson === lessonNum) : []);
  const lessonTitle = chapObj?.title || words[0]?.lessonTitle || `Bài ${lessonNum}`;
  const dialogue = chapObj?.textbook?.dialogue || [];
  const culture = chapObj?.textbook?.culture || "";

  const subParts = buildSubPartsForLesson(db, bookKey, lessonNum, words);
  let selectedPart = requestedPart || 1;
  if (selectedPart !== "all" && !subParts.some((p) => p.part === Number(selectedPart))) {
    selectedPart = 1;
  }

  // Normalize legacy tab name "exercises" -> "workbook"
  const normTab = activeTab === "exercises" ? "workbook" : (activeTab === "dialogue" ? "grammar" : activeTab);

  preloadAudioUrls([
    ...words.slice(0, 24).map((w) => w.wordAudio),
    ...words.slice(0, 14).map((w) => w.exampleAudio),
    ...grammars.map((g) => g.example1Audio)
  ].filter(Boolean));

  store.state.lastLesson = {
    book: bookKey,
    lesson: lessonNum,
    title: `Bài ${String(lessonNum).padStart(2, "0")} · ${lessonTitle}`
  };
  store.save();

  let hideMeaning = false;
  let muteRole = "none";

  function renderContent() {
    const activePartObj = selectedPart === "all"
      ? { part: "all", title: `Toàn bộ Bài ${String(lessonNum).padStart(2, "0")}`, words }
      : (subParts.find((p) => p.part === Number(selectedPart)) || subParts[0]);
    const visibleWords = activePartObj?.words || words;

    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <button id="bc-theory">Giáo trình</button>
          <span>/</span>
          <button id="bc-book">${bookCur?.shortTitle || bookKey}</button>
          <span>/</span>
          <span>Bài ${String(lessonNum).padStart(2, "0")}</span>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <div>
            <h1 style="margin:0;font-size:21px;font-weight:750;">Bài ${String(lessonNum).padStart(2, "0")}: ${lessonTitle} ${chapObj?.koTitle ? `<span class="ko" style="color:var(--text-muted);font-weight:600;">(${chapObj.koTitle})</span>` : ""}</h1>
          </div>
          <button type="button" class="btn-primary" id="btn-quiz-part">
            Lật thẻ ${selectedPart === "all" ? `(${words.length})` : `Phần ${activePartObj.part}`}
          </button>
        </div>

        <div class="skill-pills-row">
          <button type="button" class="btn-skill ${normTab === "vocab" ? "active" : ""}" data-tab="vocab">
            Từ vựng (${words.length})
          </button>
          <button type="button" class="btn-skill ${normTab === "grammar" ? "active" : ""}" data-tab="grammar">
            Ngữ pháp &amp; Hội thoại
          </button>
          <button type="button" class="btn-skill ${normTab === "workbook" ? "active" : ""}" data-tab="workbook">
            Bài tập
          </button>
          <button type="button" class="btn-skill ${normTab === "translate" ? "active" : ""}" data-tab="translate">
            Dịch câu
          </button>
        </div>

        <div id="lesson-tab-body"></div>
      </div>
    `;

    root.querySelector("#bc-theory").addEventListener("click", () => navigate("theory"));
    root.querySelector("#bc-book").addEventListener("click", () => navigate("theory", { sub: "index", book: bookKey }));
    root.querySelector("#btn-quiz-part").addEventListener("click", () => {
      navigate("theory", {
        sub: "vocab-review",
        book: bookKey,
        lesson: lessonNum,
        part: selectedPart === "all" ? 1 : Number(selectedPart),
        mode: "flashcard"
      });
    });
    root.querySelectorAll("[data-tab]").forEach((b) => {
      b.addEventListener("click", () => {
        navigate("theory", { sub: "lesson-detail", book: bookKey, lesson: lessonNum, tab: b.dataset.tab });
      });
    });

    const body = root.querySelector("#lesson-tab-body");

    if (normTab === "vocab") {
      body.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <div class="book-tabs-bar" style="margin-bottom:0;flex:1;min-width:0;">
            ${subParts.map((pt) => {
              const pMast = pt.words.filter((w) => store.isMastered(w.id)).length;
              const isAct = Number(selectedPart) === pt.part;
              return `
                <button type="button" class="btn-skill ${isAct ? "active" : ""}" data-pick-subpart="${pt.part}" style="padding:6px 12px;font-size:13px;">
                  ${pt.title} <span style="opacity:0.78;font-size:12px;">(${pMast}/${pt.words.length})</span>
                </button>
              `;
            }).join("")}
            <button type="button" class="btn-skill ${selectedPart === "all" ? "active" : ""}" data-pick-subpart="all" style="padding:6px 12px;font-size:13px;">
              Tất cả (${words.length})
            </button>
          </div>

          <button class="btn-outline-teal" id="btn-toggle-meaning" style="padding:6px 12px;font-size:12.5px;flex-shrink:0;">
            ${hideMeaning ? "Hiện nghĩa" : "Ẩn nghĩa tự dò"}
          </button>
        </div>

        <div class="grid-2">
          ${visibleWords.map((w) => {
            const starred = store.state.srs[w.id]?.starred;
            const mastered = store.isMastered(w.id);
            const pronCheck = analyzePronunciationRules(w.korean);
            return `
              <div class="box-kind" style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <span class="ko" style="font-size:22px;font-weight:800;color:var(--primary-1);">${w.korean}</span>
                    ${pronCheck.hasChange ? `<span class="ko" style="font-size:13px;background:var(--primary-3);color:var(--primary-1);padding:2px 8px;border-radius:99px;font-weight:700;">[${pronCheck.pronounced}]</span>` : ""}
                    ${w.pronunciation ? `<span style="font-size:12.5px;color:var(--text-muted);">/${w.pronunciation}/</span>` : ""}
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <button type="button" class="btn-audio" data-audio="${w.wordAudio || ""}" data-tts="${w.korean}" aria-label="Nghe ${w.korean}" title="Nghe phát âm">${ico("speaker", 18)}</button>
                    <button type="button" class="btn-audio" data-star="${w.id}" style="${starred ? "background:#FEF9C3;border-color:#FACC15;" : "opacity:0.55;"}" aria-label="Lưu từ ${w.korean}" title="Đánh dấu sao">${ico("star", 18)}</button>
                    <button type="button" class="btn-audio" data-master="${w.id}" style="${mastered ? "background:#DCFCE7;border-color:#4ADE80;" : "opacity:0.5;"}" aria-label="Đánh dấu thuộc ${w.korean}" title="Đánh dấu đã thuộc">${ico("check", 18)}</button>
                  </div>
                </div>

                <div style="font-size:16px;font-weight:700;color:${hideMeaning ? "transparent;background:#E2E8F0;border-radius:6px;user-select:none" : "var(--text-main)"};">
                  ${w.vietnamese}
                </div>

                ${w.exampleKo ? `
                  <div style="background:var(--bg-body);border:1px solid var(--border-light);border-radius:10px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                    <div>
                      <div class="ko" style="font-size:15px;font-weight:600;color:var(--text-main);">${w.exampleKo}</div>
                      ${!hideMeaning && w.exampleVi ? `<div style="font-size:13px;color:var(--text-muted);margin-top:2px;">${w.exampleVi}</div>` : ""}
                    </div>
                    <button type="button" class="btn-audio" data-audio="${w.exampleAudio || ""}" data-tts="${w.exampleKo}" aria-label="Nghe câu ví dụ" title="Nghe câu ví dụ">${ico("play", 17)}</button>
                  </div>
                ` : ""}

                ${w.note ? `<div style="font-size:12.5px;color:var(--text-muted);">${w.note}</div>` : ""}
              </div>
            `;
          }).join("")}
        </div>

        ${selectedPart !== "all" ? `
          <div style="margin-top:18px;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;">
            ${Number(selectedPart) < subParts.length ? `
              <button type="button" class="btn-outline-teal" id="btn-next-subpart">Qua Phần ${Number(selectedPart) + 1} →</button>
            ` : `
              <button type="button" class="btn-outline-teal" id="btn-go-wb-after-voc">Làm bài tập →</button>
            `}
          </div>
        ` : ""}
      `;

      body.querySelectorAll("[data-pick-subpart]").forEach((b) => {
        b.addEventListener("click", () => {
          const val = b.dataset.pickSubpart;
          if (val === "all") {
            selectedPart = "all";
            renderContent();
          } else {
            navigate("theory", { sub: "lesson-detail", book: bookKey, lesson: lessonNum, tab: "vocab", part: Number(val) });
          }
        });
      });

      body.querySelector("#btn-toggle-meaning").addEventListener("click", () => {
        hideMeaning = !hideMeaning;
        renderContent();
      });

      const bNextP = body.querySelector("#btn-next-subpart");
      if (bNextP) {
        bNextP.addEventListener("click", () => {
          navigate("theory", { sub: "lesson-detail", book: bookKey, lesson: lessonNum, tab: "vocab", part: Number(selectedPart) + 1 });
        });
      }
      const bGoWb = body.querySelector("#btn-go-wb-after-voc");
      if (bGoWb) {
        bGoWb.addEventListener("click", () => {
          navigate("theory", { sub: "lesson-detail", book: bookKey, lesson: lessonNum, tab: "workbook" });
        });
      }

      body.querySelectorAll("[data-audio]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.dataset.audio) playAudio(btn.dataset.audio);
          else speakKoreanTTS(btn.dataset.tts);
        });
      });
      body.querySelectorAll("[data-star]").forEach((btn) => {
        btn.addEventListener("click", () => { store.toggleStar(btn.dataset.star); renderContent(); });
      });
      body.querySelectorAll("[data-master]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.master;
          store.rateCard(id, store.isMastered(id) ? 0 : 3);
          renderContent();
        });
      });
    } else if (normTab === "grammar") {
      const speakers = [...new Set(dialogue.map((d) => d.speaker))];
      body.innerHTML = `
        <div id="inline-lesson-grammar-mount" style="margin-bottom:20px;"></div>

        ${dialogue.length ? `
          <div class="grid-2">
            <div class="box-kind">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
                <h3 style="margin:0;font-size:16px;display:flex;align-items:center;gap:6px;">${ico("chat", 18)} Hội thoại bài khóa</h3>
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                  <button class="btn-outline-teal" data-mute="none" style="padding:3px 9px;font-size:12px;${muteRole === "none" ? "background:var(--primary);color:#FFF;" : ""}">Hiện cả 2</button>
                  ${speakers.map((sp) => `
                    <button class="btn-outline-teal ko" data-mute="${sp}" style="padding:3px 9px;font-size:12px;${muteRole === sp ? "background:var(--primary);color:#FFF;" : ""}">Che ${sp}</button>
                  `).join("")}
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${dialogue.map((line) => `
                  <div style="padding:10px 13px;border-radius:11px;background:${muteRole === line.speaker ? "var(--powder-soft)" : "var(--bg-body)"};border-left:3px solid ${muteRole === line.speaker ? "var(--yellow-2)" : "var(--primary)"};">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <strong class="ko" style="color:var(--primary-4);font-size:13.5px;">${line.speaker}</strong>
                      <button class="btn-audio" style="width:27px;height:27px;" data-speak="${line.ko}">${ico("speaker", 14)}</button>
                    </div>
                    <div class="ko" style="font-size:15.5px;font-weight:600;margin-top:3px;${muteRole === line.speaker ? "filter:blur(4px);cursor:pointer;" : ""}" onclick="this.style.filter='none'">${line.ko}</div>
                    <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">${line.vi}</div>
                  </div>
                `).join("")}
              </div>
            </div>

            <div class="achieve-card" style="justify-content:center;">
              <span class="badge-orange" style="align-self:flex-start;">${ico("kr", 14)} Ghi chú &amp; Mẹo</span>
              <h3 style="margin:4px 0;font-size:17px;">Bài ${String(lessonNum).padStart(2, "0")}: ${lessonTitle}</h3>
              <p style="font-size:14px;line-height:1.62;margin:0;color:var(--text-main);">${culture}</p>
            </div>
          </div>
        ` : ""}
      `;

      renderInlineLessonGrammarSection(body.querySelector("#inline-lesson-grammar-mount"), db, bookKey, lessonNum);
      body.querySelectorAll("[data-mute]").forEach((b) => {
        b.addEventListener("click", () => { muteRole = b.dataset.mute; renderContent(); });
      });
      body.querySelectorAll("[data-speak]").forEach((b) => {
        b.addEventListener("click", () => speakKoreanTTS(b.dataset.speak));
      });
    } else if (normTab === "workbook") {
      renderChapterExercises(body, db, bookKey, lessonNum, "workbook");
    } else if (normTab === "translate") {
      renderChapterExercises(body, db, bookKey, lessonNum, "translate");
    }
  }

  renderContent();
}

// =========================================================================
// VOCABULARY REVIEW ARENA: SCOPED TO SUB-PART SO NEVER OVERWHELMING!
// =========================================================================
function renderVocabReviewArena(root, db, navigate, params = {}) {
  const defaultBook = normalizeBookId(params.book || store.state.roadmapProfile?.startBook || "q1");
  const bookKey = params.book === "sejong1" || params.book === "topik1" ? params.book : defaultBook;
  const bookCur = getBookCurriculum(db, bookKey);
  const fullBookPool = getBookWords(db, bookKey);

  // Determine available lessons in this book
  const lessonNums = [...new Set(fullBookPool.map((w) => w.lesson))].sort((a, b) => a - b);
  const activeLesson = params.lesson && lessonNums.includes(Number(params.lesson))
    ? Number(params.lesson)
    : (lessonNums[0] || 1);

  const lessonWords = fullBookPool.filter((w) => w.lesson === activeLesson);
  const subParts = buildSubPartsForLesson(db, bookKey, activeLesson, lessonWords);
  const activePart = params.part && subParts.some((p) => p.part === Number(params.part))
    ? Number(params.part)
    : (subParts[0]?.part || 1);

  const activePartObj = subParts.find((p) => p.part === activePart) || subParts[0];
  const pool = activePartObj?.words?.length ? activePartObj.words : lessonWords.slice(0, 14);
  const scopeLabel = `${bookCur?.shortTitle || bookKey} · Bài ${String(activeLesson).padStart(2, "0")} · ${activePartObj?.title || `Phần ${activePart}`}`;

  const sortedDeck = [...pool].sort((a, b) => {
    const sa = store.state.srs[a.id];
    const sb = store.state.srs[b.id];
    const starDiff = (sb?.starred ? 1 : 0) - (sa?.starred ? 1 : 0);
    if (starDiff !== 0) return starDiff;
    return (sa?.level || 0) - (sb?.level || 0);
  });

  let mode = params.mode || "flashcard";
  let idx = 0;
  let flipped = false;

  const baseQuizKey = `${bookKey}_b${activeLesson}_p${activePart}`;
  const distractorSource = lessonWords.length >= 4 ? lessonWords : fullBookPool;

  function buildMcqDeck(cards) {
    return cards.map((c) => {
      const distractors = distractorSource
        .filter((w) => w.id !== c.id && w.vietnamese !== c.vietnamese)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const opts = [c, ...distractors].sort(() => Math.random() - 0.5);
      return { card: c, options: opts };
    });
  }

  let mcqDeck = buildMcqDeck(sortedDeck);
  let mcqIdx = 0;
  let mcqPicks = {};
  let mcqSubmitted = false;
  let mcqSummary = null;

  let typingDeck = [...sortedDeck];
  let typingIdx = 0;
  let typingDrafts = {};
  let typingSubmitted = false;
  let typingSummary = null;

  function buildMatchRound() {
    const six = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(6, pool.length));
    const tiles = [
      ...six.map((w) => ({ uid: `k_${w.id}`, pairId: w.id, text: w.korean, isKo: true })),
      ...six.map((w) => ({ uid: `v_${w.id}`, pairId: w.id, text: w.vietnamese, isKo: false }))
    ].sort(() => Math.random() - 0.5);
    return { six, tiles };
  }
  let matchState = { ...buildMatchRound(), matchedIds: new Set(), wrongAttempts: 0, finished: false, score: 0 };

  function renderArena() {
    if (!sortedDeck.length) {
      root.innerHTML = `<div class="container-web"><div class="box-kind">Phần này chưa có thẻ từ vựng.</div></div>`;
      return;
    }

    const finishedFlashcard = mode === "flashcard" && idx >= sortedDeck.length;
    const card = sortedDeck[Math.min(idx, sortedDeck.length - 1)];

    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <button id="bc-back-lesson">← Bài ${String(activeLesson).padStart(2, "0")} (${bookCur?.shortTitle || bookKey})</button>
          <span>/</span>
          <span>${scopeLabel} (${sortedDeck.length} từ)</span>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-bottom:12px;width:100%;max-width:100%;min-width:0;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;width:100%;max-width:100%;min-width:0;">
            <select id="arena-sel-book" class="box-select">
              ${(db.books6 || []).map((b) => `<option value="${b.bookId}" ${b.bookId === bookKey ? "selected" : ""}>${b.shortTitle}</option>`).join("")}
              <option value="sejong1" ${bookKey === "sejong1" ? "selected" : ""}>Giao tiếp Sejong</option>
            </select>

            <select id="arena-sel-lesson" class="box-select">
              ${lessonNums.map((ln) => {
                const chTitle = bookCur?.chapters?.find((c) => c.lesson === ln)?.title || fullBookPool.find((w) => w.lesson === ln)?.lessonTitle || `Bài ${ln}`;
                return `<option value="${ln}" ${ln === activeLesson ? "selected" : ""}>Bài ${String(ln).padStart(2, "0")}: ${chTitle}</option>`;
              }).join("")}
            </select>

            <select id="arena-sel-part" class="box-select">
              ${subParts.map((pt) => `<option value="${pt.part}" ${pt.part === activePart ? "selected" : ""}>${pt.title} (${pt.words.length} từ)</option>`).join("")}
            </select>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
          <div class="skill-pills-row" style="margin-bottom:0;">
            <button type="button" class="btn-skill ${mode === "flashcard" ? "active" : ""}" data-mode="flashcard">Lật thẻ 3D</button>
            <button type="button" class="btn-skill ${mode === "mcq" ? "active" : ""}" data-mode="mcq">Trắc nghiệm</button>
            <button type="button" class="btn-skill ${mode === "typing" ? "active" : ""}" data-mode="typing">Nghe &amp; Gõ</button>
            <button type="button" class="btn-skill ${mode === "match" ? "active" : ""}" data-mode="match">Ghép cặp</button>
          </div>
          ${mode !== "flashcard" ? renderQuizHistoryPillHTML(`vocab_${mode}_${baseQuizKey}`) : ""}
        </div>

        <div id="arena-stage"></div>
      </div>
    `;

    root.querySelector("#bc-back-lesson").addEventListener("click", () => {
      navigate("theory", { sub: "lesson-detail", book: bookKey, lesson: activeLesson, tab: "vocab", part: activePart });
    });
    root.querySelector("#arena-sel-book").addEventListener("change", (e) => {
      navigate("theory", { sub: "vocab-review", book: e.target.value, lesson: 1, part: 1, mode });
    });
    root.querySelector("#arena-sel-lesson").addEventListener("change", (e) => {
      navigate("theory", { sub: "vocab-review", book: bookKey, lesson: Number(e.target.value), part: 1, mode });
    });
    root.querySelector("#arena-sel-part").addEventListener("change", (e) => {
      navigate("theory", { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: Number(e.target.value), mode });
    });
    root.querySelectorAll("[data-mode]").forEach((b) => {
      b.addEventListener("click", () => {
        navigate("theory", { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: activePart, mode: b.dataset.mode });
      });
    });

    const stage = root.querySelector("#arena-stage");

    if (finishedFlashcard) {
      const hasNextPart = activePart < subParts.length;
      const mastNow = sortedDeck.filter((w) => store.isMastered(w.id)).length;
      stage.innerHTML = `
        <div class="box-kind card-pop" style="max-width:560px;margin:0 auto;text-align:center;padding:28px 22px;">
          <span class="badge-orange" style="margin-bottom:8px;">Đã thuộc ${mastNow}/${sortedDeck.length} từ</span>
          <h2 style="margin:0 0 14px;font-size:20px;">Đã lật xong ${sortedDeck.length} thẻ (${activePartObj.title})</h2>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn-primary" id="btn-done-go-mcq">Làm trắc nghiệm tính điểm →</button>
            ${hasNextPart ? `
              <button type="button" class="btn-outline-teal" id="btn-done-next-part">Phần ${activePart + 1} →</button>
            ` : `
              <button type="button" class="btn-outline-teal" id="btn-done-go-wb">Bài tập chương</button>
            `}
            <button type="button" class="btn-outline-teal" id="btn-done-replay">Lật lại</button>
          </div>
        </div>
      `;
      stage.querySelector("#btn-done-replay").addEventListener("click", () => { idx = 0; flipped = false; renderArena(); });
      stage.querySelector("#btn-done-go-mcq").addEventListener("click", () => {
        navigate("theory", { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: activePart, mode: "mcq" });
      });
      stage.querySelector("#btn-done-go-wb")?.addEventListener("click", () => {
        navigate("theory", { sub: "lesson-detail", book: bookKey, lesson: activeLesson, tab: "workbook" });
      });
      stage.querySelector("#btn-done-next-part")?.addEventListener("click", () => {
        navigate("theory", { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: activePart + 1, mode: "flashcard" });
      });
      return;
    }

    if (mode === "flashcard") {
      const upcomingAudio = [];
      for (let k = 0; k < Math.min(9, sortedDeck.length); k++) {
        const c = sortedDeck[(idx + k) % sortedDeck.length];
        if (c?.wordAudio) upcomingAudio.push(c.wordAudio);
        if (c?.exampleAudio) upcomingAudio.push(c.exampleAudio);
      }
      preloadAudioUrls(upcomingAudio);

      const pron = analyzePronunciationRules(card.korean);
      const playCardAudio = () => {
        if (card.wordAudio) playAudio(card.wordAudio);
        else if (card.exampleAudio) playAudio(card.exampleAudio);
        else speakKoreanTTS(card.korean.split("(")[0].trim());
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
        playCardAudio();
      };

      stage.innerHTML = `
        <div class="flashcard-stage card-pop">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:14px;color:var(--text-muted);flex-wrap:wrap;gap:6px;">
            <span><strong>Thẻ ${idx + 1} / ${sortedDeck.length}</strong> · ${activePartObj.title}</span>
            <span>Mức nhớ SRS: Cấp ${store.state.srs[card.id]?.level || 0}/6</span>
          </div>

          <div class="flashcard-3d-scene">
            <div class="flashcard-3d-inner ${flipped ? "is-flipped" : ""}" id="fc-3d-inner">
              <div class="flashcard-face">
                <span style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Chạm thẻ để lật và nghe phát âm</span>
                <div class="ko fc-ko-word" style="color:var(--text-main);margin-bottom:6px;">${card.korean}</div>
                ${pron.hasChange ? `<div class="ko" style="font-size:14px;color:var(--primary-1);font-weight:650;margin-bottom:8px;">[${pron.pronounced}]</div>` : ""}
                <button type="button" class="btn-soft-jade fc-play-trigger" style="margin-top:6px;">
                  ${ico("speaker", 15)} Nghe phát âm <kbd class="keycap">R</kbd>
                </button>
              </div>

              <div class="flashcard-face flashcard-face-back">
                <div class="ko" style="font-size:clamp(19px,5vw,24px);font-weight:750;color:var(--primary-1);">${card.korean}</div>
                <div style="font-size:clamp(17.5px,4.6vw,22px);font-weight:750;color:var(--text-main);margin:4px 0 10px;">${card.vietnamese}</div>
                ${card.exampleKo ? `
                  <div style="background:#F8FAFC;border-radius:12px;padding:10px 14px;width:100%;max-width:480px;margin-bottom:10px;">
                    <div class="ko" style="font-size:15.5px;font-weight:650;color:var(--text-main);">${card.exampleKo}</div>
                    <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">${card.exampleVi || ""}</div>
                  </div>
                ` : ""}
                <button type="button" class="btn-outline-teal fc-ex-trigger" style="padding:6px 13px;font-size:13px;">
                  ${ico("speaker", 14)} Nghe câu ví dụ
                </button>
              </div>
            </div>
          </div>

          <div class="srs-rating-grid">
            <button type="button" class="box-kind clickable srs-btn" data-rate="0">
              <div class="srs-btn-top"><kbd class="keycap keycap-danger">1</kbd><strong style="color:var(--danger);">Quên</strong></div>
              <small style="color:var(--text-muted);">5 phút</small>
            </button>
            <button type="button" class="box-kind clickable srs-btn" data-rate="1">
              <div class="srs-btn-top"><kbd class="keycap keycap-warn">2</kbd><strong style="color:#D97706;">Khó</strong></div>
              <small style="color:var(--text-muted);">12 giờ</small>
            </button>
            <button type="button" class="box-kind clickable srs-btn" data-rate="2">
              <div class="srs-btn-top"><kbd class="keycap keycap-teal">3</kbd><strong style="color:var(--primary-1);">Tốt</strong></div>
              <small style="color:var(--text-muted);">1–3 ngày</small>
            </button>
            <button type="button" class="box-kind clickable srs-btn" data-rate="3">
              <div class="srs-btn-top"><kbd class="keycap keycap-ok">4</kbd><strong style="color:var(--success);">Dễ</strong></div>
              <small style="color:var(--text-muted);">7+ ngày</small>
            </button>
          </div>
        </div>
      `;

      stage.querySelector(".fc-play-trigger").addEventListener("click", (e) => {
        e.stopPropagation();
        playCardAudio();
      });

      const exTrig = stage.querySelector(".fc-ex-trigger");
      if (exTrig) {
        exTrig.addEventListener("click", (e) => {
          e.stopPropagation();
          if (card.exampleAudio) playAudio(card.exampleAudio);
          else if (card.exampleKo) speakKoreanTTS(card.exampleKo);
          else playCardAudio();
        });
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
        if (ev.isComposing || ev.keyCode === 229) return;
        const tag = (document.activeElement?.tagName || "").toUpperCase();
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.getElementById("quick-modal-bg") || document.getElementById("auth-modal-bg")) {
          return;
        }
        if (ev.key === "1" || ev.key === "2" || ev.key === "3" || ev.key === "4") {
          ev.preventDefault();
          triggerRate(Number(ev.key) - 1);
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
      // =====================================================================
      // END-OF-QUIZ GRADED VOCABULARY MCQ (NO INFINITE LOOP, FULL SCORE SHEET)
      // =====================================================================
      const totalQ = mcqDeck.length;
      const answeredCnt = mcqDeck.filter((q) => mcqPicks[q.card.id] !== undefined).length;

      function submitMcqQuiz() {
        let correctCount = 0;
        mcqDeck.forEach((q) => {
          const ok = mcqPicks[q.card.id] === q.card.id;
          if (ok) correctCount += 1;
          store.rateCard(q.card.id, ok ? 2 : 0);
        });
        const finalScore = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
        mcqSubmitted = true;
        mcqSummary = { score: finalScore, correctCount, totalCount: totalQ };
        store.recordScoreHistory({
          quizKey: `vocab_mcq_${baseQuizKey}`,
          category: "Trắc nghiệm từ vựng",
          title: `Trắc nghiệm · ${scopeLabel}`,
          score: finalScore,
          maxScore: 100,
          correctCount,
          totalCount: totalQ,
          route: "theory",
          params: { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: activePart, mode: "mcq" }
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        renderArena();
      }

      if (mcqSubmitted && mcqSummary) {
        if (window._cjduzArenaKeyHandler) {
          window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
          window._cjduzArenaKeyHandler = null;
        }
        const wrongCards = mcqDeck.filter((q) => mcqPicks[q.card.id] !== q.card.id).map((q) => q.card);
        const hasNextPart = activePart < subParts.length;

        stage.innerHTML = `
          <div style="max-width:740px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
            <div class="prediction-banner">
              <div>
                <span class="badge-orange" style="margin-bottom:6px;">Đã lưu vào Lịch sử điểm</span>
                <h2 style="margin:0 0 4px;font-size:21px;color:var(--primary-1);">
                  Điểm số: ${mcqSummary.score} / 100đ · Đúng ${mcqSummary.correctCount}/${mcqSummary.totalCount} câu
                </h2>
                <div style="font-size:13.5px;color:var(--text-muted);">${scopeLabel}</div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${wrongCards.length > 0 ? `
                  <button type="button" class="btn-orange" id="btn-mcq-retry-wrong">Ôn lại ${wrongCards.length} câu sai</button>
                ` : ""}
                <button type="button" class="btn-primary" id="btn-mcq-retake-all">Làm lại bài này</button>
                ${hasNextPart ? `
                  <button type="button" class="btn-outline-teal" id="btn-mcq-next-part">Phần ${activePart + 1} →</button>
                ` : ""}
              </div>
            </div>

            <div class="box-kind">
              <h3 style="margin:0 0 12px;font-size:17px;">Đáp án chi tiết (${mcqDeck.length} câu)</h3>
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${mcqDeck.map((q, qi) => {
                  const pickedId = mcqPicks[q.card.id];
                  const pickedOpt = q.options.find((o) => o.id === pickedId);
                  const isOk = pickedId === q.card.id;
                  return `
                    <div style="padding:12px 14px;border-radius:12px;border:1px solid ${isOk ? "rgba(22,163,74,0.35)" : "rgba(225,29,72,0.35)"};background:${isOk ? "rgba(22,163,74,0.06)" : "rgba(225,29,72,0.05)"};display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                      <div style="min-width:0;flex:1;">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                          <span class="meta-chip">Câu ${qi + 1}</span>
                          <strong class="ko" style="font-size:18px;color:var(--primary-1);">${q.card.korean}</strong>
                          <span style="font-weight:700;color:#14532D;">→ ${q.card.vietnamese}</span>
                        </div>
                        ${!isOk ? `
                          <div style="font-size:13px;color:var(--danger);margin-top:4px;font-weight:600;">
                            Bạn chọn: ${pickedOpt ? pickedOpt.vietnamese : "(Chưa chọn)"}
                          </div>
                        ` : ""}
                        ${q.card.exampleKo ? `<div class="ko" style="font-size:13px;color:var(--text-muted);margin-top:3px;">${q.card.exampleKo} — ${q.card.exampleVi || ""}</div>` : ""}
                      </div>
                      <button type="button" class="btn-audio" aria-label="Nghe ${q.card.korean}" data-rev-aud="${q.card.wordAudio || ""}" data-rev-tts="${q.card.korean}">${ico("speaker", 16)}</button>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>
        `;

        stage.querySelector("#btn-mcq-retake-all").addEventListener("click", () => {
          mcqDeck = buildMcqDeck(sortedDeck);
          mcqIdx = 0;
          mcqPicks = {};
          mcqSubmitted = false;
          mcqSummary = null;
          renderArena();
        });
        stage.querySelector("#btn-mcq-retry-wrong")?.addEventListener("click", () => {
          mcqDeck = buildMcqDeck(wrongCards);
          mcqIdx = 0;
          mcqPicks = {};
          mcqSubmitted = false;
          mcqSummary = null;
          renderArena();
        });
        stage.querySelector("#btn-mcq-next-part")?.addEventListener("click", () => {
          navigate("theory", { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: activePart + 1, mode: "mcq" });
        });
        stage.querySelectorAll("[data-rev-aud]").forEach((b) => {
          b.addEventListener("click", () => {
            if (b.dataset.revAud) playAudio(b.dataset.revAud);
            else speakKoreanTTS(b.dataset.revTts.split("(")[0].trim());
          });
        });
        return;
      }

      const curQ = mcqDeck[mcqIdx];
      const curPicked = mcqPicks[curQ.card.id];

      stage.innerHTML = `
        <div class="flashcard-stage">
          <div class="box-kind" style="padding:24px 20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
              <span style="font-size:14px;font-weight:700;color:var(--primary-1);">Câu ${mcqIdx + 1} / ${totalQ}</span>
              <span style="font-size:13px;color:var(--text-muted);">Đã chọn <strong style="color:var(--text-main);">${answeredCnt}/${totalQ}</strong> câu · Chấm điểm khi nộp bài</span>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-bottom:16px;">
              ${mcqDeck.map((q, qi) => {
                const hasP = mcqPicks[q.card.id] !== undefined;
                const isCur = qi === mcqIdx;
                return `
                  <button type="button" data-jump-mcq="${qi}" style="min-width:34px;height:34px;border-radius:8px;border:${isCur ? "2px solid var(--text-main)" : "1px solid var(--border-card)"};background:${hasP ? "var(--primary)" : "#FFFFFF"};color:${hasP ? "#FFFFFF" : "var(--text-main)"};font-weight:700;font-size:12.5px;cursor:pointer;">
                    ${qi + 1}
                  </button>
                `;
              }).join("")}
            </div>

            <div style="text-align:center;">
              <div class="ko" style="font-size:34px;font-weight:800;color:var(--primary-1);margin-bottom:10px;">${curQ.card.korean}</div>
              <button type="button" class="btn-outline-teal" id="mcq-audio" style="margin-bottom:18px;">
                ${ico("speaker", 17)} Nghe phát âm <kbd class="keycap">R</kbd>
              </button>
            </div>

            <div class="grid-2" style="text-align:left;gap:10px;">
              ${curQ.options.map((opt, i) => `
                <button type="button" class="mcq-opt-btn ${curPicked === opt.id ? "is-selected" : ""}" data-ans="${opt.id}" data-mcq-idx="${i}" style="display:flex;align-items:center;gap:8px;">
                  <kbd class="keycap">${i + 1}</kbd>
                  <span>${opt.vietnamese}</span>
                </button>
              `).join("")}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:20px;padding-top:14px;border-top:1px solid var(--border-light);">
              <button type="button" class="btn-outline-teal" id="mcq-prev-btn" ${mcqIdx === 0 ? "disabled" : ""}>← Câu trước</button>
              <button type="button" class="${answeredCnt === totalQ || mcqIdx === totalQ - 1 ? "btn-primary" : "btn-soft-jade"}" id="mcq-submit-btn">
                Nộp bài &amp; Chấm điểm (${answeredCnt}/${totalQ})
              </button>
              <button type="button" class="btn-outline-teal" id="mcq-next-btn" ${mcqIdx === totalQ - 1 ? "disabled" : ""}>Câu tiếp →</button>
            </div>
          </div>
        </div>
      `;

      const playCurMcqAudio = () => {
        if (curQ.card.wordAudio) playAudio(curQ.card.wordAudio);
        else speakKoreanTTS(curQ.card.korean.split("(")[0].trim());
      };
      stage.querySelector("#mcq-audio").addEventListener("click", playCurMcqAudio);

      const selectMcqOption = (pickedId) => {
        mcqPicks[curQ.card.id] = pickedId;
        const nextUnanswered = mcqDeck.findIndex((q, qi) => qi > mcqIdx && mcqPicks[q.card.id] === undefined);
        if (nextUnanswered !== -1) {
          mcqIdx = nextUnanswered;
        } else if (mcqIdx < totalQ - 1) {
          mcqIdx += 1;
        }
        renderArena();
      };

      stage.querySelectorAll("[data-ans]").forEach((btn) => {
        btn.addEventListener("click", () => selectMcqOption(btn.dataset.ans));
      });
      stage.querySelectorAll("[data-jump-mcq]").forEach((b) => {
        b.addEventListener("click", () => { mcqIdx = Number(b.dataset.jumpMcq); renderArena(); });
      });
      stage.querySelector("#mcq-prev-btn").addEventListener("click", () => {
        if (mcqIdx > 0) { mcqIdx -= 1; renderArena(); }
      });
      stage.querySelector("#mcq-next-btn").addEventListener("click", () => {
        if (mcqIdx < totalQ - 1) { mcqIdx += 1; renderArena(); }
      });
      stage.querySelector("#mcq-submit-btn").addEventListener("click", submitMcqQuiz);

      if (window._cjduzArenaKeyHandler) {
        window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
      }
      window._cjduzArenaKeyHandler = (ev) => {
        if (!document.body.contains(stage)) {
          window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
          return;
        }
        if (ev.isComposing || ev.keyCode === 229) return;
        const tag = (document.activeElement?.tagName || "").toUpperCase();
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.getElementById("quick-modal-bg") || document.getElementById("auth-modal-bg")) return;
        if (["1", "2", "3", "4"].includes(ev.key)) {
          const opt = curQ.options[Number(ev.key) - 1];
          if (opt) { ev.preventDefault(); selectMcqOption(opt.id); }
        } else if (ev.key === "ArrowLeft" && mcqIdx > 0) {
          ev.preventDefault(); mcqIdx -= 1; renderArena();
        } else if (ev.key === "ArrowRight" && mcqIdx < totalQ - 1) {
          ev.preventDefault(); mcqIdx += 1; renderArena();
        } else if (ev.key === "r" || ev.key === "R") {
          ev.preventDefault(); playCurMcqAudio();
        }
      };
      window.addEventListener("keydown", window._cjduzArenaKeyHandler);
    } else if (mode === "typing") {
      // =====================================================================
      // END-OF-QUIZ GRADED TYPING ARENA (1..N, NO INFINITE LOOP, SCORE SAVED)
      // =====================================================================
      if (window._cjduzArenaKeyHandler) {
        window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
        window._cjduzArenaKeyHandler = null;
      }

      const totalT = typingDeck.length;
      const cleanTarget = (s) => (s || "").split("(")[0].trim().replace(/[?.!,]/g, "");

      function submitTypingQuiz() {
        const liveInp = stage.querySelector("#ko-type-input");
        if (liveInp && typingDeck[typingIdx]) {
          typingDrafts[typingDeck[typingIdx].id] = liveInp.value;
        }
        let correctCount = 0;
        typingDeck.forEach((c) => {
          const u = cleanTarget(typingDrafts[c.id] || "");
          const ok = u.length > 0 && u === cleanTarget(c.korean);
          if (ok) correctCount += 1;
          store.rateCard(c.id, ok ? 3 : 0);
        });
        const finalScore = totalT > 0 ? Math.round((correctCount / totalT) * 100) : 0;
        typingSubmitted = true;
        typingSummary = { score: finalScore, correctCount, totalCount: totalT };
        store.recordScoreHistory({
          quizKey: `vocab_typing_${baseQuizKey}`,
          category: "Nghe & Gõ từ vựng",
          title: `Nghe & Gõ · ${scopeLabel}`,
          score: finalScore,
          maxScore: 100,
          correctCount,
          totalCount: totalT,
          route: "theory",
          params: { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: activePart, mode: "typing" }
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        renderArena();
      }

      if (typingSubmitted && typingSummary) {
        const wrongTyping = typingDeck.filter((c) => cleanTarget(typingDrafts[c.id] || "") !== cleanTarget(c.korean));
        stage.innerHTML = `
          <div style="max-width:740px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
            <div class="prediction-banner">
              <div>
                <span class="badge-orange" style="margin-bottom:6px;">Đã lưu vào Lịch sử điểm</span>
                <h2 style="margin:0 0 4px;font-size:21px;color:var(--primary-1);">
                  Điểm số: ${typingSummary.score} / 100đ · Đúng ${typingSummary.correctCount}/${typingSummary.totalCount} từ
                </h2>
                <div style="font-size:13.5px;color:var(--text-muted);">${scopeLabel}</div>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                ${wrongTyping.length > 0 ? `
                  <button type="button" class="btn-orange" id="btn-typ-retry-wrong">Gõ lại ${wrongTyping.length} từ sai</button>
                ` : ""}
                <button type="button" class="btn-primary" id="btn-typ-retake">Làm lại bài này</button>
              </div>
            </div>

            <div class="box-kind">
              <h3 style="margin:0 0 12px;font-size:17px;">Đáp án chi tiết (${totalT} từ)</h3>
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${typingDeck.map((c, ci) => {
                  const targetW = cleanTarget(c.korean);
                  const userW = (typingDrafts[c.id] || "").trim();
                  const ok = cleanTarget(userW) === targetW;
                  return `
                    <div style="padding:11px 14px;border-radius:11px;border:1px solid ${ok ? "rgba(22,163,74,0.35)" : "rgba(225,29,72,0.35)"};background:${ok ? "rgba(22,163,74,0.06)" : "rgba(225,29,72,0.05)"};display:flex;justify-content:space-between;align-items:center;gap:10px;">
                      <div>
                        <div>
                          <span class="meta-chip">Từ ${ci + 1}</span>
                          <strong style="margin-left:6px;">${c.vietnamese}</strong> → <strong class="ko" style="font-size:18px;color:var(--primary-1);">${targetW}</strong>
                        </div>
                        ${!ok ? `<div class="ko" style="font-size:13px;color:var(--danger);margin-top:3px;">Bạn gõ: ${userW || "(Bỏ trống)"}</div>` : ""}
                      </div>
                      <button type="button" class="btn-audio" aria-label="Nghe ${targetW}" data-taud="${c.wordAudio || ""}" data-ttts="${targetW}">${ico("speaker", 16)}</button>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </div>
        `;
        stage.querySelector("#btn-typ-retake").addEventListener("click", () => {
          typingDeck = [...sortedDeck];
          typingIdx = 0;
          typingDrafts = {};
          typingSubmitted = false;
          typingSummary = null;
          renderArena();
        });
        stage.querySelector("#btn-typ-retry-wrong")?.addEventListener("click", () => {
          typingDeck = [...wrongTyping];
          typingIdx = 0;
          typingDrafts = {};
          typingSubmitted = false;
          typingSummary = null;
          renderArena();
        });
        stage.querySelectorAll("[data-taud]").forEach((b) => {
          b.addEventListener("click", () => {
            if (b.dataset.taud) playAudio(b.dataset.taud);
            else speakKoreanTTS(b.dataset.ttts);
          });
        });
        return;
      }

      const tCard = typingDeck[typingIdx];
      const cleanTargetWord = cleanTarget(tCard.korean);
      const filledCount = typingDeck.filter((c) => (typingDrafts[c.id] || "").trim().length > 0).length;

      stage.innerHTML = `
        <div class="flashcard-stage">
          <div class="box-kind" style="padding:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
              <span style="font-size:14px;font-weight:700;color:var(--primary-1);">Từ ${typingIdx + 1} / ${totalT}</span>
              <span style="font-size:13px;color:var(--text-muted);">Đã gõ ${filledCount}/${totalT} · Chấm điểm cuối bài</span>
            </div>

            <div style="text-align:center;">
              <div style="font-size:23px;font-weight:800;margin-bottom:10px;">${tCard.vietnamese}</div>
              <button type="button" class="btn-soft-jade" id="type-play-btn" style="margin-bottom:16px;">${ico("speaker", 17)} Nghe gợi ý</button>
            </div>

            <input id="ko-type-input" class="ko" type="text" value="${(typingDrafts[tCard.id] || "").replace(/"/g, "&quot;")}" placeholder="Gõ từ tiếng Hàn (Enter để qua từ tiếp)..." style="width:100%;padding:12px 15px;font-size:18px;font-weight:700;margin-bottom:14px;" />

            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
              <button type="button" class="btn-outline-teal" id="typ-prev-btn" ${typingIdx === 0 ? "disabled" : ""}>← Từ trước</button>
              <button type="button" class="btn-primary" id="typ-submit-btn">Nộp bài &amp; Chấm điểm</button>
              <button type="button" class="btn-outline-teal" id="typ-next-btn" ${typingIdx === totalT - 1 ? "disabled" : ""}>Từ tiếp →</button>
            </div>

            <div class="kr-keyboard">
              ${HANGEUL_DATA.keyboardRows.map((row) => `
                <div class="kr-key-row">
                  ${row.map((cell) => `<button type="button" class="kr-key" data-jamo="${cell.k}"><span>${cell.k}</span><small>${cell.en}</small></button>`).join("")}
                </div>
              `).join("")}
              <div class="kr-key-row">
                <button type="button" class="kr-key" data-special="space" style="min-width:140px;">Space</button>
                <button type="button" class="kr-key" data-special="back" style="min-width:90px;">Xóa</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const inp = stage.querySelector("#ko-type-input");
      const playFn = () => { if (tCard.wordAudio) playAudio(tCard.wordAudio); else speakKoreanTTS(cleanTargetWord); };
      stage.querySelector("#type-play-btn").addEventListener("click", playFn);
      playFn();
      inp.focus();

      inp.addEventListener("input", (e) => {
        typingDrafts[tCard.id] = e.target.value;
      });
      stage.querySelectorAll("[data-jamo]").forEach((k) => {
        k.addEventListener("click", () => {
          inp.value = appendJamoToText(inp.value, k.dataset.jamo);
          typingDrafts[tCard.id] = inp.value;
          inp.focus();
        });
      });
      stage.querySelectorAll("[data-special]").forEach((k) => {
        k.addEventListener("click", () => {
          if (k.dataset.special === "space") inp.value += " ";
          if (k.dataset.special === "back") inp.value = inp.value.slice(0, -1);
          typingDrafts[tCard.id] = inp.value;
          inp.focus();
        });
      });

      const advanceOrSubmit = () => {
        typingDrafts[tCard.id] = inp.value;
        if (typingIdx < totalT - 1) {
          typingIdx += 1;
          renderArena();
        } else {
          submitTypingQuiz();
        }
      };
      bindHangulEnter(inp, advanceOrSubmit);
      stage.querySelector("#typ-prev-btn").addEventListener("click", () => {
        typingDrafts[tCard.id] = inp.value;
        if (typingIdx > 0) { typingIdx -= 1; renderArena(); }
      });
      stage.querySelector("#typ-next-btn").addEventListener("click", () => {
        typingDrafts[tCard.id] = inp.value;
        if (typingIdx < totalT - 1) { typingIdx += 1; renderArena(); }
      });
      stage.querySelector("#typ-submit-btn").addEventListener("click", submitTypingQuiz);
    } else if (mode === "match") {
      // =====================================================================
      // END-OF-ROUND GRADED MATCH GAME (NO SILENT LOOP, SCORE SAVED)
      // =====================================================================
      if (window._cjduzArenaKeyHandler) {
        window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
        window._cjduzArenaKeyHandler = null;
      }

      if (matchState.finished) {
        const hasNextPart = activePart < subParts.length;
        stage.innerHTML = `
          <div class="box-kind card-pop" style="max-width:600px;margin:0 auto;text-align:center;padding:28px 24px;">
            <span class="badge-orange" style="margin-bottom:8px;">Đã lưu vào Lịch sử điểm</span>
            <h2 style="margin:0 0 6px;font-size:22px;color:var(--primary-1);">Điểm ghép cặp: ${matchState.score} / 100đ</h2>
            <p style="margin:0 0 18px;font-size:14px;color:var(--text-muted);">
              Ghép đúng ${matchState.six.length}/${matchState.six.length} cặp từ · Số lần chọn nhầm: ${matchState.wrongAttempts}
            </p>
            <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
              <button type="button" class="btn-primary" id="btn-match-new">Chơi ván mới</button>
              ${hasNextPart ? `<button type="button" class="btn-outline-teal" id="btn-match-next-part">Phần ${activePart + 1} →</button>` : ""}
            </div>
          </div>
        `;
        stage.querySelector("#btn-match-new").addEventListener("click", () => {
          matchState = { ...buildMatchRound(), matchedIds: new Set(), wrongAttempts: 0, finished: false, score: 0 };
          renderArena();
        });
        stage.querySelector("#btn-match-next-part")?.addEventListener("click", () => {
          navigate("theory", { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: activePart + 1, mode: "match" });
        });
        return;
      }

      let firstPick = null;
      stage.innerHTML = `
        <div class="box-kind">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
            <strong style="font-size:14.5px;">Ghép ${matchState.six.length} cặp từ tiếng Hàn – Việt (${activePartObj.title})</strong>
            <button type="button" class="btn-outline-teal nw" id="match-reload">Đổi ván</button>
          </div>
          <div class="match-board-grid" id="match-grid">
            ${matchState.tiles.map((t) => {
              const done = matchState.matchedIds.has(t.pairId);
              return `
                <button type="button" class="box-kind clickable ${t.isKo ? "ko" : ""}" data-uid="${t.uid}" data-pair="${t.pairId}" ${done ? "disabled" : ""} style="text-align:center;font-weight:${t.isKo ? "750" : "600"};font-size:${t.isKo ? "clamp(16px,4.3vw,19px)" : "14px"};min-height:66px;padding:10px;${done ? "background:rgba(22,163,74,0.12);border-color:var(--success);" : ""}">
                  ${t.text}
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;

      stage.querySelector("#match-reload").addEventListener("click", () => {
        matchState = { ...buildMatchRound(), matchedIds: new Set(), wrongAttempts: 0, finished: false, score: 0 };
        renderArena();
      });
      stage.querySelectorAll("[data-uid]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.disabled) return;
          if (!firstPick) {
            firstPick = btn;
            btn.style.borderColor = "var(--primary)";
            btn.style.background = "var(--primary-3)";
            return;
          }
          if (firstPick === btn) return;
          if (firstPick.dataset.pair === btn.dataset.pair) {
            const pid = btn.dataset.pair;
            matchState.matchedIds.add(pid);
            store.rateCard(pid, 2);
            firstPick = null;
            if (matchState.matchedIds.size === matchState.six.length) {
              const finalScore = Math.max(40, 100 - matchState.wrongAttempts * 10);
              matchState.finished = true;
              matchState.score = finalScore;
              store.recordScoreHistory({
                quizKey: `vocab_match_${baseQuizKey}`,
                category: "Ghép cặp từ vựng",
                title: `Ghép cặp · ${scopeLabel}`,
                score: finalScore,
                maxScore: 100,
                correctCount: matchState.six.length,
                totalCount: matchState.six.length,
                route: "theory",
                params: { sub: "vocab-review", book: bookKey, lesson: activeLesson, part: activePart, mode: "match" }
              });
            }
            renderArena();
          } else {
            matchState.wrongAttempts += 1;
            const prev = firstPick;
            firstPick = null;
            btn.style.borderColor = "var(--danger)";
            setTimeout(() => {
              prev.style.borderColor = "var(--border-card)";
              prev.style.background = "#FFFFFF";
              btn.style.borderColor = "var(--border-card)";
            }, 350);
          }
        });
      });
    }
  }

  renderArena();
}

function renderHangeulLab(root, navigate) {
  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button id="bc-theory">Lý thuyết</button><span>/</span><span>Phòng Lab Hangeul &amp; 7 Quy tắc Biến âm</span>
      </div>

      <div class="outline-ai" style="margin-bottom:26px;">
        <h3 style="margin:0 0 8px;display:flex;align-items:center;gap:8px;">${ico("search", 21)} Máy soi 7 Quy tắc Biến âm Tiếng Hàn tự động</h3>
        <p style="margin:0 0 12px;font-size:14.5px;color:var(--text-muted);">
          Nhập hoặc bấm thử các từ bên dưới để xem cách chuyển từ mặt chữ Hangeul sang phát âm chuẩn bản xứ:
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          ${["독일", "학교", "안녕하십니까", "같이", "설날", "좋다", "읽습니다", "한국어"].map((sample) => `
            <button type="button" class="btn-outline-teal ko" data-sample="${sample}" style="padding:5px 13px;font-size:14px;">${sample}</button>
          `).join("")}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <input id="pron-input" class="ko" value="안녕하십니까" style="flex:1 1 180px;min-width:0;width:100%;padding:10px 16px;font-size:17px;font-weight:700;" />
          <button class="btn-primary" id="pron-speak" style="white-space:nowrap;flex-shrink:0;">Đọc mẫu</button>
        </div>
        <div id="pron-result" style="margin-top:14px;"></div>
      </div>

      <div class="section-head"><h2>14 Phụ âm cơ bản &amp; 5 Phụ âm căng (Bấm thẻ để nghe)</h2></div>
      <div class="hangeul-grid">
        ${[...HANGEUL_DATA.basicConsonants, ...HANGEUL_DATA.tenseConsonants].map((c) => `
          <div class="box-kind clickable" data-speak="${c.sample.split("(")[0].trim()}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
              <span class="ko" style="font-size:clamp(24px,6vw,32px);font-weight:800;color:var(--primary-1);">${c.ch}</span>
              <span class="badge-orange">${c.sound}</span>
            </div>
            <div style="font-weight:600;margin-top:4px;font-size:13.5px;">${c.name} · <span class="ko">${c.sample}</span></div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">${c.tip}</div>
          </div>
        `).join("")}
      </div>

      <div class="section-head"><h2>Nguyên âm đơn &amp; Nguyên âm ghép</h2></div>
      <div class="hangeul-grid">
        ${HANGEUL_DATA.vowels.map((v) => `
          <div class="box-kind clickable" data-speak="${v.sample.split("(")[0].trim()}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
              <span class="ko" style="font-size:clamp(22px,5.6vw,28px);font-weight:800;color:var(--primary-1);">${v.ch}</span>
              <span style="font-weight:700;color:var(--primary-1);font-size:13px;">[${v.sound}]</span>
            </div>
            <div style="font-size:13px;margin-top:5px;">Ví dụ: <strong class="ko">${v.sample}</strong></div>
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
      <div style="background:var(--bg-body);border:1px solid var(--border-card);padding:14px 18px;border-radius:12px;">
        <div style="font-size:18px;">Chữ viết: <strong class="ko">${res.original}</strong> → Phát âm chuẩn: <strong class="ko" style="color:var(--primary);font-size:22px;">[${res.pronounced}]</strong></div>
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

function renderFrequentTopikView(root, navigate) {
  let cat = "all";
  function render() {
    const items = FREQUENT_TOPIK_EXPRESSIONS.filter((x) => cat === "all" || x.category === cat);
    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <button id="bc-theory">Lý thuyết</button><span>/</span><span>Biểu hiện thường gặp TOPIK 1 &amp; 2</span>
        </div>

        <div class="section-head" style="margin-top:0;">
          <h2>Kho Câu &amp; Biểu Hiện Thường Gặp Nhất Đề Thi TOPIK 1 &amp; 2</h2>
        </div>

        <div class="skill-pills-row">
          <button class="btn-skill ${cat === "all" ? "active" : ""}" data-cat="all">Tất cả (${FREQUENT_TOPIK_EXPRESSIONS.length})</button>
          <button class="btn-skill ${cat === "dialogue" ? "active" : ""}" data-cat="dialogue">Hội thoại Nghe</button>
          <button class="btn-skill ${cat === "conjunction" ? "active" : ""}" data-cat="conjunction">Phó từ liên kết</button>
          <button class="btn-skill ${cat === "synonym" ? "active" : ""}" data-cat="synonym">Cặp Đồng nghĩa</button>
          <button class="btn-skill ${cat === "idiom" ? "active" : ""}" data-cat="idiom">Quán dụng ngữ</button>
        </div>

        <div class="grid-2">
          ${items.map((item) => `
            <div class="box-kind">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
                <strong class="ko" style="font-size:19px;color:var(--primary-1);">${item.ko}</strong>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                  <span class="badge-orange">${item.level}</span>
                  <button class="btn-audio" data-speak="${item.ko.split("＝")[0].split("/")[0].trim()}">${ico("speaker", 18)}</button>
                </div>
              </div>
              <div style="font-weight:700;margin-bottom:6px;">${item.vi}</div>
              <div class="ko" style="font-size:14px;color:var(--text-muted);background:var(--bg-body);padding:8px 12px;border-radius:8px;margin-bottom:8px;">
                Ví dụ: ${item.usage}
              </div>
              <div style="font-size:13px;color:var(--primary-4);background:var(--primary-3);padding:6px 10px;border-radius:8px;display:flex;align-items:center;gap:6px;">
                ${ico("target", 16)} <span><strong>Mẹo phòng thi:</strong> ${item.tip}</span>
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

function renderHanjaView(root, navigate) {
  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button id="bc-theory">Lý thuyết</button><span>/</span><span>Sơ đồ Gốc từ Âm Hán – Hàn</span>
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
                <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-body);padding:8px 12px;border-radius:8px;">
                  <div>
                    <strong class="ko" style="font-size:16px;color:var(--text-main);">${w.ko}</strong>
                    <span style="font-size:13px;color:var(--primary);font-weight:700;margin:0 6px;">[${w.hv}]</span>
                    <span style="font-size:14px;color:var(--text-muted);">— ${w.vi}</span>
                  </div>
                  <button class="btn-audio" style="width:28px;height:28px;" data-speak="${w.ko}">${ico("speaker", 15)}</button>
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
