import { store, playAudio, preloadAudioUrls, speakKoreanTTS } from "../store.js?v=20261127-03";
import { WONGOKJI_PROMPTS, TOPIK_SPEAKING_TASKS } from "../topik-bank.js?v=20261127-03";
import { ico } from "../icons.js?v=20261127-03";

export function renderTopikPracticeView(root, db, navigate, params = {}, registerCleanup = () => {}) {
  const sys = db.topikFullSystem || { taxonomy: { topik1: {}, topik2: {} }, itemPool: {} };
  const levelKey = params.sub === "topik2" ? "topik2" : "topik1";
  const skill = params.skill || "listening"; // listening | reading | writing | speaking
  const activePartId = params.partId || null;

  const lvTax = sys.taxonomy[levelKey] || { listening: [], reading: [], writing: [] };

  // Build full parts list from official Dạng 1 -> Dạng N taxonomy + itemPool
  const partsList = [
    ...(lvTax.listening || []).map((t) => ({
      ...t,
      skill: "listening",
      questions: Object.values(sys.itemPool).filter((q) => q.typeId === t.id)
    })),
    ...(lvTax.reading || []).map((t) => ({
      ...t,
      skill: "reading",
      questions: Object.values(sys.itemPool).filter((q) => q.typeId === t.id)
    }))
  ];

  if (activePartId && (skill === "listening" || skill === "reading")) {
    const part = partsList.find((p) => p.id === activePartId);
    if (part) return renderPartMasteryDrill(part);
  }

  const filteredParts = partsList.filter((p) => p.skill === skill);

  root.innerHTML = `
    <div class="container-web">
      <div class="breadcrumb-bar">
        <button type="button" id="bc-prac-home">Luyện tập</button>
        <span>/</span>
        <span>${levelKey === "topik1" ? "Luyện nhuần nhuyễn từng dạng TOPIK I (Dạng 1 → Dạng 8)" : "Luyện nhuần nhuyễn từng dạng TOPIK II & Speaking (Dạng 1 → Dạng 10)"}</span>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:10px;">
        <div class="skill-pills-row" style="margin-bottom:0;">
          <button class="btn-skill ${skill === "listening" ? "active" : ""}" data-sk="listening">${ico("headphones", 17)} Nghe · 듣기 (${(lvTax.listening || []).length} Dạng)</button>
          <button class="btn-skill ${skill === "reading" ? "active" : ""}" data-sk="reading">${ico("book", 17)} Đọc · 읽기 (${(lvTax.reading || []).length} Dạng)</button>
          ${levelKey === "topik2" ? `
            <button class="btn-skill ${skill === "writing" ? "active" : ""}" data-sk="writing">
              ${ico("pen", 17)} Viết 원고지 (쓰기)
              <span class="badge-mia">51~54</span>
            </button>
            <button class="btn-skill ${skill === "speaking" ? "active" : ""}" data-sk="speaking">
              ${ico("mic", 17)} Nói 6 Câu (말하기)
              <span class="badge-mia">MIC</span>
            </button>
          ` : ""}
        </div>

        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <select id="switch-topik-lv" class="box-select">
            <option value="topik1" ${levelKey === "topik1" ? "selected" : ""}>Cấu trúc TOPIK I (Dạng 1–8)</option>
            <option value="topik2" ${levelKey === "topik2" ? "selected" : ""}>Cấu trúc TOPIK II (Dạng 1–10)</option>
          </select>
          <button type="button" class="btn-outline-teal" id="btn-jump-full-exams" style="padding:7px 14px;font-size:13px;">
            ${ico("exam", 16)} Vào làm Full Đề ${levelKey === "topik1" ? "70 câu" : "104 câu"} →
          </button>
        </div>
      </div>

      <div id="topik-practice-body" style="margin-top:18px;"></div>
    </div>
  `;

  root.querySelector("#bc-prac-home").addEventListener("click", () => navigate("practice", { sub: "skills", skill: "shadowing" }));
  root.querySelector("#switch-topik-lv").addEventListener("change", (e) => {
    navigate("practice", { sub: e.target.value, skill: "listening" });
  });
  root.querySelector("#btn-jump-full-exams").addEventListener("click", () => {
    navigate("mock-test", { sub: levelKey, viewMode: "exams", category: "all" });
  });
  root.querySelectorAll("[data-sk]").forEach((b) => {
    b.addEventListener("click", () => {
      navigate("practice", { sub: levelKey, skill: b.dataset.sk });
    });
  });

  const body = root.querySelector("#topik-practice-body");
  if (skill === "writing") return renderWongokjiStudio(body);
  if (skill === "speaking") return renderTopikSpeakingRoom(body);

  body.innerHTML = `
    <div class="grid-2">
      ${filteredParts.map((part) => {
        const st = store.state.partStats[part.id] || { correct: 0, total: 0 };
        const pct = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
        const barClass = st.total > 0 && pct < 50 ? "danger" : (st.total > 0 && pct < 75 ? "warn" : "");
        return `
          <div class="box-kind clickable" data-open-part="${part.id}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px;">
              <span class="badge-orange" style="background:rgba(254,154,5,0.14);">${part.code} · ${part.range}</span>
              <span style="font-size:12.5px;background:var(--primary-3);color:var(--primary-1);padding:3px 10px;border-radius:99px;font-weight:700;flex-shrink:0;">
                ${part.questions.length} câu luyện · ${part.ptsDesc}
              </span>
            </div>
            <strong style="font-size:16.5px;color:var(--text-main);display:block;margin-bottom:4px;">${part.title}</strong>
            <div class="ko" style="font-size:13px;color:var(--primary-1);font-weight:600;margin-bottom:8px;">유형: ${part.koTitle}</div>
            <div style="font-size:13.5px;color:var(--text-muted);margin-bottom:12px;display:flex;align-items:flex-start;gap:6px;">${ico("bulb", 16)} <span>${part.tip}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;">
              <span>Trả lời đúng: <strong>${st.correct}/${st.total}</strong></span>
              <span>Độ nhuần nhuyễn: <strong style="color:var(--primary-1);">${pct}%</strong></span>
            </div>
            <div class="progress-track">
              <div class="progress-fill ${barClass}" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  body.querySelectorAll("[data-open-part]").forEach((card) => {
    card.addEventListener("click", () => {
      navigate("practice", { sub: levelKey, skill, partId: card.dataset.openPart });
    });
  });

  function renderPartMasteryDrill(part) {
    let queue = [...part.questions];
    let loopRound = 0;
    const pickedMap = {};
    preloadAudioUrls(queue.slice(0, 12).map((q) => q.audioSrc).filter(Boolean));

    function drawDrill() {
      const wrongList = queue.filter((q) => pickedMap[q.id] !== undefined && pickedMap[q.id] !== q.answer);
      const correctCnt = queue.filter((q) => pickedMap[q.id] === q.answer).length;
      const doneCnt = queue.filter((q) => pickedMap[q.id] !== undefined).length;

      root.innerHTML = `
        <div class="container-web">
          <div class="breadcrumb-bar">
            <button type="button" id="bc-back-parts">← Quay lại danh sách ${skill === "listening" ? "Dạng Nghe" : "Dạng Đọc"}</button>
            <span>/</span>
            <span>${part.title}</span>
          </div>

          <div class="prediction-banner" style="margin-bottom:20px;padding:16px 22px;">
            <div>
              <span class="badge-orange" style="margin-bottom:6px;">${part.code} · ${part.range} ${loopRound > 0 ? `· Vòng ôn câu sai #${loopRound}` : ""}</span>
              <div style="margin-top:4px;">
                <strong style="color:var(--primary-1);">${ico("target", 17)} Mẹo giải nhanh dạng này:</strong>
                <span style="font-size:14.5px;margin-left:6px;">${part.tip}</span>
              </div>
            </div>
            <div>
              <div style="font-weight:800;color:var(--primary-1);margin-bottom:6px;text-align:right;">Đúng ${correctCnt}/${queue.length} câu</div>
              ${wrongList.length > 0 ? `
                <button type="button" class="btn-orange" id="btn-loop-wrong">${ico("refresh", 16)} Luyện lại ${wrongList.length} câu sai đến khi thuộc</button>
              ` : (doneCnt === queue.length && queue.length > 0 ? `
                <span style="background:rgba(58,202,116,0.18);color:#15803D;padding:6px 14px;border-radius:99px;font-weight:800;display:inline-flex;align-items:center;gap:6px;">${ico("trophy", 17)} Đã nhuần nhuyễn 100%!</span>
              ` : "")}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:18px;">
            ${queue.map((q, qi) => {
              const picked = pickedMap[q.id];
              return `
                <div class="box-kind">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;flex-wrap:wrap;">
                    <strong class="ko" style="color:var(--primary-1);">Câu ${qi + 1}/${queue.length}: ${q.question}</strong>
                    ${(q.audioSrc || q.audioText) ? `
                      <button type="button" class="btn-primary" data-q-audio="${q.audioSrc || ""}" data-q-tts="${q.audioText || ""}" style="padding:6px 14px;font-size:13.5px;">
                        ${ico("speaker", 16)} Phát Audio giọng Hàn chuẩn
                      </button>
                    ` : ""}
                  </div>

                  ${q.passage ? `
                    <pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:14px;border-radius:10px;font-size:16px;margin:0 0 12px;border-left:3px solid var(--primary);">${q.passage}</pre>
                  ` : ""}

                  <div class="grid-2">
                    ${q.options.map((opt, oi) => {
                      let bg = "#FFFFFF";
                      let border = "#E5E7EB";
                      if (picked !== undefined) {
                        if (oi === q.answer) { bg = "rgba(58,202,116,0.16)"; border = "var(--success)"; }
                        else if (oi === picked) { bg = "rgba(255,90,96,0.14)"; border = "var(--danger)"; }
                      }
                      return `
                        <button type="button" class="ko" data-qid="${q.id}" data-oi="${oi}" style="text-align:left;padding:11px 14px;border-radius:10px;border:1.5px solid ${border};background:${bg};cursor:pointer;font-size:15.5px;font-weight:500;">
                          ${["①", "②", "③", "④"][oi] || `${oi + 1}.`} ${opt}
                        </button>
                      `;
                    }).join("")}
                  </div>

                  ${picked !== undefined ? `
                    <div style="margin-top:12px;background:var(--primary-3);padding:10px 14px;border-radius:10px;font-size:14px;color:var(--primary-4);">
                      <strong>${picked === q.answer ? `${ico("check", 15)} Chính xác!` : `${ico("cross", 15)} Sai (Đã lưu vào Sổ tay câu sai)!`}</strong>
                      ${q.audioText ? `<div class="ko" style="margin-top:4px;"><strong>Transcript:</strong> ${q.audioText}</div>` : ""}
                      <div style="margin-top:4px;"><strong>Giải thích:</strong> ${q.explain}</div>
                    </div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;

      root.querySelector("#bc-back-parts").addEventListener("click", () => {
        navigate("practice", { sub: levelKey, skill });
      });
      const loopBtn = root.querySelector("#btn-loop-wrong");
      if (loopBtn) {
        loopBtn.addEventListener("click", () => {
          queue = [...wrongList];
          queue.forEach((w) => { delete pickedMap[w.id]; });
          loopRound += 1;
          window.scrollTo({ top: 0, behavior: "smooth" });
          drawDrill();
        });
      }
      root.querySelectorAll("[data-q-audio]").forEach((b) => {
        b.addEventListener("pointerdown", () => {
          if (b.dataset.qAudio) playAudio(b.dataset.qAudio);
          else speakKoreanTTS(b.dataset.qTts, 0.95);
        });
      });
      root.querySelectorAll("[data-qid]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const qObj = queue.find((x) => x.id === btn.dataset.qid);
          const oi = Number(btn.dataset.oi);
          pickedMap[qObj.id] = oi;
          store.recordQuestionResult(part.id, part.title, qObj, oi);
          drawDrill();
        });
      });
    }
    drawDrill();
  }

  function renderWongokjiStudio(container) {
    let promptIdx = 0;
    let draft = "";
    let showModel = false;
    let feedbackHtml = "";

    function formatIntoWongokjiCells(text, minTotalCells = 240) {
      const cells = [];
      const paragraphs = (text || "").split("\n");
      paragraphs.forEach((p, pi) => {
        if (pi > 0 && cells.length % 20 !== 0) {
          while (cells.length % 20 !== 0) cells.push("");
        }
        if (p.length > 0) {
          cells.push(" ");
          for (const ch of Array.from(p)) cells.push(ch);
        }
      });
      const targetRows = Math.max(Math.ceil(minTotalCells / 20), Math.ceil((cells.length + 1) / 20));
      const totalSlots = Math.min(720, targetRows * 20);
      while (cells.length < totalSlots) cells.push("");
      return cells.slice(0, 720);
    }

    function drawStudio() {
      const pr = WONGOKJI_PROMPTS[promptIdx];
      const cells = formatIntoWongokjiCells(draft, Math.min(300, pr.maxChars));
      const usedCells = draft.trim() ? formatIntoWongokjiCells(draft, 20).findLastIndex((c) => c !== "") + 1 : 0;

      container.innerHTML = `
        <div class="outline-ai" style="margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${WONGOKJI_PROMPTS.map((w, i) => `
                <button class="btn-outline-teal" data-widx="${i}" style="${i === promptIdx ? "background:var(--primary);color:#FFF;" : ""}">
                  ${w.badge}
                </button>
              `).join("")}
            </div>
            <span style="font-weight:700;color:${usedCells >= pr.minChars && usedCells <= pr.maxChars ? "var(--success)" : "var(--yellow-2)"};">
              Số ô 원고지 đã chiếm: ${usedCells} / ${pr.minChars}~${pr.maxChars} ô
            </span>
          </div>

          <h3 style="margin:0 0 6px;font-size:19px;">${pr.title}</h3>
          <p style="margin:0 0 12px;font-size:14px;color:var(--text-muted);">${pr.promptDetails}</p>

          <textarea id="wongokji-textarea" class="ko" rows="5" placeholder="Gõ bài viết tiếng Hàn vào đây (tự động thụt 1 ô đầu đoạn văn và dàn vào giấy kẻ ô vuông 원고지 bên dưới)..." style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid var(--primary);font-size:16px;line-height:1.6;">${draft}</textarea>

          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">
            <button class="btn-primary" id="btn-check-writing">${ico("sparkle", 16)} Kiểm tra quy tắc 원고지 &amp; Chấm điểm</button>
            <button class="btn-outline-teal" id="btn-fill-sample">${ico("workbook", 16)} Điền bài mẫu điểm cao vào giấy ô vuông</button>
            <button class="btn-outline-teal" id="btn-toggle-model">${showModel ? "Ẩn bài mẫu" : "Xem bài mẫu chuẩn NIIED"}</button>
          </div>

          ${feedbackHtml ? `<div style="margin-top:12px;background:#F8FAFB;padding:12px 16px;border-radius:10px;font-size:14px;">${feedbackHtml}</div>` : ""}
          ${showModel ? `<pre class="ko" style="white-space:pre-wrap;margin-top:12px;background:var(--primary-3);padding:14px;border-radius:10px;font-size:15px;">${pr.modelAnswer}</pre>` : ""}
        </div>

        <div class="box-kind">
          <strong style="font-size:15px;color:#C85A53;display:inline-flex;align-items:center;gap:7px;">${ico("exam", 18)} Bản xem trước Giấy kẻ ô vuông 원고지 (20 ô / hàng chuẩn thi thật TOPIK II)</strong>
          <div class="wongokji-scroll-wrap">
            <div class="wongokji-grid">
              ${cells.map((ch) => `<div class="wongokji-cell">${ch === " " ? "&nbsp;" : ch}</div>`).join("")}
            </div>
          </div>
        </div>
      `;

      container.querySelectorAll("[data-widx]").forEach((b) => {
        b.addEventListener("click", () => { promptIdx = Number(b.dataset.widx); draft = ""; feedbackHtml = ""; drawStudio(); });
      });

      const ta = container.querySelector("#wongokji-textarea");
      ta.addEventListener("input", (e) => {
        draft = e.target.value;
        const pos = ta.selectionStart;
        drawStudio();
        const newTa = container.querySelector("#wongokji-textarea");
        newTa.focus();
        newTa.setSelectionRange(pos, pos);
      });

      container.querySelector("#btn-fill-sample").addEventListener("click", () => { draft = pr.modelAnswer; drawStudio(); });
      container.querySelector("#btn-toggle-model").addEventListener("click", () => { showModel = !showModel; drawStudio(); });
      container.querySelector("#btn-check-writing").addEventListener("click", () => {
        const issues = [];
        if (usedCells < pr.minChars) issues.push(`${ico("warn", 15)} Chưa đủ độ dài tối thiểu (${usedCells}/${pr.minChars} ô).`);
        if (usedCells > pr.maxChars) issues.push(`${ico("warn", 15)} Vượt quá giới hạn ô cho phép (${usedCells}/${pr.maxChars} ô).`);
        if (/(아요|어요|습니다|ㅂ니다)[.?!]/.test(draft)) {
          issues.push(`${ico("cross", 15)} Phát hiện đuôi hội thoại (-아/어요 hoặc -습니다)! Câu 53–54 bắt buộc dùng văn phong viết (-다/는다).`);
        } else if (draft.trim().length > 20) {
          issues.push(`${ico("check", 15)} Văn phong viết (-다/는다) chuẩn quy định NIIED.`);
        }
        if (/(따라서|그러나|반면에|한편|또한)/.test(draft)) {
          issues.push(`${ico("check", 15)} Có sử dụng từ nối học thuật mạch lạc.`);
        } else {
          issues.push(`${ico("bulb", 15)} Gợi ý: Bổ sung các phó từ liên kết như '한편', '반면에', '따라서'.`);
        }
        feedbackHtml = `<strong>Kết quả Check quy chuẩn bài viết:</strong><ul style="margin:6px 0 0;padding-left:18px;list-style:none;">${issues.map((i) => `<li style="margin-bottom:4px;">${i}</li>`).join("")}</ul>`;
        drawStudio();
      });
    }

    drawStudio();
  }

  function renderTopikSpeakingRoom(container) {
    let tIdx = 0;
    let timerId = null;
    let phase = "idle";
    let secLeft = 0;
    let showSample = false;

    function stopTimer() {
      if (timerId) clearInterval(timerId);
      timerId = null;
      phase = "idle";
    }
    registerCleanup(stopTimer);

    function drawSpeaking() {
      const task = TOPIK_SPEAKING_TASKS[tIdx];
      container.innerHTML = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
          ${TOPIK_SPEAKING_TASKS.map((t, i) => `
            <button class="btn-outline-teal" data-tidx="${i}" style="${i === tIdx ? "background:var(--primary);color:#FFF;" : ""}">
              Câu ${t.num} (${t.level})
            </button>
          `).join("")}
        </div>

        <div class="box-kind">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
            <h3 style="margin:0;color:var(--primary-1);">${task.title}</h3>
            <span class="badge-orange" style="background:rgba(254,154,5,0.14);">
              Chuẩn bị: ${task.prepSec}s · Trả lời: ${task.speakSec}s
            </span>
          </div>

          <div style="background:var(--primary-3);padding:20px;border-radius:14px;margin-bottom:16px;">
            <div class="ko" style="font-size:20px;font-weight:700;margin-bottom:6px;">${task.prompt}</div>
            <div style="color:var(--text-muted);font-size:14.5px;">Dịch đề: ${task.vi}</div>
          </div>

          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
            <button class="btn-primary" id="btn-spk-start">
              ${phase === "idle" ? `${ico("clock", 17)} Bắt đầu bấm giờ chuẩn thi thật` : `${ico("stop", 16)} Dừng đồng hồ`}
            </button>
            <button class="btn-outline-teal" id="btn-spk-listen-q">${ico("speaker", 16)} Nghe đọc câu hỏi</button>
            <button class="btn-outline-teal" id="btn-spk-sample">${showSample ? "Ẩn câu trả lời mẫu" : `${ico("bulb", 16)} Xem câu trả lời mẫu điểm cao`}</button>
            ${phase !== "idle" ? `
              <span id="spk-timer-badge" style="font-size:18px;font-weight:800;color:${phase === "prep" ? "var(--yellow-2)" : "var(--danger)"};">
                ${phase === "prep" ? `${ico("clock", 18)} Thời gian chuẩn bị` : `${ico("mic", 18)} ĐANG TRẢ LỜI`}: ${secLeft}s
              </span>
            ` : ""}
          </div>

          ${showSample ? `
            <div style="background:#F8FAFB;padding:14px;border-radius:10px;border-left:4px solid var(--primary);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong>Bài nói mẫu tham khảo:</strong>
                <button class="btn-audio" id="btn-spk-play-sample">${ico("speaker", 18)}</button>
              </div>
              <p class="ko" style="margin:8px 0 0;font-size:16px;line-height:1.7;">${task.sample}</p>
            </div>
          ` : ""}
        </div>
      `;

      container.querySelectorAll("[data-tidx]").forEach((b) => {
        b.addEventListener("click", () => { stopTimer(); tIdx = Number(b.dataset.tidx); showSample = false; drawSpeaking(); });
      });
      container.querySelector("#btn-spk-listen-q").addEventListener("click", () => speakKoreanTTS(task.prompt));
      container.querySelector("#btn-spk-sample").addEventListener("click", () => { showSample = !showSample; drawSpeaking(); });
      const playSample = container.querySelector("#btn-spk-play-sample");
      if (playSample) playSample.addEventListener("click", () => speakKoreanTTS(task.sample));

      container.querySelector("#btn-spk-start").addEventListener("click", () => {
        if (phase !== "idle") { stopTimer(); drawSpeaking(); return; }
        phase = "prep";
        secLeft = task.prepSec;
        drawSpeaking();
        timerId = setInterval(() => {
          secLeft -= 1;
          if (secLeft <= 0) {
            if (phase === "prep") { phase = "speak"; secLeft = task.speakSec; }
            else stopTimer();
            drawSpeaking();
          } else {
            const badge = container.querySelector("#spk-timer-badge");
            if (badge) badge.innerHTML = `${phase === "prep" ? `${ico("clock", 18)} Thời gian chuẩn bị` : `${ico("mic", 18)} ĐANG TRẢ LỜI`}: ${secLeft}s`;
          }
        }, 1000);
      });
    }

    drawSpeaking();
  }
}
