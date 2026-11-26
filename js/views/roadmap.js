import { store, DEFAULT_ROADMAP_PROFILE } from "../store.js?v=20261126-8";
import { ico, daisyLogoSVG } from "../icons.js?v=20261126-8";

const PLACEMENT_QUESTIONS = [
  { q: "1. Chọn câu chào lịch sự khi mới gặp lần đầu:", opts: ["안녕히 가세요.", "만나서 반갑습니다.", "잘 먹겠습니다.", "주말 잘 보내세요."], ans: 1 },
  { q: "2. Điền tiểu từ đúng: '저는 도서관(   ) 한국어를 공부합니다.'", opts: ["에", "에서", "을", "하고"], ans: 1 },
  { q: "3. Dạng chia lịch sự (-아/어요) đúng của động từ '듣다' (nghe) là:", opts: ["듣어요", "들어요", "드러요", "듣아요"], ans: 1 },
  { q: "4. Chọn từ nối hợp lý: '이 옷은 디자인이 예뻐요. (     ) 값이 너무 비싸요.'", opts: ["그래서", "그런데", "그러니까", "그리고"], ans: 1 },
  { q: "5. Cụm từ đồng nghĩa với '영향을 주다' trong đề Đọc TOPIK II là:", opts: ["영향을 미치다", "관심을 가지다", "노력을 기울이다", "마음을 먹다"], ans: 0 },
  { q: "6. Quán dụng ngữ '발이 넓다' mang ý nghĩa gì?", opts: ["Đi bộ rất nhanh", "Quen biết rộng, giao thiệp rộng", "Tiêu xài hào phóng", "Mắt nhìn tinh tế"], ans: 1 }
];

export const STAGE_LABELS = {
  hangeul: "Nhập môn Hangeul",
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

function countLessonMastered(db, bookKey, lessonNum) {
  let pool = db.sc1Vocab || [];
  if (bookKey === "topik1") pool = db.topik1Bank || [];
  else if (bookKey === "sejong1") pool = db.sejongVocab || [];
  const words = pool.filter((w) => w.lesson === lessonNum);
  const mastered = words.filter((w) => store.isMastered(w.id)).length;
  return { mastered, total: words.length, lessonTitle: words[0]?.lessonTitle || `Bài ${lessonNum}` };
}

/**
 * Shared Smart Roadmap Engine used by BOTH Home ("Hôm nay học gì?") and Roadmap ("Lộ trình 30 ngày").
 * Automatically detects which steps are already done and highlights the exact NEXT step to study!
 */
export function getGuidedStudyPlan(db, navigate, startGuidedStep = null) {
  const profile = store.state.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
  const book = profile.startBook || (profile.startStage === "zero" ? "hangeul" : (profile.startStage === "sc2" ? "q2" : (profile.startStage === "tc3" ? "q4" : "q1")));
  const stage = book === "hangeul" ? "zero" : (book === "q2" ? "sc2" : (["q3", "q4", "q5", "q6"].includes(book) ? "tc3" : "sc1"));
  const track = profile.focusTrack || "balanced";
  const mins = Number(profile.dailyMinutes || 30);
  const wordQuota = mins <= 15 ? 10 : (mins >= 60 ? 30 : 18);

  const launch = (day, stepIdx, totalSteps, label, route, routeParams) => {
    if (typeof startGuidedStep === "function") {
      startGuidedStep({ day, stepIdx, totalSteps, label });
    }
    navigate(route, routeParams);
  };

  const days = Array.from({ length: 30 }, (_, idx) => {
    const day = idx + 1;
    const isMilestone = day % 5 === 0;
    let rawTasks = [];
    let shortTopic = "";

    if (isMilestone) {
      const isTopik2 = stage === "tc3" || (profile.targetLevel || "").includes("TOPIK II");
      const milestoneIdx = Math.floor(day / 5);
      shortTopic = `Kiểm tra chặng ${milestoneIdx}`;
      rawTasks = [
        {
          tag: "Bước 1 · Ôn từ",
          icon: "cards",
          label: `Ôn thẻ từ vựng SRS chặng ${milestoneIdx}`,
          route: "theory",
          params: { sub: "vocab-review" },
          hint: "Củng cố trí nhớ dài hạn"
        },
        {
          tag: "Bước 2 · Làm đề",
          icon: "exam",
          label: book === "q6" ? "Thi Full 104 câu TOPIK II bấm giờ" : (isTopik2 ? "Làm 1 đề tuyển chọn TOPIK II" : "Làm 1 đề tuyển chọn TOPIK I"),
          route: "mock-test",
          params: { sub: isTopik2 ? "topik2" : "topik1", viewMode: "exams", category: "curated" },
          autoDone: (store.state.examHistory?.length || 0) >= milestoneIdx,
          hint: `${store.state.examHistory?.length || 0} đề đã nộp`
        },
        {
          tag: "Bước 3 · Sửa sai",
          icon: "chart",
          label: "Rà lại Sổ tay câu sai",
          route: "check-tools",
          params: { tab: "mistakes" },
          hint: `${store.state.mistakes?.length || 0} câu cần lưu ý`
        }
      ];
    } else if (stage === "zero" && day <= 4) {
      const hangeulTopics = [
        "14 Phụ âm & Nguyên âm đơn",
        "Phụ âm căng & Nguyên âm ghép",
        "Patchim & Bàn phím Hàn",
        "7 Quy tắc nối âm & căng âm"
      ];
      shortTopic = `Hangeul · ${hangeulTopics[day - 1]}`;
      const vStat = countLessonMastered(db, "sc1", 1);
      rawTasks = [
        {
          tag: "Bước 1 · Bảng chữ",
          icon: "sparkle",
          label: `Lab Hangeul: ${hangeulTopics[day - 1]}`,
          route: "theory",
          params: { sub: "hangeul" },
          hint: "Nghe mẫu & soi biến âm"
        },
        {
          tag: "Bước 2 · Từ vựng",
          icon: "book",
          label: `Làm quen từ vựng Bài 01 (${vStat.lessonTitle})`,
          route: "theory",
          params: { sub: "lesson-detail", book: "sc1", lesson: 1, tab: "vocab" },
          autoDone: vStat.mastered >= Math.min(8, Math.max(1, vStat.total)),
          hint: `Đã thuộc ${vStat.mastered}/${vStat.total} từ`
        },
        {
          tag: "Bước 3 · Tập nói",
          icon: "video",
          label: "Shadowing lời chào qua Shorts",
          route: "practice",
          params: { sub: "skills", skill: "shadowing" },
          hint: "Nhại theo phụ đề chạy"
        }
      ];
    } else if (stage === "tc3") {
      // Tailored by exact Book: q3 (Dạng 1–4), q4 (Dạng 4–7 + Câu 51–53), q5 (Dạng 7–10 + Câu 54), q6 (Dạng 9–10 + Full 104 câu)
      const bookLabelMap = { q3: "Quyển 3 · Trung cấp 1", q4: "Quyển 4 · Trung cấp 2", q5: "Quyển 5 · Cao cấp 1", q6: "Quyển 6 · Cao cấp 2" };
      const bookIdMap = { q3: "tc3", q4: "tc4", q5: "cc5", q6: "cc6" };
      const typePoolByBook = {
        q3: [1, 2, 3, 4, 5],
        q4: [4, 5, 6, 7, 8],
        q5: [7, 8, 9, 10],
        q6: [8, 9, 10]
      };
      const tArr = typePoolByBook[book] || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const cycle = tArr[(day - 1) % tArr.length];
      const dListen = `t2_l_d${cycle}`;
      const dRead = `t2_r_d${cycle}`;
      shortTopic = `${bookLabelMap[book] || "TOPIK II"} · Bài ${(day % 15) + 1}`;
      rawTasks = [
        {
          tag: "Bước 1 · Giáo trình & Từ",
          icon: "book",
          label: day % 3 === 0
            ? `Chủ điểm ${bookLabelMap[book] || "Trung cấp"}`
            : (day % 2 === 1 ? "Biểu hiện & Đồng nghĩa TOPIK II" : "Sơ đồ gốc từ Âm Hán – Hàn"),
          route: "theory",
          params: day % 3 === 0 ? { sub: "textbook-detail", bookId: bookIdMap[book] || "tc3" } : { sub: day % 2 === 1 ? "frequent" : "hanja" },
          hint: bookLabelMap[book] || "Mở rộng vốn từ Cấp 3–6"
        },
        {
          tag: "Bước 2 · Luyện dạng",
          icon: "layers",
          label: day % 2 === 1 ? `Luyện Nghe TOPIK II · Dạng ${cycle}` : `Luyện Đọc TOPIK II · Dạng ${cycle}`,
          route: "mock-test",
          params: { sub: "topik2", viewMode: "segments", skill: day % 2 === 1 ? "listening" : "reading", typeId: day % 2 === 1 ? dListen : dRead },
          autoDone: (store.state.partStats?.[day % 2 === 1 ? dListen : dRead]?.total || 0) >= 3,
          hint: `Đã giải ${store.state.partStats?.[day % 2 === 1 ? dListen : dRead]?.total || 0} câu`
        },
        {
          tag: "Bước 3 · Viết / Đề",
          icon: "pen",
          label: book === "q6"
            ? "Giải phần Viết 51–54 hoặc Đề tuyển chọn TOPIK II"
            : (track === "speaking_first" ? "Luyện bấm giờ 6 câu TOPIK Speaking" : `Viết 원고지 (${book === "q3" ? "Câu 51–52" : (book === "q4" ? "Biểu đồ Câu 53" : "Nghị luận Câu 54")})`),
          route: book === "q6" ? "mock-test" : "practice",
          params: book === "q6" ? { sub: "topik2", viewMode: "segments", skill: "writing" } : { sub: "topik2", skill: track === "speaking_first" ? "speaking" : "writing" },
          hint: "Chuẩn thang điểm NIIED"
        }
      ];
    } else if (stage === "sc2") {
      const tpChunk = Math.min(12, ((day - 1) % 12) + 1);
      const dIdx = ((day - 1) % 8) + 1;
      const tid = day % 2 === 1 ? `t1_l_d${dIdx}` : `t1_r_d${dIdx}`;
      const vStat = countLessonMastered(db, "topik1", tpChunk);
      shortTopic = `TOPIK I · Chặng ${tpChunk} & Dạng ${dIdx}`;
      rawTasks = [
        {
          tag: "Bước 1 · Từ vựng",
          icon: "book",
          label: `Học ${wordQuota} từ ngữ cảnh TOPIK I · Phần ${tpChunk}`,
          route: "theory",
          params: { sub: "lesson-detail", book: "topik1", lesson: tpChunk, tab: "vocab" },
          autoDone: vStat.mastered >= Math.min(8, Math.max(1, vStat.total)),
          hint: `Đã thuộc ${vStat.mastered}/${vStat.total} mục`
        },
        {
          tag: "Bước 2 · Luyện dạng",
          icon: "layers",
          label: day % 2 === 1 ? `Luyện Nghe TOPIK I · Dạng ${dIdx}` : `Luyện Đọc TOPIK I · Dạng ${dIdx}`,
          route: "mock-test",
          params: { sub: "topik1", viewMode: "segments", skill: day % 2 === 1 ? "listening" : "reading", typeId: tid },
          autoDone: (store.state.partStats?.[tid]?.total || 0) >= 3,
          hint: `Đã giải ${store.state.partStats?.[tid]?.total || 0} câu`
        },
        {
          tag: "Bước 3 · Phản xạ",
          icon: "video",
          label: track === "topik_intensive" ? "Ôn câu tủ thường gặp TOPIK I" : "Shadowing 1 clip YouTube Shorts",
          route: track === "topik_intensive" ? "theory" : "practice",
          params: track === "topik_intensive" ? { sub: "frequent" } : { sub: "skills", skill: "shadowing" },
          hint: "Tăng tốc phản xạ nghe"
        }
      ];
    } else {
      // Default Stage: Sơ cấp 1 (15 Lessons, 2 days per lesson for thorough mastery)
      const effectiveDay = stage === "zero" ? day - 4 : day;
      const lessonNum = Math.min(15, Math.max(1, Math.ceil(effectiveDay / 2)));
      const isSecondDayOfLesson = effectiveDay % 2 === 0;
      const vStat = countLessonMastered(db, "sc1", lessonNum);
      const hwDone = Boolean(store.state.chapterHomeworkDone?.[`sc1_${lessonNum}`]);
      const dIdx = ((day - 1) % 8) + 1;
      const tid = `t1_l_d${dIdx}`;

      shortTopic = `Bài ${String(lessonNum).padStart(2, "0")} · ${vStat.lessonTitle}`;
      rawTasks = [
        {
          tag: "Bước 1 · Từ & Ngữ pháp",
          icon: "book",
          label: isSecondDayOfLesson
            ? `Ngữ pháp & Hội thoại Bài ${String(lessonNum).padStart(2, "0")} (${vStat.lessonTitle})`
            : `Từ vựng Bài ${String(lessonNum).padStart(2, "0")}: ${vStat.lessonTitle}`,
          route: "theory",
          params: { sub: "lesson-detail", book: "sc1", lesson: lessonNum, tab: isSecondDayOfLesson ? "grammar" : "vocab" },
          autoDone: !isSecondDayOfLesson && vStat.mastered >= Math.min(8, Math.max(1, vStat.total)),
          hint: `Thuộc ${vStat.mastered}/${vStat.total} từ`
        },
        {
          tag: "Bước 2 · Dịch câu",
          icon: "pen",
          label: `Luyện dịch câu & Bài tập Bài ${String(lessonNum).padStart(2, "0")}`,
          route: "theory",
          params: { sub: "lesson-detail", book: "sc1", lesson: lessonNum, tab: "exercises" },
          autoDone: hwDone,
          hint: hwDone ? "Đã làm bài tập chương" : "Việt → Hàn & câu TOPIK"
        },
        {
          tag: "Bước 3 · Thực chiến",
          icon: track === "topik_intensive" || isSecondDayOfLesson ? "layers" : "video",
          label: track === "topik_intensive" || isSecondDayOfLesson
            ? `Luyện Nghe TOPIK I · Dạng ${dIdx}`
            : "Shadowing 1 clip YouTube Shorts",
          route: track === "topik_intensive" || isSecondDayOfLesson ? "mock-test" : "practice",
          params: track === "topik_intensive" || isSecondDayOfLesson
            ? { sub: "topik1", viewMode: "segments", skill: "listening", typeId: tid }
            : { sub: "skills", skill: "shadowing" },
          autoDone: (track === "topik_intensive" || isSecondDayOfLesson) && (store.state.partStats?.[tid]?.total || 0) >= 3,
          hint: track === "topik_intensive" || isSecondDayOfLesson ? "Làm quen cấu trúc đề" : "Bắt nhịp nói người Hàn"
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
    days,
    activeDay,
    nextTask,
    completedDaysCount
  };
}

export function renderRoadmapView(root, db, navigate, openAccountCustomizer) {
  let takingPlacement = false;
  let editingCustom = false;
  let userAnswers = {};
  let placementResult = null;

  function render() {
    const plan = getGuidedStudyPlan(db, navigate);
    const { profile, days, activeDay, nextTask, completedDaysCount } = plan;
    const pct = Math.round((completedDaysCount / days.length) * 100);
    const userName = store.session.user?.name || "bạn";

    root.innerHTML = `
      <div class="container-narrow">
        <div class="box-kind" style="border-radius:20px;padding:22px;margin-bottom:22px;">
          <div class="roadmap-hero-grid">
            <div style="background:var(--primary-3);border:1.5px solid var(--border-card);border-radius:16px;padding:18px;text-align:center;">
              <div style="display:inline-grid;place-items:center;width:62px;height:62px;border-radius:18px;background:var(--primary);border:2px solid var(--primary-1);box-shadow:0 3px 0 var(--primary-1);">
                ${daisyLogoSVG(40)}
              </div>
              <strong style="display:block;margin-top:8px;color:var(--primary-1);font-size:15px;">Lộ trình của ${userName}</strong>
              <span style="font-size:12.5px;color:var(--text-muted);">Đang ở <strong>Ngày ${activeDay.day}/30</strong> · Xong ${completedDaysCount} ngày</span>
              <div class="progress-track" style="margin-top:8px;">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
            </div>

            <div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
                <span class="badge-orange">${STAGE_LABELS[profile.startBook] || STAGE_LABELS[profile.startStage] || STAGE_LABELS.q1}</span>
                <span class="meta-chip" style="color:var(--primary-1);">${TRACK_LABELS[profile.focusTrack] || TRACK_LABELS.balanced}</span>
                <span class="meta-chip">${profile.dailyMinutes || 30} phút/ngày</span>
              </div>
              <h2 style="margin:0 0 6px;font-size:20px;">Đang học: Ngày ${activeDay.day} — ${activeDay.shortTopic}</h2>
              <p style="margin:0 0 12px;color:var(--text-muted);font-size:14px;">
                Bước tiếp theo cần làm: <strong style="color:var(--primary-1);">${nextTask.label}</strong>
              </p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn-primary" id="btn-rm-continue-next">
                  ▶ Học tiếp Bước ${nextTask.stepIdx + 1}/${nextTask.totalSteps}
                </button>
                <button class="btn-outline-teal" id="btn-start-placement">
                  ${ico("sparkle", 15)} Test xếp lớp
                </button>
                <button class="btn-outline-teal" id="btn-customize-roadmap">
                  ${ico("compass", 15)} Đổi mục tiêu
                </button>
              </div>

              ${editingCustom ? `
                <div style="margin-top:14px;background:var(--bg-body);border:1.5px solid var(--border-card);border-radius:14px;padding:14px;">
                  <div class="grid-2" style="gap:10px;margin-bottom:10px;">
                    <div>
                      <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Xuất phát điểm</label>
                      <select id="rm-stage" class="box-select" style="width:100%;">
                        <option value="zero" ${profile.startStage === "zero" ? "selected" : ""}>Mất gốc / Học từ Hangeul</option>
                        <option value="sc1" ${profile.startStage === "sc1" ? "selected" : ""}>Sơ cấp 1 (Giáo trình Tổng Hợp)</option>
                        <option value="sc2" ${profile.startStage === "sc2" ? "selected" : ""}>Nước rút TOPIK I Cấp 2</option>
                        <option value="tc3" ${profile.startStage === "tc3" ? "selected" : ""}>Trung cấp TOPIK II &amp; Viết 원고지</option>
                      </select>
                    </div>
                    <div>
                      <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Trọng tâm ưu tiên</label>
                      <select id="rm-track" class="box-select" style="width:100%;">
                        <option value="balanced" ${profile.focusTrack === "balanced" ? "selected" : ""}>Song hành TOPIK × Giao tiếp</option>
                        <option value="topik_intensive" ${profile.focusTrack === "topik_intensive" ? "selected" : ""}>Chuyên sâu giải đề</option>
                        <option value="speaking_first" ${profile.focusTrack === "speaking_first" ? "selected" : ""}>Ưu tiên Nghe – Nói – Shadowing</option>
                      </select>
                    </div>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                    <select id="rm-mins" class="box-select">
                      <option value="15" ${Number(profile.dailyMinutes) === 15 ? "selected" : ""}>15 phút/ngày</option>
                      <option value="30" ${Number(profile.dailyMinutes) === 30 ? "selected" : ""}>30 phút/ngày</option>
                      <option value="60" ${Number(profile.dailyMinutes) === 60 ? "selected" : ""}>60 phút/ngày</option>
                    </select>
                    <button class="btn-primary" id="btn-apply-rm">Lưu lộ trình</button>
                  </div>
                </div>
              ` : ""}

              ${placementResult ? `
                <div style="margin-top:12px;background:var(--primary-3);padding:10px 14px;border-radius:12px;font-size:13.5px;color:var(--primary-4);">
                  <strong>Kết quả: ${placementResult.score}/${PLACEMENT_QUESTIONS.length} câu đúng</strong> — ${placementResult.advice}
                </div>
              ` : ""}
            </div>
          </div>
        </div>

        ${takingPlacement ? renderPlacementHTML() : `
          <div class="section-head" style="margin-top:0;">
            <h2>Chi tiết 30 ngày học (Tích ✔ từng bước hoặc học đến đâu tự lưu đến đó)</h2>
          </div>
          <div class="grid-2">
            ${days.map((d) => {
              const isToday = d.day === activeDay.day && !d.isDayComplete;
              return `
                <div class="box-kind" style="border:${isToday ? "2px solid var(--primary)" : "1.5px solid var(--border-card)"};background:${isToday ? "linear-gradient(180deg,#FFFFFF 0%,var(--primary-3) 100%)" : "#FFFFFF"};">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;">
                    <div>
                      ${isToday ? `<span class="badge-orange" style="margin-bottom:4px;">📍 HÔM NAY · ĐANG HỌC</span>` : ""}
                      <strong style="font-size:15.5px;display:block;color:${d.isDayComplete ? "var(--success)" : "var(--text-main)"};">
                        ${d.isDayComplete ? "✔ " : ""}${d.title}
                      </strong>
                    </div>
                    <span class="meta-chip" style="flex-shrink:0;">${d.doneSteps}/${d.totalSteps} bước</span>
                  </div>

                  <div style="display:flex;flex-direction:column;gap:7px;">
                    ${d.tasks.map((t) => `
                      <div style="display:flex;align-items:center;gap:8px;background:#FFFFFF;border:1px solid ${t.done ? "rgba(34,197,94,0.4)" : "var(--border-card)"};border-radius:11px;padding:7px 10px;">
                        <button type="button" class="step-check-btn ${t.done ? "checked" : ""}" data-step-chk="${d.day}" data-sidx="${t.stepIdx}" data-stotal="${d.totalSteps}" title="Đánh dấu hoàn thành bước này">✓</button>
                        <button type="button" data-day="${d.day}" data-task="${t.stepIdx}" style="flex:1;text-align:left;background:none;border:none;padding:0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                          <span style="font-size:13.5px;font-weight:600;${t.done ? "text-decoration:line-through;color:var(--text-muted);" : "color:var(--text-main);"}">${t.label}</span>
                          <span style="color:var(--primary-1);font-weight:700;font-size:12.5px;flex-shrink:0;">${t.done ? "Xem lại" : "Học →"}</span>
                        </button>
                      </div>
                    `).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `}
      </div>
    `;

    root.querySelector("#btn-rm-continue-next").addEventListener("click", () => nextTask.go());
    root.querySelector("#btn-start-placement").addEventListener("click", () => {
      takingPlacement = !takingPlacement;
      editingCustom = false;
      render();
    });
    root.querySelector("#btn-customize-roadmap").addEventListener("click", () => {
      if (openAccountCustomizer && store.session.mode === "user") {
        openAccountCustomizer();
      } else {
        editingCustom = !editingCustom;
        takingPlacement = false;
        render();
      }
    });

    const applyBtn = root.querySelector("#btn-apply-rm");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        store.updateRoadmapProfile({
          startStage: root.querySelector("#rm-stage").value,
          focusTrack: root.querySelector("#rm-track").value,
          dailyMinutes: Number(root.querySelector("#rm-mins").value)
        });
        editingCustom = false;
        render();
      });
    }

    if (takingPlacement) {
      root.querySelectorAll("[data-pq]").forEach((radio) => {
        radio.addEventListener("change", () => {
          userAnswers[Number(radio.dataset.pq)] = Number(radio.value);
        });
      });
      root.querySelector("#btn-submit-placement").addEventListener("click", () => {
        let correct = 0;
        PLACEMENT_QUESTIONS.forEach((item, i) => {
          if (userAnswers[i] === item.ans) correct += 1;
        });
        let advice = "";
        if (correct <= 1) {
          advice = "Đã xếp lộ trình bắt đầu từ Hangeul & Biến âm → Sơ cấp 1.";
          store.updateRoadmapProfile({ startStage: "zero", targetLevel: "TOPIK I - Cấp 1" });
        } else if (correct <= 3) {
          advice = "Đã xếp lộ trình vào Giáo trình Tổng Hợp Sơ cấp 1 + Shadowing.";
          store.updateRoadmapProfile({ startStage: "sc1", targetLevel: "TOPIK I - Cấp 2" });
        } else if (correct === 4) {
          advice = "Đã xếp lộ trình vào Nước rút TOPIK I & Luyện từng dạng.";
          store.updateRoadmapProfile({ startStage: "sc2", targetLevel: "TOPIK I - Cấp 2" });
        } else {
          advice = "Đã xếp lộ trình lên Trung cấp TOPIK II & Viết 원고지.";
          store.updateRoadmapProfile({ startStage: "tc3", targetLevel: "TOPIK II - Cấp 4" });
        }
        placementResult = { score: correct, advice };
        takingPlacement = false;
        render();
      });
    } else {
      root.querySelectorAll("[data-step-chk]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const dy = Number(btn.dataset.stepChk);
          const si = Number(btn.dataset.sidx);
          const st = Number(btn.dataset.stotal);
          const cur = Boolean(store.state.roadmapStepDone?.[`d${dy}_${si}`]);
          store.setRoadmapStepDone(dy, si, st, !cur);
          render();
        });
      });
      root.querySelectorAll("[data-task]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const dObj = days.find((x) => x.day === Number(btn.dataset.day));
          dObj.tasks[Number(btn.dataset.task)].go();
        });
      });
    }
  }

  function renderPlacementHTML() {
    return `
      <div class="box-kind">
        <h3 style="margin:0 0 14px;">Bài Test Xếp Lộ Trình Nhanh (6 câu)</h3>
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${PLACEMENT_QUESTIONS.map((item, qi) => `
            <div style="background:var(--bg-body);padding:13px;border-radius:12px;">
              <strong class="ko" style="display:block;margin-bottom:8px;">${item.q}</strong>
              <div class="grid-2">
                ${item.opts.map((opt, oi) => `
                  <label class="ko" style="display:flex;align-items:center;gap:8px;cursor:pointer;background:#FFF;padding:8px 12px;border-radius:10px;border:1px solid var(--border-card);">
                    <input type="radio" name="pq_${qi}" data-pq="${qi}" value="${oi}" ${userAnswers[qi] === oi ? "checked" : ""} />
                    <span>${opt}</span>
                  </label>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:16px;text-align:right;">
          <button class="btn-primary" id="btn-submit-placement">Chấm điểm &amp; Áp dụng lộ trình</button>
        </div>
      </div>
    `;
  }

  render();
}
