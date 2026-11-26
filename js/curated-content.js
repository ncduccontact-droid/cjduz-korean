// Curated curriculum, Hangeul lab, Hanja bridge, Grammar comparisons & Frequent TOPIK 1-2 expressions

export const HANGEUL_DATA = {
  basicConsonants: [
    { ch: "ㄱ", name: "기역 (gi-yeok)", sound: "g / k", tip: "Đầu từ đọc nhẹ giữa g-k, cuối từ (patchim) ngậm âm [k]", sample: "가방 (cặp sách)" },
    { ch: "ㄴ", name: "니은 (ni-eun)", sound: "n", tip: "Đầu lưỡi chạm chân răng trên giống chữ N tiếng Việt", sample: "나라 (đất nước)" },
    { ch: "ㄷ", name: "디귿 (di-geut)", sound: "d / t", tip: "Đầu từ giữa d(đ)-t nhẹ, cuối từ ngậm âm [t]", sample: "도서관 (thư viện)" },
    { ch: "ㄹ", name: "리을 (ri-eul)", sound: "r / l", tip: "Giữa 2 nguyên âm đọc như R nhẹ, làm patchim cong lưỡi [l]", sample: "라디오 / 서울" },
    { ch: "ㅁ", name: "미음 (mi-eum)", sound: "m", tip: "Khép hai môi giống chữ M tiếng Việt", sample: "모자 (cái mũ)" },
    { ch: "ㅂ", name: "비읍 (bi-eup)", sound: "b / p", tip: "Đầu từ giữa b-p nhẹ, cuối từ khép môi [p]", sample: "바지 (quần) / 밥 (cơm)" },
    { ch: "ㅅ", name: "시옷 (si-ot)", sound: "s / t", tip: "Trước 이/야/여/요/유 đọc nhẹ như x/sh; làm patchim đọc ngậm [t]", sample: "사람 (người)" },
    { ch: "ㅇ", name: "이응 (i-eung)", sound: "âm câm / ng", tip: "Đứng đầu là âm câm; đứng cuối (patchim) đọc là [-ng]", sample: "아이 (em bé) / 방 (phòng)" },
    { ch: "ㅈ", name: "지읒 (ji-eut)", sound: "j / ch nhẹ", tip: "Giữa ch tiếng Việt và j tiếng Anh (không bật hơi)", sample: "지도 (bản đồ)" },
    { ch: "ㅊ", name: "치읓 (chi-eut)", sound: "ch (bật hơi)", tip: "Giống ㅈ nhưng đẩy luồng hơi mạnh ra ngoài", sample: "친구 (bạn bè)" },
    { ch: "ㅋ", name: "키읔 (ki-euk)", sound: "kh (bật hơi)", tip: "Bật hơi mạnh từ cuống họng", sample: "커피 (cà phê)" },
    { ch: "ㅌ", name: "티읕 (ti-eut)", sound: "th (bật hơi)", tip: "Giống chữ Th tiếng Việt có bật hơi mạnh", sample: "토요일 (thứ Bảy)" },
    { ch: "ㅍ", name: "피읖 (pi-eup)", sound: "pʰ (bật hơi)", tip: "Mím hai môi rồi bật hơi mạnh ra", sample: "포도 (nho)" },
    { ch: "ㅎ", name: "히읗 (hi-eut)", sound: "h", tip: "Giống chữ H tiếng Việt; khi làm patchim gặp ㄱ/ㄷ/ㅂ/ㅈ sẽ làm bật hơi chữ sau", sample: "학교 (trường học)" }
  ],
  tenseConsonants: [
    { ch: "ㄲ", name: "쌍기역", sound: "kk (căng)", tip: "Căng thanh quản, đọc dứt khoát như chữ C/K tiếng Việt, không bật hơi", sample: "오빠 / 토끼 (con thỏ)" },
    { ch: "ㄸ", name: "쌍디귿", sound: "tt (căng)", tip: "Đọc căng dứt khoát như chữ T tiếng Việt", sample: "따뜻하다 (ấm áp)" },
    { ch: "ㅃ", name: "쌍비읍", sound: "pp (căng)", tip: "Mím môi căng, bật âm gọn không xì hơi", sample: "빵 (bánh mì) / 바쁘다 (bận)" },
    { ch: "ㅆ", name: "쌍시옷", sound: "ss (căng)", tip: "Rít âm X sắc nét hơn ㅅ", sample: "쓰다 (viết, đắng) / 비싸다 (đắt)" },
    { ch: "ㅉ", name: "쌍지읒", sound: "jj (căng)", tip: "Đọc căng giống chữ Ch sắc tiếng Việt", sample: "짜다 (mặn) / 찍다 (chụp ảnh)" }
  ],
  vowels: [
    { ch: "ㅏ", sound: "a", sample: "아이 (em bé)" },
    { ch: "ㅑ", sound: "ya", sample: "약국 (hiệu thuốc)" },
    { ch: "ㅓ", sound: "eo (ơ/o)", sample: "어머니 (mẹ)" },
    { ch: "ㅕ", sound: "yeo (dơ)", sample: "여자 (phụ nữ)" },
    { ch: "ㅗ", sound: "o (ô tròn môi)", sample: "오이 (dưa chuột)" },
    { ch: "ㅛ", sound: "yo (dô)", sample: "요리 (nấu ăn)" },
    { ch: "ㅜ", sound: "u", sample: "우유 (sữa)" },
    { ch: "ㅠ", sound: "yu (du)", sample: "유학 (du học)" },
    { ch: "ㅡ", sound: "eu (ư)", sample: "으뜸 / 크다 (to lớn)" },
    { ch: "ㅣ", sound: "i", sample: "이름 (tên)" },
    { ch: "ㅐ / ㅔ", sound: "ae / e (ê)", sample: "개 (chó) / 가게 (cửa hàng)" },
    { ch: "ㅘ / ㅝ", sound: "wa / wo", sample: "과일 (hoa quả) / 뭐 (cái gì)" },
    { ch: "ㅚ / ㅟ / ㅢ", sound: "oe(uê) / wi(uy) / ui(ưi)", sample: "회사 (công ty) / 위 (trên) / 의사 (bác sĩ)" }
  ],
  keyboardRows: [
    [ { k: "ㅂ", en: "q" }, { k: "ㅈ", en: "w" }, { k: "ㄷ", en: "e" }, { k: "ㄱ", en: "r" }, { k: "ㅅ", en: "t" }, { k: "ㅛ", en: "y" }, { k: "ㅕ", en: "u" }, { k: "ㅑ", en: "i" }, { k: "ㅐ", en: "o" }, { k: "ㅔ", en: "p" } ],
    [ { k: "ㅁ", en: "a" }, { k: "ㄴ", en: "s" }, { k: "ㅇ", en: "d" }, { k: "ㄹ", en: "f" }, { k: "ㅎ", en: "g" }, { k: "ㅗ", en: "h" }, { k: "ㅓ", en: "j" }, { k: "ㅏ", en: "k" }, { k: "ㅣ", en: "l" } ],
    [ { k: "ㅋ", en: "z" }, { k: "ㅌ", en: "x" }, { k: "ㅊ", en: "c" }, { k: "ㅍ", en: "v" }, { k: "ㅠ", en: "b" }, { k: "ㅜ", en: "n" }, { k: "ㅡ", en: "m" }, { k: "ㄲ", en: "R" }, { k: "ㄸ", en: "E" }, { k: "ㅃ", en: "Q" }, { k: "ㅆ", en: "T" }, { k: "ㅉ", en: "W" }, { k: "ㅒ", en: "O" }, { k: "ㅖ", en: "P" } ]
  ]
};

export const GRAMMAR_COMPARISONS = [
  {
    title: "은/는 vs 이/가 (Tiểu từ Chủ đề vs Tiểu từ Chủ ngữ)",
    level: "Sơ cấp 1 · Hay nhầm số 1",
    left: { name: "N + 은/는", points: ["Nêu chủ đề chính của câu, giới thiệu bản thân.", "Dùng khi SO SÁNH đối lập 2 vế (형은 크지만 동생은 작아요).", "Nhấn mạnh vào phần VỊ NGỮ phía sau."] },
    right: { name: "N + 이/가", points: ["Xác định chủ thể hành động/trạng thái mới xuất hiện.", "Bắt buộc đi trước 있다/없다, 아니다, 되다 và tính từ miêu tả khách quan (날씨가 좋아요).", "Nhấn mạnh vào chính CHỦ NGỮ đứng trước nó."] }
  },
  {
    title: "-아/어서 vs -(으)니까 (Hai cấu trúc 'Vì... nên...')",
    level: "Sơ cấp 1–2 · Hay bẫy TOPIK I",
    left: { name: "V/A + -아/어서", points: ["Lý do khách quan, tự nhiên, lời xin lỗi/cảm ơn (늦어서 죄송합니다).", "KHÔNG chia thì quá khứ -았/었- đứng trước -아서.", "Vế sau KHÔNG được dùng câu mệnh lệnh -(으)세요 hay rủ rê -(으)ㅂ시다."] },
    right: { name: "V/A + -(으)니까", points: ["Lý do chủ quan hoặc người nghe cũng biết để đưa ra đề xuất.", "ĐƯỢC chia quá khứ (-았/었으니까).", "Vế sau kết hợp TỐT với mệnh lệnh -(으)세요, rủ rê -(으)ㄹ까요 / -(으)ㅂ시다 (비가 오니까 택시를 탑시다)."] }
  },
  {
    title: "안 vs 못 (Hai dạng phủ định 'Không' vs 'Không thể')",
    level: "Sơ cấp 1",
    left: { name: "안 + V/A (-지 않다)", points: ["Phủ định do Ý CHÍ chủ quan (không muốn làm) hoặc trạng thái thuần túy.", "Dùng được cho cả Động từ và Tính từ (안 가요, 안 비싸요)."] },
    right: { name: "못 + V (-지 못하다)", points: ["Phủ định do NĂNG LỰC hoặc HOÀN CẢNH khách quan cản trở (muốn nhưng không thể).", "Chỉ đi với Động từ, KHÔNG đi trực tiếp với Tính từ (수영을 못 해요)."] }
  },
  {
    title: "에 vs 에서 (Hai tiểu từ chỉ địa điểm)",
    level: "Sơ cấp 1",
    left: { name: "Địa điểm + 에", points: ["Chỉ sự TỒN TẠI tĩnh (교실에 책상이 있어요).", "Chỉ ĐÍCH ĐẾN của động từ di chuyển 가다, 오다, 다니다, 도착하다 (학교에 가요)."] },
    right: { name: "Địa điểm + 에서", points: ["Chỉ nơi DIỄN RA HÀNH ĐỘNG động (도서관에서 공부해요).", "Chỉ điểm XUẤT PHÁT 'từ đâu' (베트남에서 왔어요)."] }
  },
  {
    title: "-(으)세요 vs -(으)십시오 (Yêu cầu lịch sự thân thiện vs Trang trọng)",
    level: "TOPIK I · Câu thông báo",
    left: { name: "V + -(으)세요", points: ["Trang trọng vừa phải, thân thiện trong giao tiếp trực tiếp.", "Dùng ở lớp học, cửa hàng, bệnh viện (책을 펴세요, 여기 앉으세요)."] },
    right: { name: "V + -(으)십시오", points: ["Trang trọng cao nhất ('Xin quý khách vui lòng...').", "Chuyên xuất hiện trên biển báo, thông báo sân bay, đề thi TOPIK (안전벨트를 매십시오, 알맞은 것을 고르십시오)."] }
  },
  {
    title: "-(으)ㅂ시다 vs -(으)ㄹ까요? (Rủ rê cùng làm vs Hỏi ý kiến nhẹ nhàng)",
    level: "Sơ cấp 1–2 · Hội thoại",
    left: { name: "V + -(으)ㅂ시다", points: ["Đề xuất trực tiếp 'Chúng ta hãy cùng...'.", "Chỉ dùng với bạn bè, đồng nghiệp ngang hàng hoặc cấp dưới; KHÔNG dùng rủ người lớn tuổi/cấp trên."] },
    right: { name: "V + -(으)ㄹ까요?", points: ["Hỏi ý kiến lịch sự 'Chúng ta ... nhé?' hoặc tự hỏi 'Tôi làm giúp bạn nhé?'.", "Mềm mỏng, lịch sự, dùng tốt trong hầu hết các tình huống giao tiếp."] }
  },
  {
    title: "-았/었- vs -겠- (Quá khứ hoàn thành vs Phỏng đoán / Ý chí)",
    level: "TOPIK I & II",
    left: { name: "V/A + -았/었-", points: ["Sự việc đã xảy ra và kết thúc trong quá khứ (어제 영화를 봤어요).", "Trạng thái kết quả còn lưu lại (안경을 썼어요 = đang đeo kính)."] },
    right: { name: "V/A + -겠-", points: ["Phỏng đoán ngay khi nhìn/nghe tình huống (맛있겠어요 = Trông ngon quá nhỉ!).", "Ý chí trang trọng ngôi thứ nhất (제가 확인해 보겠습니다)."] }
  }
];

export const HANJA_ROOTS = [
  { root: "학", hanViet: "HỌC (Học tập)", words: [
    { ko: "학생", hv: "Học sinh", vi: "học sinh, sinh viên" },
    { ko: "학교", hv: "Học hiệu", vi: "trường học" },
    { ko: "대학교", hv: "Đại học hiệu", vi: "trường đại học" },
    { ko: "유학", hv: "Lưu học", vi: "du học" },
    { ko: "방학", hv: "Phóng học", vi: "kỳ nghỉ học (hè/đông)" },
    { ko: "장학금", hv: "Trưởng học kim", vi: "học bổng" }
  ]},
  { root: "생", hanViet: "SINH (Sự sống, nảy sinh, người)", words: [
    { ko: "선생님", hv: "Tiên sinh", vi: "thầy/cô giáo" },
    { ko: "생일", hv: "Sinh nhật", vi: "ngày sinh nhật" },
    { ko: "생활", hv: "Sinh hoạt", vi: "đời sống sinh hoạt" },
    { ko: "생산", hv: "Sinh sản", vi: "sản xuất (TOPIK II)" },
    { ko: "발생하다", hv: "Phát sinh", vi: "phát sinh, xảy ra" }
  ]},
  { root: "실", hanViet: "THẤT (Căn phòng)", words: [
    { ko: "교실", hv: "Giáo thất", vi: "phòng học" },
    { ko: "사무실", hv: "Sự vụ thất", vi: "văn phòng" },
    { ko: "화장실", hv: "Hóa trang thất", vi: "nhà vệ sinh" },
    { ko: "미용실", hv: "Mỹ dung thất", vi: "tiệm làm tóc/làm đẹp" },
    { ko: "회의실", hv: "Hội nghị thất", vi: "phòng họp" }
  ]},
  { root: "관", hanViet: "QUÁN (Tòa nhà lớn, cơ quan)", words: [
    { ko: "도서관", hv: "Đồ thư quán", vi: "thư viện" },
    { ko: "대사관", hv: "Đại sứ quán", vi: "đại sứ quán" },
    { ko: "영화관", hv: "Ánh họa quán", vi: "rạp chiếu phim" },
    { ko: "박물관", hv: "Bác vật quán", vi: "viện bảo tàng" },
    { ko: "미술관", hv: "Mỹ thuật quán", vi: "bảo tàng mỹ thuật" }
  ]},
  { root: "원", hanViet: "VIÊN (Nhân sự / Khuôn viên)", words: [
    { ko: "회사원", hv: "Hội xã viên", vi: "nhân viên công ty" },
    { ko: "은행원", hv: "Ngân hàng viên", vi: "nhân viên ngân hàng" },
    { ko: "공무원", hv: "Công vụ viên", vi: "công chức nhà nước" },
    { ko: "공원", hv: "Công viên", vi: "công viên" },
    { ko: "병원", hv: "Bệnh viện", vi: "bệnh viện" }
  ]},
  { root: "전", hanViet: "ĐIỆN / TIỀN (Điện năng / Trước)", words: [
    { ko: "전화", hv: "Điện thoại", vi: "điện thoại" },
    { ko: "전자사전", hv: "Điện tử từ điển", vi: "kim từ điển" },
    { ko: "지하철 / 전철", hv: "Điện thiết", vi: "tàu điện" },
    { ko: "오전", hv: "Ngọ tiền", vi: "buổi sáng (AM)" },
    { ko: "전통", hv: "Truyền thống", vi: "truyền thống" }
  ]}
];

// Kho Câu & Mẫu Biểu Hiện Thường Gặp TOPIK 1 & TOPIK 2
export const FREQUENT_TOPIK_EXPRESSIONS = [
  // Category 1: TOPIK 1 & Nghe câu đầu TOPIK 2 - Phản xạ hội thoại cố định
  { id: "freq_1", category: "dialogue", level: "TOPIK I & II", ko: "제가 지금 바로 확인해 볼게요.", vi: "Để tôi kiểm tra lại ngay bây giờ nhé.", usage: "Đáp lời kinh điển trong Nghe câu 1–8 khi đối phương báo lỗi/hỏi thông tin công việc.", tip: "Hễ nghe đối phương phàn nàn chưa nhận được hàng/tài liệu → câu đáp thường có -아/어 볼게요 / 알아볼게요." },
  { id: "freq_2", category: "dialogue", level: "TOPIK I", ko: "덕분에 잘 다녀왔어요.", vi: "Nhờ bạn mà tôi đã đi về rất tốt đẹp.", usage: "Đáp lại câu hỏi thăm sau chuyến du lịch, công tác (여행 잘 다녀왔어요?).", tip: "Cặp bài trùng trong đề Nghe: 다녀왔어요? ↔ 덕분에 즐거웠어요 / 잘 다녀왔어요." },
  { id: "freq_3", category: "dialogue", level: "TOPIK I", ko: "네, 창문 좀 닫아 드릴까요?", vi: "Vâng, tôi đóng cửa sổ giúp bạn nhé?", usage: "Khi người kia nói 'Trời hơi lạnh (좀 추운데요)' hoặc 'Ồn quá (밖이 시끄럽네요)'.", tip: "Đuôi -(으)ㄹ까요? hoặc -아/어 드릴까요? thể hiện sự chủ động giúp đỡ lịch sự." },
  { id: "freq_4", category: "dialogue", level: "TOPIK I & II", ko: "미안하지만 오늘은 선약이 있어서요.", vi: "Xin lỗi nhưng hôm nay tôi có hẹn trước mất rồi.", usage: "Từ chối khéo lời rủ đi ăn tối / xem phim.", tip: "선약 (Tiên ước = cuộc hẹn có trước) xuất hiện liên tục trong hội thoại từ chối lời mời." },
  { id: "freq_5", category: "dialogue", level: "TOPIK II (Nghe 9~12)", ko: "회의 자료를 복사하러 간다.", vi: "Đi photo tài liệu cuộc họp (Hành động tiếp theo của nhân vật).", usage: "Dạng câu 9–12 Nghe TOPIK II: Chọn việc người nữ/nam sẽ làm NGAY SAU khi kết thúc hội thoại.", tip: "Chú ý câu chốt của nhân vật có cụm '그럼 제가 먼저 ... -(으)ㄹ게요' — đó chính là đáp án!" },
  { id: "freq_6", category: "dialogue", level: "TOPIK I", ko: "여기 앉아도 돼요? — 네, 앉으세요.", vi: "Tôi ngồi đây được không? — Vâng, mời bạn ngồi.", usage: "Xin phép và đồng ý tại quán cà phê, thư viện, xe buýt.", tip: "-아/어도 되다 (được phép làm gì) ↔ -(으)면 안 되다 (không được làm gì)." },

  // Category 2: Phó từ nối câu (Conjunctions cho câu điền khuyết Đọc TOPIK I & II)
  { id: "freq_7", category: "conjunction", level: "TOPIK I & II", ko: "그런데 / 하지만 / 그러나", vi: "Thế nhưng / Tuy nhiên (Chuyển ý hoặc đối lập)", usage: "비싸요. 그런데 아주 맛있어요. (Đắt. Thế nhưng rất ngon.)", tip: "Vế trước khen (+), vế sau chê (-) hoặc chuyển sang chủ đề liên quan → chọn 그런데 / 그러나." },
  { id: "freq_8", category: "conjunction", level: "TOPIK I & II", ko: "그래서 / 그러므로 / 따라서", vi: "Vì vậy / Do đó / Cho nên (Quan hệ Nhân → Quả)", usage: "비가 많이 내렸다. 따라서 경기가 취소되었다.", tip: "그래서 dùng văn nói & TOPIK I; 그러므로 / 따라서 chuyên dùng văn viết báo chí Đọc câu 16–18 & Viết câu 53–54." },
  { id: "freq_9", category: "conjunction", level: "TOPIK II", ko: "반면에 (Trái lại / Ngược lại)", vi: "Đối chiếu hai mặt trái ngược hoàn toàn của 2 đối tượng.", usage: "형은 조용한 반면에 동생은 활발하다.", tip: "Rất hay ra trong Đọc điền khuyết và Viết mô tả biểu đồ Câu 53 khi so sánh nhóm tăng vs nhóm giảm." },
  { id: "freq_10", category: "conjunction", level: "TOPIK II", ko: "오히려 (Trái lại còn / Ngược với dự đoán)", vi: "Kết quả xảy ra ngược hẳn với suy nghĩ thông thường.", usage: "도와주려다가 오히려 방해만 되었다. (Định giúp mà hóa ra lại thành làm phiền.)", tip: "Dấu hiệu nhận biết: phía trước thường có -(으)ㄹ 줄 알았는데 hoặc kỳ vọng A nhưng thực tế ra B ngược lại." },
  { id: "freq_11", category: "conjunction", level: "TOPIK II", ko: "게다가 / 뿐만 아니라 (Hơn thế nữa / Không những thế)", vi: "Bổ sung thêm ý cùng chiều (tốt + tốt hơn, hoặc tệ + tệ hơn).", usage: "이 집은 교통이 편리하다. 게다가 가격도 저렴하다.", tip: "Hai vế cùng mang sắc thái tích cực hoặc cùng tiêu cực → chọn 게다가." },

  // Category 3: Cặp Từ & Ngữ pháp Đồng nghĩa TOPIK II (Câu 5~8 Đọc)
  { id: "freq_12", category: "synonym", level: "TOPIK II (Câu 5~8)", ko: "영향을 주다 ＝ 영향을 미치다", vi: "Gây ảnh hưởng / Tác động đến", usage: "환경 오염은 건강에 큰 영향을 미친다.", tip: "Cặp cụm cố định kinh điển nhất trong đề Đọc TOPIK II." },
  { id: "freq_13", category: "synonym", level: "TOPIK II (Câu 5~8)", ko: "-자마자 ＝ -는 대로", vi: "Ngay sau khi...", usage: "집에 도착하자마자 (= 도착하는 대로) 연락할게요.", tip: "Lưu ý -는 대로 mang nghĩa 'ngay khi' chỉ đi với động từ chia hiện tại." },
  { id: "freq_14", category: "synonym", level: "TOPIK II (Câu 5~8)", ko: "-기 마련이다 ＝ -는 법이다", vi: "Đương nhiên là / Lẽ thường tình là...", usage: "노력하면 좋은 결과가 있기 마련이다.", tip: "Diễn tả quy luật tất yếu trong tự nhiên hoặc đời sống." },
  { id: "freq_15", category: "synonym", level: "TOPIK I & II", ko: "거절하다 ＝ 사양하다 / 고치다 ＝ 수리하다", vi: "Từ chối / Sửa chữa", usage: "부탁을 거절하다 · 고장 난 컴퓨터를 수리하다.", tip: "Từ thuần Hàn/thông dụng (고치다) hay được thay bằng từ Hán–Hàn tương ứng (수리하다 - Tu lý)." },

  // Category 4: Quán dụng ngữ thường gặp (Idioms)
  { id: "freq_16", category: "idiom", level: "TOPIK II", ko: "발이 넓다 (Chân rộng)", vi: "Quen biết rộng, giao thiệp rộng", usage: "김 대리는 발이 넓어서 모르는 사람이 없다.", tip: "Đừng dịch nghĩa đen! 발 (bàn chân) chỉ phạm vi đi lại, giao lưu." },
  { id: "freq_17", category: "idiom", level: "TOPIK II", ko: "손이 크다 (Tay to)", vi: "Hào phóng, rộng rãi (nhất là khi chuẩn bị đồ ăn/quà cáp)", usage: "어머니는 손이 크셔서 음식을 늘 많이 만드신다.", tip: "Ngược lại: 손이 모자라다 = thiếu nhân lực, thiếu người phụ giúp." },
  { id: "freq_18", category: "idiom", level: "TOPIK II", ko: "눈이 높다 (Mắt cao) · 입이 무겁다 (Miệng nặng)", vi: "Tiêu chuẩn cao, kén chọn · Kín miệng, giữ bí mật giỏi", usage: "그 친구는 입이 무거워서 비밀을 말해도 안전해요.", tip: "Trái nghĩa với 입이 무겁다 là 입이 가볍다 (hay buôn chuyện, lộ bí mật)." }
];

// 6 Quyển Giáo Trình Tiếng Hàn Tổng Hợp dành cho người Việt Nam
export const TEXTBOOK_SERIES = [
  {
    id: "sc1",
    bookNum: 1,
    title: "Tiếng Hàn Tổng Hợp · Sơ Cấp 1",
    subtitle: "Quyển 1 · 15 Bài · 537 từ + 51 ngữ pháp Kyuri",
    topikTarget: "TOPIK I · Cấp 1",
    color: "linear-gradient(155deg, #E2F3FF 0%, #B8E0FF 100%)",
    badge: "ĐỦ AUDIO KYURI",
    hasExtractedData: true,
    lessons: [
      { num: 1, title: "Giới thiệu", koTitle: "소개", dialogue: [
        { speaker: "민수", ko: "안녕하세요? 저는 박민수입니다.", vi: "Xin chào? Tôi là Park Minsu." },
        { speaker: "흐엉", ko: "안녕하세요? 제 이름은 흐엉입니다. 저는 베트남 사람입니다.", vi: "Xin chào? Tên tôi là Hương. Tôi là người Việt Nam." },
        { speaker: "민수", ko: "흐엉 씨는 학생입니까?", vi: "Bạn Hương là sinh viên phải không?" },
        { speaker: "흐엉", ko: "네, 대학생입니다. 만나서 반갑습니다.", vi: "Vâng, tôi là sinh viên đại học. Rất vui được gặp anh." }
      ], culture: "Người Hàn Quốc cúi đầu chào nhẹ (인사) khi nói '안녕하세요?'. Khi mới gặp lần đầu hoặc trong môi trường trang trọng, đuôi câu -ㅂ니다/습니다 tạo ấn tượng lịch sự và tôn trọng." },
      { num: 2, title: "Trường học", koTitle: "학교", dialogue: [
        { speaker: "남", ko: "수진 씨, 여기는 어디입니까?", vi: "Sujin ơi, đây là đâu vậy?" },
        { speaker: "수진", ko: "여기는 도서관입니다. 저기는 학생 식당입니다.", vi: "Đây là thư viện. Đằng kia là nhà ăn sinh viên." },
        { speaker: "남", ko: "교실에 컴퓨터가 있습니까?", vi: "Trong phòng học có máy vi tính không?" },
        { speaker: "수진", ko: "네, 책상 위에 컴퓨터와 시계가 있습니다.", vi: "Có, trên bàn có máy tính và đồng hồ." }
      ], culture: "Khuôn viên các trường đại học Hàn Quốc (캠퍼스) thường có đầy đủ nhà ăn sinh viên (학생 식당), hiệu sách, ngân hàng, bưu điện và phòng câu lạc bộ (동아리방)." },
      { num: 3, title: "Sinh hoạt hằng ngày", koTitle: "일상생활", dialogue: [
        { speaker: "수진", ko: "남 씨는 오늘 어디에 갑니까?", vi: "Hôm nay Nam đi đâu vậy?" },
        { speaker: "남", ko: "도서관에 갑니다. 도서관에서 한국어를 공부합니다.", vi: "Tôi đi thư viện. Tôi học tiếng Hàn ở thư viện." },
        { speaker: "수진", ko: "오후에는 무엇을 합니까?", vi: "Buổi chiều bạn làm gì?" },
        { speaker: "남", ko: "운동장에서 친구와 운동합니다.", vi: "Tôi tập thể dục cùng bạn ở sân vận động." }
      ], culture: "Phân biệt rõ '에 가다' (đi đến đích nào) và '에서 공부하다' (thực hiện hành động tại địa điểm nào) là nền tảng quan trọng nhất khi giao tiếp sinh hoạt hằng ngày." }
    ]
  },
  {
    id: "sc2",
    bookNum: 2,
    title: "Tiếng Hàn Tổng Hợp · Sơ Cấp 2",
    subtitle: "Quyển 2 · Bài 16 → 30 · Hoàn thiện TOPIK I",
    topikTarget: "TOPIK I · Cấp 2",
    color: "linear-gradient(155deg, #DCF0FF 0%, #A3D5FF 100%)",
    badge: "SƠ CẤP 2",
    hasExtractedData: false,
    syllabus: ["Gặp gỡ & Hẹn lịch", "Thăm hỏi sức khỏe & Bệnh viện", "Bưu điện & Ngân hàng", "Du lịch đảo Jeju", "Nhà trọ & Chuyển nhà", "Kế hoạch tương lai & Ước mơ"]
  },
  {
    id: "tc3",
    bookNum: 3,
    title: "Tiếng Hàn Tổng Hợp · Trung Cấp 3",
    subtitle: "Quyển 3 · Lối vào TOPIK II & Tường thuật",
    topikTarget: "TOPIK II · Cấp 3",
    color: "linear-gradient(155deg, #D8EEFF 0%, #8ECAFC 100%)",
    badge: "TRUNG CẤP 1",
    hasExtractedData: false,
    syllabus: ["Đời sống đại học & Chọn ngành", "Thói quen tiêu dùng", "Sự cố & Bảo hành sửa chữa", "Lối sống lành mạnh", "Câu gián tiếp (-다고 하다)", "Phỏng vấn & Việc làm thêm"]
  },
  {
    id: "tc4",
    bookNum: 4,
    title: "Tiếng Hàn Tổng Hợp · Trung Cấp 4",
    subtitle: "Quyển 4 · Giao tiếp công sở & Viết 51–53",
    topikTarget: "TOPIK II · Cấp 4",
    color: "linear-gradient(155deg, #D7F0FA 0%, #8FD2F3 100%)",
    badge: "TRUNG CẤP 2",
    hasExtractedData: false,
    syllabus: ["Văn hóa doanh nghiệp Hàn Quốc", "Giải quyết hiểu lầm", "Truyền thông & Mạng xã hội", "Môi trường & Tái chế", "Biểu đồ thống kê (Câu 53)", "Nghệ thuật & Điện ảnh"]
  },
  {
    id: "cc5",
    bookNum: 5,
    title: "Tiếng Hàn Tổng Hợp · Cao Cấp 5",
    subtitle: "Quyển 5 · Báo chí, Kinh tế & Nghị luận",
    topikTarget: "TOPIK II · Cấp 5",
    color: "linear-gradient(155deg, #DBF3F8 0%, #9CDCED 100%)",
    badge: "CAO CẤP 1",
    hasExtractedData: false,
    syllabus: ["Kinh tế vĩ mô & Thị trường", "Khoa học công nghệ AI", "Lịch sử & Di sản Hàn Quốc", "Giáo dục & Xã hội già hóa", "Thành ngữ bốn chữ (사자성어)"]
  },
  {
    id: "cc6",
    bookNum: 6,
    title: "Tiếng Hàn Tổng Hợp · Cao Cấp 6",
    subtitle: "Quyển 6 · Học thuật & Chinh phục Cấp 6",
    topikTarget: "TOPIK II · Cấp 6",
    color: "linear-gradient(155deg, #E2F6F9 0%, #B0E0E6 100%)",
    badge: "CAO CẤP 2",
    hasExtractedData: false,
    syllabus: ["Triết học & Giá trị sống", "Pháp luật & Quyền công dân", "Ngoại giao & Toàn cầu hóa", "Phê bình văn học", "Nghị luận chuyên sâu 700 chữ (Câu 54)"]
  }
];
