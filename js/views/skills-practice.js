import { store, playAudio, preloadAudioUrls, speakKoreanTTS } from "../store.js?v=20261126-10";
import { ico } from "../icons.js?v=20261126-10";
import { analyzePronunciationRules, conjugateKoreanPredicate } from "../korean-engine.js?v=20261126-10";
import { renderChapterExercises } from "../chapter-exercises.js?v=20261126-10";
import { renderShortsShadowingStudio } from "../shorts-shadowing.js?v=20261126-10";

const READING_PASSAGES = [
  {
    id: "read_1",
    level: "Sơ cấp 1 · Giáo trình Tổng Hợp",
    title: "대학생 흐엉 씨의 하루 (Một ngày của sinh viên Hương)",
    paragraphs: [
      "저는 베트남 사람입니다. 지금 한국 대학교에서 한국어를 공부합니다.",
      "아침 일곱 시에 일어납니다. 학생 식당에서 친구와 아침 밥을 먹습니다.",
      "오전 아홉 시부터 오후 한 시까지 교실에서 수업이 있습니다. 오후에는 도서관에서 숙제합니다. 저녁에는 운동장에서 운동합니다."
    ],
    viTranslation: "Tôi là người Việt Nam. Hiện tại tôi học tiếng Hàn ở trường Đại học Hàn Quốc. Buổi sáng tôi thức dậy lúc 7 giờ. Tôi ăn sáng cùng bạn ở nhà ăn sinh viên. Từ 9 giờ sáng đến 1 giờ chiều có tiết học ở phòng học. Buổi chiều tôi làm bài tập ở thư viện. Buổi tối tôi tập thể dục ở sân vận động.",
    glossary: {
      "베트남": "Việt Nam", "한국": "Hàn Quốc", "대학교에서": "ở trường đại học", "한국어를": "tiếng Hàn (tân ngữ)",
      "공부합니다": "học tập", "아침": "buổi sáng", "일곱": "số 7 (thuần Hàn)", "일어납니다": "thức dậy",
      "학생": "học sinh, sinh viên", "식당에서": "ở nhà ăn", "친구와": "cùng với bạn", "먹습니다": "ăn",
      "교실에서": "ở phòng học", "수업이": "tiết học, buổi học", "도서관에서": "ở thư viện", "숙제합니다": "làm bài tập về nhà",
      "운동장에서": "ở sân vận động", "운동합니다": "tập thể dục"
    },
    questions: [
      { id: "r1_q1", question: "흐엉 씨는 오후에 어디에서 숙제합니까?", options: ["교실", "도서관", "학생 식당", "운동장"], answer: 1, explain: "Trong bài có câu: '오후에는 도서관에서 숙제합니다' (Buổi chiều làm bài tập ở thư viện)." },
      { id: "r1_q2", question: "이 글의 내용과 같은 것을 고르십시오 (Chọn câu đúng với nội dung bài):", options: ["흐엉 씨는 혼자 아침을 먹습니다.", "수업은 오후 두 시에 끝납니다.", "저녁에 운동장에서 운동합니다.", "일곱 시에 학교에 갑니다."], answer: 2, explain: "Câu cuối bài nêu rõ: '저녁에는 운동장에서 운동합니다'." }
    ]
  },
  {
    id: "read_2",
    level: "TOPIK I · Đọc Thông báo & Đời sống",
    title: "도서관 이용 안내문 (Thông báo hướng dẫn sử dụng Thư viện)",
    paragraphs: [
      "우리 대학교 도서관은 월요일부터 토요일까지 문을 엽니다. 일요일과 공휴일에는 쉽니다.",
      "학생증을 가지고 오면 한 번에 책을 다섯 권까지 빌릴 수 있습니다. 도서관 안에서는 음식을 먹거나 큰 소리로 이야기하면 안 됩니다."
    ],
    viTranslation: "Thư viện trường đại học chúng ta mở cửa từ thứ Hai đến thứ Bảy. Chủ nhật và ngày lễ nghỉ. Nếu mang theo thẻ sinh viên, mỗi lần bạn có thể mượn tối đa 5 quyển sách. Bên trong thư viện không được ăn uống hoặc nói chuyện lớn tiếng.",
    glossary: {
      "도서관은": "thư viện thì", "월요일부터": "từ thứ Hai", "토요일까지": "đến thứ Bảy", "문을": "cửa", "엽니다": "mở (열다)",
      "일요일과": "Chủ nhật và", "공휴일에는": "vào ngày nghỉ lễ", "쉽니다": "nghỉ (쉬다)",
      "학생증을": "thẻ sinh viên", "가지고": "mang theo", "다섯": "5 (năm)", "권까지": "tối đa ... quyển",
      "빌릴": "mượn (빌리다)", "음식을": "đồ ăn", "이야기하면": "nếu nói chuyện", "안 됩니다": "không được phép"
    },
    questions: [
      { id: "r2_q1", question: "책을 빌리려면 무엇이 필요합니까?", options: ["여권", "학생증", "신용카드", "전화번호"], answer: 1, explain: "'학생증을 가지고 오면... 빌릴 수 있습니다' → Cần thẻ sinh viên (학생증)." },
      { id: "r2_q2", question: "도서관 이용 안내 내용과 다른 것은 무엇입니까?", options: ["토요일에도 이용할 수 있습니다.", "일요일에는 문을 닫습니다.", "한 번에 일곱 권을 빌릴 수 있습니다.", "안에서 음식을 먹으면 안 됩니다."], answer: 2, explain: "Chỉ được mượn tối đa 5 quyển (다섯 권까지), không phải 7 quyển." }
    ]
  },
  {
    id: "read_3",
    level: "TOPIK II (Cấp 3–4) · Xã hội & Tiêu dùng",
    title: "1인 가구 증가와 소비 변화 (Sự gia tăng hộ độc thân & thay đổi tiêu dùng)",
    paragraphs: [
      "최근 한국 사회에서는 혼자 사는 1인 가구가 빠르게 늘어나고 있다. 이에 따라 마트나 편의점에서도 대용량 제품보다는 소포장 식품이 큰 인기를 끌고 있다.",
      "또한 집에서 간단하게 요리해 먹을 수 있는 간편식 매출도 해마다 증가하는 추세이다. 기업들은 이러한 변화에 맞추어 다양한 맞춤형 상품을 개발하고 있다."
    ],
    viTranslation: "Gần đây trong xã hội Hàn Quốc, các hộ gia đình 1 người sống độc thân đang tăng lên nhanh chóng. Theo đó, tại các siêu thị hay cửa hàng tiện lợi, thực phẩm đóng gói nhỏ đang thu hút sự ưa chuộng lớn hơn là sản phẩm dung tích lớn. Ngoài ra, doanh số thực phẩm tiện lợi có thể nấu ăn đơn giản tại nhà cũng có xu hướng tăng mỗi năm. Các doanh nghiệp đang phát triển đa dạng sản phẩm thiết kế riêng phù hợp với sự thay đổi này.",
    glossary: {
      "최근": "gần đây (Tối cận)", "1인 가구": "hộ gia đình 1 người", "늘어나고": "đang tăng lên", "이에 따라": "theo đó",
      "편의점에서도": "ngay cả ở cửa hàng tiện lợi", "대용량": "dung tích lớn", "소포장": "đóng gói nhỏ",
      "인기를 끌고": "thu hút sự yêu thích", "간편식": "thực phẩm chế biến tiện lợi", "매출도": "doanh thu bán hàng",
      "증가하는 추세이다": "đang có xu hướng gia tăng", "맞춤형": "thiết kế đo ni đóng giày / cá nhân hóa", "개발하고": "đang phát triển"
    },
    questions: [
      { id: "r3_q1", question: "이 글의 중심 생각으로 가장 알맞은 것을 고르십시오:", options: ["1인 가구가 줄어들면서 대형 마트가 사라지고 있다.", "가구 형태의 변화가 식품 소비와 상품 개발에 영향을 미치고 있다.", "건강을 위해 집에서 직접 요리하는 사람이 줄고 있다.", "편의점 물건 가격이 점점 비싸지고 있다."], answer: 1, explain: "Bài đọc phân tích việc tăng hộ 1 người làm thay đổi xu hướng tiêu thụ thực phẩm nhỏ gọn và khiến doanh nghiệp phát triển sản phẩm tương ứng." }
    ]
  }
];

const ROLEPLAY_SCENARIOS = [
  {
    id: "rp_cafe",
    title: "Tại quán cà phê Seoul (주문하기)",
    npcRole: "Nhân viên quán (점원)",
    turns: [
      { npcKo: "어서 오세요! 주문하시겠어요?", npcVi: "Xin chào quý khách! Quý khách gọi món chưa ạ?", hints: ["아이스 아메리카노 한 잔 주세요.", "따뜻한 카페라떼 두 잔하고 케이크 주세요."] },
      { npcKo: "매장에서 드시고 가세요, 아니면 포장해 드릴까요?", npcVi: "Quý khách dùng tại quán hay mang đi ạ?", hints: ["매장에서 마실게요.", "가지고 갈게요 (포장해 주세요)."] },
      { npcKo: "네, 사천오백 원입니다. 결제는 어떻게 하시겠어요?", npcVi: "Vâng, 4.500 won ạ. Quý khách thanh toán bằng gì ạ?", hints: ["카드로 계산할게요.", "현금으로 할게요. 감사합니다!"] }
    ]
  },
  {
    id: "rp_subway",
    title: "Hỏi đường Tàu điện ngầm (길 묻기)",
    npcRole: "Người Hàn ở ga tàu (역무원)",
    turns: [
      { npcKo: "네, 무엇을 도와드릴까요?", npcVi: "Vâng, tôi có thể giúp gì cho bạn?", hints: ["실례지만 명동역에 가려면 몇 호선을 타야 해요?", "경복궁에 어떻게 가는지 알려 주세요."] },
      { npcKo: "여기서 4호선을 타시고 세 정거장 후에 내리시면 돼요.", npcVi: "Từ đây bạn lên tàu tuyến số 4 và xuống sau 3 trạm là được nhé.", hints: ["네, 정말 감사합니다!", "혹시 갈아타야 해요? 고맙습니다!"] }
    ]
  }
];

export function renderSkillsPracticeView(root, db, navigate, params = {}) {
  let activeSkill = params.skill || "shadowing"; // translate | listening | reading | shadowing | textbook-shadow | roleplay
  let chLesson = Number(params.lesson || 1);

  function renderHeaderAndTabs() {
    root.innerHTML = `
      <div class="container-web">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <div class="breadcrumb-bar" style="margin-bottom:0;">
            <span>Luyện tập</span><span>▶</span><span>Kỹ năng &amp; Shorts</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" class="btn-outline-teal" id="sw-to-topik1" style="padding:5px 12px;font-size:13px;">Luyện dạng TOPIK I</button>
            <button type="button" class="btn-outline-teal" id="sw-to-topik2" style="padding:5px 12px;font-size:13px;">Luyện dạng TOPIK II</button>
          </div>
        </div>

        <div class="skill-pills-row">
          <button class="btn-skill ${activeSkill === "translate" ? "active" : ""}" data-sk="translate">
            ${ico("pen", 16)} Dịch câu &amp; Bài tập chương
          </button>
          <button class="btn-skill ${activeSkill === "shadowing" || activeSkill === "textbook-shadow" ? "active" : ""}" data-sk="shadowing">
            ${ico("video", 16)} Shadowing Shorts
            <span class="badge-mia">HOT</span>
          </button>
          <button class="btn-skill ${activeSkill === "listening" ? "active" : ""}" data-sk="listening">${ico("headphones", 16)} Nghe chép</button>
          <button class="btn-skill ${activeSkill === "reading" ? "active" : ""}" data-sk="reading">${ico("book", 16)} Đọc hiểu</button>
          <button class="btn-skill ${activeSkill === "roleplay" ? "active" : ""}" data-sk="roleplay">${ico("chat", 16)} Giao tiếp &amp; Kính ngữ</button>
        </div>

        <div id="skill-stage"></div>
      </div>
    `;

    root.querySelector("#sw-to-topik1").addEventListener("click", () => navigate("mock-test", { sub: "topik1", viewMode: "segments", skill: "listening" }));
    root.querySelector("#sw-to-topik2").addEventListener("click", () => navigate("mock-test", { sub: "topik2", viewMode: "segments", skill: "listening" }));
    root.querySelectorAll("[data-sk]").forEach((btn) => {
      btn.addEventListener("click", () => {
        navigate("practice", { sub: "skills", skill: btn.dataset.sk, lesson: chLesson });
      });
    });

    const stage = root.querySelector("#skill-stage");
    if (activeSkill === "translate") {
      stage.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
          <strong>Chọn Chương để Luyện dịch câu &amp; Bài tập TOPIK:</strong>
          <select id="prac-ch-select" class="box-select">
            ${Array.from({ length: 15 }, (_, i) => i + 1).map((n) => `
              <option value="${n}" ${n === chLesson ? "selected" : ""}>Sơ cấp 1 · Chương ${String(n).padStart(2, "0")}</option>
            `).join("")}
          </select>
        </div>
        <div id="prac-ch-body"></div>
      `;
      stage.querySelector("#prac-ch-select").addEventListener("change", (e) => {
        navigate("practice", { sub: "skills", skill: "translate", lesson: Number(e.target.value) });
      });
      renderChapterExercises(stage.querySelector("#prac-ch-body"), db, "sc1", chLesson);
    } else if (activeSkill === "shadowing") {
      renderShortsShadowingStudio(stage, db, () => {
        navigate("practice", { sub: "skills", skill: "textbook-shadow", lesson: chLesson });
      });
    } else if (activeSkill === "textbook-shadow") {
      stage.innerHTML = `<div style="margin-bottom:12px;"><button type="button" class="btn-outline-teal" id="back-to-yt-shorts">← Quay lại Shadowing Clip YouTube Shorts</button></div><div id="tb-shadow-slot"></div>`;
      stage.querySelector("#back-to-yt-shorts").addEventListener("click", () => {
        navigate("practice", { sub: "skills", skill: "shadowing", lesson: chLesson });
      });
      renderShadowingModule(stage.querySelector("#tb-shadow-slot"), db, chLesson);
    } else if (activeSkill === "listening") {
      renderListeningModule(stage, db);
    } else if (activeSkill === "reading") {
      renderReadingModule(stage, db);
    } else {
      renderRoleplayAndPoliteness(stage);
    }
  }

  renderHeaderAndTabs();
}

// 1. LISTENING MODULE: Speed 0.75x-1.25x, Loop, Transcript Toggle & Cloze/Dictation
function renderListeningModule(stage, db) {
  const tracks = [
    ...db.sc1Vocab.filter((x) => x.exampleAudio && x.exampleKo).map((x) => ({
      id: x.id,
      group: `Sơ cấp 1 · Bài ${String(x.lesson).padStart(2, "0")}`,
      ko: x.exampleKo,
      vi: x.exampleVi,
      targetWord: x.korean,
      audio: x.exampleAudio
    })),
    ...db.topik1Bank.filter((x) => x.exampleAudio && x.exampleKo).slice(0, 90).map((x) => ({
      id: x.id,
      group: "Nghe câu TOPIK I",
      ko: x.exampleKo,
      vi: x.exampleVi,
      targetWord: x.korean,
      audio: x.exampleAudio
    }))
  ];

  const groups = [...new Set(tracks.map((t) => t.group))];
  let selectedGroup = groups[0];
  let idx = 0;
  let speed = 1.0;
  let showScript = false;
  let loopActive = false;
  let loopAudioRef = null;

  function stopLoop() {
    loopActive = false;
    if (loopAudioRef) {
      loopAudioRef.loop = false;
      loopAudioRef.pause();
      loopAudioRef = null;
    }
  }

  function render() {
    const list = tracks.filter((t) => t.group === selectedGroup);
    const cur = list[idx % list.length];
    const maskedKo = cur.ko.includes(cur.targetWord)
      ? cur.ko.replace(cur.targetWord, " ( _______ ) ")
      : "Nghe và chép lại câu tiếng Hàn bạn nghe được:";

    stage.innerHTML = `
      <div class="box-kind">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <strong>Chọn bài nghe:</strong>
            <select id="listen-group-sel" class="box-select">
              ${groups.map((g) => `<option value="${g}" ${g === selectedGroup ? "selected" : ""}>${g}</option>`).join("")}
            </select>
            <span style="font-size:13.5px;color:var(--text-muted);">Câu ${(idx % list.length) + 1} / ${list.length}</span>
          </div>

          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:13.5px;color:var(--text-muted);">Tốc độ:</span>
            ${[0.75, 1.0, 1.25].map((sp) => `
              <button type="button" class="btn-outline-teal" data-sp="${sp}" style="padding:4px 12px;font-size:13px;${speed === sp ? "background:var(--primary);color:#FFF;" : ""}">${sp}x</button>
            `).join("")}
          </div>
        </div>

        <div style="background:var(--primary-3);border-radius:14px;padding:22px;text-align:center;margin-bottom:18px;">
          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
            <button class="btn-primary" id="btn-listen-play">▶ Phát câu nghe (${speed}x)</button>
            <button class="btn-outline-teal" id="btn-listen-loop">${loopActive ? "⏹ Dừng lặp A–B" : "🔁 Lặp liên tục câu này"}</button>
            <button class="btn-outline-teal" id="btn-toggle-sub">${showScript ? "🙈 Ẩn phụ đề" : "👁️ Xem lời thoại Hàn–Việt"}</button>
          </div>

          <div class="ko" style="font-size:21px;font-weight:700;color:var(--text-main);">
            ${showScript ? cur.ko : maskedKo}
          </div>
          <div style="font-size:14.5px;color:var(--text-muted);margin-top:6px;">
            Nghĩa gợi ý: ${cur.vi}
          </div>
        </div>

        <div style="max-width:620px;margin:0 auto;">
          <label style="display:block;font-size:14px;font-weight:600;margin-bottom:6px;">
            Điền từ còn thiếu <span style="color:var(--text-muted);font-weight:400;">(hoặc chép lại cả câu)</span>:
          </label>
          <div style="display:flex;gap:10px;">
            <input id="dict-input" class="ko" placeholder="Nhập từ tiếng Hàn nghe được..." style="flex:1;padding:11px 16px;border-radius:99px;border:1.5px solid var(--primary);font-size:17px;font-weight:600;" />
            <button class="btn-orange" id="btn-dict-check">Check đáp án</button>
            <button class="btn-outline-teal" id="btn-listen-next">Câu tiếp →</button>
          </div>
          <div id="dict-feedback" style="margin-top:12px;font-weight:600;"></div>
        </div>
      </div>
    `;

    stage.querySelector("#listen-group-sel").addEventListener("change", (e) => {
      stopLoop();
      selectedGroup = e.target.value;
      idx = 0;
      render();
    });

    stage.querySelectorAll("[data-sp]").forEach((b) => {
      b.addEventListener("click", () => {
        speed = Number(b.dataset.sp);
        render();
      });
    });

    stage.querySelector("#btn-listen-play").addEventListener("click", () => {
      stopLoop();
      playAudio(cur.audio, speed);
    });

    stage.querySelector("#btn-listen-loop").addEventListener("click", () => {
      if (loopActive) {
        stopLoop();
        render();
      } else {
        loopActive = true;
        loopAudioRef = playAudio(cur.audio, speed);
        if (loopAudioRef) loopAudioRef.loop = true;
        render();
      }
    });

    stage.querySelector("#btn-toggle-sub").addEventListener("click", () => {
      showScript = !showScript;
      render();
    });

    const checkFn = () => {
      const val = stage.querySelector("#dict-input").value.trim().replace(/[.?!]/g, "");
      const fb = stage.querySelector("#dict-feedback");
      const ok = val === cur.targetWord || val === cur.ko.replace(/[.?!]/g, "");
      if (ok) {
        fb.innerHTML = `<span style="color:var(--success)">✔ Chính xác! Câu đầy đủ: <span class="ko">${cur.ko}</span></span>`;
      } else {
        fb.innerHTML = `<span style="color:var(--danger)">✘ Từ khóa đúng là: <strong class="ko">${cur.targetWord}</strong> — Câu đầy đủ: <span class="ko">${cur.ko}</span></span>`;
      }
    };

    stage.querySelector("#btn-dict-check").addEventListener("click", checkFn);
    stage.querySelector("#dict-input").addEventListener("keydown", (e) => { if (e.key === "Enter") checkFn(); });
    stage.querySelector("#btn-listen-next").addEventListener("click", () => {
      stopLoop();
      idx += 1;
      showScript = false;
      render();
    });
  }

  render();
}

// 2. READING MODULE: Interactive Tap-to-Lookup Reader + Comprehension Check
function renderReadingModule(stage, db) {
  let pIdx = 0;
  let showVi = false;
  let selectedWordInfo = null;
  let answers = {};

  // Build quick lookup map from extracted DB
  const vocabMap = new Map();
  [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank].forEach((w) => {
    if (!vocabMap.has(w.korean)) vocabMap.set(w.korean, w);
  });

  function lookupToken(rawToken, passageGlossary) {
    const clean = rawToken.replace(/[.,?!""'']/g, "").trim();
    if (passageGlossary[clean]) {
      return { token: clean, meaning: passageGlossary[clean], matchCard: vocabMap.get(clean) || null };
    }
    // Strip common Korean particles (은/는/이/가/을/를/에서/에/와/과/도/만)
    const stripped = clean.replace(/(에서는|에서|으로|부터|까지|은|는|이|가|을|를|에|와|과|도|만)$/, "");
    if (passageGlossary[stripped]) {
      return { token: clean, meaning: passageGlossary[stripped], matchCard: vocabMap.get(stripped) || null };
    }
    if (vocabMap.has(clean)) {
      const c = vocabMap.get(clean);
      return { token: clean, meaning: c.vietnamese, matchCard: c };
    }
    if (vocabMap.has(stripped)) {
      const c = vocabMap.get(stripped);
      return { token: `${clean} (gốc: ${stripped})`, meaning: c.vietnamese, matchCard: c };
    }
    return { token: clean, meaning: "Bấm nút Loa để nghe phát âm hoặc mở Tra cứu & Chia ĐT trên góc phải.", matchCard: null };
  }

  function render() {
    const p = READING_PASSAGES[pIdx];
    stage.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        ${READING_PASSAGES.map((item, i) => `
          <button class="btn-outline-teal" data-p="${i}" style="${i === pIdx ? "background:var(--primary);color:#FFF;" : ""}">
            Bài đọc ${i + 1}: ${item.level}
          </button>
        `).join("")}
      </div>

      <div class="grid-2" style="align-items:start;">
        <!-- Left: Tap-to-Lookup Korean Passage -->
        <div class="box-kind">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;">
            <h3 class="ko" style="margin:0;font-size:19px;color:var(--primary-1);">${p.title}</h3>
            <button class="btn-audio" id="btn-read-aloud" title="Đọc mẫu cả bài">🔊</button>
          </div>
          <div style="font-size:12.5px;color:var(--primary-1);font-weight:700;margin-bottom:10px;">
            💡 Mẹo đọc nhanh D ● TOPIK: Bấm vào bất kỳ chữ tiếng Hàn nào bên dưới để tra nghĩa tức thì!
          </div>

          <div class="ko" style="font-size:18px;line-height:1.9;background:#F8FAFB;padding:16px;border-radius:12px;">
            ${p.paragraphs.map((para) => `
              <p style="margin:0 0 12px;">
                ${para.split(" ").map((tok) => `<span class="tap-word" data-tok="${tok}">${tok}</span>`).join(" ")}
              </p>
            `).join("")}
          </div>

          ${selectedWordInfo ? `
            <div style="margin-top:12px;background:var(--primary-3);border:1px solid var(--primary);border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
              <div>
                <strong class="ko" style="font-size:18px;color:var(--primary-4);">${selectedWordInfo.token}</strong>
                <div style="font-size:14.5px;font-weight:600;margin-top:2px;">Nghĩa: ${selectedWordInfo.meaning}</div>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn-audio" id="btn-tok-speak">🔊</button>
                ${selectedWordInfo.matchCard ? `<button class="btn-orange" id="btn-tok-star" style="padding:6px 12px;font-size:12.5px;">★ Lưu ôn từ</button>` : ""}
              </div>
            </div>
          ` : ""}

          <button class="btn-outline-teal" id="btn-toggle-vi" style="margin-top:14px;padding:6px 14px;font-size:13.5px;">
            ${showVi ? "Ẩn bản dịch tiếng Việt" : "Xem bản dịch tiếng Việt toàn bài"}
          </button>
          ${showVi ? `<p style="margin:10px 0 0;font-size:14px;color:var(--text-muted);background:#FFF9EB;padding:12px;border-radius:10px;">${p.viTranslation}</p>` : ""}
        </div>

        <!-- Right: Reading Comprehension Check -->
        <div class="box-kind">
          <h3 style="margin:0 0 14px;font-size:18px;">Câu hỏi Đọc hiểu &amp; Check đáp án</h3>
          <div style="display:flex;flex-direction:column;gap:18px;">
            ${p.questions.map((q) => {
              const picked = answers[q.id];
              return `
                <div style="background:#F8FAFB;padding:14px;border-radius:12px;">
                  <strong class="ko" style="display:block;margin-bottom:10px;">${q.question}</strong>
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    ${q.options.map((opt, oi) => {
                      let bg = "#FFFFFF";
                      let border = "#E5E7EB";
                      if (picked !== undefined) {
                        if (oi === q.answer) { bg = "rgba(58,202,116,0.16)"; border = "var(--success)"; }
                        else if (oi === picked) { bg = "rgba(255,90,96,0.14)"; border = "var(--danger)"; }
                      }
                      return `
                        <button type="button" class="ko" data-qid="${q.id}" data-oi="${oi}" style="text-align:left;padding:9px 12px;border-radius:8px;border:1.5px solid ${border};background:${bg};cursor:pointer;font-weight:500;">
                          ${oi + 1}. ${opt}
                        </button>
                      `;
                    }).join("")}
                  </div>
                  ${picked !== undefined ? `
                    <div style="margin-top:10px;font-size:13.5px;color:var(--primary-4);background:var(--primary-3);padding:8px 12px;border-radius:8px;">
                      ${picked === q.answer ? "✔ Chính xác!" : "✘ Đã lưu vào Sổ tay câu sai!"} — ${q.explain}
                    </div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    stage.querySelectorAll("[data-p]").forEach((b) => {
      b.addEventListener("click", () => { pIdx = Number(b.dataset.p); selectedWordInfo = null; showVi = false; render(); });
    });
    stage.querySelector("#btn-read-aloud").addEventListener("click", () => speakKoreanTTS(p.paragraphs.join(" "), 0.92));
    stage.querySelector("#btn-toggle-vi").addEventListener("click", () => { showVi = !showVi; render(); });

    stage.querySelectorAll(".tap-word").forEach((sp) => {
      sp.addEventListener("click", () => {
        selectedWordInfo = lookupToken(sp.dataset.tok, p.glossary);
        render();
      });
    });

    const tokSpeak = stage.querySelector("#btn-tok-speak");
    if (tokSpeak && selectedWordInfo) {
      tokSpeak.addEventListener("click", () => speakKoreanTTS(selectedWordInfo.token.split("(")[0].trim()));
    }
    const tokStar = stage.querySelector("#btn-tok-star");
    if (tokStar && selectedWordInfo?.matchCard) {
      tokStar.addEventListener("click", () => {
        store.toggleStar(selectedWordInfo.matchCard.id);
        tokStar.textContent = "✔ Đã lưu!";
      });
    }

    stage.querySelectorAll("[data-qid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qObj = p.questions.find((x) => x.id === btn.dataset.qid);
        const oi = Number(btn.dataset.oi);
        answers[qObj.id] = oi;
        store.recordQuestionResult("reading_comprehension", "Đọc hiểu văn bản", qObj, oi);
        render();
      });
    });
  }

  render();
}

// 3. SHADOWING STUDIO: Native Kyuri Audio + Liaison Guide + Mic Recording & Speech-to-Text Check
function renderShadowingModule(stage, db, initialLesson = 1) {
  let lesson = initialLesson;
  let idx = 0;
  let recordedUrl = null;
  let sttTranscript = "";
  let isRecording = false;
  let mediaRecorder = null;
  let recognition = null;

  function getSentences() {
    return db.sc1Vocab
      .filter((w) => w.lesson === lesson && w.exampleKo && w.exampleAudio)
      .map((w) => ({
        id: w.id,
        ko: w.exampleKo,
        vi: w.exampleVi,
        audio: w.exampleAudio,
        focusWord: w.korean
      }));
  }

  function scorePronunciation(targetKo, spokenKo) {
    const cleanT = targetKo.replace(/[^가-힣]/g, "");
    const cleanS = (spokenKo || "").replace(/[^가-힣]/g, "");
    if (!cleanS) return { pct: 0, html: "" };
    let matched = 0;
    const charsHtml = Array.from(targetKo).map((ch) => {
      if (!/[가-힣]/.test(ch)) return ch;
      if (cleanS.includes(ch)) {
        matched += 1;
        return `<span style="color:var(--success);font-weight:800;">${ch}</span>`;
      }
      return `<span style="color:var(--danger);text-decoration:underline;">${ch}</span>`;
    }).join("");
    const pct = Math.min(100, Math.round((matched / Math.max(1, cleanT.length)) * 100));
    return { pct, html: charsHtml };
  }

  function render() {
    const list = getSentences();
    const cur = list[idx % Math.max(1, list.length)] || { ko: "안녕하세요? 만나서 반갑습니다.", vi: "Xin chào, rất vui được gặp bạn.", audio: "" };
    const pronRules = analyzePronunciationRules(cur.ko);
    const evalRes = sttTranscript ? scorePronunciation(cur.ko, sttTranscript) : null;

    stage.innerHTML = `
      <div class="box-kind">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <strong>Chọn Bài Shadowing:</strong>
            <select id="shadow-lesson-sel" class="box-select">
              ${Array.from({ length: 15 }, (_, i) => i + 1).map((n) => `
                <option value="${n}" ${n === lesson ? "selected" : ""}>Sơ cấp 1 · Bài ${String(n).padStart(2, "0")}</option>
              `).join("")}
            </select>
          </div>
          <span style="font-size:14px;color:var(--text-muted);">Câu ${(idx % list.length) + 1} / ${list.length}</span>
        </div>

        <div style="background:var(--primary-3);border-radius:16px;padding:24px;text-align:center;margin-bottom:18px;">
          <div style="font-size:13px;color:var(--primary-4);font-weight:700;margin-bottom:6px;">BƯỚC 1: NGHE CÂU MẪU GIỌNG KYURI &amp; CHÚ Ý NỐI ÂM</div>
          <div class="ko" style="font-size:26px;font-weight:800;color:var(--text-main);margin-bottom:6px;">
            ${evalRes ? evalRes.html : cur.ko}
          </div>
          ${pronRules.hasChange ? `
            <div class="ko" style="font-size:16px;color:#C26A00;font-weight:700;margin-bottom:6px;">
              Đọc nối/biến âm tự nhiên: [${pronRules.pronounced}]
            </div>
          ` : ""}
          <div style="font-size:15px;color:var(--text-muted);margin-bottom:16px;">${cur.vi}</div>

          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
            <button class="btn-primary" id="btn-shadow-sample">🔊 1. Nghe mẫu (1.0x)</button>
            <button class="btn-outline-teal" id="btn-shadow-slow">🐢 Nghe chậm (0.75x)</button>
            <button class="btn-orange" id="btn-shadow-rec" style="${isRecording ? "background:var(--danger);" : ""}">
              ${isRecording ? "⏹ Dừng & Chấm phát âm" : "🎙️ 2. Bấm Micro đọc nhại theo"}
            </button>
            ${recordedUrl ? `<button class="btn-outline-teal" id="btn-shadow-myvoice">🎧 3. Nghe lại giọng của bạn</button>` : ""}
          </div>
        </div>

        ${pronRules.rules.length ? `
          <div style="background:#FFF9EB;border:1px solid #FDE68A;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:13.5px;">
            <strong>💡 Điểm biến âm cần lưu ý khi nói câu này:</strong>
            ${pronRules.rules.map((r) => `<span class="ko" style="margin-left:8px;">• ${r.detail}</span>`).join("")}
          </div>
        ` : ""}

        ${evalRes ? `
          <div style="background:#F8FAFB;border-radius:12px;padding:14px 18px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <div><strong>Giọng hệ thống nhận diện được:</strong> <span class="ko" style="font-size:17px;color:var(--primary-1);font-weight:700;">"${sttTranscript}"</span></div>
              <div style="font-size:13px;color:var(--text-muted);margin-top:3px;">Chữ màu xanh là âm tiết khớp chuẩn, chữ gạch chân đỏ cần đọc rõ hơn.</div>
            </div>
            <div style="font-size:22px;font-weight:800;color:${evalRes.pct >= 75 ? "var(--success)" : "var(--yellow-2)"};">
              Độ khớp: ${evalRes.pct}%
            </div>
          </div>
        ` : ""}

        <div style="display:flex;justify-content:space-between;">
          <button class="btn-outline-teal" id="btn-shadow-prev">← Câu trước</button>
          <button class="btn-primary" id="btn-shadow-next">Câu tiếp theo →</button>
        </div>
      </div>
    `;

    stage.querySelector("#shadow-lesson-sel").addEventListener("change", (e) => {
      lesson = Number(e.target.value);
      idx = 0;
      recordedUrl = null;
      sttTranscript = "";
      render();
    });

    stage.querySelector("#btn-shadow-sample").addEventListener("click", () => {
      if (cur.audio) playAudio(cur.audio, 1.0); else speakKoreanTTS(cur.ko, 1.0);
    });
    stage.querySelector("#btn-shadow-slow").addEventListener("click", () => {
      if (cur.audio) playAudio(cur.audio, 0.75); else speakKoreanTTS(cur.ko, 0.75);
    });

    const myBtn = stage.querySelector("#btn-shadow-myvoice");
    if (myBtn && recordedUrl) {
      myBtn.addEventListener("click", () => {
        const a = new Audio(recordedUrl);
        a.play();
      });
    }

    stage.querySelector("#btn-shadow-rec").addEventListener("click", async () => {
      if (isRecording) {
        isRecording = false;
        if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
        if (recognition) { try { recognition.stop(); } catch {} }
        render();
        return;
      }

      sttTranscript = "";
      isRecording = true;
      render();

      // Start Web Speech STT if supported in browser (Chrome/Edge/Safari)
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        recognition = new SR();
        recognition.lang = "ko-KR";
        recognition.interimResults = false;
        recognition.onresult = (ev) => {
          sttTranscript = ev.results[0][0].transcript;
          render();
        };
        try { recognition.start(); } catch {}
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const chunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          if (recordedUrl) URL.revokeObjectURL(recordedUrl);
          recordedUrl = URL.createObjectURL(blob);
          stream.getTracks().forEach((t) => t.stop());
          isRecording = false;
          if (!sttTranscript && !SR) {
            sttTranscript = "(Trình duyệt đã ghi âm xong — bấm 'Nghe lại giọng của bạn' để đối chiếu với giọng Kyuri)";
          }
          render();
        };
        mediaRecorder.start();
      } catch {
        isRecording = false;
        sttTranscript = "Hãy cấp quyền Micro trên trình duyệt để thu âm giọng đọc của bạn.";
        render();
      }
    });

    stage.querySelector("#btn-shadow-prev").addEventListener("click", () => {
      idx = (idx - 1 + list.length) % list.length;
      recordedUrl = null;
      sttTranscript = "";
      render();
    });
    stage.querySelector("#btn-shadow-next").addEventListener("click", () => {
      idx += 1;
      recordedUrl = null;
      sttTranscript = "";
      render();
    });
  }

  render();
}

// 4. ROLEPLAY & 3 SPEECH LEVELS SWITCHER
function renderRoleplayAndPoliteness(stage) {
  let scIdx = 0;
  let turnIdx = 0;
  let chatLog = [];
  let verbInput = "먹다";

  function resetScenario() {
    const sc = ROLEPLAY_SCENARIOS[scIdx];
    turnIdx = 0;
    chatLog = [{ from: "npc", ko: sc.turns[0].npcKo, vi: sc.turns[0].npcVi }];
  }
  resetScenario();

  function render() {
    const sc = ROLEPLAY_SCENARIOS[scIdx];
    const currentTurn = sc.turns[turnIdx];
    const conj = conjugateKoreanPredicate(verbInput);

    stage.innerHTML = `
      <div class="grid-2" style="align-items:start;">
        <!-- Situational Roleplay -->
        <div class="outline-ai">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px;">
            <strong>💬 Nhập vai Giao tiếp thực tế</strong>
            <select id="rp-sel" class="box-select">
              ${ROLEPLAY_SCENARIOS.map((s, i) => `<option value="${i}" ${i === scIdx ? "selected" : ""}>${s.title}</option>`).join("")}
            </select>
          </div>

          <div style="background:#F8FAFB;border-radius:12px;padding:14px;min-height:220px;display:flex;flex-direction:column;gap:10px;margin-bottom:12px;">
            ${chatLog.map((m) => `
              <div style="align-self:${m.from === "npc" ? "flex-start" : "flex-end"};max-width:86%;background:${m.from === "npc" ? "#FFFFFF" : "var(--primary)"};color:${m.from === "npc" ? "var(--text-main)" : "#FFFFFF"};padding:10px 14px;border-radius:14px;box-shadow:var(--shadow-el);">
                <div class="ko" style="font-weight:700;">${m.ko}</div>
                ${m.vi ? `<div style="font-size:12.5px;opacity:0.8;margin-top:3px;">${m.vi}</div>` : ""}
              </div>
            `).join("")}
          </div>

          ${currentTurn ? `
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">💡 Gợi ý câu đáp tự nhiên (Bấm để nói &amp; gửi):</div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
              ${currentTurn.hints.map((h) => `
                <button type="button" class="btn-outline-teal ko" data-hint="${h}" style="justify-content:flex-start;text-align:left;border-radius:10px;">
                  ${h}
                </button>
              `).join("")}
            </div>
          ` : `
            <div style="color:var(--success);font-weight:700;margin-bottom:10px;">🎉 Bạn đã hoàn thành xuất sắc tình huống giao tiếp này!</div>
            <button class="btn-primary" id="rp-restart">Thực hành lại</button>
          `}
        </div>

        <!-- 3 Speech Levels Switcher -->
        <div class="box-kind">
          <h3 style="margin:0 0 8px;font-size:18px;">🔄 Phản xạ 3 Cấp độ Kính ngữ (하십시오체 · 해요체 · 반말)</h3>
          <p style="margin:0 0 12px;font-size:13.5px;color:var(--text-muted);">
            Nhập động từ/tính từ bất kỳ (kể cả bất quy tắc 춥다, 듣다, 모르다, 쓰다) để tập nói đúng vai giao tiếp:
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            ${["먹다", "가다", "춥다", "듣다", "모르다", "공부하다"].map((v) => `
              <button type="button" class="btn-outline-teal ko" data-v="${v}" style="padding:4px 12px;font-size:13.5px;">${v}</button>
            `).join("")}
          </div>
          <input id="polite-verb-inp" class="ko" value="${verbInput}" style="width:100%;padding:9px 14px;border-radius:99px;border:1.5px solid var(--primary);font-weight:700;margin-bottom:12px;" />

          ${conj ? `
            <div style="font-size:13px;color:var(--yellow-2);font-weight:700;margin-bottom:8px;">⚡ ${conj.irregularNote}</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${conj.forms.map((f) => `
                <div style="display:flex;justify-content:space-between;align-items:center;background:#F8FAFB;padding:9px 12px;border-radius:8px;">
                  <div>
                    <div style="font-size:12.5px;color:var(--text-muted);">${f.label}</div>
                    <strong class="ko" style="font-size:16.5px;color:var(--primary-1);">${f.ko}</strong>
                  </div>
                  <button class="btn-audio" style="width:30px;height:30px;" data-speak="${f.ko.split("/")[0].trim()}">🔊</button>
                </div>
              `).join("")}
            </div>
          ` : `<div style="color:var(--danger);font-size:13.5px;">Hãy nhập động từ/tính từ nguyên thể kết thúc bằng -다 (VD: 가다, 먹다).</div>`}
        </div>
      </div>
    `;

    stage.querySelector("#rp-sel").addEventListener("change", (e) => {
      scIdx = Number(e.target.value);
      resetScenario();
      render();
    });

    stage.querySelectorAll("[data-hint]").forEach((b) => {
      b.addEventListener("click", () => {
        const reply = b.dataset.hint;
        speakKoreanTTS(reply);
        chatLog.push({ from: "me", ko: reply });
        turnIdx += 1;
        if (sc.turns[turnIdx]) {
          chatLog.push({ from: "npc", ko: sc.turns[turnIdx].npcKo, vi: sc.turns[turnIdx].npcVi });
          setTimeout(() => speakKoreanTTS(sc.turns[turnIdx].npcKo), 900);
        }
        render();
      });
    });

    const restartBtn = stage.querySelector("#rp-restart");
    if (restartBtn) restartBtn.addEventListener("click", () => { resetScenario(); render(); });

    stage.querySelectorAll("[data-v]").forEach((b) => {
      b.addEventListener("click", () => { verbInput = b.dataset.v; render(); });
    });
    stage.querySelector("#polite-verb-inp").addEventListener("input", (e) => {
      verbInput = e.target.value;
      render();
      const el = stage.querySelector("#polite-verb-inp");
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
    stage.querySelectorAll("[data-speak]").forEach((b) => b.addEventListener("click", () => speakKoreanTTS(b.dataset.speak)));
  }

  render();
}
