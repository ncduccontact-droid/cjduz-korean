import { store, normalizeBookId, getBookCurriculum, playAudio, speakKoreanTTS, bindHangulEnter, renderExplainDisclosure, renderQuizHistoryPillHTML } from "./store.js?v=20261127-12";
import { appendJamoToText } from "./korean-engine.js?v=20261127-12";
import { HANGEUL_DATA } from "./curated-content.js?v=20261127-12";
import { ico } from "./icons.js?v=20261127-12";

// ============================================================================
// 1. HIGH-FREQUENCY TOPIK EXAM GRAMMAR BANK (Ôn ngữ pháp trọng tâm thi TOPIK)
// ============================================================================
export const TOPIK_EXAM_GRAMMARS = [
  {
    id: "tg_01", tier: "topik1", badge: "TOPIK I · Đọc 34–39",
    pattern: "-아/어서", meaning: "Vì... nên / Rồi (trình tự)",
    formula: "V/A + -아/어서 (Không chia quá khứ -았/었- phía trước)",
    tip: "Vế sau KHÔNG đi với mệnh lệnh -(으)세요 hay rủ rê -(으)ㅂ시다.",
    exKo: "길이 많이 막혀서 지하철을 탔어요.", exVi: "Vì tắc đường nhiều nên tôi đã đi tàu điện ngầm.",
    audio: "media/AV아어서_sentence_tts.mp3",
    mcq: { q: "늦게 (       ) 정말 죄송합니다.", opts: ["와서", "왔어서", "오니까", "오려고"], ans: 0, exp: "Xin lỗi dùng '-아/어서' và tuyệt đối không chia quá khứ '-았/었-' trước -아서." },
    trans: { vi: "Vì kẹt xe nhiều nên tôi đã đi tàu điện ngầm.", ko: "길이 많이 막혀서 지하철을 탔어요." }
  },
  {
    id: "tg_02", tier: "topik1", badge: "TOPIK I · Nghe & Đọc",
    pattern: "-(으)니까", meaning: "Vì... nên (đề xuất, rủ rê)",
    formula: "V/A + -(으)니까 (Được chia quá khứ -았/었으니까)",
    tip: "Hễ vế sau có -(으)세요, -(으)ㅂ시다, -(으)ㄹ까요? → chọn ngay -(으)니까.",
    exKo: "밖이 추우니까 옷을 따뜻하게 입으세요.", exVi: "Vì ngoài trời lạnh nên hãy mặc ấm nhé.",
    audio: "media/AV으니까_sentence_tts.mp3",
    mcq: { q: "비가 많이 (       ) 택시를 탑시다.", opts: ["오니까", "와서", "오러", "오지만"], ans: 0, exp: "Vế sau là câu rủ rê '탑시다' nên bắt buộc chọn '오니까'." },
    trans: { vi: "Vì ngoài trời lạnh nên hãy mặc quần áo ấm nhé.", ko: "밖이 추우니까 옷을 따뜻하게 입으세요." }
  },
  {
    id: "tg_03", tier: "topik1", badge: "TOPIK I · Đọc 34–39",
    pattern: "-기 때문에", meaning: "Bởi vì... nên...",
    formula: "V/A + -기 때문에 · N + 때문에",
    tip: "Nhấn mạnh lý do rõ ràng; danh từ gắn thẳng '때문에' (비 때문에).",
    exKo: "내일 시험이 있기 때문에 도서관에 가요.", exVi: "Vì ngày mai có bài thi nên tôi đến thư viện.",
    audio: "media/AV기 때문에_sentence_tts.mp3",
    mcq: { q: "눈(       ) 비행기가 출발하지 못했어요.", opts: ["때문에", "기 때문에", "이라서", "으니까"], ans: 0, exp: "Sau danh từ '눈' (tuyết) gắn trực tiếp '때문에'." },
    trans: { vi: "Vì ngày mai có kỳ thi nên tôi đi thư viện.", ko: "내일 시험이 있기 때문에 도서관에 가요." }
  },
  {
    id: "tg_04", tier: "topik1", badge: "TOPIK I · Mục đích",
    pattern: "-(으)러 가다 / -(으)려고", meaning: "Đi để... / Định làm gì",
    formula: "V + -(으)러 가다/오다 · V + -(으)려고",
    tip: "-(으)러 chỉ đi với động từ di chuyển (가다, 오다, 다니다); -(으)려고 đi với mọi động từ.",
    exKo: "책을 빌리러 도서관에 갑니다.", exVi: "Tôi đi đến thư viện để mượn sách.",
    audio: "media/gram_tg_04.mp3",
    mcq: { q: "한국 친구를 (       ) 한국어를 열심히 배워요.", opts: ["사귀려고", "사귀러", "사귀어서", "사귀지만"], ans: 0, exp: "Động từ phía sau là '배워요' (không phải 가다/오다) nên dùng '-(으)려고'." },
    trans: { vi: "Tôi đi đến thư viện để mượn sách.", ko: "책을 빌리러 도서관에 갑니다." }
  },
  {
    id: "tg_05", tier: "topik1", badge: "TOPIK I · Đọc Thông báo",
    pattern: "-(으)면 안 되다 / -아/어야 하다", meaning: "Không được phép / Phải...",
    formula: "V + -(으)면 안 되다 · V + -아/어야 하다",
    tip: "Cặp cấu trúc tủ trong bài Đọc bảng hướng dẫn, nội quy thư viện/bảo tàng (Câu 40–45).",
    exKo: "박물관 안에서는 사진을 찍으면 안 됩니다.", exVi: "Trong bảo tàng không được chụp ảnh.",
    audio: "media/AV아어야 하다되다_sentence_tts.mp3",
    mcq: { q: "열람실 안에서는 휴대전화로 통화하(       ).", opts: ["면 안 됩니다", "여야 합니다", "기로 합니다", "곤 합니다"], ans: 0, exp: "Nội quy phòng đọc cấm gọi điện thoại → '통화하면 안 됩니다'." },
    trans: { vi: "Trong bảo tàng không được chụp ảnh.", ko: "박물관 안에서는 사진을 찍으면 안 됩니다." }
  },
  {
    id: "tg_06", tier: "topik1", badge: "TOPIK I · Kinh nghiệm",
    pattern: "-(으)ㄴ 적이 있다/없다", meaning: "Đã từng / Chưa từng...",
    formula: "V + -(으)ㄴ 적이 있다/없다",
    tip: "Hỏi/kể trải nghiệm trong quá khứ; hay đi kèm '-아/어 본 적이 있다'.",
    exKo: "저는 제주도에 가 본 적이 있어요.", exVi: "Tôi đã từng đi thử đảo Jeju rồi.",
    audio: "media/gram_tg_06.mp3",
    mcq: { q: "한국 영화를 보면서 (       ) 적이 있어요.", opts: ["운", "우는", "울", "울은"], ans: 0, exp: "울다 (khóc) là thân ㄹ → lược ㄹ + ㄴ 적이 있다 → '운 적이 있어요'." },
    trans: { vi: "Tôi đã từng đi đảo Jeju rồi.", ko: "저는 제주도에 가 본 적이 있어요." }
  },
  {
    id: "tg_07", tier: "topik1", badge: "TOPIK I · Thời gian",
    pattern: "-기 전에 / -(으)ㄴ 후에", meaning: "Trước khi... / Sau khi...",
    formula: "V + -기 전에 · V + -(으)ㄴ 후에 (뒤에)",
    tip: "Trước '-기 전에' động từ luôn giữ nguyên gốc dù câu ở quá khứ.",
    exKo: "수업이 끝난 후에 친구와 저녁을 먹었어요.", exVi: "Sau khi tan học tôi đã ăn tối cùng bạn.",
    audio: "media/gram_tg_07.mp3",
    mcq: { q: "잠을 (       ) 따뜻한 우유를 마셨어요.", opts: ["자기 전에", "잤기 전에", "자은 후에", "잘 전에"], ans: 0, exp: "Trước '-기 전에' không chia quá khứ → '자기 전에'." },
    trans: { vi: "Sau khi tiết học kết thúc tôi đã ăn tối cùng bạn.", ko: "수업이 끝난 후에 친구와 저녁을 먹었어요." }
  },
  {
    id: "tg_08", tier: "topik2_mid", badge: "TOPIK II · Đọc 1–2",
    pattern: "-게 되다", meaning: "Trở nên / Được / Phải (hoàn cảnh đưa đẩy)",
    formula: "V + -게 되다",
    tip: "Diễn tả kết quả thay đổi ngoài dự tính ban đầu; cực hay ra Đọc 1–2 và Viết 51.",
    exKo: "다음 달부터 서울 지사에서 근무하게 되었습니다.", exVi: "Từ tháng sau tôi được chuyển sang làm việc tại chi nhánh Seoul.",
    audio: "media/gram_tg_08.mp3",
    mcq: { q: "우연히 본 다큐멘터리 덕분에 환경 문제에 관심을 (       ).", opts: ["가지게 되었다", "가지러 갔다", "가지곤 했다", "가지기 마련이다"], ans: 0, exp: "Nhờ xem phim tài liệu mà dẫn tới sự thay đổi thái độ → '-게 되었다'." },
    trans: { vi: "Từ tháng sau tôi được làm việc tại chi nhánh Seoul.", ko: "다음 달부터 서울 지사에서 근무하게 되었습니다." }
  },
  {
    id: "tg_09", tier: "topik2_mid", badge: "TOPIK II · Đọc 1–4",
    pattern: "-는 바람에", meaning: "Tại vì (sự cố bất ngờ) nên...",
    formula: "V + -는 바람에",
    tip: "Nguyên nhân ngoài ý muốn (mưa bão, ngủ quên, hỏng xe) + Vế sau LUÔN là kết quả xấu ở quá khứ.",
    exKo: "갑자기 폭우가 내리는 바람에 경기가 취소되었다.", exVi: "Tại mưa lớn bất ngờ nên trận đấu đã bị hủy.",
    audio: "media/gram_tg_09.mp3",
    mcq: { q: "컴퓨터가 갑자기 고장 (       ) 저장하지 못한 자료가 날아갔다.", opts: ["나는 바람에", "나기 위해서", "나는 반면에", "나도록"], ans: 0, exp: "Sự cố bất ngờ gây hậu quả mất tài liệu ở quá khứ → '-는 바람에'." },
    trans: { vi: "Tại mưa lớn bất ngờ nên trận đấu đã bị hủy.", ko: "갑자기 폭우가 내리는 바람에 경기가 취소되었다." }
  },
  {
    id: "tg_10", tier: "topik2_mid", badge: "TOPIK II · Đọc 1–4",
    pattern: "-느라고", meaning: "Vì mải làm... nên (kết quả tiêu cực)",
    formula: "V + -느라고 (Hai vế CÙNG chủ ngữ, V có ý chí)",
    tip: "Không đi với tính từ, không đi với thời tiết, không chia quá khứ trước -느라고.",
    exKo: "보고서를 작성하느라고 밤새 한숨도 못 잤다.", exVi: "Vì mải viết báo cáo nên cả đêm tôi không chợp mắt được chút nào.",
    audio: "media/gram_tg_10.mp3",
    mcq: { q: "시험공부를 (       ) 친구의 전화를 받지 못했다.", opts: ["하느라고", "했느라고", "하는 바람에", "하더라도"], ans: 0, exp: "Chủ ngữ chủ động tập trung học dẫn tới không nghe máy, không chia quá khứ → '하느라고'." },
    trans: { vi: "Vì mải viết báo cáo nên tôi không ngủ được.", ko: "보고서를 작성하느라고 잠을 못 잤다." }
  },
  {
    id: "tg_11", tier: "topik2_mid", badge: "TOPIK II · Đọc 1–4 & Viết 51",
    pattern: "-도록", meaning: "Để mà / Sao cho...",
    formula: "V + -도록 (Đồng nghĩa gần với -게 trong mục đích)",
    tip: "Rất hay gặp trong thông báo Viết 51 ('...하도록 협조해 주시기 바랍니다') và Đọc 3–4.",
    exKo: "모든 직원이 알 수 있도록 게시판에 공지했다.", exVi: "Tôi đã thông báo lên bảng tin để mọi nhân viên đều biết.",
    audio: "media/gram_tg_11.mp3",
    mcq: { q: "아이들이 다치지 (       ) 위험한 물건을 치웠다.", opts: ["않도록", "않느라고", "않는 바람에", "않더라도"], ans: 0, exp: "Chỉ mục đích 'để trẻ không bị thương' → '-지 않도록'." },
    trans: { vi: "Hãy xuất phát sớm để không bị trễ giờ học.", ko: "수업에 늦지 않도록 일찍 출발하세요." }
  },
  {
    id: "tg_12", tier: "topik2_mid", badge: "TOPIK II · Đọc 3–4 Đồng nghĩa",
    pattern: "-자마자 ＝ -는 대로", meaning: "Ngay sau khi...",
    formula: "V + -자마자 ＝ V + -는 대로",
    tip: "Cặp đồng nghĩa kinh điển nhất Câu 3–4 Đọc TOPIK II! Không chia quá khứ trước -자마자.",
    exKo: "고향에 도착하자마자 부모님께 전화드렸다.", exVi: "Ngay khi vừa về tới quê tôi đã gọi điện cho bố mẹ.",
    audio: "media/gram_tg_12.mp3",
    mcq: { q: "회의가 <u>끝나자마자</u> 결과를 메일로 보내 드리겠습니다. (Chọn câu đồng nghĩa)", opts: ["끝나는 대로", "끝나는 김에", "끝날지라도", "끝난 탓에"], ans: 0, exp: "'-자마자' (ngay sau khi) đồng nghĩa trực tiếp với 'V-는 대로'." },
    trans: { vi: "Ngay khi về tới nhà tôi sẽ liên lạc ngay.", ko: "집에 도착하자마자 바로 연락할게요." }
  },
  {
    id: "tg_13", tier: "topik2_mid", badge: "TOPIK II · Đọc 1–4",
    pattern: "-(으)ㄴ/는 데다가", meaning: "Không những... mà còn thêm...",
    formula: "V/A + -(으)ㄴ/는 데다가 · N + 인 데다가",
    tip: "Hai vế phải cùng chiều (khen + khen, hoặc chê + chê); hay đi kèm phó từ '또 / 까지'.",
    exKo: "오늘은 바람이 부는 데다가 눈까지 내린다.", exVi: "Hôm nay không những gió thổi mà còn có cả tuyết rơi.",
    audio: "media/gram_tg_13.mp3",
    mcq: { q: "이 식당은 가격이 저렴한 (       ) 맛도 훌륭해서 손님이 많다.", opts: ["데다가", "반면에", "바람에", "탓에"], ans: 0, exp: "Cộng dồn 2 ưu điểm cùng chiều (giá rẻ + vị ngon) → '저렴한 데다가'." },
    trans: { vi: "Quán này không những giá rẻ mà còn rất ngon.", ko: "이 식당은 값이 싼 데다가 맛도 아주 좋아요." }
  },
  {
    id: "tg_14", tier: "topik2_mid", badge: "TOPIK II · Đọc 1–4",
    pattern: "-(으)ㄹ까 봐(서)", meaning: "Vì lo sợ rằng... nên...",
    formula: "V/A + -(으)ㄹ까 봐",
    tip: "Nêu mối lo ngại dẫn tới hành động phòng ngừa ở vế sau.",
    exKo: "기차를 놓칠까 봐 집에서 일찍 나왔다.", exVi: "Lo bị lỡ tàu nên tôi đã ra khỏi nhà sớm.",
    audio: "media/gram_tg_14.mp3",
    mcq: { q: "아기가 (       ) 텔레비전 소리를 줄였다.", opts: ["깰까 봐", "깨는 바람에", "깨느라고", "깨기 마련이라"], ans: 0, exp: "Sợ em bé thức giấc nên vặn nhỏ tiếng TV → '깰까 봐'." },
    trans: { vi: "Lo bị lỡ tàu nên tôi đã ra khỏi nhà sớm.", ko: "기차를 놓칠까 봐 집에서 일찍 나왔다." }
  },
  {
    id: "tg_15", tier: "topik2_high", badge: "TOPIK II · Viết 52–54",
    pattern: "-(으)ㄹ 뿐만 아니라", meaning: "Không những... mà còn...",
    formula: "V/A + -(으)ㄹ 뿐만 아니라 · N + 뿐만 아니라",
    tip: "Cấu trúc vàng để nối 2 luận điểm trong Viết Câu 52, 53 và bài luận Câu 54.",
    exKo: "운동은 체력을 길러 줄 뿐만 아니라 스트레스 해소에도 좋다.", exVi: "Tập thể dục không chỉ rèn thể lực mà còn giúp giải tỏa căng thẳng.",
    audio: "media/gram_tg_15.mp3",
    mcq: { q: "독서는 지식을 넓혀 (       ) 사고력도 키워 준다.", opts: ["줄 뿐만 아니라", "주는 바람에", "주느라고", "줄지라도"], ans: 0, exp: "Nêu 2 tác dụng tích cực song song chuẩn văn viết → '줄 뿐만 아니라'." },
    trans: { vi: "Đọc sách không chỉ mở rộng kiến thức mà còn nuôi dưỡng trí tưởng tượng.", ko: "독서는 지식을 넓혀 줄 뿐만 아니라 상상력도 키워 준다." }
  },
  {
    id: "tg_16", tier: "topik2_high", badge: "TOPIK II · Viết Biểu đồ 53",
    pattern: "-(으)ㄴ/는 반면에", meaning: "Ngược lại / Trái lại...",
    formula: "A + -(으)ㄴ 반면에 · V + -는 반면에 (Đồng nghĩa: -는 데 반해)",
    tip: "Cấu trúc BẮT BUỘC phải thuộc để đối chiếu 2 nhóm tăng/giảm trong Viết biểu đồ Câu 53!",
    exKo: "온라인 쇼핑은 증가한 반면에 오프라인 매출은 감소했다.", exVi: "Mua sắm trực tuyến tăng lên, trái lại doanh thu cửa hàng trực tiếp giảm xuống.",
    audio: "media/gram_tg_16.mp3",
    mcq: { q: "찬성하는 의견이 60%로 높게 나타난 (       ) 반대는 15%에 그쳤다.", opts: ["반면에", "바람에", "덕분에", "셈 치고"], ans: 0, exp: "Đối lập số liệu thống kê 60% vs 15% trong Câu 53 → '반면에'." },
    trans: { vi: "Mua sắm trực tuyến đã tăng, trái lại doanh thu ngoại tuyến giảm.", ko: "온라인 쇼핑은 증가한 반면에 오프라인 매출은 감소했다." }
  },
  {
    id: "tg_17", tier: "topik2_high", badge: "TOPIK II · Đọc 3–4 & Viết 52",
    pattern: "-기 마련이다 ＝ -는 법이다", meaning: "Đương nhiên là / Lẽ thường tình là...",
    formula: "V/A + -기 마련이다 ＝ V/A + -는 법이다",
    tip: "Cặp đồng nghĩa siêu kinh điển Câu 3–4 Đọc & câu chốt quy luật tự nhiên ở Viết Câu 52!",
    exKo: "누구나 처음 시작할 때는 실수하기 마련이다.", exVi: "Bất kỳ ai khi mới bắt đầu cũng khó tránh khỏi sai sót.",
    audio: "media/gram_tg_17.mp3",
    mcq: { q: "계절이 바뀌면 옷차림도 <u>달라지기 마련이다</u>. (Chọn câu đồng nghĩa)", opts: ["달라지는 법이다", "달라질 뿐이다", "달라진 척한다", "달라지기 나름이다"], ans: 0, exp: "'-기 마련이다' (quy luật tất yếu) đồng nghĩa với '-는 법이다'." },
    trans: { vi: "Nếu nỗ lực hết mình thì đương nhiên sẽ có kết quả tốt.", ko: "최선을 다하면 좋은 결과가 있기 마련이다." }
  },
  {
    id: "tg_18", tier: "topik2_high", badge: "TOPIK II · Viết 53 & Báo chí",
    pattern: "-(으)로 인해(서) / -에 따라", meaning: "Do / Bởi... · Theo sự thay đổi của...",
    formula: "N + (으)로 인해(서) · N + 에 따라 / V + -기 시작함에 따라",
    tip: "Dùng nêu nguyên nhân vĩ mô (기후 변화로 인해) hoặc biến thiên biểu đồ Câu 53.",
    exKo: "고령화로 인해 노인 복지 예산이 해마다 늘고 있다.", exVi: "Do già hóa dân số nên ngân sách phúc lợi người cao tuổi tăng mỗi năm.",
    audio: "media/gram_tg_18.mp3",
    mcq: { q: "1인 가구가 증가함(       ) 소포장 식품 판매량이 급증했다.", opts: ["에 따라", "에 반해", "에도 불구하고", "을 비롯하여"], ans: 0, exp: "'증가함에 따라' = Kéo theo đà gia tăng của..." },
    trans: { vi: "Do già hóa dân số nên ngân sách phúc lợi đang tăng lên.", ko: "고령화로 인해 복지 예산이 늘고 있다." }
  },
  {
    id: "tg_19", tier: "topik2_high", badge: "TOPIK II · Đọc 3–4 Cao cấp",
    pattern: "-기 나름이다 / -에 달려 있다", meaning: "Tùy thuộc vào...",
    formula: "V + -기 나름이다 · N + 에 달려 있다",
    tip: "Kết quả tốt hay xấu phụ thuộc vào cách làm/thái độ (생각하기 나름이다).",
    exKo: "성공 여부는 자신이 얼마나 노력하느냐에 달려 있다.", exVi: "Thành công hay không phụ thuộc vào việc bản thân nỗ lực bao nhiêu.",
    audio: "media/gram_tg_19.mp3",
    mcq: { q: "같은 시간이라도 어떻게 <u>활용하기 나름이다</u>. (Chọn nghĩa tương đương)", opts: ["활용하느냐에 달려 있다", "활용할 리가 없다", "활용하기 그지없다", "활용한 지 오래되었다"], ans: 0, exp: "'-기 나름이다' (tùy vào cách...) ＝ '-느냐에 달려 있다'." },
    trans: { vi: "Mọi việc đều tùy thuộc vào cách suy nghĩ.", ko: "모든 일은 생각하기 나름이다." }
  },
  {
    id: "tg_20", tier: "topik2_high", badge: "TOPIK II · Viết Nghị luận 54",
    pattern: "-(으)ㅁ으로써", meaning: "Bằng cách / Thông qua việc...",
    formula: "V + -(으)ㅁ으로써 · N + 으로써",
    tip: "Cấu trúc ăn điểm tuyệt đối khi nêu giải pháp ở đoạn kết Câu 54!",
    exKo: "대중교통을 이용함으로써 탄소 배출을 줄일 수 있다.", exVi: "Bằng việc sử dụng giao thông công cộng, ta có thể giảm phát thải carbon.",
    audio: "media/gram_tg_20.mp3",
    mcq: { q: "서로 소통(       ) 갈등을 원만하게 해결할 수 있다.", opts: ["함으로써", "함으로", "하느라고", "하건마는"], ans: 0, exp: "Chỉ phương thức/giải pháp dùng '-(으)ㅁ으로써' (không nhầm với -(으)므로 là 'vì')." },
    trans: { vi: "Bằng việc sử dụng giao thông công cộng ta có thể giảm ô nhiễm.", ko: "대중교통을 이용함으로써 환경 오염을 줄일 수 있다." }
  }
];

// ============================================================================
// 2. SIMILAR / CONFUSABLE GRAMMAR CLUSTERS (Ôn ngữ pháp tương đồng dễ nhớ)
// ============================================================================
export const SIMILAR_GRAMMAR_CLUSTERS = [
  {
    id: "sim_01", level: "topik1", title: "은/는 vs 이/가",
    sameMeaning: "Cùng đứng sau danh từ làm chủ thể trong câu",
    items: [
      { pat: "N + 은/는", diff: "Nêu chủ đề, giới thiệu, SO SÁNH 2 vế; nhấn vào vị ngữ phía sau.", ex: "형은 키가 크지만 동생은 작아요.", vi: "Anh thì cao còn em thì thấp." },
      { pat: "N + 이/가", diff: "Xác định chủ ngữ mới; đi trước 있다/없다, 아니다, 되다, tính từ khách quan.", ex: "교실에 컴퓨터가 있어요.", vi: "Trong lớp học có máy tính." }
    ],
    mcq: { q: "형(   ) 회사원이지만 동생(   ) 아직 대학생이에요.", opts: ["은 / 은", "이 / 가", "을 / 를", "에 / 에서"], ans: 0, exp: "Khi so sánh đối lập trực tiếp 2 chủ thể ở 2 vế (형 vs 동생), bắt buộc dùng tiểu từ '은/는'." },
    trans: { vi: "Anh trai thì cao nhưng em trai thì thấp.", ko: "형은 키가 크지만 동생은 작아요." }
  },
  {
    id: "sim_02", level: "topik1", title: "에 vs 에서",
    sameMeaning: "Cùng chỉ địa điểm ('ở / tại / đến')",
    items: [
      { pat: "N + 에", diff: "Vị trí TĨNH (있어요/없어요/살아요) hoặc ĐÍCH ĐẾN (가다/오다/다니다).", ex: "도서관에 가요. 책상 위에 책이 있어요.", vi: "Đi đến thư viện. Trên bàn có sách." },
      { pat: "N + 에서", diff: "Nơi DIỄN RA HÀNH ĐỘNG động (공부하다, 먹다, 일하다) hoặc điểm xuất phát.", ex: "도서관에서 한국어를 공부해요.", vi: "Học tiếng Hàn ở thư viện." }
    ],
    mcq: { q: "저는 매일 아침 공원(   ) 산책하고 회사(   ) 갑니다.", opts: ["에서 / 에", "에 / 에서", "에서 / 에서", "에 / 에"], ans: 0, exp: "Hành động đi dạo diễn ra tại công viên (공원에서); đi đến công ty (회사에 갑니다)." },
    trans: { vi: "Tôi học tiếng Hàn ở thư viện rồi đi đến nhà ăn.", ko: "도서관에서 한국어를 공부하고 식당에 가요." }
  },
  {
    id: "sim_03", level: "topik1", title: "안 (-지 않다) vs 못 (-지 못하다)",
    sameMeaning: "Cùng mang nghĩa phủ định ('không')",
    items: [
      { pat: "안 V/A (-지 않다)", diff: "Phủ định do Ý CHÍ chủ quan (không muốn làm) hoặc trạng thái tính từ.", ex: "배가 불러서 저녁을 안 먹었어요.", vi: "Vì no bụng nên tôi đã không ăn tối." },
      { pat: "못 V (-지 못하다)", diff: "Phủ định do NĂNG LỰC hoặc HOÀN CẢNH cản trở (chỉ đi với Động từ).", ex: "이가 아파서 딱딱한 음식을 못 먹어요.", vi: "Vì đau răng nên tôi không thể ăn đồ cứng." }
    ],
    mcq: { q: "어젯밤에 커피를 마셔서 잠을 (   ) 잤어요.", opts: ["못", "안", "아닌", "말고"], ans: 0, exp: "Muốn ngủ nhưng bị cà phê cản trở không ngủ được → dùng '못 잤어요'." },
    trans: { vi: "Vì đau họng nên hôm nay tôi không thể hát được.", ko: "목이 아파서 오늘 노래를 못 해요." }
  },
  {
    id: "sim_04", level: "topik1", title: "-아/어서 ≈ -(으)니까 ≈ -기 때문에",
    sameMeaning: "Cùng diễn tả nguyên nhân – kết quả ('Vì... nên...')",
    items: [
      { pat: "-아/어서", diff: "Lý do tự nhiên/xin lỗi; KHÔNG quá khứ -았/었-, KHÔNG mệnh lệnh/rủ rê.", ex: "늦어서 미안해요.", vi: "Xin lỗi vì đến muộn." },
      { pat: "-(으)니까", diff: "ĐƯỢC chia quá khứ; KẾT HỢP TỐT với -(으)세요, -(으)ㅂ시다, -(으)ㄹ까요?.", ex: "시간이 없으니까 빨리 출발합시다.", vi: "Vì không còn thời gian nên xuất phát nhanh thôi." },
      { pat: "-기 때문에", diff: "Nhấn mạnh lý do khách quan (danh từ + 때문에); không đi với mệnh lệnh.", ex: "장학금을 받기 때문에 학비 걱정이 없어요.", vi: "Vì nhận học bổng nên không lo học phí." }
    ],
    mcq: { q: "길이 미끄러우(       ) 천천히 운전하세요.", opts: ["니까", "워서", "기 때문에", "느라고"], ans: 0, exp: "Vế sau là câu mệnh lệnh '운전하세요' nên chỉ có '-(으)니까' đúng ngữ pháp." },
    trans: { vi: "Vì không có thời gian nên chúng ta hãy xuất phát nhanh thôi.", ko: "시간이 없으니까 빨리 출발합시다." }
  },
  {
    id: "sim_05", level: "topik2", title: "-느라고 ≈ -는 바람에 ≈ -(으)ㄴ/는 탓에",
    sameMeaning: "Cùng chỉ nguyên nhân dẫn đến KẾT QUẢ TIÊU CỰC",
    items: [
      { pat: "-느라고", diff: "Chủ ngữ CHỦ ĐỘNG mải làm V1 (cùng chủ ngữ, không chia quá khứ).", ex: "야근하느라고 모임에 못 갔다.", vi: "Vì mải làm thêm giờ nên không đi họp mặt được." },
      { pat: "-는 바람에", diff: "Sự cố BẤT NGỜ khách quan (mưa bão, hỏng xe, ngủ quên) + quá khứ xấu.", ex: "버스가 고장 나는 바람에 지각했다.", vi: "Tại xe buýt bất ngờ hỏng nên tôi bị trễ." },
      { pat: "-(으)ㄴ/는 탓에", diff: "Đổ lỗi cho nguyên nhân tiêu cực (đi được với cả Động từ, Tính từ, 탓에).", ex: "성격이 급한 탓에 실수를 자주 한다.", vi: "Tại tính cách nóng vội nên hay mắc lỗi." }
    ],
    mcq: { q: "태풍이 (       ) 제주도행 비행기가 모두 결항되었다.", opts: ["오는 바람에", "오느라고", "오기 위해서", "오도록"], ans: 0, exp: "Bão là hiện tượng thiên nhiên khách quan bất ngờ + khác chủ ngữ → '오는 바람에' (không dùng 오느라고)." },
    trans: { vi: "Tại xe buýt bất ngờ bị hỏng nên tôi đã đi làm muộn.", ko: "버스가 갑자기 고장 나는 바람에 지각했다." }
  },
  {
    id: "sim_06", level: "topik1", title: "-(으)러 ≈ -(으)려고 ≈ -기 위해서 ≈ -도록",
    sameMeaning: "Cùng chỉ mục đích ('Để...')",
    items: [
      { pat: "-(으)러", diff: "Chỉ đi trước động từ DI CHUYỂN (가다, 오다, 다니다).", ex: "소포를 보내러 우체국에 가요.", vi: "Đi bưu điện để gửi bưu kiện." },
      { pat: "-(으)려고", diff: "Đi với mọi động từ, cùng chủ ngữ; không đi với mệnh lệnh.", ex: "유학 가려고 돈을 모으고 있어요.", vi: "Đang tiết kiệm tiền để đi du học." },
      { pat: "-기 위해서 / -도록", diff: "Trang trọng/văn viết (-기 위해 đi được với N; -도록 đi được với mệnh lệnh).", ex: "건강을 지키기 위해 매일 운동한다.", vi: "Tập thể dục mỗi ngày để giữ gìn sức khỏe." }
    ],
    mcq: { q: "목표를 달성하(       ) 꾸준히 노력해야 한다.", opts: ["기 위해서", "러", "느라고", "는 바람에"], ans: 0, exp: "Phía sau là '노력해야 한다' (có đuôi phải làm gì, không phải 가다/오다) → '달성하기 위해서'." },
    trans: { vi: "Tôi đang tiết kiệm tiền để đi du học Hàn Quốc.", ko: "한국에 유학 가려고 돈을 모으고 있어요." }
  },
  {
    id: "sim_07", level: "topik2", title: "-지만 ≈ -(으)ㄴ/는데 ≈ -(으)ㄴ/는 반면에",
    sameMeaning: "Cùng nối hai vế đối lập ('Nhưng / Trái lại')",
    items: [
      { pat: "-지만", diff: "Đối lập trực tiếp trong cả nói & viết; chia được quá khứ (-았/었지만).", ex: "값은 비싸지만 품질이 아주 좋다.", vi: "Giá đắt nhưng chất lượng rất tốt." },
      { pat: "-(으)ㄴ/는데", diff: "Mở nền ngữ cảnh mềm mại trong hội thoại để rủ rê, hỏi hoặc đối lập nhẹ.", ex: "지금 비가 오는데 우산 있어요?", vi: "Bây giờ trời đang mưa đấy, bạn có ô không?" },
      { pat: "-(으)ㄴ/는 반면에", diff: "Đối chiếu cân xứng 2 mặt trái ngược (văn viết, biểu đồ Câu 53).", ex: "도시는 편리한 반면에 공기가 나쁘다.", vi: "Thành phố tiện lợi, trái lại không khí xấu." }
    ],
    mcq: { q: "여름에는 비가 많이 오는 (       ) 겨울에는 건조하고 눈이 내린다.", opts: ["반면에", "바람에", "데다가", "김에"], ans: 0, exp: "Đối chiếu đặc điểm trái ngược giữa mùa hè và mùa đông → '오는 반면에'." },
    trans: { vi: "Đô thị thì tiện lợi nhưng trái lại chi phí sinh hoạt đắt đỏ.", ko: "도시는 편리한 반면에 생활비가 비싸다." }
  },
  {
    id: "sim_08", level: "topik2", title: "-자마자 ＝ -는 대로 ≈ -(으)ㄴ 후에",
    sameMeaning: "Cùng chỉ trình tự hành động kế tiếp nhau",
    items: [
      { pat: "-자마자", diff: "Xảy ra NGAY TỨC THÌ sau V1 (dùng được cả quá khứ, hiện tại, tương lai).", ex: "벨이 울리자마자 교실 밖으로 나갔다.", vi: "Chuông vừa reo là chạy ra khỏi lớp ngay." },
      { pat: "-는 대로", diff: "Ngay khi V1 hoàn tất thì làm V2 (Vế sau chỉ ở HIỆN TẠI / TƯƠNG LAI, không dùng quá khứ).", ex: "회의가 끝나는 대로 전화할게요.", vi: "Ngay khi họp xong tôi sẽ gọi điện." },
      { pat: "-(으)ㄴ 후에", diff: "Sau khi xong V1 rồi mới làm V2 (khoảng cách thời gian rộng hơn).", ex: "식사한 후에 약을 드세요.", vi: "Sau khi dùng bữa hãy uống thuốc." }
    ],
    mcq: { q: "침대에 (       ) 피곤해서 바로 잠이 들었다.", opts: ["눕자마자", "눕는 대로", "누울지라도", "눕기 전에"], ans: 0, exp: "Vế sau chia quá khứ '잠이 들었다' nên dùng '눕자마자' ('-는 대로' không đi với vế sau quá khứ đã xảy ra)." },
    trans: { vi: "Ngay khi cuộc họp kết thúc tôi sẽ gọi điện cho bạn.", ko: "회의가 끝나는 대로 전화할게요." }
  },
  {
    id: "sim_09", level: "topik1", title: "-(으)면서 ≈ -는 동안",
    sameMeaning: "Cùng chỉ hai hành động diễn ra song song",
    items: [
      { pat: "-(으)면서", diff: "CÙNG 1 CHỦ NGỮ vừa làm A vừa làm B đồng thời.", ex: "음악을 들으면서 방을 청소해요.", vi: "Tôi vừa nghe nhạc vừa dọn phòng." },
      { pat: "-는 동안", diff: "Trong khoảng thời gian A diễn ra (2 vế CÓ THỂ KHÁC chủ ngữ).", ex: "제가 청소하는 동안 동생은 요리했어요.", vi: "Trong lúc tôi dọn phòng thì em tôi nấu ăn." }
    ],
    mcq: { q: "운전하(       ) 휴대전화를 보면 매우 위험합니다.", opts: ["면서", "는 동안에 남이", "자마자", "기 전에"], ans: 0, exp: "Cùng một người vừa lái xe vừa nhìn điện thoại → '운전하면서'." },
    trans: { vi: "Tôi vừa nghe nhạc Hàn Quốc vừa dọn dẹp phòng.", ko: "한국 음악을 들으면서 방을 청소해요." }
  },
  {
    id: "sim_10", level: "topik2", title: "-아/어지다 ≈ -게 되다",
    sameMeaning: "Cùng diễn tả sự thay đổi ('Trở nên...')",
    items: [
      { pat: "A + -아/어지다", diff: "Đi sau TÍNH TỪ: trạng thái/tính chất biến đổi dần (따뜻해지다, 많아지다).", ex: "날씨가 점점 따뜻해졌어요.", vi: "Thời tiết dần trở nên ấm áp." },
      { pat: "V + -게 되다", diff: "Đi sau ĐỘNG TỪ: hoàn cảnh bên ngoài dẫn tới việc làm/biết điều gì.", ex: "한국 친구 덕분에 김치를 잘 먹게 되었어요.", vi: "Nhờ bạn Hàn mà giờ tôi đã ăn được kim chi ngon lành." }
    ],
    mcq: { q: "꾸준히 연습한 덕분에 발음이 예전보다 훨씬 (       ).", opts: ["좋아졌다", "좋게 되었다", "좋아 버렸다", "좋기 마련이다"], ans: 0, exp: "'좋다' là tính từ chỉ mức độ tốt lên dần → '좋아졌다'." },
    trans: { vi: "Nhờ luyện tập đều đặn nên phát âm đã tốt hơn nhiều.", ko: "꾸준히 연습한 덕분에 발음이 많이 좋아졌어요." }
  },
  {
    id: "sim_11", level: "topik1", title: "-(으)ㄹ 수 있다 ≈ -(으)ㄹ 줄 알다",
    sameMeaning: "Cùng dịch là 'Có thể / Biết làm gì'",
    items: [
      { pat: "-(으)ㄹ 수 있다", diff: "Có NĂNG LỰC hoặc ĐIỀU KIỆN cho phép làm gì (시간이 있어서 갈 수 있어요).", ex: "도서관에서 책을 다섯 권 빌릴 수 있어요.", vi: "Ở thư viện có thể mượn 5 cuốn sách." },
      { pat: "-(으)ㄹ 줄 알다", diff: "Đã học và BIẾT KỸ NĂNG/CÁCH LÀM (bơi, lái xe, nấu ăn, đọc Hangeul).", ex: "저는 수영할 줄 몰라요.", vi: "Tôi không biết bơi." }
    ],
    mcq: { q: "태권도를 배운 적이 없어서 태권도를 (       ).", opts: ["할 줄 몰라요", "할 줄 없어요", "할 수 몰라요", "하기 전이에요"], ans: 0, exp: "Chưa từng học kỹ năng đó → '할 줄 몰라요' (không biết cách làm)." },
    trans: { vi: "Bạn có biết nấu món canh kim chi không?", ko: "김치찌개를 만들 줄 알아요?" }
  },
  {
    id: "sim_12", level: "topik2", title: "-기 마련이다 ＝ -는 법이다 ≈ -(으)ㄹ 수밖에 없다",
    sameMeaning: "Cùng khẳng định tính tất yếu, hiển nhiên (Câu 3–4 Đọc TOPIK II)",
    items: [
      { pat: "-기 마련이다 / -는 법이다", diff: "Quy luật tự nhiên, lẽ thường ở đời ('Đương nhiên là...').", ex: "거짓말은 언젠가 드러나기 마련이다.", vi: "Lời nói dối sớm muộn gì cũng đương nhiên bị lộ." },
      { pat: "-(으)ㄹ 수밖에 없다", diff: "Không còn lựa chọn nào khác ('Đành phải / Chắc chắn phải...').", ex: "막차를 놓쳐서 택시를 탈 수밖에 없었다.", vi: "Lỡ chuyến xe cuối nên đành phải đi taxi." }
    ],
    mcq: { q: "길 안내 표지판이 없어서 길을 (       ).", opts: ["헤맬 수밖에 없었다", "헤매기 나름이었다", "헤매는 척했다", "헤맬 리가 없었다"], ans: 0, exp: "Không có biển chỉ đường nên không còn cách nào khác ngoài bị lạc → '헤맬 수밖에 없었다'." },
    trans: { vi: "Vì lỡ chuyến xe cuối nên tôi đành phải đi taxi.", ko: "막차를 놓쳐서 택시를 탈 수밖에 없었다." }
  }
];

function normalizeKo(s) {
  return (s || "").replace(/[.?!,~"']/g, "").replace(/\s+/g, " ").trim();
}

function buildWordBank(targetSentence, seedIdx) {
  const realTokens = targetSentence.trim().split(/\s+/);
  const distractors = ["때문에", "바람에", "지만", "안", "에서"].filter((d) => !realTokens.includes(d)).slice(0, 2);
  const combined = [...realTokens, ...distractors].map((tok, i) => ({ id: `gb_${i}`, text: tok }));
  return combined.sort((a, b) => ((a.text.charCodeAt(0) * 19 + seedIdx * 7) % 13) - ((b.text.charCodeAt(0) * 19 + seedIdx * 7) % 13));
}

// Shared Interactive MCQ List Renderer for Grammar Drills (End-of-Quiz Grading + Score History)
function renderGrammarMcqArena(container, drills, stateKeyPrefix, meta = {}) {
  let queue = [...drills];
  let round = 0;
  let submitted = false;
  const picked = {};
  const baseQuizKey = `gram_${stateKeyPrefix}`;

  function draw() {
    const doneCnt = queue.filter((q) => picked[q.id] !== undefined).length;
    const correctCnt = queue.filter((q) => picked[q.id] === q.answer).length;
    const pctScore = queue.length > 0 ? Math.round((correctCnt / queue.length) * 100) : 0;
    const wrongItems = submitted ? queue.filter((q) => picked[q.id] !== q.answer) : [];
    const histPill = renderQuizHistoryPillHTML(baseQuizKey);

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="box-kind" style="background:var(--primary-3);padding:14px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;flex-direction:column;gap:4px;">
            <strong style="font-size:15px;color:var(--primary-4);">
              ${submitted
                ? `Điểm số: ${pctScore}/100đ · Đúng ${correctCnt}/${queue.length} câu ${round > 0 ? `(Ôn câu sai #${round})` : ""}`
                : `Đã chọn ${doneCnt}/${queue.length} câu ${round > 0 ? `(Ôn câu sai #${round})` : ""} · Bấm Nộp bài để chấm điểm`}
            </strong>
            ${histPill ? `<div>${histPill}</div>` : ""}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${!submitted ? `
              <button type="button" class="btn-primary" data-gram-submit="1" ${doneCnt === 0 ? "disabled" : ""}>
                Nộp bài &amp; Chấm điểm
              </button>
            ` : `
              ${wrongItems.length > 0 ? `
                <button type="button" class="btn-orange" id="btn-gram-retry-wrong">
                  Ôn ${wrongItems.length} câu sai
                </button>
              ` : ""}
              <button type="button" class="btn-outline-teal" id="btn-gram-reset-all">
                Làm lại
              </button>
            `}
          </div>
        </div>

        ${queue.map((q, qi) => {
          const u = picked[q.id];
          const answered = u !== undefined;
          const ansNum = ["①", "②", "③", "④"][q.answer] || `${q.answer + 1}`;
          return `
            <div class="box-kind" style="padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
                <span class="meta-chip" style="color:var(--primary-1);">Câu ${qi + 1}/${queue.length}${q.tag ? ` · ${q.tag}` : ""}</span>
                ${q.audio ? `<button type="button" class="btn-audio" aria-label="Nghe câu ${qi + 1}" data-gaud="${q.audio}">${ico("speaker", 16)}</button>` : ""}
              </div>
              <div class="ko" style="font-weight:700;font-size:16px;margin-bottom:12px;">${q.question}</div>
              <div class="grid-2" style="gap:10px;">
                ${q.options.map((opt, oi) => {
                  let cls = "mcq-opt-btn";
                  if (submitted) {
                    if (oi === q.answer) cls += " is-correct";
                    else if (oi === u) cls += " is-wrong";
                  } else if (oi === u) {
                    cls += " is-selected";
                  }
                  return `
                    <button type="button" class="ko ${cls}" data-gq="${q.id}" data-goi="${oi}" ${submitted ? "disabled" : ""}>
                      ${["①", "②", "③", "④"][oi]} ${opt}
                    </button>
                  `;
                }).join("")}
              </div>
              ${submitted ? renderExplainDisclosure({
                isCorrect: u === q.answer,
                statusHtml: u === q.answer
                  ? "Chính xác"
                  : (answered ? `Chưa đúng · Đáp án ${ansNum}` : `Chưa chọn · Đáp án ${ansNum}`),
                explainHtml: q.explain
              }) : ""}
            </div>
          `;
        }).join("")}

        ${!submitted && queue.length > 0 ? `
          <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;flex-wrap:wrap;">
            <span style="font-size:13.5px;color:var(--text-muted);">Đã chọn <strong>${doneCnt}/${queue.length}</strong> câu</span>
            <button type="button" class="btn-primary" data-gram-submit="1" ${doneCnt === 0 ? "disabled" : ""}>
              Nộp bài &amp; Chấm điểm
            </button>
          </div>
        ` : ""}
      </div>
    `;

    const submitGrammarNow = () => {
      submitted = true;
      const corr = queue.filter((q) => picked[q.id] === q.answer).length;
      const finalPct = queue.length > 0 ? Math.round((corr / queue.length) * 100) : 0;
      queue.forEach((qObj) => {
        if (picked[qObj.id] !== undefined) {
          store.recordQuestionResult(stateKeyPrefix, meta.title || "Luyện Ngữ pháp", qObj, picked[qObj.id], { deferSave: true });
        }
      });
      store.recordScoreHistory({
        quizKey: round === 0 ? baseQuizKey : `${baseQuizKey}_retry`,
        category: "Ngữ pháp",
        title: round > 0 ? `${meta.title || "Bài tập Ngữ pháp"} (Ôn câu sai)` : (meta.title || "Bài tập Ngữ pháp"),
        score: finalPct,
        maxScore: 100,
        correctCount: corr,
        totalCount: queue.length,
        route: meta.route || "theory",
        params: meta.params || { sub: "grammar-list" }
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      draw();
    };

    container.querySelectorAll("[data-gram-submit]").forEach((b) => {
      b.addEventListener("click", submitGrammarNow);
    });
    container.querySelector("#btn-gram-retry-wrong")?.addEventListener("click", () => {
      queue = [...wrongItems];
      queue.forEach((w) => { delete picked[w.id]; });
      submitted = false;
      round += 1;
      window.scrollTo({ top: 0, behavior: "smooth" });
      draw();
    });
    container.querySelector("#btn-gram-reset-all")?.addEventListener("click", () => {
      queue = [...drills];
      Object.keys(picked).forEach((k) => { delete picked[k]; });
      submitted = false;
      round = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
      draw();
    });
    container.querySelectorAll("[data-gaud]").forEach((b) => {
      b.addEventListener("click", () => playAudio(b.dataset.gaud));
    });
    container.querySelectorAll("[data-gq]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (submitted) return;
        const qObj = queue.find((x) => x.id === btn.dataset.gq);
        if (!qObj) return;
        picked[qObj.id] = Number(btn.dataset.goi);
        draw();
      });
    });
  }

  draw();
}

// Shared Interactive Sentence Translation Renderer for Grammar Application
function renderGrammarTranslationArena(container, items, bookForSave = "q1", lessonForSave = 1, meta = {}) {
  if (!items.length) {
    container.innerHTML = `<div class="box-kind">Chưa có câu luyện dịch cho phần này.</div>`;
    return;
  }
  let idx = 0;
  let transMode = "blocks";
  let selectedBlocks = [];
  let typingDraft = "";
  let showVk = false;
  let checked = null;
  let summaryMode = false;
  const solvedMap = {};
  const countedIds = new Set();
  const quizKey = `gtr_${meta.key || `${bookForSave}_${lessonForSave}`}`;

  function draw() {
    const doneCnt = Object.keys(solvedMap).length;
    const correctCnt = items.filter((it) => solvedMap[it.id] === true).length;
    const pctScore = Math.round((correctCnt / items.length) * 100);
    const histPill = renderQuizHistoryPillHTML(quizKey);

    const finishSet = () => {
      summaryMode = true;
      store.recordScoreHistory({
        quizKey,
        category: "Dịch ngữ pháp",
        title: meta.title || "Dịch câu áp dụng ngữ pháp",
        score: pctScore,
        maxScore: 100,
        correctCount: correctCnt,
        totalCount: items.length,
        route: meta.route || "theory",
        params: meta.params || { sub: "grammar-list" }
      });
      draw();
    };

    if (summaryMode) {
      container.innerHTML = `
        <div class="box-kind" style="max-width:780px;margin:0 auto;padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
            <div>
              <h3 style="margin:0 0 4px;font-size:18.5px;color:var(--primary-1);">
                Điểm dịch ngữ pháp: ${pctScore}/100đ · Đúng ${correctCnt}/${items.length} câu
              </h3>
              ${renderQuizHistoryPillHTML(quizKey)}
            </div>
            <button type="button" class="btn-primary" id="gt-restart-all">Làm lại từ đầu</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${items.map((it, ii) => {
              const ok = solvedMap[it.id] === true;
              return `
                <div style="padding:11px 14px;border-radius:10px;background:${ok ? "rgba(22,163,74,0.08)" : "rgba(225,29,72,0.06)"};border:1px solid ${ok ? "rgba(22,163,74,0.3)" : "rgba(225,29,72,0.28)"};">
                  <div style="font-size:13px;color:var(--text-muted);">${ii + 1}. ${it.vi}</div>
                  <div class="ko" style="font-size:15.5px;font-weight:700;margin-top:2px;">${it.ko}</div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
      container.querySelector("#gt-restart-all")?.addEventListener("click", () => {
        Object.keys(solvedMap).forEach((k) => delete solvedMap[k]);
        summaryMode = false;
        idx = 0;
        selectedBlocks = [];
        typingDraft = "";
        checked = null;
        draw();
      });
      return;
    }

    idx = Math.min(Math.max(0, idx), items.length - 1);
    const cur = items[idx];
    const bank = buildWordBank(cur.ko, idx);
    const isLast = idx === items.length - 1;

    container.innerHTML = `
      <div class="box-kind" style="max-width:780px;margin:0 auto;padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:13px;font-weight:700;color:var(--primary-1);">Câu ${idx + 1}/${items.length}</span>
            <span class="badge-orange ko">${cur.grammarBadge}</span>
            ${histPill}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${doneCnt > 0 ? `<button type="button" class="btn-soft-jade" id="gt-finish-set" style="padding:4px 11px;font-size:12.5px;">Tổng kết (${doneCnt}/${items.length})</button>` : ""}
            <button type="button" class="btn-outline-teal" data-gtmode="blocks" style="padding:4px 11px;font-size:12.5px;${transMode === "blocks" ? "background:var(--primary);color:#FFF;border-color:var(--primary-1);" : ""}">Ghép từ</button>
            <button type="button" class="btn-outline-teal" data-gtmode="typing" style="padding:4px 11px;font-size:12.5px;${transMode === "typing" ? "background:var(--primary);color:#FFF;border-color:var(--primary-1);" : ""}">Tự gõ</button>
          </div>
        </div>

        <div style="background:#F8FAFC;border-radius:12px;padding:15px 18px;margin-bottom:14px;">
          <div style="font-size:18px;font-weight:750;color:var(--text-main);">${cur.vi}</div>
          ${cur.hint ? `<div style="font-size:12.5px;color:var(--text-muted);margin-top:4px;">${cur.hint}</div>` : ""}
        </div>

        ${transMode === "blocks" ? `
          <div style="min-height:52px;background:#F8FAFC;border:1.5px dashed #CBD5E1;border-radius:12px;padding:10px 12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
            ${selectedBlocks.length === 0
              ? `<span style="color:var(--text-muted);font-size:13px;">Chạm các cụm từ bên dưới để ghép câu đúng ngữ pháp...</span>`
              : selectedBlocks.map((b, bi) => `
                  <button type="button" class="ko" data-rmblk="${bi}" style="background:var(--primary);color:#FFF;border:none;border-radius:8px;padding:6px 12px;font-size:15.5px;font-weight:650;cursor:pointer;">
                    ${b.text} ×
                  </button>
                `).join("")}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
            ${bank.map((b) => {
              const used = selectedBlocks.some((s) => s.id === b.id);
              return `
                <button type="button" class="ko" data-pkblk="${b.id}" ${used ? "disabled" : ""} style="padding:7px 13px;border-radius:10px;border:1px solid ${used ? "#E2E8F0" : "#CBD5E1"};background:${used ? "#F1F5F9" : "#FFFFFF"};color:${used ? "#94A3B8" : "var(--text-main)"};font-size:15.5px;font-weight:650;cursor:${used ? "default" : "pointer"};">
                  ${b.text}
                </button>
              `;
            }).join("")}
          </div>
        ` : `
          <div style="margin-bottom:12px;">
            <input id="gt-inp" class="ko" value="${typingDraft.replace(/"/g, "&quot;")}" placeholder="Gõ câu tiếng Hàn áp dụng ngữ pháp trên..." style="width:100%;padding:11px 14px;font-size:16.5px;font-weight:650;" />
            <div style="margin-top:6px;text-align:right;">
              <button type="button" class="btn-outline-teal" id="gt-vk-btn" style="padding:4px 10px;font-size:12px;">
                ${showVk ? "Ẩn bàn phím Hàn" : "Bàn phím Hàn ảo"}
              </button>
            </div>
            ${showVk ? `
              <div class="kr-keyboard">
                ${HANGEUL_DATA.keyboardRows.map((row) => `
                  <div class="kr-key-row">
                    ${row.map((cell) => `<button type="button" class="kr-key" data-jamo="${cell.k}"><span>${cell.k}</span><small>${cell.en}</small></button>`).join("")}
                  </div>
                `).join("")}
                <div class="kr-key-row">
                  <button type="button" class="kr-key" data-special="space" style="min-width:120px;">Space</button>
                  <button type="button" class="kr-key" data-special="back" style="min-width:80px;">Xóa</button>
                </div>
              </div>
            ` : ""}
          </div>
        `}

        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn-primary" id="gt-check">Kiểm tra</button>
            <button type="button" class="btn-outline-teal" id="gt-reset">Xóa nháp</button>
          </div>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn-outline-teal" id="gt-prev" ${idx === 0 ? "disabled" : ""}>← Trước</button>
            <button type="button" class="${isLast ? "btn-primary" : "btn-soft-jade"}" id="gt-next">${isLast ? "Hoàn thành &amp; Chấm điểm →" : "Câu tiếp →"}</button>
          </div>
        </div>

        ${checked ? `
          <div style="margin-top:14px;padding:12px 15px;border-radius:12px;background:${checked.ok ? "rgba(34,197,94,0.12)" : "rgba(244,63,94,0.10)"};border:1.5px solid ${checked.ok ? "var(--success)" : "var(--danger)"};">
            <strong style="color:${checked.ok ? "var(--success)" : "var(--danger)"};font-size:14.5px;display:inline-flex;align-items:center;gap:6px;">
              ${checked.ok ? `${ico("check", 16)} Chính xác!` : `${ico("bulb", 16)} Đáp án chuẩn:`}
            </strong>
            <div style="margin-top:5px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
              <span class="ko" style="font-size:17.5px;font-weight:800;color:var(--primary-4);">${cur.ko}</span>
              <button type="button" class="btn-outline-teal" id="gt-speak" style="padding:4px 11px;font-size:12.5px;">${ico("speaker", 15)} Nghe</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;

    container.querySelectorAll("[data-gtmode]").forEach((b) => {
      b.addEventListener("click", () => {
        transMode = b.dataset.gtmode;
        selectedBlocks = [];
        checked = null;
        draw();
      });
    });
    container.querySelectorAll("[data-pkblk]").forEach((b) => {
      b.addEventListener("click", () => {
        const found = bank.find((x) => x.id === b.dataset.pkblk);
        if (found) { selectedBlocks.push(found); checked = null; draw(); }
      });
    });
    container.querySelectorAll("[data-rmblk]").forEach((b) => {
      b.addEventListener("click", () => {
        selectedBlocks.splice(Number(b.dataset.rmblk), 1);
        checked = null;
        draw();
      });
    });

    const inp = container.querySelector("#gt-inp");
    if (inp) {
      inp.addEventListener("input", (e) => { typingDraft = e.target.value; });
      bindHangulEnter(inp, verifyNow);
      container.querySelector("#gt-vk-btn")?.addEventListener("click", () => { showVk = !showVk; draw(); });
      container.querySelectorAll("[data-jamo]").forEach((k) => {
        k.addEventListener("click", () => {
          inp.value = appendJamoToText(inp.value, k.dataset.jamo);
          typingDraft = inp.value;
          inp.focus();
        });
      });
      container.querySelectorAll("[data-special]").forEach((k) => {
        k.addEventListener("click", () => {
          if (k.dataset.special === "space") inp.value += " ";
          if (k.dataset.special === "back") inp.value = inp.value.slice(0, -1);
          typingDraft = inp.value;
          inp.focus();
        });
      });
    }

    function verifyNow() {
      const uStr = transMode === "blocks"
        ? selectedBlocks.map((x) => x.text).join(" ")
        : (container.querySelector("#gt-inp")?.value || typingDraft);
      typingDraft = container.querySelector("#gt-inp")?.value ?? typingDraft;
      const ok = normalizeKo(uStr) === normalizeKo(cur.ko);
      checked = { ok };
      solvedMap[cur.id] = ok;
      if (ok && !countedIds.has(cur.id)) {
        countedIds.add(cur.id);
        store.recordTranslationSolved(bookForSave, lessonForSave);
      }
      if (cur.audio) playAudio(cur.audio);
      else speakKoreanTTS(cur.ko);
      draw();
    }

    container.querySelector("#gt-finish-set")?.addEventListener("click", finishSet);
    container.querySelector("#gt-check").addEventListener("click", verifyNow);
    container.querySelector("#gt-reset").addEventListener("click", () => { selectedBlocks = []; typingDraft = ""; checked = null; draw(); });
    container.querySelector("#gt-prev").addEventListener("click", () => {
      if (idx > 0) { idx -= 1; selectedBlocks = []; typingDraft = ""; checked = null; draw(); }
    });
    container.querySelector("#gt-next").addEventListener("click", () => {
      if (isLast) {
        if (checked === null && (selectedBlocks.length > 0 || (container.querySelector("#gt-inp")?.value || typingDraft).trim())) {
          const uStr = transMode === "blocks"
            ? selectedBlocks.map((x) => x.text).join(" ")
            : (container.querySelector("#gt-inp")?.value || typingDraft);
          const ok = normalizeKo(uStr) === normalizeKo(cur.ko);
          solvedMap[cur.id] = ok;
          if (ok && !countedIds.has(cur.id)) {
            countedIds.add(cur.id);
            store.recordTranslationSolved(bookForSave, lessonForSave);
          }
        }
        finishSet();
        return;
      }
      idx += 1;
      selectedBlocks = [];
      typingDraft = "";
      checked = null;
      draw();
    });
    container.querySelector("#gt-speak")?.addEventListener("click", () => {
      if (cur.audio) playAudio(cur.audio);
      else speakKoreanTTS(cur.ko);
    });
  }

  draw();
}

// Builds lesson-specific Grammar MCQs & Sentence Translations for any (bookKey, lessonNum)
export function buildLessonGrammarPracticeData(db, rawBookKey, lessonNum) {
  const bookKey = normalizeBookId(rawBookKey);
  const bookCur = getBookCurriculum(db, bookKey);
  const chapObj = bookCur?.chapters?.find((c) => c.lesson === lessonNum);
  const grammars = chapObj?.textbook?.grammars || (bookKey === "q1" ? db.sc1Grammar.filter((g) => g.lesson === lessonNum) : []);
  const allBookGrams = [
    ...db.sc1Grammar,
    ...(db.books6 || []).filter((b) => b.bookId !== "q1").flatMap((b) => b.chapters.flatMap((c) => c.textbook?.grammars || []))
  ];

  // 1. Workbook custom grammar drills
  const drills = (chapObj?.workbook?.vocabGrammarDrills || []).map((d, i) => {
    const tagged = d.opts.map((txt, oi) => ({ txt, isAns: oi === (d.ans || 0) }));
    const shift = (lessonNum + i + 1) % tagged.length;
    const rot = [...tagged.slice(shift), ...tagged.slice(0, shift)];
    return {
      id: `lg_wb_${bookKey}_${lessonNum}_${i}`,
      tag: `Bài ${String(lessonNum).padStart(2, "0")}`,
      question: d.q,
      options: rot.map((r) => r.txt),
      answer: rot.findIndex((r) => r.isAns),
      explain: d.exp
    };
  });

  // 2. Pattern-meaning & sentence-application drills for each grammar in the lesson
  grammars.forEach((g, gi) => {
    const distractors = allBookGrams
      .filter((o) => o.pattern !== g.pattern && o.meaning !== g.meaning)
      .slice((lessonNum * 2 + gi * 3) % Math.max(1, allBookGrams.length - 4), ((lessonNum * 2 + gi * 3) % Math.max(1, allBookGrams.length - 4)) + 3);
    if (distractors.length >= 3 && g.example1Ko && g.example1Vi) {
      const rawOpts = [
        `${g.pattern} (${g.meaning})`,
        ...distractors.map((d) => `${d.pattern} (${d.meaning})`)
      ];
      const shift = (lessonNum + gi + 2) % 4;
      const tagged = rawOpts.map((txt, oi) => ({ txt, isAns: oi === 0 }));
      const rot = [...tagged.slice(shift), ...tagged.slice(0, shift)];
      drills.push({
        id: `lg_pat_${bookKey}_${lessonNum}_${gi}`,
        tag: g.pattern,
        audio: g.example1Audio || "",
        question: `Câu "${g.example1Ko}" (${g.example1Vi}) sử dụng cấu trúc trọng tâm nào?`,
        options: rot.map((r) => r.txt),
        answer: rot.findIndex((r) => r.isAns),
        explain: `${g.pattern}: ${g.meaning} (${g.construction || ""}).`
      });
    }
  });

  // 3. Sentence translations strictly using this lesson's grammar patterns
  const translations = grammars.flatMap((g) => {
    const list = [];
    if (g.example1Ko && g.example1Vi) {
      list.push({
        id: `ltr1_${bookKey}_${lessonNum}_${g.pattern}`,
        vi: g.example1Vi,
        ko: g.example1Ko,
        audio: g.example1Audio || "",
        grammarBadge: `Dùng: ${g.pattern}`,
        hint: `${g.meaning} · ${g.construction || ""}`
      });
    }
    if (g.example2Ko && g.example2Vi) {
      list.push({
        id: `ltr2_${bookKey}_${lessonNum}_${g.pattern}`,
        vi: g.example2Vi,
        ko: g.example2Ko,
        audio: g.example2Audio || "",
        grammarBadge: `Dùng: ${g.pattern}`,
        hint: `${g.meaning} · ${g.construction || ""}`
      });
    }
    return list;
  });

  return { bookKey, bookCur, chapObj, grammars, drills, translations };
}

// Inline Lesson Grammar Widget (used both inside Lesson Detail AND Mode 1 of Grammar Studio)
export function renderInlineLessonGrammarSection(container, db, rawBookKey, lessonNum, initialSubTab = "review") {
  const { bookKey, chapObj, grammars, drills, translations } = buildLessonGrammarPracticeData(db, rawBookKey, lessonNum);
  let subTab = initialSubTab; // review | quiz | translate

  function draw() {
    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
        <div class="skill-pills-row" style="margin-bottom:0;">
          <button type="button" class="btn-skill ${subTab === "review" ? "active" : ""}" data-lgtab="review">
            ${ico("book", 15)} Ôn ngữ pháp (${grammars.length})
          </button>
          <button type="button" class="btn-skill ${subTab === "quiz" ? "active" : ""}" data-lgtab="quiz">
            ${ico("workbook", 15)} Bài tập (${drills.length})
          </button>
          <button type="button" class="btn-skill ${subTab === "translate" ? "active" : ""}" data-lgtab="translate">
            ${ico("pen", 15)} Dịch câu (${translations.length})
          </button>
        </div>
        ${chapObj?.title ? `<span style="font-size:12.5px;color:var(--text-muted);font-weight:600;">Bài ${String(lessonNum).padStart(2, "0")}: ${chapObj.title}</span>` : ""}
      </div>

      <div id="lg-sub-stage"></div>
    `;

    container.querySelectorAll("[data-lgtab]").forEach((b) => {
      b.addEventListener("click", () => {
        subTab = b.dataset.lgtab;
        draw();
      });
    });

    const stage = container.querySelector("#lg-sub-stage");
    if (subTab === "review") {
      stage.innerHTML = `
        <div class="grid-2" style="margin-bottom:14px;">
          ${grammars.map((g) => `
            <div class="box-kind" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;padding:16px 18px;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
                  <strong class="ko" style="font-size:19.5px;color:var(--primary-1);">${g.pattern}</strong>
                  <span class="badge-orange">${g.meaning}</span>
                </div>
                <div style="font-size:13.5px;color:var(--text-secondary);margin-bottom:4px;">
                  <strong>Công thức:</strong> <span class="ko">${g.construction || ""}</span>
                </div>
                ${g.usage ? `<div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">${g.usage}</div>` : ""}
              </div>

              <div style="display:flex;flex-direction:column;gap:6px;">
                ${g.example1Ko ? `
                  <div style="background:var(--bg-subtle);border:1px solid var(--border-light);padding:9px 12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div>
                      <div class="ko" style="font-weight:700;font-size:15px;">${g.example1Ko}</div>
                      <div style="font-size:12.5px;color:var(--text-muted);">${g.example1Vi || ""}</div>
                    </div>
                    <button type="button" class="btn-audio" aria-label="Nghe câu ví dụ" data-play="${g.example1Audio || ""}" data-tts="${g.example1Ko}">${ico("speaker", 15)}</button>
                  </div>
                ` : ""}
                ${g.example2Ko ? `
                  <div style="background:var(--bg-subtle);border:1px solid var(--border-light);padding:9px 12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div>
                      <div class="ko" style="font-weight:700;font-size:15px;">${g.example2Ko}</div>
                      <div style="font-size:12.5px;color:var(--text-muted);">${g.example2Vi || ""}</div>
                    </div>
                    <button type="button" class="btn-audio" aria-label="Nghe câu ví dụ" data-play="${g.example2Audio || ""}" data-tts="${g.example2Ko}">${ico("speaker", 15)}</button>
                  </div>
                ` : ""}
                ${g.note ? `<div style="font-size:12px;color:var(--primary-1);margin-top:2px;">Lưu ý: ${g.note}</div>` : ""}
              </div>
            </div>
          `).join("")}
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn-primary" id="btn-go-lg-quiz">Làm ${drills.length} bài tập</button>
          <button type="button" class="btn-outline-teal" id="btn-go-lg-trans">Dịch ${translations.length} câu</button>
        </div>
      `;

      stage.querySelectorAll("[data-play]").forEach((b) => {
        b.addEventListener("click", () => {
          if (b.dataset.play) playAudio(b.dataset.play);
          else speakKoreanTTS(b.dataset.tts);
        });
      });
      stage.querySelector("#btn-go-lg-quiz")?.addEventListener("click", () => { subTab = "quiz"; draw(); });
      stage.querySelector("#btn-go-lg-trans")?.addEventListener("click", () => { subTab = "translate"; draw(); });
    } else if (subTab === "quiz") {
      renderGrammarMcqArena(stage, drills, `${bookKey}_b${lessonNum}`, {
        title: `Ngữ pháp · Quyển ${bookKey.replace("q", "")} Bài ${String(lessonNum).padStart(2, "0")}`,
        route: "theory",
        params: { sub: "grammar-list", mode: "lesson", book: bookKey, lesson: lessonNum, subTab: "quiz" }
      });
    } else {
      renderGrammarTranslationArena(stage, translations, bookKey, lessonNum, {
        key: `${bookKey}_b${lessonNum}`,
        title: `Dịch ngữ pháp · Quyển ${bookKey.replace("q", "")} Bài ${String(lessonNum).padStart(2, "0")}`,
        route: "theory",
        params: { sub: "grammar-list", mode: "lesson", book: bookKey, lesson: lessonNum, subTab: "translate" }
      });
    }
  }

  draw();
}

// ============================================================================
// 3. FULL GRAMMAR STUDIO VIEW (3 MODES: THEO BÀI · THI TOPIK · TƯƠNG ĐỒNG)
// ============================================================================
export function renderGrammarStudioView(root, db, navigate, params = {}) {
  const rawMode = params.mode || "lesson";
  const activeMode = (rawMode === "sc1" || rawMode === "lesson")
    ? "lesson"
    : (rawMode === "compare" || rawMode === "similar" ? "similar" : "topik");

  let selBook = normalizeBookId(params.book || store.state.roadmapProfile?.startBook || "q1");
  let selLesson = Number(params.lesson || 1);
  let topikTier = "all"; // all | topik1 | topik2_mid | topik2_high
  let simFilter = "all"; // all | topik1 | topik2
  let subTab = params.subTab || "review"; // review | quiz | translate

  function render() {
    const books = db.books6 || [];
    const curBookObj = getBookCurriculum(db, selBook);
    const chapters = curBookObj?.chapters || [];
    if (!chapters.some((c) => c.lesson === selLesson)) {
      selLesson = chapters[0]?.lesson || 1;
    }

    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar" style="margin-bottom:10px;">
          <button type="button" id="bc-gram-back">Giáo trình</button>
          <span>/</span>
          <span>Ngữ pháp</span>
        </div>

        <div class="skill-pills-row" style="margin-bottom:16px;">
          <button type="button" class="btn-skill ${activeMode === "lesson" ? "active" : ""}" data-gmode="lesson">
            Theo bài (Quyển 1–6)
          </button>
          <button type="button" class="btn-skill ${activeMode === "topik" ? "active" : ""}" data-gmode="topik">
            Trọng tâm TOPIK (20)
          </button>
          <button type="button" class="btn-skill ${activeMode === "similar" ? "active" : ""}" data-gmode="similar">
            Ngữ pháp tương đồng (12)
          </button>
        </div>

        <div id="gram-studio-body"></div>
      </div>
    `;

    root.querySelector("#bc-gram-back").addEventListener("click", () => navigate("theory"));
    root.querySelectorAll("[data-gmode]").forEach((b) => {
      b.addEventListener("click", () => {
        navigate("theory", { sub: "grammar-list", mode: b.dataset.gmode, book: selBook, lesson: selLesson });
      });
    });

    const body = root.querySelector("#gram-studio-body");

    // ------------------------------------------------------------------------
    // MODE 1: NGỮ PHÁP CHIA THEO TỪNG BÀI (QUYỂN 1 -> QUYỂN 6)
    // ------------------------------------------------------------------------
    if (activeMode === "lesson") {
      body.innerHTML = `
        <div class="book-tabs-bar" style="margin-bottom:10px;">
          ${books.map((b) => `
            <button type="button" class="btn-skill ${selBook === b.bookId ? "active" : ""}" data-gbook="${b.bookId}" style="padding:6px 13px;font-size:13px;">
              Quyển ${b.bookNum}
            </button>
          `).join("")}
        </div>

        <div class="book-tabs-bar" style="margin-bottom:16px;">
          ${chapters.map((ch) => `
            <button type="button" class="btn-outline-teal" data-gles="${ch.lesson}" style="padding:5px 11px;font-size:12.5px;flex-shrink:0;${selLesson === ch.lesson ? "background:var(--primary);color:#FFF;border-color:var(--primary-1);" : ""}">
              B${String(ch.lesson).padStart(2, "0")} · ${ch.title}
            </button>
          `).join("")}
        </div>

        <div id="lesson-gram-mount"></div>
      `;

      body.querySelectorAll("[data-gbook]").forEach((b) => {
        b.addEventListener("click", () => {
          selBook = b.dataset.gbook;
          selLesson = 1;
          render();
        });
      });
      body.querySelectorAll("[data-gles]").forEach((b) => {
        b.addEventListener("click", () => {
          selLesson = Number(b.dataset.gles);
          render();
        });
      });

      renderInlineLessonGrammarSection(body.querySelector("#lesson-gram-mount"), db, selBook, selLesson, subTab);
      return;
    }

    // ------------------------------------------------------------------------
    // MODE 2: NGỮ PHÁP TRỌNG TÂM ĐỀ THI TOPIK (ÔN + BÀI TẬP + DỊCH CÂU)
    // ------------------------------------------------------------------------
    if (activeMode === "topik") {
      const filtered = TOPIK_EXAM_GRAMMARS.filter((g) => topikTier === "all" || g.tier === topikTier);
      const topikDrills = filtered.map((g, idx) => {
        const tagged = g.mcq.opts.map((txt, oi) => ({ txt, isAns: oi === g.mcq.ans }));
        const sh = (idx + 1) % 4;
        const rot = [...tagged.slice(sh), ...tagged.slice(0, sh)];
        return {
          id: `tgd_${g.id}`,
          tag: g.badge,
          audio: g.audio || "",
          question: g.mcq.q,
          options: rot.map((r) => r.txt),
          answer: rot.findIndex((r) => r.isAns),
          explain: g.mcq.exp
        };
      });
      const topikTranslations = filtered.map((g) => ({
        id: `tgt_${g.id}`,
        vi: g.trans.vi,
        ko: g.trans.ko,
        audio: g.audio || "",
        grammarBadge: `Dùng: ${g.pattern}`,
        hint: `${g.meaning} · ${g.formula}`
      }));

      body.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <div class="book-tabs-bar" style="margin-bottom:0;">
            <button type="button" class="btn-outline-teal" data-ttier="all" style="padding:5px 12px;font-size:12.5px;${topikTier === "all" ? "background:var(--primary);color:#FFF;" : ""}">Tất cả (${TOPIK_EXAM_GRAMMARS.length})</button>
            <button type="button" class="btn-outline-teal" data-ttier="topik1" style="padding:5px 12px;font-size:12.5px;${topikTier === "topik1" ? "background:var(--primary);color:#FFF;" : ""}">TOPIK I</button>
            <button type="button" class="btn-outline-teal" data-ttier="topik2_mid" style="padding:5px 12px;font-size:12.5px;${topikTier === "topik2_mid" ? "background:var(--primary);color:#FFF;" : ""}">TOPIK II (Cấp 3–4)</button>
            <button type="button" class="btn-outline-teal" data-ttier="topik2_high" style="padding:5px 12px;font-size:12.5px;${topikTier === "topik2_high" ? "background:var(--primary);color:#FFF;" : ""}">TOPIK II (Cấp 5–6 &amp; Viết)</button>
          </div>

          <div class="skill-pills-row" style="margin-bottom:0;">
            <button type="button" class="btn-skill ${subTab === "review" ? "active" : ""}" data-st="review">${ico("book", 15)} Ôn (${filtered.length})</button>
            <button type="button" class="btn-skill ${subTab === "quiz" ? "active" : ""}" data-st="quiz">${ico("workbook", 15)} Bài tập (${topikDrills.length})</button>
            <button type="button" class="btn-skill ${subTab === "translate" ? "active" : ""}" data-st="translate">${ico("pen", 15)} Dịch câu (${topikTranslations.length})</button>
          </div>
        </div>

        <div id="topik-gram-stage"></div>
      `;

      body.querySelectorAll("[data-ttier]").forEach((b) => {
        b.addEventListener("click", () => { topikTier = b.dataset.ttier; render(); });
      });
      body.querySelectorAll("[data-st]").forEach((b) => {
        b.addEventListener("click", () => { subTab = b.dataset.st; render(); });
      });

      const stage = body.querySelector("#topik-gram-stage");
      if (subTab === "review") {
        stage.innerHTML = `
          <div class="grid-2">
            ${filtered.map((g) => `
              <div class="box-kind" style="padding:16px 18px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                    <strong class="ko" style="font-size:19px;color:var(--primary-1);">${g.pattern}</strong>
                    <span class="badge-orange">${g.badge}</span>
                  </div>
                  <div style="font-weight:700;font-size:14.5px;margin-bottom:4px;">${g.meaning}</div>
                  <div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px;"><span class="ko">${g.formula}</span></div>
                  <div style="font-size:12.5px;color:var(--primary-1);background:var(--primary-3);padding:6px 10px;border-radius:8px;margin-bottom:6px;">
                    ${ico("target", 14)} ${g.tip}
                  </div>
                </div>

                <div style="background:var(--bg-subtle);border:1px solid var(--border-light);padding:9px 12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <div>
                    <div class="ko" style="font-weight:700;font-size:14.5px;">${g.exKo}</div>
                    <div style="font-size:12.5px;color:var(--text-muted);">${g.exVi}</div>
                  </div>
                  <button type="button" class="btn-audio" style="width:30px;height:30px;" data-aud="${g.audio}" data-tts="${g.exKo}">${ico("speaker", 15)}</button>
                </div>
              </div>
            `).join("")}
          </div>
        `;
        stage.querySelectorAll("[data-tts]").forEach((b) => {
          b.addEventListener("click", () => {
            if (b.dataset.aud) playAudio(b.dataset.aud);
            else speakKoreanTTS(b.dataset.tts);
          });
        });
      } else if (subTab === "quiz") {
        renderGrammarMcqArena(stage, topikDrills, `topik_exam_${topikTier}`, {
          title: `Ngữ pháp trọng tâm TOPIK (${topikTier === "all" ? "Tất cả" : topikTier})`,
          route: "theory",
          params: { sub: "grammar-list", mode: "topik", subTab: "quiz" }
        });
      } else {
        renderGrammarTranslationArena(stage, topikTranslations, "q2", 1, {
          key: `topik_${topikTier}`,
          title: `Dịch ngữ pháp trọng tâm TOPIK (${topikTier === "all" ? "Tất cả" : topikTier})`,
          route: "theory",
          params: { sub: "grammar-list", mode: "topik", subTab: "translate" }
        });
      }
      return;
    }

    // ------------------------------------------------------------------------
    // MODE 3: NGỮ PHÁP TƯƠNG ĐỒNG & DỄ NHẦM (SO SÁNH + BÀI TẬP + DỊCH CÂU)
    // ------------------------------------------------------------------------
    const simList = SIMILAR_GRAMMAR_CLUSTERS.filter((c) => simFilter === "all" || c.level === simFilter);
    const simDrills = simList.map((c, idx) => {
      const tagged = c.mcq.opts.map((txt, oi) => ({ txt, isAns: oi === c.mcq.ans }));
      const sh = (idx + 2) % 4;
      const rot = [...tagged.slice(sh), ...tagged.slice(0, sh)];
      return {
        id: `simd_${c.id}`,
        tag: c.title,
        question: c.mcq.q,
        options: rot.map((r) => r.txt),
        answer: rot.findIndex((r) => r.isAns),
        explain: c.mcq.exp
      };
    });
    const simTranslations = simList.map((c) => ({
      id: `simt_${c.id}`,
      vi: c.trans.vi,
      ko: c.trans.ko,
      audio: "",
      grammarBadge: `Nhóm: ${c.title}`,
      hint: c.sameMeaning
    }));

    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
        <div class="book-tabs-bar" style="margin-bottom:0;">
          <button type="button" class="btn-outline-teal" data-sfil="all" style="padding:5px 12px;font-size:12.5px;${simFilter === "all" ? "background:var(--primary);color:#FFF;" : ""}">Tất cả (${SIMILAR_GRAMMAR_CLUSTERS.length} nhóm)</button>
          <button type="button" class="btn-outline-teal" data-sfil="topik1" style="padding:5px 12px;font-size:12.5px;${simFilter === "topik1" ? "background:var(--primary);color:#FFF;" : ""}">Sơ cấp &amp; TOPIK I</button>
          <button type="button" class="btn-outline-teal" data-sfil="topik2" style="padding:5px 12px;font-size:12.5px;${simFilter === "topik2" ? "background:var(--primary);color:#FFF;" : ""}">Trung–Cao cấp TOPIK II</button>
        </div>

        <div class="skill-pills-row" style="margin-bottom:0;">
          <button type="button" class="btn-skill ${subTab === "review" ? "active" : ""}" data-st="review">${ico("layers", 15)} So sánh (${simList.length})</button>
          <button type="button" class="btn-skill ${subTab === "quiz" ? "active" : ""}" data-st="quiz">${ico("workbook", 15)} Bài tập (${simDrills.length})</button>
          <button type="button" class="btn-skill ${subTab === "translate" ? "active" : ""}" data-st="translate">${ico("pen", 15)} Dịch câu (${simTranslations.length})</button>
        </div>
      </div>

      <div id="sim-gram-stage"></div>
    `;

    body.querySelectorAll("[data-sfil]").forEach((b) => {
      b.addEventListener("click", () => { simFilter = b.dataset.sfil; render(); });
    });
    body.querySelectorAll("[data-st]").forEach((b) => {
      b.addEventListener("click", () => { subTab = b.dataset.st; render(); });
    });

    const stage = body.querySelector("#sim-gram-stage");
    if (subTab === "review") {
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${simList.map((c) => `
            <div class="box-kind" style="padding:16px 18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
                <div>
                  <strong class="ko" style="font-size:17.5px;color:var(--primary-1);">${c.title}</strong>
                  <span style="font-size:12.5px;color:var(--text-muted);margin-left:8px;">· ${c.sameMeaning}</span>
                </div>
                <span class="badge-orange">${c.level === "topik1" ? "TOPIK I" : "TOPIK II"}</span>
              </div>

              <div class="${c.items.length >= 3 ? "grid-3" : "grid-2"}" style="gap:10px;">
                ${c.items.map((it, ii) => `
                  <div style="background:${ii % 2 === 0 ? "var(--primary-3)" : "var(--bg-subtle)"};border:1px solid var(--border-light);padding:12px 14px;border-radius:12px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                    <div>
                      <strong class="ko" style="font-size:16px;color:var(--text-main);display:block;margin-bottom:3px;">${it.pat}</strong>
                      <div style="font-size:13px;color:var(--text-secondary);">${it.diff}</div>
                    </div>
                    <div style="background:#FFFFFF;padding:8px 10px;border-radius:9px;display:flex;justify-content:space-between;align-items:center;gap:6px;">
                      <div>
                        <div class="ko" style="font-size:14px;font-weight:700;">${it.ex}</div>
                        <div style="font-size:12px;color:var(--text-muted);">${it.vi}</div>
                      </div>
                      <button type="button" class="btn-audio" style="width:28px;height:28px;" data-tts="${it.ex}">${ico("speaker", 14)}</button>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      `;
      stage.querySelectorAll("[data-tts]").forEach((b) => {
        b.addEventListener("click", () => speakKoreanTTS(b.dataset.tts));
      });
    } else if (subTab === "quiz") {
      renderGrammarMcqArena(stage, simDrills, `similar_${simFilter}`, {
        title: `Ngữ pháp tương đồng (${simFilter === "all" ? "Tất cả" : simFilter})`,
        route: "theory",
        params: { sub: "grammar-list", mode: "similar", subTab: "quiz" }
      });
    } else {
      renderGrammarTranslationArena(stage, simTranslations, "q2", 2, {
        key: `sim_${simFilter}`,
        title: `Dịch ngữ pháp tương đồng (${simFilter === "all" ? "Tất cả" : simFilter})`,
        route: "theory",
        params: { sub: "grammar-list", mode: "similar", subTab: "translate" }
      });
    }
  }

  render();
}
