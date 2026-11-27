import { store, normalizeBookId, getBookWords, getBookCurriculum, playAudio, preloadAudioUrls, speakKoreanTTS, bindHangulEnter, renderExplainDisclosure, renderQuizHistoryPillHTML } from "./store.js?v=20261127-12";
import { appendJamoToText } from "./korean-engine.js?v=20261127-12";
import { HANGEUL_DATA } from "./curated-content.js?v=20261127-12";
import { ico } from "./icons.js?v=20261127-12";

/**
 * Interactive Workbook (익힘책 · Sách Bài Tập) for ALL 6 BOOKS (Quyển 1 -> Quyển 6):
 *   - Section 1 ("workbook"): Bài tập Từ vựng & Biến đổi Ngữ pháp chuẩn Sách bài tập
 *   - Section 2 ("translate"): Luyện Dịch Câu Việt → Hàn (Ghép cụm từ & Tự gõ câu)
 *   - Section 3 ("topik"): Bài tập Đọc – Nghe chuẩn cấu trúc TOPIK của chương
 */
export function renderChapterExercises(container, db, bookKey, lessonNum, initialSection = "workbook") {
  const normBook = normalizeBookId(bookKey);
  const bookCur = getBookCurriculum(db, bookKey);
  const chapObj = bookCur?.chapters?.find((c) => c.lesson === lessonNum);
  const pool = getBookWords(db, bookKey);

  const lessonWords = pool.filter((w) => w.lesson === lessonNum);
  const lessonGrammars = chapObj?.textbook?.grammars || (normBook === "q1" ? db.sc1Grammar.filter((g) => g.lesson === lessonNum) : []);
  const customWb = chapObj?.workbook?.vocabGrammarDrills || [];
  const dlgLines = chapObj?.textbook?.dialogue || [];

  // 1. Build Workbook Section I: Sách Bài Tập Từ vựng & Ngữ pháp (익힘책)
  const workbookDrills = [
    ...customWb.map((d, idx) => {
      // Deterministic option rotation so answer isn't always index 0!
      const tagged = d.opts.map((txt, oi) => ({ txt, isAns: oi === (d.ans || 0) }));
      const shift = (lessonNum + idx + 1) % tagged.length;
      const rotated = [...tagged.slice(shift), ...tagged.slice(0, shift)];
      return {
        id: `wb_custom_${normBook}_${lessonNum}_${idx}`,
        badge: "익힘책 · Bài tập Ngữ pháp & Cách dùng",
        question: d.q,
        passage: "",
        options: rotated.map((r) => r.txt),
        answer: rotated.findIndex((r) => r.isAns),
        explain: d.exp
      };
    })
  ];

  // Add 4 Vocabulary Context Cloze Workbook items from chapter words
  lessonWords
    .filter((w) => w.exampleKo && w.exampleVi)
    .slice(0, 5)
    .forEach((w, idx) => {
      const targetClean = w.korean.split("(")[0].replace(/\?/g, "").trim();
      const hasDirect = w.exampleKo.includes(targetClean);
      const distractors = lessonWords
        .filter((o) => o.id !== w.id && o.korean !== w.korean)
        .slice((idx * 3) % Math.max(1, lessonWords.length - 3), ((idx * 3) % Math.max(1, lessonWords.length - 3)) + 3);
      while (distractors.length < 3 && pool.length > 5) {
        const fallback = pool[(idx * 11 + distractors.length * 7) % pool.length];
        if (fallback.korean !== w.korean) distractors.push(fallback);
        else break;
      }
      const rawOpts = hasDirect
        ? [targetClean, ...distractors.map((d) => d.korean.split("(")[0].trim())]
        : [w.vietnamese, ...distractors.map((d) => d.vietnamese)];
      const tagged = rawOpts.slice(0, 4).map((txt, oi) => ({ txt, isAns: oi === 0 }));
      const shift = (lessonNum + idx + 2) % tagged.length;
      const rotated = [...tagged.slice(shift), ...tagged.slice(0, shift)];

      workbookDrills.push({
        id: `wb_voc_${normBook}_${lessonNum}_${idx}`,
        badge: "Từ vựng",
        audioSrc: w.exampleAudio || w.wordAudio || "",
        question: hasDirect
          ? `Chọn từ vựng phù hợp điền vào chỗ trống:`
          : `Nghĩa của từ '${w.korean}' trong câu dưới là:`,
        passage: hasDirect
          ? `${w.exampleKo.replace(targetClean, "(          )")}\n→ ${w.exampleVi}`
          : `${w.exampleKo}`,
        options: rotated.map((r) => r.txt),
        answer: rotated.findIndex((r) => r.isAns),
        explain: `${w.korean} = ${w.vietnamese}. Câu đầy đủ: "${w.exampleKo}".`
      });
    });

  // 2. Build Workbook Section II: Sentence Translation (Việt -> Hàn)
  const translationItems = [
    ...lessonGrammars.flatMap((g) => {
      const arr = [];
      if (g.example1Ko && g.example1Vi) {
        arr.push({
          id: `tr_g1_${g.id || g.pattern}`,
          vi: g.example1Vi,
          ko: g.example1Ko,
          audio: g.example1Audio || "",
          hint: `Áp dụng ngữ pháp: ${g.pattern} (${g.meaning})`
        });
      }
      if (g.example2Ko && g.example2Vi) {
        arr.push({
          id: `tr_g2_${g.id || g.pattern}`,
          vi: g.example2Vi,
          ko: g.example2Ko,
          audio: g.example2Audio || "",
          hint: `Công thức: ${g.construction}`
        });
      }
      return arr;
    }),
    ...dlgLines.slice(0, 3).map((d, di) => ({
      id: `tr_dlg_${normBook}_${lessonNum}_${di}`,
      vi: d.vi,
      ko: d.ko,
      audio: "",
      hint: `Câu hội thoại bài khóa (${d.speaker})`
    })),
    ...lessonWords
      .filter((w) => w.exampleKo && w.exampleVi && w.exampleKo.trim().includes(" "))
      .slice(0, 10)
      .map((w) => ({
        id: `tr_w_${w.id}`,
        vi: w.exampleVi,
        ko: w.exampleKo,
        audio: w.exampleAudio || "",
        hint: `Từ khóa: ${w.korean} (${w.vietnamese})`
      }))
  ];

  // 3. Build Section III: Chapter TOPIK-Structured Reading & Listening Drills
  const topikDrills = [];
  lessonWords
    .filter((w) => w.exampleKo && w.exampleVi)
    .slice(0, 5)
    .forEach((w, i) => {
      const distractors = lessonWords
        .filter((o) => o.id !== w.id && o.exampleVi && o.exampleVi !== w.exampleVi)
        .slice(i, i + 3);
      while (distractors.length < 3 && db.sc1Vocab.length > 10) {
        const cand = db.sc1Vocab[(i * 7 + distractors.length * 13) % db.sc1Vocab.length];
        if (cand.exampleVi && cand.exampleVi !== w.exampleVi) distractors.push(cand);
        else break;
      }
      const opts = [w.exampleVi, ...distractors.map((d) => d.exampleVi)].slice(0, 4);
      const rotated = opts.map((val, idx) => ({ val, isAns: idx === 0 }));
      const shift = (lessonNum + i) % rotated.length;
      const finalOpts = [...rotated.slice(shift), ...rotated.slice(0, shift)];

      topikDrills.push({
        id: `ch_tp_${normBook}_${lessonNum}_${i}`,
        typeBadge: w.exampleAudio ? "듣기 · Nghe hiểu chuẩn TOPIK" : "읽기 · Đọc hiểu chuẩn TOPIK",
        audioSrc: w.exampleAudio || "",
        audioText: w.exampleKo,
        question: w.exampleAudio
          ? "다음 문장을 듣고 의미가 같은 것을 고르십시오 (Nghe câu và chọn nghĩa đúng):"
          : "다음 문장과 의미가 같은 것을 고르십시오 (Đọc câu tiếng Hàn và chọn nội dung khớp):",
        passage: w.exampleAudio ? "" : w.exampleKo,
        options: finalOpts.map((o) => o.val),
        answer: finalOpts.findIndex((o) => o.isAns),
        explain: `Câu gốc: "${w.exampleKo}" → ${w.exampleVi} (${w.korean}: ${w.vietnamese}).`
      });
    });

  preloadAudioUrls([
    ...workbookDrills.slice(0, 4).map((d) => d.audioSrc),
    ...translationItems.slice(0, 4).map((t) => t.audio),
    ...topikDrills.slice(0, 4).map((q) => q.audioSrc)
  ]);

  function unpackSavedMcq(raw) {
    if (!raw || typeof raw !== "object") return { submitted: false, picks: {} };
    if ("picks" in raw && raw.picks && typeof raw.picks === "object") {
      return { submitted: Boolean(raw.submitted), picks: { ...raw.picks } };
    }
    const entries = Object.entries(raw).filter(([k]) => k !== "submitted");
    return { submitted: entries.length > 0, picks: Object.fromEntries(entries) };
  }

  const chapterStateKey = `${normBook}_${lessonNum}`;
  let exSection = ["workbook", "translate", "topik"].includes(initialSection) ? initialSection : "workbook";
  let transMode = "blocks";
  let trIdx = 0;
  let selectedBlocks = [];
  let typingDraft = "";
  let showKeyboard = false;
  let trChecked = null;
  let trSummaryShown = false;
  const trResults = {};
  const trCountedIds = new Set();

  const initWb = unpackSavedMcq(store.state.workbookAnswers?.[chapterStateKey]);
  const initTopik = unpackSavedMcq(store.state.topikDrillAnswers?.[chapterStateKey]);
  let wbSubmitted = initWb.submitted;
  let topikSubmitted = initTopik.submitted;
  const pickedWb = initWb.picks;
  const pickedTopik = initTopik.picks;

  function normalizeKo(s) {
    return (s || "").replace(/[.?!,~"']/g, "").replace(/\s+/g, " ").trim();
  }

  function buildWordBank(targetSentence, seedIdx) {
    const realTokens = targetSentence.trim().split(/\s+/);
    const extraDistractors = ["학교에", "집에서", "안", "없습니다.", "입니까?"].filter((d) => !realTokens.includes(d)).slice(0, 2);
    const combined = [...realTokens, ...extraDistractors].map((tok, i) => ({ id: `blk_${i}`, text: tok }));
    return combined.sort((a, b) => ((a.text.charCodeAt(0) * 17 + seedIdx) % 11) - ((b.text.charCodeAt(0) * 17 + seedIdx) % 11));
  }

  function renderMcqList(stage, list, pickedMap, isWorkbook) {
    const isSubmitted = isWorkbook ? wbSubmitted : topikSubmitted;
    const quizKey = isWorkbook ? `wb_${chapterStateKey}` : `ch_topik_${chapterStateKey}`;
    const doneCnt = list.filter((q) => pickedMap[q.id] !== undefined).length;
    const correctCnt = list.filter((q) => pickedMap[q.id] === q.answer).length;
    const pctScore = list.length > 0 ? Math.round((correctCnt / list.length) * 100) : 0;
    const histPill = renderQuizHistoryPillHTML(quizKey);

    stage.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="box-kind" style="background:var(--primary-3);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding:14px 16px;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <strong style="color:var(--primary-4);font-size:15px;">
              ${isSubmitted
                ? `Điểm số: ${pctScore}/100đ · Đúng ${correctCnt}/${list.length} câu`
                : `Đã chọn ${doneCnt}/${list.length} câu · Chọn đáp án rồi bấm Nộp bài để chấm điểm`}
            </strong>
            ${histPill ? `<div>${histPill}</div>` : ""}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${!isSubmitted ? `
              <button type="button" class="btn-primary" data-submit-mcq="1" ${doneCnt === 0 ? "disabled" : ""}>
                Nộp bài &amp; Chấm điểm
              </button>
            ` : `
              <button type="button" class="btn-outline-teal" id="btn-reset-mcq-sec">
                Làm lại
              </button>
            `}
          </div>
        </div>

        ${list.map((q, qi) => {
          const userPick = pickedMap[q.id];
          const answered = userPick !== undefined;
          const ansNum = ["①", "②", "③", "④"][q.answer] || `${q.answer + 1}`;
          return `
            <div class="box-kind" style="padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
                <span class="meta-chip" style="color:var(--primary-1);">Câu ${qi + 1}/${list.length}</span>
                ${q.audioSrc ? `<button type="button" class="btn-soft-jade" data-ex-aud="${q.audioSrc}" aria-label="Nghe câu ${qi + 1}">${ico("speaker", 15)} Nghe</button>` : ""}
              </div>
              <div style="font-weight:700;font-size:15.5px;margin-bottom:10px;">${q.question}</div>
              ${q.passage ? `<pre class="ko" style="white-space:pre-wrap;background:var(--bg-body);border:1px solid var(--border-card);padding:12px 14px;border-radius:12px;font-size:16px;margin:0 0 12px;">${q.passage}</pre>` : ""}

              <div class="grid-2" style="gap:10px;">
                ${q.options.map((opt, oi) => {
                  let cls = "mcq-opt-btn";
                  if (isSubmitted) {
                    if (oi === q.answer) cls += " is-correct";
                    else if (oi === userPick) cls += " is-wrong";
                  } else if (oi === userPick) {
                    cls += " is-selected";
                  }
                  return `
                    <button type="button" class="ko ${cls}" data-qpick="${q.id}" data-oi="${oi}" ${isSubmitted ? "disabled" : ""}>
                      ${["①", "②", "③", "④"][oi]} ${opt}
                    </button>
                  `;
                }).join("")}
              </div>

              ${isSubmitted ? renderExplainDisclosure({
                isCorrect: userPick === q.answer,
                statusHtml: userPick === q.answer
                  ? "Chính xác"
                  : (answered ? `Chưa đúng · Đáp án ${ansNum}` : `Chưa chọn · Đáp án ${ansNum}`),
                explainHtml: q.explain
              }) : ""}
            </div>
          `;
        }).join("")}

        ${!isSubmitted && list.length > 0 ? `
          <div style="display:flex;justify-content:flex-end;gap:10px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:13.5px;color:var(--text-muted);">Đã chọn <strong>${doneCnt}/${list.length}</strong> câu</span>
            <button type="button" class="btn-primary" data-submit-mcq="1" ${doneCnt === 0 ? "disabled" : ""}>
              Nộp bài &amp; Chấm điểm
            </button>
          </div>
        ` : ""}
      </div>
    `;

    const submitMcqNow = () => {
      if (isWorkbook) wbSubmitted = true;
      else topikSubmitted = true;

      const corr = list.filter((x) => pickedMap[x.id] === x.answer).length;
      const finalPct = list.length > 0 ? Math.round((corr / list.length) * 100) : 0;

      if (isWorkbook) {
        store.recordWorkbookScore(normBook, lessonNum, corr, list.length, pickedMap, true);
      } else {
        if (!store.state.topikDrillAnswers) store.state.topikDrillAnswers = {};
        store.state.topikDrillAnswers[chapterStateKey] = { submitted: true, picks: { ...pickedMap } };
        const partPrefix = normBook === "q1" || normBook === "q2" ? "t1_ch_wb" : "t2_ch_wb";
        list.forEach((qObj) => {
          if (pickedMap[qObj.id] !== undefined) {
            store.recordQuestionResult(partPrefix, `Bài tập TOPIK ${bookCur?.shortTitle || normBook}`, qObj, pickedMap[qObj.id], { deferSave: true });
          }
        });
      }

      store.recordScoreHistory({
        quizKey,
        category: isWorkbook ? "Bài tập chương" : "Câu TOPIK chương",
        title: `${isWorkbook ? "Bài tập" : "Câu TOPIK"} · ${bookCur?.shortTitle || normBook.toUpperCase()} Bài ${String(lessonNum).padStart(2, "0")}`,
        score: finalPct,
        maxScore: 100,
        correctCount: corr,
        totalCount: list.length,
        route: "theory",
        params: { sub: "lesson-detail", book: normBook, lesson: lessonNum, tab: isWorkbook ? "workbook" : "topik" }
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
      render();
    };

    stage.querySelectorAll("[data-submit-mcq]").forEach((b) => {
      b.addEventListener("click", submitMcqNow);
    });

    stage.querySelector("#btn-reset-mcq-sec")?.addEventListener("click", () => {
      Object.keys(pickedMap).forEach((k) => delete pickedMap[k]);
      if (isWorkbook) wbSubmitted = false;
      else topikSubmitted = false;
      store.resetChapterQuiz(normBook, lessonNum, isWorkbook ? "workbook" : "topik");
      render();
    });

    stage.querySelectorAll("[data-ex-aud]").forEach((b) => {
      b.addEventListener("click", () => playAudio(b.dataset.exAud));
    });
    stage.querySelectorAll("[data-qpick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (isSubmitted) return;
        const qid = btn.dataset.qpick;
        const oi = Number(btn.dataset.oi);
        pickedMap[qid] = oi;
        if (isWorkbook) {
          if (!store.state.workbookAnswers) store.state.workbookAnswers = {};
          store.state.workbookAnswers[chapterStateKey] = { submitted: false, picks: { ...pickedMap } };
          store.save();
        } else {
          if (!store.state.topikDrillAnswers) store.state.topikDrillAnswers = {};
          store.state.topikDrillAnswers[chapterStateKey] = { submitted: false, picks: { ...pickedMap } };
          store.save();
        }
        render();
      });
    });
  }

  function render() {
    const doneWb = workbookDrills.filter((q) => pickedWb[q.id] !== undefined).length;
    const doneTopik = topikDrills.filter((q) => pickedTopik[q.id] !== undefined).length;
    const savedTrCount = store.state.translationDone?.[`${normBook}_${lessonNum}`] || 0;

    container.innerHTML = `
      <div class="skill-pills-row" style="margin-bottom:14px;">
        <button type="button" class="btn-skill ${exSection === "workbook" ? "active" : ""}" data-sec="workbook">
          Bài tập (${doneWb}/${workbookDrills.length})
        </button>
        <button type="button" class="btn-skill ${exSection === "translate" ? "active" : ""}" data-sec="translate">
          Dịch câu (${translationItems.length}${savedTrCount ? ` · ${savedTrCount}` : ""})
        </button>
        <button type="button" class="btn-skill ${exSection === "topik" ? "active" : ""}" data-sec="topik">
          Câu TOPIK (${doneTopik}/${topikDrills.length})
        </button>
      </div>

      <div id="chapter-ex-stage"></div>
    `;

    container.querySelectorAll("[data-sec]").forEach((b) => {
      b.addEventListener("click", () => {
        exSection = b.dataset.sec;
        render();
      });
    });

    const stage = container.querySelector("#chapter-ex-stage");

    if (exSection === "workbook") {
      renderMcqList(stage, workbookDrills, pickedWb, true);
      return;
    }

    if (exSection === "topik") {
      renderMcqList(stage, topikDrills, pickedTopik, false);
      return;
    }

    // Section II: Sentence Translation (Việt -> Hàn)
    if (translationItems.length === 0) {
      stage.innerHTML = `<div class="box-kind">Chương này chưa có câu ví dụ song ngữ để dịch.</div>`;
      return;
    }

    const trQuizKey = `tr_${chapterStateKey}`;
    const trAnsweredCnt = Object.keys(trResults).length;
    const trCorrectCnt = translationItems.filter((t) => trResults[t.id] === true).length;
    const trPctScore = Math.round((trCorrectCnt / translationItems.length) * 100);
    const trHistPill = renderQuizHistoryPillHTML(trQuizKey);

    const finishTranslationSet = () => {
      trSummaryShown = true;
      store.recordScoreHistory({
        quizKey: trQuizKey,
        category: "Dịch câu",
        title: `Dịch câu · ${bookCur?.shortTitle || normBook.toUpperCase()} Bài ${String(lessonNum).padStart(2, "0")}`,
        score: trPctScore,
        maxScore: 100,
        correctCount: trCorrectCnt,
        totalCount: translationItems.length,
        route: "theory",
        params: { sub: "lesson-detail", book: normBook, lesson: lessonNum, tab: "translate" }
      });
      render();
    };

    if (trSummaryShown) {
      stage.innerHTML = `
        <div class="box-kind card-pop" style="max-width:760px;margin:0 auto;padding:22px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
            <div>
              <h3 style="margin:0 0 4px;font-size:19px;color:var(--primary-1);">
                Điểm dịch câu: ${trPctScore}/100đ · Đúng ${trCorrectCnt}/${translationItems.length} câu
              </h3>
              ${renderQuizHistoryPillHTML(trQuizKey)}
            </div>
            <button type="button" class="btn-primary" id="btn-restart-tr-all">Làm lại từ đầu</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${translationItems.map((it, ii) => {
              const ok = trResults[it.id] === true;
              return `
                <div style="padding:12px 14px;border-radius:11px;background:${ok ? "rgba(22,163,74,0.07)" : "rgba(225,29,72,0.06)"};border:1px solid ${ok ? "rgba(22,163,74,0.3)" : "rgba(225,29,72,0.28)"};">
                  <div style="font-size:13.5px;color:var(--text-muted);">${ii + 1}. ${it.vi}</div>
                  <div class="ko" style="font-size:16px;font-weight:700;color:var(--text-main);margin-top:3px;">${it.ko}</div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
      stage.querySelector("#btn-restart-tr-all")?.addEventListener("click", () => {
        Object.keys(trResults).forEach((k) => delete trResults[k]);
        trSummaryShown = false;
        trIdx = 0;
        selectedBlocks = [];
        typingDraft = "";
        trChecked = null;
        render();
      });
      return;
    }

    const safeIdx = Math.min(Math.max(0, trIdx), translationItems.length - 1);
    trIdx = safeIdx;
    const item = translationItems[trIdx];
    preloadAudioUrls([item.audio].filter(Boolean));
    const bank = buildWordBank(item.ko, trIdx);
    const isLastTr = trIdx === translationItems.length - 1;

    stage.innerHTML = `
      <div class="box-kind card-pop" style="max-width:760px;margin:0 auto;padding:22px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:14px;font-weight:700;color:var(--primary-1);">
              Câu ${trIdx + 1} / ${translationItems.length}
            </span>
            ${trHistPill}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${trAnsweredCnt > 0 ? `
              <button type="button" class="btn-soft-jade" id="btn-finish-tr-set">
                Tổng kết điểm (${trAnsweredCnt}/${translationItems.length})
              </button>
            ` : ""}
            <button type="button" class="btn-outline-teal" data-tmode="blocks" style="${transMode === "blocks" ? "background:var(--primary);color:#FFF;border-color:var(--primary);" : ""}">
              Ghép từ
            </button>
            <button type="button" class="btn-outline-teal" data-tmode="typing" style="${transMode === "typing" ? "background:var(--primary);color:#FFF;border-color:var(--primary);" : ""}">
              Tự gõ
            </button>
          </div>
        </div>

        <div style="background:#F8FAFC;border-radius:14px;padding:16px 18px;margin-bottom:16px;">
          <div style="font-size:19px;font-weight:750;color:var(--text-main);">${item.vi}</div>
          <div style="font-size:13.5px;color:var(--primary-1);margin-top:6px;">${item.hint}</div>
        </div>

        ${transMode === "blocks" ? `
          <div style="min-height:56px;background:#F8FAFC;border:1.5px dashed #CBD5E1;border-radius:12px;padding:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px;">
            ${selectedBlocks.length === 0
              ? `<span style="color:var(--text-muted);font-size:14px;">Chạm các từ bên dưới để ghép câu...</span>`
              : selectedBlocks.map((b, bi) => `
                  <button type="button" class="ko" data-remove-blk="${bi}" style="background:var(--primary);color:#FFF;border:none;border-radius:9px;min-height:40px;padding:7px 14px;font-size:16px;font-weight:650;cursor:pointer;">
                    ${b.text} ×
                  </button>
                `).join("")}
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
            ${bank.map((b) => {
              const used = selectedBlocks.some((s) => s.id === b.id);
              return `
                <button type="button" class="ko" data-pick-blk="${b.id}" ${used ? "disabled" : ""} style="min-height:42px;padding:8px 15px;border-radius:10px;border:1px solid ${used ? "#E2E8F0" : "#CBD5E1"};background:${used ? "#F1F5F9" : "#FFFFFF"};color:${used ? "#94A3B8" : "var(--text-main)"};font-size:16px;font-weight:650;cursor:${used ? "default" : "pointer"};">
                  ${b.text}
                </button>
              `;
            }).join("")}
          </div>
        ` : `
          <div style="margin-bottom:14px;">
            <input id="tr-typing-inp" class="ko" value="${typingDraft.replace(/"/g, "&quot;")}" placeholder="Gõ câu tiếng Hàn..." style="width:100%;padding:12px 15px;font-size:17px;font-weight:650;" />
            <div style="margin-top:8px;text-align:right;">
              <button type="button" class="btn-outline-teal" id="btn-toggle-vk">
                ${showKeyboard ? "Ẩn bàn phím Hàn" : "Bàn phím Hàn ảo"}
              </button>
            </div>
            <div id="tr-vk-panel" style="display:${showKeyboard ? "block" : "none"};">
              <div class="kr-keyboard">
                ${HANGEUL_DATA.keyboardRows.map((row) => `
                  <div class="kr-key-row">
                    ${row.map((cell) => `<button type="button" class="kr-key" data-jamo="${cell.k}"><span>${cell.k}</span><small>${cell.en}</small></button>`).join("")}
                  </div>
                `).join("")}
                <div class="kr-key-row">
                  <button type="button" class="kr-key" data-special="space" style="min-width:130px;">Space</button>
                  <button type="button" class="kr-key" data-special="back" style="min-width:90px;">Xóa</button>
                </div>
              </div>
            </div>
          </div>
        `}

        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn-primary" id="btn-check-tr">Kiểm tra</button>
            <button type="button" class="btn-outline-teal" id="btn-reset-tr">Xóa nháp</button>
          </div>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn-outline-teal" id="btn-prev-tr" ${trIdx === 0 ? "disabled" : ""}>← Trước</button>
            <button type="button" class="${isLastTr ? "btn-primary" : "btn-soft-jade"}" id="btn-next-tr">
              ${isLastTr ? "Hoàn thành &amp; Chấm điểm →" : "Tiếp →"}
            </button>
          </div>
        </div>

        ${trChecked ? `
          <div style="margin-top:16px;padding:14px 16px;border-radius:12px;background:${trChecked.ok ? "rgba(22,163,74,0.09)" : "rgba(225,29,72,0.07)"};border:1px solid ${trChecked.ok ? "rgba(22,163,74,0.4)" : "rgba(225,29,72,0.35)"};">
            <strong style="color:${trChecked.ok ? "#14532D" : "#881337"};font-size:14.5px;display:block;">
              ${trChecked.ok ? "Chính xác" : "Đáp án đúng:"}
            </strong>
            <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <span class="ko" style="font-size:18px;font-weight:750;color:var(--primary-4);">${item.ko}</span>
              <button type="button" class="btn-outline-teal" id="btn-tr-audio" aria-label="Nghe câu chuẩn">${ico("speaker", 16)} Nghe</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;

    stage.querySelectorAll("[data-tmode]").forEach((b) => {
      b.addEventListener("click", () => {
        transMode = b.dataset.tmode;
        selectedBlocks = [];
        trChecked = null;
        render();
      });
    });

    stage.querySelectorAll("[data-pick-blk]").forEach((b) => {
      b.addEventListener("click", () => {
        const found = bank.find((x) => x.id === b.dataset.pickBlk);
        if (found) {
          selectedBlocks.push(found);
          trChecked = null;
          render();
        }
      });
    });
    stage.querySelectorAll("[data-remove-blk]").forEach((b) => {
      b.addEventListener("click", () => {
        selectedBlocks.splice(Number(b.dataset.removeBlk), 1);
        trChecked = null;
        render();
      });
    });

    const checkTranslationNow = () => {
      const userStr = transMode === "blocks"
        ? selectedBlocks.map((x) => x.text).join(" ")
        : (stage.querySelector("#tr-typing-inp")?.value || typingDraft);
      typingDraft = stage.querySelector("#tr-typing-inp")?.value ?? typingDraft;
      const ok = normalizeKo(userStr) === normalizeKo(item.ko);
      trChecked = { ok };
      trResults[item.id] = ok;
      if (ok && !trCountedIds.has(item.id)) {
        trCountedIds.add(item.id);
        store.recordTranslationSolved(normBook, lessonNum);
      }
      if (item.audio) playAudio(item.audio);
      else speakKoreanTTS(item.ko);
      render();
    };

    const vkBtn = stage.querySelector("#btn-toggle-vk");
    const vkPanel = stage.querySelector("#tr-vk-panel");
    const typeInp = stage.querySelector("#tr-typing-inp");
    if (vkBtn && vkPanel) {
      vkBtn.addEventListener("click", () => {
        showKeyboard = !showKeyboard;
        vkPanel.style.display = showKeyboard ? "block" : "none";
        vkBtn.textContent = showKeyboard ? "Ẩn bàn phím Hàn" : "Bàn phím Hàn ảo";
        typeInp?.focus();
      });
    }
    if (typeInp) {
      typeInp.addEventListener("input", (e) => {
        typingDraft = e.target.value;
      });
      bindHangulEnter(typeInp, checkTranslationNow);
      stage.querySelectorAll("[data-jamo]").forEach((k) => {
        k.addEventListener("click", () => {
          typeInp.value = appendJamoToText(typeInp.value, k.dataset.jamo);
          typingDraft = typeInp.value;
          typeInp.focus();
        });
      });
      stage.querySelectorAll("[data-special]").forEach((k) => {
        k.addEventListener("click", () => {
          if (k.dataset.special === "space") typeInp.value += " ";
          if (k.dataset.special === "back") typeInp.value = typeInp.value.slice(0, -1);
          typingDraft = typeInp.value;
          typeInp.focus();
        });
      });
    }

    stage.querySelector("#btn-check-tr").addEventListener("click", checkTranslationNow);

    stage.querySelector("#btn-finish-tr-set")?.addEventListener("click", finishTranslationSet);

    stage.querySelector("#btn-reset-tr").addEventListener("click", () => {
      selectedBlocks = [];
      typingDraft = "";
      trChecked = null;
      render();
    });
    stage.querySelector("#btn-prev-tr").addEventListener("click", () => {
      if (trIdx > 0) {
        trIdx -= 1;
        selectedBlocks = [];
        typingDraft = "";
        trChecked = null;
        render();
      }
    });
    stage.querySelector("#btn-next-tr").addEventListener("click", () => {
      if (isLastTr) {
        if (trChecked === null && (selectedBlocks.length > 0 || (stage.querySelector("#tr-typing-inp")?.value || typingDraft).trim())) {
          const userStr = transMode === "blocks"
            ? selectedBlocks.map((x) => x.text).join(" ")
            : (stage.querySelector("#tr-typing-inp")?.value || typingDraft);
          const ok = normalizeKo(userStr) === normalizeKo(item.ko);
          trResults[item.id] = ok;
          if (ok && !trCountedIds.has(item.id)) {
            trCountedIds.add(item.id);
            store.recordTranslationSolved(normBook, lessonNum);
          }
        }
        finishTranslationSet();
        return;
      }
      trIdx += 1;
      selectedBlocks = [];
      typingDraft = "";
      trChecked = null;
      render();
    });

    const audBtn = stage.querySelector("#btn-tr-audio");
    if (audBtn) {
      audBtn.addEventListener("click", () => {
        if (item.audio) playAudio(item.audio);
        else speakKoreanTTS(item.ko);
      });
    }
  }

  render();
}
