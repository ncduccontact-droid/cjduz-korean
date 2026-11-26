// Structured TOPIK I & TOPIK II Question Matrix, Wongokji Writing Prompts & TOPIK Speaking 6 Tasks

export const TOPIK1_PARTS = [
  {
    id: "t1_listen_p1",
    skill: "listening",
    title: "Phần 1 · Chọn câu trả lời tiếp theo hợp lý (Câu 1~4)",
    tip: "Xác định từ để hỏi (어디, 언제, 무슨, 왜, 몇) và thì của câu hỏi (quá khứ -았/었- hay tương lai -(으)ㄹ 거예요).",
    questions: [
      { id: "t1_lp1_1", audioSrc: "media/exam_t1L_01.mp3", audioText: "여: 오늘 저녁에 뭐 할 거예요?", question: "Nghe câu hỏi và chọn câu đáp lời tự nhiên nhất:", options: ["어제 영화를 봤어요.", "친구하고 밥을 먹을 거예요.", "저녁 일곱 시예요.", "식당에 사람이 많아요."], answer: 1, explain: "Câu hỏi dùng '뭐 할 거예요?' (tối nay sẽ làm gì - tương lai) → đáp án phải chia tương lai '친구하고 밥을 먹을 거예요'." },
      { id: "t1_lp1_2", audioSrc: "media/exam_t1L_02.mp3", audioText: "남: 가방이 아주 예쁘네요. 어디에서 샀어요?", question: "Chọn câu trả lời phù hợp với câu hỏi của người nam:", options: ["백화점에서 샀어요.", "가방이 비싸요.", "동생한테 선물했어요.", "주말에 사러 갈 거예요."], answer: 0, explain: "'어디에서 샀어요?' hỏi mua ở đâu (quá khứ) → '백화점에서 샀어요' (Đã mua ở trung tâm thương mại)." },
      { id: "t1_lp1_3", audioSrc: "media/exam_t1L_03.mp3", audioText: "여: 주말 잘 보냈어요?", question: "Chọn câu đáp lại lời hỏi thăm cuối tuần:", options: ["네, 내일 만나요.", "네, 집에서 푹 쉬었어요.", "아니요, 주말이 아니에요.", "네, 늦어서 미안해요."], answer: 1, explain: "'주말 잘 보냈어요?' (Cuối tuần nghỉ khỏe chứ?) → '네, 집에서 푹 쉬었어요' (Vâng, tôi đã nghỉ ngơi thoải mái ở nhà)." }
    ]
  },
  {
    id: "t1_listen_p2",
    skill: "listening",
    title: "Phần 2 · Tìm Địa điểm & Chủ đề hội thoại (Câu 7~10)",
    tip: "Bắt các từ khóa đặc trưng cho địa điểm: 메뉴/주문 (식당), 약/아프다 (약국/병원), 소포/우표 (우체국), 머리 자르다 (미용실).",
    questions: [
      { id: "t1_lp2_1", audioSrc: "media/exam_t1L_07.mp3", audioText: "남: 어서 오세요. 어떻게 오셨어요? / 여: 목이 아프고 열이 좀 나요.", question: "여기는 어디입니까? (Đây là đâu?)", options: ["병원", "서점", "은행", "우체국"], answer: 0, explain: "'목이 아프고 열이 나요' (Đau họng và hơi sốt) → Bệnh viện (병원)." },
      { id: "t1_lp2_2", audioSrc: "media/exam_t1L_08.mp3", audioText: "여: 이 소포를 베트남으로 보내고 싶은데요. 얼마나 걸려요? / 남: 비행기로 보내면 사흘쯤 걸립니다.", question: "여기는 어디입니까?", options: ["공항", "여행사", "우체국", "편의점"], answer: 2, explain: "'소포를 보내다' (gửi bưu kiện) → Bưu điện (우체국)." }
    ]
  },
  {
    id: "t1_read_p1",
    skill: "reading",
    title: "Phần 1 · Tìm chủ đề của câu ngắn (Câu 31~33)",
    tip: "Liên kết các từ vựng cùng trường nghĩa: 비/맑다/춥다 → 날씨, 버스/지하철 → 교통, 아버지/어머니 → 가족.",
    questions: [
      { id: "t1_rp1_1", passage: "저는 아침 일곱 시에 일어납니다. 세수를 하고 아침을 먹습니다.", question: "무엇에 대한 이야기입니까?", options: ["주말", "아침 생활", "취미", "계절"], answer: 1, explain: "Thức dậy 7h sáng, rửa mặt và ăn sáng → Sinh hoạt buổi sáng (아침 생활)." },
      { id: "t1_rp1_2", passage: "제 동생은 노래를 잘 부릅니다. 시간 있을 때마다 기타도 칩니다.", question: "무엇에 대한 이야기입니까?", options: ["직업", "취미", "약속", "쇼핑"], answer: 1, explain: "Hát hay và đánh đàn guitar mỗi khi rảnh → Sở thích (취미)." }
    ]
  },
  {
    id: "t1_read_p2",
    skill: "reading",
    title: "Phần 2 · Điền từ & ngữ pháp vào (     ) (Câu 34~39)",
    tip: "Quan sát động từ phía sau để chọn đúng tiểu từ/trạng từ, hoặc quan sát quan hệ nhân quả - đối lập giữa 2 câu.",
    questions: [
      { id: "t1_rp2_1", passage: "방이 좀 어둡습니다. 그래서 불을 (       ).", question: "Chọn từ đúng điền vào (     ):", options: ["켰습니다", "껐습니다", "열었습니다", "닫았습니다"], answer: 0, explain: "Phòng hơi tối (어둡습니다) nên đã bật đèn (불을 켰습니다). 껐습니다 là tắt đèn." },
      { id: "t1_rp2_2", passage: "이 구두는 디자인이 예쁩니다. (       ) 조금 작아서 발이 아픕니다.", question: "Chọn phó từ nối câu phù hợp:", options: ["그래서", "그런데", "그리고", "그러니까"], answer: 1, explain: "Vế trước khen đẹp (+), vế sau chê hơi chật đau chân (-) → chọn 그런데 (Thế nhưng)." }
    ]
  },
  {
    id: "t1_read_p3",
    skill: "reading",
    title: "Phần 3 · Sắp xếp thứ tự 4 câu thành đoạn văn (Câu 57~58)",
    tip: "Câu mở đầu KHÔNG bao giờ chứa 그래서, 그러나, 이/그 + danh từ. Tìm cặp câu nối tiếp bằng đại từ chỉ định (이 행사, 그 가게...).",
    questions: [
      {
        id: "t1_rp3_1",
        passage: "(가) 그래서 오늘 오후에 서점에 갈 겁니다.\n(나) 내일은 제 친구의 생일입니다.\n(다) 서점에서 한국 소설책을 한 권 살 겁니다.\n(라) 친구는 책 읽는 것을 아주 좋아합니다.",
        question: "Chọn thứ tự sắp xếp hợp lý nhất:",
        options: ["(나) - (라) - (가) - (다)", "(나) - (가) - (라) - (다)", "(라) - (나) - (가) - (다)", "(라) - (가) - (다) - (나)"],
        answer: 0,
        explain: "(나) Mai là sinh nhật bạn → (라) Bạn rất thích đọc sách → (가) Vì vậy chiều nay tôi sẽ đi hiệu sách → (다) Ở hiệu sách(lặp lại từ 서점) tôi sẽ mua 1 cuốn tiểu thuyết."
      }
    ]
  }
];

export const TOPIK2_PARTS = [
  {
    id: "t2_listen_p1",
    skill: "listening",
    title: "Nghe Câu 9~12 · Chọn hành động tiếp theo của nhân vật",
    tip: "Nghe thật kỹ câu người đó nhận làm ngay ('그럼 제가 지금 ... -(으)ㄹ게요'). Đừng nhầm với việc người kia làm!",
    questions: [
      {
        id: "t2_lp1_1",
        audioSrc: "media/exam_t2L_02.mp3",
        audioText: "여: 김 대리님, 오후 세 시 회의실 예약은 확인하셨죠?\n남: 네, 예약은 끝났는데 발표 자료 인쇄가 아직 안 됐어요.\n여: 아, 그래요? 그럼 제가 지금 출력해 올게요. 대리님은 노트북 먼저 연결해 주세요.",
        question: "여자가 이어서 할 행동으로 알맞은 것을 고르십시오 (Việc người nữ sẽ làm ngay tiếp theo):",
        options: ["회의실을 예약한다.", "노트북을 연결한다.", "발표 자료를 인쇄한다.", "회의 시간을 변경한다."],
        answer: 2,
        explain: "Người nữ nói: '그럼 제가 지금 출력해 올게요' (Vậy để tôi đi in tài liệu mang tới ngay) → 출력하다 = 인쇄하다."
      }
    ]
  },
  {
    id: "t2_read_p1",
    skill: "reading",
    title: "Đọc Câu 1~4 · Điền cấu trúc ngữ pháp Trung cấp vào (     )",
    tip: "Nắm chắc sắc thái các đuôi ngữ pháp trung cấp: -는 바람에 (vì sự cố bất ngờ), -(으)ㄹ 뿐만 아니라, -기 마련이다, -던.",
    questions: [
      {
        id: "t2_rp1_1",
        passage: "갑자기 폭우가 (          ) 비행기 출발이 두 시간이나 지연되었다.",
        question: "Chọn biểu hiện ngữ pháp phù hợp nhất điền vào chỗ trống:",
        options: ["내리는 바람에", "내리기 위해서", "내리는 반면에", "내릴까 봐서"],
        answer: 0,
        explain: "'-는 바람에' diễn tả nguyên nhân bất ngờ dẫn đến kết quả không mong muốn ở quá khứ (Do mưa lớn bất ngờ nên chuyến bay bị trễ 2 tiếng)."
      },
      {
        id: "t2_rp1_2",
        passage: "아무리 바쁘더라도 아침 식사는 거르지 말고 (          ) 건강을 지킬 수 있다.",
        question: "Chọn biểu hiện ngữ pháp đúng:",
        options: ["챙겨 먹어야", "챙겨 먹느라고", "챙겨 먹든지", "챙겨 먹자마자"],
        answer: 0,
        explain: "'-아/어야' (Phải ... thì mới có thể...): Dù bận thế nào cũng phải ăn sáng đầy đủ thì mới giữ được sức khỏe."
      }
    ]
  },
  {
    id: "t2_read_p2",
    skill: "reading",
    title: "Đọc Câu 5~8 · Chọn biểu hiện Đồng nghĩa với phần gạch chân",
    tip: "Ghép cặp quán dụng ngữ và từ Hán–Hàn tương đương với biểu hiện thuần Hàn.",
    questions: [
      {
        id: "t2_rp2_1",
        passage: "새로 온 신입 사원은 일 처리가 빨라서 선배들의 <u>마음에 들었다</u>.",
        question: "Chọn biểu hiện gần nghĩa nhất với '마음에 들었다':",
        options: ["걱정을 덜었다", "흡족해했다", "관심을 끊었다", "부담을 느꼈다"],
        answer: 1,
        explain: "'마음에 들다' (vừa lòng, ưng ý) gần nghĩa với '흡족해하다' (hài lòng, thỏa mãn)."
      },
      {
        id: "t2_rp2_2",
        passage: "오랜만에 고향 친구를 만나서 시간 가는 줄 모르고 이야기를 <u>나누었다</u>.",
        question: "Chọn từ gần nghĩa nhất với '이야기를 나누었다':",
        options: ["주고받았다", "미루었다", "숨겼다", "아꼈다"],
        answer: 0,
        explain: "'이야기를 나누다' (trò chuyện, chia sẻ câu chuyện) = '이야기를 주고받다' (trao đổi qua lại câu chuyện)."
      }
    ]
  }
];

export const WONGOKJI_PROMPTS = [
  {
    id: "w53",
    badge: "Câu 53 · Mô tả Biểu đồ (200~300 chữ)",
    minChars: 200,
    maxChars: 300,
    title: "Khảo sát lý do người tiêu dùng chọn mua hàng trực tuyến (온라인 쇼핑 이용 이유)",
    promptDetails: "Cơ quan điều tra: 한국소비자원 (300 người trưởng thành) · Số liệu: '가격이 저렴해서' (42% - cao nhất), '시간과 장소에 구애받지 않아서' (35%), '상품 비교가 편리해서' (15%), '기타' (8%). Dự báo doanh thu mua sắm online tăng từ 150조 원 (2022) lên 210조 원 (2026).",
    modelAnswer: "한국소비자원에서 성인 300명을 대상으로 온라인 쇼핑 이용 이유에 대해 조사하였다. 조사 결과 '가격이 저렴해서'가 42%로 가장 높게 나타났으며, '시간과 장소에 구애받지 않아서'가 35%로 그 뒤를 이었다. 다음으로 '상품 비교가 편리해서'는 15%, '기타'는 8%에 그쳤다. 한편 온라인 쇼핑 매출액은 2022년 150조 원에서 꾸준히 증가하여 2026년에는 210조 원에 이를 것으로 전망된다."
  },
  {
    id: "w54",
    badge: "Câu 54 · Nghị luận xã hội (600~700 chữ)",
    minChars: 600,
    maxChars: 700,
    title: "Tác động hai mặt của Trí tuệ nhân tạo (AI) và thái độ ứng xử cần thiết",
    promptDetails: "Trình bày theo 3 đoạn trên giấy 원고지: (1) Lợi ích của AI đối với đời sống và năng suất lao động; (2) Những vấn đề phát sinh (thất nghiệp, phụ thuộc công nghệ, đạo đức thông tin); (3) Thái độ và giải pháp để con người làm chủ AI hiệu quả.",
    modelAnswer: "오늘날 인공지능 기술의 발전은 인간의 삶을 빠르게 변화시키고 있다. 인공지능은 복잡한 데이터를 신속하게 처리함으로써 업무 효율성을 높이고 의료, 교육, 교통 등 다양한 분야에서 인간의 편의를 크게 증진시킨다.\n그러나 이러한 기술 발전에는 여러 가지 부작용도 뒤따른다. 자동화로 인해 기존의 일자리가 줄어들 수 있으며 가짜 뉴스나 개인 정보 유출과 같은 윤리적 문제도 심각해지고 있다. 또한 기술에 지나치게 의존할 경우 인간의 주체적인 사고력이 약화될 우려가 있다.\n따라서 인공지능 시대를 현명하게 살아가기 위해서는 분명한 기준과 태도가 필요하다. 정부와 사회는 기술 남용을 막을 수 있는 법적 제도를 마련해야 하며 개인은 인공지능이 대체할 수 없는 창의성과 비판적 사고력을 길러 기술을 도구로 주체적으로 활용해야 한다."
  }
];

export const TOPIK_SPEAKING_TASKS = [
  { num: 1, level: "Sơ cấp", prepSec: 20, speakSec: 30, title: "Câu 1 · Trả lời câu hỏi cá nhân ngắn", prompt: "주말에 주로 무엇을 합니까? 왜 그것을 좋아합니까?", vi: "Cuối tuần bạn thường làm gì? Tại sao bạn thích việc đó?", sample: "저는 주말에 주로 공원에서 산책을 하거나 카페에서 한국어 책을 읽습니다. 조용히 쉬면서 기분 전환을 할 수 있기 때문에 좋아합니다." },
  { num: 2, level: "Sơ – Trung cấp", prepSec: 30, speakSec: 40, title: "Câu 2 · Nhìn tình huống & Đóng vai giao tiếp", prompt: "도서관에서 빌린 책의 반납일을 연기하고 싶습니다. 직원에게 어떻게 말하겠습니까?", vi: "Bạn muốn gia hạn ngày trả sách mượn ở thư viện. Bạn sẽ nói thế nào với nhân viên?", sample: "저기요, 실례지만 제가 지난주에 빌린 책의 반납 기간을 일주일 더 연장할 수 있을까요? 아직 다 읽지 못해서요. 학생증은 여기에 있습니다." },
  { num: 3, level: "Trung cấp", prepSec: 40, speakSec: 60, title: "Câu 3 · Kể lại trải nghiệm / Miêu tả sự việc", prompt: "기억에 남는 여행지와 그곳에서 한 일을 자세히 말해 보십시오.", vi: "Hãy kể chi tiết về một địa điểm du lịch đáng nhớ và những việc bạn đã làm ở đó.", sample: "작년 여름에 친구들과 함께 다낭으로 여행을 갔습니다. 아름다운 해변에서 수영도 하고 신선한 해산물 요리도 많이 먹었습니다. 특히 밤에 배를 타고 야경을 구경한 것이 가장 기억에 남습니다." },
  { num: 4, level: "Trung cấp", prepSec: 40, speakSec: 60, title: "Câu 4 · Hoàn thành hội thoại tư vấn", prompt: "한국어 말하기 실력이 늘지 않아 고민하는 후배에게 조언을 해 주십시오.", vi: "Hãy đưa ra lời khuyên cho một người em khóa dưới đang lo lắng vì kỹ năng nói tiếng Hàn không tiến bộ.", sample: "실수하는 것을 두려워하지 말고 매일 조금씩 소리 내어 연습하는 것이 중요해요. 좋아하는 한국 드라마 대사를 따라 하는 섀도잉 연습을 꾸준히 해 보세요." },
  { num: 5, level: "Trung – Cao cấp", prepSec: 70, speakSec: 80, title: "Câu 5 · Phân tích số liệu & Nêu nhận xét", prompt: "최근 청년층의 '건강 관리 방법' 조사 결과(운동 48%, 식단 조절 32%, 수면 관리 20%)를 설명하고 전망을 말해 보십시오.", vi: "Giải thích kết quả khảo sát phương pháp chăm sóc sức khỏe của giới trẻ và nêu nhận định xu hướng.", sample: "청년층의 건강 관리 방법을 조사한 결과 규칙적인 운동이 48%로 가장 높았고 식단 조절이 32%, 수면 관리가 20%로 나타났습니다. 앞으로도 스스로 건강을 챙기는 셀프 메디케이션 추세는 계속 확대될 것으로 보입니다." },
  { num: 6, level: "Cao cấp", prepSec: 70, speakSec: 80, title: "Câu 6 · Trình bày quan điểm nghị luận xã hội", prompt: "'재택근무 확대'에 대한 찬반 의견 중 자신의 입장을 선택하고 근거를 들어 말해 보십시오.", vi: "Chọn quan điểm đồng tình hoặc phản đối việc mở rộng làm việc từ xa (WFH) và nêu lập luận.", sample: "저는 재택근무를 확대하는 것에 찬성합니다. 첫째, 출퇴근 시간을 줄여 업무 집중도와 삶의 질을 높일 수 있습니다. 둘째, 기업 입장에서도 사무실 운영 비용을 절감할 수 있기 때문입니다." }
];
