import { store, DEFAULT_ROADMAP_PROFILE, normalizeBookId, getBookWords, getBookCurriculum, evaluateRoadmapScore, renderQuizHistoryPillHTML } from "../store.js?v=20261127-12";

const PLACEMENT_QUESTIONS = [
  { q: "1. Chọn câu chào lịch sự khi mới gặp lần đầu:", opts: ["안녕히 가세요.", "만나서 반갑습니다.", "잘 먹겠습니다.", "주말 잘 보내세요."], ans: 1 },
  { q: "2. Điền tiểu từ đúng: '저는 도서관(   ) 한국어를 공부합니다.'", opts: ["에", "에서", "을", "하고"], ans: 1 },
  { q: "3. Dạng chia lịch sự (-아/어요) đúng của động từ '듣다' (nghe) là:", opts: ["듣어요", "들어요", "드러요", "듣아요"], ans: 1 },
  { q: "4. Chọn từ nối hợp lý: '이 옷은 디자인이 예뻐요. (     ) 값이 너무 비싸요.'", opts: ["그래서", "그런데", "그러니까", "그리고"], ans: 1 },
  { q: "5. Cụm từ đồng nghĩa với '영향을 주다' trong đề Đọc TOPIK II là:", opts: ["영향을 미치다", "관심을 가지다", "노력을 기울이다", "마음을 먹다"], ans: 0 },
  { q: "6. Quán dụng ngữ '발이 넓다' mang ý nghĩa gì?", opts: ["Đi bộ rất nhanh", "Quen biết rộng, giao thiệp rộng", "Tiêu xài hào phóng", "Mắt nhìn tinh tế"], ans: 1 }
];

export const STAGE_LABELS = {
  hangeul: "Nhập môn & Quyển 1",
  q1: "Quyển 1 · Sơ cấp 1",
  q2: "Quyển 2 · Sơ cấp 2",
  q3: "Quyển 3 · Trung cấp 1",
  q4: "Quyển 4 · Trung cấp 2",
  q5: "Quyển 5 · Cao cấp 1",
  q6: "Quyển 6 · Cao cấp 2",
  zero: "Nhập môn Hangeul",
  sc1: "Quyển 1 · Sơ cấp 1",
  sc2: "Quyển 2 · Sơ cấp 2",
  tc3: "Quyển 3–4 · Trung cấp"
};

export const TRACK_LABELS = {
  balanced: "TOPIK × Giao tiếp",
  topik_intensive: "Chuyên sâu giải đề",
  speaking_first: "Ưu tiên Nghe – Nói"
};

export function getGuidedStudyPlan(db, navigate, startGuidedStep = null) {
  const profile = store.state.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
  const startBookRaw = profile.startBook || "q1";
  const isHangeulIntro = startBookRaw === "hangeul";
  const bookId = normalizeBookId(startBookRaw);
  const bookCur = getBookCurriculum(db, bookId);
  const bookPool = getBookWords(db, bookId);
  const chapters = bookCur?.chapters || [];
  const isTopik2 = ["q3", "q4", "q5", "q6"].includes(bookId);

  const allSubUnits = [];
  chapters.forEach((ch) => {
    const chWords = bookPool.filter((w) => w.lesson === ch.lesson);
    (ch.parts || [{ part: 1, title: "Phần 1 · Từ vựng" }]).forEach((pt) => {
      const pWords = chWords.filter((w) => Number(w.part || 1) === pt.part);
      allSubUnits.push({
        lesson: ch.lesson,
        lessonTitle: ch.title,
        part: pt.part,
        partTitle: pt.title,
        words: pWords.length ? pWords : chWords.slice(0, 12)
      });
    });
  });
  if (allSubUnits.length === 0) {
    allSubUnits.push({ lesson: 1, lessonTitle: "Giới thiệu", part: 1, partTitle: "Phần 1 · Quốc gia", words: bookPool.slice(0, 12) });
  }

  const launch = (day, stepIdx, totalSteps, label, route, routeParams) => {
    if (typeof startGuidedStep === "function") {
      startGuidedStep({ day, stepIdx, totalSteps, label });
    }
    navigate(route, routeParams);
  };

  const days = Array.from({ length: 30 }, (_, idx) => {
    const day = idx + 1;
    const isMilestone = day % 5 === 0;
    const unit = allSubUnits[idx % allSubUnits.length];
    const lsNum = unit.lesson;
    const pMast = unit.words.filter((w) => store.isMastered(w.id)).length;
    const wbStat = store.state.workbookScores?.[`${bookId}_${lsNum}`];
    const trCnt = store.state.translationDone?.[`${bookId}_${lsNum}`] || 0;

    const maxType = isTopik2 ? 10 : 8;
    const typeRanges = {
      q1: [1, 2, 3, 4],
      q2: [4, 5, 6, 7, 8],
      q3: [1, 2, 3, 4, 5],
      q4: [4, 5, 6, 7, 8],
      q5: [7, 8, 9, 10],
      q6: [8, 9, 10]
    };
    const allowedTypes = typeRanges[bookId] || [1, 2, 3, 4, 5, 6, 7, maxType];
    const dNum = allowedTypes[idx % allowedTypes.length];
    const skillKey = day % 2 === 1 ? "listening" : "reading";
    const segTypeId = `${isTopik2 ? "t2" : "t1"}_${skillKey === "listening" ? "l" : "r"}_d${dNum}`;

    let rawTasks = [];
    let shortTopic = "";

    if (isHangeulIntro && day <= 3) {
      const hTopics = ["14 Phụ âm & Nguyên âm đơn", "Phụ âm căng & Patchim", "7 Quy tắc biến âm"];
      shortTopic = `Nhập môn · ${hTopics[day - 1]}`;
      rawTasks = [
        {
          tag: "Bước 1 · Từ & Chữ",
          icon: "book",
          label: `Hangeul (${hTopics[day - 1]}) & ${unit.partTitle}`,
          route: "theory",
          params: day === 1 ? { sub: "hangeul" } : { sub: "vocab-review", book: "q1", lesson: 1, part: day - 1, mode: "flashcard" },
          autoDone: pMast >= Math.min(5, Math.max(1, unit.words.length)),
          hint: `${unit.words.length} từ`
        },
        {
          tag: "Bước 2 · Bài tập",
          icon: "layers",
          label: `Bài tập B01: ${unit.lessonTitle}`,
          route: "theory",
          params: { sub: "lesson-detail", book: "q1", lesson: 1, tab: "workbook" },
          autoDone: Boolean(wbStat),
          hint: wbStat ? `Đạt ${wbStat.pct}%` : "Từ vựng & Ngữ pháp"
        },
        {
          tag: "Bước 3 · Dịch câu",
          icon: "pen",
          label: "Dịch câu Bài 01",
          route: "theory",
          params: { sub: "lesson-detail", book: "q1", lesson: 1, tab: "translate" },
          autoDone: trCnt >= 2,
          hint: trCnt ? `Đã dịch ${trCnt} câu` : "Việt → Hàn"
        },
        {
          tag: "Bước 4 · Luyện đề",
          icon: "exam",
          label: `Nghe TOPIK I · Dạng ${dNum}`,
          route: "mock-test",
          params: { sub: "topik1", viewMode: "segments", skill: "listening", typeId: `t1_l_d${dNum}` },
          autoDone: (store.state.partStats?.[`t1_l_d${dNum}`]?.total || 0) >= 3,
          hint: "Cấu trúc đề thi"
        }
      ];
    } else {
      const bookNum = bookId.replace("q", "") || "1";
      const lsPad = String(lsNum).padStart(2, "0");
      const cleanPartName = unit.partTitle.replace(/^Phần\s*\d+\s*·\s*/i, "").trim();
      shortTopic = isMilestone
        ? `Quyển ${bookNum} · Tổng kết Chặng ${Math.floor(day / 5)}`
        : `Quyển ${bookNum} · Bài ${lsPad} · Phần ${unit.part}`;

      rawTasks = [
        {
          tag: "Bước 1 · Từ vựng",
          icon: "cards",
          label: `Bài ${lsPad} · Phần ${unit.part}: ${cleanPartName}`,
          route: "theory",
          params: { sub: "vocab-review", book: bookId, lesson: lsNum, part: unit.part, mode: "flashcard" },
          autoDone: pMast >= Math.min(6, Math.max(1, Math.ceil(unit.words.length * 0.6))),
          hint: `Đã thuộc ${pMast}/${unit.words.length} từ`
        },
        {
          tag: "Bước 2 · Bài tập",
          icon: "book",
          label: `Bài tập B${lsPad}: ${unit.lessonTitle}`,
          route: "theory",
          params: { sub: "lesson-detail", book: bookId, lesson: lsNum, tab: "workbook" },
          autoDone: Boolean(wbStat && wbStat.total > 0),
          hint: wbStat ? `Điểm ${wbStat.pct}%` : "Từ vựng & Ngữ pháp"
        },
        {
          tag: "Bước 3 · Dịch câu",
          icon: "pen",
          label: `Dịch câu Bài ${lsPad}`,
          route: "theory",
          params: { sub: "lesson-detail", book: bookId, lesson: lsNum, tab: "translate" },
          autoDone: trCnt >= 2,
          hint: trCnt ? `Đã dịch ${trCnt} câu` : "Việt → Hàn"
        },
        isMilestone
          ? {
              tag: "Bước 4 · Luyện đề",
              icon: "exam",
              label: `Đề tuyển chọn ${isTopik2 ? "TOPIK II" : "TOPIK I"}`,
              route: "mock-test",
              params: { sub: isTopik2 ? "topik2" : "topik1", viewMode: "exams", category: "curated" },
              autoDone: (store.state.examHistory?.length || 0) >= Math.floor(day / 5),
              hint: "Kiểm tra cuối chặng"
            }
          : {
              tag: "Bước 4 · Luyện đề",
              icon: "exam",
              label: `${skillKey === "listening" ? "Nghe" : "Đọc"} ${isTopik2 ? "TOPIK II" : "TOPIK I"} · Dạng ${dNum}`,
              route: "mock-test",
              params: { sub: isTopik2 ? "topik2" : "topik1", viewMode: "segments", skill: skillKey, typeId: segTypeId },
              autoDone: (store.state.partStats?.[segTypeId]?.total || 0) >= 3,
              hint: `Đã làm ${store.state.partStats?.[segTypeId]?.total || 0} câu`
            }
      ];
    }

    const totalSteps = rawTasks.length;
    const wholeDayChecked = Boolean(store.state.roadmapDone?.[day]);

    const tasks = rawTasks.map((t, ti) => {
      const stepChecked = Boolean(store.state.roadmapStepDone?.[`d${day}_${ti}`]);
      const done = wholeDayChecked || stepChecked || Boolean(t.autoDone);
      return {
        ...t,
        stepIdx: ti,
        totalSteps,
        stepKey: `d${day}_${ti}`,
        done,
        go: () => launch(day, ti, totalSteps, t.label, t.route, t.params)
      };
    });

    const doneSteps = tasks.filter((t) => t.done).length;
    const isDayComplete = doneSteps === totalSteps;

    return {
      day,
      isMilestone,
      shortTopic,
      title: `Ngày ${day} · ${shortTopic}`,
      tasks,
      doneSteps,
      totalSteps,
      isDayComplete
    };
  });

  const activeDay = days.find((d) => !d.isDayComplete) || days[days.length - 1];
  const nextTask = activeDay.tasks.find((t) => !t.done) || activeDay.tasks[0];
  const completedDaysCount = days.filter((d) => d.isDayComplete).length;

  return {
    profile,
    bookId,
    days,
    activeDay,
    nextTask,
    completedDaysCount
  };
}

export function renderRoadmapScoreCardHTML(evalObj) {
  const pctBar = Math.min(100, Math.round((evalObj.estimatedScore / evalObj.maxScore) * 100));
  return `
    <div class="box-kind">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
        <strong style="font-size:15.5px;color:var(--text-main);">${evalObj.label}</strong>
        <span style="font-size:14px;font-weight:700;color:var(--primary-1);">${evalObj.estimatedScore}/${evalObj.maxScore}đ (Mốc đỗ ${evalObj.passScore}đ)</span>
      </div>
      <div class="progress-track" style="height:7px;">
        <div class="progress-fill" style="width:${pctBar}%;${evalObj.passed ? "background:var(--success);" : ""}"></div>
      </div>
    </div>
  `;
}

export function renderRoadmapView(root, db, navigate, openAccountCustomizer) {
  let takingPlacement = false;
  let placementSubmitted = false;
  let userAnswers = {};
  let placementResult = null;

  function render() {
    const plan = getGuidedStudyPlan(db, navigate);
    const evalObj = evaluateRoadmapScore(db);
    const { profile, days, activeDay, nextTask, completedDaysCount } = plan;
    const pct = Math.round((completedDaysCount / days.length) * 100);

    root.innerHTML = `
      <div class="container-narrow">
        <div class="box-kind" style="margin-bottom:18px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            <span style="font-size:13px;font-weight:650;color:var(--primary);">
              ${STAGE_LABELS[profile.startBook] || STAGE_LABELS.q1} · Hoàn thành ${completedDaysCount}/30 ngày
            </span>
            <span class="meta-chip">${evalObj.estimatedScore}/${evalObj.maxScore}đ</span>
          </div>

          <h1 class="title-hero ko" style="margin-bottom:6px;">Ngày ${activeDay.day}: ${nextTask.label}</h1>
          <div class="progress-track" style="margin:10px 0 16px;">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn-primary" id="btn-rm-continue-next">
              Học tiếp
            </button>
            <button type="button" class="btn-outline-teal" id="btn-start-placement">
              Test xếp quyển
            </button>
            <button type="button" class="btn-outline-teal" id="btn-customize-roadmap">
              Đổi quyển
            </button>
          </div>
          ${placementResult ? `<div style="margin-top:10px;font-weight:650;color:var(--primary-1);font-size:14px;">${placementResult}</div>` : ""}
        </div>

        ${takingPlacement ? `
          <div class="box-kind" style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
              <h3 style="margin:0;font-size:17px;">Bài test xếp quyển (6 câu)</h3>
              ${renderQuizHistoryPillHTML("placement_test")}
            </div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${PLACEMENT_QUESTIONS.map((item, qi) => `
                <div style="background:#F8FAFC;padding:14px;border-radius:12px;">
                  <div style="font-weight:650;margin-bottom:8px;">${item.q}</div>
                  <div class="grid-2" style="gap:10px;">
                    ${item.opts.map((opt, oi) => {
                      let cls = "ko mcq-opt-btn";
                      if (placementSubmitted) {
                        if (oi === item.ans) cls += " is-correct";
                        else if (userAnswers[qi] === oi) cls += " is-wrong";
                      } else if (userAnswers[qi] === oi) {
                        cls += " is-selected";
                      }
                      return `
                        <button type="button" class="${cls}" data-q="${qi}" data-o="${oi}" ${placementSubmitted ? "disabled" : ""}>
                          ${["①", "②", "③", "④"][oi]} ${opt}
                        </button>
                      `;
                    }).join("")}
                  </div>
                </div>
              `).join("")}
            </div>
            <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              ${!placementSubmitted ? `
                <span style="font-size:13.5px;color:var(--text-muted);">Đã chọn <strong>${Object.keys(userAnswers).length}/${PLACEMENT_QUESTIONS.length}</strong> câu</span>
                <button type="button" class="btn-primary" id="btn-submit-placement" ${Object.keys(userAnswers).length === 0 ? "disabled" : ""}>Chấm điểm &amp; Áp dụng</button>
              ` : `
                <strong style="color:var(--primary-1);font-size:15px;">${placementResult || ""}</strong>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button type="button" class="btn-outline-teal" id="btn-retry-placement">Làm lại test</button>
                  <button type="button" class="btn-primary" id="btn-close-placement">Đóng &amp; Vào lộ trình</button>
                </div>
              `}
            </div>
          </div>
        ` : ""}

        <div class="section-head" style="margin-top:0;">
          <h2>Kế hoạch 30 ngày</h2>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          ${days.map((d) => {
            const isToday = d.day === activeDay.day;
            return `
              <details class="roadmap-day-details ${isToday ? "is-today" : ""}" ${isToday ? "open" : ""}>
                <summary>
                  <div style="display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap;">
                    ${isToday ? `<span class="badge-orange">Hôm nay</span>` : ""}
                    <strong style="font-size:15px;color:${d.isDayComplete ? "var(--success)" : "var(--text-main)"};">
                      ${d.title}
                    </strong>
                  </div>
                  <span class="meta-chip nw" style="color:${d.isDayComplete ? "var(--success)" : "var(--text-muted)"};">
                    ${d.isDayComplete ? "Xong 4/4" : `${d.doneSteps}/${d.totalSteps} bước ▾`}
                  </span>
                </summary>

                <div class="roadmap-day-body">
                  <div class="today-stepper">
                    ${d.tasks.map((t) => {
                      const isNextHere = isToday && !t.done && t.stepIdx === nextTask.stepIdx;
                      const cleanCat = t.tag.replace(/^Bước\s*\d+\s*·\s*/i, "");
                      return `
                        <div class="today-step-row ${t.done ? "is-done" : (isNextHere ? "is-next" : "")}">
                          <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                            <button type="button" class="step-check-btn ${t.done ? "checked" : ""}" data-rm-chk="${d.day}" data-sidx="${t.stepIdx}" data-stotal="${d.totalSteps}" aria-label="Đánh dấu bước ${t.stepIdx + 1}">
                              ${t.done ? "✓" : (t.stepIdx + 1)}
                            </button>
                            <div style="min-width:0;flex:1;">
                              <div class="ko" style="font-size:14.5px;font-weight:650;${t.done ? "text-decoration:line-through;color:var(--text-muted);" : "color:var(--text-main);"}">${t.label}</div>
                              <div style="font-size:12.5px;color:var(--text-muted);">${cleanCat} · ${t.hint}</div>
                            </div>
                          </div>
                          <button type="button" class="${isNextHere ? "btn-soft-jade" : "btn-step-quiet"} nw" data-day="${d.day}" data-ti="${t.stepIdx}">
                            ${t.done ? "Xem lại" : (isNextHere ? "Học tiếp" : "Mở")}
                          </button>
                        </div>
                      `;
                    }).join("")}
                  </div>
                </div>
              </details>
            `;
          }).join("")}
        </div>
      </div>
    `;

    root.querySelector("#btn-rm-continue-next").addEventListener("click", () => nextTask.go());
    root.querySelector("#btn-start-placement").addEventListener("click", () => {
      takingPlacement = !takingPlacement;
      if (!takingPlacement) placementSubmitted = false;
      render();
    });
    root.querySelector("#btn-customize-roadmap").addEventListener("click", () => {
      if (openAccountCustomizer) openAccountCustomizer();
    });

    if (takingPlacement) {
      root.querySelectorAll("[data-q]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (placementSubmitted) return;
          userAnswers[Number(btn.dataset.q)] = Number(btn.dataset.o);
          render();
        });
      });
      root.querySelector("#btn-submit-placement")?.addEventListener("click", () => {
        let correct = 0;
        PLACEMENT_QUESTIONS.forEach((it, i) => {
          if (userAnswers[i] === it.ans) correct += 1;
        });
        const pctScore = Math.round((correct / PLACEMENT_QUESTIONS.length) * 100);
        const recommendedBook = correct <= 2 ? "q1" : (correct <= 4 ? "q2" : "q3");
        const recTarget = correct <= 2 ? "TOPIK I - Cấp 1" : (correct <= 4 ? "TOPIK I - Cấp 2" : "TOPIK II - Cấp 4");
        store.updateRoadmapProfile({ startBook: recommendedBook, targetLevel: recTarget }, true);
        store.recordScoreHistory({
          quizKey: "placement_test",
          category: "Test xếp quyển",
          title: "Bài test xếp quyển đầu vào (6 câu)",
          score: pctScore,
          maxScore: 100,
          correctCount: correct,
          totalCount: PLACEMENT_QUESTIONS.length,
          route: "roadmap",
          params: {}
        });
        placementResult = `Điểm: ${pctScore}/100đ (Đúng ${correct}/6 câu) → Xếp vào ${STAGE_LABELS[recommendedBook]}`;
        placementSubmitted = true;
        render();
      });
      root.querySelector("#btn-retry-placement")?.addEventListener("click", () => {
        userAnswers = {};
        placementSubmitted = false;
        render();
      });
      root.querySelector("#btn-close-placement")?.addEventListener("click", () => {
        takingPlacement = false;
        placementSubmitted = false;
        render();
      });
    }

    root.querySelectorAll("[data-rm-chk]").forEach((chk) => {
      chk.addEventListener("click", (e) => {
        e.stopPropagation();
        const dNum = Number(chk.dataset.rmChk);
        const sIdx = Number(chk.dataset.sidx);
        const sTot = Number(chk.dataset.stotal);
        const curDone = Boolean(store.state.roadmapStepDone?.[`d${dNum}_${sIdx}`]);
        store.setRoadmapStepDone(dNum, sIdx, sTot, !curDone);
        render();
      });
    });

    root.querySelectorAll("[data-day][data-ti]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dObj = days.find((x) => x.day === Number(btn.dataset.day));
        const task = dObj?.tasks[Number(btn.dataset.ti)];
        if (task) task.go();
      });
    });
  }

  render();
}
