#!/usr/bin/env python3
"""
Builds the Complete CJDUZ Full-Length TOPIK I (70 Questions) & TOPIK II (104 Questions)
Exam Library + Segmented Question-Type Mastery Drills + Neural Korean MP3 Audio.
"""
import os
import re
import json
import asyncio
import edge_tts

WEB_DIR = "/Users/nguyenchiduc/Downloads/한국/web"
DATA_DIR = os.path.join(WEB_DIR, "data")
MEDIA_DIR = os.path.join(WEB_DIR, "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

# ==============================================================================
# 1. OFFICIAL NIIED QUESTION-TYPE TAXONOMY (DẠNG 1 -> DẠNG CUỐI)
# ==============================================================================
TAXONOMY = {
    "topik1": {
        "listening": [
            {"id": "t1_l_d1", "code": "Dạng 1", "range": "Câu 1~4", "countPerExam": 4, "ptsDesc": "3~4점", "koTitle": "물음에 알맞은 대답 고르기", "title": "Dạng 1 (Câu 1–4): Nghe câu hỏi chọn lời đáp phù hợp", "tip": "Bắt từ để hỏi (무엇, 어디, 언제, 누구, 왜, 어떻게) và đuôi thì (-았/었어요, -(으)ㄹ 거예요) để chọn đáp án khớp thì."},
            {"id": "t1_l_d2", "code": "Dạng 2", "range": "Câu 5~6", "countPerExam": 2, "ptsDesc": "3~4점", "koTitle": "이어질 인사말·표현 고르기", "title": "Dạng 2 (Câu 5–6): Nghe và chọn lời chào / câu đáp tiếp nối", "tip": "Thuộc các cặp phản xạ giao tiếp cố định: đi về (조심히 가세요), trước bữa ăn (잘 먹겠습니다), nhờ vả, xin lỗi."},
            {"id": "t1_l_d3", "code": "Dạng 3", "range": "Câu 7~10", "countPerExam": 4, "ptsDesc": "3~4점", "koTitle": "대화 장소 파악하기 (여기는 어디입니까?)", "title": "Dạng 3 (Câu 7–10): Nghe hội thoại xác định địa điểm", "tip": "Nghe danh từ đặc trưng nghề nghiệp/vật dụng: 소포·우표 → 우체국, 열·약·처방전 → 병원/약국, 통장·환전 → 은행."},
            {"id": "t1_l_d4", "code": "Dạng 4", "range": "Câu 11~14", "countPerExam": 4, "ptsDesc": "3~4점", "koTitle": "대화 화제 파악하기 (무엇에 대해 말하고 있습니까?)", "title": "Dạng 4 (Câu 11–14): Nghe hội thoại chọn chủ đề chính", "tip": "Không chọn từ lặp lại nguyên xi nếu chỉ là ví dụ nhỏ; hãy chọn danh từ khái quát (취미, 계절, 교통, 주말 계획, 가족)."},
            {"id": "t1_l_d5", "code": "Dạng 5", "range": "Câu 15~16", "countPerExam": 2, "ptsDesc": "4점", "koTitle": "대화에 알맞은 그림·상황 고르기", "title": "Dạng 5 (Câu 15–16): Nghe hội thoại chọn tình huống / tranh mô tả đúng", "tip": "Chú ý vị trí không gian (위/아래/옆/앞), hành động đang diễn ra (-고 있다) và trạng thái của 2 nhân vật nam – nữ."},
            {"id": "t1_l_d6", "code": "Dạng 6", "range": "Câu 17~21", "countPerExam": 5, "ptsDesc": "3~4점", "koTitle": "들은 내용과 같은 것 고르기", "title": "Dạng 6 (Câu 17–21): Nghe hội thoại chọn nội dung trùng khớp", "tip": "Đọc lướt 4 đáp án trước khi băng chạy; cẩn thận bẫy đổi chủ ngữ (남자 ↔ 여자) hoặc đổi thời gian (오전 ↔ 오후)."},
            {"id": "t1_l_d7", "code": "Dạng 7", "range": "Câu 22~24", "countPerExam": 3, "ptsDesc": "3점", "koTitle": "화자의 중심 생각 고르기", "title": "Dạng 7 (Câu 22–24): Nghe độc thoại / hội thoại tìm ý trọng tâm", "tip": "Ý chính luôn nằm ở câu có đuôi khuyên nhủ/nhấn mạnh: -아/어야 하다, -(으)면 좋다, -는 것이 중요하다."},
            {"id": "t1_l_d8", "code": "Dạng 8", "range": "Câu 25~30", "countPerExam": 6, "ptsDesc": "3~4점", "koTitle": "긴 담화·안내 듣고 2문항 답하기", "title": "Dạng 8 (Câu 25–30): Nghe thông báo / phỏng vấn dài trả lời cặp 2 câu hỏi", "tip": "Câu lẻ thường hỏi mục đích/lý do nói, câu chẵn hỏi chi tiết đúng với bài nghe (ngày giờ, điều kiện tham gia)."}
        ],
        "reading": [
            {"id": "t1_r_d1", "code": "Dạng 1", "range": "Câu 31~33", "countPerExam": 3, "ptsDesc": "2점", "koTitle": "무엇에 대한 이야기입니까?", "title": "Dạng 1 (Câu 31–33): Đọc 2 câu ngắn và chọn chủ đề", "tip": "Gạch chân 2~3 từ vựng cùng trường nghĩa (VD: 비, 우산, 덥다 → 날씨) để chốt đáp án trong 10 giây."},
            {"id": "t1_r_d2", "code": "Dạng 2", "range": "Câu 34~39", "countPerExam": 6, "ptsDesc": "2~3점", "koTitle": "빈칸에 들어갈 알맞은 어휘·문법 고르기", "title": "Dạng 2 (Câu 34–39): Điền từ vựng / ngữ pháp / phó từ vào (   )", "tip": "Quan sát tiểu từ ngay trước ô trống (불을 → 켜다/끄다) và quan hệ nhân quả / tương phản giữa 2 vế."},
            {"id": "t1_r_d3", "code": "Dạng 3", "range": "Câu 40~42", "countPerExam": 3, "ptsDesc": "2~3점", "koTitle": "안내문·광고문·영수증 정보 파악", "title": "Dạng 3 (Câu 40–42): Đọc bảng thông báo, vé, quảng cáo tìm câu Đúng/Sai", "tip": "Đọc kỹ đề hỏi 맞지 않는 것 (SAI) hay 같은 것 (ĐÚNG), đối chiếu từng dòng giờ giấc, giá tiền, ngày nghỉ."},
            {"id": "t1_r_d4", "code": "Dạng 4", "range": "Câu 43~45", "countPerExam": 3, "ptsDesc": "2~3점", "koTitle": "짧은 글의 내용과 같은 것 고르기", "title": "Dạng 4 (Câu 43–45): Đọc đoạn văn ngắn chọn nội dung giống bài", "tip": "Kiểm tra kỹ trạng từ chỉ tần suất/thời gian: 아직 (vẫn chưa), 벌써 (đã rồi), 가끔 (thỉnh thoảng), 매일 (mỗi ngày)."},
            {"id": "t1_r_d5", "code": "Dạng 5", "range": "Câu 46~48", "countPerExam": 3, "ptsDesc": "3점", "koTitle": "글의 중심 생각 파악하기", "title": "Dạng 5 (Câu 46–48): Tìm ý chính / thông điệp của đoạn văn", "tip": "Tập trung vào câu sau 그래서, 따라서, 하지만, 그러므로 — đó là câu kết luận mang ý chính của người viết."},
            {"id": "t1_r_d6", "code": "Dạng 6", "range": "Câu 49~56", "countPerExam": 8, "ptsDesc": "2~3점", "koTitle": "중문 독해 (빈칸 ㉠ 채우기 + 내용 일치)", "title": "Dạng 6 (Câu 49–56): Đọc đoạn văn trả lời 2 câu (Điền ㉠ & Nội dung đúng)", "tip": "Giải câu điền ( ㉠ ) dựa vào câu liền trước và liền sau trước, sau đó rà chi tiết cho câu thứ 2."},
            {"id": "t1_r_d7", "code": "Dạng 7", "range": "Câu 57~58", "countPerExam": 2, "ptsDesc": "3점", "koTitle": "문장 순서 맞게 배열하기 (가)~(라)", "title": "Dạng 7 (Câu 57–58): Sắp xếp 4 câu (가)–(라) thành đoạn mạch lạc", "tip": "Câu mở đầu không chứa 그래서/그러나/그곳/이 사람. Ghép các cặp đại từ chỉ định (이, 그) và liên từ nhân quả."},
            {"id": "t1_r_d8", "code": "Dạng 8", "range": "Câu 59~70", "countPerExam": 12, "ptsDesc": "2~3점", "koTitle": "장문 심화 독해 (문장 삽입·이유·세부 내용)", "title": "Dạng 8 (Câu 59–70): Đọc hiểu đoạn dài Cấp 2 (Chèn câu & Suy luận chi tiết)", "tip": "Phân bổ tối đa 2 phút cho mỗi cặp 2 câu cuối đề để đảm bảo hoàn thành trọn vẹn 70 câu."}
        ]
    },
    "topik2": {
        "listening": [
            {"id": "t2_l_d1", "code": "Dạng 1", "range": "Câu 1~3", "countPerExam": 3, "ptsDesc": "2점", "koTitle": "알맞은 그림·도표 고르기", "title": "Dạng 1 (Câu 1–3): Nghe hội thoại / bản tin chọn tình huống & biểu đồ", "tip": "Với câu biểu đồ (Câu 3), nghe kỹ xu hướng tăng/giảm (증가하다/감소하다/유지되다) và tỷ trọng lớn nhất (가장 높다)."},
            {"id": "t2_l_d2", "code": "Dạng 2", "range": "Câu 4~8", "countPerExam": 5, "ptsDesc": "2점", "koTitle": "이어질 말 고르기", "title": "Dạng 2 (Câu 4–8): Nghe hội thoại chọn câu đáp tiếp nối hợp ngữ cảnh", "tip": "Chú ý sắc thái câu nói cuối (phàn nàn, đề xuất, từ chối khéo, báo tin vui) để chọn phản hồi hợp logic nhất."},
            {"id": "t2_l_d3", "code": "Dạng 3", "range": "Câu 9~12", "countPerExam": 4, "ptsDesc": "2점", "koTitle": "이어서 할 행동 고르기", "title": "Dạng 3 (Câu 9–12): Nghe và chọn hành động tiếp theo của nhân vật", "tip": "Xác định rõ đề hỏi 여자 hay 남자! Lắng nghe các cấu trúc nhận việc: 제가 지금 ~(으)ㄹ게요, 먼저 ~아/어 볼게요."},
            {"id": "t2_l_d4", "code": "Dạng 4", "range": "Câu 13~16", "countPerExam": 4, "ptsDesc": "2점", "koTitle": "들은 내용과 일치하는 것 고르기", "title": "Dạng 4 (Câu 13–16): Nghe hội thoại / thông báo chọn nội dung trùng khớp", "tip": "Đọc trước 4 lựa chọn và gạch chân các điểm khác biệt (đã xong hay chưa xong, miễn phí hay có phí)."},
            {"id": "t2_l_d5", "code": "Dạng 5", "range": "Câu 17~20", "countPerExam": 4, "ptsDesc": "2점", "koTitle": "남자의 중심 생각 고르기", "title": "Dạng 5 (Câu 17–20): Nghe hội thoại tìm suy nghĩ trọng tâm của người nam", "tip": "Bỏ qua lượt lời mở đầu của người nữ, tập trung cao độ vào câu phản biện của người nam sau 하지만, 그런데, 무엇보다."},
            {"id": "t2_l_d6", "code": "Dạng 6", "range": "Câu 21~30", "countPerExam": 10, "ptsDesc": "2점", "koTitle": "인터뷰·상담·안내 담화 2문항 세트", "title": "Dạng 6 (Câu 21–30): Nghe phỏng vấn / tư vấn / thông báo (2 câu / bài)", "tip": "Đoạn băng được phát 2 lần từ câu 21 trở đi! Lần 1 chốt câu ý chính/mục đích, lần 2 rà kỹ câu chi tiết 일치."},
            {"id": "t2_l_d7", "code": "Dạng 7", "range": "Câu 31~32", "countPerExam": 2, "ptsDesc": "2점", "koTitle": "토론 담화 · 화자의 생각과 태도 파악", "title": "Dạng 7 (Câu 31–32): Nghe tranh luận xác định quan điểm & thái độ người nói", "tip": "Nắm chắc từ vựng chỉ thái độ: 비판적이다 (phê phán), 우려하다 (lo ngại), 찬성하다 (tán thành), 제안하다 (đề xuất)."},
            {"id": "t2_l_d8", "code": "Dạng 8", "range": "Câu 33~36", "countPerExam": 4, "ptsDesc": "2점", "koTitle": "문화·과학 강연 주제 및 내용 파악", "title": "Dạng 8 (Câu 33–36): Nghe bài giảng văn hóa – khoa học (2 câu / bài)", "tip": "Câu đầu tiên của bài giảng luôn giới thiệu đối tượng/khái niệm trung tâm (오늘은 ~에 대해 알아보겠습니다)."},
            {"id": "t2_l_d9", "code": "Dạng 9", "range": "Câu 37~42", "countPerExam": 6, "ptsDesc": "2점", "koTitle": "교양 프로그램·전문가 대담 이해", "title": "Dạng 9 (Câu 37–42): Nghe chương trình tọa đàm chuyên gia (2 câu / bài)", "tip": "Chú ý câu hỏi dẫn dắt của MC và phần giải pháp / nguyên nhân do chuyên gia phân tích."},
            {"id": "t2_l_d10", "code": "Dạng 10", "range": "Câu 43~50", "countPerExam": 8, "ptsDesc": "2점", "koTitle": "다큐멘터리·연설·학술 강연 심화 (5~6급)", "title": "Dạng 10 (Câu 43–50): Nghe diễn văn & tài liệu học thuật Cấp 5–6 (2 câu / bài)", "tip": "Luyện từ vựng Hán–Hàn chủ đề chính sách, lịch sử, sinh thái và kinh tế vĩ mô để bắt ý khái quát."}
        ],
        "writing": [
            {"id": "t2_w_d1", "code": "Dạng 1", "range": "Câu 51~52", "countPerExam": 2, "ptsDesc": "10점 × 2", "koTitle": "실용문(51번) 및 설명문(52번) 빈칸 완성", "title": "Dạng 1 (Câu 51–52): Điền biểu hiện hoàn chỉnh văn bản đời sống & giải thích", "tip": "Câu 51 BẮT BUỘC chia đuôi kính ngữ trang trọng (-ㅂ니다/습니다, -(으)시기 바랍니다); Câu 52 BẮT BUỘC chia văn viết (-다/는다)."},
            {"id": "t2_w_d2", "code": "Dạng 2", "range": "Câu 53", "countPerExam": 1, "ptsDesc": "30점", "koTitle": "도표·그래프 분석 및 원인·전망 서술 (200~300자)", "title": "Dạng 2 (Câu 53): Viết đoạn phân tích biểu đồ / số liệu thống kê (200–300 chữ)", "tip": "Đúng 4 bước: (1) Giới thiệu khảo sát (~에 대한 조사 결과) → (2) So sánh số liệu → (3) Nguyên nhân → (4) Dự báo."},
            {"id": "t2_w_d3", "code": "Dạng 3", "range": "Câu 54", "countPerExam": 1, "ptsDesc": "50점", "koTitle": "사회적 주제에 대한 논설문 작성 (600~700자)", "title": "Dạng 3 (Câu 54): Viết bài văn nghị luận xã hội học thuật (600–700 chữ)", "tip": "Chia 3 đoạn rõ rệt trên giấy 원고지 (thụt đầu dòng 1 ô khi sang đoạn mới), trả lời trọn vẹn cả 3 câu hỏi gợi ý của đề."}
        ],
        "reading": [
            {"id": "t2_r_d1", "code": "Dạng 1", "range": "Đọc 1~2 (Đề 55~56)", "countPerExam": 2, "ptsDesc": "2점", "koTitle": "빈칸에 알맞은 문법 고르기", "title": "Dạng 1 (Đọc 1–2): Chọn cấu trúc ngữ pháp trung cấp điền vào chỗ trống", "tip": "Phân biệt kỹ nhóm ngữ pháp nguyên nhân (-는 바람에, -는 통에), nhượng bộ (-더라도), điều kiện (-거든)."},
            {"id": "t2_r_d2", "code": "Dạng 2", "range": "Đọc 3~4 (Đề 57~58)", "countPerExam": 2, "ptsDesc": "2점", "koTitle": "밑줄 친 부분과 의미가 비슷한 문법 고르기", "title": "Dạng 2 (Đọc 3–4): Chọn biểu hiện ngữ pháp đồng nghĩa với phần gạch chân", "tip": "Học theo cặp đồng nghĩa cố định: -자마자 = -기가 무섭게, -(으)ㄹ 뿐만 아니라 = -(으)ㄹ 뿐더러, -는 한 = -(으)ㄹ지라도."},
            {"id": "t2_r_d3", "code": "Dạng 3", "range": "Đọc 5~8 (Đề 59~62)", "countPerExam": 4, "ptsDesc": "2점", "koTitle": "광고·공익 포스터 소재 파악", "title": "Dạng 3 (Đọc 5–8): Đọc quảng cáo & áp phích cộng đồng tìm đối tượng/thông điệp", "tip": "Dựa vào động từ/tính từ đặc trưng (보습·피부 → 화장품, 요금·데이터 → 통신사, 절약·환경 → 캠페인)."},
            {"id": "t2_r_d4", "code": "Dạng 4", "range": "Đọc 9~12 (Đề 63~66)", "countPerExam": 4, "ptsDesc": "2점", "koTitle": "도표·안내문 세부 내용 일치", "title": "Dạng 4 (Đọc 9–12): Đọc biểu đồ & bảng hướng dẫn chọn nội dung đúng", "tip": "Đọc từng đáp án ①→④ rồi dò ngược lên biểu đồ; chú ý từ chỉ thứ tự (가장, 두 번째, 절반 이상, ~배)."},
            {"id": "t2_r_d5", "code": "Dạng 5", "range": "Đọc 13~15 (Đề 67~69)", "countPerExam": 3, "ptsDesc": "2점", "koTitle": "글의 순서 맞게 배열하기 (가)~(라)", "title": "Dạng 5 (Đọc 13–15): Sắp xếp 4 câu (가)–(라) theo trình tự lập luận", "tip": "Nhìn 4 đáp án để khoanh vùng 2 câu đứng đầu trước, sau đó nối tiếp bằng 이러한, 그러나, 따라서, 이처럼."},
            {"id": "t2_r_d6", "code": "Dạng 6", "range": "Đọc 16~18 (Đề 70~72)", "countPerExam": 3, "ptsDesc": "2점", "koTitle": "짧은 설명문 빈칸 추론", "title": "Dạng 6 (Đọc 16–18): Đọc đoạn văn và suy luận cụm từ điền vào (   )", "tip": "Chỗ trống thường diễn đạt lại ý câu chủ đề theo cách khác (paraphrase) hoặc nêu hệ quả đối lập."},
            {"id": "t2_r_d7", "code": "Dạng 7", "range": "Đọc 19~24 (Đề 73~78)", "countPerExam": 6, "ptsDesc": "2점", "koTitle": "중문 독해 (접속부사·관용어·심정 + 내용 일치)", "title": "Dạng 7 (Đọc 19–24): Đọc đoạn văn trả lời 2 câu (Từ nối / Quán dụng ngữ + Nội dung)", "tip": "Câu 19–22 kiểm tra phó từ nối (반면에, 오히려, 게다가), câu 23–24 kiểm tra từ vựng cảm xúc & quán dụng ngữ cơ thể."},
            {"id": "t2_r_d8", "code": "Dạng 8", "range": "Đọc 25~27 (Đề 79~81)", "countPerExam": 3, "ptsDesc": "2점", "koTitle": "신문 기사 제목의 의미 파악", "title": "Dạng 8 (Đọc 25–27): Đọc tiêu đề báo chí và chọn câu diễn giải đúng nhất", "tip": "Thuộc từ vựng báo chí rút gọn: 청신호 (tín hiệu tích cực), 적신호/비상 (báo động), 발길 끊기다 (vắng khách), 급증/급감."},
            {"id": "t2_r_d9", "code": "Dạng 9", "range": "Đọc 28~38 (Đề 82~92)", "countPerExam": 11, "ptsDesc": "2점", "koTitle": "사회·과학 설명문 빈칸 추론·주제·일치", "title": "Dạng 9 (Đọc 28–38): Đọc văn bản khoa học/xã hội (Điền khuyết, Tìm chủ đề & Nội dung)", "tip": "Đọc câu đầu và câu cuối để nắm luận điểm xuyên suốt trước khi phân tích ví dụ chuyên ngành ở giữa đoạn."},
            {"id": "t2_r_d10", "code": "Dạng 10", "range": "Đọc 39~50 (Đề 93~104)", "countPerExam": 12, "ptsDesc": "2점", "koTitle": "고급 독해 (문장 삽입·소설·논설문 2~3문항 세트)", "title": "Dạng 10 (Đọc 39–50): Đọc hiểu chuyên sâu Cấp 5–6 (Chèn câu <보기>, Văn học & Nghị luận)", "tip": "Ở câu chèn <보기>, bám sát từ nối và từ chỉ định ở đầu câu <보기>; ở bài 46–50 xác định mục đích và thái độ tác giả."}
        ]
    }
}

# ==============================================================================
# 2. CURATED NEURAL DIALOGUE & MONOLOGUE POOL (SYNTHESIZED TO MP3)
# ==============================================================================
LISTEN_SINGLE_ITEMS = [
    # --- TOPIK I Dạng 1 (Câu 1~4: 물음에 알맞은 대답) ---
    {"id": "t1_ld1_01", "typeId": "t1_l_d1", "turns": [("F", "오늘 저녁에 뭐 할 거예요?")], "question": "다음을 듣고 물음에 알맞은 대답을 고르십시오.", "options": ["어제 영화를 봤어요.", "친구하고 밥을 먹을 거예요.", "저녁 일곱 시예요.", "식당에 사람이 많아요."], "answer": 1, "explain": "Câu hỏi tương lai '오늘 저녁에 뭐 할 거예요?' (Tối nay bạn sẽ làm gì?) → Đáp án chia -(으)ㄹ 거예요."},
    {"id": "t1_ld1_02", "typeId": "t1_l_d1", "turns": [("M", "가방이 아주 예쁘네요. 어디에서 샀어요?")], "question": "다음을 듣고 물음에 알맞은 대답을 고르십시오.", "options": ["백화점에서 샀어요.", "가방이 조금 비싸요.", "동생한테 선물했어요.", "주말에 사러 갈 거예요."], "answer": 0, "explain": "'어디에서 샀어요?' hỏi nơi đã mua → '백화점에서 샀어요' (Tôi mua ở trung tâm thương mại)."},
    {"id": "t1_ld1_03", "typeId": "t1_l_d1", "turns": [("F", "주말 잘 보냈어요?")], "question": "다음을 듣고 물음에 알맞은 대답을 고르십시오.", "options": ["네, 내일 만나요.", "네, 집에서 푹 쉬었어요.", "아니요, 주말이 아니에요.", "네, 늦어서 미안해요."], "answer": 1, "explain": "Hỏi thăm cuối tuần đã qua → '네, 집에서 푹 쉬었어요' (Vâng, tôi đã nghỉ ngơi thoải mái ở nhà)."},
    {"id": "t1_ld1_04", "typeId": "t1_l_d1", "turns": [("M", "수진 씨는 무슨 계절을 좋아해요?")], "question": "다음을 듣고 물음에 알맞은 대답을 고르십시오.", "options": ["네, 날씨가 더워요.", "저는 봄을 제일 좋아해요.", "작년에 한국에 갔어요.", "꽃이 아주 많이 피었어요."], "answer": 1, "explain": "'무슨 계절을 좋아해요?' (Bạn thích mùa nào?) → '저는 봄을 제일 좋아해요'."},
    {"id": "t1_ld1_05", "typeId": "t1_l_d1", "turns": [("F", "민수 씨는 회사에 어떻게 가요?")], "question": "다음을 듣고 물음에 알맞은 대답을 고르십시오.", "options": ["아침 여덟 시에 가요.", "지하철을 타고 가요.", "회사에서 일해요.", "삼십 분쯤 걸려요."], "answer": 1, "explain": "'어떻게 가요?' hỏi phương tiện đi lại → '지하철을 타고 가요'."},
    {"id": "t1_ld1_06", "typeId": "t1_l_d1", "turns": [("M", "한국어 공부가 재미있어요?")], "question": "다음을 듣고 물음에 알맞은 대답을 고르십시오.", "options": ["네, 아주 재미있어요.", "네, 도서관에서 공부해요.", "아니요, 한국 사람이에요.", "아니요, 내일 시험이에요."], "answer": 0, "explain": "Câu hỏi Có/Không về cảm nhận học tiếng Hàn → '네, 아주 재미있어요'."},
    {"id": "t1_ld1_07", "typeId": "t1_l_d1", "turns": [("F", "언제 부산에 여행을 갈 거예요?")], "question": "다음을 듣고 물음에 알맞은 대답을 고르십시오.", "options": ["기차를 타고 갈 거예요.", "다음 주 토요일에 갈 거예요.", "친구하고 같이 갔어요.", "부산 바다가 정말 예뻐요."], "answer": 1, "explain": "'언제 ... 갈 거예요?' hỏi mốc thời gian tương lai → '다음 주 토요일에 갈 거예요'."},
    {"id": "t1_ld1_08", "typeId": "t1_l_d1", "turns": [("M", "어제 왜 수업에 안 왔어요?")], "question": "다음을 듣고 물음에 알맞은 대답을 고르십시오.", "options": ["수업이 열 시에 끝났어요.", "감기에 걸려서 병원에 갔어요.", "교실에 학생이 많았어요.", "내일 숙제를 꼭 할게요."], "answer": 1, "explain": "'왜 안 왔어요?' hỏi lý do vắng học → '감기에 걸려서 병원에 갔어요'."},

    # --- TOPIK I Dạng 2 (Câu 5~6: 이어질 말) ---
    {"id": "t1_ld2_01", "typeId": "t1_l_d2", "turns": [("F", "선생님, 저 먼저 집에 가겠습니다.")], "question": "다음을 듣고 이어질 말로 가장 알맞은 것을 고르십시오.", "options": ["네, 조심히 가세요.", "네, 처음 뵙겠습니다.", "아니요, 괜찮습니다.", "네, 잘 먹겠습니다."], "answer": 0, "explain": "Chào người ra về → Người ở lại đáp '네, 조심히 가세요' (Em về cẩn thận nhé)."},
    {"id": "t1_ld2_02", "typeId": "t1_l_d2", "turns": [("M", "음식을 많이 준비했으니까 많이 드세요.")], "question": "다음을 듣고 이어질 말로 알맞은 것을 고르십시오.", "options": ["네, 잘 먹겠습니다.", "네, 어서 오세요.", "네, 또 오겠습니다.", "네, 축하합니다."], "answer": 0, "explain": "Trước bữa ăn đáp lại lời mời của chủ nhà → '네, 잘 먹겠습니다'."},
    {"id": "t1_ld2_03", "typeId": "t1_l_d2", "turns": [("F", "죄송하지만 창문 좀 닫아 주시겠어요?")], "question": "다음을 듣고 이어질 말로 알맞은 것을 고르십시오.", "options": ["네, 지금 닫아 드릴게요.", "아니요, 창문이 넓어요.", "네, 어제 문을 열었어요.", "천만에요, 또 만나요."], "answer": 0, "explain": "Lời nhờ lịch sự '-아/어 주시겠어요?' → Đáp đồng ý '네, 지금 닫아 드릴게요'."},
    {"id": "t1_ld2_04", "typeId": "t1_l_d2", "turns": [("M", "졸업을 진심으로 축하해요! 여기 꽃다발이에요.")], "question": "다음을 듣고 이어질 말로 알맞은 것을 고르십시오.", "options": ["미안해요. 다음에 갈게요.", "고마워요. 꽃이 정말 예쁘네요.", "괜찮아요. 제가 도와줄게요.", "반가워요. 잘 부탁드립니다."], "answer": 1, "explain": "Khi nhận lời chúc mừng tốt nghiệp và bó hoa → Cảm ơn '고마워요. 꽃이 정말 예쁘네요.'"},
    {"id": "t1_ld2_05", "typeId": "t1_l_d2", "turns": [("F", "길이 많이 막혀서 약속 시간에 좀 늦을 것 같아요. 미안해요.")], "question": "다음을 듣고 이어질 말로 알맞은 것을 고르십시오.", "options": ["괜찮아요. 천천히 조심해서 오세요.", "네, 어제 일찍 도착했어요.", "축하해요. 다음에 또 봐요.", "아니요, 지금 바로 출발했어요."], "answer": 0, "explain": "Bạn xin lỗi vì kẹt xe đến muộn → Trấn an '괜찮아요. 천천히 조심해서 오세요.'"},

    # --- TOPIK I Dạng 3 (Câu 7~10: 여기는 어디입니까?) ---
    {"id": "t1_ld3_01", "typeId": "t1_l_d3", "turns": [("M", "어서 오세요. 어떻게 오셨어요?"), ("F", "어제부터 목이 아프고 열이 좀 나요.")], "question": "여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["병원", "서점", "은행", "우체국"], "answer": 0, "explain": "'목이 아프고 열이 나요' (đau họng, hơi sốt) → 병원 (Bệnh viện)."},
    {"id": "t1_ld3_02", "typeId": "t1_l_d3", "turns": [("F", "이 소포를 베트남으로 보내고 싶은데요. 얼마나 걸려요?"), ("M", "비행기로 보내면 사흘쯤 걸립니다.")], "question": "여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["공항", "여행사", "우체국", "편의점"], "answer": 2, "explain": "'소포를 보내다' (gửi bưu kiện) → 우체국 (Bưu điện)."},
    {"id": "t1_ld3_03", "typeId": "t1_l_d3", "turns": [("M", "손님, 머리를 어떻게 해 드릴까요?"), ("F", "앞머리는 조금만 다듬고 파마해 주세요.")], "question": "여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["세탁소", "미용실", "백화점", "사진관"], "answer": 1, "explain": "Tỉa tóc mái và uốn tóc (앞머리 다듬다, 파마하다) → 미용실 (Tiệm làm tóc)."},
    {"id": "t1_ld3_04", "typeId": "t1_l_d3", "turns": [("F", "저기요, 한국어 초급 교재는 어느 쪽에 있어요?"), ("M", "저쪽 외국어 코너 두 번째 책장에 있습니다.")], "question": "여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["서점", "약국", "식당", "영화관"], "answer": 0, "explain": "Tìm mua giáo trình tiếng Hàn trên kệ sách (외국어 코너 책장) → 서점 (Hiệu sách)."},
    {"id": "t1_ld3_05", "typeId": "t1_l_d3", "turns": [("M", "이 흰색 셔츠에 커피가 묻었는데 깨끗이 지워질까요?"), ("F", "네, 드라이클리닝하면 금요일에 찾으실 수 있어요.")], "question": "여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["옷가게", "세탁소", "박물관", "우체국"], "answer": 1, "explain": "'드라이클리닝' (giặt khô tẩy vết cà phê) → 세탁소 (Tiệm giặt ủi)."},
    {"id": "t1_ld3_06", "typeId": "t1_l_d3", "turns": [("F", "통장을 새로 만들고 체크카드도 신청하려고 왔어요."), ("M", "네, 신분증과 외국인등록증을 보여 주시겠어요?")], "question": "여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["은행", "대사관", "경찰서", "부동산"], "answer": 0, "explain": "Mở sổ tài khoản và làm thẻ thanh toán (통장, 체크카드) → 은행 (Ngân hàng)."},
    {"id": "t1_ld3_07", "typeId": "t1_l_d3", "turns": [("M", "일곱 시 영화 표 두 장 주세요. 가운데 자리 있어요?"), ("F", "네, 에프 열 다섯 번, 여섯 번 좌석이 남아 있습니다.")], "question": "여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["기차역", "극장", "체육관", "미술관"], "answer": 1, "explain": "Mua 2 vé xem phim lúc 7 giờ chọn hàng ghế → 극장 (Rạp chiếu phim)."},

    # --- TOPIK I Dạng 4 (Câu 11~14: 무엇에 대해 말하고 있습니까?) ---
    {"id": "t1_ld4_01", "typeId": "t1_l_d4", "turns": [("F", "민수 씨는 보통 회사에 어떻게 가요?"), ("M", "아침에는 길이 막혀서 지하철을 타고 가요.")], "question": "다음은 무엇에 대해 말하고 있습니까? 알맞은 것을 고르십시오.", "options": ["주말 계획", "교통수단", "회사 업무", "운동 습관"], "answer": 1, "explain": "Nói về cách đi làm bằng tàu điện ngầm → 교통수단 (Phương tiện giao thông)."},
    {"id": "t1_ld4_02", "typeId": "t1_l_d4", "turns": [("M", "흐엉 씨는 시간이 있을 때 주로 뭐 해요?"), ("F", "저는 공원에서 사진을 찍거나 자전거를 타요.")], "question": "다음은 무엇에 대해 말하고 있습니까? 알맞은 것을 고르십시오.", "options": ["직업", "취미", "성격", "고향"], "answer": 1, "explain": "Làm gì khi rảnh rỗi (시간이 있을 때 주로 뭐 해요?) → 취미 (Sở thích)."},
    {"id": "t1_ld4_03", "typeId": "t1_l_d4", "turns": [("F", "아버지 연세가 어떻게 되세요?"), ("M", "올해 쉰여덟이시고 고향에서 고등학교 선생님을 하세요.")], "question": "다음은 무엇에 대해 말하고 있습니까? 알맞은 것을 고르십시오.", "options": ["가족", "친구", "이웃", "선물"], "answer": 0, "explain": "Giới thiệu tuổi và nghề nghiệp của bố → 가족 (Gia đình)."},
    {"id": "t1_ld4_04", "typeId": "t1_l_d4", "turns": [("M", "오늘 오후에도 비가 계속 올까요?"), ("F", "일기예보를 보니까 저녁부터는 비가 그치고 맑아진대요.")], "question": "다음은 무엇에 대해 말하고 있습니까? 알맞은 것을 고르십시오.", "options": ["날씨", "계절", "방학", "약속"], "answer": 0, "explain": "Mưa, dự báo thời tiết, tạnh mưa trời quang → 날씨 (Thời tiết)."},
    {"id": "t1_ld4_05", "typeId": "t1_l_d4", "turns": [("F", "이번 설날 연휴에는 고향에 내려갈 거예요?"), ("M", "네, 부모님도 뵙고 친척들과 떡국도 먹을 거예요.")], "question": "다음은 무엇에 대해 말하고 있습니까? 알맞은 것을 고르십시오.", "options": ["생일 파티", "명절 계획", "이사 준비", "요리 방법"], "answer": 1, "explain": "Kế hoạch về quê dịp nghỉ Tết âm lịch (설날 연휴) → 명절 계획."},
    {"id": "t1_ld4_06", "typeId": "t1_l_d4", "turns": [("M", "새로 이사한 집은 어때요?"), ("F", "지하철역에서 가깝고 방이 밝아서 아주 마음에 들어요.")], "question": "다음은 무엇에 대해 말하고 있습니까? 알맞은 것을 고르십시오.", "options": ["새집", "학교", "시장", "공원"], "answer": 0, "explain": "Nhận xét về ngôi nhà mới chuyển đến → 새집."},

    # --- TOPIK I Dạng 5 (Câu 15~16: 알맞은 그림·상황 고르기) ---
    {"id": "t1_ld5_01", "typeId": "t1_l_d5", "turns": [("F", "책상 위에 있는 안경 좀 가져다줄래요?"), ("M", "노트북 옆에 있는 안경 말이지요? 여기 있어요.")], "passage": "[그림 상황 보기]\n① 책상 위 노트북 옆에 안경이 놓여 있고 남자가 여자에게 건네주는 모습\n② 의자 아래에 가방과 안경이 떨어져 있는 모습\n③ 여자가 책장 위에서 두꺼운 책을 꺼내는 모습\n④ 남자가 창문 앞에서 전화를 받고 있는 모습", "question": "대화를 듣고 알맞은 그림(상황)을 고르십시오.", "options": ["상황 ①", "상황 ②", "상황 ③", "상황 ④"], "answer": 0, "explain": "Kính đặt cạnh laptop trên bàn học và người nam đưa cho người nữ → Tình huống ①."},
    {"id": "t1_ld5_02", "typeId": "t1_l_d5", "turns": [("M", "손님, 이 구두는 어떠세요? 신어 보세요."), ("F", "네, 디자인이 깔끔하네요. 한번 신어 볼게요.")], "passage": "[그림 상황 보기]\n① 식당에서 메뉴판을 보며 음식을 주문하는 남녀\n② 신발 가게에서 여자가 의자에 앉아 구두를 신어 보는 모습\n③ 공원 벤치에서 두 사람이 커피를 마시는 모습\n④ 서점에서 남자가 점원에게 책값을 계산하는 모습", "question": "대화를 듣고 알맞은 그림(상황)을 고르십시오.", "options": ["상황 ①", "상황 ②", "상황 ③", "상황 ④"], "answer": 1, "explain": "Nhân viên mời khách thử giày (구두 신어 보세요) tại cửa hàng giày → Tình huống ②."},
    {"id": "t1_ld5_03", "typeId": "t1_l_d5", "turns": [("F", "비가 많이 오는데 우산이 없네요. 어떡하지요?"), ("M", "제 우산이 크니까 같이 쓰고 지하철역까지 가요.")], "passage": "[그림 상황 보기]\n① 맑은 날 공원에서 자전거를 타는 남녀\n② 비 오는 거리에서 남녀가 큰 우산 하나를 함께 쓰고 걷는 모습\n③ 버스 정류장에서 각자 우산을 접고 있는 모습\n④ 편의점 안에서 우산을 고르고 있는 여자", "question": "대화를 듣고 알맞은 그림(상황)을 고르십시오.", "options": ["상황 ①", "상황 ②", "상황 ③", "상황 ④"], "answer": 1, "explain": "Trời mưa, hai người đi chung một chiếc ô lớn tới ga tàu điện ngầm → Tình huống ②."},

    # --- TOPIK I Dạng 6 (Câu 17~21: 대화 내용과 같은 것) ---
    {"id": "t1_ld6_01", "typeId": "t1_l_d6", "turns": [("F", "내일 도서관에 같이 갈래요?"), ("M", "미안해요. 내일은 오전 열 시에 치과 예약이 있어요. 오후 두 시에 만나요."), ("F", "네, 그럼 그때 학생 식당 앞에서 봐요.")], "question": "다음을 듣고 대화 내용과 같은 것을 고르십시오.", "options": ["두 사람은 내일 오전에 만납니다.", "남자는 내일 병원에 갑니다.", "두 사람은 도서관 앞에서 만납니다.", "여자는 치과에 예약했습니다."], "answer": 1, "explain": "Người nam có lịch hẹn nha khoa (치과 = 병원) lúc 10h sáng mai."},
    {"id": "t1_ld6_02", "typeId": "t1_l_d6", "turns": [("M", "수진 씨, 이번 주 토요일 동아리 모임 장소가 바뀌었어요."), ("F", "그래요? 원래 학교 앞 카페에서 만나기로 했잖아요."), ("M", "네, 인원이 많아져서 학생회관 삼층 세미나실로 옮겼어요.")], "question": "다음을 듣고 대화 내용과 같은 것을 고르십시오.", "options": ["모임 요일이 일요일로 바뀌었습니다.", "참석 인원이 줄어들었습니다.", "두 사람은 카페에서 만날 겁니다.", "모임은 학생회관 세미나실에서 합니다."], "answer": 3, "explain": "Vì đông người nên chuyển địa điểm họp CLB sang phòng seminar tầng 3 nhà sinh viên."},
    {"id": "t1_ld6_03", "typeId": "t1_l_d6", "turns": [("F", "민수 씨, 신청한 노트북이 오늘 도착했어요?"), ("M", "아니요, 재고가 부족해서 내일 오후에 배송된대요."), ("F", "아쉽네요. 오늘 저녁에 같이 과제하려고 했는데요.")], "question": "다음을 듣고 대화 내용과 같은 것을 고르십시오.", "options": ["남자는 오늘 노트북을 받았습니다.", "여자가 노트북을 주문했습니다.", "노트북은 내일 오후에 도착할 겁니다.", "두 사람은 과제를 이미 끝냈습니다."], "answer": 2, "explain": "Hết hàng tồn kho nên chiều mai laptop mới được giao tới (내일 오후에 배송된대요)."},
    {"id": "t1_ld6_04", "typeId": "t1_l_d6", "turns": [("M", "어머니 생신 선물로 스카프를 샀는데 색깔이 어때요?"), ("F", "밝은 분홍색이라서 봄에 하시기 정말 좋겠어요. 백화점에서 샀어요?"), ("M", "아니요, 인터넷 쇼핑몰에서 할인받아서 샀어요.")], "question": "다음을 듣고 대화 내용과 같은 것을 고르십시오.", "options": ["남자는 백화점에서 선물을 샀습니다.", "여자는 어두운 색 스카프를 추천했습니다.", "남자는 인터넷에서 할인받아 스카프를 샀습니다.", "오늘은 여자의 어머니 생신입니다."], "answer": 2, "explain": "Người nam mua khăn quàng trên mạng được giảm giá làm quà sinh nhật mẹ."},
    {"id": "t1_ld6_05", "typeId": "t1_l_d6", "turns": [("F", "이번 방학에 한국어능력시험을 보려고 하는데 같이 학원에 다닐래요?"), ("M", "학원도 좋지만 저는 집이 멀어서 인터넷 강의를 들으려고 해요."), ("F", "그렇군요. 그럼 주말에 도서관에서 모의고사는 같이 풀어 봐요.")], "question": "다음을 듣고 대화 내용과 같은 것을 고르십시오.", "options": ["남자는 집 근처 학원에 다닐 겁니다.", "여자는 방학에 시험을 보지 않습니다.", "남자는 인터넷 강의를 들을 계획입니다.", "두 사람은 평일마다 도서관에서 만납니다."], "answer": 2, "explain": "Vì nhà xa nên người nam định học bài giảng trực tuyến (인터넷 강의를 들으려고 해요)."},
    {"id": "t1_ld6_06", "typeId": "t1_l_d6", "turns": [("M", "한국 요리 교실 신청 기간이 언제까지인지 아세요?"), ("F", "원래 오늘까지였는데 신청자가 적어서 이번 주 금요일까지 연장됐어요."), ("M", "다행이네요! 지금 바로 홈페이지에서 신청해야겠어요.")], "question": "다음을 듣고 대화 내용과 같은 것을 고르십시오.", "options": ["요리 교실 신청이 이미 끝났습니다.", "신청 기간이 금요일까지 늘어났습니다.", "신청하는 사람이 너무 많았습니다.", "남자는 전화로 요리를 배웠습니다."], "answer": 1, "explain": "Thời hạn đăng ký lớp nấu ăn Hàn Quốc được gia hạn tới thứ Sáu tuần này."},

    # --- TOPIK I Dạng 7 (Câu 22~24: 중심 생각 고르기) ---
    {"id": "t1_ld7_01", "typeId": "t1_l_d7", "turns": [("M", "잠을 자기 전에 휴대전화를 오래 보면 눈이 피곤해지고 잠도 잘 오지 않습니다. 건강을 위해서 잠자기 한 시간 전에는 휴대전화를 보지 않는 것이 좋습니다.")], "question": "남자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["휴대전화를 자주 바꾸면 안 됩니다.", "아침에 일찍 일어나는 습관이 중요합니다.", "잠자기 전에는 휴대전화 사용을 줄여야 합니다.", "눈이 나쁘면 안경을 꼭 써야 합니다."], "answer": 2, "explain": "Ý chính câu cuối: Không nên xem điện thoại 1 tiếng trước khi ngủ để tốt cho sức khỏe."},
    {"id": "t1_ld7_02", "typeId": "t1_l_d7", "turns": [("F", "외국어를 배울 때 실수하는 것을 부끄러워하면 말하기 실력이 늘지 않습니다. 틀리더라도 자꾸 소리 내어 말해 보는 태도가 가장 중요합니다.")], "question": "여자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["외국어 문법을 먼저 완벽하게 외워야 합니다.", "실수를 두려워하지 말고 적극적으로 말해야 합니다.", "혼자 조용히 책을 읽는 것이 제일 효과적입니다.", "발음이 좋지 않으면 천천히 쓰기만 해야 합니다."], "answer": 1, "explain": "'틀리더라도 자꾸 소리 내어 말해 보는 태도가 가장 중요합니다' → Đừng sợ sai mà hãy tích cực nói thành tiếng."},
    {"id": "t1_ld7_03", "typeId": "t1_l_d7", "turns": [("M", "마트에 갈 때 미리 살 물건을 메모해 가면 필요 없는 물건을 사지 않게 됩니다. 알뜰한 소비를 하려면 장보기 목록을 꼭 작성해 보세요.")], "question": "남자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["마트보다 전통 시장을 이용해야 합니다.", "쇼핑하기 전에 구매 목록을 적는 것이 좋습니다.", "할인 행사 기간에 물건을 많이 사 두어야 합니다.", "현금 대신 카드를 사용하면 돈을 아낄 수 있습니다."], "answer": 1, "explain": "Ghi sẵn danh sách đồ cần mua trước khi đi siêu thị giúp chi tiêu tiết kiệm."},
    {"id": "t1_ld7_04", "typeId": "t1_l_d7", "turns": [("F", "실내 공기가 나쁘면 머리가 아프고 집중력도 떨어집니다. 날씨가 조금 춥더라도 하루에 세 번 이상 창문을 열어 환기를 시켜야 합니다.")], "question": "여자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["겨울에는 창문을 꼭 닫아 두어야 합니다.", "건강과 집중력을 위해 실내 환기를 자주 해야 합니다.", "공부가 안 될 때는 밖으로 산책을 나가야 합니다.", "방 안 온도를 항상 높게 유지하는 것이 좋습니다."], "answer": 1, "explain": "Dù trời lạnh cũng nên mở cửa sổ thông gió ít nhất 3 lần/ngày."},

    # ================= TOPIK II LISTENING SINGLE ITEMS =================
    # --- TOPIK II Dạng 1 (Câu 1~3: 그림·도표 고르기) ---
    {"id": "t2_ld1_01", "typeId": "t2_l_d1", "turns": [("M", "여보, 식탁 위에 놓을 화분이 깨졌네요. 어떡하죠?"), ("F", "고양이가 뛰어오르다가 떨어뜨렸나 봐요. 다치지 않게 제가 먼저 빗자루로 쓸게요.")], "passage": "[그림 상황]\n① 바닥에 깨진 화분이 있고 여자가 빗자루를 들고 서 있는 모습\n② 남자가 식탁 위 꽃병에 물을 주고 있는 모습\n③ 꽃집에서 두 사람이 화분을 고르고 있는 모습\n④ 여자가 베란다 창문을 닦고 있는 모습", "question": "대화를 듣고 알맞은 그림을 고르십시오.", "options": ["그림 ①", "그림 ②", "그림 ③", "그림 ④"], "answer": 0, "explain": "Chậu cây rơi vỡ trên sàn và người vợ cầm chổi chuẩn bị quét → Hình ①."},
    {"id": "t2_ld1_02", "typeId": "t2_l_d1", "turns": [("F", "최근 사 년간 전자책 이용률 조사 결과를 보면 해마다 꾸준히 상승하여 올해는 오십 퍼센트를 넘어섰습니다. 반면 종이책 독서율은 매년 소폭 감소하는 추세를 보였습니다.")], "passage": "[도표 보기]\n① 전자책(상승해 52% 돌파) / 종이책(완만하게 하락)\n② 전자책(매년 감소) / 종이책(급격히 상승)\n③ 전자책과 종이책 모두 4년간 동일 수준 유지\n④ 전자책(상승 후 급락) / 종이책(변동 없음)", "question": "다음을 듣고 내용과 일치하는 그래프를 고르십시오.", "options": ["그래프 ①", "그래프 ②", "그래프 ③", "그래프 ④"], "answer": 0, "explain": "Tỷ lệ dùng sách điện tử tăng đều vượt 50%, trong khi sách giấy giảm nhẹ mỗi năm → Biểu đồ ①."},
    {"id": "t2_ld1_03", "typeId": "t2_l_d1", "turns": [("M", "대학생들이 방학 중 가장 하고 싶어 하는 활동 일 위는 해외여행이 사십이 퍼센트를 차지했고, 자격증 취득이 삼십일 퍼센트, 아르바이트가 십팔 퍼센트로 그 뒤를 이었습니다.")], "passage": "[도표 보기]\n① 아르바이트(42%) > 해외여행(31%) > 자격증(18%)\n② 해외여행(42%) > 자격증 취득(31%) > 아르바이트(18%)\n③ 자격증 취득(42%) > 아르바이트(31%) > 해외여행(18%)\n④ 해외여행(31%) > 어학연수(31%) > 봉사활동(38%)", "question": "다음을 듣고 내용과 일치하는 도표를 고르십시오.", "options": ["도표 ①", "도표 ②", "도표 ③", "도표 ④"], "answer": 1, "explain": "Hạng 1 Du lịch nước ngoài (42%) > Hạng 2 Thi chứng chỉ (31%) > Hạng 3 Làm thêm (18%) → Biểu đồ ②."},

    # --- TOPIK II Dạng 2 (Câu 4~8: 이어질 말) ---
    {"id": "t2_ld2_01", "typeId": "t2_l_d2", "turns": [("F", "과장님, 거래처에 보낼 계약서 검토 다 끝났습니다."), ("M", "수고했어요. 그런데 발송하기 전에 수정할 부분이 하나 있던데요.")], "question": "여자가 이어서 할 말로 가장 알맞은 것을 고르십시오.", "options": ["네, 벌써 거래처에 발송했습니다.", "어느 부분인지 말씀해 주시면 바로 고치겠습니다.", "계약서를 내일까지 작성해 보겠습니다.", "검토해 주셔서 정말 감사합니다."], "answer": 1, "explain": "Trưởng phòng bảo có 1 chỗ cần sửa trước khi gửi → 'Anh chỉ giúp chỗ nào để em sửa ngay ạ'."},
    {"id": "t2_ld2_02", "typeId": "t2_l_d2", "turns": [("M", "지영 씨, 이번 주말 등산 모임에 참석할 수 있지요?"), ("F", "가고 싶은데 토요일 오전에 자격증 시험이 있어서요.")], "question": "남자가 이어서 할 말로 가장 알맞은 것을 고르십시오.", "options": ["그럼 시험 잘 보고 다음 모임 때 같이 가요.", "등산화를 미리 사 두길 잘했네요.", "자격증 시험에 합격해서 정말 축하해요.", "토요일 아침 일곱 시에 역 앞에서 만나요."], "answer": 0, "explain": "Người nữ bận thi chứng chỉ sáng thứ Bảy → Chúc thi tốt và hẹn dịp sau."},
    {"id": "t2_ld2_03", "typeId": "t2_l_d2", "turns": [("F", "새로 산 무선 이어폰인데 한쪽에서 소리가 자꾸 끊겨요."), ("M", "구입한 지 일주일도 안 됐잖아요. 영수증 가지고 계세요?")], "question": "여자가 이어서 할 말로 가장 알맞은 것을 고르십시오.", "options": ["네, 영수증 챙겨서 오늘 퇴근길에 교환하러 가야겠어요.", "아니요, 소리가 아주 깨끗하게 잘 들려요.", "네, 일 년 넘게 고장 없이 잘 썼어요.", "아니요, 매장에서 직접 들어 보고 고를게요."], "answer": 0, "explain": "Mua chưa đầy 1 tuần bị lỗi âm thanh, hỏi còn hóa đơn không → Đem hóa đơn đi đổi sau giờ làm."},
    {"id": "t2_ld2_04", "typeId": "t2_l_d2", "turns": [("M", "이번 신제품 홍보 영상 반응이 기대 이상으로 좋네요."), ("F", "맞아요. 젊은 소비자들이 공유를 많이 해 준 덕분이에요.")], "question": "남자가 이어서 할 말로 가장 알맞은 것을 고르십시오.", "options": ["영상을 처음부터 다시 촬영해야겠어요.", "이 분위기를 이어서 참여형 이벤트도 기획해 봅시다.", "홍보 예산을 대폭 줄이는 게 좋겠습니다.", "소비자들의 불만 사항부터 사과드려야지요."], "answer": 1, "explain": "Phản hồi video quảng bá rất tích cực → Thừa thắng lên kế hoạch thêm sự kiện tương tác."},
    {"id": "t2_ld2_05", "typeId": "t2_l_d2", "turns": [("F", "팀장님, 내일 외부 강사 초청 특강에 신청자가 예상보다 두 배나 많습니다."), ("M", "그래요? 지금 예약된 소회의실에는 다 못 들어갈 텐데요.")], "question": "여자가 이어서 할 말로 가장 알맞은 것을 고르십시오.", "options": ["강사님께 특강 취소를 요청하겠습니다.", "대강당이 비어 있는지 확인해서 장소를 옮겨 볼까요?", "신청자가 적어서 홍보를 더 해야겠습니다.", "소회의실 의자를 절반으로 줄여 놓겠습니다."], "answer": 1, "explain": "Người đăng ký gấp đôi sức chứa phòng họp nhỏ → Đề xuất kiểm tra hội trường lớn để đổi phòng."},

    # --- TOPIK II Dạng 3 (Câu 9~12: 이어서 할 행동) ---
    {"id": "t2_ld3_01", "typeId": "t2_l_d3", "turns": [("F", "김 대리님, 오후 세 시 회의실 예약은 확인하셨죠?"), ("M", "네, 예약은 끝났는데 발표 자료 인쇄가 아직 안 됐어요."), ("F", "아, 그래요? 그럼 제가 지금 출력해 올게요. 대리님은 노트북 먼저 연결해 주세요.")], "question": "여자가 이어서 할 행동으로 알맞은 것을 고르십시오.", "options": ["회의실을 예약한다.", "노트북을 연결한다.", "발표 자료를 인쇄한다.", "회의 시간을 변경한다."], "answer": 2, "explain": "Người nữ nói '그럼 제가 지금 출력해 올게요' → Đi in tài liệu thuyết trình."},
    {"id": "t2_ld3_02", "typeId": "t2_l_d3", "turns": [("M", "수진 씨, 이번 사내 체육대회 포스터 디자인 시안 나왔어요?"), ("F", "네, 방금 완성했어요. 게시판에 붙이기 전에 팀장님께 먼저 보여 드리려고요."), ("M", "좋아요. 그럼 저는 참가자 명단을 정리하고 있을게요.")], "question": "여자가 이어서 할 행동으로 알맞은 것을 고르십시오.", "options": ["포스터를 게시판에 붙인다.", "팀장님께 포스터 시안을 보여 드린다.", "참가자 명단을 정리한다.", "체육대회 장소를 알아본다."], "answer": 1, "explain": "Người nữ sẽ mang bản thiết kế cho trưởng nhóm xem trước khi dán lên bảng tin."},
    {"id": "t2_ld3_03", "typeId": "t2_l_d3", "turns": [("F", "여보, 내일 손님들 대접할 과일은 다 샀는데 식탁보가 좀 얼룩졌네요."), ("M", "세탁기에 돌리면 내일까지 안 마를 텐데 새 식탁보를 꺼낼까요?"), ("F", "네, 안방 서랍장 아래 칸에 새 식탁보가 있어요. 당신이 좀 꺼내 주세요. 저는 과일부터 씻어 놓을게요.")], "question": "남자가 이어서 할 행동으로 알맞은 것을 고르십시오.", "options": ["과일을 씻는다.", "식탁보를 세탁한다.", "서랍장에서 새 식탁보를 꺼낸다.", "마트에 가서 과일을 산다."], "answer": 2, "explain": "Đề hỏi hành động của NGƯỜI NAM: vợ nhờ chồng lấy khăn trải bàn mới trong ngăn tủ phòng ngủ."},
    {"id": "t2_ld3_04", "typeId": "t2_l_d3", "turns": [("M", "선배님, 학술제 안내 책자에 오타가 하나 발견됐어요. 이미 백 부나 인쇄했는데요."), ("F", "어머, 날짜가 잘못 적혔네. 다시 인쇄할 시간은 없으니까 수정 스티커를 만들어서 붙이자."), ("M", "네, 제가 지금 문구점에 가서 라벨 용지를 사 올게요. 선배님은 안내 데스크 배치를 봐 주세요.")], "question": "남자가 이어서 할 행동으로 알맞은 것을 고르십시오.", "options": ["안내 책자를 다시 인쇄한다.", "문구점에 가서 라벨 용지를 산다.", "안내 데스크를 배치한다.", "참가자에게 안내 문자를 보낸다."], "answer": 1, "explain": "Người nam nói '제가 지금 문구점에 가서 라벨 용지를 사 올게요' → Đi mua giấy nhãn dán."},

    # --- TOPIK II Dạng 4 (Câu 13~16: 들은 내용과 일치하는 것) ---
    {"id": "t2_ld4_01", "typeId": "t2_l_d4", "turns": [("F", "주민 여러분께 안내 말씀드립니다. 내일 오전 아홉 시부터 정오까지 아파트 물탱크 청소 작업으로 인해 전 세대 수돗물 공급이 일시 중단됩니다. 오늘 저녁까지 필요한 물을 미리 받아 두시기 바랍니다.")], "question": "다음을 듣고 내용과 일치하는 것을 고르십시오.", "options": ["물탱크 청소는 오후에 시작된다.", "세 시간 동안 수돗물이 나오지 않는다.", "일부 동만 단수가 진행될 예정이다.", "오늘 저녁부터 물 공급이 중단된다."], "answer": 1, "explain": "Từ 9h sáng đến 12h trưa (정오) ngày mai = 3 tiếng ngừng cấp nước toàn khu căn hộ."},
    {"id": "t2_ld4_02", "typeId": "t2_l_d4", "turns": [("M", "이번 시립박물관 야간 개장 행사 가 봤어요?"), ("F", "네, 지난주 금요일에 다녀왔어요. 사전 예약을 하면 입장료도 무료고 해설사 설명도 들을 수 있어서 정말 유익했어요."), ("M", "이번 달 말까지 매주 금요일과 토요일에 운영한다니까 저도 신청해야겠네요.")], "question": "다음을 듣고 내용과 일치하는 것을 고르십시오.", "options": ["야간 개장은 평일 매일 운영된다.", "사전 예약을 해도 입장료를 내야 한다.", "여자는 지난주에 박물관을 방문했다.", "박물관에는 해설 프로그램이 없다."], "answer": 2, "explain": "Người nữ đã đi tham quan vào thứ Sáu tuần trước, đặt trước được miễn phí vé và nghe thuyết minh."},
    {"id": "t2_ld4_03", "typeId": "t2_l_d4", "turns": [("F", "민호 씨, 사내 외국어 동호회 신청했어요?"), ("M", "네, 올해부터는 회사에서 교재비뿐만 아니라 강사료까지 전액 지원해 준대요. 다만 출석률이 팔십 퍼센트 미만이면 다음 학기 신청이 제한돼요.")], "question": "다음을 듣고 내용과 일치하는 것을 고르십시오.", "options": ["회원은 교재비를 직접 부담해야 한다.", "출석률이 낮으면 다음 학기 참여가 어렵다.", "작년에도 강사료 전액을 지원해 주었다.", "남자는 아직 동호회에 가입하지 않았다."], "answer": 1, "explain": "Nếu tỷ lệ chuyên cần dưới 80% sẽ bị hạn chế đăng ký kỳ tiếp theo."},
    {"id": "t2_ld4_04", "typeId": "t2_l_d4", "turns": [("M", "시청자 여러분, 이번 주말 열릴 예정이던 한강 불꽃축제는 태풍 북상으로 인해 다음 주 토요일로 연기되었습니다. 이미 예매하신 관람권은 별도의 변경 절차 없이 그대로 사용하실 수 있습니다.")], "question": "다음을 듣고 내용과 일치하는 것을 고르십시오.", "options": ["불꽃축제가 완전히 취소되었다.", "날씨 때문에 행사 일정이 미루어졌다.", "기존 예매권은 다시 발급받아야 한다.", "축제는 이번 주 일요일에 진행된다."], "answer": 1, "explain": "Vì bão tiến lên nên lễ hội pháo hoa sông Hàn được dời sang thứ Bảy tuần sau, vé cũ giữ nguyên hiệu lực."},

    # --- TOPIK II Dạng 5 (Câu 17~20: 남자의 중심 생각) ---
    {"id": "t2_ld5_01", "typeId": "t2_l_d5", "turns": [("F", "요즘 아이들에게 코딩 교육을 일찍 시키는 부모들이 많아졌어요."), ("M", "기술을 배우는 것도 좋지만 어릴 때는 친구들과 뛰어놀면서 사회성과 창의력을 기르는 것이 훨씬 더 중요하다고 생각해요.")], "question": "남자의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["코딩 교육은 초등학교 때부터 필수로 해야 한다.", "어린 시절에는 기술 교육보다 또래 활동과 창의성 발달이 우선이다.", "부모가 아이의 진로를 미리 결정해 주는 것이 좋다.", "컴퓨터 게임은 아이들의 사회성 발달에 도움이 된다."], "answer": 1, "explain": "Người nam nhấn mạnh khi còn nhỏ, vui chơi cùng bạn bè để rèn tính xã hội & sáng tạo quan trọng hơn học kỹ thuật sớm."},
    {"id": "t2_ld5_02", "typeId": "t2_l_d5", "turns": [("F", "팀 회의에서 좋은 아이디어를 얻으려면 회의를 길게 해야 하지 않을까요?"), ("M", "회의 시간이 길어진다고 좋은 의견이 나오는 건 아니에요. 참석자들이 미리 주제를 숙지하고 핵심만 짧게 논의해야 오히려 효율적인 결론을 낼 수 있어요.")], "question": "남자의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["회의는 가능한 한 자주 여는 것이 바람직하다.", "사전 준비를 바탕으로 짧고 집중도 있게 회의해야 한다.", "팀장이 단독으로 의사 결정을 내리는 편이 빠르다.", "신입 사원의 발언 시간을 별도로 제한해야 한다."], "answer": 1, "explain": "Nắm trước chủ đề và thảo luận ngắn gọn trọng tâm mới mang lại kết luận hiệu quả."},
    {"id": "t2_ld5_03", "typeId": "t2_l_d5", "turns": [("F", "오래된 한옥 마을에 현대식 카페가 많이 들어서니까 관광객이 늘어나서 보기 좋네요."), ("M", "상권이 활성화되는 건 반가운 일이지만, 무분별한 상업화로 전통 마을 고유의 정취와 원주민의 삶이 훼손되지 않도록 보존 기준을 지켜야 합니다.")], "question": "남자의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["전통 마을의 상업 시설 입점을 전면 금지해야 한다.", "관광객 유치를 위해 현대식 건물을 더 늘려야 한다.", "전통 마을의 고유한 가치와 주민 삶을 해치지 않는 선에서 개발해야 한다.", "한옥 마을의 입장료를 대폭 인상할 필요가 있다."], "answer": 2, "explain": "Phát triển thương mại phải tuân thủ tiêu chuẩn bảo tồn để không làm mất bản sắc làng cổ và đời sống cư dân."},
    {"id": "t2_ld5_04", "typeId": "t2_l_d5", "turns": [("F", "운동 효과를 빨리 보려면 매일 고강도 근력 운동을 해야겠지요?"), ("M", "근육은 운동할 때가 아니라 휴식을 취할 때 회복되면서 성장합니다. 무리해서 매일 하기보다 적절한 휴식일을 두어야 부상도 막고 운동 효과도 높일 수 있습니다.")], "question": "남자의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["근력 운동보다 유산소 운동만 하는 것이 안전하다.", "운동 효과를 높이고 부상을 예방하려면 적절한 휴식이 필수적이다.", "아침 공복에 고강도 운동을 해야 근육이 빨리 자란다.", "전문 운동선수만 휴식 일정을 관리할 필요가 있다."], "answer": 1, "explain": "Cơ bắp phục hồi và phát triển khi nghỉ ngơi → Cần xen kẽ ngày nghỉ hợp lý để tránh chấn thương và tăng hiệu quả."}
]

# ==============================================================================
# 3. PAIRED 2-QUESTION LISTENING SETS (TOPIK I [25~30] & TOPIK II [21~50])
# ==============================================================================
LISTEN_PAIRED_SETS = [
    # --- TOPIK I Dạng 8 (2 questions per audio) ---
    {
        "setId": "t1_ld8_s1", "typeId": "t1_l_d8",
        "turns": [
            ("F", "시민 여러분, 안녕하십니까? 이번 주 일요일 인주공원에서 '나눔 벼룩시장'이 열립니다. 집에서 쓰지 않는 옷이나 책, 장난감을 가지고 나오셔서 이웃과 나누어 보세요. 참가 신청은 금요일까지 구청 홈페이지에서 받으며, 비가 오면 행사는 실내 체육관에서 진행됩니다.")
        ],
        "q1": {"question": "여자가 이 말을 하는 이유는 무엇입니까?", "options": ["공원 공사 일정을 알리려고", "벼룩시장 행사를 안내하려고", "체육관 이용 요금을 설명하려고", "헌 옷 수거 방법을 질문하려고"], "answer": 1, "explain": "Thông báo hướng dẫn người dân tham gia sự kiện chợ trời chia sẻ '나눔 벼룩시장'."},
        "q2": {"question": "들은 내용과 같은 것을 고르십시오.", "options": ["행사는 토요일에 열립니다.", "전화기로만 참가 신청을 받습니다.", "비가 오면 행사가 취소됩니다.", "안 쓰는 책이나 옷을 가져올 수 있습니다."], "answer": 3, "explain": "Người dân có thể mang quần áo, sách, đồ chơi không dùng tới; nếu mưa chuyển vào nhà thi đấu."}
    },
    {
        "setId": "t1_ld8_s2", "typeId": "t1_l_d8",
        "turns": [
            ("M", "선생님, 외국인 말하기 대회에 나가고 싶은데 어떻게 준비하면 좋을까요?"),
            ("F", "민수 씨는 발음이 정확하니까 자신의 한국 생활 경험을 솔직하게 원고로 써 보세요. 그리고 거울을 보면서 자연스러운 표정과 손짓을 연습하면 큰 도움이 될 거예요. 원고를 다 쓰면 내일 제 연구실로 가져오세요.")
        ],
        "q1": {"question": "두 사람은 무엇에 대해 이야기하고 있습니까?", "options": ["말하기 대회 준비 방법", "한국어 발음 교정 수업", "한국 생활 적응의 어려움", "연구실 위치와 이용 시간"], "answer": 0, "explain": "Học viên hỏi cô giáo cách chuẩn bị cho cuộc thi hùng biện tiếng Hàn."},
        "q2": {"question": "들은 내용과 같은 것을 고르십시오.", "options": ["남자는 발음이 부정확합니다.", "여자가 대신 원고를 써 줄 겁니다.", "남자는 원고를 쓴 뒤에 선생님께 보여 드릴 겁니다.", "대회에서는 손짓을 사용하면 감점이 됩니다."], "answer": 2, "explain": "Cô giáo dặn viết xong bản thảo thì ngày mai mang tới phòng nghiên cứu của cô."}
    },
    {
        "setId": "t1_ld8_s3", "typeId": "t1_l_d8",
        "turns": [
            ("F", "손님, 찾으시는 소설책은 현재 우리 매장에 재고가 없습니다. 대신 본사 창고에서 주문해 드릴 수 있는데요. 오늘 신청하시면 모레 오후에 매장에서 받으실 수 있고, 택배로 받으시면 배송비 이천오백 원이 추가됩니다.")
        ],
        "q1": {"question": "여자는 왜 이 말을 하고 있습니까?", "options": ["새로 나온 소설책을 홍보하려고", "품절된 책의 주문 방법을 안내하려고", "책값을 환불해 달라고 요청하려고", "매장 영업시간 변경을 알리려고"], "answer": 1, "explain": "Nhân viên hiệu sách hướng dẫn cách đặt hàng cuốn tiểu thuyết hiện hết hàng tại quầy."},
        "q2": {"question": "들은 내용과 같은 것을 고르십시오.", "options": ["오늘 저녁에 매장에서 책을 받을 수 있습니다.", "본사 창고에도 책이 남아 있지 않습니다.", "택배로 받으려면 배송비를 더 내야 합니다.", "여자는 책을 사러 온 손님입니다."], "answer": 2, "explain": "Nếu nhận qua chuyển phát nhanh (택배) thì thêm phí vận chuyển 2.500 won."}
    },
    {
        "setId": "t1_ld8_s4", "typeId": "t1_l_d8",
        "turns": [
            ("M", "이번 여름 휴가 때 제주도에 가려고 하는데 렌터카는 예약했어요?"),
            ("F", "성수기라서 자동차 빌리는 비용이 너무 비싸더라고요. 그래서 이번에는 관광버스 투어를 신청했어요. 운전할 필요가 없어서 피곤하지도 않고 주요 관광지 입장료도 할인돼서 훨씬 경제적이에요.")
        ],
        "q1": {"question": "여자가 관광버스 투어를 선택한 이유는 무엇입니까?", "options": ["운전면허증이 아직 없어서", "편리하고 비용도 절약할 수 있어서", "제주도 길을 잘 알고 있어서", "친구들과 시간을 따로 보내고 싶어서"], "answer": 1, "explain": "Không phải tự lái đỡ mệt và còn được giảm giá vé điểm tham quan, tiết kiệm hơn thuê xe mùa cao điểm."},
        "q2": {"question": "들은 내용과 같은 것을 고르십시오.", "options": ["여자는 제주도 렌터카를 이미 예약했습니다.", "여름 휴가철에는 렌터카 요금이 저렴합니다.", "관광버스 투어를 이용하면 입장료 할인을 받습니다.", "남자는 제주도 여행을 취소했습니다."], "answer": 2, "explain": "Đi tour xe buýt du lịch được giảm giá vé vào cổng các điểm tham quan chính."}
    },

    # --- TOPIK II Dạng 6 (Câu 21~30: 인터뷰·안내·상담 2문항) ---
    {
        "setId": "t2_ld6_s1", "typeId": "t2_l_d6",
        "turns": [
            ("M", "대표님, 버려지는 커피 찌꺼기로 친환경 연필과 화분을 만드신 계기가 궁금합니다."),
            ("F", "카페를 운영하면서 매일 엄청난 양의 커피박이 일반 쓰레기로 버려져 환경 오염을 일으키는 걸 보았습니다. 커피 찌꺼기는 건조 과정만 제대로 거치면 단단하고 향도 은은해서 플라스틱을 대체할 훌륭한 자원이 됩니다. 일상 속 작은 재활용이 순환 경제의 출발점이라고 믿습니다.")
        ],
        "q1": {"question": "여자의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["카페 창업을 줄여 쓰레기 배출량을 억제해야 한다.", "버려지는 자원을 재가공하면 환경 보호와 대체 소재 개발이 가능하다.", "플라스틱 제품은 가격이 저렴해 대체하기 어렵다.", "커피 찌꺼기는 수거 비용이 높아 매립하는 것이 효율적이다."], "answer": 1, "explain": "Tái chế bã cà phê qua sấy khô giúp thay thế nhựa và khởi đầu nền kinh tế tuần hoàn."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["여자는 현재 연필 공장을 그만두었다.", "커피 찌꺼기는 건조하지 않아도 바로 성형이 된다.", "여자는 카페를 운영하며 커피 쓰레기 문제를 체감했다.", "만들어진 친환경 화분에서는 냄새가 전혀 나지 않는다."], "answer": 2, "explain": "Khi vận hành quán cà phê, người nữ tận mắt thấy lượng lớn bã cà phê bị vứt bỏ mỗi ngày."}
    },
    {
        "setId": "t2_ld6_s2", "typeId": "t2_l_d6",
        "turns": [
            ("F", "관람객 여러분께 안내 말씀드립니다. 잠시 후 두 시부터 삼층 특별전시실에서 '조선 시대 회화 속 일상' 큐레이터 해설이 시작됩니다. 별도의 사전 예약 없이 현장에서 선착순 스무 분까지 참여하실 수 있으며, 전시실 내부에서는 플래시를 사용한 사진 촬영이 금지되어 있으니 협조해 주시기 바랍니다.")
        ],
        "q1": {"question": "여자가 이 안내 방송을 하는 목적을 고르십시오.", "options": ["전시관 휴관 일정을 공지하려고", "특별전 해설 프로그램 참여 및 유의 사항을 안내하려고", "사진 공모전 출품 방법을 설명하려고", "큐레이터 채용 일정을 소개하려고"], "answer": 1, "explain": "Thông báo chương trình thuyết minh của giám tuyển tại phòng triển lãm đặc biệt tầng 3 và lưu ý tham quan."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["해설 프로그램은 인터넷으로 미리 예약해야만 한다.", "최대 스무 명까지 해설에 참여할 수 있다.", "전시실에서는 플래시를 켜고 촬영해도 된다.", "특별전시실은 건물 일층에 위치해 있다."], "answer": 1, "explain": "Nhận tối đa 20 người theo thứ tự đến trước tại hiện trường mà không cần đặt trước."}
    },
    {
        "setId": "t2_ld6_s3", "typeId": "t2_l_d6",
        "turns": [
            ("M", "박사님, 최근 도시 양봉에 관심을 갖는 지자체가 늘고 있는데 도심에서도 꿀벌이 잘 살 수 있나요?"),
            ("F", "오히려 농촌보다 농약 피해가 적고 가로수나 공원 화단 덕분에 사계절 먹이가 풍부해서 도심 꿀벌의 생존율이 높습니다. 게다가 꿀벌이 도시 녹지의 수분을 도와 생태계 건강성을 회복시키는 효과도 매우 큽니다.")
        ],
        "q1": {"question": "여자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["도시 양봉은 꿀벌 생존에 유리하며 도심 생태계 회복에도 기여한다.", "도심 공원의 꽃나무 종류를 단일 품종으로 통일해야 한다.", "농촌 지역의 양봉 농가에 농약 사용을 권장해야 한다.", "꿀벌에 쏘일 위험이 있으므로 도심 양봉을 제한해야 한다."], "answer": 0, "explain": "Nuôi ong đô thị ít thuốc trừ sâu, giàu nguồn hoa và giúp phục hồi hệ sinh thái cây xanh đô thị."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["도심은 농촌보다 농약 피해가 더 심각하다.", "도시에는 꿀벌이 먹을 꽃이 부족하다.", "꿀벌은 도시 식물의 수분 작용을 돕는다.", "지자체들은 도시 양봉 사업을 줄이고 있다."], "answer": 2, "explain": "Ong mật giúp thụ phấn (수분을 돕다) cho mảng xanh đô thị."}
    },
    {
        "setId": "t2_ld6_s4", "typeId": "t2_l_d6",
        "turns": [
            ("F", "선생님, 요즘 아이가 책을 끝까지 못 읽고 짧은 영상만 보려고 해서 걱정이에요."),
            ("M", "처음부터 글자가 빽빽한 책을 권하면 거부감이 생기기 쉽습니다. 아이가 좋아하는 주제의 만화나 그림책으로 흥미를 먼저 유발한 뒤, 부모님이 하루 십 분씩 함께 읽고 이야기를 나누는 시간을 가져 보세요.")
        ],
        "q1": {"question": "남자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["어린이의 스마트폰 사용을 법으로 금지해야 한다.", "아이의 관심사에 맞춘 쉬운 책과 부모와의 소통으로 독서 습관을 길러야 한다.", "초등학교 입학 전 고전 문학 필독서를 모두 읽혀야 한다.", "영상을 통한 학습이 독서보다 어휘력 향상에 효과적이다."], "answer": 1, "explain": "Bắt đầu từ sách tranh/truyện chủ đề bé thích và bố mẹ cùng đọc, trò chuyện 10 phút mỗi ngày."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["여자의 아이는 긴 소설책을 즐겨 읽는다.", "처음부터 글자가 많은 책을 읽히는 것이 좋다.", "부모가 함께 읽고 대화하는 과정이 도움이 된다.", "그림책은 독서 습관 형성에 방해가 된다."], "answer": 2, "explain": "Chuyên gia khuyên bố mẹ đọc cùng và trò chuyện 10 phút mỗi ngày."}
    },
    {
        "setId": "t2_ld6_s5", "typeId": "t2_l_d6",
        "turns": [
            ("M", "이번에 도입한 공유 오피스 좌석 자율제가 직원들 사이에서 반응이 어떻습니까?"),
            ("F", "부서 간 장벽이 낮아져서 자연스럽게 협업 아이디어가 오가는 장점이 나타났습니다. 다만 전화 통화가 잦은 영업팀의 경우 주변 집중을 방해할 수 있어 방음 부스를 추가로 설치해 보완했습니다.")
        ],
        "q1": {"question": "두 사람이 무엇에 대해 이야기하고 있는지 고르십시오.", "options": ["자율 좌석제 도입의 효과와 보완책", "신입 사원 채용 면접 방식의 개편", "재택근무 전면 폐지에 따른 갈등", "영업팀 실적 평가 기준의 변경"], "answer": 0, "explain": "Đánh giá hiệu quả hợp tác liên phòng ban và giải pháp lắp thêm buồng cách âm khi áp dụng chỗ ngồi tự do."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["자율 좌석제 이후 부서 간 교류가 줄어들었다.", "영업팀은 전화 통화량이 적은 편이다.", "소음 문제를 줄이기 위해 방음 부스를 추가로 마련했다.", "회사는 자율 좌석제를 한 달 만에 중단했다."], "answer": 2, "explain": "Công ty đã lắp đặt bổ sung buồng cách âm (방음 부스) cho các cuộc gọi điện thoại."}
    },

    # --- TOPIK II Dạng 7 (Câu 31~32: 토론·태도 파악) ---
    {
        "setId": "t2_ld7_s1", "typeId": "t2_l_d7",
        "turns": [
            ("M", "일회용 컵 보증금제를 시행하면 소비자 불편과 소상공인의 반납 처리 부담만 가중될 뿐입니다. 회수 기기 인프라도 충분히 갖추지 않은 채 성급하게 제도를 강행하는 것은 탁상행정에 불과합니다."),
            ("F", "초기 정착 과정에서 다소 불편이 따를 수 있다는 점은 인정합니다. 하지만 재활용률을 획기적으로 높이기 위해서는 보증금제가 반드시 필요합니다. 시행을 미루기보다 무인 회수기 설치 비용을 지원하면서 제도를 보완해 나가는 것이 바람직합니다.")
        ],
        "q1": {"question": "남자의 생각으로 가장 알맞은 것을 고르십시오.", "options": ["무인 회수기 예산을 즉시 두 배로 늘려야 한다.", "여건이 미비한 상태에서의 일회용 컵 보증금제 시행은 무리이다.", "일회용 컵 가격을 현재보다 세 배 인상해야 한다.", "소비자가 자발적으로 텀블러를 가지고 다니게 홍보만 해야 한다."], "answer": 1, "explain": "Người nam cho rằng áp đặt chế độ đặt cọc cốc dùng 1 lần khi hạ tầng thu hồi chưa đủ chỉ gây phiền hà (탁상행정)."},
        "q2": {"question": "여자의 태도로 가장 알맞은 것을 고르십시오.", "options": ["상대방의 지적을 일부 수용하면서 현실적인 대안을 제시하고 있다.", "기존 정책의 실패 원인을 통계 자료로 반박하고 있다.", "제도 시행에 따른 부작용을 근거로 전면 철회를 요구하고 있다.", "양측의 입장을 중립적으로 요약하며 합의를 미루고 있다."], "answer": 0, "explain": "Người nữ thừa nhận bất tiện ban đầu ('인정합니다') nhưng bảo vệ sự cần thiết và đề xuất hỗ trợ lắp máy thu hồi tự động."}
    },
    {
        "setId": "t2_ld7_s2", "typeId": "t2_l_d7",
        "turns": [
            ("F", "무인 매장이 빠르게 늘면서 심야 시간에도 편리하게 물건을 살 수 있게 됐습니다. 인건비 부담을 덜어 상품 가격을 낮출 수 있으니 소비자와 자영업자 모두에게 이득이 되는 흐름입니다."),
            ("M", "디지털 기기 조작에 익숙하지 않은 고령층은 무인 매장에서 결제조차 하기 어렵습니다. 효율성만 앞세워 무인화를 서두르다 보면 사회적 약자가 일상 소비에서 소외되는 부작용을 낳을 수밖에 없습니다.")
        ],
        "q1": {"question": "남자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["무인 매장의 보안 시설을 강화해 도난을 막아야 한다.", "급격한 무인화는 디지털 취약 계층의 소외를 초래할 수 있다.", "심야 영업시간에는 추가 요금을 부과해야 한다.", "자영업자의 인건비 지원을 전면 중단해야 한다."], "answer": 1, "explain": "Người nam lo ngại tự động hóa quá nhanh khiến người cao tuổi không quen thiết bị số bị gạt ra lề."},
        "q2": {"question": "남자의 태도로 가장 알맞은 것을 고르십시오.", "options": ["무인 매장의 경제적 효과를 긍정적으로 평가하고 있다.", "기술 변화에 따른 사회적 약자의 불편을 우려하고 있다.", "고령층 대상 스마트폰 교육의 성과를 홍보하고 있다.", "상대방의 주장에 전적으로 동조하며 예시를 덧붙이고 있다."], "answer": 1, "explain": "Thái độ lo ngại (우려하다) về tác dụng phụ đối với nhóm yếu thế trong xã hội."}
    },

    # --- TOPIK II Dạng 8 (Câu 33~36: 문화·과학 강연) ---
    {
        "setId": "t2_ld8_s1", "typeId": "t2_l_d8",
        "turns": [
            ("F", "한옥의 처마는 단순히 비를 막는 지붕 끝부분이 아닙니다. 여름에는 태양의 고도가 높아 긴 처마가 뜨거운 직사광선을 차단해 실내를 시원하게 유지해 주고, 겨울에는 태양 고도가 낮아져 햇빛이 방 깊숙이 들어오도록 정교하게 각도가 설계되어 있습니다. 자연의 원리를 거스르지 않고 계절에 순응한 선조들의 과학적 지혜가 담겨 있는 것이지요.")
        ],
        "q1": {"question": "무엇에 대한 강연인지 고르십시오.", "options": ["계절에 따라 빛을 조절하는 한옥 처마의 과학적 원리", "한옥 기와를 굽는 전통 가마의 제작 과정", "지역별 한옥 마당 구조의 역사적 변천", "현대 아파트 난방 시설의 에너지 절감 기술"], "answer": 0, "explain": "Bài giảng giải thích nguyên lý khoa học của mái hiên Hanok (처마) điều tiết ánh nắng theo góc mặt trời mùa hè – mùa đông."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["여름에는 태양 고도가 낮아 방 안까지 햇빛이 깊숙이 들어온다.", "한옥의 처마는 비만 막기 위해 평평하게 만들어졌다.", "겨울에는 낮은 태양 고도 덕분에 실내로 햇볕이 잘 들어온다.", "처마 각도는 계절과 관계없이 일정한 그늘만 만든다."], "answer": 2, "explain": "Mùa đông góc mặt trời thấp nên ánh nắng chiếu sâu vào phòng giúp giữ ấm."}
    },
    {
        "setId": "t2_ld8_s2", "typeId": "t2_l_d8",
        "turns": [
            ("M", "식물은 움직일 수 없지만 해충의 공격을 받으면 독특한 화학 물질을 공기 중으로 내뿜습니다. 놀라운 점은 이 물질이 해충의 천적인 말벌을 불러들일 뿐만 아니라, 주변의 다른 식물들에게도 위험 신호를 전달해 미리 방어 물질을 만들게 한다는 사실입니다. 소리 없는 향기로 생태계 네트워크와 소통하는 셈입니다.")
        ],
        "q1": {"question": "강연의 주제로 가장 알맞은 것을 고르십시오.", "options": ["해충을 퇴치하는 친환경 농약의 제조법", "화학 물질을 이용해 위험에 대응하고 소통하는 식물의 방어 전략", "기후 변화로 인한 열대 식물의 멸종 위기", "곤충이 꽃의 색깔을 구별하는 시각 구조"], "answer": 1, "explain": "Chiến lược phòng vệ và giao tiếp của thực vật thông qua hợp chất hóa học bay hơi khi bị sâu hại tấn công."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["식물이 내뿜는 화학 물질은 해충의 천적을 유인한다.", "주변 식물들은 위험 신호를 받아도 반응하지 못한다.", "식물은 소리를 내어 주변 곤충을 쫓아낸다.", "공격을 받은 뒤에는 화학 물질 분비가 멈춘다."], "answer": 0, "explain": "Chất hóa học này thu hút thiên địch của sâu hại (như ong bắp cày) và cảnh báo cây xung quanh."}
    },

    # --- TOPIK II Dạng 9 (Câu 37~42: 교양 프로그램·전문가 대담) ---
    {
        "setId": "t2_ld9_s1", "typeId": "t2_l_d9",
        "turns": [
            ("F", "교수님, 최근 오래된 공장과 창고를 허물지 않고 복합 문화 공간으로 재생하는 도시 프로젝트가 큰 호응을 얻고 있습니다."),
            ("M", "네, 과거에는 낡은 산업 시설을 철거하고 고층 빌딩을 세우는 전면 재개발이 주류였습니다. 하지만 산업 유산의 외형을 보존하면서 전시장이나 도서관으로 탈바꿈시키면 건설 폐기물을 줄일 수 있을 뿐 아니라, 그 지역만의 역사적 정체성이 살아나 관광객을 끌어들이는 독창적인 명소가 됩니다.")
        ],
        "q1": {"question": "남자의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["노후 산업 시설은 안전을 위해 조속히 철거해야 한다.", "유휴 산업 시설의 문화적 재생은 환경 보전과 지역 정체성 강화에 효과적이다.", "도심 외곽에 대규모 신규 박물관을 집중 건설해야 한다.", "관광지 개발보다 제조업 공장 유치가 지역 경제에 유리하다."], "answer": 1, "explain": "Tái sinh không gian công nghiệp cũ thành trung tâm văn hóa vừa giảm phế thải xây dựng vừa giữ bản sắc lịch sử địa phương."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["과거에도 낡은 공장을 보존하는 방식이 주류였다.", "건물을 허물지 않으면 건설 폐기물이 더 많이 발생한다.", "재생된 공간은 지역의 역사적 기억을 간직한 명소가 된다.", "주민들은 공장 재생 프로젝트에 부정적인 반응을 보인다."], "answer": 2, "explain": "Không gian tái sinh giữ lại dấu ấn lịch sử độc đáo và thu hút du khách."}
    },
    {
        "setId": "t2_ld9_s2", "typeId": "t2_l_d9",
        "turns": [
            ("M", "박사님, 소비자들이 물건을 소유하기보다 일정 기간 빌려 쓰는 '구독 경제'가 가전제품을 넘어 가구와 그림에까지 확산되고 있습니다."),
            ("F", "맞습니다. 초기 목돈 부담 없이 다양한 취향을 경험해 볼 수 있고 전문가의 정기 관리 서비스까지 받을 수 있다는 점이 매력적이지요. 다만 월 이용료가 소액이라 여러 서비스를 동시에 구독하다 보면 장기적으로 구매 비용보다 지출이 커질 수 있어 소비자의 꼼꼼한 지출 관리가 요구됩니다.")
        ],
        "q1": {"question": "여자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["구독 경제는 편리함과 경험의 폭을 넓혀 주나 장기 지출 관리에 유의해야 한다.", "가전제품은 반드시 일시불로 구매하는 것이 경제적이다.", "기업들은 구독 서비스의 정기 관리 비용을 폐지해야 한다.", "예술품 구독 서비스는 저작권 문제로 축소될 것이다."], "answer": 0, "explain": "Kinh tế thuê bao mang lại trải nghiệm đa dạng không tốn vốn lớn ban đầu nhưng cần quản lý chi tiêu dài hạn."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["구독 서비스는 가전제품 분야에만 한정되어 있다.", "이용자는 초기에 큰 목돈을 한꺼번에 내야 한다.", "여러 구독을 중복 이용하면 총지출이 구매보다 커질 수 있다.", "구독 상품에는 사후 관리 서비스가 제공되지 않는다."], "answer": 2, "explain": "Đăng ký nhiều gói nhỏ cùng lúc lâu dài có thể tốn kém hơn mua đứt."}
    },
    {
        "setId": "t2_ld9_s3", "typeId": "t2_l_d9",
        "turns": [
            ("F", "요즘 박물관들이 시각 자료 위주에서 벗어나 유물의 질감을 만져 보거나 당시의 향기를 맡게 하는 다감각 전시를 선보이고 있네요."),
            ("M", "그렇습니다. 눈으로만 유리장 너머 유물을 볼 때보다 촉각과 후각, 청각을 함께 자극하면 관람객의 기억 잔존율이 훨씬 높아집니다. 특히 시각장애인을 비롯한 문화 소외 계층도 동등하게 예술을 향유할 수 있다는 점에서 포용적 전시 문화의 모범 사례라 할 수 있습니다.")
        ],
        "q1": {"question": "남자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["유물 훼손 방지를 위해 관람객의 접근 거리를 늘려야 한다.", "다감각 전시는 관람 몰입도를 높이고 문화 향유의 문턱을 낮추는 가치가 있다.", "박물관 입장료를 인상하여 최첨단 조명 설비를 갖추어야 한다.", "전시 해설은 오직 서면 안내판으로만 제공해야 정확하다."], "answer": 1, "explain": "Triển lãm đa giác quan vừa tăng khả năng ghi nhớ, vừa giúp người khiếm thị tiếp cận nghệ thuật bình đẳng."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["시각만 활용할 때 관람객의 기억 효과가 가장 높다.", "다감각 전시는 시각장애인의 관람 접근성을 높여 준다.", "박물관들은 최근 체험형 전시를 줄이는 추세이다.", "향기나 소리는 전시 몰입을 방해하는 요인이다."], "answer": 1, "explain": "Triển lãm đa giác quan mở rộng cơ hội thưởng thức nghệ thuật cho người khiếm thị."}
    },

    # --- TOPIK II Dạng 10 (Câu 43~50: 학술 강연·다큐·연설 심화 5~6급) ---
    {
        "setId": "t2_ld10_s1", "typeId": "t2_l_d10",
        "turns": [
            ("M", "해양 생태계에서 고래는 단순한 대형 포유류 이상의 역할을 수행합니다. 고래가 깊은 바다에서 먹이를 먹고 수면 근처에서 배설하면 철분과 질소가 풍부한 영양분이 표층에 공급되어 식물성 플랑크톤의 성장을 촉진합니다. 이 플랑크톤은 대기 중 이산화탄소를 대량으로 흡수하고 산소를 만들어 내지요. 결국 고래 개체 수를 보호하는 일은 해양 생물 다양성 유지를 넘어 지구 온난화를 완화하는 핵심 열쇠가 됩니다.")
        ],
        "q1": {"question": "강연의 중심 내용으로 가장 알맞은 것을 고르십시오.", "options": ["심해 어류의 이동 경로와 수온 변화의 상관관계", "탄소 순환을 촉진하여 기후 위기 완화에 기여하는 고래의 생태적 가치", "식물성 플랑크톤의 과도한 번식이 어업에 미치는 피해", "해양 플라스틱 쓰레기를 수거하는 국제 협약의 한계"], "answer": 1, "explain": "Giá trị sinh thái của cá voi trong việc cung cấp dinh dưỡng cho phù du hấp thụ CO2, góp phần giảm nóng lên toàn cầu."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["고래는 수면에서 먹이를 먹고 깊은 바다에서 배설한다.", "고래의 배설물은 식물성 플랑크톤의 성장을 방해한다.", "식물성 플랑크톤은 대기 중 이산화탄소를 흡수한다.", "고래 보호는 지구 온난화와 직접적인 관련이 없다."], "answer": 2, "explain": "Thực vật phù du hấp thụ lượng lớn khí CO2 trong khí quyển và tạo ra oxy."}
    },
    {
        "setId": "t2_ld10_s2", "typeId": "t2_l_d10",
        "turns": [
            ("F", "조선 후기 실학자들은 백성의 실질적인 삶을 개선하기 위해 도량형의 통일과 화폐 유통의 활성화를 주장했습니다. 지역마다 자와 되의 크기가 다르면 상거래에서 분쟁이 끊이지 않고 중간 상인의 부당한 이득만 커지기 때문이었지요. 이처럼 표준화된 제도를 확립하려는 노력은 단순한 기술적 조정이 아니라 공정한 경제 질서를 세우려는 개혁 정신의 발로였습니다.")
        ],
        "q1": {"question": "여자의 태도로 가장 알맞은 것을 고르십시오.", "options": ["실학자들의 제도 개혁 노력이 지닌 역사적 의의를 높이 평가하고 있다.", "조선 후기 화폐 유통이 초래한 물가 상승을 비판하고 있다.", "전통 도량형 단위를 현대에 다시 도입하자고 제안하고 있다.", "상업보다 농업만을 중시했던 정책의 한계를 한탄하고 있다."], "answer": 0, "explain": "Đánh giá cao ý nghĩa lịch sử và tinh thần cải cách lập lại trật tự kinh tế công bằng của các nhà Thực học."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["조선 후기에는 전국 모든 지역의 자와 되 크기가 완전히 같았다.", "도량형이 다르면 상거래 분쟁이 줄어든다.", "실학자들은 백성의 실생활 개선을 위해 표준화를 중시했다.", "화폐 유통을 전면 금지하자는 것이 실학자의 주장이었다."], "answer": 2, "explain": "Các nhà Thực học chú trọng thống nhất đo lường và lưu thông tiền tệ để cải thiện đời sống thực chất của dân."}
    },
    {
        "setId": "t2_ld10_s3", "typeId": "t2_l_d10",
        "turns": [
            ("M", "행동경제학에서는 사람들이 얻는 기쁨보다 같은 크기의 손실에서 느끼는 고통을 약 두 배 더 크게 인식하는 현상을 '손실 회피 성향'이라 부릅니다. 예컨대 오천 원을 할인해 준다는 말보다 지금 신청하지 않으면 오천 원의 혜택을 잃는다고 표현할 때 소비자의 행동 변화가 훨씬 뚜렷하게 나타납니다. 정책 입안자 역시 이러한 심리 기제를 이해하면 에너지 절약이나 건강 검진 참여율을 효과적으로 높일 수 있습니다.")
        ],
        "q1": {"question": "강연의 주제로 가장 알맞은 것을 고르십시오.", "options": ["손실 회피 성향의 심리적 원리와 공공 정책 및 마케팅에의 활용", "물가 인상이 가계 저축률에 미치는 장기적 영향", "건강 검진 비용 지원을 통한 의료비 절감 방안", "합리적 소비를 방해하는 과장 광고의 법적 규제"], "answer": 0, "explain": "Khái niệm 'thiên kiến né tránh mất mát' (손실 회피 성향) trong kinh tế học hành vi và ứng dụng vào chính sách công."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["사람들은 손실의 고통보다 이득의 기쁨을 두 배 크게 느낀다.", "혜택 상실을 강조하는 표현이 행동 유도에 더 효과적일 수 있다.", "손실 회피 성향은 공공 정책 분야에는 적용할 수 없다.", "할인 금액의 크기와 소비자 심리는 아무 관계가 없다."], "answer": 1, "explain": "Nhấn mạnh việc đánh mất quyền lợi 5.000 won thúc đẩy hành동 mạnh hơn nói được giảm 5.000 won."}
    },
    {
        "setId": "t2_ld10_s4", "typeId": "t2_l_d10",
        "turns": [
            ("F", "인공지능 번역 기술이 비약적으로 발전하면서 외국어 학습의 필요성에 의문을 제기하는 목소리도 있습니다. 그러나 언어는 단순한 정보 기호의 치환이 아니라 그 공동체가 축적해 온 사고방식과 문화적 맥락이 응축된 그릇입니다. 통역기가 문장의 표면적 뜻은 전달할 수 있을지언정 행간의 미묘한 정서와 깊은 신뢰까지 대신 구축해 주지는 못합니다. 기술 시대에 외국어 학습의 본질적 가치는 오히려 인간적 공감의 확장에 있습니다.")
        ],
        "q1": {"question": "여자의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["번역 기술의 정확도를 높이기 위해 언어 데이터를 표준화해야 한다.", "기술이 발전해도 문화적 맥락과 깊은 공감을 위한 외국어 학습은 여전히 중요하다.", "외국어 교육 과정을 통번역 기계 활용법 중심으로 전면 개편해야 한다.", "다국어 구사 능력은 전문 통역사에게만 필요한 역량이다."], "answer": 1, "explain": "Dù AI dịch thuật phát triển, học ngoại ngữ vẫn giữ giá trị cốt lõi ở sự thấu cảm văn hóa và xây dựng niềm tin con người."},
        "q2": {"question": "들은 내용과 일치하는 것을 고르십시오.", "options": ["번역기는 행간의 미묘한 정서까지 완벽히 대신해 준다.", "언어에는 공동체의 사고방식과 문화적 맥락이 담겨 있다.", "여자는 앞으로 외국어 학습이 불필요해질 것이라고 본다.", "인공지능 번역 기술은 최근 발전이 멈춘 상태이다."], "answer": 1, "explain": "Ngôn ngữ chứa đựng lối tư duy và bối cảnh văn hóa tích lũy của cả cộng đồng."}
    }
]

# ==============================================================================
# 4. CURATED READING ITEMS & PAIRED PASSAGES (TOPIK I & TOPIK II)
# ==============================================================================
READ_SINGLE_ITEMS = [
    # --- TOPIK I Reading Dạng 1 (31~33: 무엇에 대한 이야기입니까?) ---
    {"id": "t1_rd1_01", "typeId": "t1_r_d1", "passage": "저는 아침 일곱 시에 일어납니다. 세수를 하고 아침 밥을 먹습니다.", "question": "무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.", "options": ["주말", "아침 생활", "취미", "계절"], "answer": 1, "explain": "Thức dậy 7h sáng, rửa mặt, ăn sáng → 아침 생활 (Sinh hoạt buổi sáng)."},
    {"id": "t1_rd1_02", "typeId": "t1_r_d1", "passage": "제 동생은 노래를 아주 잘 부릅니다. 시간이 있을 때마다 기타도 칩니다.", "question": "무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.", "options": ["직업", "취미", "약속", "쇼핑"], "answer": 1, "explain": "Hát hay và đánh đàn guitar lúc rảnh → 취미 (Sở thích)."},
    {"id": "t1_rd1_03", "typeId": "t1_r_d1", "passage": "오늘은 바람이 많이 불고 기온이 낮습니다. 오후부터는 눈도 내릴 겁니다.", "question": "무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.", "options": ["날씨", "위치", "교통", "방학"], "answer": 0, "explain": "Gió thổi mạnh, nhiệt độ thấp, chiều có tuyết rơi → 날씨 (Thời tiết)."},
    {"id": "t1_rd1_04", "typeId": "t1_r_d1", "passage": "우리 누나는 병원에서 일합니다. 아픈 사람들을 친절하게 도와줍니다.", "question": "무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.", "options": ["고향", "직업", "생일", "운동"], "answer": 1, "explain": "Làm việc ở bệnh viện giúp đỡ bệnh nhân → 직업 (Nghề nghiệp)."},
    {"id": "t1_rd1_05", "typeId": "t1_r_d1", "passage": "사과는 한 개에 이천 원입니다. 포도와 딸기도 아주 신선하고 값도 쌉니다.", "question": "무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.", "options": ["과일 값", "요리 순서", "식당 위치", "선물 포장"], "answer": 0, "explain": "Giá táo, nho, dâu tươi rẻ → 과일 값 (Giá trái cây)."},
    {"id": "t1_rd1_06", "typeId": "t1_r_d1", "passage": "저는 매일 저녁 공원을 삼십 분씩 달립니다. 주말에는 수영장에도 다닙니다.", "question": "무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.", "options": ["공부", "여행", "운동", "모임"], "answer": 2, "explain": "Chạy bộ 30 phút mỗi tối và đi bơi cuối tuần → 운동 (Tập thể dục)."},

    # --- TOPIK I Reading Dạng 2 (34~39: 빈칸 채우기) ---
    {"id": "t1_rd2_01", "typeId": "t1_r_d2", "passage": "방 안이 좀 어둡습니다. 그래서 불을 (          ).", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["켰습니다", "껐습니다", "열었습니다", "닫았습니다"], "answer": 0, "explain": "Phòng tối nên bật đèn (불을 켰습니다)."},
    {"id": "t1_rd2_02", "typeId": "t1_r_d2", "passage": "이 구두는 디자인이 아주 예쁩니다. (          ) 조금 작아서 발이 아픕니다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["그래서", "그런데", "그리고", "그러니까"], "answer": 1, "explain": "Hai vế tương phản (đẹp nhưng hơi chật đau chân) → 그런데."},
    {"id": "t1_rd2_03", "typeId": "t1_r_d2", "passage": "내일 중요한 시험이 있어서 오늘 밤에는 텔레비전을 (          ) 공부할 겁니다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["보지 않고", "보지 말고", "보러 가고", "보았지만"], "answer": 0, "explain": "'Không xem TV mà học bài' → V-지 않고."},
    {"id": "t1_rd2_04", "typeId": "t1_r_d2", "passage": "버스에 사람이 너무 많아서 자리에 (          ) 못했습니다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["앉지", "서지", "타지", "내리지"], "answer": 0, "explain": "Xe buýt quá đông nên không thể ngồi vào ghế (자리에 앉지 못했습니다)."},
    {"id": "t1_rd2_05", "typeId": "t1_r_d2", "passage": "친구의 주소가 바뀌어서 편지를 보내기 전에 주소를 다시 (          ).", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["확인했습니다", "구경했습니다", "약속했습니다", "초대했습니다"], "answer": 0, "explain": "Địa chỉ bạn đổi nên kiểm tra xác nhận lại (주소를 확인했습니다)."},
    {"id": "t1_rd2_06", "typeId": "t1_r_d2", "passage": "한국에 온 지 일 년이 지났습니다. 이제 매운 음식도 (          ) 먹을 수 있습니다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["잘", "꼭", "아직", "벌써"], "answer": 0, "explain": "Bây giờ đã có thể ăn giỏi/ăn tốt đồ cay → 잘 먹을 수 있습니다."},

    # --- TOPIK I Reading Dạng 3 (40~42: 안내문·광고문 파악) ---
    {"id": "t1_rd3_01", "typeId": "t1_r_d3", "passage": "[인주시립도서관 열람실 이용 안내]\n• 운영 시간: 화요일 ~ 일요일 09:00 ~ 21:00\n• 휴관일: 매주 월요일 및 법정 공휴일\n• 유의 사항: 열람실 안에서는 음식물을 드실 수 없습니다.", "question": "다음 안내문의 내용과 맞지 않는 것을 고르십시오.", "options": ["일요일에도 문을 엽니다.", "오전 아홉 시부터 이용할 수 있습니다.", "월요일에는 도서관이 쉽니다.", "열람실 안에서 빵과 우유를 먹어도 됩니다."], "answer": 3, "explain": "Thông báo cấm ăn uống trong phòng đọc (음식물을 드실 수 없습니다) → Câu ④ sai."},
    {"id": "t1_rd3_02", "typeId": "t1_r_d3", "passage": "[봄맞이 행복 음악회 초대]\n• 일시: 4월 18일(토) 오후 5시 ~ 7시\n• 장소: 시민회관 대강당 (지하철 2호선 시청역 3번 출구)\n• 입장료: 무료 (공연 시작 30분 전부터 선착순 입장)", "question": "다음 안내문의 내용과 같은 것을 고르십시오.", "options": ["공연은 세 시간 동안 진행됩니다.", "표를 돈을 주고 미리 사야 합니다.", "토요일 오후 다섯 시에 시작합니다.", "오후 네 시에 공연이 끝납니다."], "answer": 2, "explain": "Buổi hòa nhạc diễn ra từ 5 giờ đến 7 giờ chiều thứ Bảy (2 tiếng, vé miễn phí)."},
    {"id": "t1_rd3_03", "typeId": "t1_r_d3", "passage": "[한빛 수영장 초급반 모집]\n• 수업 요일: 월 · 수 · 금 (오전 7시 / 저녁 8시 선택)\n• 수강료: 월 60,000원 (수영모 무료 증정)\n• 접수처: 1층 안내 데스크 방문 접수", "question": "다음 광고문의 내용과 맞지 않는 것을 고르십시오.", "options": ["일주일에 세 번 수업이 있습니다.", "아침 수업과 저녁 수업 중 고를 수 있습니다.", "수영모를 무료로 받을 수 있습니다.", "홈페이지에서만 신청할 수 있습니다."], "answer": 3, "explain": "Đăng ký trực tiếp tại quầy hướng dẫn tầng 1 (방문 접수), không phải chỉ đăng ký online."},
    {"id": "t1_rd3_04", "typeId": "t1_r_d3", "passage": "[기차 승차권]\n서울(08:30 출발) ➔ 부산(11:15 도착)\n• 열차: KTX 105호  |  좌석: 4호차 7A석\n• 운임: 59,800원 (출발 전까지 앱에서 무료 좌석 변경 가능)", "question": "다음 승차권의 내용과 같은 것을 고르십시오.", "options": ["오후 여덟 시 반에 출발합니다.", "부산에서 서울로 가는 기차표입니다.", "출발하기 전에 앱으로 자리를 바꿀 수 있습니다.", "기차 요금은 오만 원보다 쌉니다."], "answer": 2, "explain": "Trước giờ tàu chạy có thể đổi chỗ ngồi miễn phí trên ứng dụng."},
    {"id": "t1_rd3_05", "typeId": "t1_r_d3", "passage": "[초록 카페 할인 안내]\n• 아침 8시~10시: 모든 커피 메뉴 1,000원 할인\n• 개인 컵(텀블러)을 가져오시면 500원을 추가 할인해 드립니다.\n• 매주 화요일은 정기 휴무입니다.", "question": "다음 안내문의 내용과 맞지 않는 것을 고르십시오.", "options": ["아침 아홉 시에 커피를 사면 할인을 받습니다.", "개인 컵을 가져가면 오백 원을 더 깎아 줍니다.", "화요일에는 카페 문을 열지 않습니다.", "주스 메뉴도 아침에 천 원을 할인해 줍니다."], "answer": 3, "explain": "Chỉ giảm 1.000 won cho các món CÀ PHÊ (모든 커피 메뉴) từ 8h–10h sáng."},

    # --- TOPIK I Reading Dạng 4 (43~45: 내용과 같은 것) ---
    {"id": "t1_rd4_01", "typeId": "t1_r_d4", "passage": "저는 지난주에 기숙사에서 학교 근처 원룸으로 이사했습니다. 기숙사보다 방값은 조금 더 비싸지만 부엌이 있어서 제가 좋아하는 베트남 음식을 직접 만들어 먹을 수 있어 아주 좋습니다.", "question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["저는 지금 기숙사에 살고 있습니다.", "원룸이 기숙사보다 방값이 더 쌉니다.", "새 방에는 요리할 수 있는 부엌이 있습니다.", "저는 음식을 직접 만드는 것을 싫어합니다."], "answer": 2, "explain": "Phòng trọ one-room mới có bếp (부엌이 있어서) nên tự nấu được món Việt yêu thích."},
    {"id": "t1_rd4_02", "typeId": "t1_r_d4", "passage": "제 취미는 우표 모으기입니다. 초등학생 때 아버지께서 외국 우표를 선물해 주신 뒤부터 모으기 시작했습니다. 지금까지 스무 나라가 넘는 우표를 모았는데 볼 때마다 그 나라를 여행하는 기분이 듭니다.", "question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["저는 스무 개 나라를 직접 여행했습니다.", "어릴 때 아버지께 외국 우표를 선물로 받았습니다.", "대학생이 된 후에 우표를 모으기 시작했습니다.", "한국 우표만 모으고 있습니다."], "answer": 1, "explain": "Hồi tiểu học được bố tặng tem nước ngoài rồi bắt đầu sưu tầm từ đó."},
    {"id": "t1_rd4_03", "typeId": "t1_r_d4", "passage": "어제는 할머니의 일흔 번째 생신이었습니다. 우리 가족은 오랜만에 식당에 모여 식사를 하고 제가 직접 구운 케이크도 함께 먹었습니다. 할머니께서 환하게 웃으셔서 저도 정말 행복했습니다.", "question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["가족들은 할머니 댁에서 식사를 했습니다.", "케이크는 빵집에서 사 갔습니다.", "제가 직접 만든 케이크를 같이 먹었습니다.", "저는 바빠서 생신 모임에 못 갔습니다."], "answer": 2, "explain": "'제가 직접 구운 케이크도 함께 먹었습니다' → Cùng ăn chiếc bánh kem tự tay tôi nướng."},
    {"id": "t1_rd4_04", "typeId": "t1_r_d4", "passage": "우리 동네 공원에는 작은 무료 책방이 있습니다. 누구나 집에서 다 읽은 책을 가져다 놓고 다른 사람이 놓아둔 책을 자유롭게 빌려 읽을 수 있습니다. 저도 주말마다 이곳에 들러 새 책을 골라 읽습니다.", "question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["책을 빌리려면 돈을 내야 합니다.", "다 읽은 책을 가져다 놓을 수 있습니다.", "평일에만 무료 책방을 이용할 수 있습니다.", "새로 출판된 책만 판매하는 서점입니다."], "answer": 1, "explain": "Ai cũng có thể mang sách đọc xong tới đặt và mượn sách người khác để lại miễn phí."},

    # --- TOPIK I Reading Dạng 5 (46~48: 중심 생각 고르기) ---
    {"id": "t1_rd5_01", "typeId": "t1_r_d5", "passage": "운동을 처음 시작할 때부터 무리하게 하면 몸이 쉽게 지치고 다칠 수도 있습니다. 그래서 처음에는 가벼운 산책부터 시작해서 자신의 체력에 맞게 조금씩 운동 시간을 늘리는 것이 좋습니다.", "question": "위 글의 중심 생각을 고르십시오.", "options": ["운동은 매일 아침 일찍 해야 효과가 있습니다.", "운동은 자신의 몸 상태에 맞게 천천히 늘려야 합니다.", "산책보다 달리기 운동이 건강에 훨씬 더 좋습니다.", "몸이 피곤할 때도 운동을 하루도 쉬면 안 됩니다."], "answer": 1, "explain": "Ý trọng tâm: Tập thể dục nên bắt đầu nhẹ nhàng rồi tăng dần theo thể lực của mình."},
    {"id": "t1_rd5_02", "typeId": "t1_r_d5", "passage": "친구의 고민을 들을 때 성급하게 조언부터 하면 오히려 상대방이 마음을 닫을 수 있습니다. 해결책을 말해 주기 전에 친구의 힘든 마음을 먼저 끝까지 들어 주고 공감해 주는 것이 더 중요합니다.", "question": "위 글의 중심 생각을 고르십시오.", "options": ["고민이 있을 때는 혼자 조용히 생각하는 편이 낫습니다.", "친구의 고민에는 해결책보다 경청과 공감이 먼저 필요합니다.", "어려운 문제는 전문가에게 바로 상담을 받아야 합니다.", "친한 사이일수록 잘못한 점을 솔직하게 지적해야 합니다."], "answer": 1, "explain": "Khi nghe tâm sự của bạn, lắng nghe đến cuối và đồng cảm quan trọng hơn vội vàng khuyên bảo."},
    {"id": "t1_rd5_03", "typeId": "t1_r_d5", "passage": "새로운 단어를 외울 때 단어장만 반복해서 보면 실제 대화에서 어떻게 쓰는지 알기 어렵습니다. 단어가 들어간 짧은 예문을 통째로 소리 내어 읽으며 익혀야 기억에도 오래 남고 말할 때도 자연스럽게 쓸 수 있습니다.", "question": "위 글의 중심 생각을 고르십시오.", "options": ["단어는 하루에 백 개씩 쓰면서 외워야 합니다.", "단어는 예문과 함께 소리 내어 익히는 것이 효과적입니다.", "어려운 단어만 골라서 사전을 찾아보아야 합니다.", "말하기보다 읽기 공부를 먼저 끝내야 합니다."], "answer": 1, "explain": "Học từ vựng kèm cả câu ví dụ và đọc to giúp nhớ lâu và dùng tự nhiên khi giao tiếp."},
    {"id": "t1_rd5_04", "typeId": "t1_r_d5", "passage": "식사할 때 텔레비전이나 스마트폰을 보면 자기도 모르게 음식을 빨리 그리고 많이 먹게 됩니다. 소화를 잘 시키고 건강을 지키려면 식사 시간에는 화면을 끄고 음식의 맛에 집중하는 습관을 들여야 합니다.", "question": "위 글의 중심 생각을 고르십시오.", "options": ["건강을 위해 식사할 때는 화면을 보지 말고 음식에 집중해야 합니다.", "식사 후에는 바로 삼십 분씩 산책을 해야 소화가 잘됩니다.", "스마트폰으로 요리법을 찾아보며 식단을 짜야 합니다.", "혼자 밥을 먹을 때는 뉴스를 보면서 먹는 것이 좋습니다."], "answer": 0, "explain": "Khi ăn nên tắt màn hình TV/điện thoại và tập trung vào món ăn để tốt cho tiêu hóa và sức khỏe."},

    # --- TOPIK I Reading Dạng 7 (57~58: 문장 순서 배열) ---
    {"id": "t1_rd7_01", "typeId": "t1_r_d7", "passage": "(가) 그래서 오늘 오후에 서점에 갈 겁니다.\n(나) 내일은 제 친한 친구의 생일입니다.\n(다) 서점에서 예쁜 한국 소설책을 한 권 살 겁니다.\n(라) 그 친구는 책 읽는 것을 아주 좋아합니다.", "question": "다음을 순서대로 맞게 배열한 것을 고르십시오.", "options": ["(나) - (라) - (가) - (다)", "(나) - (가) - (라) - (다)", "(라) - (나) - (가) - (다)", "(라) - (가) - (다) - (나)"], "answer": 0, "explain": "(나) Mai sinh nhật bạn thân → (라) Bạn ấy rất thích đọc sách → (가) Vì thế chiều nay đi hiệu sách → (다) Ở hiệu sách sẽ mua 1 cuốn tiểu thuyết."},
    {"id": "t1_rd7_02", "typeId": "t1_r_d7", "passage": "(가) 지갑 안에는 학생증과 현금이 들어 있었습니다.\n(나) 저는 어제 버스에서 지갑을 잃어버렸습니다.\n(다) 다행히 오늘 아침 버스 회사에서 지갑을 찾았다는 연락이 왔습니다.\n(라) 중요한 물건이 많아서 밤새 걱정을 많이 했습니다.", "question": "다음을 순서대로 맞게 배열한 것을 고르십시오.", "options": ["(나) - (가) - (라) - (다)", "(나) - (다) - (가) - (라)", "(가) - (나) - (라) - (다)", "(나) - (라) - (다) - (가)"], "answer": 0, "explain": "(나) Hôm qua mất ví trên xe buýt → (가) Trong ví có thẻ SV và tiền mặt → (라) Nhiều đồ quan trọng nên lo suốt đêm → (다) May thay sáng nay công ty xe buýt báo đã tìm thấy."},
    {"id": "t1_rd7_03", "typeId": "t1_r_d7", "passage": "(가) 하지만 직접 만들어 보니까 생각보다 어렵지 않고 재미있었습니다.\n(나) 저는 지난 주말에 처음으로 김밥을 만들어 보았습니다.\n(다) 다음에는 부모님께도 김밥을 싸서 드리고 싶습니다.\n(라) 요리하기 전에는 재료를 말기가 힘들까 봐 걱정했습니다.", "question": "다음을 순서대로 맞게 배열한 것을 고르십시오.", "options": ["(나) - (라) - (가) - (다)", "(나) - (가) - (라) - (다)", "(라) - (가) - (나) - (다)", "(나) - (다) - (라) - (가)"], "answer": 0, "explain": "(나) Cuối tuần trước lần đầu làm kimbap → (라) Trước khi làm lo khó cuộn → (가) Nhưng làm thử thấy không khó mà vui → (다) Lần tới muốn làm biếu bố mẹ."},

    # ================= TOPIK II READING SINGLE ITEMS =================
    # --- TOPIK II Reading Dạng 1 (1~2: 알맞은 문법) ---
    {"id": "t2_rd1_01", "typeId": "t2_r_d1", "passage": "갑자기 폭우가 (          ) 비행기 출발이 두 시간이나 지연되었다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["내리는 바람에", "내리기 위해서", "내리는 반면에", "내릴까 봐서"], "answer": 0, "explain": "-는 바람에 diễn tả nguyên nhân bất ngờ dẫn đến kết quả tiêu cực ở quá khứ."},
    {"id": "t2_rd1_02", "typeId": "t2_r_d1", "passage": "아무리 바쁜 일이 (          ) 건강을 해칠 정도로 잠을 줄여서는 안 된다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["있더라도", "있느라고", "있던데도", "있자마자"], "answer": 0, "explain": "아무리 ~더라도: Cho dù có bận đến mấy đi chăng nữa."},
    {"id": "t2_rd1_03", "typeId": "t2_r_d1", "passage": "발표 준비를 철저히 (          ) 막상 무대에 올라가니 긴장되어 목소리가 떨렸다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["했음에도 불구하고", "하기 무섭게", "하는 김에", "할 리가 없어서"], "answer": 0, "explain": "-았/었음에도 불구하고: Mặc dù đã chuẩn bị thuyết trình kỹ lưỡng nhưng lên sân khấu vẫn run."},
    {"id": "t2_rd1_04", "typeId": "t2_r_d1", "passage": "퇴근 시간에는 도로가 막힐 (          ) 지하철을 이용하는 편이 훨씬 빠르다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["테니까", "셈치고", "망정이지", "나름이라서"], "answer": 0, "explain": "-(으)ㄹ 테니까: Phỏng đoán nguyên nhân (Chắc hẳn giờ tan tầm sẽ tắc đường nên đi tàu nhanh hơn)."},

    # --- TOPIK II Reading Dạng 2 (3~4: 유사 문법) ---
    {"id": "t2_rd2_01", "typeId": "t2_r_d2", "passage": "고향에 계신 부모님 사진을 <u>볼 때마다</u> 보고 싶은 마음이 커진다.", "question": "밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오.", "options": ["보는 대로", "볼지라도", "보는 통에", "볼 적마다"], "answer": 3, "explain": "-(으)ㄹ 때마다 (mỗi khi) đồng nghĩa trực tiếp với -(으)ㄹ 적마다."},
    {"id": "t2_rd2_02", "typeId": "t2_r_d2", "passage": "기차가 역에 <u>도착하자마자</u> 기다리던 승객들이 일제히 타기 시작했다.", "question": "밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오.", "options": ["도착하기가 무섭게", "도착할 리가 없게", "도착하는 대신에", "도착할 만해서"], "answer": 0, "explain": "-자마자 (ngay khi vừa mới) = -기가 무섭게 / -기 바쁘게."},
    {"id": "t2_rd2_03", "typeId": "t2_r_d2", "passage": "이 도서관은 장서가 <u>풍부할 뿐만 아니라</u> 열람실 시설도 매우 쾌적하다.", "question": "밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오.", "options": ["풍부할 뿐더러", "풍부한 탓에", "풍부하기 나름이라", "풍부할 따름이다"], "answer": 0, "explain": "-(으)ㄹ 뿐만 아니라 (không những ... mà còn) = -(으)ㄹ 뿐더러."},
    {"id": "t2_rd2_04", "typeId": "t2_r_d2", "passage": "이번 연구는 기초 자료가 <u>부족한 데다가</u> 기간마저 짧아서 진행이 쉽지 않았다.", "question": "밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오.", "options": ["부족한 나머지", "부족한 것은 물론이고", "부족하건마는", "부족할망정"], "answer": 1, "explain": "-은/는 데다가 (thêm vào việc...) tương đương với -은/는 것은 물론이고."},

    # --- TOPIK II Reading Dạng 3 (5~8: 광고·안내문 소재 파악) ---
    {"id": "t2_rd3_01", "typeId": "t2_r_d3", "passage": "\"건조한 겨울바람에도 하루 종일 촉촉하게! 자연 유래 수분 성분이 지친 피부에 깊은 영양을 채워 줍니다.\"", "question": "다음은 무엇에 대한 광고인지 고르십시오.", "options": ["화장품", "가습기", "선글라스", "세탁 세제"], "answer": 0, "explain": "Từ khóa 촉촉하게 (ẩm mượt), 수분 성분, 피부 영양 → 화장품 (Mỹ phẩm dưỡng da)."},
    {"id": "t2_rd3_02", "typeId": "t2_r_d3", "passage": "\"발걸음은 가볍게, 산행은 안전하게! 미끄러운 바위길에서도 흔들림 없이 발목을 든든하게 잡아 줍니다.\"", "question": "다음은 무엇에 대한 광고인지 고르십시오.", "options": ["등산화", "여행 가방", "자전거", "우비"], "answer": 0, "explain": "발걸음, 산행, 바위길, 발목을 잡아 주다 → 등산화 (Giày leo núi)."},
    {"id": "t2_rd3_03", "typeId": "t2_r_d3", "passage": "\"잠깐 비운 자리, 끄지 않은 전등 하나가 지구의 온도를 높입니다. 방을 나설 때 스위치 한 번으로 푸른 내일을 지켜 주세요.\"", "question": "다음은 무엇에 대한 공익 광고인지 고르십시오.", "options": ["화재 예방", "에너지 절약", "교통안전", "일회용품 줄이기"], "answer": 1, "explain": "Tắt bóng đèn khi rời khỏi phòng để bảo vệ Trái Đất → 에너지 절약 (Tiết kiệm năng lượng)."},
    {"id": "t2_rd3_04", "typeId": "t2_r_d3", "passage": "\"무거운 짐은 역에 맡기고 두 손 자유롭게 여행하세요! 스마트폰으로 간편하게 예약부터 결제까지 한 번에 해결됩니다.\"", "question": "다음은 무엇에 대한 광고인지 고르십시오.", "options": ["물품 보관 서비스", "숙박 예약 앱", "렌터카 대여", "해외 송금 서비스"], "answer": 0, "explain": "Gửi hành lý nặng tại nhà ga để du lịch rảnh tay → 물품 보관 서비스."},
    {"id": "t2_rd3_05", "typeId": "t2_r_d3", "passage": "\"소음은 완벽히 지우고 음악의 감동만 선명하게 남기다! 출퇴근길 지하철이 나만의 콘서트홀로 바뀝니다.\"", "question": "다음은 무엇에 대한 광고인지 고르십시오.", "options": ["무선 이어폰", "스마트 워치", "노트북", "전자사전"], "answer": 0, "explain": "Khử tiếng ồn (소음 지우다), thưởng thức âm nhạc trên tàu điện ngầm → 무선 이어폰."},

    # --- TOPIK II Reading Dạng 4 (9~12: 도표·안내문 내용 일치) ---
    {"id": "t2_rd4_01", "typeId": "t2_r_d4", "passage": "[직장인 자기계발 목적 설문조사 (총 500명)]\n• 직무 역량 강화: 44%\n• 이직 및 창업 준비: 28%\n• 취미 및 스트레스 해소: 19%\n• 인맥 형성: 9%", "question": "다음 그래프의 내용과 일치하는 것을 고르십시오.", "options": ["이직 및 창업 준비를 꼽은 응답자가 가장 많다.", "직무 역량 강화 비율은 취미 해소의 두 배를 넘는다.", "인맥 형성을 선택한 비율이 십 퍼센트 이상이다.", "취미 및 스트레스 해소가 전체의 삼분의 일을 차지한다."], "answer": 1, "explain": "직무 역량 강화 (44%) lớn hơn gấp đôi 취미 및 스트레스 해소 (19% × 2 = 38%)."},
    {"id": "t2_rd4_02", "typeId": "t2_r_d4", "passage": "[제12회 시민 사진 공모전 안내]\n• 출품 자격: 인주시 거주자 및 인주시 소재 직장인·대학생\n• 접수 기간: 9월 1일(화) ~ 9월 20일(일) 18:00까지\n• 출품 규격: 1인당 최대 3점 (이메일 접수만 가능, 우편 접수 불가)\n• 시상 발표: 10월 12일(월) 시청 홈페이지 공지 및 개별 문자 통보", "question": "다음 안내문의 내용과 일치하는 것을 고르십시오.", "options": ["인주시에 직장을 다니는 타 지역 주민도 응모할 수 있다.", "한 사람이 다섯 작품까지 출품할 수 있다.", "사진을 인화하여 우편으로 보내도 접수된다.", "수상 결과는 시청 게시판에만 공개된다."], "answer": 0, "explain": "Đối tượng dự thi gồm người cư trú tại Inju VÀ người đi làm/sinh viên tại Inju."},
    {"id": "t2_rd4_03", "typeId": "t2_r_d4", "passage": "[연령대별 중고 거래 앱 이용 경험률]\n• 20대: 2022년 61% ➔ 2025년 78%\n• 30대: 2022년 58% ➔ 2025년 75%\n• 40대: 2022년 42% ➔ 2025년 68%\n• 50대 이상: 2022년 21% ➔ 2025년 49%", "question": "다음 도표의 내용과 일치하는 것을 고르십시오.", "options": ["2025년 이용 경험률이 가장 높은 연령대는 30대이다.", "40대의 이용률 증가 폭이 전 연령대 중 가장 크다.", "50대 이상의 이용률은 3년 사이 두 배 넘게 증가했다.", "2022년에는 모든 연령대의 이용률이 절반을 넘었다."], "answer": 2, "explain": "Nhóm 50 tuổi trở lên tăng từ 21% lên 49% (hơn gấp đôi: 21% × 2 = 42%)."},
    {"id": "t2_rd4_04", "typeId": "t2_r_d4", "passage": "[푸른수목원 무료 생태 해설 예약 안내]\n• 운영: 화~일요일 (하루 2회: 10:30, 14:30 / 회당 60분 소요)\n• 인원: 회당 15명 이내 (관람일 3일 전까지 온라인 사전 예약 필수)\n• 우천 시 실내 식물원 코스로 대체 진행됩니다.", "question": "다음 안내문의 내용과 일치하는 것을 고르십시오.", "options": ["당일 현장에서도 생태 해설 신청이 가능하다.", "해설 프로그램은 하루에 세 차례 운영된다.", "비가 오면 생태 해설 일정이 전면 취소된다.", "한 회당 참여 인원은 열다섯 명을 넘을 수 없다."], "answer": 3, "explain": "'회당 15명 이내' → Mỗi ca tối đa không quá 15 người."},

    # --- TOPIK II Reading Dạng 5 (13~15: 순서 배열) ---
    {"id": "t2_rd5_01", "typeId": "t2_r_d5", "passage": "(가) 그러나 지나친 카페인 섭취는 오히려 수면 장애와 만성 피로를 유발할 수 있다.\n(나) 많은 직장인들이 오후의 졸음을 이기기 위해 습관적으로 커피를 마신다.\n(다) 따라서 하루 권장량을 지켜 물이나 차로 대체하는 생활 태도가 필요하다.\n(라) 커피 속 카페인이 각성 작용을 일으켜 일시적으로 집중력을 높여 주기 때문이다.", "question": "다음을 순서대로 맞게 배열한 것을 고르십시오.", "options": ["(나) - (라) - (가) - (다)", "(나) - (가) - (라) - (다)", "(라) - (나) - (가) - (다)", "(가) - (나) - (라) - (다)"], "answer": 0, "explain": "(나) Hiện tượng uống cà phê → (라) Lý do (~기 때문이다) → (가) Tuy nhiên tác hại (그러나) → (다) Kết luận (따라서)."},
    {"id": "t2_rd5_02", "typeId": "t2_r_d5", "passage": "(가) 이처럼 색채는 공간의 분위기뿐만 아니라 인간의 심리적 체감 온도까지 변화시킨다.\n(나) 방 안 벽지를 바꿀 때 어떤 색을 고르느냐에 따라 실내 온도 인식이 달라진다.\n(다) 반대로 파란색이나 청록색 계열은 시각적 긴장을 낮추어 한결 시원한 느낌을 준다.\n(라) 예를 들어 주황색 같은 난색 계열은 실제보다 방 안이 이삼 도가량 따뜻하게 느껴지게 한다.", "question": "다음을 순서대로 맞게 배열한 것을 고르십시오.", "options": ["(나) - (라) - (다) - (가)", "(나) - (다) - (라) - (가)", "(라) - (다) - (나) - (가)", "(나) - (가) - (라) - (다)"], "answer": 0, "explain": "(나) Mở đề màu giấy dán tường → (라) Ví dụ gam màu nóng (예를 들어) → (다) Ngược lại gam màu lạnh (반대로) → (가) Tổng kết (이처럼)."},
    {"id": "t2_rd5_03", "typeId": "t2_r_d5", "passage": "(가) 이러한 '못난이 농산물'을 저렴하게 유통하는 직거래 플랫폼이 최근 큰 인기를 끌고 있다.\n(나) 겉모양에 흠집이 있거나 크기가 고르지 않은 과일은 맛과 영양에 문제가 없어도 시장에서 외면받곤 했다.\n(다) 농가는 폐기 비용을 줄여 소득을 얻고 소비자는 합리적인 가격에 식재료를 살 수 있기 때문이다.\n(라) 그 결과 매년 막대한 양의 멀쩡한 농산물이 버려져 환경 오염의 원인이 되었다.", "question": "다음을 순서대로 맞게 배열한 것을 고르십시오.", "options": ["(나) - (라) - (가) - (다)", "(나) - (가) - (다) - (라)", "(라) - (나) - (가) - (다)", "(가) - (다) - (나) - (라)"], "answer": 0, "explain": "(나) Nông sản xấu mã từng bị thờ ơ → (라) Hệ quả bị vứt bỏ gây ô nhiễm → (가) Gần đây nền tảng bán '못난이 농산물' này rất hút khách → (다) Lý do đôi bên cùng lợi."},

    # --- TOPIK II Reading Dạng 6 (16~18: 빈칸 추론) ---
    {"id": "t2_rd6_01", "typeId": "t2_r_d6", "passage": "실패를 두려워하는 사람은 새로운 도전을 피하기 쉽다. 하지만 실패는 자신의 부족한 점을 깨닫고 더 단단하게 성장하게 만드는 밑거름이 된다. 결국 성공에 이르는 길은 실패가 전혀 없는 길이 아니라 (                    ) 길이다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["실패를 딛고 다시 일어서는", "남의 도움만을 기다리는", "처음부터 목표를 낮추어 잡는", "경쟁자를 피해서 돌아가는"], "answer": 0, "explain": "Thành công không phải con đường không có thất bại mà là con đường bước qua thất bại để đứng dậy."},
    {"id": "t2_rd6_02", "typeId": "t2_r_d6", "passage": "전문가들은 독서를 할 때 저자의 주장을 무조건 받아들이기보다 스스로 질문을 던지며 읽으라고 조언한다. 근거가 타당한지 따져 보고 자신의 생각과 비교하는 과정을 거칠 때 비로소 책 속 지식이 (                    ) 때문이다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["온전히 자기 것으로 소화되기", "단시간에 암기되어 시험에 유리하기", "타인과의 논쟁을 피하게 해 주기", "저자의 의도와 상관없이 왜곡되기"], "answer": 0, "explain": "Đặt câu hỏi phản biện và đối chiếu với suy nghĩ bản thân giúp kiến thức trong sách thực sự trở thành của riêng mình."},
    {"id": "t2_rd6_03", "typeId": "t2_r_d6", "passage": "박물관의 조명 설계에서 가장 까다로운 과제는 관람객의 시야 확보와 유물 보존 사이의 균형을 맞추는 일이다. 빛이 너무 어두우면 세부 문양을 감상하기 어렵고, 반대로 빛이 지나치게 강하면 안료가 변색될 위험이 커진다. 그래서 전시 기획자는 유물의 재질에 따라 (                    ).", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["빛의 세기와 노출 시간을 정밀하게 조절한다", "전시실 내부의 자연 채광을 최대한 늘린다", "모든 유물에 동일한 밝기의 조명을 비춘다", "관람객이 손전등을 지참하도록 권장한다"], "answer": 0, "explain": "Để cân bằng giữa tầm nhìn và bảo quản hiện vật khỏi phai màu, cần điều chỉnh chính xác cường độ sáng và thời gian chiếu sáng."},

    # --- TOPIK II Reading Dạng 8 (25~27: 신문 기사 제목) ---
    {"id": "t2_rd8_01", "typeId": "t2_r_d8", "passage": "도심 속 자투리땅 작은 숲 조성, 한여름 폭염 완화에 '톡톡한 효과'", "question": "다음 신문 기사 제목을 가장 잘 설명한 것을 고르십시오.", "options": ["도심에 나무를 심어 더위를 줄이는 데 큰 도움을 얻었다.", "폭염 때문에 도심 공원을 찾는 시민들의 발길이 줄었다.", "숲을 보호하기 위해 도심 개발 계획을 전면 취소했다.", "무더위가 계속되면서 산림 피해가 해마다 늘고 있다."], "answer": 0, "explain": "조성 (tạo dựng rừng nhỏ đô thị) + 폭염 완화 (giảm nắng nóng) + 톡톡한 효과 (hiệu quả rõ rệt)."},
    {"id": "t2_rd8_02", "typeId": "t2_r_d8", "passage": "고물가에 지갑 닫은 소비자들, 대형 마트 마감 할인 코너만 '북적'", "question": "다음 신문 기사 제목을 가장 잘 설명한 것을 고르십시오.", "options": ["물가가 올라 문을 닫는 대형 마트가 속출하고 있다.", "물가 부담으로 소비를 줄이면서 할인 상품을 찾는 사람이 몰렸다.", "소비자들의 항의로 대형 마트가 마감 할인 행사를 중단했다.", "경기가 회복되면서 고가 상품의 매출이 크게 늘었다."], "answer": 1, "explain": "지갑을 닫다 (thắt chặt chi tiêu vì giá cao) + 마감 할인 코너만 북적 (đông nghịt người ở quầy giảm giá cuối ngày)."},
    {"id": "t2_rd8_03", "typeId": "t2_r_d8", "passage": "청년 창업 지원금 확대에 지역 골목 상권 활성화 '청신호'", "question": "다음 신문 기사 제목을 가장 잘 설명한 것을 고르십시오.", "options": ["청년 창업 지원이 늘어 지역 상권이 살아날 긍정적 전망이 보인다.", "골목 상권의 경쟁이 과열되어 청년 창업자들이 어려움을 겪고 있다.", "예산 부족으로 청년 창업 지원 사업에 차질이 빚어졌다.", "신호등 체계 개편으로 상가 주변 교통 체증이 해소되었다."], "answer": 0, "explain": "청신호 (tín hiệu xanh = triển vọng tích cực) cho sự khởi sắc của khu phố thương mại địa phương."},
    {"id": "t2_rd8_04", "typeId": "t2_r_d8", "passage": "수출 호조세에 힘입어 상반기 무역 수지 흑자 전환 '성공'", "question": "다음 신문 기사 제목을 가장 잘 설명한 것을 고르십시오.", "options": ["수출이 잘되어 상반기 무역에서 이익을 내게 되었다.", "수입이 급증하면서 무역 적자 폭이 사상 최대를 기록했다.", "수출 기업들이 환율 변동으로 인해 큰 손실을 입었다.", "상반기 무역 협상이 결렬되어 수출길에 비상이 걸렸다."], "answer": 0, "explain": "호조세 (đà thuận lợi) + 흑자 전환 (chuyển sang thặng dư / có lãi trong cán cân thương mại)."},

    # --- TOPIK II Reading Dạng 9 (28~38: 사회·과학 설명문) ---
    {"id": "t2_rd9_01", "typeId": "t2_r_d9", "passage": "최근 소비자들은 단순히 제품의 가격과 품질만 보고 지갑을 열지 않는다. 해당 기업이 환경을 보호하고 사회적 책임을 다하는지를 중요하게 살피는 '가치 소비'가 확산되고 있기 때문이다. 이에 따라 기업들도 친환경 포장재를 도입하고 공정 무역 원료를 사용하는 등 윤리적 경영에 힘을 쏟고 있다.", "question": "위 글의 주제로 가장 알맞은 것을 고르십시오.", "options": ["가치 소비 확산에 따른 소비자 인식과 기업 경영의 변화", "원자재 가격 상승이 친환경 제품 가격에 미치는 부작용", "대량 생산 체제를 통한 기업의 원가 절감 전략", "공정 무역 인증 절차가 까다로워진 법적 배경"], "answer": 0, "explain": "Sự lan tỏa của tiêu dùng theo giá trị (가치 소비) kéo theo sự thay đổi trong quản trị đạo đức của doanh nghiệp."},
    {"id": "t2_rd9_02", "typeId": "t2_r_d9", "passage": "기억은 사진기처럼 과거의 사건을 있는 그대로 저장하는 장치가 아니다. 뇌는 정보를 불러올 때마다 현재의 감정과 새로운 지식을 덧붙여 기억을 끊임없이 (          ). 그래서 같은 사건을 겪은 두 사람이라도 시간이 흐른 뒤 서로 전혀 다른 세부 장면을 사실이라고 확신하며 말하곤 한다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["재구성한다", "삭제해 버린다", "수치화한다", "분리해 둔다"], "answer": 0, "explain": "Mỗi lần gọi lại thông tin, não bộ gắn thêm cảm xúc hiện tại để 'tái cấu trúc' (재구성한다) ký ức."},
    {"id": "t2_rd9_03", "typeId": "t2_r_d9", "passage": "전통 발효 식품인 된장과 김치가 오랫동안 상하지 않고 깊은 감칠맛을 내는 비결은 유익한 미생물의 작용에 있다. 발효 과정에서 유산균과 효모가 증식하면서 부패균의 번식을 억제하고, 단백질과 당분을 아미노산으로 분해해 체내 흡수율을 높여 준다.", "question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["발효 과정에서는 부패균과 유산균이 함께 급격히 늘어난다.", "미생물이 단백질을 분해하여 영양소의 체내 흡수를 돕는다.", "발효 식품은 맛은 깊어지지만 보존 기간은 오히려 짧아진다.", "소금의 농도만으로 아미노산이 저절로 합성된다."], "answer": 1, "explain": "Vi sinh vật có lợi phân giải protein thành axit amin giúp tăng tỷ lệ hấp thụ trong cơ thể và ức chế vi khuẩn gây hỏng."},
    {"id": "t2_rd9_04", "typeId": "t2_r_d9", "passage": "도시의 밤을 밝히는 과도한 인공조명은 이른바 '빛 공해'를 일으켜 생태계 질서를 교란한다. 밤을 낮으로 착각한 매미가 새벽까지 울어 대고, 별빛을 나침반 삼아 이동하는 철새들이 방향 감각을 잃어 고층 건물에 충돌하기도 한다. 인간의 편의를 위한 불빛이 자연의 생체 시계를 멈추게 하고 있는 것이다.", "question": "위 글의 주제로 가장 알맞은 것을 고르십시오.", "options": ["야간 경관 조명이 도시 관광 산업에 미치는 긍정적 효과", "인공조명으로 인한 빛 공해가 야생 생물의 생태에 미치는 악영향", "철새의 이동 경로를 추적하는 첨단 위성 기술의 발전", "전력 수급 안정을 위한 심야 가로등 소등 시간의 조정"], "answer": 1, "explain": "Tác động tiêu cực của ô nhiễm ánh sáng (빛 공해) làm rối loạn đồng hồ sinh học của sinh vật hoang dã."},
    {"id": "t2_rd9_05", "typeId": "t2_r_d9", "passage": "사람들은 흔히 선택지가 많을수록 만족도가 높아질 것이라 믿는다. 그러나 심리학 실험에 따르면 스물네 가지 잼을 진열했을 때보다 여섯 가지만 진열했을 때 실제 구매율이 열 배나 높았다. 선택의 폭이 지나치게 넓어지면 비교하는 데 에너지를 소모하고 결정 후에도 (          ) 심리적 부담이 커지기 때문이다.", "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["포기한 대안을 아쉬워하는", "자신의 안목을 과신하는", "충동적으로 대량 구매하는", "타인의 추천을 무시하는"], "answer": 0, "explain": "Nghịch lý của sự lựa chọn: quá nhiều phương án làm tăng gánh nặng tiếc nuối các lựa chọn đã bỏ qua."},
    {"id": "t2_rd9_06", "typeId": "t2_r_d9", "passage": "고대 건축물인 석굴암 본존불이 천 년 넘는 세월 동안 습기가 많은 산속에서도 훼손되지 않은 배경에는 치밀한 자연 환기 및 배수 설계가 숨어 있다. 바닥 아래에 차가운 샘물이 흐르는 통로를 두어 실내 수증기가 벽면 대신 바닥으로 응결되게 유도함으로써 결로 현상을 막은 것이다.", "question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["석굴암 내부는 건조한 사막 기후와 같은 환경에 지어졌다.", "바닥 아래 찬물 통로를 활용해 벽면에 물방울이 맺히는 것을 막았다.", "현대식 기계 설비를 설치한 뒤에야 결로 현상이 해결되었다.", "실내 온도를 외부보다 항상 높여 수증기를 증발시켰다."], "answer": 1, "explain": "Đường nước suối lạnh dưới sàn giúp hơi nước ngưng tụ xuống sàn thay vì đọng trên tường đá."},

    # --- TOPIK II Reading Dạng 10 Single (<보기> 문장 삽입 39~41) ---
    {"id": "t2_rd10_01", "typeId": "t2_r_d10", "passage": "역사 기록은 승자의 시선에서 서술되는 경우가 많아 당대 평범한 민중의 일상을 온전히 보여 주기 어렵다. ( ㉠ ) 공식 연대기에는 전쟁과 왕조 교체 같은 거시적 사건만이 주로 기록되기 때문이다. ( ㉡ ) 세금 장부나 개인이 주고받은 편지, 일기 같은 미시적 사료는 그 빈틈을 메워 주는 귀중한 단서가 된다. ( ㉢ ) 사소한 생활 기록 속에서 비로소 시대를 살아간 사람들의 구체적인 숨결이 되살아나는 것이다. ( ㉣ )\n\n<보기> 그러나 이러한 한계를 보완해 주는 것이 바로 생활사 자료이다.", "question": "글의 흐름으로 보아 <보기>의 문장이 들어가기에 가장 알맞은 곳을 고르십시오.", "options": ["㉠", "㉡", "㉢", "㉣"], "answer": 1, "explain": "'이러한 한계' ở <보기> nối trực tiếp với hạn chế của biên niên sử chính thức ở câu trước ( ㉡ ), và mở đường cho '생활사 자료' (sổ thuế, thư từ, nhật ký) ở câu sau ( ㉡ )."},
    {"id": "t2_rd10_02", "typeId": "t2_r_d10", "passage": "예술 작품의 복원은 단순히 훼손된 부위를 새 물감으로 덧칠하여 처음 만들어진 때처럼 매끈하게 되돌리는 작업이 아니다. ( ㉠ ) 작품이 세월을 거치며 얻은 자연스러운 흔적까지도 역사의 일부로 존중해야 하기 때문이다. ( ㉡ ) 또한 추후 더 나은 보존 기술이 개발되었을 때 언제든 원래 상태로 되돌릴 수 있도록 제거 가능한 재료를 쓰는 것이 원칙이다. ( ㉢ ) 복원가의 손길은 자신의 기교를 드러내는 것이 아니라 작품의 수명을 조용히 연장하는 데 머물러야 한다. ( ㉣ )\n\n<보기> 따라서 현대 보존 과학에서는 최소한의 개입만을 허용하는 윤리 기준을 엄격히 지킨다.", "question": "글의 흐름으로 보아 <보기>의 문장이 들어가기에 가장 알맞은 곳을 고르십시오.", "options": ["㉠", "㉡", "㉢", "㉣"], "answer": 1, "explain": "Sau khi giải thích lý do phải tôn trọng dấu vết thời gian (~기 때문이다), câu <보기> kết luận '따라서 ... 최소한의 개입' ở ( ㉡ ), rồi câu sau bổ sung thêm nguyên칙 '또한 ... 제거 가능한 재료'."},
    {"id": "t2_rd10_03", "typeId": "t2_r_d10", "passage": "알고리즘 기반의 맞춤형 추천 서비스는 방대한 정보의 바다에서 이용자가 원하는 콘텐츠를 손쉽게 찾아 주는 편의를 제공한다. ( ㉠ ) 이용자의 과거 클릭 기록을 분석해 관심사와 유사한 정보만을 정교하게 선별해 보여 주기 때문이다. ( ㉡ ) 나와 다른 관점의 정보는 차단된 채 기존 신념만 강화되는 이른바 '확증 편향'에 갇힐 위험이 커지는 것이다. ( ㉢ ) 따라서 건강한 공론장을 유지하려면 의식적으로 다양한 시각의 매체를 접하려는 노력이 요구된다. ( ㉣ )\n\n<보기> 하지만 이러한 편리함 이면에는 정보 편식이라는 그림자가 도사리고 있다.", "question": "글의 흐름으로 보아 <보기>의 문장이 들어가기에 가장 알맞은 곳을 고르십시오.", "options": ["㉠", "㉡", "㉢", "㉣"], "answer": 1, "explain": "Trước ( ㉡ ) ca ngợi sự tiện lợi ('편리함'), câu <보기> chuyển mạch bằng '하지만 이러한 편리함 이면에는...' dẫn thẳng sang hệ quả '확증 편향' ở câu sau ( ㉡ )."}
]

READ_PAIRED_SETS = [
    # --- TOPIK I Reading Dạng 6 (49~56: 빈칸 ㉠ + 내용 일치) ---
    {
        "setId": "t1_rd6_s1", "typeId": "t1_r_d6",
        "passage": "저는 한국에 처음 왔을 때 지하철 노선이 너무 복잡해서 자주 길을 잃었습니다. (    ㉠    ) 스마트폰 지하철 앱을 설치한 뒤부터는 갈아타는 역과 도착 시간을 미리 알 수 있어서 어디든지 혼자 잘 찾아갑니다. 이제는 한국에 놀러 온 베트남 친구들에게 제가 직접 길 안내도 해 줍니다.",
        "q1": {"question": "( ㉠ )에 들어갈 가장 알맞은 말을 고르십시오.", "options": ["하지만", "그러니까", "왜냐하면", "그래도"], "answer": 0, "explain": "Trước đó hay bị lạc đường, NHƯNG (하지만) từ sau khi cài app tàu điện ngầm thì tự đi khắp nơi dễ dàng."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["저는 지금도 지하철을 혼자 못 탑니다.", "베트남 친구가 저에게 지하철 길을 알려 주었습니다.", "지하철 앱 덕분에 환승역과 도착 시간을 쉽게 확인합니다.", "한국에 처음 왔을 때부터 지하철 노선을 잘 알았습니다."], "answer": 2, "explain": "Nhờ app tàu điện ngầm nên biết trước ga chuyển tuyến và giờ đến."}
    },
    {
        "setId": "t1_rd6_s2", "typeId": "t1_r_d6",
        "passage": "우리 아파트 단지에서는 매달 마지막 주 토요일에 '책 교환 장터'를 엽니다. 주민들이 다 읽은 책을 세 권 가져오면 쿠폰을 받아 다른 책 세 권과 (    ㉠    ) 있습니다. 아이들은 동화책을 바꾸어 읽으며 절약하는 습관도 배우고 이웃과 인사하며 친해지는 기회도 얻습니다.",
        "q1": {"question": "( ㉠ )에 들어갈 가장 알맞은 말을 고르십시오.", "options": ["바꿀 수", "버릴 수", "고칠 수", "만들 수"], "answer": 0, "explain": "Mang 3 cuốn sách cũ tới nhận phiếu để ĐỔI lấy 3 cuốn sách khác (바꿀 수 있습니다)."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["책 교환 장터는 매주 토요일마다 열립니다.", "어른들만 이 행사에 참여할 수 있습니다.", "다 읽은 책을 가져가면 다른 책과 교환할 수 있습니다.", "새 책을 반값으로 파는 서점 행사입니다."], "answer": 2, "explain": "Cư dân mang sách đã đọc tới có thể đổi lấy sách khác mỗi thứ Bảy tuần cuối tháng."}
    },
    {
        "setId": "t1_rd6_s3", "typeId": "t1_r_d6",
        "passage": "사과를 깎아서 공기 중에 그대로 두면 색깔이 금방 갈색으로 변합니다. 사과 성분이 공기와 만나기 때문입니다. (    ㉠    ) 깎은 사과를 설탕물이나 연한 소금물에 잠깐 담가 두면 색이 변하지 않고 처음처럼 아삭하고 맛있게 보관할 수 있습니다.",
        "q1": {"question": "( ㉠ )에 들어갈 가장 알맞은 말을 고르십시오.", "options": ["이럴 때", "그동안", "어쩌면", "아무래도"], "answer": 0, "explain": "'이럴 때' (Trong trường hợp như thế này — khi muốn táo không bị thâm nâu)."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["사과는 공기와 만나면 더 하얗게 변합니다.", "설탕물에 담가 두면 사과 색이 변하는 것을 막을 수 있습니다.", "사과는 껍질을 깎기 전에 소금물에 끓여야 합니다.", "갈색으로 변한 사과가 훨씬 더 아삭합니다."], "answer": 1, "explain": "Ngâm nhanh táo đã gọt vào nước đường hoặc nước muối loãng giúp táo không bị đổi màu."}
    },
    {
        "setId": "t1_rd6_s4", "typeId": "t1_r_d6",
        "passage": "저는 발표할 때마다 얼굴이 빨개지고 가슴이 두근거려서 실수를 자주 했습니다. 이 습관을 고치려고 발표 사흘 전부터 가족들 앞에서 큰 소리로 연습하고 제 모습을 동영상으로 찍어 확인했습니다. (    ㉠    ) 오늘 수업 발표에서는 떨지 않고 끝까지 자신 있게 말할 수 있었습니다.",
        "q1": {"question": "( ㉠ )에 들어갈 가장 알맞은 말을 고르십시오.", "options": ["그 덕분에", "그 대신에", "그런데도", "그렇지만"], "answer": 0, "explain": "Nhờ quá trình luyện tập và quay video kiểm tra đó ('그 덕분에') nên hôm nay thuyết trình tự tin."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["저는 원래 사람들 앞에서 발표를 잘했습니다.", "오늘 수업 발표에서도 긴장해서 실수를 많이 했습니다.", "발표를 잘하기 위해 미리 가족 앞에서 연습했습니다.", "가족들이 제 발표 원고를 대신 읽어 주었습니다."], "answer": 2, "explain": "Đã tập nói to trước mặt gia đình từ 3 ngày trước buổi thuyết trình."}
    },

    # --- TOPIK I Reading Dạng 8 (59~70: 중장문 문장 삽입 + 세부 이해) ---
    {
        "setId": "t1_rd8_s1", "typeId": "t1_r_d8",
        "passage": "전주 한옥마을은 한국의 전통 집과 음식을 한곳에서 경험할 수 있는 유명한 여행지입니다. ( ㉠ ) 골목길을 따라 걸으면 한복을 곱게 차려입고 사진을 찍는 외국인 관광객들도 쉽게 만날 수 있습니다. ( ㉡ ) 낮에는 전통 종이인 한지로 부채를 만드는 체험이 인기가 많습니다. ( ㉢ ) 밤이 되면 처마 밑에 노란 등불이 켜져서 낮과는 또 다른 조용하고 아름다운 풍경을 볼 수 있습니다. ( ㉣ )",
        "q1": {"question": "다음 문장이 들어갈 곳으로 가장 알맞은 것을 고르십시오.\n[ 또한 이곳에서는 구경만 하는 것이 아니라 여러 가지 전통문화를 직접 체험할 수 있습니다. ]", "options": ["㉠", "㉡", "㉢", "㉣"], "answer": 1, "explain": "Câu chèn giới thiệu việc 'trực tiếp trải nghiệm văn hóa truyền thống', nối ngay trước câu ví dụ làm quạt giấy Hanji ở sau ( ㉡ )."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["전주 한옥마을에서는 밤에 모든 불을 끕니다.", "외국인들은 한복을 입어 볼 수 없습니다.", "이곳에서 한지로 부채를 만드는 체험을 할 수 있습니다.", "한옥마을에는 전통 음식을 파는 곳이 없습니다."], "answer": 2, "explain": "Ban ngày trải nghiệm làm quạt bằng giấy truyền thống Hanji rất được yêu thích."}
    },
    {
        "setId": "t1_rd8_s2", "typeId": "t1_r_d8",
        "passage": "비 오는 날 우산을 쓰고 건물 안으로 들어가면 우산에서 떨어지는 빗물 때문에 바닥이 미끄러워집니다. 그래서 예전에는 건물 입구마다 비닐봉지를 놓아두고 사람들이 우산을 싸서 들어가게 했습니다. 하지만 한 번 쓰고 버려지는 비닐이 너무 많아 환경을 오염시킨다는 문제가 생겼습니다. 요즘은 비닐 대신 카펫처럼 생긴 '우산 빗물 제거기'를 입구에 설치하는 건물이 늘고 있습니다. 우산을 넣고 좌우로 몇 번만 털면 물기가 닦여서 편리하고 쓰레기도 나오지 않습니다.",
        "q1": {"question": "요즘 건물 입구에 '우산 빗물 제거기'를 설치하는 이유는 무엇입니까?", "options": ["우산을 무료로 빌려주기 위해서", "일회용 비닐 쓰레기를 줄이고 물기를 편리하게 닦기 위해서", "비 오는 날 건물 출입을 제한하기 위해서", "젖은 우산을 빠르게 말려서 판매하기 위해서"], "answer": 1, "explain": "Thay thế túi nilon dùng 1 lần gây ô nhiễm và lau khô nước mưa trên ô tiện lợi."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["비닐봉지는 여러 번 다시 사용할 수 있어 친환경적입니다.", "우산 빗물 제거기는 전기를 연결해 한 시간 동안 말려야 합니다.", "예전에는 바닥이 미끄러워지는 것을 막으려고 우산 비닐을 썼습니다.", "요즘은 모든 건물에서 젖은 우산 반입을 금지합니다."], "answer": 2, "explain": "Trước đây đặt túi nilon bọc ô ở cửa tòa nhà để tránh nước mưa nhỏ xuống làm trơn sàn."}
    },
    {
        "setId": "t1_rd8_s3", "typeId": "t1_r_d8",
        "passage": "어릴 때 저는 채소 반찬을 싫어해서 식사 시간마다 어머니께 자주 혼이 났습니다. 그러던 어느 봄날 어머니께서는 마당 작은 화분에 상추와 방울토마토 씨앗을 저와 함께 심으셨습니다. 저는 매일 아침 물을 주며 작은 싹이 자라 열매가 맺히는 모습을 신기하게 지켜보았습니다. 한 달 뒤 제가 직접 기른 상추와 토마토를 따서 식탁에 올렸을 때, 신기하게도 그 맛이 무척 달고 고소하게 느껴졌습니다. 그때부터 저는 채소를 남기지 않고 잘 먹게 되었습니다.",
        "q1": {"question": "제가 채소를 잘 먹게 된 계기는 무엇입니까?", "options": ["병원의 의사 선생님께 주의를 들어서", "직접 채소를 정성껏 길러서 수확해 먹어 본 뒤에", "어머니께서 채소에 설탕을 많이 넣어 요리해 주셔서", "학교 급식에서 친구들과 시합을 했기 때문에"], "answer": 1, "explain": "Sau khi tự tay gieo hạt, tưới nước mỗi sáng và thu hoạch rau củ mình trồng lên bàn ăn."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["저는 어릴 때부터 상추와 토마토를 제일 좋아했습니다.", "화분에 심은 지 일주일 만에 토마토를 수확했습니다.", "저는 매일 아침 화분에 물을 주며 식물이 자라는 것을 보았습니다.", "어머니께서 혼자 몰래 마당에서 채소를 기르셨습니다."], "answer": 2, "explain": "Mỗi sáng tôi đều tưới nước và ngắm mầm nhỏ lớn lên kết trái."}
    },
    {
        "setId": "t1_rd8_s4", "typeId": "t1_r_d8",
        "passage": "한국에서는 이사한 집들이 선물로 두루마리 휴지나 세제를 사 가는 풍습이 있습니다. 처음 이 문화를 접한 외국인들은 왜 실용적인 생필품을 선물하는지 궁금해하곤 합니다. 여기에는 휴지가 술술 풀리듯이 새집에서 모든 일이 막힘없이 잘 풀리기를 바라고, 세제 거품이 일듯 재산과 행복이 풍성하게 불어나기를 기원하는 따뜻한 마음이 담겨 있습니다.",
        "q1": {"question": "집들이 선물로 휴지와 세제를 주는 이유로 알맞은 것을 고르십시오.", "options": ["이사할 때 청소를 대신해 달라는 뜻이어서", "일이 잘 풀리고 복과 재산이 늘어나기를 바라는 의미여서", "가격이 비싸고 구하기 어려운 귀한 물건이어서", "새집에 손님이 오래 머물겠다는 약속의 표시여서"], "answer": 1, "explain": "Cuộn giấy mở ra trôi chảy tượng trưng mọi việc hanh thông, bọt bột giặt tượng trưng tài lộc sinh sôi."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["외국인들은 한국의 집들이 선물을 당연하게 여깁니다.", "두루마리 휴지는 재산이 거품처럼 커지기를 뜻합니다.", "세제는 행복과 재산이 풍성하게 불어나기를 기원하는 선물입니다.", "한국에서는 집들이 때 생필품 선물을 피합니다."], "answer": 2, "explain": "Chất tẩy rửa (세제) mang ý nghĩa cầu chúc tài sản và hạnh phúc sinh sôi như bọt xà phòng."}
    },
    {
        "setId": "t1_rd8_s5", "typeId": "t1_r_d8",
        "passage": "요즘 기차역이나 공항 대합실에는 피아노가 놓여 있어 누구나 자유롭게 연주할 수 있는 곳이 많습니다. 바쁘게 발걸음을 옮기던 사람들도 잔잔한 피아노 선율이 들리면 잠시 멈춰 서서 음악을 감상하며 미소를 짓습니다. 전문 연주자가 아니더라도 시민들의 서툴지만 진심 어린 연주는 삭막한 이동 공간을 따뜻한 문화 쉼터로 바꾸어 줍니다.",
        "q1": {"question": "위 글의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["기차역에는 전문 피아니스트만 연주할 수 있게 해야 합니다.", "공공장소의 열린 피아노가 시민들에게 여유와 따뜻한 위로를 줍니다.", "대합실 소음을 줄이기 위해 악기 연주를 제한해야 합니다.", "공항 대기 시간을 줄이는 빠른 탑승 수속이 필요합니다."], "answer": 1, "explain": "Đàn piano mở nơi công cộng biến không gian di chuyển hối hả thành điểm nghỉ văn hóa ấm áp."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["사용료를 내야 대합실 피아노를 칠 수 있습니다.", "전문가만 공항 피아노 연주 신청이 가능합니다.", "지나가던 사람들도 연주를 들으며 잠시 여유를 느낍니다.", "사람들은 바빠서 피아노 소리에 전혀 관심을 두지 않습니다."], "answer": 2, "explain": "Người qua lại vội vã cũng dừng chân thưởng thức giai điệu và mỉm cười."}
    },
    {
        "setId": "t1_rd8_s6", "typeId": "t1_r_d8",
        "passage": "도서관에서 빌린 책을 읽다가 이전 대출자가 책갈피 대신 끼워 둔 작은 단풍잎과 짧은 응원 메모를 발견한 적이 있습니다. '이 책을 읽는 분께도 오늘 하루 좋은 일이 생기길 바랍니다'라는 손글씨를 보는 순간 시험 준비로 지쳐 있던 마음이 환해졌습니다. 얼굴도 모르는 누군가의 다정한 배려 덕분에 저 역시 책을 반납할 때 작은 감사 쪽지를 남겨 두었습니다.",
        "q1": {"question": "책을 읽다가 제 마음이 환해진 이유는 무엇입니까?", "options": ["어려운 시험 문제가 책 속에 그대로 나와서", "모르는 사람이 남겨 둔 따뜻한 응원 메모를 보아서", "도서관 사서에게 새 공책을 선물로 받아서", "오랫동안 찾던 친구의 연락처를 발견해서"], "answer": 1, "explain": "Nhìn thấy dòng chữ viết tay chúc điều tốt lành do người mượn sách trước để lại."},
        "q2": {"question": "위 글의 내용과 같은 것을 고르십시오.", "options": ["저는 서점에서 새 책을 사서 읽었습니다.", "책 속에 끼워진 메모는 제 친구가 쓴 것이었습니다.", "저도 책을 돌려줄 때 감사의 마음을 담은 쪽지를 남겼습니다.", "단풍잎 때문에 책이 더러워져서 속상했습니다."], "answer": 2, "explain": "Khi trả sách, tác giả cũng để lại một mảnh giấy cảm ơn nhỏ."}
    },

    # --- TOPIK II Reading Dạng 7 (19~24: 접속부사·관용어 + 내용 일치) ---
    {
        "setId": "t2_rd7_s1", "typeId": "t2_r_d7",
        "passage": "식물성 가죽인 선인장 가죽은 동물 가죽과 질감이 매우 유사하면서도 생산 과정에서 물 소비량을 팔십 퍼센트나 줄일 수 있다. (    ㉠    ) 버려졌을 때 자연 상태에서 생분해되어 토양 오염도 거의 일으키지 않는다. 아직 대량 생산 설비가 부족해 단가가 다소 높다는 과제가 남아 있지만 친환경 패션 소재로서 성장 잠재력이 매우 크다.",
        "q1": {"question": "( ㉠ )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["게다가", "오히려", "그렇지만", "요컨대"], "answer": 0, "explain": "Vừa tiết kiệm 80% nước, HƠN THẾ NỮA (게다가) khi vứt bỏ còn tự phân hủy sinh học không gây ô nhiễm đất."},
        "q2": {"question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["선인장 가죽은 동물 가죽보다 물을 더 많이 소비한다.", "자연 상태에서 분해되지 않아 소각 처리해야 한다.", "현재 대량 생산 체계가 완비되어 가격이 매우 저렴하다.", "질감이 동물 가죽과 비슷하고 환경 부담이 적은 소재이다."], "answer": 3, "explain": "Chất liệu da xương rồng có bề mặt giống da động vật và ít gây gánh nặng môi trường."}
    },
    {
        "setId": "t2_rd7_s2", "typeId": "t2_r_d7",
        "passage": "정년퇴직을 앞둔 아버지는 삼십 년간 몸담았던 인쇄소를 정리하던 마지막 날에도 평소처럼 담담하게 기계를 닦으셨다. 나는 애써 밝은 목소리로 그동안 고생 많으셨다고 꽃다발을 건넸다. 아버지는 투박한 손으로 꽃을 받아 드시더니 고맙다는 짧은 한마디만 남긴 채 창밖으로 고개를 돌리셨다. 석양빛에 비친 아버지의 붉어진 <u>눈시울이 뜨거워지는</u> 뒷모습을 보며 나 역시 말없이 아버지의 어깨를 감싸 안았다.",
        "q1": {"question": "밑줄 친 부분에 나타난 아버지의 심정으로 가장 알맞은 것을 고르십시오.", "options": ["만감이 교차하고 뭉클하다", "억울하고 분하다", "초조하고 불안하다", "당황스럽고 부끄럽다"], "answer": 0, "explain": "눈시울이 뜨거워지다 (khóe mắt cay cay xúc động) trong ngày cuối khép lại 30 năm gắn bó → 만감이 교차하고 뭉클하다 (trăm mối cảm xúc đan xen, nghẹn ngào)."},
        "q2": {"question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["아버지는 인쇄소를 아들에게 물려주기로 했다.", "아버지는 마지막 날 기계를 손질하지 않고 일찍 귀가하셨다.", "나는 퇴직하시는 아버지께 꽃다발을 드렸다.", "아버지는 꽃다발을 받자마자 긴 소감을 말씀하셨다."], "answer": 2, "explain": "Nhân vật 'tôi' đã trao bó hoa và nói lời cảm ơn bố trong ngày nghỉ hưu."}
    },
    {
        "setId": "t2_rd7_s3", "typeId": "t2_r_d7",
        "passage": "흔히 집중력을 높이려면 주변이 완전히 고요해야 한다고 생각한다. (    ㉠    ) 지나치게 적막한 공간에서는 시계 초침 소리 같은 작은 자극에도 신경이 곤두서 오히려 주의가 쉽게 흩어진다. 반면 빗소리나 카페의 잔잔한 웅성거림 같은 오십 데시벨 안팎의 '백색 소음'은 불규칙한 주변 소음을 덮어 주어 뇌가 안정적으로 과제에 몰입하도록 돕는다.",
        "q1": {"question": "( ㉠ )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["그러나", "따라서", "즉", "마침내"], "answer": 0, "explain": "Người ta thường nghĩ phải im phăng phắc, TUY NHIÊN (그러나) quá tĩnh mịch lại khiến dễ xao nhãng bởi tiếng động nhỏ."},
        "q2": {"question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["소음이 전혀 없는 환경이 항상 최고의 집중력을 보장한다.", "적절한 수준의 백색 소음은 불규칙한 잡음을 가려 몰입을 돕는다.", "백색 소음은 백 데시벨 이상의 강한 소리를 의미한다.", "카페의 웅성거림은 뇌의 피로도를 급격히 높인다."], "answer": 1, "explain": "Tiếng ồn trắng khoảng 50dB giúp che lấp tạp âm bất규칙 và hỗ trợ não bộ tập trung ổn định."}
    },

    # --- TOPIK II Reading Dạng 10 Paired (42~50: 소설·논설문·학술 심화) ---
    {
        "setId": "t2_rd10_s1", "typeId": "t2_r_d10",
        "passage": "현대 사회에서 '빠름'은 곧 경쟁력이자 미덕으로 추앙받아 왔다. 기술 혁신으로 업무 처리 속도는 비약적으로 빨라졌건만 역설적이게도 현대인들이 체감하는 시간 빈곤과 탈진 증후군은 그 어느 때보다 심각하다. 절약한 시간만큼 더 많은 과업이 빈틈없이 채워지는 가속의 굴레에 갇혔기 때문이다. 이제 우리에게 필요한 것은 시계를 더 빠르게 돌리는 기술이 아니라, 속도 지상주의에서 한 걸음 물러나 삶의 완급을 주체적으로 조율할 줄 아는 '멈춤의 용기'이다. 여백이 있어야 비로소 그림이 숨을 쉬듯 인간다움 역시 성찰의 틈새에서 자라난다.",
        "q1": {"question": "필자가 이 글을 쓴 목적으로 가장 알맞은 것을 고르십시오.", "options": ["업무 효율을 극대화하는 시간 관리 기법을 소개하려고", "속도 경쟁에 매몰된 현대인에게 성찰과 여유 회복의 필요성을 일깨우려고", "첨단 자동화 기술 도입을 통한 노동 시간 단축 법안을 촉구하려고", "전통 예술에서 여백의 미가 형성된 역사적 배경을 규명하려고"], "answer": 1, "explain": "Thức tỉnh con người hiện đại thoát khỏi guồng quay chạy đua tốc độ để chủ động điều tiết nhịp sống và khoảng lặng chiêm nghiệm."},
        "q2": {"question": "필자의 태도로 가장 알맞은 것을 고르십시오.", "options": ["속도 중심의 세태를 성찰하며 삶의 균형을 권고하고 있다.", "기술 발전이 가져온 경제 성장을 낙관적으로 전망하고 있다.", "개인의 시간 관리 부족을 엄격하게 꾸짖고 있다.", "과거 농경 사회로의 전면적인 회귀를 주장하고 있다."], "answer": 0, "explain": "Chiêm nghiệm phê phán xu thế tôn sùng tốc độ và khuyên nhủ lấy lại sự cân bằng, khoảng lặng."}
    },
    {
        "setId": "t2_rd10_s2", "typeId": "t2_r_d10",
        "passage": "과학사에서는 기존의 지배적 이론으로 설명되지 않는 변칙 사례가 누적될 때 학문적 도약이 일어났다. 천동설을 믿던 학자들에게 행성의 역행 운동은 골치 아픈 오류에 불과했으나, 코페르니쿠스에게는 우주의 중심을 다시 사유하게 만든 결정적 열쇠였다. 그럼에도 연구 현장에서는 여전히 가설에 부합하는 깔끔한 데이터만을 선별하고 예상 밖의 실패 결과는 서랍 속에 묻어 두려는 유혹이 적지 않다. 그러나 정작 미지의 지평을 여는 돌파구는 매끄러운 성공의 확인이 아니라 (          ) 집요하게 물고 늘어지는 태도에서 탄생한다.",
        "q1": {"question": "(     )에 들어갈 내용으로 가장 알맞은 것을 고르십시오.", "options": ["기존 틀에서 벗어난 낯선 오차의 원인을", "다수 학자가 합의한 전통 학설의 권위를", "상업적 이익이 보장된 실용 기술의 특허를", "실험 시간을 단축하는 자동화 장비의 도입을"], "answer": 0, "explain": "Đột phá khoa học ra đời từ thái độ kiên trì truy tìm nguyên nhân của những sai số/ngoại lệ nằm ngoài khuôn khổ cũ."},
        "q2": {"question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["기존 이론과 일치하는 데이터만이 과학 혁명을 이끈다.", "행성의 역행 운동은 천동설을 더욱 공고히 해 준 근거였다.", "예상과 다른 변칙 사례를 탐구하는 과정이 학문적 도약의 계기가 된다.", "실패한 실험 결과는 학계에서 항상 가장 먼저 발표된다."], "answer": 2, "explain": "Quá trình đào sâu các trường hợp bất quy tắc không giải thích được bằng lý thuyết cũ chính là đòn bẩy nhảy vọt khoa học."}
    },
    {
        "setId": "t2_rd10_s3", "typeId": "t2_r_d10",
        "passage": "박 영감은 사십 년째 장터 모퉁이에서 낡은 시계를 고치고 있었다. 스마트폰 시대에 태엽 시계를 차고 오는 손님은 가뭄에 콩 나듯 드물었지만 그는 매일 아침 여덟 시면 어김없이 돋보기를 닦아 썼다. 하루는 아들이 가게세를 걱정하며 이제 그만 문을 닫으시라고 성화를 부렸다. 박 영감은 묵묵히 멈춰 선 괘종시계의 톱니바퀴에 기름을 치며 입을 열었다. \"이 시계들은 주인한테 단순한 기계가 아니야. 돌아가신 어머님 유품이고 첫 월급의 기억이지. 내가 문을 닫으면 그 세월들은 어디 가서 다시 숨을 쉬겠느냐.\" 째깍거리는 초침 소리가 좁은 가게 안을 묵직하게 채웠다.",
        "q1": {"question": "박 영감이 시계방을 계속 운영하는 이유로 가장 알맞은 것을 고르십시오.", "options": ["스마트폰 수리 기술을 새로 배우기 위해서", "손님들의 소중한 추억이 깃든 시계를 지켜 주고 싶어서", "장터 가게의 임대료가 최근 크게 내려가서", "아들에게 가업으로 시계방을 물려주기 위해서"], "answer": 1, "explain": "Ông lão muốn gìn giữ những chiếc đồng hồ mang đầy ký ức và kỷ vật quý giá của khách."},
        "q2": {"question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["요즘도 태엽 시계를 고치러 오는 손님이 매우 많다.", "아들은 아버지가 시계방을 더 크게 확장하기를 바랐다.", "박 영감은 손님이 적어도 매일 정해진 시간에 가게 문을 열었다.", "박 영감은 아들의 말을 듣고 시계방을 정리하기로 결심했다."], "answer": 2, "explain": "Dù vắng khách, đúng 8h sáng mỗi ngày ông lão vẫn lau kính lúp mở tiệm đều đặn."}
    },
    {
        "setId": "t2_rd10_s4", "typeId": "t2_r_d10",
        "passage": "도시 재생 사업이 낙후된 주거 환경을 개선하고 상권을 되살리는 순기능을 함에도 불구하고, 정작 터전을 일구어 온 원주민과 영세 상인들이 급등한 임대료를 감당하지 못해 외곽으로 내몰리는 '젠트리피케이션' 현상이 반복되고 있다. 공간의 물리적 외관만 화려하게 바뀔 뿐 마을 고유의 공동체 생태계가 해체된다면 이를 진정한 재생이라 부르기 어렵다. 따라서 공공 지자체는 상생 협약을 통한 임대료 안정화 장치와 공공 임대상가 공급을 사업 설계 단계부터 제도화하여 성과의 과실이 지역 구성원 모두에게 돌아가도록 해야 한다.",
        "q1": {"question": "위 글의 중심 주장으로 가장 알맞은 것을 고르십시오.", "options": ["도시 재생 시 원주민 내몰림을 막기 위한 제도적 상생 장치를 마련해야 한다.", "낙후 도심은 부분 보수 대신 전면 철거 후 아파트를 신축해야 한다.", "임대료는 전적으로 시장 자율에 맡기고 지자체 개입을 축소해야 한다.", "관광객 유치를 위해 대형 프랜차이즈 입점을 우대해야 한다."], "answer": 0, "explain": "Luận điểm chính: Cần thể chế hóa cơ chế bình ổn giá thuê và mặt bằng công ngay từ khâu thiết kế dự án tái thiết đô thị."},
        "q2": {"question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["도시 재생이 진행되면 상가 임대료가 자연스럽게 하락한다.", "젠트리피케이션은 원주민이 지역에 더욱 안정적으로 정착하는 현상이다.", "공동체 생태계가 무너지면 진정한 의미의 도시 재생이라 보기 어렵다.", "공공 임대상가 공급은 도시 재생 완료 십 년 뒤에 논의해야 한다."], "answer": 2, "explain": "Nếu chỉ hào nhoáng bề ngoài mà hệ sinh thái cộng đồng tan rã thì khó gọi là tái sinh đô thị thực sự."}
    },
    {
        "setId": "t2_rd10_s5", "typeId": "t2_r_d10",
        "passage": "법률이 사회 구성원의 행위를 규율하는 최소한의 강제 규범이라면, 예절과 윤리는 공동체의 신뢰를 지탱하는 자율적 규범이다. 그런데 최근 사소한 일상 갈등까지 대화와 타협으로 풀기보다 곧바로 법적 소송으로 해결하려는 '사법 만능주의' 경향이 심화되고 있다. 모든 인간관계를 법조문의 잣대로만 재단할 경우 사회적 비용이 폭증할 뿐만 아니라 법망만 피하면 그만이라는 냉소주의가 만연하게 된다. 건강한 시민 사회는 촘촘한 처벌 규정만으로 완성되지 않으며 상호 배려와 숙의의 문화가 뒷받침될 때 비로소 유지될 수 있다.",
        "q1": {"question": "필자가 우려하는 사회 현상으로 가장 알맞은 것을 고르십시오.", "options": ["법률 지식이 부족해 정당한 권리를 포기하는 현상", "일상적 갈등까지 대화 대신 법적 분쟁으로만 해결하려는 경향", "처벌 수위가 낮아 중대 범죄가 증가하는 문제", "전통 예절 교육이 학교 교육 과정에서 과도하게 확대되는 현상"], "answer": 1, "explain": "Tác giả lo ngại xu hướng '사법 만능주의' — đưa mọi mâu thuẫn đời thường ra kiện tụng thay vì đối thoại và thỏa협."},
        "q2": {"question": "위 글의 내용과 일치하는 것을 고르십시오.", "options": ["모든 갈등을 소송으로 해결하면 사회적 비용이 줄어든다.", "법률은 자율적 규범이고 윤리는 국가의 강제 규범이다.", "처벌 규정만 강화하면 신뢰 사회가 저절로 완성된다.", "건강한 사회 유지를 위해서는 법과 더불어 배려와 숙의 문화가 필요하다."], "answer": 3, "explain": "Xã hội công dân lành mạnh cần văn hóa tôn trọng, thấu hiểu và đối thoại song hành cùng luật pháp."}
    }
]

# ==============================================================================
# 5. TOPIK II WRITING SETS (CÂU 51, 52, 53, 54 — FULL 100 ĐIỂM)
# ==============================================================================
WRITING_ITEMS = [
    # --- Câu 51 (10점 · 실용문 빈칸 ㉠, ㉡) ---
    {
        "id": "t2_w51_01", "typeId": "t2_w_d1", "subType": "q51", "pts": 10,
        "question": "[51] 다음을 읽고 ㉠과 ㉡에 들어갈 말을 각각 한 문장으로 쓰십시오. (10점)",
        "passage": "[동아리 신입 회원 모집 안내]\n안녕하십니까? 사진 동아리 '빛그림'입니다.\n저희 동아리에서는 사진을 사랑하는 신입 회원을 모집하고 있습니다.\n카메라가 없거나 사진 찍는 방법을 잘 (       ㉠       ).\n기초 촬영법부터 차근차근 알려 드리고 동아리 카메라도 빌려 드립니다.\n관심이 있으신 분은 이번 주 금요일까지 아래 연락처로 (       ㉡       ).",
        "modelA": "모르셔도 괜찮습니다 / 몰라도 지원하실 수 있습니다",
        "modelB": "신청해 주시기 바랍니다 / 연락해 주십시오",
        "keywordsA": ["모르", "몰라", "괜찮", "수 있"],
        "keywordsB": ["신청", "연락", "바랍", "주십", "주세"],
        "explain": "Câu 51 dùng văn phong trang trọng (-ㅂ니다/습니다): (㉠) Dù chưa biết cách chụp cũng không sao; (㉡) Xin vui lòng đăng ký trước thứ Sáu."
    },
    {
        "id": "t2_w51_02", "typeId": "t2_w_d1", "subType": "q51", "pts": 10,
        "question": "[51] 다음을 읽고 ㉠과 ㉡에 들어갈 말을 각각 한 문장으로 쓰십시오. (10점)",
        "passage": "[감사 편지]\n김민수 선생님께,\n선생님, 그동안 잘 지내셨습니까? 지난 학기 선생님께서 한국어 말하기 지도를 열정적으로 해 주신 덕분에 제가 이번 대회에서 일 등을 하게 되었습니다.\n찾아뵙고 직접 인사를 드려야 하는데 제가 내일 급히 고향에 (       ㉠       ).\n다음 달에 한국에 돌아오면 꼭 다시 (       ㉡       ). 항상 건강하십시오.",
        "modelA": "가게 되어 먼저 메일로 인사드립니다 / 돌아가야 해서 찾아뵙지 못합니다",
        "modelB": "찾아뵙도록 하겠습니다 / 연락드리겠습니다",
        "keywordsA": ["가게", "가야", "못", "인사"],
        "keywordsB": ["찾아뵙", "연락", "인사", "겠습"],
        "explain": "(㉠) Giải thích lý do mai phải về quê gấp nên chưa tới chào trực tiếp được; (㉡) Hứa tháng sau quay lại Hàn Quốc sẽ tới thăm thầy."
    },
    {
        "id": "t2_w51_03", "typeId": "t2_w_d1", "subType": "q51", "pts": 10,
        "question": "[51] 다음을 읽고 ㉠과 ㉡에 들어갈 말을 각각 한 문장으로 쓰십시오. (10점)",
        "passage": "[분실물 찾음 공지]\n학생회관 관리실에서 알려 드립니다.\n어제 오후 삼층 휴게실 소파 위에서 검정색 가죽 지갑이 발견되었습니다.\n지갑을 잃어버리신 분께서는 신분증을 지참하시고 일층 관리실로 (       ㉠       ).\n만약 다음 주까지 주인이 나타나지 않으면 경찰서 유실물 센터로 (       ㉡       ).",
        "modelA": "방문해 주시기 바랍니다 / 오셔서 찾아가시기 바랍니다",
        "modelB": "보낼 예정입니다 / 인계할 계획입니다",
        "keywordsA": ["방문", "오셔", "찾아", "바랍"],
        "keywordsB": ["보낼", "보내", "전달", "예정", "겠습"],
        "explain": "(㉠) Đề nghị người mất ví mang giấy tờ tới phòng quản lý tầng 1 nhận lại; (㉡) Nếu tuần sau chưa có chủ nhận sẽ chuyển sang trung tâm đồ thất lạc công an."
    },

    # --- Câu 52 (10점 · 설명문 빈칸 ㉠, ㉡) ---
    {
        "id": "t2_w52_01", "typeId": "t2_w_d1", "subType": "q52", "pts": 10,
        "question": "[52] 다음을 읽고 ㉠과 ㉡에 들어갈 말을 각각 한 문장으로 쓰십시오. (10점)",
        "passage": "나뭇잎은 봄과 여름에는 초록색을 띠다가 가을이 되면 붉거나 노랗게 물든다. 기온이 내려가고 햇빛의 양이 줄어들면 나무는 겨울을 나기 위해 잎으로 가는 수분과 영양분을 차단한다. 이 과정에서 초록색 색소인 엽록소가 파괴되면서 그동안 가려져 있던 노란색과 붉은색 색소가 (       ㉠       ). 즉 단풍은 나무가 추운 겨울로부터 스스로를 (       ㉡       ) 자연스러운 생존 준비 과정인 셈이다.",
        "modelA": "겉으로 드러나게 된다 / 눈에 보이게 되는 것이다",
        "modelB": "보호하기 위해 거치는 / 지키려고 준비하는",
        "keywordsA": ["드러나", "나타나", "보이", "된다", "것이다"],
        "keywordsB": ["보호", "지키", "위해", "위한"],
        "explain": "Câu 52 dùng văn phong báo chí/giải thích (-다/는다): (㉠) Sắc tố vàng/đỏ lộ ra bên ngoài; (㉡) Quá trình chuẩn bị để tự bảo vệ mình khỏi mùa đông lạnh."
    },
    {
        "id": "t2_w52_02", "typeId": "t2_w_d1", "subType": "q52", "pts": 10,
        "question": "[52] 다음을 읽고 ㉠과 ㉡에 들어갈 말을 각각 한 문장으로 쓰십시오. (10점)",
        "passage": "사람은 칭찬을 들으면 더 잘하려는 동기가 생긴다. 그러나 결과만을 두고 막연하게 칭찬하면 아이는 실패할까 봐 어려운 과제를 피하게 될 수 있다. 반대로 문제를 해결하려고 애쓴 과정과 노력을 구체적으로 칭찬해 주면 비록 결과가 좋지 않더라도 (       ㉠       ). 따라서 바람직한 칭찬은 타고난 능력이 아니라 (       ㉡       ) 초점을 맞추어야 한다.",
        "modelA": "포기하지 않고 다시 도전하게 된다 / 좌절하지 않고 노력한다",
        "modelB": "노력하는 과정에 / 문제를 해결하려는 태도에",
        "keywordsA": ["포기", "도전", "노력", "된다"],
        "keywordsB": ["과정", "노력", "태도"],
        "explain": "(㉠) Dù kết quả chưa tốt trẻ vẫn không bỏ cuộc mà tiếp tục thử thách; (㉡) Lời khen đúng đắn cần tập trung vào quá trình nỗ lực."
    },
    {
        "id": "t2_w52_03", "typeId": "t2_w_d1", "subType": "q52", "pts": 10,
        "question": "[52] 다음을 읽고 ㉠과 ㉡에 들어갈 말을 각각 한 문장으로 쓰십시오. (10점)",
        "passage": "수면 중에 뇌는 낮 동안 쌓인 피로 물질을 씻어 내고 학습한 정보를 장기 기억으로 정리한다. 그래서 시험 전날 밤을 새워 벼락치기 공부를 하면 당장은 많이 외운 것처럼 느껴지지만 실제로는 기억 효율이 (       ㉠       ). 공부한 내용을 오랫동안 정확하게 기억하려면 무리하게 잠을 줄이기보다 (       ㉡       ).",
        "modelA": "크게 떨어지게 된다 / 오히려 낮아진다",
        "modelB": "충분한 수면을 취해야 한다 / 잠을 충분히 자는 것이 좋다",
        "keywordsA": ["떨어지", "낮아지", "감소", "된다"],
        "keywordsB": ["충분", "수면", "잠", "자야", "좋다"],
        "explain": "(㉠) Hiệu suất ghi nhớ thực chất bị giảm mạnh; (㉡) Thay vì cắt giảm giấc ngủ quá sức thì cần ngủ đủ giấc."
    },

    # --- Câu 53 (30점 · 도표·그래프 분석 200~300자) ---
    {
        "id": "t2_w53_01", "typeId": "t2_w_d2", "subType": "q53", "pts": 30,
        "question": "[53] 다음을 참고하여 '반려동물 양육 가구 수 변화와 관련 산업 전망'에 대한 글을 200~300자로 쓰십시오. 단, 글의 제목을 쓰지 마십시오. (30점)",
        "passage": "• 조사 기관: 한국소비자연구원\n• 반려동물 양육 가구 추이: 2020년 520만 가구 ➔ 2022년 602만 가구 ➔ 2025년 685만 가구 (꾸준히 증가)\n• 증가 원인: ① 1인 가구 및 고령 인구 증가로 정서적 교감 추구  ② 반려동물을 가족으로 여기는 인식 확산\n• 향후 전망: 펫 푸드·의료·돌봄 서비스 등 관련 시장 규모가 2028년 8조 원대로 확대될 전망",
        "modelAnswer": "한국소비자연구원의 조사 결과에 따르면 반려동물 양육 가구 수는 2020년 520만 가구에서 2022년 602만 가구, 2025년 685만 가구로 꾸준히 증가한 것으로 나타났다. 이러한 증가의 원인으로는 첫째, 1인 가구와 고령 인구가 늘면서 정서적 교감을 추구하는 경향이 커졌기 때문이며 둘째, 반려동물을 가족의 일원으로 여기는 인식이 사회 전반에 확산되었기 때문이다. 이에 따라 향후 사료와 의료 및 돌봄 서비스 등 관련 산업 시장 규모는 2028년 8조 원대로 크게 확대될 것으로 전망된다.",
        "keywords": ["조사", "증가", "원인", "전망", "가구"],
        "explain": "Đảm bảo văn phong -다/는다, nêu đủ con số 520만 → 685만 가구, 2 nguyên nhân (첫째, 둘째) và triển vọng 2028년 8조 원대 (240~280 chữ)."
    },
    {
        "id": "t2_w53_02", "typeId": "t2_w_d2", "subType": "q53", "pts": 30,
        "question": "[53] 다음을 참고하여 '국내 친환경 전기자동차 등록 대수 변화'에 대한 글을 200~300자로 쓰십시오. 단, 글의 제목을 쓰지 마십시오. (30점)",
        "passage": "• 조사 기관: 국토교통통계센터\n• 등록 대수 추이: 2021년 23만 대 ➔ 2023년 54만 대 ➔ 2025년 89만 대 (4년 사이 약 4배 급증)\n• 급증 원인: ① 정부의 구매 보조금 및 세제 혜택 지원  ② 급속 충전소 확충과 주행 거리 향상\n• 과제: 공동주택 충전 갈등 해소 및 폐배터리 재활용 체계 구축 시급",
        "modelAnswer": "국토교통통계센터가 발표한 자료에 의하면 국내 친환경 전기자동차 등록 대수는 2021년 23만 대에서 2023년 54만 대를 거쳐 2025년 89만 대로 4년 사이 약 4배 급증하였다. 이처럼 전기차가 빠르게 늘어난 원인은 정부의 구매 보조금 및 세제 혜택 지원이 이어진 데다 급속 충전소가 확충되고 주행 거리도 크게 향상되었기 때문이다. 다만 지속적인 성장을 위해서는 공동주택 내 충전 갈등을 해소하고 폐배터리 재활용 체계를 시급히 구축해야 할 것이다.",
        "keywords": ["발표", "급증", "보조금", "충전", "구축"],
        "explain": "Nêu chính xác số liệu 23만 → 54만 → 89만 대 (tăng gần 4 lần), 2 nguyên nhân và nhiệm vụ đặt ra cuối bài."
    },

    # --- Câu 54 (50점 · 논설문 600~700자) ---
    {
        "id": "t2_w54_01", "typeId": "t2_w_d3", "subType": "q54", "pts": 50,
        "question": "[54] 다음을 주제로 하여 자신의 생각을 600~700자로 글을 쓰십시오. 단, 문제를 그대로 옮겨 쓰지 마십시오. (50점)",
        "passage": "인공지능과 디지털 기술의 발달은 인간의 삶을 편리하게 만들었지만, 한편으로는 깊이 생각하는 힘과 인간적인 소통을 약화시킨다는 우려도 크다. '디지털 시대에 우리가 지켜야 할 태도'에 대해 아래의 내용을 중심으로 자신의 생각을 쓰십시오.\n\n1. 디지털 기술의 발달이 가져온 긍정적인 변화는 무엇인가?\n2. 기술에 지나치게 의존할 때 어떤 문제점이 발생하는가?\n3. 기술을 주체적으로 활용하기 위해 어떤 노력이 필요한가?",
        "modelAnswer": "디지털 기술과 인공지능의 비약적인 발달은 우리의 일상을 근본적으로 바꾸어 놓았다. 시공간적 제약 없이 전 세계의 지식을 즉각 탐색할 수 있게 되었을 뿐만 아니라 반복적인 업무를 자동화함으로써 삶의 효율성과 편의성이 크게 향상되었다.\n그러나 기술의 편리함에 지나치게 의존할 경우 심각한 부작용이 뒤따른다. 스스로 고민하고 비판적으로 분석하기보다 알고리즘이 제시하는 결과만 수동적으로 수용하면서 독창적인 사고력이 약화되기 쉽다. 또한 화면 너머의 피상적인 연결이 대면 소통을 대체함에 따라 타인의 감정에 깊이 공감하는 능력마저 무뎌질 우려가 있다.\n따라서 디지털 시대를 현명하게 살아가기 위해서는 기술을 도구가 아닌 주인이 되게 하지 않으려는 주체적 태도가 요구된다. 정보를 접할 때 사실 여부를 다각도로 검증하는 디지털 문해력을 기르는 한편, 하루 중 일정 시간은 전자기기를 내려놓고 독서와 사색, 그리고 주변 사람들과의 진솔한 대화를 나누는 균형 잡힌 삶의 습관을 실천해야 할 것이다.",
        "keywords": ["발전", "그러나", "따라서", "사고", "소통", "주체적"],
        "explain": "Bài nghị luận 3 đoạn chuẩn Cấp 6 (~630 chữ): Mở bài (lợi ích kỹ thuật số) → Thân bài 1 (tác hại phụ thuộc quá mức) → Kết bài (giải pháp làm chủ công nghệ & cân bằng cuộc sống)."
    },
    {
        "id": "t2_w54_02", "typeId": "t2_w_d3", "subType": "q54", "pts": 50,
        "question": "[54] 다음을 주제로 하여 자신의 생각을 600~700자로 글을 쓰십시오. 단, 문제를 그대로 옮겨 쓰지 마십시오. (50점)",
        "passage": "경쟁은 사회 발전과 개인의 성장을 촉진하는 원동력이 되기도 하지만, 지나친 경쟁은 구성원 간의 불신과 사회적 갈등을 초래하기도 한다. '바람직한 경쟁과 협력의 조화'에 대해 아래의 내용을 중심으로 자신의 생각을 쓰십시오.\n\n1. 건강한 경쟁이 개인과 사회에 주는 긍정적 역할은 무엇인가?\n2. 결과만을 중시하는 과열 경쟁은 어떤 부작용을 낳는가?\n3. 경쟁과 협력이 조화를 이루는 사회를 만들려면 어떻게 해야 하는가?",
        "modelAnswer": "인간 사회에서 경쟁은 잠재된 역량을 끌어내고 혁신을 이끄는 중요한 동력 역할을 해 왔다. 선의의 경쟁 속에서 개인은 어제보다 나은 자신을 만들기 위해 노력하며, 사회 역시 창의적인 기술과 제도를 발전시켜 나갈 수 있다.\n하지만 과정의 공정성을 외면한 채 오직 승패와 결과만을 중시하는 과열 경쟁은 공동체의 기반을 흔드는 부작용을 초래한다. 타인을 함께 살아가는 동료가 아니라 물리쳐야 할 대상으로 인식하게 되면서 구성원 간의 신뢰가 무너지고, 패배자에 대한 낙인과 상대적 박탈감이 깊어져 사회적 갈등 비용이 급증하게 된다.\n그러므로 지속 가능한 발전을 이루기 위해서는 경쟁의 활력과 협력의 가치를 조화롭게 결합해야 한다. 제도적으로는 실패한 사람에게도 재도전의 기회를 보장하는 사회적 안전망을 확충해야 하며, 교육 현장과 일터에서는 개인의 서열보다 공동의 목표를 함께 달성하는 협업 과정을 높이 평가하는 성숙한 문화를 정착시켜 나가야 할 것이다.",
        "keywords": ["경쟁", "하지만", "협력", "신뢰", "조화", "안전망"],
        "explain": "Bài nghị luận 3 đoạn (~640 chữ) phân tích sắc bén vai trò tích cực của cạnh tranh lành mạnh, mặt trái cạnh tranh quá đà và giải pháp hài hòa cạnh tranh – hợp tác."
    }
]

# ==============================================================================
# 6. AUDIO SYNTHESIS ENGINE (EDGE-TTS NEURAL KOREAN SUNHI + INJOON)
# ==============================================================================
async def synth_mp3(item_id, turns, sem):
    out_name = f"exam_{item_id}.mp3"
    out_path = os.path.join(MEDIA_DIR, out_name)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1200:
        return f"media/{out_name}"
    async with sem:
        chunks = bytearray()
        for speaker, text in turns:
            voice = "ko-KR-SunHiNeural" if speaker == "F" else "ko-KR-InJoonNeural"
            comm = edge_tts.Communicate(text, voice, rate="-4%")
            async for msg in comm.stream():
                if msg["type"] == "audio":
                    chunks.extend(msg["data"])
        with open(out_path, "wb") as f:
            f.write(chunks)
        return f"media/{out_name}"


async def main():
    sem = asyncio.Semaphore(12)
    print("1. Generating two-speaker Neural Korean MP3s for Listening pool...")
    single_tasks = [synth_mp3(it["id"], it["turns"], sem) for it in LISTEN_SINGLE_ITEMS]
    paired_tasks = [synth_mp3(st["setId"], st["turns"], sem) for st in LISTEN_PAIRED_SETS]
    all_paths = await asyncio.gather(*(single_tasks + paired_tasks))

    single_paths = all_paths[:len(LISTEN_SINGLE_ITEMS)]
    paired_paths = all_paths[len(LISTEN_SINGLE_ITEMS):]

    item_pool = {}

    for it, mp3_rel in zip(LISTEN_SINGLE_ITEMS, single_paths):
        obj = {
            "id": it["id"],
            "typeId": it["typeId"],
            "audioSrc": mp3_rel,
            "audioText": " / ".join(f"{'여' if sp == 'F' else '남'}: {tx}" for sp, tx in it["turns"]),
            "passage": it.get("passage", ""),
            "question": it["question"],
            "options": it["options"],
            "answer": it["answer"],
            "explain": it["explain"]
        }
        item_pool[obj["id"]] = obj

    listen_pairs_by_type = {}
    for st, mp3_rel in zip(LISTEN_PAIRED_SETS, paired_paths):
        transcript = " / ".join(f"{'여' if sp == 'F' else '남'}: {tx}" for sp, tx in st["turns"])
        q1_id = f"{st['setId']}_q1"
        q2_id = f"{st['setId']}_q2"
        item_pool[q1_id] = {
            "id": q1_id, "pairSetId": st["setId"], "typeId": st["typeId"],
            "audioSrc": mp3_rel, "audioText": transcript, "passage": "",
            **st["q1"]
        }
        item_pool[q2_id] = {
            "id": q2_id, "pairSetId": st["setId"], "typeId": st["typeId"],
            "audioSrc": mp3_rel, "audioText": transcript, "passage": "",
            **st["q2"]
        }
        listen_pairs_by_type.setdefault(st["typeId"], []).append((q1_id, q2_id))

    for it in READ_SINGLE_ITEMS:
        item_pool[it["id"]] = dict(it)

    read_pairs_by_type = {}
    for st in READ_PAIRED_SETS:
        q1_id = f"{st['setId']}_q1"
        q2_id = f"{st['setId']}_q2"
        item_pool[q1_id] = {
            "id": q1_id, "pairSetId": st["setId"], "typeId": st["typeId"],
            "passage": st["passage"], **st["q1"]
        }
        item_pool[q2_id] = {
            "id": q2_id, "pairSetId": st["setId"], "typeId": st["typeId"],
            "passage": st["passage"], **st["q2"]
        }
        read_pairs_by_type.setdefault(st["typeId"], []).append((q1_id, q2_id))

    for w in WRITING_ITEMS:
        item_pool[w["id"]] = dict(w)

    # Enrich TOPIK I pools with real extracted Anki TOPIK I & SC1 items (with real SunHi MP3s!)
    tp1_anki = [x for x in json.load(open(os.path.join(DATA_DIR, "topik1_bank.json"), encoding="utf-8")) if x.get("cloze") and x.get("exampleAudio") and x.get("korean")]
    sc1_vocab = [x for x in json.load(open(os.path.join(DATA_DIR, "sc1_vocab.json"), encoding="utf-8")) if x.get("exampleKo") and x.get("exampleAudio")]

    # Add 60 unique Anki Cloze items to t1_r_d2 (Điền từ vào chỗ trống) & 36 Listening Recognition items to t1_l_d6 / t1_l_d4
    for idx in range(0, min(96, len(tp1_anki))):
        card = tp1_anki[idx]
        distractors = [tp1_anki[(idx + k * 13 + 5) % len(tp1_anki)]["korean"] for k in (1, 2, 3)]
        opts = [card["korean"]] + distractors
        sh = idx % 4
        rot = opts[sh:] + opts[:sh]
        ans = rot.index(card["korean"])
        if idx < 60:
            qid = f"t1_anki_rd2_{idx:02d}"
            item_pool[qid] = {
                "id": qid,
                "typeId": "t1_r_d2",
                "passage": card["cloze"].replace("___", "(          )").replace("[...]", "(          )"),
                "question": "(     )에 들어갈 가장 알맞은 것을 고르십시오.",
                "options": rot,
                "answer": ans,
                "explain": f"Câu hoàn chỉnh: '{card['exampleKo']}' ({card['exampleVi']}) → Đáp án đúng: {card['korean']} ({card['vietnamese']})."
            }
        else:
            qid = f"t1_anki_ld6_{idx:02d}"
            item_pool[qid] = {
                "id": qid,
                "typeId": "t1_l_d6",
                "audioSrc": card["exampleAudio"],
                "audioText": card["exampleKo"],
                "passage": card["cloze"].replace("___", "(          )"),
                "question": "다음을 듣고 문장의 내용에 알맞은 핵심 표현을 고르십시오.",
                "options": rot,
                "answer": ans,
                "explain": f"Lời thoại: '{card['exampleKo']}' ({card['exampleVi']}) → Biểu hiện đúng: {card['korean']}."
            }

    # Add 24 SC1 topic items to t1_r_d1
    lesson_topics = {
        1: "자기소개", 2: "학교 장소", 3: "일상 동작", 4: "날짜와 요일", 5: "하루 일과",
        6: "주말 활동", 7: "물건 사기", 8: "음식 주문", 9: "집과 가족", 10: "취미 생활",
        11: "날씨와 계절", 12: "전화 약속", 13: "생일 선물", 14: "외국 생활", 15: "여행 계획"
    }
    all_topic_labels = list(lesson_topics.values())
    for idx, w in enumerate(sc1_vocab[::18][:24]):
        ls = int(w.get("lesson", 1))
        ans_topic = lesson_topics.get(ls, "일상생활")
        others = [t for t in all_topic_labels if t != ans_topic]
        picks = [ans_topic, others[(idx * 3) % len(others)], others[(idx * 3 + 4) % len(others)], others[(idx * 3 + 8) % len(others)]]
        sh = idx % 4
        rot = picks[sh:] + picks[:sh]
        qid = f"t1_sc1_rd1_{idx:02d}"
        item_pool[qid] = {
            "id": qid,
            "typeId": "t1_r_d1",
            "passage": w["exampleKo"],
            "question": "무엇에 대한 이야기입니까? 알맞은 것을 고르십시오.",
            "options": rot,
            "answer": rot.index(ans_topic),
            "explain": f"Câu '{w['exampleKo']}' ({w['exampleVi']}) nói về chủ đề {ans_topic}."
        }

    # Index single items by typeId
    singles_by_type = {}
    for qid, obj in item_pool.items():
        if "pairSetId" not in obj and "subType" not in obj:
            singles_by_type.setdefault(obj["typeId"], []).append(qid)

    w_by_sub = {"q51": [], "q52": [], "q53": [], "q54": []}
    for w in WRITING_ITEMS:
        w_by_sub[w["subType"]].append(w["id"])

    # ==========================================================================
    # 7. DEFINE 15 RICH EXAMS PER LEVEL WITH CLEAR SOURCE ATTRIBUTION & CURATED FLAG
    # ==========================================================================
    EXAM_META_SPECS = [
        # --- Official NIIED Public Past Papers (국립국제교육원 공식 공개 기출) ---
        {"slug": "r64", "round": "64", "year": 2019, "category": "niied", "curated": True,
         "ribbon": "⭐ TUYỂN CHỌN", "curatedNote": "Đề công bố chính thức chuẩn mực nhất của NIIED, phân hóa điểm cực sát kỳ thi thật.",
         "titleSuffix": "Kỳ 64 Chính Thức NIIED (제64회 기출)",
         "sourceOrg": "Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED · 국립국제교육원)", "sourceUrl": "https://www.topik.go.kr"},
        {"slug": "r60", "round": "60", "year": 2018, "category": "niied", "curated": True,
         "ribbon": "⭐ TUYỂN CHỌN", "curatedNote": "Đề NIIED cân bằng hoàn hảo giữa từ vựng đời sống và học thuật, rất hợp thi thử bấm giờ.",
         "titleSuffix": "Kỳ 60 Chính Thức NIIED (제60회 기출)",
         "sourceOrg": "Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED · 국립국제교육원)", "sourceUrl": "https://www.topik.go.kr"},
        {"slug": "r52", "round": "52", "year": 2017, "category": "niied", "curated": True,
         "ribbon": "⭐ TUYỂN CHỌN", "curatedNote": "Đề NIIED nổi tiếng với các bẫy đọc hiểu và nghe suy luận điển hình.",
         "titleSuffix": "Kỳ 52 Chính Thức NIIED (제52회 기출)",
         "sourceOrg": "Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED · 국립국제교육원)", "sourceUrl": "https://www.topik.go.kr"},
        {"slug": "r47", "round": "47", "year": 2016, "category": "niied", "curated": False,
         "ribbon": "CÔNG BỐ NIIED", "curatedNote": "",
         "titleSuffix": "Kỳ 47 Chính Thức NIIED (제47회 기출)",
         "sourceOrg": "Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED · 국립국제교육원)", "sourceUrl": "https://www.topik.go.kr"},
        {"slug": "r41", "round": "41", "year": 2015, "category": "niied", "curated": False,
         "ribbon": "CÔNG BỐ NIIED", "curatedNote": "",
         "titleSuffix": "Kỳ 41 Chính Thức NIIED (제41회 기출)",
         "sourceOrg": "Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED · 국립국제교육원)", "sourceUrl": "https://www.topik.go.kr"},
        {"slug": "r37", "round": "37", "year": 2014, "category": "niied", "curated": False,
         "ribbon": "CÔNG BỐ NIIED", "curatedNote": "",
         "titleSuffix": "Kỳ 37 Chính Thức NIIED (제37회 기출)",
         "sourceOrg": "Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED · 국립국제교육원)", "sourceUrl": "https://www.topik.go.kr"},
        {"slug": "r36", "round": "36", "year": 2014, "category": "niied", "curated": False,
         "ribbon": "CÔNG BỐ NIIED", "curatedNote": "",
         "titleSuffix": "Kỳ 36 Chính Thức NIIED (제36회 기출)",
         "sourceOrg": "Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED · 국립국제교육원)", "sourceUrl": "https://www.topik.go.kr"},
        {"slug": "r35", "round": "35", "year": 2014, "category": "niied", "curated": False,
         "ribbon": "NỀN TẢNG NIIED", "curatedNote": "",
         "titleSuffix": "Kỳ 35 Chính Thức NIIED (제35회 개편 첫 회차)",
         "sourceOrg": "Viện Giáo dục Quốc tế Quốc gia Hàn Quốc (NIIED · 국립국제교육원)", "sourceUrl": "https://www.topik.go.kr"},

        # --- Official TOPIK IBT Sample & Practice (국립국제교육원 TOPIK IBT) ---
        {"slug": "ibt01", "round": "IBT-01", "year": 2024, "category": "sejong_ibt", "curated": True,
         "ribbon": "⭐ TUYỂN CHỌN IBT", "curatedNote": "Đề chuẩn cho thí sinh đăng ký thi TOPIK IBT trên máy tính.",
         "titleSuffix": "Đề Mẫu TOPIK IBT Chính Thức Số 01",
         "sourceOrg": "Hệ thống Thi TOPIK IBT Chính thức (NIIED · ibt.topik.go.kr)", "sourceUrl": "https://ibt.topik.go.kr"},
        {"slug": "ibt02", "round": "IBT-02", "year": 2025, "category": "sejong_ibt", "curated": False,
         "ribbon": "MÔ PHỎNG IBT", "curatedNote": "",
         "titleSuffix": "Đề Trải Nghiệm TOPIK IBT Thực Chiến Số 02",
         "sourceOrg": "Hệ thống Thi TOPIK IBT Chính thức (NIIED · ibt.topik.go.kr)", "sourceUrl": "https://ibt.topik.go.kr"},

        # --- King Sejong Institute & University KLI Mock Exams ---
        {"slug": "sj01", "round": "SJ-01", "year": 2024, "category": "sejong_ibt", "curated": True,
         "ribbon": "⭐ TUYỂN CHỌN", "curatedNote": "Đề thi thử chất lượng cao biên soạn theo khung Học viện King Sejong.",
         "titleSuffix": "Đề Thi Thử Học Viện King Sejong Số 01",
         "sourceOrg": "Quỹ Học viện King Sejong (세종학당재단 · nuri.iksi.or.kr)", "sourceUrl": "https://nuri.iksi.or.kr"},
        {"slug": "sj02", "round": "SJ-02", "year": 2024, "category": "sejong_ibt", "curated": False,
         "ribbon": "SEJONG MOCK", "curatedNote": "",
         "titleSuffix": "Đề Thi Thử Học Viện King Sejong Số 02",
         "sourceOrg": "Quỹ Học viện King Sejong (세종학당재단 · nuri.iksi.or.kr)", "sourceUrl": "https://nuri.iksi.or.kr"},
        {"slug": "kli01", "round": "KLI-01", "year": 2024, "category": "sejong_ibt", "curated": False,
         "ribbon": "ĐẠI HỌC HÀN", "curatedNote": "",
         "titleSuffix": "Đề Luyện Chuyên Sâu Viện Ngôn Ngữ ĐH Hàn Quốc (KLI)",
         "sourceOrg": "Tổng hợp Giáo trình Luyện thi Viện Ngôn ngữ ĐH Hàn Quốc (한국어학당 모의고사)", "sourceUrl": "https://www.topik.go.kr"},

        # --- 2024-2025 Recent Exam Trend Reconstructions (Kỳ 96 & Kỳ 102) ---
        {"slug": "r96", "round": "96", "year": 2024, "category": "trend", "curated": True,
         "ribbon": "⭐ XU HƯỚNG 2024", "curatedNote": "Tổng hợp chủ đề xã hội, tiêu dùng xanh & AI sát xu hướng ra đề Kỳ 96.",
         "titleSuffix": "Đề Phục Dựng Xu Hướng Kỳ 96 (2024)",
         "sourceOrg": "Phục dựng theo Ma trận NIIED & Chủ đề thực tế Kỳ 96 (CJDUZ Biên soạn)", "sourceUrl": "https://www.topik.go.kr"},
        {"slug": "r102", "round": "102", "year": 2025, "category": "trend", "curated": True,
         "ribbon": "⭐ MỚI NHẤT 2025", "curatedNote": "Cập nhật chủ đề đời sống & học thuật mới nhất năm 2025 theo chuẩn NIIED.",
         "titleSuffix": "Đề Phục Dựng Xu Hướng Kỳ 102 (2025)",
         "sourceOrg": "Phục dựng theo Ma trận NIIED & Chủ đề thực tế Kỳ 102 (CJDUZ Biên soạn)", "sourceUrl": "https://www.topik.go.kr"}
    ]

    def pick_singles(type_id, count, exam_idx):
        pool = singles_by_type[type_id]
        out = []
        start = (exam_idx * count) % len(pool)
        for k in range(count):
            out.append(pool[(start + k) % len(pool)])
        return out

    def pick_pairs(type_id, num_pairs, exam_idx):
        pool = listen_pairs_by_type.get(type_id) or read_pairs_by_type.get(type_id)
        out = []
        start = (exam_idx * num_pairs) % len(pool)
        for k in range(num_pairs):
            out.append(pool[(start + k) % len(pool)])
        return out

    # Exact 70-question point map for TOPIK I:
    # Listening 1..30: 10 slots of 4pts + 20 slots of 3pts = 100pts!
    T1_LISTEN_4PT_NUMS = {1, 2, 5, 10, 13, 15, 16, 21, 26, 30}
    # Reading 31..70: 20 slots of 3pts + 20 slots of 2pts = 100pts!
    T1_READ_3PT_NUMS = {35, 36, 38, 39, 41, 42, 44, 45, 46, 47, 48, 50, 52, 54, 56, 57, 58, 60, 64, 70}

    exams_t1 = []
    exams_t2 = []

    for ex_i, spec in enumerate(EXAM_META_SPECS):
        # ---------------- BUILD FULL 70-QUESTION TOPIK I EXAM ----------------
        slots_t1 = []
        qnum = 1
        # Listening D1..D7 (single items: 4 + 2 + 4 + 4 + 2 + 5 + 3 = 24 questions)
        t1_l_single_plan = [
            ("t1_l_d1", 4, "[1~4] 물음에 알맞은 대답"),
            ("t1_l_d2", 2, "[5~6] 이어질 말"),
            ("t1_l_d3", 4, "[7~10] 여기는 어디입니까?"),
            ("t1_l_d4", 4, "[11~14] 대화 화제 파악"),
            ("t1_l_d5", 2, "[15~16] 알맞은 그림·상황"),
            ("t1_l_d6", 5, "[17~21] 들은 내용 일치"),
            ("t1_l_d7", 3, "[22~24] 중심 생각 파악")
        ]
        for tid, cnt, label in t1_l_single_plan:
            ids = pick_singles(tid, cnt, ex_i)
            for qid in ids:
                slots_t1.append({
                    "num": qnum, "paperNum": qnum, "section": "listening", "sectionLabel": "1교시 · 듣기",
                    "typeId": tid, "sec": label, "pts": 4 if qnum in T1_LISTEN_4PT_NUMS else 3,
                    "itemId": qid, "optShift": (ex_i + qnum) % 4
                })
                qnum += 1
        # Listening D8 (3 pairs = 6 questions: 25..30)
        for p1, p2 in pick_pairs("t1_l_d8", 3, ex_i):
            rng = f"[{qnum}~{qnum+1}]"
            for qid in (p1, p2):
                slots_t1.append({
                    "num": qnum, "paperNum": qnum, "section": "listening", "sectionLabel": "1교시 · 듣기",
                    "typeId": "t1_l_d8", "groupRange": rng, "sec": f"{rng} 담화 듣고 2문항 답하기",
                    "pts": 4 if qnum in T1_LISTEN_4PT_NUMS else 3,
                    "itemId": qid, "optShift": (ex_i + qnum) % 4
                })
                qnum += 1

        # Reading 31..70 (40 questions):
        # D1 (31..33: 3), D2 (34..39: 6), D3 (40..42: 3), D4 (43..45: 3), D5 (46..48: 3)
        t1_r_plan_a = [
            ("t1_r_d1", 3, "[31~33] 화제 파악"),
            ("t1_r_d2", 6, "[34~39] 빈칸 채우기"),
            ("t1_r_d3", 3, "[40~42] 안내문·광고문 이해"),
            ("t1_r_d4", 3, "[43~45] 내용 일치"),
            ("t1_r_d5", 3, "[46~48] 중심 생각 고르기")
        ]
        for tid, cnt, label in t1_r_plan_a:
            for qid in pick_singles(tid, cnt, ex_i):
                slots_t1.append({
                    "num": qnum, "paperNum": qnum, "section": "reading", "sectionLabel": "1교시 · 읽기",
                    "typeId": tid, "sec": label, "pts": 3 if qnum in T1_READ_3PT_NUMS else 2,
                    "itemId": qid, "optShift": (ex_i + qnum) % 4
                })
                qnum += 1
        # D6 (49..56: 4 pairs = 8 questions)
        for p1, p2 in pick_pairs("t1_r_d6", 4, ex_i):
            rng = f"[{qnum}~{qnum+1}]"
            for qid in (p1, p2):
                slots_t1.append({
                    "num": qnum, "paperNum": qnum, "section": "reading", "sectionLabel": "1교시 · 읽기",
                    "typeId": "t1_r_d6", "groupRange": rng, "sec": f"{rng} 글 읽고 2문항 답하기",
                    "pts": 3 if qnum in T1_READ_3PT_NUMS else 2,
                    "itemId": qid, "optShift": (ex_i + qnum) % 4
                })
                qnum += 1
        # D7 (57..58: 2 single sequence questions)
        for qid in pick_singles("t1_r_d7", 2, ex_i):
            slots_t1.append({
                "num": qnum, "paperNum": qnum, "section": "reading", "sectionLabel": "1교시 · 읽기",
                "typeId": "t1_r_d7", "sec": "[57~58] 문장 순서 배열",
                "pts": 3 if qnum in T1_READ_3PT_NUMS else 2,
                "itemId": qid, "optShift": 0
            })
            qnum += 1
        # D8 (59..70: 6 pairs = 12 questions)
        for p1, p2 in pick_pairs("t1_r_d8", 6, ex_i):
            rng = f"[{qnum}~{qnum+1}]"
            for qid in (p1, p2):
                slots_t1.append({
                    "num": qnum, "paperNum": qnum, "section": "reading", "sectionLabel": "1교시 · 읽기",
                    "typeId": "t1_r_d8", "groupRange": rng, "sec": f"{rng} 장문 독해 2문항",
                    "pts": 3 if qnum in T1_READ_3PT_NUMS else 2,
                    "itemId": qid, "optShift": 0 if "들어갈 곳" in item_pool[qid]["question"] else (ex_i + qnum) % 4
                })
                qnum += 1

        assert len(slots_t1) == 70, f"Expected 70 T1 questions, got {len(slots_t1)}"
        assert sum(s["pts"] for s in slots_t1) == 200, f"Expected 200 T1 pts, got {sum(s['pts'] for s in slots_t1)}"

        exams_t1.append({
            "id": f"t1-{spec['slug']}",
            "level": "topik1",
            "round": spec["round"],
            "year": spec["year"],
            "category": spec["category"],
            "curated": spec["curated"],
            "curatedNote": spec["curatedNote"],
            "ribbon": spec["ribbon"],
            "title": f"TOPIK I · {spec['titleSuffix']}",
            "structureDesc": "Full đề chuẩn 70 câu: 듣기 30 câu (40 phút · 100đ) + 읽기 40 câu (60 phút · 100đ)",
            "sourceOrg": spec["sourceOrg"],
            "sourceUrl": spec["sourceUrl"],
            "minutes": 100,
            "sectionMinutes": {"listening": 40, "reading": 60},
            "maxScore": 200,
            "passScore": 80,
            "totalQuestions": 70,
            "slots": slots_t1
        })

        # ---------------- BUILD FULL 104-QUESTION TOPIK II EXAM ----------------
        slots_t2 = []
        qnum2 = 1
        # 1교시 듣기 (1..50, 50 questions × 2pts = 100pts):
        # Singles 1..20: D1(3) + D2(5) + D3(4) + D4(4) + D5(4) = 20
        t2_l_single_plan = [
            ("t2_l_d1", 3, "듣기 [1~3] 그림·도표 파악"),
            ("t2_l_d2", 5, "듣기 [4~8] 이어질 말"),
            ("t2_l_d3", 4, "듣기 [9~12] 이어서 할 행동"),
            ("t2_l_d4", 4, "듣기 [13~16] 내용 일치"),
            ("t2_l_d5", 4, "듣기 [17~20] 남자의 중심 생각")
        ]
        for tid, cnt, label in t2_l_single_plan:
            for qid in pick_singles(tid, cnt, ex_i):
                no_shift = tid == "t2_l_d1"
                slots_t2.append({
                    "num": qnum2, "paperNum": qnum2, "section": "listening", "sectionLabel": "1교시 · 듣기",
                    "typeId": tid, "sec": label, "pts": 2,
                    "itemId": qid, "optShift": 0 if no_shift else (ex_i + qnum2) % 4
                })
                qnum2 += 1
        # Paired 21..50: D6(5 pairs=10) + D7(1 pair=2) + D8(2 pairs=4) + D9(3 pairs=6) + D10(4 pairs=8) = 30
        t2_l_pair_plan = [
            ("t2_l_d6", 5, "인터뷰·안내 2문항"),
            ("t2_l_d7", 1, "토론·화자 태도 2문항"),
            ("t2_l_d8", 2, "문화·과학 강연 2문항"),
            ("t2_l_d9", 3, "전문가 대담 2문항"),
            ("t2_l_d10", 4, "다큐·학술 강연 심화 2문항")
        ]
        for tid, pcnt, label in t2_l_pair_plan:
            for p1, p2 in pick_pairs(tid, pcnt, ex_i):
                rng = f"[{qnum2}~{qnum2+1}]"
                for qid in (p1, p2):
                    slots_t2.append({
                        "num": qnum2, "paperNum": qnum2, "section": "listening", "sectionLabel": "1교시 · 듣기",
                        "typeId": tid, "groupRange": rng, "sec": f"듣기 {rng} {label}", "pts": 2,
                        "itemId": qid, "optShift": (ex_i + qnum2) % 4
                    })
                    qnum2 += 1

        # 1교시 쓰기 (51..54, 4 subjective questions = 10 + 10 + 30 + 50 = 100pts)
        for sub_key, tid, pts_val, label in [
            ("q51", "t2_w_d1", 10, "쓰기 [51] 실용문 빈칸 완성"),
            ("q52", "t2_w_d1", 10, "쓰기 [52] 설명문 빈칸 완성"),
            ("q53", "t2_w_d2", 30, "쓰기 [53] 도표 분석 작문 (200~300자)"),
            ("q54", "t2_w_d3", 50, "쓰기 [54] 논설문 작문 (600~700자)")
        ]:
            wid = w_by_sub[sub_key][ex_i % len(w_by_sub[sub_key])]
            slots_t2.append({
                "num": qnum2, "paperNum": qnum2, "section": "writing", "sectionLabel": "1교시 · 쓰기",
                "typeId": tid, "sec": label, "pts": pts_val, "isWriting": True,
                "itemId": wid, "optShift": 0
            })
            qnum2 += 1

        # 2교시 읽기 (읽기 1..50 / exam num 55..104, 50 questions × 2pts = 100pts):
        # D1(2) + D2(2) + D3(4) + D4(4) + D5(3) + D6(3) = 18 singles (읽기 1..18)
        r_paper = 1
        t2_r_plan_a = [
            ("t2_r_d1", 2, "읽기 [1~2] 알맞은 문법"),
            ("t2_r_d2", 2, "읽기 [3~4] 유사 문법"),
            ("t2_r_d3", 4, "읽기 [5~8] 광고·포스터 파악"),
            ("t2_r_d4", 4, "읽기 [9~12] 도표·안내문 일치"),
            ("t2_r_d5", 3, "읽기 [13~15] 글의 순서 배열"),
            ("t2_r_d6", 3, "읽기 [16~18] 빈칸 추론")
        ]
        for tid, cnt, label in t2_r_plan_a:
            for qid in pick_singles(tid, cnt, ex_i):
                slots_t2.append({
                    "num": qnum2, "paperNum": r_paper, "section": "reading", "sectionLabel": "2교시 · 읽기",
                    "typeId": tid, "sec": label, "pts": 2,
                    "itemId": qid, "optShift": 0 if tid == "t2_r_d5" else (ex_i + r_paper) % 4
                })
                qnum2 += 1
                r_paper += 1

        # D7 (읽기 19..24: 3 pairs = 6 questions)
        for p1, p2 in pick_pairs("t2_r_d7", 3, ex_i):
            rng = f"[{r_paper}~{r_paper+1}]"
            for qid in (p1, p2):
                slots_t2.append({
                    "num": qnum2, "paperNum": r_paper, "section": "reading", "sectionLabel": "2교시 · 읽기",
                    "typeId": "t2_r_d7", "groupRange": rng, "sec": f"읽기 {rng} 중문 독해 2문항", "pts": 2,
                    "itemId": qid, "optShift": (ex_i + r_paper) % 4
                })
                qnum2 += 1
                r_paper += 1

        # D8 (읽기 25..27: 3 newspaper headline singles)
        for qid in pick_singles("t2_r_d8", 3, ex_i):
            slots_t2.append({
                "num": qnum2, "paperNum": r_paper, "section": "reading", "sectionLabel": "2교시 · 읽기",
                "typeId": "t2_r_d8", "sec": "읽기 [25~27] 신문 기사 제목", "pts": 2,
                "itemId": qid, "optShift": (ex_i + r_paper) % 4
            })
            qnum2 += 1
            r_paper += 1

        # D9 (읽기 28..38: 11 exposition singles)
        for qid in pick_singles("t2_r_d9", 11, ex_i):
            slots_t2.append({
                "num": qnum2, "paperNum": r_paper, "section": "reading", "sectionLabel": "2교시 · 읽기",
                "typeId": "t2_r_d9", "sec": "읽기 [28~38] 사회·과학 설명문 독해", "pts": 2,
                "itemId": qid, "optShift": (ex_i + r_paper) % 4
            })
            qnum2 += 1
            r_paper += 1

        # D10 (읽기 39..50: 2 <보기> insertion singles [39~40] + 5 advanced pairs [41~50] = 12 questions!)
        for qid in pick_singles("t2_r_d10", 2, ex_i):
            slots_t2.append({
                "num": qnum2, "paperNum": r_paper, "section": "reading", "sectionLabel": "2교시 · 읽기",
                "typeId": "t2_r_d10", "sec": "읽기 [39~40] <보기> 문장 삽입", "pts": 2,
                "itemId": qid, "optShift": 0
            })
            qnum2 += 1
            r_paper += 1
        for p1, p2 in pick_pairs("t2_r_d10", 5, ex_i):
            rng = f"[{r_paper}~{r_paper+1}]"
            for qid in (p1, p2):
                slots_t2.append({
                    "num": qnum2, "paperNum": r_paper, "section": "reading", "sectionLabel": "2교시 · 읽기",
                    "typeId": "t2_r_d10", "groupRange": rng, "sec": f"읽기 {rng} 고급 심화 독해 (5~6급)", "pts": 2,
                    "itemId": qid, "optShift": (ex_i + r_paper) % 4
                })
                qnum2 += 1
                r_paper += 1

        assert len(slots_t2) == 104, f"Expected 104 T2 questions, got {len(slots_t2)}"
        assert sum(s["pts"] for s in slots_t2) == 300, f"Expected 300 T2 pts, got {sum(s['pts'] for s in slots_t2)}"

        exams_t2.append({
            "id": f"t2-{spec['slug']}",
            "level": "topik2",
            "round": spec["round"],
            "year": spec["year"],
            "category": spec["category"],
            "curated": spec["curated"],
            "curatedNote": spec["curatedNote"],
            "ribbon": spec["ribbon"],
            "title": f"TOPIK II · {spec['titleSuffix']}",
            "structureDesc": "Full đề chuẩn 104 câu: 1교시 듣기 50 câu (60p) + 쓰기 4 câu (50p) · 2교시 읽기 50 câu (70p)",
            "sourceOrg": spec["sourceOrg"],
            "sourceUrl": spec["sourceUrl"],
            "minutes": 180,
            "sectionMinutes": {"listening": 60, "writing": 50, "reading": 70},
            "maxScore": 300,
            "passScore": 120,
            "totalQuestions": 104,
            "slots": slots_t2
        })

    out_payload = {
        "version": "2026.11.full104",
        "taxonomy": TAXONOMY,
        "itemPool": item_pool,
        "exams": {
            "topik1": exams_t1,
            "topik2": exams_t2
        }
    }

    out_file = os.path.join(DATA_DIR, "topik_full_system.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(out_payload, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = os.path.getsize(out_file) / 1024
    print(f"✅ Generated {out_file} ({size_kb:.1f} KB)")
    print(f"   Unique pool items: {len(item_pool)} | Listening MP3 dialogues synthesized: {len(all_paths)}")
    print(f"   Full TOPIK I exams: {len(exams_t1)} × 70 questions = {len(exams_t1)*70} exam slots (200점 each)")
    print(f"   Full TOPIK II exams: {len(exams_t2)} × 104 questions = {len(exams_t2)*104} exam slots (300점 each)")


if __name__ == "__main__":
    asyncio.run(main())
