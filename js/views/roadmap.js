import { store, DEFAULT_ROADMAP_PROFILE } from "../store.js";

const PLACEMENT_QUESTIONS = [
  { q: "1. Chọn câu chào lịch sự khi mới gặp lần đầu:", opts: ["안녕히 가세요.", "만나서 반갑습니다.", "잘 먹겠습니다.", "주말 잘 보내세요."], ans: 1 },
  { q: "2. Điền tiểu từ đúng: '저는 도서관(   ) 한국어를 공부합니다.'", opts: ["에", "에서", "을", "하고"], ans: 1 },
  { q: "3. Dạng chia lịch sự (-아/어요) đúng của động từ '듣다' (nghe) là:", opts: ["듣어요", "들어요", "드러요", "듣아요"], ans: 1 },
  { q: "4. Chọn từ nối hợp lý: '이 옷은 디자인이 예뻐요. (     ) 값이 너무 비싸요.'", opts: ["그래서", "그런데", "그러니까", "그리고"], ans: 1 },
  { q: "5. Cụm từ đồng nghĩa với '영향을 주다' trong đề Đọc TOPIK II là:", opts: ["영향을 미치다", "관심을 가지다", "노력을 기울이다", "마음을 먹다"], ans: 0 },
  { q: "6. Quán dụng ngữ '발이 넓다' mang ý nghĩa gì?", opts: ["Đi bộ rất nhanh", "Quen biết rộng, giao thiệp rộng", "Tiêu xài hào phóng", "Mắt nhìn tinh tế"], ans: 1 }
];

const STAGE_LABELS = {
  zero: "Nhập môn Hangeul & Phát âm số 0",
  sc1: "Giáo trình Tổng Hợp Sơ cấp 1",
  sc2: "Tăng tốc từ vựng & đề TOPIK I Cấp 2",
  tc3: "Trung cấp TOPIK II & Viết 원고지"
};

const TRACK_LABELS = {
  balanced: "Song hành TOPIK × Giao tiếp",
  topik_intensive: "Chuyên sâu giải đề & câu tủ TOPIK",
  speaking_first: "Ưu tiên Nghe – Nói – Shadowing"
};

// Dynamic Personalized Roadmap Builder: generates a distinct 30-day plan for each user profile
function buildPersonalizedDays(profile, navigate) {
  const stage = profile.startStage || "sc1";
  const track = profile.focusTrack || "balanced";
  const mins = Number(profile.dailyMinutes || 30);
  const wordQuota = mins <= 15 ? 12 : (mins >= 60 ? 35 : 20);

  return Array.from({ length: 30 }, (_, idx) => {
    const day = idx + 1;
    const isMilestone = day % 5 === 0;

    if (isMilestone) {
      const isTopik2 = stage === "tc3" || (profile.targetLevel || "").includes("TOPIK II");
      return {
        day,
        isMilestone: true,
        title: `Ngày ${day} · Chặng Check năng lực & Sạch lỗi sai (${mins} phút)`,
        tasks: [
          {
            label: isTopik2 ? "Thi thử 1 đề Mini/Full Test TOPIK II bấm giờ" : "Thi thử 1 đề Mini Test TOPIK I bấm giờ",
            go: () => navigate("mock-test", { sub: isTopik2 ? "topik2" : "topik1", mode: mins >= 60 ? "full" : "mini" })
          },
          {
            label: `Ôn tập SRS (${wordQuota} từ) & Xử lý Sổ tay câu sai`,
            go: () => navigate("check-tools")
          }
        ]
      };
    }

    // Stage 1: Zero Beginner -> Days 1..4 focus on Hangeul & 7 Pronunciation Rules first!
    if (stage === "zero" && day <= 4) {
      const hangeulTopics = [
        "14 Phụ âm cơ bản & Nguyên âm đơn",
        "5 Phụ âm căng & Nguyên âm ghép",
        "Patchim (Phụ âm cuối) & Tập gõ bàn phím Hàn",
        "7 Quy tắc nối âm [도길], căng âm [학꾜] & biến âm mũi"
      ];
      return {
        day,
        isMilestone: false,
        title: `Ngày ${day} · Nền tảng Hangeul: ${hangeulTopics[day - 1]}`,
        tasks: [
          { label: `Phòng Lab Hangeul: ${hangeulTopics[day - 1]}`, go: () => navigate("theory", { sub: "hangeul" }) },
          { label: `Làm quen ${wordQuota} từ vựng Bài 01 giọng Kyuri`, go: () => navigate("theory", { sub: "lesson-detail", book: "sc1", lesson: 1 }) },
          { label: "Tập đọc nhại Shadowing lời chào cơ bản", go: () => navigate("practice", { sub: "skills", skill: "shadowing", lesson: 1 }) }
        ]
      };
    }

    // Stage 4: Intermediate TOPIK II (tc3)
    if (stage === "tc3") {
      const hanjaCycle = ((day - 1) % 6) + 1;
      const tasks = [
        { label: `Mở rộng ${wordQuota} từ qua Gốc Âm Hán–Hàn (Nhóm ${hanjaCycle}) & Kho câu tủ TOPIK II`, go: () => navigate(day % 2 === 1 ? "theory" : "theory", { sub: day % 2 === 1 ? "frequent" : "hanja" }) }
      ];
      if (track === "speaking_first") {
        tasks.push(
          { label: "Luyện trả lời bấm giờ 6 câu TOPIK Speaking (말하기)", go: () => navigate("practice", { sub: "topik2", skill: "speaking" }) },
          { label: "Nhập vai giao tiếp & Phản xạ 3 cấp kính ngữ", go: () => navigate("practice", { sub: "skills", skill: "roleplay" }) }
        );
      } else {
        tasks.push(
          { label: "Ôn cấu trúc đề TOPIK II (Đồng nghĩa Câu 5–8 & Ngữ pháp Câu 1–4)", go: () => navigate("practice", { sub: "topik2", skill: "reading" }) },
          { label: day % 2 === 0 ? "Tập viết giấy kẻ ô vuông 원고지 Câu 53–54" : "Luyện Nghe hành động tiếp theo Câu 9–12", go: () => navigate("practice", { sub: "topik2", skill: day % 2 === 0 ? "writing" : "listening" }) }
        );
      }
      return {
        day,
        isMilestone: false,
        title: `Ngày ${day} · Chuyên sâu TOPIK II & Học thuật (${mins}p/ngày)`,
        tasks
      };
    }

    // Stage 3: Elementary 2 / TOPIK I Sprint (sc2)
    if (stage === "sc2") {
      const tpChunk = Math.min(15, ((day - 1) % 15) + 1);
      const sjLessons = [3, 4, 6, 7];
      const sjLes = sjLessons[(day - 1) % sjLessons.length];
      const tasks = [
        { label: `Học & điền khuyết ${wordQuota} câu Chặng ${tpChunk} TOPIK I`, go: () => navigate("theory", { sub: "lesson-detail", book: "topik1", lesson: tpChunk }) }
      ];
      if (track === "speaking_first") {
        tasks.push(
          { label: `Từ vựng hội thoại Sejong Bài ${sjLes} + Đóng vai tình huống`, go: () => navigate("theory", { sub: "lesson-detail", book: "sejong1", lesson: sjLes }) },
          { label: "Nghe tốc độ 1.0x–1.25x & Chép chính tả câu TOPIK I", go: () => navigate("practice", { sub: "skills", skill: "listening" }) }
        );
      } else {
        tasks.push(
          { label: "Ôn các câu phản xạ & phó từ nối thường gặp TOPIK I", go: () => navigate("theory", { sub: "frequent" }) },
          { label: "Giải chuyên đề theo cấu trúc Nghe/Đọc TOPIK I", go: () => navigate("practice", { sub: "topik1", skill: day % 2 === 0 ? "reading" : "listening" }) }
        );
      }
      return {
        day,
        isMilestone: false,
        title: `Ngày ${day} · Nước rút TOPIK I Cấp 2 · Chặng ${tpChunk} (${mins}p)`,
        tasks
      };
    }

    // Default Stage 2: Sơ cấp 1 (sc1) or Zero after Day 4
    const effectiveDay = stage === "zero" ? day - 4 : day;
    const lessonNum = Math.min(15, Math.ceil(effectiveDay / 2));
    const tasks = [
      { label: `Bước 1 · Học ${wordQuota} từ & Ngữ pháp Bài ${String(lessonNum).padStart(2, "0")} (Kyuri)`, go: () => navigate("theory", { sub: "lesson-detail", book: "sc1", lesson: lessonNum, tab: "vocab" }) },
      { label: `Bước 2 · Luyện Dịch câu Việt → Hàn & Bài tập TOPIK Bài ${String(lessonNum).padStart(2, "0")}`, go: () => navigate("theory", { sub: "lesson-detail", book: "sc1", lesson: lessonNum, tab: "exercises" }) }
    ];

    if (track === "speaking_first") {
      tasks.push(
        { label: "Bước 3 · Shadowing qua Clip YouTube Shorts (Phụ đề tự chạy & Tra từ)", go: () => navigate("practice", { sub: "skills", skill: "shadowing" }) }
      );
    } else if (track === "topik_intensive") {
      tasks.push(
        { label: "Bước 3 · Luyện cấu trúc đề & Giải 20 Đề thi TOPIK chính thức", go: () => navigate("mock-test", { sub: "topik1", mode: "all" }) }
      );
    } else {
      tasks.push(
        { label: day % 2 === 1 ? "Bước 3 · Shadowing Clip YouTube Shorts phản xạ nghe nói" : "Bước 3 · Luyện đề chính thức TOPIK (Kỳ 37 → 102)", go: () => day % 2 === 1 ? navigate("practice", { sub: "skills", skill: "shadowing" }) : navigate("mock-test", { sub: "topik1", mode: "all" }) }
      );
    }

    return {
      day,
      isMilestone: false,
      title: `Ngày ${day} · Giáo trình Tổng Hợp Bài ${String(lessonNum).padStart(2, "0")} (${mins}p/ngày)`,
      tasks
    };
  });
}

export function renderRoadmapView(root, db, navigate, openAccountCustomizer) {
  let takingPlacement = false;
  let editingCustom = false;
  let userAnswers = {};
  let placementResult = null;

  function render() {
    const profile = store.state.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
    const days = buildPersonalizedDays(profile, navigate);
    const doneCount = Object.values(store.state.roadmapDone).filter(Boolean).length;
    const pct = Math.round((doneCount / days.length) * 100);
    const userName = store.session.user?.name || "Chế độ Dùng thử";

    root.innerHTML = `
      <div class="container-narrow">
        <div class="box-kind" style="border-radius:16px;padding:24px;margin-bottom:24px;">
          <div class="roadmap-hero-grid">
            <div style="background:var(--primary-3);border-radius:16px;padding:22px;text-align:center;">
              <div style="display:inline-grid;place-items:center;width:72px;height:72px;border-radius:20px;background:var(--primary);box-shadow:0 6px 16px rgba(0,178,165,0.28);">
                <svg width="46" height="46" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <g transform="translate(32,32)" fill="#FFFFFF">
                    <ellipse rx="6.2" ry="20" transform="rotate(0)"/>
                    <ellipse rx="6.2" ry="20" transform="rotate(30)"/>
                    <ellipse rx="6.2" ry="20" transform="rotate(60)"/>
                    <ellipse rx="6.2" ry="20" transform="rotate(90)"/>
                    <ellipse rx="6.2" ry="20" transform="rotate(120)"/>
                    <ellipse rx="6.2" ry="20" transform="rotate(150)"/>
                    <circle r="9.5" fill="#FFD769" stroke="#FE9A05" stroke-width="2.2"/>
                  </g>
                </svg>
              </div>
              <strong style="display:block;margin-top:10px;color:var(--primary-1);font-size:16px;">Lộ trình của ${userName}</strong>
              <span style="font-size:13px;color:var(--text-muted);">Hoàn thành ${doneCount}/${days.length} ngày (${pct}%)</span>
              <div class="progress-track" style="margin-top:10px;">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
            </div>

            <div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                <span class="badge-orange" style="background:rgba(254,154,5,0.14);">${STAGE_LABELS[profile.startStage] || STAGE_LABELS.sc1}</span>
                <span class="badge-orange" style="background:var(--primary-3);color:var(--primary-4);">${TRACK_LABELS[profile.focusTrack] || TRACK_LABELS.balanced}</span>
                <span class="badge-orange" style="background:#F1F5F9;color:#334155;">⏱️ ${profile.dailyMinutes || 30} phút/ngày</span>
              </div>
              <h2 style="margin:0 0 8px;font-size:22px;">Lộ trình Cá nhân hóa riêng theo hồ sơ mục tiêu ${store.state.targetLevel}</h2>
              <p style="margin:0 0 14px;color:var(--text-muted);font-size:14.5px;">
                Mỗi tài khoản đăng ký trên <strong>CJDUZ</strong> sở hữu một cấu trúc bài học hằng ngày riêng biệt dựa trên trình độ đầu vào, quỹ thời gian và định hướng (Giao tiếp hay Luyện đề TOPIK).
              </p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn-primary" id="btn-start-placement">
                  📝 Làm Test đầu vào tự động xếp lộ trình
                </button>
                <button class="btn-outline-teal" id="btn-customize-roadmap">
                  ⚙️ Tùy chỉnh thông số lộ trình của tôi
                </button>
              </div>

              ${editingCustom ? `
                <div style="margin-top:14px;background:#F8FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
                  <div class="grid-2" style="gap:10px;margin-bottom:10px;">
                    <div>
                      <label style="font-size:12.5px;font-weight:600;display:block;margin-bottom:4px;">Xuất phát điểm</label>
                      <select id="rm-stage" class="box-select" style="width:100%;">
                        <option value="zero" ${profile.startStage === "zero" ? "selected" : ""}>Mất gốc / Học từ Hangeul</option>
                        <option value="sc1" ${profile.startStage === "sc1" ? "selected" : ""}>Sơ cấp 1 (Giáo trình Tổng Hợp)</option>
                        <option value="sc2" ${profile.startStage === "sc2" ? "selected" : ""}>Nước rút TOPIK I Cấp 2</option>
                        <option value="tc3" ${profile.startStage === "tc3" ? "selected" : ""}>Trung cấp TOPIK II &amp; Viết 원고지</option>
                      </select>
                    </div>
                    <div>
                      <label style="font-size:12.5px;font-weight:600;display:block;margin-bottom:4px;">Trọng tâm ưu tiên</label>
                      <select id="rm-track" class="box-select" style="width:100%;">
                        <option value="balanced" ${profile.focusTrack === "balanced" ? "selected" : ""}>Song hành TOPIK × Giao tiếp</option>
                        <option value="topik_intensive" ${profile.focusTrack === "topik_intensive" ? "selected" : ""}>Cày đề &amp; Câu tủ TOPIK</option>
                        <option value="speaking_first" ${profile.focusTrack === "speaking_first" ? "selected" : ""}>Ưu tiên Nghe – Nói – Shadowing</option>
                      </select>
                    </div>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
                    <select id="rm-mins" class="box-select">
                      <option value="15" ${Number(profile.dailyMinutes) === 15 ? "selected" : ""}>15 phút/ngày (Bận rộn)</option>
                      <option value="30" ${Number(profile.dailyMinutes) === 30 ? "selected" : ""}>30 phút/ngày (Tiêu chuẩn)</option>
                      <option value="60" ${Number(profile.dailyMinutes) === 60 ? "selected" : ""}>60 phút/ngày (Tăng tốc)</option>
                    </select>
                    <button class="btn-primary" id="btn-apply-rm">Áp dụng lộ trình mới</button>
                  </div>
                </div>
              ` : ""}

              ${placementResult ? `
                <div style="margin-top:12px;background:var(--primary-3);padding:10px 14px;border-radius:10px;font-size:14px;color:var(--primary-4);">
                  🎯 <strong>Kết quả Test đầu vào: ${placementResult.score}/${PLACEMENT_QUESTIONS.length} câu đúng</strong> — ${placementResult.advice}
                </div>
              ` : ""}
            </div>
          </div>
        </div>

        ${takingPlacement ? renderPlacementHTML() : `
          <div class="section-head" style="margin-top:0;">
            <h2>Bản đồ 30 ngày dành riêng cho ${userName}</h2>
          </div>
          <div class="grid-2">
            ${days.map((d) => {
              const isDone = !!store.state.roadmapDone[d.day];
              return `
                <div class="box-kind" style="border-left: 5px solid ${d.isMilestone ? "var(--yellow-2)" : (isDone ? "var(--success)" : "var(--primary)")};">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;">
                    <strong style="font-size:15.5px;color:${d.isMilestone ? "#C26A00" : "var(--text-main)"};">${d.title}</strong>
                    <label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;cursor:pointer;color:${isDone ? "var(--success)" : "var(--text-muted)"};flex-shrink:0;">
                      <input type="checkbox" data-day-check="${d.day}" ${isDone ? "checked" : ""} />
                      <span>${isDone ? "Đã xong" : "Đánh dấu"}</span>
                    </label>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    ${d.tasks.map((t, ti) => `
                      <button type="button" data-day="${d.day}" data-task="${ti}" style="text-align:left;background:#F8FAFB;border:1px solid #EAEEF2;border-radius:8px;padding:8px 11px;font-size:13.5px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                        <span>• ${t.label}</span>
                        <span style="color:var(--primary-1);font-weight:700;flex-shrink:0;">Học →</span>
                      </button>
                    `).join("")}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `}
      </div>
    `;

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
          advice = "Hệ thống đã xếp lộ trình của bạn bắt đầu từ Phòng Lab Hangeul & 7 Quy tắc Biến âm → Sơ cấp 1.";
          store.updateRoadmapProfile({ startStage: "zero", targetLevel: "TOPIK I - Cấp 1" });
        } else if (correct <= 3) {
          advice = "Hệ thống đã xếp lộ trình của bạn vào Giáo trình Tổng Hợp Sơ cấp 1 kết hợp Shadowing.";
          store.updateRoadmapProfile({ startStage: "sc1", targetLevel: "TOPIK I - Cấp 2" });
        } else if (correct === 4) {
          advice = "Nền Sơ cấp khá vững! Lộ trình đã chuyển sang Nước rút 432 câu TOPIK I & Cấu trúc đề.";
          store.updateRoadmapProfile({ startStage: "sc2", targetLevel: "TOPIK I - Cấp 2" });
        } else {
          advice = "Xuất sắc! Lộ trình của bạn đã nâng lên Trung cấp TOPIK II, Từ đồng nghĩa & Viết 원고지.";
          store.updateRoadmapProfile({ startStage: "tc3", targetLevel: "TOPIK II - Cấp 4" });
        }
        placementResult = { score: correct, advice };
        takingPlacement = false;
        render();
      });
    } else {
      root.querySelectorAll("[data-day-check]").forEach((chk) => {
        chk.addEventListener("change", () => {
          store.state.roadmapDone[chk.dataset.dayCheck] = chk.checked;
          store.touchStreak();
          store.save();
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
        <h3 style="margin:0 0 14px;">Bài Kiểm Tra Xếp Lộ Trình Tự Động (6 câu từ Sơ cấp đến Trung cấp)</h3>
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${PLACEMENT_QUESTIONS.map((item, qi) => `
            <div style="background:#F8FAFB;padding:14px;border-radius:10px;">
              <strong class="ko" style="display:block;margin-bottom:8px;">${item.q}</strong>
              <div class="grid-2">
                ${item.opts.map((opt, oi) => `
                  <label class="ko" style="display:flex;align-items:center;gap:8px;cursor:pointer;background:#FFF;padding:8px 12px;border-radius:8px;border:1px solid #E5E7EB;">
                    <input type="radio" name="pq_${qi}" data-pq="${qi}" value="${oi}" ${userAnswers[qi] === oi ? "checked" : ""} />
                    <span>${opt}</span>
                  </label>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
        <div style="margin-top:18px;text-align:right;">
          <button class="btn-primary" id="btn-submit-placement">Chấm điểm &amp; Thiết lập lộ trình riêng</button>
        </div>
      </div>
    `;
  }

  render();
}
