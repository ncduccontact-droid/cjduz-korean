import { store, playAudio, speakKoreanTTS } from "../store.js";
import { TOPIK1_PARTS, TOPIK2_PARTS } from "../topik-bank.js";

export function renderMockTestView(root, db, navigate, params = {}) {
  let levelKey = params.sub === "topik2" ? "topik2" : "topik1";
  let examMode = params.mode || "full"; // full | mini | hard
  let activeExam = null;

  // Build authentic Mock Exams combining curated TOPIK items + extracted Anki Cloze items
  function buildExamCatalog() {
    const t1Base = TOPIK1_PARTS.flatMap((p) => p.questions.map((q) => ({ ...q, partId: p.id, partTitle: p.title })));
    const t1Cloze = db.topik1Bank
      .filter((c) => c.cloze && c.korean)
      .slice(0, 12)
      .map((c, idx, arr) => {
        const others = arr.filter((o) => o.id !== c.id).slice(0, 3).map((o) => o.korean);
        const opts = [c.korean, ...others].sort((a, b) => a.localeCompare(b));
        return {
          id: `mock_t1_${c.id}`,
          partId: "mock_topik1_cloze",
          partTitle: "Đọc điền khuyết TOPIK I",
          passage: c.cloze,
          audioSrc: c.exampleAudio,
          question: "Chọn đáp án đúng nhất điền vào chỗ trống:",
          options: opts,
          answer: opts.indexOf(c.korean),
          explain: `${c.exampleKo} (${c.exampleVi})`
        };
      });

    const t2Base = TOPIK2_PARTS.flatMap((p) => p.questions.map((q) => ({ ...q, partId: p.id, partTitle: p.title })));

    return {
      topik1: [
        { id: "exam_t1_full_1", mode: "full", ribbon: "IBT MỚI", title: "Đề Thi Thử Chuẩn TOPIK I — Đề số 01", minutes: 40, passScore: 80, maxScore: 200, questions: [...t1Base, ...t1Cloze.slice(0, 8)] },
        { id: "exam_t1_full_2", mode: "full", ribbon: "HOT", title: "Đề Thi Thử Chuẩn TOPIK I — Đề số 02", minutes: 40, passScore: 80, maxScore: 200, questions: [...t1Cloze.slice(4, 12), ...t1Base] },
        { id: "exam_t1_mini_1", mode: "mini", ribbon: "15 PHÚT", title: "Mini Test TOPIK I — Đánh giá tốc độ #01", minutes: 15, passScore: 80, maxScore: 200, questions: [...t1Base.slice(0, 5), ...t1Cloze.slice(0, 5)] },
        { id: "exam_t1_hard_1", mode: "hard", ribbon: "CÂU BẪY", title: "Hard Test TOPIK I — Sắp xếp câu & Bẫy tiểu từ", minutes: 20, passScore: 140, maxScore: 200, questions: [...t1Base.slice(-4), ...t1Cloze.slice(6, 12)] }
      ],
      topik2: [
        { id: "exam_t2_full_1", mode: "full", ribbon: "IBT MỚI", title: "Đề Thi Thử TOPIK II — Tổng hợp Nghe & Đọc #01", minutes: 45, passScore: 120, maxScore: 300, questions: [...t2Base, ...t1Base.slice(-3)] },
        { id: "exam_t2_mini_1", mode: "mini", ribbon: "20 PHÚT", title: "Mini Test TOPIK II — Từ đồng nghĩa & Ngữ pháp", minutes: 20, passScore: 120, maxScore: 300, questions: t2Base },
        { id: "exam_t2_hard_1", mode: "hard", ribbon: "CẤP 5-6", title: "Hard Test TOPIK II — Phân loại Trung – Cao cấp", minutes: 25, passScore: 190, maxScore: 300, questions: t2Base }
      ]
    };
  }

  const catalog = buildExamCatalog();

  function renderLobby() {
    const list = catalog[levelKey].filter((e) => e.mode === examMode);

    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <span>Đề thi</span>
          <span>▶</span>
          <span>${levelKey === "topik1" ? "TOPIK I (Cấp 1–2)" : "TOPIK II (Cấp 3–6)"}</span>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <!-- Segmented Pill Toggle (.exam-nav border: 2px solid #00B2A5 like Migii) -->
          <div class="exam-nav">
            <button class="${examMode === "full" ? "active" : ""}" data-em="full">Full test</button>
            <button class="${examMode === "mini" ? "active" : ""}" data-em="mini">Mini test</button>
            <button class="${examMode === "hard" ? "active" : ""}" data-em="hard">Hard test</button>
          </div>

          <select id="mock-lv-sel" class="box-select" style="margin-bottom:22px;">
            <option value="topik1" ${levelKey === "topik1" ? "selected" : ""}>Kho đề TOPIK I</option>
            <option value="topik2" ${levelKey === "topik2" ? "selected" : ""}>Kho đề TOPIK II</option>
          </select>
        </div>

        <div class="grid-2">
          ${list.map((ex) => {
            const past = store.state.examHistory.find((h) => h.examId === ex.id);
            return `
              <div class="box-kind" style="padding:22px;">
                ${ex.ribbon ? `<div class="test-tape">${ex.ribbon}</div>` : ""}
                <h3 style="margin:0 0 8px;font-size:18.5px;padding-right:48px;">${ex.title}</h3>
                <div style="font-size:14px;color:var(--text-muted);margin-bottom:14px;">
                  ⏱️ Thời gian: <strong>${ex.minutes} phút</strong> &nbsp;|&nbsp; 🎯 Điểm đạt: <strong>${ex.passScore}/${ex.maxScore}</strong> &nbsp;|&nbsp; 📋 Số câu: <strong>${ex.questions.length}</strong>
                </div>
                ${past ? `
                  <div style="font-size:13.5px;color:var(--primary-1);font-weight:600;margin-bottom:12px;">
                    ✔ Lần thi gần nhất: ${past.score}/${past.maxScore} điểm (${past.grade})
                  </div>
                ` : ""}
                <button class="btn-primary" data-start-exam="${ex.id}">Bắt đầu làm bài</button>
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
    const answers = {};
    const flagged = new Set();
    let submitted = false;
    let secRemaining = exam.minutes * 60;

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
        if (score >= 140) return "Đạt TOPIK I · Cấp 2";
        if (score >= 80) return "Đạt TOPIK I · Cấp 1";
        return "Chưa đạt Cấp 1 (Cần >= 80đ)";
      }
      if (score >= 230) return "Đạt TOPIK II · Cấp 6";
      if (score >= 190) return "Đạt TOPIK II · Cấp 5";
      if (score >= 150) return "Đạt TOPIK II · Cấp 4";
      if (score >= 120) return "Đạt TOPIK II · Cấp 3";
      return "Chưa đạt Cấp 3 (Cần >= 120đ)";
    }

    function submitExam() {
      submitted = true;
      clearInterval(timer);
      let correctCount = 0;
      exam.questions.forEach((q) => {
        const userChoice = answers[q.id];
        if (userChoice === q.answer) {
          correctCount += 1;
        }
        if (userChoice !== undefined) {
          store.recordQuestionResult(q.partId || "mock_exam", q.partTitle || exam.title, q, userChoice);
        } else {
          store.recordQuestionResult(q.partId || "mock_exam", q.partTitle || exam.title, q, -1);
        }
      });
      const score = Math.round((correctCount / exam.questions.length) * exam.maxScore);
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
      const m = String(Math.floor(secRemaining / 60)).padStart(2, "0");
      const s = String(secRemaining % 60).padStart(2, "0");

      root.innerHTML = `
        <div class="container-web">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
            <button class="btn-outline-teal" id="btn-exit-exam">← Thoát phòng thi</button>
            <strong style="font-size:18px;">${exam.title}</strong>
            <div style="display:flex;align-items:center;gap:12px;">
              <span id="exam-clock" style="background:#FFF;border:2px solid var(--primary);padding:6px 16px;border-radius:99px;font-weight:800;color:var(--primary-1);">
                ⏱️ ${m}:${s}
              </span>
              ${!submitted ? `<button class="btn-orange" id="btn-submit-exam">Nộp bài &amp; Check điểm</button>` : ""}
            </div>
          </div>

          ${resultSummary ? `
            <div class="prediction-banner" style="margin-bottom:20px;">
              <div>
                <h2 style="margin:0 0 4px;color:var(--primary-1);">🎉 Kết quả: ${resultSummary.score}/${exam.maxScore} điểm — ${resultSummary.grade}</h2>
                <div>Đúng ${resultSummary.correctCount}/${exam.questions.length} câu · Các câu sai/bỏ trống đã được tự động đưa vào <strong>Sổ tay câu sai</strong> trong mục Check &amp; Công cụ!</div>
              </div>
              <button class="btn-primary" id="btn-go-check-center">Mở Trung tâm Check →</button>
            </div>
          ` : ""}

          <div class="exam-room-grid">
            <!-- Active IBT Question Card -->
            <div class="box-kind" style="padding:24px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-weight:700;color:var(--primary-1);">Câu ${qIdx + 1} / ${exam.questions.length}</span>
                <div style="display:flex;gap:8px;">
                  ${(q.audioSrc || q.audioText) ? `<button class="btn-outline-teal" id="btn-q-play" style="padding:5px 12px;font-size:13px;">🔊 Nghe Audio</button>` : ""}
                  <button class="btn-outline-teal" id="btn-q-flag" style="padding:5px 12px;font-size:13px;${flagged.has(q.id) ? "background:rgba(254,154,5,0.16);border-color:var(--yellow-2);color:#B45309;" : ""}">
                    🚩 ${flagged.has(q.id) ? "Đã gắn cờ phân vân" : "Gắn cờ xem lại"}
                  </button>
                </div>
              </div>

              <p style="font-weight:600;margin:0 0 12px;">${q.question}</p>
              ${q.passage ? `<pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:14px;border-radius:10px;font-size:16.5px;margin:0 0 16px;">${q.passage}</pre>` : ""}

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
                <div style="margin-top:16px;background:var(--primary-3);padding:12px 14px;border-radius:10px;font-size:14px;color:var(--primary-4);">
                  <strong>Giải thích chi tiết:</strong> ${q.explain}
                </div>
              ` : ""}

              <div style="display:flex;justify-content:space-between;margin-top:20px;">
                <button class="btn-outline-teal" id="btn-prev-q" ${qIdx === 0 ? "disabled" : ""}>← Câu trước</button>
                <button class="btn-primary" id="btn-next-q" ${qIdx === exam.questions.length - 1 ? "disabled" : ""}>Câu tiếp →</button>
              </div>
            </div>

            <!-- Right Question Palette (IBT Navigator) -->
            <div class="box-kind">
              <strong style="display:block;margin-bottom:10px;font-size:15px;">Bảng danh sách câu hỏi</strong>
              <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                ${exam.questions.map((item, i) => {
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
                    <button type="button" data-jump="${i}" style="height:36px;border-radius:8px;border:${i === qIdx ? "2px solid #222" : "none"};background:${bg};color:${col};font-weight:700;cursor:pointer;">
                      ${i + 1}
                    </button>
                  `;
                }).join("")}
              </div>
            </div>
          </div>
        </div>
      `;

      root.querySelector("#btn-exit-exam").addEventListener("click", () => {
        clearInterval(timer);
        activeExam = null;
        renderLobby();
      });

      const subBtn = root.querySelector("#btn-submit-exam");
      if (subBtn) subBtn.addEventListener("click", submitExam);

      const checkCenterBtn = root.querySelector("#btn-go-check-center");
      if (checkCenterBtn) checkCenterBtn.addEventListener("click", () => navigate("check-tools"));

      const playBtn = root.querySelector("#btn-q-play");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          if (q.audioSrc) playAudio(q.audioSrc); else speakKoreanTTS(q.audioText);
        });
      }

      root.querySelector("#btn-q-flag").addEventListener("click", () => {
        if (flagged.has(q.id)) flagged.delete(q.id); else flagged.add(q.id);
        drawRoom(resultSummary);
      });

      if (!submitted) {
        root.querySelectorAll("[data-pick]").forEach((b) => {
          b.addEventListener("click", () => {
            answers[q.id] = Number(b.dataset.pick);
            drawRoom(resultSummary);
          });
        });
      }

      root.querySelector("#btn-prev-q").addEventListener("click", () => { if (qIdx > 0) { qIdx -= 1; drawRoom(resultSummary); } });
      root.querySelector("#btn-next-q").addEventListener("click", () => { if (qIdx < exam.questions.length - 1) { qIdx += 1; drawRoom(resultSummary); } });
      root.querySelectorAll("[data-jump]").forEach((b) => {
        b.addEventListener("click", () => { qIdx = Number(b.dataset.jump); drawRoom(resultSummary); });
      });
    }

    drawRoom();
  }

  renderLobby();
}
