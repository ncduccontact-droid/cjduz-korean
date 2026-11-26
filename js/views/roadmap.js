import { store, DEFAULT_ROADMAP_PROFILE, normalizeBookId, getBookWords, getBookCurriculum, evaluateRoadmapScore } from "../store.js?v=20261127-05";
import { ico, daisyLogoSVG } from "../icons.js?v=20261127-05";

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

/**
 * Standardized 4-Step Daily Study Plan Engine across ALL 6 BOOKS (Quyển 1 -> Quyển 6):
 *   1. Học từ vựng (theo từng Phần nhỏ 8–15 từ của Chương đang học)
 *   2. Làm bài tập (Sách bài tập 익힘책 Phần I: Từ vựng & Ngữ pháp)
 *   3. Luyện dịch câu (Việt → Hàn theo ngữ pháp chương)
 *   4. Luyện đề sau cùng (Dạng câu / Đề thi chuẩn đúng cấp của Quyển đang học)
 */
export function getGuidedStudyPlan(db, navigate, startGuidedStep = null) {
  const profile = store.state.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
  const startBookRaw = profile.startBook || "q1";
  const isHangeulIntro = startBookRaw === "hangeul";
  const bookId = normalizeBookId(startBookRaw);
  const bookCur = getBookCurriculum(db, bookId);
  const bookPool = getBookWords(db, bookId);
  const chapters = bookCur?.chapters || [];
  const chapCount = Math.max(1, chapters.length || 15);
  const isTopik2 = ["q3", "q4", "q5", "q6"].includes(bookId);

  // Flatten all (lesson, part) pairs across the chosen Book so each day advances cleanly part-by-part!
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

    // Determine Exam Type calibrated to the active Book
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
      const hTopics = ["14 Phụ âm & Nguyên âm đơn", "Phụ âm căng & Patchim", "7 Quy tắc nối âm & căng âm"];
      shortTopic = `Nhập môn · ${hTopics[day - 1]}`;
      rawTasks = [
        {
          tag: "Bước 1 · Học từ & Chữ",
          icon: "book",
          label: `Lab Hangeul (${hTopics[day - 1]}) & ${unit.partTitle}`,
          route: "theory",
          params: day === 1 ? { sub: "hangeul" } : { sub: "vocab-review", book: "q1", lesson: 1, part: day - 1, mode: "flashcard" },
          autoDone: pMast >= Math.min(5, Math.max(1, unit.words.length)),
          hint: `${unit.words.length} từ nhỏ gọn`
        },
        {
          tag: "Bước 2 · Làm bài tập",
          icon: "layers",
          label: `Làm Sách bài tập Bài 01 (${unit.lessonTitle})`,
          route: "theory",
          params: { sub: "lesson-detail", book: "q1", lesson: 1, tab: "workbook" },
          autoDone: Boolean(wbStat),
          hint: wbStat ? `Đạt ${wbStat.pct}%` : "Bài tập Từ & Ngữ pháp"
        },
        {
          tag: "Bước 3 · Dịch câu",
          icon: "pen",
          label: "Luyện dịch câu Việt → Hàn Bài 01",
          route: "theory",
          params: { sub: "lesson-detail", book: "q1", lesson: 1, tab: "translate" },
          autoDone: trCnt >= 2,
          hint: trCnt ? `Đã dịch ${trCnt} câu` : "Ghép cụm từ chuẩn"
        },
        {
          tag: "Bước 4 · Luyện đề cuối",
          icon: "exam",
          label: `Làm quen Nghe TOPIK I · Dạng ${dNum}`,
          route: "mock-test",
          params: { sub: "topik1", viewMode: "segments", skill: "listening", typeId: `t1_l_d${dNum}` },
          autoDone: (store.state.partStats?.[`t1_l_d${dNum}`]?.total || 0) >= 3,
          hint: "Chốt ngày chuẩn cấu trúc thi"
        }
      ];
    } else {
      shortTopic = isMilestone
        ? `${STAGE_LABELS[bookId]} · Tổng kết Chặng ${Math.floor(day / 5)}`
        : `${STAGE_LABELS[bookId]} · Bài ${String(lsNum).padStart(2, "0")} (${unit.partTitle.split("·")[0].trim()})`;

      rawTasks = [
        {
          tag: "Bước 1 · Học từ vựng",
          icon: "cards",
          label: `Lật thẻ B${String(lsNum).padStart(2, "0")} · ${unit.partTitle} (${unit.words.length} từ)`,
          route: "theory",
          params: { sub: "vocab-review", book: bookId, lesson: lsNum, part: unit.part, mode: "flashcard" },
          autoDone: pMast >= Math.min(6, Math.max(1, Math.ceil(unit.words.length * 0.6))),
          hint: `Thuộc ${pMast}/${unit.words.length} từ phần này`
        },
        {
          tag: "Bước 2 · Làm bài tập",
          icon: "book",
          label: `Làm Sách bài tập Bài ${String(lsNum).padStart(2, "0")}: ${unit.lessonTitle}`,
          route: "theory",
          params: { sub: "lesson-detail", book: bookId, lesson: lsNum, tab: "workbook" },
          autoDone: Boolean(wbStat && wbStat.total > 0),
          hint: wbStat ? `Điểm Sách BT: ${wbStat.pct}%` : "Từ vựng & Ngữ pháp 익힘책"
        },
        {
          tag: "Bước 3 · Dịch câu",
          icon: "pen",
          label: `Luyện dịch câu Việt → Hàn Bài ${String(lsNum).padStart(2, "0")}`,
          route: "theory",
          params: { sub: "lesson-detail", book: bookId, lesson: lsNum, tab: "translate" },
          autoDone: trCnt >= 2,
          hint: trCnt ? `Đã dịch đúng ${trCnt} câu` : "Rèn trật tự tiểu từ & đuôi câu"
        },
        isMilestone
          ? {
              tag: "Bước 4 · Luyện đề cuối",
              icon: "exam",
              label: isTopik2
                ? `Thi đề tuyển chọn TOPIK II (Chấm thang ${STAGE_LABELS[bookId]})`
                : `Thi đề tuyển chọn TOPIK I (Chấm thang ${STAGE_LABELS[bookId]})`,
              route: "mock-test",
              params: { sub: isTopik2 ? "topik2" : "topik1", viewMode: "exams", category: "curated" },
              autoDone: (store.state.examHistory?.length || 0) >= Math.floor(day / 5),
              hint: "Đánh giá điểm tổng hợp cuối chặng"
            }
          : {
              tag: "Bước 4 · Luyện đề cuối",
              icon: "exam",
              label: `Luyện ${skillKey === "listening" ? "Nghe" : "Đọc"} ${isTopik2 ? "TOPIK II" : "TOPIK I"} · Dạng ${dNum}`,
              route: "mock-test",
              params: { sub: isTopik2 ? "topik2" : "topik1", viewMode: "segments", skill: skillKey, typeId: segTypeId },
              autoDone: (store.state.partStats?.[segTypeId]?.total || 0) >= 3,
              hint: `Đã làm ${store.state.partStats?.[segTypeId]?.total || 0} câu dạng này`
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
  const passLinePct = Math.round((evalObj.passScore / evalObj.maxScore) * 100);
  return `
    <div class="box-kind">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
        <div>
          <span style="font-size:12.5px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:2px;">Đánh giá năng lực · ${evalObj.label}</span>
          <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
            <strong style="font-size:28px;font-weight:800;color:var(--text-main);">${evalObj.estimatedScore} <span style="font-size:15px;color:var(--text-muted);font-weight:600;">/ ${evalObj.maxScore} điểm</span></strong>
            <span style="font-size:13px;font-weight:600;color:${evalObj.passed ? "var(--success)" : "var(--primary-1)"};">
              · ${evalObj.statusLabel}
            </span>
          </div>
        </div>
        <span class="badge-orange">
          Chuẩn ${evalObj.gradeName}: ≥ ${evalObj.passScore}đ
        </span>
      </div>

      <div style="position:relative;padding-top:2px;margin-bottom:14px;">
        <div class="progress-track" style="height:8px;background:#E2E8F0;">
          <div class="progress-fill" style="width:${pctBar}%;${evalObj.passed ? "background:var(--success);" : ""}"></div>
        </div>
        <div style="position:absolute;left:${passLinePct}%;top:0;bottom:-3px;width:2px;background:#475569;border-radius:2px;" title="Mốc đạt ${evalObj.passScore}đ"></div>
      </div>

      <div class="pillar-grid-4">
        ${evalObj.pillars.map((p) => `
          <div style="background:#F8FAFC;border-radius:12px;padding:10px 12px;">
            <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px;">
              <strong style="color:var(--text-main);">${p.label}</strong>
              <span style="font-weight:750;color:var(--primary-1);">${p.pct}%</span>
            </div>
            <div class="progress-track" style="height:5px;margin-bottom:5px;">
              <div class="progress-fill" style="width:${p.pct}%"></div>
            </div>
            <span style="font-size:11.5px;color:var(--text-muted);">${p.detail}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function renderRoadmapView(root, db, navigate, openAccountCustomizer) {
  let takingPlacement = false;
  let userAnswers = {};
  let placementResult = null;

  function render() {
    const plan = getGuidedStudyPlan(db, navigate);
    const evalObj = evaluateRoadmapScore(db);
    const { profile, days, activeDay, nextTask, completedDaysCount } = plan;
    const pct = Math.round((completedDaysCount / days.length) * 100);
    const userName = store.session.user?.name || "bạn";

    root.innerHTML = `
      <div class="container-narrow">
        <div class="box-kind" style="margin-bottom:16px;">
          <div class="roadmap-hero-grid">
            <div style="background:#F8FAFC;border-radius:16px;padding:18px;text-align:center;">
              <div style="display:inline-grid;place-items:center;width:58px;height:58px;border-radius:16px;background:#FFFFFF;border:1px solid var(--border-card);">
                ${daisyLogoSVG(38)}
              </div>
              <strong style="display:block;margin-top:8px;color:var(--text-main);font-size:15px;">Lộ trình của ${userName}</strong>
              <span style="font-size:12.5px;color:var(--text-muted);">Ngày ${activeDay.day}/30 · Xong ${completedDaysCount} ngày</span>
              <div class="progress-track" style="margin-top:8px;">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
            </div>

            <div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
                <span class="badge-orange">${STAGE_LABELS[profile.startBook] || STAGE_LABELS.q1}</span>
                <span class="meta-chip">Từ vựng → Bài tập → Dịch câu → Luyện đề</span>
              </div>
              <h1 style="margin:0 0 6px;font-size:20px;font-weight:750;">Ngày ${activeDay.day}: ${activeDay.shortTopic}</h1>
              <p style="margin:0 0 14px;color:var(--text-muted);font-size:14px;">
                Bước tiếp theo: <strong style="color:var(--text-main);">${nextTask.label}</strong>
              </p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn-primary" id="btn-rm-continue-next">
                  Học tiếp Bước ${nextTask.stepIdx + 1}/${nextTask.totalSteps}
                </button>
                <button class="btn-outline-teal" id="btn-start-placement">
                  ${ico("sparkle", 14)} Test xếp quyển
                </button>
                <button class="btn-outline-teal" id="btn-customize-roadmap">
                  ${ico("user", 14)} Đổi quyển học
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-bottom:20px;">
          ${renderRoadmapScoreCardHTML(evalObj)}
        </div>

        ${takingPlacement ? `
          <div class="box-kind" style="border-color:rgba(13,148,136,0.38);margin-bottom:22px;">
            <h3 style="margin:0 0 14px;font-size:17px;">Bài test xếp quyển nhanh (6 câu)</h3>
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${PLACEMENT_QUESTIONS.map((item, qi) => `
                <div style="background:#F8FAFC;padding:14px;border-radius:12px;">
                  <div style="font-weight:650;margin-bottom:8px;">${item.q}</div>
                  <div class="grid-2" style="gap:8px;">
                    ${item.opts.map((opt, oi) => `
                      <button type="button" class="ko mcq-opt-btn" data-q="${qi}" data-o="${oi}" style="${userAnswers[qi] === oi ? "border-color:var(--primary);background:var(--primary-3);font-weight:650;" : ""}">
                        ${["①", "②", "③", "④"][oi]} ${opt}
                      </button>
                    `).join("")}
                  </div>
                </div>
              `).join("")}
            </div>
            <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
              <button class="btn-primary" id="btn-submit-placement">Chấm điểm &amp; Áp dụng quyển phù hợp</button>
              ${placementResult ? `<div style="font-weight:650;color:var(--primary-1);">${placementResult}</div>` : ""}
            </div>
          </div>
        ` : ""}

        <div class="section-head" style="margin-top:0;">
          <h2>Kế hoạch 30 ngày (${STAGE_LABELS[profile.startBook] || "Quyển 1"})</h2>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;">
          ${days.map((d) => {
            const isToday = d.day === activeDay.day;
            return `
              <div class="box-kind" style="${isToday ? "border-color:rgba(13,148,136,0.38);" : ""}">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    ${isToday ? `<span class="badge-orange">Hôm nay</span>` : ""}
                    <strong style="font-size:15.5px;color:${d.isDayComplete ? "var(--success)" : "var(--text-main)"};">
                      ${d.title}
                    </strong>
                  </div>
                  <span class="meta-chip" style="color:${d.isDayComplete ? "var(--success)" : "var(--text-muted)"};">
                    ${d.isDayComplete ? "Đã xong 4/4" : `${d.doneSteps}/${d.totalSteps} bước`}
                  </span>
                </div>

                <div class="today-stepper">
                  ${d.tasks.map((t) => {
                    const isNextHere = isToday && !t.done && t.stepIdx === nextTask.stepIdx;
                    const cleanCat = t.tag.replace(/^Bước\s*\d+\s*·\s*/i, "");
                    return `
                      <div class="today-step-row ${t.done ? "is-done" : (isNextHere ? "is-next" : "")}">
                        <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                          <button type="button" class="step-check-btn ${t.done ? "checked" : ""}" data-rm-chk="${d.day}" data-sidx="${t.stepIdx}" data-stotal="${d.totalSteps}" title="Đánh dấu hoàn thành">
                            ${t.done ? ico("check", 24) : (t.stepIdx + 1)}
                          </button>
                          <div style="min-width:0;flex:1;">
                            <div style="font-size:14px;font-weight:650;${t.done ? "text-decoration:line-through;color:var(--text-muted);" : "color:var(--text-main);"}">${t.label}</div>
                            <div style="font-size:12px;color:var(--text-muted);">${cleanCat} · ${t.hint}</div>
                          </div>
                        </div>
                        <button type="button" class="${isNextHere ? "btn-soft-jade" : "btn-outline-teal"}" data-day="${d.day}" data-ti="${t.stepIdx}" style="padding:6px 12px;font-size:12.5px;border-radius:9px;flex-shrink:0;">
                          ${t.done ? "Xem lại" : (isNextHere ? "Học ngay" : "Mở")}
                        </button>
                      </div>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

    root.querySelector("#btn-rm-continue-next").addEventListener("click", () => nextTask.go());
    root.querySelector("#btn-start-placement").addEventListener("click", () => {
      takingPlacement = !takingPlacement;
      render();
    });
    root.querySelector("#btn-customize-roadmap").addEventListener("click", () => {
      if (openAccountCustomizer) openAccountCustomizer();
    });

    if (takingPlacement) {
      root.querySelectorAll("[data-q]").forEach((btn) => {
        btn.addEventListener("click", () => {
          userAnswers[Number(btn.dataset.q)] = Number(btn.dataset.o);
          render();
        });
      });
      root.querySelector("#btn-submit-placement").addEventListener("click", () => {
        let correct = 0;
        PLACEMENT_QUESTIONS.forEach((it, i) => {
          if (userAnswers[i] === it.ans) correct += 1;
        });
        const recommendedBook = correct <= 2 ? "q1" : (correct <= 4 ? "q2" : "q3");
        const recTarget = correct <= 2 ? "TOPIK I - Cấp 1" : (correct <= 4 ? "TOPIK I - Cấp 2" : "TOPIK II - Cấp 4");
        store.updateRoadmapProfile({ startBook: recommendedBook, targetLevel: recTarget }, true);
        placementResult = `Đúng ${correct}/6 câu → Đã chuyển sang ${STAGE_LABELS[recommendedBook]}!`;
        takingPlacement = false;
        render();
      });
    }

    root.querySelectorAll("[data-rm-chk]").forEach((chk) => {
      chk.addEventListener("click", () => {
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
