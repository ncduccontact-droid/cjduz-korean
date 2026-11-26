import { store, normalizeBookId, getBookWords, getBookCurriculum, playAudio, preloadAudioUrls, speakKoreanTTS } from "./store.js?v=20261127-08";
import { appendJamoToText } from "./korean-engine.js?v=20261127-08";
import { HANGEUL_DATA } from "./curated-content.js?v=20261127-08";
import { ico } from "./icons.js?v=20261127-08";

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
        badge: "익힘책 · Bài tập Từ vựng ngữ cảnh",
        audioSrc: w.exampleAudio || w.wordAudio || "",
        question: hasDirect
          ? `[Sách bài tập] Chọn từ vựng phù hợp nhất điền vào chỗ trống:`
          : `[Sách bài tập] Nghĩa tiếng Việt chuẩn của từ '${w.korean}' trong câu dưới là:`,
        passage: hasDirect
          ? `${w.exampleKo.replace(targetClean, "(          )")}\n→ Nghĩa câu: ${w.exampleVi}`
          : `${w.exampleKo}`,
        options: rotated.map((r) => r.txt),
        answer: rotated.findIndex((r) => r.isAns),
        explain: `${w.korean} = ${w.vietnamese}. Câu đầy đủ: "${w.exampleKo}" (${w.exampleVi}).`
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

  const chapterStateKey = `${normBook}_${lessonNum}`;
  let exSection = ["workbook", "translate", "topik"].includes(initialSection) ? initialSection : "workbook";
  let transMode = "blocks";
  let trIdx = 0;
  let selectedBlocks = [];
  let typingDraft = "";
  let showKeyboard = false;
  let trChecked = null;
  const pickedWb = { ...(store.state.workbookAnswers?.[chapterStateKey] || {}) };
  const pickedTopik = { ...(store.state.topikDrillAnswers?.[chapterStateKey] || {}) };

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
    const doneCnt = Object.keys(pickedMap).length;
    const correctCnt = list.filter((q) => pickedMap[q.id] === q.answer).length;
    stage.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="box-kind" style="background:var(--primary-3);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:12px 18px;">
          <strong style="color:var(--primary-4);font-size:14.5px;display:inline-flex;align-items:center;gap:7px;">
            ${isWorkbook ? `${ico("workbook", 18)} Kết quả Sách bài tập (익힘책):` : `${ico("target", 18)} Kết quả câu hỏi chuẩn TOPIK:`} Đúng ${correctCnt} / ${doneCnt} câu đã làm (Tổng ${list.length} câu)
          </strong>
          <span class="badge-orange">${doneCnt === list.length ? `${ico("trophy", 14)} Đã hoàn thành!` : "Chọn đáp án để chấm điểm ngay"}</span>
        </div>

        ${list.map((q, qi) => {
          const userPick = pickedMap[q.id];
          const answered = userPick !== undefined;
          return `
            <div class="box-kind">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
                <span class="badge-orange">${q.badge || q.typeBadge} · Câu ${qi + 1}</span>
                ${q.audioSrc ? `<button type="button" class="btn-primary" data-ex-aud="${q.audioSrc}" style="padding:5px 13px;font-size:12.5px;">${ico("speaker", 14)} Nghe câu Hàn</button>` : ""}
              </div>
              <div style="font-weight:700;font-size:15.5px;margin-bottom:8px;">${q.question}</div>
              ${q.passage ? `<pre class="ko" style="white-space:pre-wrap;background:var(--bg-body);border:1px solid var(--border-card);padding:12px 14px;border-radius:12px;font-size:16px;margin:0 0 12px;">${q.passage}</pre>` : ""}

              <div class="grid-2" style="gap:8px;">
                ${q.options.map((opt, oi) => {
                  let cls = "mcq-opt-btn";
                  if (answered) {
                    if (oi === q.answer) cls += " is-correct";
                    else if (oi === userPick) cls += " is-wrong";
                  }
                  return `
                    <button type="button" class="ko ${cls}" data-qpick="${q.id}" data-oi="${oi}">
                      ${["①", "②", "③", "④"][oi]} ${opt}
                    </button>
                  `;
                }).join("")}
              </div>

              ${answered ? `
                <div style="margin-top:10px;background:var(--primary-3);border-radius:10px;padding:10px 14px;font-size:13.5px;color:var(--primary-4);">
                  <strong>${userPick === q.answer ? `${ico("check", 15)} Chính xác!` : `${ico("cross", 15)} Giải thích:`}</strong> ${q.explain}
                </div>
              ` : ""}
            </div>
          `;
        }).join("")}
      </div>
    `;

    stage.querySelectorAll("[data-ex-aud]").forEach((b) => {
      b.addEventListener("pointerdown", () => playAudio(b.dataset.exAud));
    });
    stage.querySelectorAll("[data-qpick]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.qpick;
        const oi = Number(btn.dataset.oi);
        pickedMap[qid] = oi;
        const qObj = list.find((x) => x.id === qid);
        if (qObj?.audioSrc) playAudio(qObj.audioSrc);
        if (isWorkbook) {
          const corr = list.filter((x) => pickedMap[x.id] === x.answer).length;
          store.recordWorkbookScore(normBook, lessonNum, corr, list.length, pickedMap);
        } else if (qObj) {
          if (!store.state.topikDrillAnswers) store.state.topikDrillAnswers = {};
          store.state.topikDrillAnswers[chapterStateKey] = { ...pickedMap };
          const partPrefix = normBook === "q1" || normBook === "q2" ? "t1_ch_wb" : "t2_ch_wb";
          store.recordQuestionResult(partPrefix, `Bài tập TOPIK ${bookCur?.shortTitle || normBook}`, qObj, oi);
        }
        render();
      });
    });
  }

  function render() {
    const doneWb = Object.keys(pickedWb).length;
    const doneTopik = Object.keys(pickedTopik).length;
    const savedTrCount = store.state.translationDone?.[`${normBook}_${lessonNum}`] || 0;

    container.innerHTML = `
      <div class="prediction-banner" style="padding:16px 20px;margin-bottom:18px;">
        <div>
          <strong style="color:var(--primary-1);font-size:16.5px;display:inline-flex;align-items:center;gap:7px;">${ico("workbook", 20)} Sách Bài Tập (익힘책) · Bài ${String(lessonNum).padStart(2, "0")}: ${chapObj?.title || ""}</strong>
          <div style="font-size:13.5px;color:var(--text-muted);margin-top:2px;">
            Làm bài tập Từ vựng &amp; Ngữ pháp → Luyện dịch câu Việt–Hàn → Chốt câu hỏi chuẩn TOPIK.
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn-skill ${exSection === "workbook" ? "active" : ""}" data-sec="workbook">
            I. Bài tập Sách BT (${doneWb}/${workbookDrills.length})
          </button>
          <button type="button" class="btn-skill ${exSection === "translate" ? "active" : ""}" data-sec="translate">
            II. Luyện Dịch Câu (${translationItems.length} câu${savedTrCount ? ` · Đã dịch ${savedTrCount}` : ""})
          </button>
          <button type="button" class="btn-skill ${exSection === "topik" ? "active" : ""}" data-sec="topik">
            III. Câu chuẩn TOPIK (${doneTopik}/${topikDrills.length})
          </button>
        </div>
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
    const item = translationItems[trIdx % translationItems.length];
    preloadAudioUrls([item.audio].filter(Boolean));
    const bank = buildWordBank(item.ko, trIdx);

    stage.innerHTML = `
      <div class="box-kind card-pop" style="max-width:780px;margin:0 auto;padding:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <span style="font-size:13.5px;font-weight:700;color:var(--primary-1);">
            Phần II · Luyện Dịch Câu ${(trIdx % translationItems.length) + 1} / ${translationItems.length}
          </span>
          <div style="display:flex;gap:6px;">
            <button type="button" class="btn-outline-teal" data-tmode="blocks" style="padding:5px 12px;font-size:13px;${transMode === "blocks" ? "background:var(--primary);color:#FFF;border-color:var(--primary-1);" : ""}">
              ${ico("puzzle", 16)} Ghép cụm từ
            </button>
            <button type="button" class="btn-outline-teal" data-tmode="typing" style="padding:5px 12px;font-size:13px;${transMode === "typing" ? "background:var(--primary);color:#FFF;border-color:var(--primary-1);" : ""}">
              ${ico("keyboard", 16)} Tự gõ câu Hàn
            </button>
          </div>
        </div>

        <div style="background:#F8FAFC;border-radius:14px;padding:18px 20px;margin-bottom:16px;">
          <div style="font-size:12.5px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">Dịch câu sau sang tiếng Hàn</div>
          <div style="font-size:19px;font-weight:750;color:var(--text-main);">${item.vi}</div>
          <div style="font-size:13px;color:var(--primary-1);margin-top:6px;">Gợi ý: ${item.hint}</div>
        </div>

        ${transMode === "blocks" ? `
          <div style="min-height:56px;background:#F8FAFC;border:1.5px dashed #CBD5E1;border-radius:12px;padding:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px;">
            ${selectedBlocks.length === 0
              ? `<span style="color:var(--text-muted);font-size:13.5px;">Chạm lần lượt vào các cụm từ bên dưới để ghép câu...</span>`
              : selectedBlocks.map((b, bi) => `
                  <button type="button" class="ko" data-remove-blk="${bi}" style="background:var(--primary);color:#FFF;border:none;border-radius:8px;padding:7px 13px;font-size:16px;font-weight:650;cursor:pointer;">
                    ${b.text} ×
                  </button>
                `).join("")}
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
            ${bank.map((b) => {
              const used = selectedBlocks.some((s) => s.id === b.id);
              return `
                <button type="button" class="ko" data-pick-blk="${b.id}" ${used ? "disabled" : ""} style="padding:8px 14px;border-radius:10px;border:1px solid ${used ? "#E2E8F0" : "#CBD5E1"};background:${used ? "#F1F5F9" : "#FFFFFF"};color:${used ? "#94A3B8" : "var(--text-main)"};font-size:16px;font-weight:650;cursor:${used ? "default" : "pointer"};">
                  ${b.text}
                </button>
              `;
            }).join("")}
          </div>
        ` : `
          <div style="margin-bottom:14px;">
            <input id="tr-typing-inp" class="ko" value="${typingDraft.replace(/"/g, "&quot;")}" placeholder="Gõ câu dịch tiếng Hàn hoàn chỉnh (Nhấn Enter để kiểm tra)..." style="width:100%;padding:12px 15px;font-size:17px;font-weight:650;" />
            <div style="margin-top:8px;text-align:right;">
              <button type="button" class="btn-outline-teal" id="btn-toggle-vk" style="padding:5px 12px;font-size:12.5px;">
                ${showKeyboard ? "Ẩn bàn phím Hàn ảo" : "Mở bàn phím Hàn ảo"}
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
            <button type="button" class="btn-primary" id="btn-check-tr">Kiểm tra câu dịch</button>
            <button type="button" class="btn-outline-teal" id="btn-reset-tr">Làm lại</button>
          </div>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn-outline-teal" id="btn-prev-tr">← Câu trước</button>
            <button type="button" class="btn-soft-jade" id="btn-next-tr">Câu tiếp →</button>
          </div>
        </div>

        ${trChecked ? `
          <div style="margin-top:16px;padding:14px 16px;border-radius:12px;background:${trChecked.ok ? "rgba(34,197,94,0.12)" : "rgba(244,63,94,0.10)"};border:1.5px solid ${trChecked.ok ? "var(--success)" : "var(--danger)"};">
            <strong style="color:${trChecked.ok ? "var(--success)" : "var(--danger)"};font-size:15.5px;display:inline-flex;align-items:center;gap:6px;">
              ${trChecked.ok ? `${ico("check", 17)} Chính xác! Trật tự câu & tiểu từ chuẩn ngữ pháp Hàn.` : `${ico("bulb", 17)} Chưa khớp hoàn toàn — đối chiếu đáp án chuẩn bên dưới:`}
            </strong>
            <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <span class="ko" style="font-size:18.5px;font-weight:800;color:var(--primary-4);">${item.ko}</span>
              <button type="button" class="btn-outline-teal" id="btn-tr-audio" style="padding:5px 12px;font-size:13px;">${ico("speaker", 16)} Nghe câu chuẩn</button>
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
      if (ok) store.recordTranslationSolved(normBook, lessonNum);
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
        vkBtn.innerHTML = `${ico("keyboard", 15)} ${showKeyboard ? "Ẩn bàn phím Hàn ảo" : "Mở bàn phím Hàn ảo"}`;
        typeInp?.focus();
      });
    }
    if (typeInp) {
      typeInp.addEventListener("input", (e) => {
        typingDraft = e.target.value;
      });
      typeInp.addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.key === "Enter") {
          e.preventDefault();
          checkTranslationNow();
        }
      });
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

    stage.querySelector("#btn-reset-tr").addEventListener("click", () => {
      selectedBlocks = [];
      typingDraft = "";
      trChecked = null;
      render();
    });
    stage.querySelector("#btn-prev-tr").addEventListener("click", () => {
      trIdx = (trIdx - 1 + translationItems.length) % translationItems.length;
      selectedBlocks = [];
      typingDraft = "";
      trChecked = null;
      render();
    });
    stage.querySelector("#btn-next-tr").addEventListener("click", () => {
      trIdx = (trIdx + 1) % translationItems.length;
      selectedBlocks = [];
      typingDraft = "";
      trChecked = null;
      render();
    });

    const audBtn = stage.querySelector("#btn-tr-audio");
    if (audBtn) {
      audBtn.addEventListener("pointerdown", () => {
        if (item.audio) playAudio(item.audio);
        else speakKoreanTTS(item.ko);
      });
    }
  }

  render();
}
