import { store, playAudio, preloadAudioUrls, speakKoreanTTS } from "./store.js?v=20261126-6";
import { appendJamoToText } from "./korean-engine.js?v=20261126-6";
import { HANGEUL_DATA } from "./curated-content.js?v=20261126-6";

// Build translation + TOPIK-structured chapter exercises for any book & lesson
export function renderChapterExercises(container, db, bookKey, lessonNum) {
  let pool = db.sc1Vocab;
  if (bookKey === "topik1") pool = db.topik1Bank;
  else if (bookKey === "sejong1") pool = db.sejongVocab;
  else if (bookKey.startsWith("custom_")) {
    pool = db.customDecks.find((d) => d.deckId === bookKey)?.items || [];
  }

  const lessonWords = pool.filter((w) => w.lesson === lessonNum);
  const lessonGrammars = bookKey === "sc1" ? db.sc1Grammar.filter((g) => g.lesson === lessonNum) : [];

  // Build rich Translation Exercises (Việt -> Hàn) from real chapter sentences + grammar examples
  const translationItems = [
    ...lessonGrammars.flatMap((g) => {
      const arr = [];
      if (g.example1Ko && g.example1Vi) {
        arr.push({
          id: `tr_g1_${g.id}`,
          vi: g.example1Vi,
          ko: g.example1Ko,
          audio: g.example1Audio,
          hint: `Ngữ pháp trọng tâm: ${g.pattern} (${g.meaning})`
        });
      }
      if (g.example2Ko && g.example2Vi) {
        arr.push({
          id: `tr_g2_${g.id}`,
          vi: g.example2Vi,
          ko: g.example2Ko,
          audio: g.example2Audio,
          hint: `Áp dụng cấu trúc: ${g.construction}`
        });
      }
      return arr;
    }),
    ...lessonWords
      .filter((w) => w.exampleKo && w.exampleVi && w.exampleKo.trim().includes(" "))
      .slice(0, 14)
      .map((w) => ({
        id: `tr_w_${w.id}`,
        vi: w.exampleVi,
        ko: w.exampleKo,
        audio: w.exampleAudio,
        hint: `Từ khóa: ${w.korean} (${w.vietnamese})`
      }))
  ];

  // Build TOPIK-structured questions for this specific chapter (Listening + Reading Cloze)
  const topikDrills = [];

  // Part A: TOPIK Listening [1~6] style using real Kyuri chapter sentence audio
  lessonWords
    .filter((w) => w.exampleAudio && w.exampleKo && w.exampleVi)
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
      // Deterministic shuffle
      const rotated = opts.map((val, idx) => ({ val, isAns: idx === 0 }));
      const shift = (lessonNum + i) % rotated.length;
      const finalOpts = [...rotated.slice(shift), ...rotated.slice(0, shift)];

      topikDrills.push({
        id: `ch_listen_${bookKey}_${lessonNum}_${i}`,
        typeBadge: "듣기 · Nghe chuẩn TOPIK [Câu 1~4]",
        audioSrc: w.exampleAudio,
        audioText: w.exampleKo,
        question: "다음 문장을 듣고 의미가 같은 것을 고르십시오 (Nghe câu thoại và chọn nội dung đúng):",
        passage: "",
        options: finalOpts.map((o) => o.val),
        answer: finalOpts.findIndex((o) => o.isAns),
        explain: `Câu gốc: "${w.exampleKo}" → Dịch: ${w.exampleVi} (Từ trọng tâm: ${w.korean} = ${w.vietnamese}).`
      });
    });

  // Part B: TOPIK Reading Fill-in-the-blank (   ) [Câu 34~39]
  lessonWords
    .filter((w) => w.exampleKo && w.exampleKo.includes(w.korean.replace(/\?/g, "")))
    .slice(0, 7)
    .forEach((w, i) => {
      const targetClean = w.korean.replace(/\?/g, "").trim();
      const blanked = w.exampleKo.replace(targetClean, "(          )");
      const distractors = lessonWords
        .filter((o) => o.id !== w.id && o.korean !== w.korean)
        .slice((i * 2) % Math.max(1, lessonWords.length - 3), ((i * 2) % Math.max(1, lessonWords.length - 3)) + 3);
      const rawOpts = [targetClean, ...distractors.map((d) => d.korean)];
      while (rawOpts.length < 4) rawOpts.push("학교");
      const rotated = rawOpts.slice(0, 4).map((val, idx) => ({ val, isAns: idx === 0 }));
      const shift = (lessonNum + i + 1) % 4;
      const finalOpts = [...rotated.slice(shift), ...rotated.slice(0, shift)];

      topikDrills.push({
        id: `ch_read_${bookKey}_${lessonNum}_${i}`,
        typeBadge: "읽기 · Đọc điền vào (   ) [Câu 34~39]",
        audioSrc: w.exampleAudio || "",
        question: "(     )에 들어갈 가장 알맞은 것을 고르십시오 (Chọn từ đúng nhất điền vào chỗ trống):",
        passage: `${blanked}\n(Gợi ý ngữ cảnh: ${w.exampleVi})`,
        options: finalOpts.map((o) => o.val),
        answer: finalOpts.findIndex((o) => o.isAns),
        explain: `Đáp án đúng là "${targetClean}" (${w.vietnamese}). Câu hoàn chỉnh: ${w.exampleKo}`
      });
    });

  // Part C: Grammar Cloze if SC1 grammar exists
  lessonGrammars.forEach((g, gi) => {
    if (!g.example1Ko) return;
    const otherPatterns = db.sc1Grammar.filter((x) => x.id !== g.id).slice(gi * 3, gi * 3 + 3).map((x) => x.pattern);
    const rawOpts = [g.pattern, ...otherPatterns];
    const rotated = rawOpts.slice(0, 4).map((val, idx) => ({ val, isAns: idx === 0 }));
    const shift = (gi + 2) % Math.max(1, rotated.length);
    const finalOpts = [...rotated.slice(shift), ...rotated.slice(0, shift)];

    topikDrills.push({
      id: `ch_gram_${bookKey}_${lessonNum}_${gi}`,
      typeBadge: "문법 · Ngữ pháp cấu trúc đề TOPIK",
      audioSrc: g.example1Audio || "",
      question: `Chọn cấu trúc ngữ pháp mang nghĩa "${g.meaning}" được dùng trong câu dưới đây:`,
      passage: `${g.example1Ko}\n(${g.example1Vi})`,
      options: finalOpts.map((o) => o.val),
      answer: finalOpts.findIndex((o) => o.isAns),
      explain: `${g.pattern}: ${g.construction} — ${g.usage}`
    });
  });

  // Preload first batch of exercise audio immediately
  preloadAudioUrls([
    ...translationItems.slice(0, 6).map((t) => t.audio),
    ...topikDrills.slice(0, 6).map((q) => q.audioSrc)
  ]);

  let exSection = "translate"; // translate | topik
  let transMode = "blocks";    // blocks (ghép cụm từ) | typing (tự gõ dịch câu)
  let trIdx = 0;
  let selectedBlocks = [];
  let showKeyboard = false;
  let trChecked = null;        // null | { ok, expected, diffHtml }
  const pickedTopik = {};

  function normalizeKo(s) {
    return (s || "").replace(/[.?!,~]/g, "").replace(/\s+/g, " ").trim();
  }

  function buildWordBank(targetSentence, seedIdx) {
    const realTokens = targetSentence.trim().split(/\s+/);
    // Add 2 plausible particle/ending distractors to test Korean grammar precision!
    const extraDistractors = ["학교에", "집에서", "안", "없습니다.", "입니까?"].filter((d) => !realTokens.includes(d)).slice(0, 2);
    const combined = [...realTokens, ...extraDistractors].map((tok, i) => ({ id: `blk_${i}`, text: tok }));
    // Deterministic shuffle
    return combined.sort((a, b) => ((a.text.charCodeAt(0) * 17 + seedIdx) % 11) - ((b.text.charCodeAt(0) * 17 + seedIdx) % 11));
  }

  function render() {
    const doneTopik = Object.keys(pickedTopik).length;
    const correctTopik = topikDrills.filter((q) => pickedTopik[q.id] === q.answer).length;

    container.innerHTML = `
      <div class="prediction-banner" style="padding:16px 20px;margin-bottom:18px;">
        <div>
          <strong style="color:var(--primary-1);font-size:16px;">✍️ Bài tập thực hành Chương ${String(lessonNum).padStart(2, "0")}</strong>
          <div style="font-size:13.5px;color:var(--text-muted);margin-top:2px;">
            Ưu tiên số 1: <strong>Luyện dịch câu Việt → Hàn</strong> đúng trật tự tiểu từ · Ưu tiên số 2: <strong>Làm bài tập chuẩn cấu trúc đề TOPIK</strong>.
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn-skill ${exSection === "translate" ? "active" : ""}" data-sec="translate">
            1. Luyện Dịch Câu (${translationItems.length} câu)
          </button>
          <button type="button" class="btn-skill ${exSection === "topik" ? "active" : ""}" data-sec="topik">
            2. Bài tập chuẩn đề TOPIK (${doneTopik}/${topikDrills.length})
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

    if (exSection === "translate") {
      if (translationItems.length === 0) {
        stage.innerHTML = `<div class="box-kind">Chương này chưa có câu ví dụ song ngữ để dịch.</div>`;
        return;
      }
      const item = translationItems[trIdx % translationItems.length];
      // Preload next 3 sentences
      preloadAudioUrls([
        item.audio,
        translationItems[(trIdx + 1) % translationItems.length]?.audio,
        translationItems[(trIdx + 2) % translationItems.length]?.audio
      ]);
      const bank = buildWordBank(item.ko, trIdx);

      stage.innerHTML = `
        <div class="box-kind card-pop" style="max-width:780px;margin:0 auto;padding:24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
            <span style="font-size:13.5px;font-weight:700;color:var(--primary-1);">
              Câu dịch ${(trIdx % translationItems.length) + 1} / ${translationItems.length}
            </span>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn-outline-teal" data-tmode="blocks" style="padding:5px 12px;font-size:13px;${transMode === "blocks" ? "background:var(--primary);color:#FFF;" : ""}">
                🧩 Ghép cụm từ
              </button>
              <button type="button" class="btn-outline-teal" data-tmode="typing" style="padding:5px 12px;font-size:13px;${transMode === "typing" ? "background:var(--primary);color:#FFF;" : ""}">
                ⌨️ Tự gõ cả câu Hàn
              </button>
            </div>
          </div>

          <div style="background:var(--primary-3);border-radius:14px;padding:18px 20px;margin-bottom:16px;">
            <div style="font-size:12.5px;font-weight:700;color:var(--primary-4);margin-bottom:4px;">HÃY DỊCH CÂU TIẾNG VIỆT SAU SANG TIẾNG HÀN:</div>
            <div style="font-size:21px;font-weight:800;color:var(--text-main);">${item.vi}</div>
            <div style="font-size:13px;color:var(--primary-1);margin-top:6px;">💡 ${item.hint}</div>
          </div>

          ${transMode === "blocks" ? `
            <div style="min-height:58px;background:#F8FAFB;border:2px dashed #CBD5E1;border-radius:12px;padding:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px;">
              ${selectedBlocks.length === 0
                ? `<span style="color:var(--text-muted);font-size:14px;">👆 Bấm chọn lần lượt các cụm từ tiếng Hàn bên dưới theo đúng trật tự Chủ ngữ – Địa điểm – Tân ngữ – Động từ...</span>`
                : selectedBlocks.map((b, bi) => `
                    <button type="button" class="ko" data-remove-blk="${bi}" style="background:var(--primary);color:#FFF;border:none;border-radius:8px;padding:7px 13px;font-size:16.5px;font-weight:700;cursor:pointer;">
                      ${b.text} ×
                    </button>
                  `).join("")}
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
              ${bank.map((b) => {
                const used = selectedBlocks.some((s) => s.id === b.id);
                return `
                  <button type="button" class="ko" data-pick-blk="${b.id}" ${used ? "disabled" : ""} style="padding:8px 14px;border-radius:10px;border:1.5px solid ${used ? "#E2E8F0" : "var(--primary)"};background:${used ? "#F1F5F9" : "#FFFFFF"};color:${used ? "#94A3B8" : "var(--text-main)"};font-size:16.5px;font-weight:700;cursor:${used ? "default" : "pointer"};">
                    ${b.text}
                  </button>
                `;
              }).join("")}
            </div>
          ` : `
            <div style="margin-bottom:14px;">
              <input id="tr-typing-inp" class="ko" placeholder="Gõ câu dịch tiếng Hàn hoàn chỉnh vào đây..." style="width:100%;padding:13px 16px;border-radius:12px;border:2px solid var(--primary);font-size:18px;font-weight:700;" />
              <div style="margin-top:8px;text-align:right;">
                <button type="button" class="btn-outline-teal" id="btn-toggle-vk" style="padding:4px 12px;font-size:12.5px;">
                  ⌨️ ${showKeyboard ? "Ẩn bàn phím Hàn ảo" : "Mở bàn phím Hàn ảo"}
                </button>
              </div>
              ${showKeyboard ? `
                <div class="kr-keyboard">
                  ${HANGEUL_DATA.keyboardRows.map((row) => `
                    <div class="kr-key-row">
                      ${row.map((c) => `<button type="button" class="kr-key" data-jamo="${c.k}"><span>${c.k}</span><small>${c.en}</small></button>`).join("")}
                    </div>
                  `).join("")}
                  <div class="kr-key-row">
                    <button type="button" class="kr-key" data-sp="space" style="min-width:130px;">Space</button>
                    <button type="button" class="kr-key" data-sp="back" style="min-width:85px;">⌫ Xóa</button>
                  </div>
                </div>
              ` : ""}
            </div>
          `}

          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn-orange" id="btn-check-trans">✔ Kiểm tra câu dịch</button>
              <button type="button" class="btn-outline-teal" id="btn-play-ans-audio">🔊 Nghe câu mẫu Kyuri</button>
            </div>
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn-outline-teal" id="btn-tr-prev">← Câu trước</button>
              <button type="button" class="btn-primary" id="btn-tr-next">Câu dịch tiếp →</button>
            </div>
          </div>

          ${trChecked ? `
            <div style="margin-top:14px;padding:12px 16px;border-radius:12px;background:${trChecked.ok ? "rgba(58,202,116,0.14)" : "rgba(255,90,96,0.12)"};border:1.5px solid ${trChecked.ok ? "var(--success)" : "var(--danger)"};">
              <strong style="color:${trChecked.ok ? "var(--success)" : "var(--danger)"};display:block;margin-bottom:4px;">
                ${trChecked.ok ? "🎉 Dịch chuẩn xác 100%!" : "💡 Đối chiếu đáp án chuẩn:"}
              </strong>
              <div class="ko" style="font-size:19px;font-weight:800;color:var(--primary-4);">${item.ko}</div>
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

      const vkBtn = stage.querySelector("#btn-toggle-vk");
      if (vkBtn) vkBtn.addEventListener("click", () => { showKeyboard = !showKeyboard; render(); });

      const tInp = stage.querySelector("#tr-typing-inp");
      if (tInp) {
        stage.querySelectorAll("[data-jamo]").forEach((k) => {
          k.addEventListener("click", () => { tInp.value = appendJamoToText(tInp.value, k.dataset.jamo); tInp.focus(); });
        });
        stage.querySelectorAll("[data-sp]").forEach((k) => {
          k.addEventListener("click", () => {
            if (k.dataset.sp === "space") tInp.value += " ";
            else tInp.value = tInp.value.slice(0, -1);
            tInp.focus();
          });
        });
      }

      const playAns = () => {
        if (item.audio) playAudio(item.audio);
        else speakKoreanTTS(item.ko);
      };
      stage.querySelector("#btn-play-ans-audio").addEventListener("pointerdown", playAns);

      const checkTrans = () => {
        const userSentence = transMode === "blocks"
          ? selectedBlocks.map((x) => x.text).join(" ")
          : (stage.querySelector("#tr-typing-inp")?.value || "");
        const ok = normalizeKo(userSentence) === normalizeKo(item.ko);
        trChecked = { ok };
        playAns();
        if (ok) {
          store.state.chapterHomeworkDone[`${bookKey}_${lessonNum}`] = true;
          store.touchStreak();
          store.save();
        }
        render();
      };
      stage.querySelector("#btn-check-trans").addEventListener("click", checkTrans);
      if (tInp) tInp.addEventListener("keydown", (e) => { if (e.key === "Enter") checkTrans(); });

      stage.querySelector("#btn-tr-prev").addEventListener("click", () => {
        trIdx = (trIdx - 1 + translationItems.length) % translationItems.length;
        selectedBlocks = [];
        trChecked = null;
        render();
      });
      stage.querySelector("#btn-tr-next").addEventListener("click", () => {
        trIdx += 1;
        selectedBlocks = [];
        trChecked = null;
        render();
      });
    } else {
      // TOPIK Exam-Style Drills for this Chapter
      stage.innerHTML = `
        <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <strong>Kết quả bài tập TOPIK chương này: Đúng <span style="color:var(--success)">${correctTopik}</span> / ${topikDrills.length} câu</strong>
          <span style="font-size:13px;color:var(--text-muted);">Câu sai tự động lưu vào Sổ tay câu sai để ôn lại!</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${topikDrills.map((q, qi) => {
            const picked = pickedTopik[q.id];
            return `
              <div class="box-kind">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                  <span class="badge-orange" style="background:rgba(254,154,5,0.14);font-size:12.5px;">${q.typeBadge}</span>
                  ${q.audioSrc ? `<button type="button" class="btn-primary" data-drill-audio="${q.audioSrc}" style="padding:6px 14px;font-size:13px;">🔊 Nghe giọng chuẩn Kyuri</button>` : ""}
                </div>
                <strong style="display:block;margin-bottom:8px;">Câu ${qi + 1}. ${q.question}</strong>
                ${q.passage ? `<pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:12px 14px;border-radius:10px;font-size:16px;margin:0 0 12px;border-left:3px solid var(--primary);">${q.passage}</pre>` : ""}
                <div class="grid-2">
                  ${q.options.map((opt, oi) => {
                    let border = "#E5E7EB";
                    let bg = "#FFFFFF";
                    if (picked !== undefined) {
                      if (oi === q.answer) { border = "var(--success)"; bg = "rgba(58,202,116,0.15)"; }
                      else if (oi === picked) { border = "var(--danger)"; bg = "rgba(255,90,96,0.13)"; }
                    }
                    return `
                      <button type="button" class="ko" data-dqid="${q.id}" data-doi="${oi}" style="text-align:left;padding:10px 14px;border-radius:10px;border:1.5px solid ${border};background:${bg};font-size:15.5px;font-weight:500;cursor:pointer;">
                        ${["①", "②", "③", "④"][oi]} ${opt}
                      </button>
                    `;
                  }).join("")}
                </div>
                ${picked !== undefined ? `
                  <div style="margin-top:10px;background:var(--primary-3);padding:10px 14px;border-radius:10px;font-size:13.5px;color:var(--primary-4);">
                    <strong>${picked === q.answer ? "✔ Chính xác!" : "✘ Sai (Đã ghi vào Sổ tay câu sai)!"}</strong> — ${q.explain}
                  </div>
                ` : ""}
              </div>
            `;
          }).join("")}
        </div>
      `;

      stage.querySelectorAll("[data-drill-audio]").forEach((b) => {
        b.addEventListener("pointerdown", () => playAudio(b.dataset.drillAudio));
      });

      stage.querySelectorAll("[data-dqid]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const qObj = topikDrills.find((x) => x.id === btn.dataset.dqid);
          const oi = Number(btn.dataset.doi);
          pickedTopik[qObj.id] = oi;
          store.recordQuestionResult(`chapter_${bookKey}_${lessonNum}`, `Bài tập Chương ${lessonNum}`, qObj, oi);
          render();
        });
      });
    }
  }

  render();
}
