import { store, playAudio, preloadAudioUrls, speakKoreanTTS } from "../store.js";

export function renderMockTestView(root, db, navigate, params = {}) {
  let levelKey = params.sub === "topik2" ? "topik2" : "topik1";
  let examMode = params.mode || "all"; // all | full | mini | hard
  let activeExam = null;

  const catalog = db.topik20Exams || { topik1: [], topik2: [] };

  function renderLobby() {
    const rawList = catalog[levelKey] || [];
    const list = examMode === "all" ? rawList : rawList.filter((e) => e.mode === examMode);

    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <span>Đề thi chính thức NIIED</span>
          <span>▶</span>
          <span>${levelKey === "topik1" ? "10 Đề TOPIK I Công Khai Mới Nhất (Kỳ 37 → 102)" : "10 Đề TOPIK II Công Khai Mới Nhất (Kỳ 37 → 102)"}</span>
        </div>

        <div class="prediction-banner" style="padding:16px 22px;margin-bottom:20px;">
          <div>
            <strong style="color:var(--primary-1);font-size:16px;">🎧 Kho 20 Đề Thi TOPIK Chính Thức Công Bố (Kỳ 37 → Kỳ 102)</strong>
            <div style="font-size:13.5px;color:var(--text-muted);margin-top:2px;">
              100% câu hỏi Nghe (듣기) sử dụng <strong>file âm thanh giọng đọc Hàn tự nhiên chất lượng cao (.mp3)</strong> đã được cache sẵn — chia đúng <strong>1교시 듣기 · 쓰기</strong> và <strong>2교시 읽기</strong> như đề thi thật!
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div class="exam-nav">
            <button class="${examMode === "all" ? "active" : ""}" data-em="all">Tất cả (${rawList.length} đề)</button>
            <button class="${examMode === "full" ? "active" : ""}" data-em="full">Full test</button>
            <button class="${examMode === "mini" ? "active" : ""}" data-em="mini">Mini test</button>
            <button class="${examMode === "hard" ? "active" : ""}" data-em="hard">Hard test</button>
          </div>

          <select id="mock-lv-sel" class="box-select" style="margin-bottom:22px;">
            <option value="topik1" ${levelKey === "topik1" ? "selected" : ""}>10 Đề chính thức TOPIK I (Cấp 1–2)</option>
            <option value="topik2" ${levelKey === "topik2" ? "selected" : ""}>10 Đề chính thức TOPIK II (Cấp 3–6)</option>
          </select>
        </div>

        <div class="grid-2">
          ${list.map((ex) => {
            const past = store.state.examHistory.find((h) => h.examId === ex.id);
            return `
              <div class="box-kind" style="padding:22px;">
                ${ex.ribbon ? `<div class="test-tape">${ex.ribbon}</div>` : ""}
                <h3 style="margin:0 0 6px;font-size:18px;padding-right:56px;">${ex.title}</h3>
                <div style="font-size:13px;color:var(--primary-1);font-weight:700;margin-bottom:8px;">
                  📋 ${ex.structureDesc}
                </div>
                <div style="font-size:13.5px;color:var(--text-muted);margin-bottom:14px;">
                  ⏱️ Thời gian chuẩn: <strong>${ex.minutes} phút</strong> &nbsp;|&nbsp; 🎯 Điểm đỗ: <strong>${ex.passScore}/${ex.maxScore}</strong> &nbsp;|&nbsp; Câu hỏi: <strong>${ex.questions.length} câu chọn lọc${ex.writingSection ? " + 3 câu Viết" : ""}</strong>
                </div>
                ${past ? `
                  <div style="font-size:13.5px;color:var(--success);font-weight:700;margin-bottom:12px;">
                    ✔ Kết quả gần nhất: ${past.score}/${past.maxScore} điểm (${past.grade})
                  </div>
                ` : ""}
                <button class="btn-primary" data-start-exam="${ex.id}">Vào phòng thi Kỳ ${ex.round}</button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    root.querySelectorAll("[data-em]").forEach((b) => {
      b.addEventListener("click", () => { examMode = b.dataset.em; renderLobby(); });
    });
    root.querySelector("#mock-lv-sel").addEventListener("change", (e) => {
      levelKey = e.target.value;
      renderLobby();
    });
    root.querySelectorAll("[data-start-exam]").forEach((b) => {
      b.addEventListener("click", () => {
        activeExam = catalog[levelKey].find((x) => x.id === b.dataset.startExam);
        runExamRoom(activeExam);
      });
    });
  }

  function runExamRoom(exam) {
    let qIdx = 0;
    let showingWritingTab = false;
    let writingDraft53 = "";
    let writingDraft54 = "";
    const answers = {};
    const flagged = new Set();
    let submitted = false;
    let secRemaining = exam.minutes * 60;

    // Preload all listening MP3s of this exam immediately so voice plays in 0ms!
    preloadAudioUrls(exam.questions.map((q) => q.audioSrc).filter(Boolean));

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

    function computeGrade(score, maxScore) {
      if (maxScore === 200) {
        if (score >= 140) return "Đạt TOPIK I · Cấp 2 (2급)";
        if (score >= 80) return "Đạt TOPIK I · Cấp 1 (1급)";
        return "Chưa đạt Cấp 1 (< 80đ)";
      }
      if (score >= 230) return "Đạt TOPIK II · Cấp 6 (6급)";
      if (score >= 190) return "Đạt TOPIK II · Cấp 5 (5급)";
      if (score >= 150) return "Đạt TOPIK II · Cấp 4 (4급)";
      if (score >= 120) return "Đạt TOPIK II · Cấp 3 (3급)";
      return "Chưa đạt Cấp 3 (< 120đ)";
    }

    function submitExam() {
      submitted = true;
      clearInterval(timer);
      let earnedWeight = 0;
      let totalWeight = 0;
      let correctCount = 0;

      exam.questions.forEach((q) => {
        const w = q.pts || 3;
        totalWeight += w;
        const userChoice = answers[q.id];
        if (userChoice === q.answer) {
          correctCount += 1;
          earnedWeight += w;
        }
        store.recordQuestionResult(exam.id, exam.title, q, userChoice !== undefined ? userChoice : -1);
      });

      const score = Math.round((earnedWeight / Math.max(1, totalWeight)) * exam.maxScore);
      const grade = computeGrade(score, exam.maxScore);
      store.state.examHistory.unshift({
        examId: exam.id,
        examTitle: exam.title,
        score,
        maxScore: exam.maxScore,
        grade,
        correctCount,
        totalCount: exam.questions.length,
        date: new Date().toLocaleDateString("vi-VN")
      });
      store.save();
      drawRoom({ score, grade, correctCount });
    }

    function drawRoom(resultSummary = null) {
      const q = exam.questions[qIdx];
      // Preload next 4 question audio files
      preloadAudioUrls(exam.questions.slice(qIdx, qIdx + 4).map((x) => x.audioSrc).filter(Boolean));

      const m = String(Math.floor(secRemaining / 60)).padStart(2, "0");
      const s = String(secRemaining % 60).padStart(2, "0");

      const listenIndices = exam.questions.map((item, i) => ({ item, i })).filter((x) => (x.item.sectionGroup || "").includes("듣기"));
      const readIndices = exam.questions.map((item, i) => ({ item, i })).filter((x) => (x.item.sectionGroup || "").includes("읽기"));

      root.innerHTML = `
        <div class="container-web">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
            <button class="btn-outline-teal" id="btn-exit-exam">← Thoát phòng thi</button>
            <strong style="font-size:17.5px;">${exam.title}</strong>
            <div style="display:flex;align-items:center;gap:10px;">
              <span id="exam-clock" style="background:#FFF;border:2px solid var(--primary);padding:6px 16px;border-radius:99px;font-weight:800;color:var(--primary-1);">
                ⏱️ ${m}:${s}
              </span>
              ${!submitted ? `<button class="btn-orange" id="btn-submit-exam">Nộp bài &amp; Chấm điểm</button>` : ""}
            </div>
          </div>

          <!-- Authentic Official TOPIK Section Bar (1교시 듣기 / 쓰기 / 2교시 읽기) -->
          <div class="skill-pills-row" style="margin-bottom:16px;">
            <button type="button" class="btn-skill ${!showingWritingTab && (q.sectionGroup || "").includes("듣기") ? "active" : ""}" id="tab-sec-listen">
              🎧 1교시 · 듣기 (Nghe hiểu · ${listenIndices.length} câu)
            </button>
            ${exam.writingSection ? `
              <button type="button" class="btn-skill ${showingWritingTab ? "active" : ""}" id="tab-sec-write">
                ✍️ 1교시 · 쓰기 (Tự luận Câu 51~54)
              </button>
            ` : ""}
            <button type="button" class="btn-skill ${!showingWritingTab && (q.sectionGroup || "").includes("읽기") ? "active" : ""}" id="tab-sec-read">
              📖 2교시 · 읽기 (Đọc hiểu · ${readIndices.length} câu)
            </button>
          </div>

          ${resultSummary ? `
            <div class="prediction-banner" style="margin-bottom:20px;">
              <div>
                <h2 style="margin:0 0 4px;color:var(--primary-1);">🎉 Điểm quy đổi chuẩn NIIED: ${resultSummary.score}/${exam.maxScore} điểm — ${resultSummary.grade}</h2>
                <div>Trả lời đúng ${resultSummary.correctCount}/${exam.questions.length} câu · Các câu làm sai đã được lưu vào <strong>Sổ tay câu sai</strong>!</div>
              </div>
              <button class="btn-primary" id="btn-go-check-center">Xem Sổ tay câu sai →</button>
            </div>
          ` : ""}

          <div class="exam-room-grid">
            ${showingWritingTab && exam.writingSection ? `
              <div class="box-kind" style="padding:24px;">
                <h3 style="margin:0 0 12px;color:var(--primary-1);">1교시 쓰기 영역 · Phần Thi Viết Tự Luận TOPIK II (Câu 51 ~ 54)</h3>
                <div style="background:#F8FAFB;padding:14px;border-radius:10px;margin-bottom:14px;">
                  <strong class="ko" style="display:block;margin-bottom:6px;">[51~52] ${exam.writingSection.q51}</strong>
                  <input class="ko" placeholder="Nhập biểu hiện điền vào ( ㄱ )..." style="width:100%;padding:9px 14px;border-radius:8px;border:1.5px solid #CBD5E1;" />
                </div>
                <div style="background:#F8FAFB;padding:14px;border-radius:10px;margin-bottom:14px;">
                  <strong class="ko" style="display:block;margin-bottom:6px;">[53] ${exam.writingSection.q53}</strong>
                  <textarea id="exam-w53" class="ko" rows="4" placeholder="Viết đoạn phân tích số liệu 200~300 chữ (văn phong -다/는다)..." style="width:100%;padding:10px;border-radius:8px;border:1.5px solid #CBD5E1;">${writingDraft53}</textarea>
                </div>
                <div style="background:#F8FAFB;padding:14px;border-radius:10px;">
                  <strong class="ko" style="display:block;margin-bottom:6px;">[54] ${exam.writingSection.q54}</strong>
                  <textarea id="exam-w54" class="ko" rows="6" placeholder="Viết bài nghị luận xã hội 600~700 chữ..." style="width:100%;padding:10px;border-radius:8px;border:1.5px solid #CBD5E1;">${writingDraft54}</textarea>
                </div>
              </div>
            ` : `
              <!-- Active Question Paper Sheet -->
              <div class="box-kind" style="padding:24px;">
                <div style="background:#F1F5F9;padding:8px 14px;border-radius:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                  <strong class="ko" style="font-size:14px;color:#334155;">※ ${q.sec || q.sectionGroup || "문항"}</strong>
                  <span style="font-size:12.5px;font-weight:700;color:var(--primary-1);">Câu ${qIdx + 1} / ${exam.questions.length} (${q.pts || 3}점)</span>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
                  <strong class="ko" style="font-size:17px;">${qIdx + 1}. ${q.question}</strong>
                  <div style="display:flex;gap:8px;">
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

                ${q.passage ? `<pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:16px;border-radius:10px;font-size:17px;line-height:1.75;margin:0 0 16px;border:1px solid #E2E8F0;">${q.passage}</pre>` : ""}

                <div style="display:flex;flex-direction:column;gap:10px;">
                  ${q.options.map((opt, oi) => {
                    const chosen = answers[q.id] === oi;
                    let border = chosen ? "var(--primary)" : "#E5E7EB";
                    let bg = chosen ? "var(--primary-3)" : "#FFFFFF";
                    if (submitted) {
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

                ${submitted ? `
                  <div style="margin-top:16px;background:var(--primary-3);padding:12px 16px;border-radius:10px;font-size:14px;color:var(--primary-4);">
                    ${q.audioText ? `<div class="ko" style="margin-bottom:4px;"><strong>Lời thoại Audio (대본):</strong> ${q.audioText}</div>` : ""}
                    <div><strong>Giải thích đáp án:</strong> ${q.explain}</div>
                  </div>
                ` : ""}

                <div style="display:flex;justify-content:space-between;margin-top:20px;">
                  <button class="btn-outline-teal" id="btn-prev-q" ${qIdx === 0 ? "disabled" : ""}>← Câu trước</button>
                  <button class="btn-primary" id="btn-next-q" ${qIdx === exam.questions.length - 1 ? "disabled" : ""}>Câu tiếp theo →</button>
                </div>
              </div>
            `}

            <!-- Right Official Answer Sheet Navigator (OMR / IBT Palette) -->
            <div class="box-kind">
              <strong style="display:block;margin-bottom:8px;font-size:14.5px;color:var(--primary-1);">Phiếu trả lời · 듣기 (Nghe)</strong>
              <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:14px;">
                ${listenIndices.map(({ item, i }) => renderNavCell(item, i)).join("")}
              </div>

              <strong style="display:block;margin-bottom:8px;font-size:14.5px;color:var(--primary-1);">Phiếu trả lời · 읽기 (Đọc)</strong>
              <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                ${readIndices.map(({ item, i }) => renderNavCell(item, i)).join("")}
              </div>
            </div>
          </div>
        </div>
      `;

      function renderNavCell(item, i) {
        const ans = answers[item.id] !== undefined;
        const isFl = flagged.has(item.id);
        let bg = ans ? "var(--primary)" : "#F2F4F7";
        let col = ans ? "#FFFFFF" : "var(--text-main)";
        if (submitted) {
          bg = answers[item.id] === item.answer ? "var(--success)" : "var(--danger)";
          col = "#FFFFFF";
        } else if (isFl) {
          bg = "var(--yellow-2)";
          col = "#FFFFFF";
        }
        return `
          <button type="button" data-jump="${i}" style="height:34px;border-radius:7px;border:${!showingWritingTab && i === qIdx ? "2px solid #111" : "none"};background:${bg};color:${col};font-weight:700;font-size:13px;cursor:pointer;">
            ${i + 1}
          </button>
        `;
      }

      root.querySelector("#btn-exit-exam").addEventListener("click", () => {
        clearInterval(timer);
        activeExam = null;
        renderLobby();
      });

      root.querySelector("#tab-sec-listen").addEventListener("click", () => {
        showingWritingTab = false;
        if (listenIndices.length) qIdx = listenIndices[0].i;
        drawRoom(resultSummary);
      });
      root.querySelector("#tab-sec-read").addEventListener("click", () => {
        showingWritingTab = false;
        if (readIndices.length) qIdx = readIndices[0].i;
        drawRoom(resultSummary);
      });
      const writeTabBtn = root.querySelector("#tab-sec-write");
      if (writeTabBtn) {
        writeTabBtn.addEventListener("click", () => {
          showingWritingTab = true;
          drawRoom(resultSummary);
        });
      }

      const w53 = root.querySelector("#exam-w53");
      if (w53) w53.addEventListener("input", (e) => { writingDraft53 = e.target.value; });
      const w54 = root.querySelector("#exam-w54");
      if (w54) w54.addEventListener("input", (e) => { writingDraft54 = e.target.value; });

      const subBtn = root.querySelector("#btn-submit-exam");
      if (subBtn) subBtn.addEventListener("click", submitExam);

      const checkCenterBtn = root.querySelector("#btn-go-check-center");
      if (checkCenterBtn) checkCenterBtn.addEventListener("click", () => navigate("check-tools", { tab: "mistakes" }));

      const playBtn = root.querySelector("#btn-q-play");
      if (playBtn) {
        playBtn.addEventListener("pointerdown", () => {
          if (q.audioSrc) playAudio(q.audioSrc);
          else speakKoreanTTS(q.audioText);
        });
      }

      const flagBtn = root.querySelector("#btn-q-flag");
      if (flagBtn) {
        flagBtn.addEventListener("click", () => {
          if (flagged.has(q.id)) flagged.delete(q.id); else flagged.add(q.id);
          drawRoom(resultSummary);
        });
      }

      if (!submitted && !showingWritingTab) {
        root.querySelectorAll("[data-pick]").forEach((b) => {
          b.addEventListener("click", () => {
            answers[q.id] = Number(b.dataset.pick);
            drawRoom(resultSummary);
          });
        });
      }

      root.querySelector("#btn-prev-q")?.addEventListener("click", () => { if (qIdx > 0) { qIdx -= 1; drawRoom(resultSummary); } });
      root.querySelector("#btn-next-q")?.addEventListener("click", () => { if (qIdx < exam.questions.length - 1) { qIdx += 1; drawRoom(resultSummary); } });
      root.querySelectorAll("[data-jump]").forEach((b) => {
        b.addEventListener("click", () => {
          showingWritingTab = false;
          qIdx = Number(b.dataset.jump);
          drawRoom(resultSummary);
        });
      });
    }

    drawRoom();
  }

  renderLobby();
}
