#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Builds the complete 6-Book Tiered Curriculum, Sub-Part Vocabulary, Textbook (교재)
& Workbook (익힘책 - Sách bài tập) dataset for D ● TOPIK (Quyển 1 -> Quyển 6).
Also enriches sc1_vocab.json with exact textbook sub-part metadata (part, partTitle)
so learners study 8-15 words per part instead of facing 537 lumped words.
"""
import json
import os

WEB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(WEB_DIR, "data")

sc1_vocab_path = os.path.join(DATA_DIR, "sc1_vocab.json")
sc1_grammar_path = os.path.join(DATA_DIR, "sc1_grammar.json")
tp1_bank_path = os.path.join(DATA_DIR, "topik1_bank.json")
sejong_path = os.path.join(DATA_DIR, "sejong_vocab.json")

sc1_vocab = json.load(open(sc1_vocab_path, encoding="utf-8"))
sc1_grammar = json.load(open(sc1_grammar_path, encoding="utf-8"))
tp1_bank = json.load(open(tp1_bank_path, encoding="utf-8"))
sejong_vocab = json.load(open(sejong_path, encoding="utf-8"))

# Build lookup of existing audio from sc1, tp1_bank, sejong by clean korean surface
audio_lookup = {}
for src_list in (sc1_vocab, sejong_vocab, tp1_bank):
    for item in src_list:
        k = (item.get("korean") or "").strip()
        if k and k not in audio_lookup:
            audio_lookup[k] = {
                "wordAudio": item.get("wordAudio") or "",
                "exampleAudio": item.get("exampleAudio") or ""
            }

# ==============================================================================
# 1. EXACT SUB-PART DEFINITIONS FOR QUYỂN 1 (SƠ CẤP 1 · BÀI 01 -> BÀI 15)
#    Splits 537 words into 47 bite-sized textbook parts (7-16 words/part)
# ==============================================================================
SC1_LESSON_PARTS = {
    1: [
        (1, 11, "Phần 1 · Quốc gia (나라)"),
        (12, 25, "Phần 2 · Nghề nghiệp (직업)"),
        (26, 35, "Phần 3 · Xưng hô & Lời chào (인사말)")
    ],
    2: [
        (1, 13, "Phần 1 · Trường học & Cơ sở (학교 시설)"),
        (14, 24, "Phần 2 · Đồ đạc phòng học (교실 물건)"),
        (25, 35, "Phần 3 · Đồ dùng học tập (학용품)"),
        (36, 43, "Phần 4 · Đại từ vị trí & Đồ vật (지시대명사)")
    ],
    3: [
        (1, 12, "Phần 1 · Động từ sinh hoạt cơ bản (기본 동사)"),
        (13, 27, "Phần 2 · Động từ -하다 & Tính từ (하다 동사·형용사)"),
        (28, 43, "Phần 3 · Đồ ăn, Địa điểm & Thời gian (일상 명사)")
    ],
    4: [
        (1, 12, "Phần 1 · Thứ trong tuần & Ngày tháng (요일·날짜)"),
        (13, 22, "Phần 2 · Hôm qua – Hôm nay – Tuần – Năm (시간)"),
        (23, 40, "Phần 3 · Số Hán–Hàn 0–10 & Sự kiện (한자어 수·기념일)")
    ],
    5: [
        (1, 11, "Phần 1 · Các buổi & Giờ phút (하루 시간)"),
        (12, 21, "Phần 2 · Số thuần Hàn 1–10 (고유어 수)"),
        (22, 36, "Phần 3 · Hoạt động trong ngày (일과 표현)")
    ],
    6: [
        (1, 12, "Phần 1 · Hoạt động cuối tuần (주말 활동)"),
        (13, 21, "Phần 2 · Địa điểm & Thể loại phim (장소·영화)"),
        (22, 30, "Phần 3 · Từ để hỏi & Cảm xúc (의문사·감정)")
    ],
    7: [
        (1, 10, "Phần 1 · Danh từ đơn vị đếm (단위 명사)"),
        (11, 24, "Phần 2 · Thực phẩm & Quần áo (과일·의류)"),
        (25, 37, "Phần 3 · Tiền tệ, Giá cả & Mua bán (화폐·쇼핑)")
    ],
    8: [
        (1, 16, "Phần 1 · Món ăn Hàn – Việt tiêu biểu (음식)"),
        (17, 24, "Phần 2 · Mùi vị món ăn (음식 맛)"),
        (25, 33, "Phần 3 · Dụng cụ & Gọi món nhà hàng (식당 표현)")
    ],
    9: [
        (1, 17, "Phần 1 · Vị trí & Phương hướng (위치·방향)"),
        (18, 29, "Phần 2 · Loại hình nhà & Các phòng (주거·방)"),
        (30, 37, "Phần 3 · Đồ nội thất gia đình (가구)"),
        (38, 47, "Phần 4 · Cơ sở tiện ích quanh nhà (동네 시설)")
    ],
    10: [
        (1, 14, "Phần 1 · Thành viên gia đình (가족 호칭)"),
        (15, 26, "Phần 2 · Nghề nghiệp & Công việc (직업·일)"),
        (27, 36, "Phần 3 · Số đếm tuổi 10–100 (나이·수)")
    ],
    11: [
        (1, 13, "Phần 1 · Bốn mùa & Thời tiết (계절·날씨)"),
        (14, 20, "Phần 2 · Hiện tượng khí tượng & Độ C (기상·기온)"),
        (21, 29, "Phần 3 · Trang phục theo mùa (계절 옷차림)")
    ],
    12: [
        (1, 13, "Phần 1 · Các loại điện thoại & Cước phí (전화·요금)"),
        (14, 23, "Phần 2 · Thao tác gọi – nhận – tắt máy (통화 표현)"),
        (24, 29, "Phần 3 · Tin nhắn & Giao tiếp đầu dây (문자·인사)")
    ],
    13: [
        (1, 14, "Phần 1 · Tiệc sinh nhật, Tuổi & Lời mời (생일·초대)"),
        (15, 25, "Phần 2 · Quà tặng & Trang sức (선물 품목)"),
        (26, 31, "Phần 3 · Tặng nhận & Cảm xúc (선물 동사·감정)")
    ],
    14: [
        (1, 13, "Phần 1 · Sở thích & Nghệ thuật (취미·예술)"),
        (14, 26, "Phần 2 · Các môn thể thao (운동 종목)"),
        (27, 33, "Phần 3 · Phó từ tần suất & Năng lực (빈도·능력)")
    ],
    15: [
        (1, 15, "Phần 1 · Phương tiện giao thông (교통수단)"),
        (16, 25, "Phần 2 · Nhà ga, Sân bay & Đường phố (역·도로)"),
        (26, 35, "Phần 3 · Di chuyển, Bao xa & Bao lâu (이동·거리)")
    ]
}

# Enrich sc1_vocab.json in place with book="q1" alias support, part (1..4), partTitle
by_lesson_counter = {}
for w in sc1_vocab:
    ls = w["lesson"]
    by_lesson_counter[ls] = by_lesson_counter.get(ls, 0) + 1
    idx1 = by_lesson_counter[ls]
    assigned_part = 1
    assigned_title = "Phần 1 · Từ vựng trọng tâm"
    for p_idx, (start_i, end_i, p_title) in enumerate(SC1_LESSON_PARTS.get(ls, []), 1):
        if start_i <= idx1 <= end_i:
            assigned_part = p_idx
            assigned_title = p_title
            break
    w["part"] = assigned_part
    w["partTitle"] = assigned_title

with open(sc1_vocab_path, "w", encoding="utf-8") as f:
    json.dump(sc1_vocab, f, ensure_ascii=False, indent=2)

SC1_DIALOGUES_AND_CULTURE = {
    1: ("소개", [
        {"speaker": "민수", "ko": "안녕하세요? 저는 박민수입니다.", "vi": "Xin chào? Tôi là Park Minsu."},
        {"speaker": "흐엉", "ko": "안녕하세요? 제 이름은 흐엉입니다. 저는 베트남 사람입니다.", "vi": "Xin chào? Tên tôi là Hương. Tôi là người Việt Nam."},
        {"speaker": "민수", "ko": "흐엉 씨는 학생입니까?", "vi": "Bạn Hương là sinh viên phải không?"},
        {"speaker": "흐엉", "ko": "네, 대학생입니다. 만나서 반갑습니다.", "vi": "Vâng, tôi là sinh viên đại học. Rất vui được gặp anh."}
    ], "Người Hàn cúi đầu chào nhẹ (인사) khi gặp mặt. Lần đầu làm quen dùng đuôi trang trọng -ㅂ니다/습니다."),
    2: ("학교", [
        {"speaker": "남", "ko": "수진 씨, 여기는 어디입니까?", "vi": "Sujin ơi, đây là đâu vậy?"},
        {"speaker": "수진", "ko": "여기는 도서관입니다. 저기는 학생 식당입니다.", "vi": "Đây là thư viện. Đằng kia là nhà ăn sinh viên."},
        {"speaker": "남", "ko": "교실에 컴퓨터가 있습니까?", "vi": "Trong phòng học có máy tính không?"},
        {"speaker": "수진", "ko": "네, 책상 위에 컴퓨터와 시계가 있습니다.", "vi": "Vâng, trên bàn có máy tính và đồng hồ."}
    ], "Khuôn viên trường đại học Hàn Quốc thường tích hợp đầy đủ thư viện, nhà ăn sinh viên, hiệu sách, bưu điện và phòng CLB (동아리방)."),
    3: ("일상생활", [
        {"speaker": "수진", "ko": "남 씨는 오늘 어디에 갑니까?", "vi": "Hôm nay Nam đi đâu vậy?"},
        {"speaker": "남", "ko": "도서관에 갑니다. 도서관에서 한국어를 공부합니다.", "vi": "Tôi đi đến thư viện. Tôi học tiếng Hàn ở thư viện."},
        {"speaker": "수진", "ko": "오후에는 무엇을 합니까?", "vi": "Buổi chiều bạn làm gì?"},
        {"speaker": "남", "ko": "운동장에서 친구와 운동합니다.", "vi": "Tôi tập thể dục với bạn ở sân vận động."}
    ], "Phân biệt chuẩn tiểu từ '에' (đích đến của 가다/오다) và '에서' (nơi diễn ra hành động ăn, học, làm việc)."),
    4: ("날짜와 요일", [
        {"speaker": "민수", "ko": "흐엉 씨, 오늘이 몇 월 며칠입니까?", "vi": "Hương ơi, hôm nay là ngày mấy tháng mấy?"},
        {"speaker": "흐엉", "ko": "시월 십오 일입니다.", "vi": "Là ngày 15 tháng 10."},
        {"speaker": "민수", "ko": "금요일에 무엇을 합니까?", "vi": "Thứ Sáu bạn làm gì?"},
        {"speaker": "흐엉", "ko": "금요일에 한국어 시험이 있습니다.", "vi": "Vào thứ Sáu tôi có bài thi tiếng Hàn."}
    ], "Tháng 6 trong tiếng Hàn viết và đọc là 유월 (không phải 육월), tháng 10 viết và đọc là 시월 (không phải 십월)."),
    5: ("하루 일과", [
        {"speaker": "유진", "ko": "흐엉 씨는 보통 몇 시에 일어나요?", "vi": "Bạn Hương thường thức dậy lúc mấy giờ?"},
        {"speaker": "흐엉", "ko": "아침 일곱 시에 일어나요. 그리고 여덟 시 반에 학교에 가요.", "vi": "Tôi dậy lúc 7 giờ sáng. Rồi 8 giờ rưỡi đi học."},
        {"speaker": "유진", "ko": "저녁에는 집에서 무엇을 해요?", "vi": "Buổi tối ở nhà bạn làm gì?"},
        {"speaker": "흐엉", "ko": "한국어 숙제를 하고 밤 열한 시에 자요.", "vi": "Tôi làm bài tập tiếng Hàn rồi ngủ lúc 11 giờ đêm."}
    ], "Khi nói giờ + phút: Giờ dùng số thuần Hàn (한 시, 두 시, 세 시...), còn Phút dùng số Hán–Hàn (십 분, 삼십 분)."),
    6: ("주말", [
        {"speaker": "민수", "ko": "지난 주말에 무엇을 했어요?", "vi": "Cuối tuần trước bạn đã làm gì?"},
        {"speaker": "남", "ko": "친구와 같이 등산했어요. 경치가 아주 좋았어요.", "vi": "Tôi đã đi leo núi cùng bạn. Phong cảnh đẹp lắm."},
        {"speaker": "민수", "ko": "이번 주말에는 시간이 있어요? 우리 같이 영화를 봅시다.", "vi": "Cuối tuần này bạn có thời gian không? Chúng mình cùng xem phim nhé."},
        {"speaker": "남", "ko": "좋아요. 토요일 오후에 극장에서 만나요.", "vi": "Hay quá. Chiều thứ Bảy gặp ở rạp phim nhé."}
    ], "Leo núi (등산) và dã ngoại công viên sông Hàn là hoạt động cuối tuần được người Hàn yêu thích nhất."),
    7: ("물건 사기", [
        {"speaker": "주인", "ko": "어서 오세요. 무엇을 찾으세요?", "vi": "Xin mời vào. Quý khách tìm mua gì ạ?"},
        {"speaker": "흐엉", "ko": "사과하고 우유를 사고 싶어요. 이 사과는 얼마예요?", "vi": "Tôi muốn mua táo và sữa. Táo này giá bao nhiêu ạ?"},
        {"speaker": "주인", "ko": "다섯 개에 오천 원이에요.", "vi": "5 quả giá 5.000 won ạ."},
        {"speaker": "흐엉", "ko": "그럼 사과 다섯 개하고 우유 두 병 주세요.", "vi": "Vậy cho tôi 5 quả táo và 2 chai sữa nhé."}
    ], "Khi đếm số lượng với 개, 병, 잔, 권, 벌, 켤레: các số 1, 2, 3, 4, 20 biến âm thành 한, 두, 세, 네, 스무."),
    8: ("음식", [
        {"speaker": "종업원", "ko": "주문하시겠어요?", "vi": "Quý khách dùng món gì ạ?"},
        {"speaker": "민수", "ko": "비빔밥 하나하고 된장찌개 하나 주세요.", "vi": "Cho tôi 1 cơm trộn và 1 canh tương đậu."},
        {"speaker": "종업원", "ko": "김치찌개는 안 드세요?", "vi": "Quý khách không dùng canh kim chi ạ?"},
        {"speaker": "흐엉", "ko": "네, 저는 매운 음식을 잘 못 먹어요. 물 좀 더 주세요.", "vi": "Vâng, tôi không ăn cay giỏi lắm. Cho tôi xin thêm chút nước nhé."}
    ], "Tại các quán ăn Hàn Quốc, món ăn kèm (반찬) và nước lọc luôn được phục vụ miễn phí, có thể xin thêm bằng câu '반찬 좀 더 주세요'."),
    9: ("집", [
        {"speaker": "흐엉", "ko": "실례지만 이 근처에 은행이 어디에 있어요?", "vi": "Xin lỗi, quanh đây ngân hàng ở đâu vậy ạ?"},
        {"speaker": "행인", "ko": "이 길로 똑바로 가세요. 학교 건너편에 은행이 있어요.", "vi": "Hãy đi thẳng đường này. Ngân hàng nằm đối diện trường học."},
        {"speaker": "흐엉", "ko": "은행 옆에 우체국도 있어요?", "vi": "Cạnh ngân hàng cũng có bưu điện phải không ạ?"},
        {"speaker": "행인", "ko": "네, 은행과 약국 사이에 우체국이 있어요.", "vi": "Vâng, giữa ngân hàng và hiệu thuốc có bưu điện."}
    ], "Hệ thống địa chỉ đường phố Hàn Quốc (도로명 주소) ghi theo tên đường và số tòa nhà, rất dễ tra trên bản đồ Naver/Kakao."),
    10: ("가족", [
        {"speaker": "수진", "ko": "남 씨 가족은 모두 몇 명이에요?", "vi": "Gia đình Nam có tất cả mấy người?"},
        {"speaker": "남", "ko": "부모님과 누나, 그리고 저 모두 네 명이에요.", "vi": "Có bố mẹ, chị gái và tôi, tất cả là 4 người."},
        {"speaker": "수진", "ko": "아버지께서는 무슨 일을 하세요?", "vi": "Bố của bạn làm nghề gì ạ?"},
        {"speaker": "남", "ko": "아버지께서는 고향에서 사업을 하세요.", "vi": "Bố tôi làm kinh doanh ở quê."}
    ], "Khi nói về ông bà, bố mẹ hoặc người lớn tuổi, tiếng Hàn luôn dùng tiểu từ kính trọng 께서/께서는 và đuôi kính ngữ -(으)세요."),
    11: ("날씨", [
        {"speaker": "민수", "ko": "흐엉 씨는 무슨 계절을 좋아해요?", "vi": "Hương thích mùa nào?"},
        {"speaker": "흐엉", "ko": "저는 따뜻한 봄을 제일 좋아해요. 한국의 겨울은 어때요?", "vi": "Tôi thích nhất mùa xuân ấm áp. Mùa đông Hàn Quốc thế nào?"},
        {"speaker": "민수", "ko": "겨울에는 눈이 오고 아주 추워요. 그래서 두꺼운 코트를 입어요.", "vi": "Mùa đông có tuyết rơi và rất lạnh. Vì vậy mọi người mặc áo dạ dày."},
        {"speaker": "흐엉", "ko": "내일도 날씨가 추울까요?", "vi": "Ngày mai trời có lạnh nữa không nhỉ?"}
    ], "Các tính từ thời tiết như 춥다 (lạnh), 덥다 (nóng) thuộc bất quy tắc ㅂ: khi chia với nguyên âm thì ㅂ biến thành 우 (추워요, 더워요)."),
    12: ("전화", [
        {"speaker": "흐엉", "ko": "여보세요, 거기 한국어과 사무실이지요?", "vi": "A lô, đó có phải văn phòng khoa Tiếng Hàn không ạ?"},
        {"speaker": "직원", "ko": "네, 맞습니다. 실례지만 누구세요?", "vi": "Vâng, đúng rồi ạ. Xin lỗi ai ở đầu dây vậy ạ?"},
        {"speaker": "흐엉", "ko": "저는 일 학년 흐엉인데요. 김 선생님 계세요?", "vi": "Em là Hương sinh viên năm nhất ạ. Thầy Kim có ở đó không ạ?"},
        {"speaker": "직원", "ko": "지금 회의 중이니까 이따가 다시 전화를 걸어 주세요.", "vi": "Hiện thầy đang họp nên lát nữa em gọi lại nhé."}
    ], "Khi nghe điện thoại, người Hàn mở đầu bằng '여보세요'. Đuôi '-인데요/-(으)ㄴ데요' dùng mở lời bối cảnh rất lịch sự và tự nhiên."),
    13: ("생일", [
        {"speaker": "유나", "ko": "이번 주 토요일이 수진 씨 생일이에요. 선물을 준비했어요?", "vi": "Thứ Bảy tuần này là sinh nhật Sujin rồi. Bạn chuẩn bị quà chưa?"},
        {"speaker": "흐엉", "ko": "아직 못 샀어요. 수진 씨에게 무엇을 주면 좋을까요?", "vi": "Mình vẫn chưa mua được. Tặng gì cho Sujin thì hợp nhỉ?"},
        {"speaker": "유나", "ko": "수진 씨가 향수를 좋아하니까 예쁜 향수를 고릅시다.", "vi": "Vì Sujin thích nước hoa nên tụi mình chọn lọ nước hoa xinh nhé."},
        {"speaker": "흐엉", "ko": "좋은 생각이에요! 지금 같이 백화점에 가요.", "vi": "Ý hay đấy! Bây giờ cùng ra trung tâm thương mại đi."}
    ], "Vào ngày sinh nhật, người Hàn có truyền thống ăn canh rong biển (미역국) để tưởng nhớ công ơn sinh thành của mẹ."),
    14: ("취미", [
        {"speaker": "민수", "ko": "남 씨는 시간이 있을 때 주로 무엇을 해요?", "vi": "Khi có thời gian rảnh Nam thường làm gì?"},
        {"speaker": "남", "ko": "저는 사진 찍는 것을 좋아해서 주말마다 공원에 가요.", "vi": "Mình thích chụp ảnh nên mỗi cuối tuần đều ra công viên."},
        {"speaker": "민수", "ko": "기타도 칠 수 있어요?", "vi": "Bạn có biết đánh đàn guitar không?"},
        {"speaker": "남", "ko": "조금 칠 수 있지만 아직 잘 못해요.", "vi": "Mình đánh được một chút nhưng vẫn chưa giỏi lắm."}
    ], "Khi nói về năng lực, cấu trúc -(으)ㄹ 수 있다/없다 diễn tả khả năng khách quan, còn 잘하다 / 잘 못하다 diễn tả mức độ thành thạo."),
    15: ("교통", [
        {"speaker": "흐엉", "ko": "집에서 학교까지 어떻게 와요?", "vi": "Bạn đi từ nhà đến trường bằng phương tiện gì?"},
        {"speaker": "민수", "ko": "지하철을 타고 시청역에서 버스로 갈아타요.", "vi": "Mình đi tàu điện ngầm rồi chuyển sang xe buýt ở ga Tòa thị chính."},
        {"speaker": "흐엉", "ko": "시간이 얼마나 걸려요?", "vi": "Mất khoảng bao lâu?"},
        {"speaker": "민수", "ko": "보통 사십 분쯤 걸려요. 출근 시간에는 길이 조금 막혀요.", "vi": "Thường mất khoảng 40 phút. Giờ đi làm thì đường hơi tắc một chút."}
    ], "Ở Hàn Quốc, dùng thẻ T-money (교통카드) chạm khi lên và xuống xe giúp được miễn phí cước chuyển tuyến (환승) giữa tàu điện ngầm và xe buýt trong 30 phút.")
}

# Build Quyển 1 Workbook Grammar/Vocab Drills for each of the 15 lessons
SC1_WORKBOOK_CUSTOM = {
    1: [
        {"q": "[Sách bài tập B01] Điền tiểu từ đúng: '저(   ) 베트남 사람입니다.'", "opts": ["는", "은", "이", "을"], "ans": 0, "exp": "'저' không có patchim nên đi với tiểu từ chủ đề '는' → 저는."},
        {"q": "[Sách bài tập B01] Chọn câu hỏi nghề nghiệp đúng chuẩn trang trọng:", "opts": ["민수 씨는 학생입니까?", "민수 씨는 학생입니다?", "민수 씨가 학생입니까.", "민수 씨을 학생입니까?"], "ans": 0, "exp": "Câu hỏi trang trọng của danh từ dùng 'N + 입니까?'."},
        {"q": "[Sách bài tập B01] Khi bạn ra về còn thầy giáo ở lại lớp, bạn chào thế nào?", "opts": ["안녕히 계세요.", "안녕히 가세요.", "처음 뵙겠습니다.", "실례합니다."], "ans": 0, "exp": "Người đi chào người ở lại dùng '안녕히 계세요' (Xin ở lại bình an)."}
    ],
    2: [
        {"q": "[Sách bài tập B02] Chọn tiểu từ đúng: '교실에 책상(   ) 있습니다.'", "opts": ["이", "가", "을", "는"], "ans": 0, "exp": "'책상' có patchim ㅇ nên đi với tiểu từ chủ ngữ '이' trước 있습니다."},
        {"q": "[Sách bài tập B02] Chọn phủ định đúng của danh từ: '여기는 서점(          ).'", "opts": ["이 아닙니다", "가 아닙니다", "없습니다", "안 서점입니다"], "ans": 0, "exp": "'서점' có patchim ㅁ → '서점이 아닙니다' (không phải là hiệu sách)."},
        {"q": "[Sách bài tập B02] Đồ vật ở gần người nghe, xa người nói thì dùng đại từ nào?", "opts": ["그것", "이것", "저것", "어디"], "ans": 0, "exp": "이것 (gần người nói) · 그것 (gần người nghe) · 저것 (xa cả hai)."}
    ],
    3: [
        {"q": "[Sách bài tập B03] Điền cặp tiểu từ đúng: '도서관(   ) 가서 한국어를 공부합니다.' / '도서관(   ) 책을 읽습니다.'", "opts": ["에 / 에서", "에서 / 에", "을 / 에서", "에 / 를"], "ans": 0, "exp": "가다 dùng '에' (đích đến), còn 읽다 là hành động diễn ra tại địa điểm nên dùng '에서'."},
        {"q": "[Sách bài tập B03] Chia đuôi -ㅂ니다/습니다 đúng cho động từ '먹다' và '마시다':", "opts": ["먹습니다 / 마십니다", "먹읍니다 / 마십니다", "먹습니다 / 마시습니다", "먹니다 / 마십니다"], "ans": 0, "exp": "'먹다' có patchim → 먹습니다; '마시다' không có patchim → 마십니다."},
        {"q": "[Sách bài tập B03] Điền tiểu từ tân ngữ: '아침에 빵(   ) 먹고 우유(   ) 마십니다.'", "opts": ["을 / 를", "를 / 을", "이 / 가", "은 / 는"], "ans": 0, "exp": "'빵' có patchim → 을; '우유' không patchim → 를."}
    ],
    4: [
        {"q": "[Sách bài tập B04] Cách viết ngày '16 tháng 6' bằng tiếng Hàn đúng chuẩn là:", "opts": ["유월 십육 일", "육월 십육 일", "유월 열여섯 일", "육월 십유 일"], "ans": 0, "exp": "Tháng 6 viết đặc biệt là '유월' (bỏ ㄱ), ngày dùng số Hán–Hàn '십육 일'."},
        {"q": "[Sách bài tập B04] Từ nghi vấn nào KHÔNG cộng thêm tiểu từ thời gian '에'?", "opts": ["언제", "월요일", "세 시", "주말"], "ans": 0, "exp": "Các từ 오늘, 어제, 내일, 언제 không kết hợp với tiểu từ '에'."},
        {"q": "[Sách bài tập B04] Chọn từ đúng hỏi ngày trong tháng: '오늘이 몇 월 (     )입니까?'", "opts": ["며칠", "몇 일", "무슨 요일", "언제"], "ans": 0, "exp": "Chính tả chuẩn hỏi ngày mấy là '며칠' (không viết tách 몇 일)."}
    ],
    5: [
        {"q": "[Sách bài tập B05] Cách đọc '2 giờ 30 phút' chuẩn xác là:", "opts": ["두 시 삼십 분", "이 시 삼십 분", "둘 시 삼십 분", "두 시 서른 분"], "ans": 0, "exp": "Giờ dùng số thuần Hàn rút gọn (둘 → 두 시), phút dùng số Hán–Hàn (삼십 분 / 반)."},
        {"q": "[Sách bài tập B05] Chia đuôi lịch sự -아/어요 đúng cho '배우다' và '가르치다':", "opts": ["배워요 / 가르쳐요", "배우어요 / 가르치어요", "배와요 / 가르처요", "배워요 / 가르치요"], "ans": 0, "exp": "배우 + 어요 → 배워요; 가르치 + 어요 → 가르쳐요."},
        {"q": "[Sách bài tập B05] Chọn câu phủ định với '안' đặt ĐÚNG vị trí:", "opts": ["보통 아침에 커피를 안 마셔요.", "보통 아침에 안 커피를 마셔요.", "저녁에 숙제를 공부 안 해요.", "오늘 학교에 안 갑니까요."], "ans": 0, "exp": "'안' đứng ngay trước động từ đơn (안 마셔요) hoặc giữa danh từ và 하다 (공부 안 해요)."}
    ],
    6: [
        {"q": "[Sách bài tập B06] Chia thì quá khứ đúng của '바쁘다' và '하다':", "opts": ["바빴어요 / 했어요", "바뻤어요 / 했어요", "바빴어요 / 하였어요요", "바쁘았어요 / 했어요"], "ans": 0, "exp": "'바쁘다' lược ㅡ, âm trước là ㅏ nên cộng -았어요 → 바빴어요."},
        {"q": "[Sách bài tập B06] Chọn câu rủ rê lịch sự 'Chúng ta hãy cùng đi công viên nhé':", "opts": ["우리 같이 공원에 갑시다.", "우리 같이 공원에 가세요.", "우리 같이 공원에 갔어요.", "우리 같이 공원에서 갑시다."], "ans": 0, "exp": "Đuôi rủ rê -(으)ㅂ시다 gắn sau thân không patchim 가다 → 갑시다."},
        {"q": "[Sách bài tập B06] Điền từ để hỏi đúng: '(     ) 영화를 좋아해요? — 코미디 영화를 좋아해요.'", "opts": ["무슨", "어디", "언제", "몇"], "ans": 0, "exp": "Hỏi thể loại/tên chung trước danh từ dùng '무슨 + N'."}
    ],
    7: [
        {"q": "[Sách bài tập B07] Chọn đơn vị đếm đúng cho '1 đôi giày thể thao' và '2 quyển sách':", "opts": ["운동화 한 켤레 / 책 두 권", "운동화 하나 켤레 / 책 둘 권", "운동화 한 벌 / 책 두 장", "운동화 일 켤레 / 책 이 권"], "ans": 0, "exp": "Giày/tất đếm bằng 켤레, sách đếm bằng 권, đi với số thuần Hàn rút gọn 한, 두."},
        {"q": "[Sách bài tập B07] Chọn câu diễn tả mong muốn đúng: 'Tôi muốn mua chiếc túi này.'", "opts": ["이 가방을 사고 싶어요.", "이 가방이 사고 싶어요요.", "이 가방을 사 싶어요.", "이 가방을 사고 싶어해요."], "ans": 0, "exp": "Ngôi thứ nhất diễn tả mong muốn dùng 'V-고 싶어요'."},
        {"q": "[Sách bài tập B07] Số tiền '50.000 won' viết bằng tiếng Hàn là:", "opts": ["오만 원", "오십천 원", "다섯만 원", "오천 원"], "ans": 0, "exp": "Đơn vị tiền Hàn lấy mốc vạn (10.000 = 만) → 50.000 won = 오만 원."}
    ],
    8: [
        {"q": "[Sách bài tập B08] Chia bất quy tắc ㅂ đúng cho '맵다' (cay) và '싱겁다' (nhạt):", "opts": ["매워요 / 싱거워요", "맵어요 / 싱겁어요", "매와요 / 싱거와요", "매워요 / 싱겁워요"], "ans": 0, "exp": "Bất quy tắc ㅂ: lược ㅂ + 워요 → 매워요, 싱거워요."},
        {"q": "[Sách bài tập B08] Chọn câu khuyên ngăn 'Xin đừng ăn mì gói vào ban đêm':", "opts": ["밤에 라면을 먹지 마세요.", "밤에 라면을 안 먹으세요.", "밤에 라면을 못 먹으세요.", "밤에 라면을 먹지 않으세요."], "ans": 0, "exp": "Cấm đoán/khuyên đừng làm gì dùng 'V-지 마세요'."},
        {"q": "[Sách bài tập B08] Điền tiểu từ chỉ phương tiện/dụng cụ: '한국 사람은 밥을 숟가락(     ) 먹어요.'", "opts": ["으로", "로", "에서", "에게"], "ans": 0, "exp": "'숟가락' có patchim ㄱ nên cộng '으로' (bằng thìa)."}
    ],
    9: [
        {"q": "[Sách bài tập B09] Điền tiểu từ chỉ phương hướng: '이 길(   ) 똑바로 가세요.' / '오른쪽(   ) 가세요.'", "opts": ["로 / 으로", "으로 / 로", "에 / 에서", "로 / 에"], "ans": 0, "exp": "Danh từ patchim ㄹ ('길') cộng thẳng '로' → 길로; '오른쪽' có patchim ㄱ → 오른쪽으로."},
        {"q": "[Sách bài tập B09] Chọn từ chỉ vị trí đúng: '은행과 약국 (     )에 꽃집이 있어요.'", "opts": ["사이", "건너편", "양쪽", "안"], "ans": 0, "exp": "'A와/과 B 사이에' = ở giữa A và B."},
        {"q": "[Sách bài tập B09] Chia -(으)세요 đúng cho động từ '살다' (sống) và '찾다' (tìm):", "opts": ["사세요 / 찾으세요", "살으세요 / 찾으세요", "살세요 / 찾세요", "사세요 / 찾세요"], "ans": 0, "exp": "Thân ㄹ ('살다') lược ㄹ trước -(으)세요 → 사세요; '찾다' có patchim → 찾으세요."}
    ],
    10: [
        {"q": "[Sách bài tập B10] Chọn câu kính ngữ ĐÚNG hoàn toàn khi nói về ông bà:", "opts": ["할머니께서는 지금 방에 계세요.", "할머니는 지금 방에 있어요.", "할머니께서는 지금 밥을 먹으세요.", "할머니께서 지금 잠을 자세요."], "ans": 0, "exp": "Kính ngữ đặc biệt: 있다 → 계시다 (계세요), 먹다 → 드시다/잡수시다, 자다 → 주무시다."},
        {"q": "[Sách bài tập B10] 'Bố tôi năm nay 50 tuổi' viết chuẩn số thuần Hàn là:", "opts": ["아버지께서는 올해 쉰 살이세요.", "아버지께서는 올해 오십 살이세요.", "아버지께서는 올해 마흔 살이세요.", "아버지께서는 올해 예순 살이세요."], "ans": 0, "exp": "30: 서른 · 40: 마흔 · 50: 쉰 · 60: 예순 · 70: 일흔 · 80: 여든 · 90: 아흔."},
        {"q": "[Sách bài tập B10] 'Em trai tôi 20 tuổi' viết đúng biến đổi trước '살' là:", "opts": ["스무 살", "스물 살", "이십 살", "스무 세"], "ans": 0, "exp": "'스물' đứng trước đơn vị đếm '살' lược ㄹ thành '스무 살'."}
    ],
    11: [
        {"q": "[Sách bài tập B11] Chia bất quy tắc ㅎ của '어떻다' với đuôi -아/어요:", "opts": ["어때요", "어떻어요", "어떠요", "어떻아요"], "ans": 0, "exp": "어떻다 + -아/어요 → lược ㅎ, kết hợp thành '어때요'."},
        {"q": "[Sách bài tập B11] Chọn cấu trúc dự đoán tương lai: 'Chiều nay chắc trời sẽ mưa.'", "opts": ["오후에 비가 올 거예요.", "오후에 비가 오을 거예요.", "오후에 비가 왔을 거예요.", "오후에 비가 오고 싶어요."], "ans": 0, "exp": "'오다' không patchim + -ㄹ 거예요 → 올 거예요."},
        {"q": "[Sách bài tập B11] Chọn động từ mặc/đeo đúng cặp với '장갑' (găng tay) và '코트' (áo khoác):", "opts": ["장갑을 끼다 / 코트를 입다", "장갑을 입다 / 코트를 쓰다", "장갑을 신다 / 코트를 입다", "장갑을 하다 / 코트를 신다"], "ans": 0, "exp": "Áo quần: 입다 · Giày tất: 신다 · Mũ kính: 쓰다 · Găng tay/nhẫn: 끼다."}
    ],
    12: [
        {"q": "[Sách bài tập B12] Điền tiểu từ người nhận hành động: '어제 친구(     ) 문자를 보냈어요.'", "opts": ["에게", "에서", "으로", "께서"], "ans": 0, "exp": "'에게 / 한테' chỉ người nhận cuộc gọi hoặc tin nhắn (kính ngữ với bề trên là '께')."},
        {"q": "[Sách bài tập B12] Chọn cấu trúc chỉ ý định 'Tôi định mua điện thoại mới':", "opts": ["새 휴대폰을 사려고 해요.", "새 휴대폰을 살려고 해요.", "새 휴대폰을 사러 해요.", "새 휴대폰을 사기 해요."], "ans": 0, "exp": "사다 không patchim + -려고 하다 → 사려고 해요."},
        {"q": "[Sách bài tập B12] Chọn lý do có thể đi với câu mệnh lệnh '-으세요': '극장 안(          ) 휴대폰을 끄세요.'", "opts": ["이니까", "이라서", "이어서", "고"], "ans": 0, "exp": "Sau câu mệnh lệnh -(으)세요 / rủ rê -(으)ㅂ시다 phải dùng -(으)니까, không dùng -아/어서."}
    ],
    13: [
        {"q": "[Sách bài tập B13] Chia bất quy tắc 르 đúng cho '고르다' (chọn) ở thì quá khứ:", "opts": ["골랐어요", "고랐어요", "골렀어요", "고르았어요"], "ans": 0, "exp": "고르다: âm trước 르 là ㅗ nên thêm ㄹ + 랐어요 → 골랐어요."},
        {"q": "[Sách bài tập B13] Chọn động từ kính ngữ đúng khi tặng quà cho cô giáo:", "opts": ["선생님께 꽃다발을 드렸어요.", "선생님에게 꽃다발을 주었어요.", "선생님께 꽃다발을 받으셨어요.", "선생님한테 꽃다발을 드렸어요."], "ans": 0, "exp": "Biếu/tặng bề trên dùng tiểu từ '께' + động từ kính ngữ '드리다'."},
        {"q": "[Sách bài tập B13] Chọn câu hỏi ý kiến lịch sự 'Mình tặng quà gì cho bạn ấy nhỉ?':", "opts": ["무슨 선물을 줄까요?", "무슨 선물을 줍시다?", "무슨 선물을 주세요?", "무슨 선물을 줬어요?"], "ans": 0, "exp": "Hỏi ý kiến người nghe dùng '-(으)ㄹ까요?'."}
    ],
    14: [
        {"q": "[Sách bài tập B14] Chuyển động từ thành danh từ đúng: '제 취미는 사진 (          )예요.'", "opts": ["찍기", "찍는", "찍고", "찍으러"], "ans": 0, "exp": "Danh từ hóa động từ bằng 'V-기' hoặc 'V-는 것' (찍기예요 / 찍는 것이에요)."},
        {"q": "[Sách bài tập B14] Chia bất quy tắc ㄷ đúng cho '걷다' (đi bộ) và '듣다' (nghe):", "opts": ["걸어요 / 들어요", "걷어요 / 듣어요", "걸아요 / 들아요", "거러요 / 드러요"], "ans": 0, "exp": "Bất quy tắc ㄷ: ㄷ biến thành ㄹ trước nguyên âm → 걸어요, 들어요."},
        {"q": "[Sách bài tập B14] Phó từ nào BẮT BUỘC phải đi kèm dạng phủ định (안 / 못 / 없다)?", "opts": ["전혀", "항상", "자주", "가끔"], "ans": 0, "exp": "'전혀' (hoàn toàn không) và '별로' (không ... lắm) luôn đi với vị ngữ phủ định."}
    ],
    15: [
        {"q": "[Sách bài tập B15] Điền cặp tiểu từ điểm đi – điểm đến: '집(     ) 학교(     ) 버스로 삼십 분 걸려요.'", "opts": ["에서 / 까지", "부터 / 까지", "에 / 에서", "으로 / 까지"], "ans": 0, "exp": "Khoảng cách địa điểm dùng 'N1에서 N2까지', còn mốc thời gian dùng '부터 ~ 까지'."},
        {"q": "[Sách bài tập B15] Chọn câu chỉ mục đích di chuyển đúng: 'Tôi ra ga Seoul để đón bạn.'", "opts": ["친구를 마중하러 서울역에 가요.", "친구를 마중하려고 서울역에 먹어요.", "친구를 마중하러 서울역에서 자요.", "친구를 마중으러 서울역에 가요."], "ans": 0, "exp": "'V-(으)러 가다/오다' diễn tả mục đích của động từ di chuyển."},
        {"q": "[Sách bài tập B15] Chia bất quy tắc ㅂ của '가깝다' (gần):", "opts": ["가까워요", "가깝어요", "가까와요", "가깝워요"], "ans": 0, "exp": "Mặc dù gốc có ㅏ nhưng các từ 2 âm tiết trở lên như 가깝다, 고맙다, 반갑다 đều cộng '워요' → 가까워요."}
    ]
}

# Build Book 1 structure referencing sc1_vocab & sc1_grammar
q1_chapters = []
for ls in range(1, 16):
    ls_words = [w for w in sc1_vocab if w["lesson"] == ls]
    ls_grams = [g for g in sc1_grammar if g["lesson"] == ls]
    ko_title, dlg, cult = SC1_DIALOGUES_AND_CULTURE[ls]
    parts_meta = []
    for p_idx, (_, _, p_title) in enumerate(SC1_LESSON_PARTS[ls], 1):
        pw = [w["id"] for w in ls_words if w["part"] == p_idx]
        parts_meta.append({
            "part": p_idx,
            "title": p_title,
            "wordCount": len(pw),
            "wordIds": pw
        })
    q1_chapters.append({
        "lesson": ls,
        "title": ls_words[0]["lessonTitle"],
        "koTitle": ko_title,
        "parts": parts_meta,
        "textbook": {
            "grammars": ls_grams,
            "dialogue": dlg,
            "culture": cult
        },
        "workbook": {
            "vocabGrammarDrills": SC1_WORKBOOK_CUSTOM[ls]
        }
    })

# ==============================================================================
# 2. HELPER TO BUILD BOOKS 2..6 WITH AUTHENTIC TIERED VOCABULARY + TEXTBOOK + WORKBOOK
# ==============================================================================
def make_vocab_entries(book_id, lesson_num, lesson_title, raw_parts):
    """
    raw_parts: list of (part_title, [ (ko, vi, pron, ex_ko, ex_vi, note), ... ])
    Returns (flat_words, parts_meta)
    """
    flat_words = []
    parts_meta = []
    w_counter = 0
    for p_idx, (p_title, rows) in enumerate(raw_parts, 1):
        pids = []
        for (ko, vi, pron, ex_ko, ex_vi, note) in rows:
            w_counter += 1
            wid = f"{book_id}_b{lesson_num:02d}_w{w_counter:02d}"
            aud = audio_lookup.get(ko.strip(), {})
            entry = {
                "id": wid,
                "book": book_id,
                "lesson": lesson_num,
                "lessonTitle": lesson_title,
                "part": p_idx,
                "partTitle": p_title,
                "korean": ko,
                "vietnamese": vi,
                "pronunciation": pron,
                "exampleKo": ex_ko,
                "exampleVi": ex_vi,
                "wordAudio": aud.get("wordAudio", ""),
                "exampleAudio": aud.get("exampleAudio", ""),
                "note": note
            }
            flat_words.append(entry)
            pids.append(wid)
        parts_meta.append({
            "part": p_idx,
            "title": p_title,
            "wordCount": len(pids),
            "wordIds": pids
        })
    return flat_words, parts_meta

# --- QUYỂN 2: TIẾNG HÀN TỔNG HỢP · SƠ CẤP 2 (15 CHƯƠNG · MỤC TIÊU TOPIK I CẤP 2 >= 140/200) ---
Q2_RAW_CHAPTERS = [
    (1, "Gặp gỡ & Thăm hỏi", "만남", [
        ("Phần 1 · Thăm hỏi tin tức & Ngoại hình", [
            ("오랜만이다", "lâu lắm mới gặp", "o-raen-man-i-da", "오랜만이에요! 그동안 잘 지냈어요?", "Lâu lắm mới gặp! Thời gian qua bạn khỏe không?", "Câu chào mở đầu khi gặp lại bạn cũ."),
            ("안부를 묻다", "hỏi thăm sức khỏe", "an-bu-reul mut-da", "선생님께 전화로 안부를 물었어요.", "Tôi đã gọi điện hỏi thăm thầy giáo.", "묻다 (hỏi) bất quy tắc ㄷ → 물어요."),
            ("소식", "tin tức", "so-sik", "고향 친구의 소식을 들었어요.", "Tôi đã nghe được tin tức của bạn ở quê.", "소식을 전하다: truyền tin."),
            ("인상", "ấn tượng, diện mạo", "in-sang", "그분은 첫인상이 아주 따뜻해요.", "Vị ấy có ấn tượng ban đầu rất ấm áp.", "첫인상: ấn tượng đầu tiên."),
            ("키가 크다", "dáng cao", "ki-ga keu-da", "남동생이 키가 많이 컸어요.", "Em trai tôi đã cao lên nhiều.", "Đối nghĩa: 키가 작다."),
            ("날씬하다", "thon gọn, mảnh mai", "nal-ssin-ha-da", "운동을 자주 해서 몸매가 날씬해요.", "Nhờ tập thể dục thường xuyên nên dáng rất thon gọn.", ""),
            ("멋있다", "ngầu, lịch lãm", "meo-sit-da", "정장을 입으니까 정말 멋있어요.", "Mặc vest vào trông thật lịch lãm.", "Phát âm [머싣따 / 머딛따]."),
            ("닮다", "giống (ngoại hình/tính cách)", "dam-da", "흐엉 씨는 어머니를 많이 닮았어요.", "Bạn Hương rất giống mẹ.", "Phát âm [담따].")
        ]),
        ("Phần 2 · Tính cách & Quan hệ xã hội", [
            ("성격", "tính cách", "seong-gyeok", "민수 씨는 성격이 밝고 활발해요.", "Anh Minsu có tính cách tươi sáng và hoạt bát.", ""),
            ("친절하다", "thân thiện, tử tế", "chin-jeol-ha-da", "가게 직원이 손님에게 친절해요.", "Nhân viên cửa hàng thân thiện với khách.", ""),
            ("부지런하다", "chăm chỉ, cần cù", "bu-ji-reon-ha-da", "할아버지께서는 평생 부지런하셨어요.", "Ông nội cả đời đều rất cần cù.", "Đối nghĩa: 게으르다 (lười)."),
            ("유머가 있다", "hài hước, dí dỏm", "yu-meo-ga it-da", "그 친구는 유머가 있어서 인기가 많아요.", "Bạn ấy hài hước nên rất được yêu mến.", ""),
            ("선배", "tiền bối, anh/chị khóa trên", "seon-bae", "대학교 선배가 공부를 도와주었어요.", "Anh khóa trên đại học đã giúp tôi học.", "Đối nghĩa: 후배 (hậu bối)."),
            ("동료", "đồng nghiệp", "dong-nyo", "회사 동료들과 점심을 먹었어요.", "Tôi đã ăn trưa cùng các đồng nghiệp công ty.", "Biến âm ㅇ+ㄹ → [동뇨]."),
            ("이웃", "hàng xóm", "i-ut", "새로 이사 온 이웃에게 인사했어요.", "Tôi đã chào hỏi người hàng xóm mới chuyển đến.", ""),
            ("친해지다", "trở nên thân thiết", "chin-hae-ji-da", "같이 운동하면서 금방 친해졌어요.", "Vừa tập thể thao cùng nhau chúng tôi đã nhanh chóng thân thiết.", "-아/어지다: trở nên...")
        ])
    ], [
        {"pattern": "-아/어지다", "meaning": "Trở nên, trở thành...", "construction": "Tính từ + -아/어지다", "usage": "Diễn tả sự thay đổi trạng thái theo thời gian.", "example1Ko": "날씨가 많이 따뜻해졌어요.", "example1Vi": "Thời tiết đã trở nên ấm áp nhiều rồi."},
        {"pattern": "-(으)면서", "meaning": "Vừa... vừa...", "construction": "Động từ + -(으)면서", "usage": "Hai hành động của cùng một chủ ngữ diễn ra đồng thời.", "example1Ko": "차를 마시면서 이야기했어요.", "example1Vi": "Chúng tôi vừa uống trà vừa trò chuyện."}
    ], [
        {"speaker": "민수", "ko": "흐엉 씨, 정말 오랜만이에요! 그동안 잘 지냈어요?", "vi": "Hương ơi, lâu lắm mới gặp! Thời gian qua bạn khỏe không?"},
        {"speaker": "흐엉", "ko": "네, 잘 지냈어요. 민수 씨는 더 멋있어졌네요.", "vi": "Vâng, mình khỏe. Minsu trông ngày càng lịch lãm hơn đấy nhé."},
        {"speaker": "민수", "ko": "고마워요. 우리 커피를 마시면서 밀린 이야기를 해요.", "vi": "Cảm ơn bạn. Mình vừa uống cà phê vừa kể chuyện dồn nén bấy lâu đi."}
    ], "Trong giao tiếp Hàn Quốc, lời khen nhẹ về thần sắc tươi tắn ('얼굴이 좋아졌네요') là cách mở đầu cuộc trò chuyện rất lịch sự.", [
        {"q": "[Sách bài tập Q2-B01] Chọn cách chia '-아/어지다' đúng với '친하다' (thân) và '예쁘다' (đẹp):", "opts": ["친해졌어요 / 예뻐졌어요", "친하졌어요 / 예쁘졌어요", "친해졌어요 / 예빠졌어요", "친어졌어요 / 예뻐졌어요"], "ans": 0, "exp": "친하다 → 친해지다; 예쁘다 lược ㅡ → 예뻐지다."},
        {"q": "[Sách bài tập Q2-B01] Chọn câu dùng '-(으)면서' ĐÚNG ngữ pháp:", "opts": ["음악을 들으면서 청소해요.", "음악을 듣으면서 청소해요.", "제가 요리하면서 동생이 설거지해요.", "밥을 먹면서 텔레비전을 봐요."], "ans": 0, "exp": "'듣다' bất quy tắc ㄷ → 들으면서, và 2 vế của -(으)면서 phải cùng một chủ ngữ."}
    ]),
    (2, "Hẹn ước & Lịch trình", "약속", [
        ("Phần 1 · Đặt hẹn, Đổi hẹn & Hủy hẹn", [
            ("약속을 잡다", "lên lịch hẹn", "yak-sok-eul jap-da", "다음 주 금요일로 약속을 잡았어요.", "Tôi đã chốt lịch hẹn vào thứ Sáu tuần sau.", "약속을 하다: hẹn."),
            ("약속을 지키다", "giữ lời hứa / đúng hẹn", "yak-sok-eul ji-ki-da", "시간 약속을 꼭 지켜 주세요.", "Xin hãy nhớ giữ đúng giờ hẹn.", "Đối nghĩa: 약속을 어기다."),
            ("약속을 미루다", "hoãn hẹn, dời lịch hẹn", "yak-sok-eul mi-ru-da", "급한 일이 생겨서 약속을 미뤘어요.", "Vì có việc gấp phát sinh nên tôi đã dời lịch hẹn.", "미루다 + 었어요 → 미뤘어요."),
            ("약속을 취소하다", "hủy cuộc hẹn", "yak-sok-eul chwi-so-ha-da", "몸이 아파서 약속을 취소했어요.", "Vì bị ốm nên tôi đã hủy cuộc hẹn.", ""),
            ("일이 생기다", "có việc phát sinh", "il-i saeng-gi-da", "갑자기 회사에 급한 일이 생겼어요.", "Đột nhiên ở công ty có việc gấp phát sinh.", ""),
            ("늦다", "muộn, trễ", "neut-da", "길이 막혀서 십 분쯤 늦을 것 같아요.", "Vì kẹt xe nên chắc tôi sẽ trễ khoảng 10 phút.", ""),
            ("기다리다", "chờ, đợi", "gi-da-ri-da", "커피숍 안에서 기다리고 있을게요.", "Mình sẽ đang đợi ở bên trong quán cà phê nhé.", ""),
            ("제시간에 도착하다", "đến đúng giờ", "je-si-gan-e do-chak-ha-da", "지하철을 타서 제시간에 도착했어요.", "Nhờ đi tàu điện ngầm nên tôi đã đến đúng giờ.", "")
        ]),
        ("Phần 2 · Địa điểm gặp gỡ & Xin lỗi", [
            ("모임", "buổi họp mặt, tụ tập", "mo-im", "이번 주말에 동아리 모임이 있어요.", "Cuối tuần này có buổi họp mặt câu lạc bộ.", ""),
            ("출구", "cửa ra (ga tàu)", "chul-gu", "강남역 삼 번 출구 앞에서 만나요.", "Hẹn gặp trước cửa ra số 3 ga Gangnam nhé.", "입구: cửa vào."),
            ("미안하다", "xin lỗi (thân mật)", "mi-an-ha-da", "늦어서 정말 미안해요.", "Xin lỗi nhiều vì mình đến muộn.", "Trang trọng: 죄송합니다."),
            ("괜찮다", "không sao, ổn", "gwaen-chan-ta", "괜찮아요, 저도 방금 왔어요.", "Không sao đâu, mình cũng vừa mới tới thôi.", "Phát âm [괜찬타]."),
            ("미리 연락하다", "liên lạc báo trước", "mi-ri yeol-lak-ha-da", "못 오면 미리 연락해 주세요.", "Nếu không đến được thì hãy báo trước cho mình nhé.", ""),
            ("장소를 정하다", "chọn địa điểm", "jang-so-reul jeong-ha-da", "모임 장소를 아직 못 정했어요.", "Chúng tôi vẫn chưa chọn được địa điểm họp mặt.", "")
        ])
    ], [
        {"pattern": "-기로 하다", "meaning": "Quyết định / Hẹn làm gì", "construction": "Động từ + -기로 하다", "usage": "Diễn tả lời hẹn hoặc quyết định đã thống nhất.", "example1Ko": "내일 도서관에서 같이 공부하기로 했어요.", "example1Vi": "Chúng tôi đã hẹn ngày mai cùng học ở thư viện."},
        {"pattern": "-(으)ㄹ게요", "meaning": "Tôi sẽ... (hứa hẹn nhẹ nhàng)", "construction": "Động từ + -(으)ㄹ게요", "usage": "Thể hiện ý chí/lời hứa của người nói với người nghe.", "example1Ko": "다음부터는 절대 늦지 않을게요.", "example1Vi": "Từ lần sau mình nhất định sẽ không đến muộn nữa."}
    ], [
        {"speaker": "수진", "ko": "남 씨, 내일 우리 몇 시에 만나기로 했지요?", "vi": "Nam ơi, ngày mai tụi mình đã hẹn gặp mấy giờ ấy nhỉ?"},
        {"speaker": "남", "ko": "오후 두 시에 시청역 이 번 출구에서 만나기로 했어요.", "vi": "Mình đã hẹn gặp lúc 2 giờ chiều ở cửa ra số 2 ga Tòa thị chính."},
        {"speaker": "수진", "ko": "아, 맞아요! 제가 십 분 먼저 가서 기다릴게요.", "vi": "À đúng rồi! Mình sẽ tới trước 10 phút và đợi nhé."}
    ], "Các ga tàu điện ngầm ở Hàn Quốc có nhiều cửa ra đánh số (1번 출구, 2번 출구...), nên người Hàn luôn hẹn chính xác số cửa ra.", [
        {"q": "[Sách bài tập Q2-B02] Chọn câu diễn tả 'Chúng tôi đã quyết định đi ăn thịt nướng tối nay':", "opts": ["오늘 저녁에 삼겹살을 먹기로 했어요.", "오늘 저녁에 삼겹살을 먹을까 했어요.", "오늘 저녁에 삼겹살을 먹으러 했어요.", "오늘 저녁에 삼겹살을 먹기 했어요."], "ans": 0, "exp": "'V-기로 하다' dùng để nói về kế hoạch/lời hẹn đã chốt."},
        {"q": "[Sách bài tập Q2-B02] Cấu trúc '-(으)ㄹ게요' chỉ dùng được với chủ ngữ nào?", "opts": ["Ngôi thứ nhất (저 / 나 / 우리)", "Ngôi thứ hai (당신 / 씨)", "Ngôi thứ ba (그 사람)", "Câu hỏi nghi vấn"], "ans": 0, "exp": "-(으)ㄹ게요 diễn tả lời hứa của chính người nói nên chỉ đi với ngôi thứ nhất trong câu trần thuật."}
    ]),
    (3, "Mua sắm & Đổi trả", "물건 사기 (2)", [
        ("Phần 1 · Kích cỡ, Màu sắc & Kiểu dáng", [
            ("사이즈 / 치수", "kích cỡ, size", "sa-i-jeu / chi-su", "한 사이즈 더 큰 것으로 보여 주세요.", "Cho tôi xem chiếc lớn hơn 1 size nhé.", ""),
            ("디자인", "thiết kế, kiểu dáng", "di-ja-in", "이 코트는 디자인이 세련됐어요.", "Chiếc áo dạ này kiểu dáng rất thanh lịch.", ""),
            ("색깔", "màu sắc", "saek-kkal", "밝은 색깔의 셔츠를 찾고 있어요.", "Tôi đang tìm áo sơ mi màu sáng.", ""),
            ("유행하다", "thịnh hành, hợp mốt", "yu-haeng-ha-da", "요즘 젊은 사람들 사이에 유행하는 옷이에요.", "Đây là mẫu áo đang thịnh hành trong giới trẻ dạo này.", ""),
            ("어울리다", "hợp, vừa vặn", "eo-ul-li-da", "파란색 모자가 흐엉 씨에게 잘 어울려요.", "Chiếc mũ màu xanh dương rất hợp với bạn Hương.", ""),
            ("편하다", "thoải mái, êm", "pyeon-ha-da", "이 운동화는 가볍고 아주 편해요.", "Đôi giày thể thao này nhẹ và rất êm.", "Đối nghĩa: 불편하다.")
        ]),
        ("Phần 2 · Thanh toán, Đổi hàng & Hoàn tiền", [
            ("영수증", "hóa đơn", "yeong-su-jeung", "교환하려면 영수증이 꼭 필요해요.", "Muốn đổi hàng thì nhất định phải có hóa đơn.", ""),
            ("교환하다", "đổi hàng", "gyo-hwan-ha-da", "바지가 작아서 큰 사이즈로 교환했어요.", "Vì quần chật nên tôi đã đổi sang size lớn hơn.", ""),
            ("환불하다", "hoàn tiền, trả hàng lấy lại tiền", "hwan-bul-ha-da", "물건에 문제가 있어서 환불을 받았어요.", "Vì sản phẩm có lỗi nên tôi đã được hoàn tiền.", ""),
            ("할인하다", "giảm giá, khuyến mãi", "hal-in-ha-da", "백화점에서 주말 세일로 이십 퍼센트 할인해요.", "Trung tâm thương mại giảm giá 20% dịp sale cuối tuần.", ""),
            ("현금", "tiền mặt", "hyeon-geum", "현금으로 계산하면 조금 더 깎아 주세요?", "Thanh toán bằng tiền mặt có được bớt thêm chút không ạ?", "신용카드: thẻ tín dụng."),
            ("포장하다", "gói quà, đóng gói", "po-jang-ha-da", "선물할 거니까 예쁘게 포장해 주세요.", "Vì để tặng quà nên nhờ anh/chị gói thật đẹp giúp tôi.", "")
        ])
    ], [
        {"pattern": "-아/어 보다", "meaning": "Thử làm gì...", "construction": "Động từ + -아/어 보다", "usage": "Diễn tả việc thử trải nghiệm một hành động (mặc thử, đi thử, ăn thử).", "example1Ko": "이 구두를 한번 신어 봐도 돼요?", "example1Vi": "Tôi đi thử đôi giày này một lần được không ạ?"},
        {"pattern": "-(으)ㄴ/는데", "meaning": "Nhưng / Đang... thì (nền ngữ cảnh)", "construction": "Động từ + -는데, Tính từ + -(으)ㄴ데", "usage": "Đưa ra bối cảnh trước khi nêu đề nghị, câu hỏi hoặc vế đối lập.", "example1Ko": "어제 이 옷을 샀는데 사이즈가 좀 작아요.", "example1Vi": "Hôm qua tôi đã mua chiếc áo này nhưng size hơi chật."}
    ], [
        {"speaker": "손님", "ko": "저기요, 어제 이 자켓을 샀는데 소매가 조금 길어요.", "vi": "Anh/chị ơi, hôm qua tôi mua chiếc áo khoác này nhưng tay áo hơi dài."},
        {"speaker": "점원", "ko": "그러세요? 영수증을 가지고 오셨어요?", "vi": "Vậy ạ? Quý khách có mang theo hóa đơn không ạ?"},
        {"speaker": "손님", "ko": "네, 여기 있어요. 작은 사이즈로 입어 보고 교환할게요.", "vi": "Vâng, đây ạ. Tôi xin mặc thử size nhỏ hơn rồi đổi nhé."}
    ], "Tại Hàn Quốc, hầu hết cửa hàng cho phép đổi/hoàn tiền (교환/환불) trong vòng 7 ngày nếu còn nguyên tem mác và hóa đơn (영수증).", [
        {"q": "[Sách bài tập Q2-B03] Chia '-(으)ㄴ/는데' đúng cho tính từ '비싸다' và động từ '찾다':", "opts": ["비싼데 / 찾는데", "비싸는데 / 찾은데", "비싼데 / 찾은데", "비싸은데 / 찾는데"], "ans": 0, "exp": "Tính từ không patchim + -ㄴ데 (비싼데); Động từ luôn + -는데 (찾는데)."},
        {"q": "[Sách bài tập Q2-B03] Câu nào mang nghĩa 'Tôi mặc thử chiếc váy này nhé?':", "opts": ["이 치마를 입어 볼까요?", "이 치마를 신어 볼까요?", "이 치마를 써 볼까요?", "이 치마를 끼어 볼까요?"], "ans": 0, "exp": "Quần áo/váy dùng '입다' + '-아/어 보다' → 입어 볼까요?."}
    ]),
    (4, "Bệnh viện & Sức khỏe", "병원과 건강", [
        ("Phần 1 · Triệu chứng bệnh & Bộ phận cơ thể", [
            ("감기에 걸리다", "bị cảm cúm", "gam-gi-e geol-li-da", "환절기라서 감기에 걸렸어요.", "Vì giao mùa nên tôi bị cảm rồi.", ""),
            ("열이 나다", "bị sốt", "yeol-i na-da", "어젯밤부터 열이 나고 머리가 아파요.", "Từ tối qua tôi bị sốt và đau đầu.", ""),
            ("기침을 하다", "ho", "gi-chim-eul ha-da", "기침을 계속해서 목이 따가워요.", "Vì ho liên tục nên cổ họng rát quá.", ""),
            ("콧물이 나다", "sổ mũi, chảy nước mũi", "kon-mul-i na-da", "찬 바람을 쐬면 콧물이 나요.", "Hễ gặp gió lạnh là tôi bị sổ mũi.", "Biến âm ㅅ+ㅁ → [콘물]."),
            ("배탈이 나다", "đau bụng, rối loạn tiêu hóa", "bae-tal-i na-da", "찬 음식을 많이 먹어서 배탈이 났어요.", "Do ăn nhiều đồ lạnh nên tôi bị đau bụng.", ""),
            ("다치다", "bị thương", "da-chi-da", "축구를 하다가 발목을 다쳤어요.", "Đang đá bóng thì tôi bị trật/thương cổ chân.", "")
        ]),
        ("Phần 2 · Khám bệnh & Hiệu thuốc", [
            ("내과 / 치과", "khoa nội / nha khoa", "nae-gwa / chi-gwa", "배가 아프면 내과에 가야 해요.", "Nếu đau bụng thì phải đến khám khoa nội.", "안과: khoa mắt; 이비인후과: tai mũi họng."),
            ("진찰을 받다", "khám bệnh", "jin-chal-eul bat-da", "병원에서 의사 선생님께 진찰을 받았어요.", "Tôi đã được bác sĩ khám ở bệnh viện.", ""),
            ("처방전", "đơn thuốc", "cheo-bang-jeon", "처방전을 받아서 약국에 갔어요.", "Tôi nhận đơn thuốc rồi ra hiệu thuốc.", ""),
            ("약을 먹다", "uống thuốc", "yag-eul meok-da", "식사 후에 삼십 분 뒤에 약을 드세요.", "Hãy uống thuốc sau bữa ăn 30 phút nhé.", "Lưu ý tiếng Hàn nói 약을 먹다/드시다 (không dùng 마시다)."),
            ("주사를 맞다", "tiêm thuốc", "ju-sa-reul mat-da", "독감 예방 주사를 맞았어요.", "Tôi đã tiêm phòng cúm.", ""),
            ("푹 쉬다", "nghỉ ngơi thật kỹ", "puk swi-da", "집에서 따뜻한 물을 마시고 푹 쉬세요.", "Ở nhà hãy uống nước ấm và nghỉ ngơi thật khỏe nhé.", "")
        ])
    ], [
        {"pattern": "-아/어야 하다", "meaning": "Phải làm gì...", "construction": "Động từ + -아/어야 하다/되다", "usage": "Diễn tả nghĩa vụ hoặc điều cần thiết phải thực hiện.", "example1Ko": "열이 높아서 오늘 병원에 가야 해요.", "example1Vi": "Vì sốt cao nên hôm nay tôi phải đi bệnh viện."},
        {"pattern": "-(으)면 안 되다", "meaning": "Không được phép làm gì", "construction": "Động từ + -(으)면 안 되다", "usage": "Diễn tả sự cấm đoán hoặc lời dặn dò y tế/quy định.", "example1Ko": "약을 먹는 동안에는 술을 마시면 안 돼요.", "example1Vi": "Trong thời gian uống thuốc thì không được uống rượu."}
    ], [
        {"speaker": "의사", "ko": "어디가 편찮으세요?", "vi": "Bạn thấy khó chịu ở đâu ạ?"},
        {"speaker": "남", "ko": "어제부터 목이 많이 아프고 열도 조금 나요.", "vi": "Từ hôm qua cổ họng cháu đau nhiều và cũng hơi sốt ạ."},
        {"speaker": "의사", "ko": "목감기네요. 찬물을 마시면 안 되고 오늘 푹 쉬어야 해요.", "vi": "Cháu bị viêm họng cảm rồi. Không được uống nước lạnh và hôm nay phải nghỉ ngơi kỹ nhé."}
    ], "Ở Hàn Quốc, bệnh viện (병원) chỉ khám và cấp đơn thuốc (처방전), sau đó bệnh nhân mang đơn sang hiệu thuốc (약국) ngay cạnh viện để mua thuốc.", [
        {"q": "[Sách bài tập Q2-B04] Trong tiếng Hàn, cụm từ 'uống thuốc' và 'tiêm thuốc' dùng động từ nào?", "opts": ["약을 먹다 / 주사를 맞다", "약을 마시다 / 주사를 치다", "약을 먹다 / 주사를 입다", "약을 들다 / 주사를 받다"], "ans": 0, "exp": "Uống thuốc là '약을 먹다 (드시다)' và tiêm là '주사를 맞다'."},
        {"q": "[Sách bài tập Q2-B04] Chọn câu nghĩa 'Trong thư viện không được nói chuyện to':", "opts": ["도서관에서 크게 이야기하면 안 돼요.", "도서관에서 크게 이야기해야 해요.", "도서관에서 크게 이야기해도 돼요.", "도서관에서 크게 이야기하기로 했어요."], "ans": 0, "exp": "Cấm đoán dùng '-(으)면 안 되다'; cho phép dùng '-아/어도 되다'."}
    ]),
    (5, "Bưu điện & Ngân hàng", "우체국과 은행", [
        ("Phần 1 · Gửi thư, Bưu kiện & Chuyển phát", [
            ("편지를 보내다", "gửi thư", "pyeon-ji-reul bo-nae-da", "고향에 계신 부모님께 편지를 보냈어요.", "Tôi đã gửi thư cho bố mẹ ở quê.", "동사 đồng nghĩa: 부치다."),
            ("소포 / 택배", "bưu kiện / chuyển phát nhanh", "so-po / taek-bae", "베트남으로 소포를 부치고 싶어요.", "Tôi muốn gửi bưu kiện về Việt Nam.", ""),
            ("우표를 붙이다", "dán tem", "u-pyo-reul bu-chi-da", "봉투 오른쪽 위에 우표를 붙이세요.", "Hãy dán tem lên góc phải phía trên phong bì.", "Phát âm vòm hóa [부치다]."),
            ("주소", "địa chỉ", "ju-so", "받는 사람의 주소와 우편번호를 정확히 쓰세요.", "Hãy ghi chính xác địa chỉ và mã bưu chính của người nhận.", ""),
            ("무게를 재다", "cân trọng lượng", "mu-ge-reul jae-da", "소포를 저울에 올려놓고 무게를 쟀어요.", "Đặt kiện hàng lên cân và đo trọng lượng.", ""),
            ("항공편", "đường hàng không", "hang-gong-pyeon", "항공편으로 보내면 일주일쯤 걸려요.", "Nếu gửi bằng đường hàng không thì mất khoảng 1 tuần.", "배편: đường tàu biển.")
        ]),
        ("Phần 2 · Giao dịch Ngân hàng & Đổi tiền", [
            ("통장을 만들다", "mở sổ tài khoản", "tong-jang-eul man-deul-da", "외국인등록증이 있으면 통장을 만들 수 있어요.", "Nếu có thẻ đăng ký người nước ngoài thì có thể mở tài khoản.", ""),
            ("입금하다 / 출금하다", "nạp tiền / rút tiền", "ip-geum-ha-da / chul-geum-ha-da", "현금인출기(ATM)에서 돈을 출금했어요.", "Tôi đã rút tiền tại cây ATM.", ""),
            ("송금하다", "chuyển khoản, gửi tiền", "song-geum-ha-da", "매달 고향으로 생활비를 송금해요.", "Mỗi tháng tôi chuyển tiền sinh hoạt về quê.", ""),
            ("환전하다", "đổi ngoại tệ", "hwan-jeon-ha-da", "공항 은행에서 달러를 한국 돈으로 환전했어요.", "Tôi đã đổi đô-la sang tiền Hàn ở ngân hàng sân bay.", ""),
            ("환율", "tỷ giá hối đoái", "hwan-yul", "오늘은 어제보다 환율이 조금 올랐어요.", "Hôm nay tỷ giá tăng nhẹ so với hôm qua.", ""),
            ("수수료", "phí giao dịch", "su-su-ryo", "인터넷 뱅킹을 쓰면 송금 수수료가 무료예요.", "Dùng Internet Banking thì được miễn phí chuyển tiền.", "")
        ])
    ], [
        {"pattern": "-(으)면", "meaning": "Nếu... thì...", "construction": "Động từ / Tính từ + -(으)면", "usage": "Diễn tả điều kiện hoặc giả định.", "example1Ko": "특급우편으로 보내면 사흘 안에 도착해요.", "example1Vi": "Nếu gửi chuyển phát hỏa tốc thì sẽ tới trong vòng 3 ngày."},
        {"pattern": "-기 전에", "meaning": "Trước khi làm gì...", "construction": "Động từ + -기 전에", "usage": "Hành động vế sau diễn ra trước hành động vế trước.", "example1Ko": "은행에 가기 전에 여권과 신분증을 챙기세요.", "example1Vi": "Trước khi đến ngân hàng hãy chuẩn bị sẵn hộ chiếu và giấy tờ tùy thân."}
    ], [
        {"speaker": "직원", "ko": "어떻게 오셨어요?", "vi": "Quý khách cần hỗ trợ dịch vụ gì ạ?"},
        {"speaker": "흐엉", "ko": "베트남 하노이로 이 소포를 보내고 싶어요. 얼마나 걸려요?", "vi": "Tôi muốn gửi kiện hàng này về Hà Nội, Việt Nam. Mất bao lâu ạ?"},
        {"speaker": "직원", "ko": "항공편으로 보내면 오 일쯤 걸려요. 먼저 저울 위에 올려 주세요.", "vi": "Gửi đường hàng không thì mất khoảng 5 ngày ạ. Trước tiên xin đặt kiện hàng lên cân nhé."}
    ], "Khi mở tài khoản ngân hàng lần đầu tại Hàn Quốc, du học sinh cần mang Hộ chiếu (여권), Thẻ người nước ngoài (외국인등록증) và Giấy xác nhận đang theo học (재학증명서).", [
        {"q": "[Sách bài tập Q2-B05] Chia '-(으)면' đúng cho động từ '만들다' (làm) và '듣다' (nghe):", "opts": ["만들면 / 들으면", "만들으면 / 들으면", "만드면 / 듣으면", "만들면 / 듣으면"], "ans": 0, "exp": "Thân ㄹ ('만들다') cộng thẳng '면' → 만들면; bất quy tắc ㄷ ('듣다') → 들으면."},
        {"q": "[Sách bài tập Q2-B05] Chọn câu đúng cho 'Trước khi đi ngủ tôi viết nhật ký':", "opts": ["자기 전에 일기를 써요.", "자 전에 일기를 써요.", "잔 전에 일기를 써요.", "잘 기 전에 일기를 써요."], "ans": 0, "exp": "Dù ở thì nào, động từ đứng trước '-기 전에' luôn giữ nguyên gốc + 기 전에."}
    ]),
    (6, "Chỉ đường & Giao thông công cộng", "길 찾기와 교통", [
        ("Phần 1 · Hỏi đường & Phương hướng chi tiết", [
            ("사거리 / 교차로", "ngã tư / giao lộ", "sa-geo-ri / gyo-cha-ro", "사거리에서 오른쪽으로 도세요.", "Ở ngã tư hãy rẽ sang bên phải.", "삼거리: ngã ba."),
            ("모퉁이", "góc đường, góc phố", "mo-tung-i", "길 모퉁이에 편의점이 하나 있어요.", "Ở góc đường có một cửa hàng tiện lợi.", ""),
            ("건너다", "băng qua, sang đường", "geon-neo-da", "횡단보도를 건너서 백 미터쯤 직진하세요.", "Băng qua vạch sang đường rồi đi thẳng khoảng 100 mét.", ""),
            ("우회전 / 좌회전", "rẽ phải / rẽ trái", "u-hoe-jeon / jwa-hoe-jeon", "다음 신호등에서 좌회전하세요.", "Ở đèn giao thông tiếp theo hãy rẽ trái.", ""),
            ("지나치다", "đi lố, đi quá", "ji-na-chi-da", "이야기하다가 내릴 정류장을 지나쳤어요.", "Mải nói chuyện nên tôi đã đi quá trạm cần xuống.", ""),
            ("노선", "tuyến (xe buýt, tàu)", "no-seon", "지하철 이 호선으로 갈아타야 해요.", "Phải chuyển sang tàu điện ngầm tuyến số 2.", "")
        ]),
        ("Phần 2 · Sự cố giao thông & Hướng dẫn", [
            ("출퇴근 시간", "giờ cao điểm đi làm – tan tầm", "chul-toe-geun si-gan", "출퇴근 시간에는 지하철에 사람이 정말 많아요.", "Giờ cao điểm tàu điện ngầm cực kỳ đông người.", ""),
            ("놓치다", "lỡ (chuyến xe, tàu)", "no-chi-da", "조금 늦게 나와서 막차를 놓쳤어요.", "Ra trễ một chút nên tôi bị lỡ chuyến xe cuối.", "막차: chuyến cuối; 첫차: chuyến đầu."),
            ("배차 간격", "khoảng cách giữa các chuyến xe", "bae-cha gan-gyeok", "이 버스는 배차 간격이 십 분이에요.", "Tuyến buýt này cứ 10 phút có một chuyến.", ""),
            ("요금을 내다", "trả tiền vé/cước", "yo-geum-eul nae-da", "교통카드를 찍고 요금을 내요.", "Chạm thẻ giao thông để thanh toán tiền vé.", ""),
            ("노약자석", "ghế ưu tiên người già, thai phụ", "no-yak-ja-seok", "노약자석에는 자리를 양보해야 해요.", "Ở hàng ghế ưu tiên chúng ta nên nhường chỗ.", "양보하다: nhường nhịn.")
        ])
    ], [
        {"pattern": "-(으)ㄴ 후에", "meaning": "Sau khi làm gì...", "construction": "Động từ + -(으)ㄴ 후에 (뒤에)", "usage": "Diễn tả trình tự hành động nối tiếp nhau.", "example1Ko": "육교를 건넌 후에 왼쪽으로 가세요.", "example1Vi": "Sau khi qua cầu vượt bộ hành, hãy đi về phía bên trái."},
        {"pattern": "-아/어서 (순서)", "meaning": "Rồi... (trình tự gắn kết)", "construction": "Động từ + -아/어서", "usage": "Nối hai hành động có liên quan chặt chẽ.", "example1Ko": "시청역에 내려서 삼 번 출구로 나오세요.", "example1Vi": "Xuống ở ga Tòa thị chính rồi đi ra cửa số 3 nhé."}
    ], [
        {"speaker": "관광객", "ko": "실례합니다. 국립박물관에 가려면 어느 역에서 내려야 해요?", "vi": "Xin lỗi cho hỏi, muốn đi Bảo tàng Quốc gia thì phải xuống ở ga nào ạ?"},
        {"speaker": "민수", "ko": "이촌역에서 내리세요. 내린 후에 이 번 출구로 나가면 바로 보여요.", "vi": "Bạn xuống ở ga Ichon nhé. Sau khi xuống, đi ra cửa số 2 là thấy ngay."},
        {"speaker": "관광객", "ko": "친절하게 알려 주셔서 정말 감사합니다!", "vi": "Cảm ơn bạn rất nhiều vì đã chỉ dẫn tận tình!"}
    ], "Trên tàu điện ngầm Hàn Quốc có khu ghế ưu tiên (노약자석) và ghế màu hồng dành riêng cho phụ nữ mang thai (임산부 배려석), người trẻ thường để trống kể cả khi tàu đông.", [
        {"q": "[Sách bài tập Q2-B06] Chia '-(으)ㄴ 후에' đúng cho động từ '내리다' (xuống xe) và '먹다' (ăn):", "opts": ["내린 후에 / 먹은 후에", "내리는 후에 / 먹은 후에", "내릴 후에 / 먹는 후에", "내리은 후에 / 먹은 후에"], "ans": 0, "exp": "Không patchim + -ㄴ 후에 (내린 후에); có patchim + -은 후에 (먹은 후에)."}
    ]),
    (7, "Du lịch & Đặt phòng", "여행", [
        ("Phần 1 · Chuẩn bị hành trình & Lưu trú", [
            ("계획을 세우다", "lập kế hoạch", "gye-hoeg-eul se-u-da", "여름 휴가 여행 계획을 세웠어요.", "Tôi đã lập kế hoạch cho chuyến du lịch hè.", ""),
            ("숙소를 예약하다", "đặt chỗ nghỉ/khách sạn", "suk-so-reul ye-yak-ha-da", "인터넷으로 바닷가 근처 숙소를 예약했어요.", "Tôi đã đặt chỗ nghỉ gần biển qua mạng.", ""),
            ("짐을 싸다", "xếp hành lý", "jim-eul ssa-da", "출발 전날 밤에 미리 짐을 쌌어요.", "Tôi đã xếp sẵn hành lý vào tối trước ngày khởi hành.", "짐을 풀다: dỡ hành lý."),
            ("왕복표 / 편도표", "vé khứ hồi / vé một chiều", "wang-bok-pyo / pyeon-do-pyo", "제주도행 비행기 왕복표를 예매했어요.", "Tôi đã đặt trước vé máy bay khứ hồi đi Jeju.", ""),
            ("관광지", "điểm tham quan du lịch", "gwan-gwang-ji", "경주는 역사가 깊은 유명 관광지예요.", "Gyeongju là điểm du lịch nổi tiếng giàu lịch sử.", ""),
            ("기념품", "quà lưu niệm", "gi-nyeom-pum", "가족들에게 줄 전통 기념품을 샀어요.", "Tôi đã mua quà lưu niệm truyền thống tặng gia đình.", "")
        ]),
        ("Phần 2 · Trải nghiệm & Kỷ niệm chuyến đi", [
            ("경치가 아름답다", "phong cảnh tuyệt đẹp", "gyeong-chi-ga a-reum-dap-da", "산 위에서 보는 경치가 정말 아름다워요.", "Phong cảnh nhìn từ đỉnh núi thực sự tuyệt đẹp.", "아름답다 → 아름다워요."),
            ("일출을 보다", "ngắm bình minh", "il-chul-eul bo-da", "성산일출봉에서 멋진 일출을 봤어요.", "Tôi đã ngắm bình minh tuyệt đẹp tại đỉnh Seongsan.", "일몰: hoàng hôn."),
            ("특산물을 맛보다", "thưởng thức đặc sản", "teuk-san-mul-eul mat-bo-da", "그 지역의 유명한 특산물을 맛봤어요.", "Tôi đã nếm thử đặc sản nổi tiếng của vùng đó.", ""),
            ("추억이 남다", "đọng lại kỷ niệm", "chu-eog-i nam-da", "친구들과 함께한 여행이라 좋은 추억이 남았어요.", "Vì là chuyến đi cùng bạn bè nên đã để lại nhiều kỷ niệm đẹp.", "")
        ])
    ], [
        {"pattern": "-(으)ㄴ 적이 있다/없다", "meaning": "Đã từng / Chưa từng làm gì", "construction": "Động từ + -(으)ㄴ 적이 있다/없다", "usage": "Nói về kinh nghiệm trong quá khứ.", "example1Ko": "작년에 제주도에 가 본 적이 있어요.", "example1Vi": "Năm ngoái tôi đã từng đi đảo Jeju rồi."},
        {"pattern": "-(으)ㄹ 줄 알다/모르다", "meaning": "Biết / Không biết cách làm gì", "construction": "Động từ + -(으)ㄹ 줄 알다/모르다", "usage": "Diễn tả kỹ năng đã học (lái xe, bơi, nấu ăn...).", "example1Ko": "자동차를 운전할 줄 알아요?", "example1Vi": "Bạn có biết lái xe ô tô không?"}
    ], [
        {"speaker": "유진", "ko": "흐엉 씨는 부산에 가 본 적이 있어요?", "vi": "Hương đã từng đi Busan bao giờ chưa?"},
        {"speaker": "흐엉", "ko": "아니요, 아직 가 본 적이 없어요. 이번 방학에 꼭 가 보고 싶어요.", "vi": "Chưa, mình vẫn chưa từng đi. Kỳ nghỉ này mình rất muốn đi thử."},
        {"speaker": "유진", "ko": "해운대 바다도 아름답고 해산물도 정말 맛있으니까 꼭 가 보세요!", "vi": "Biển Haeundae đẹp mà hải sản cũng ngon lắm nên nhất định hãy đi nhé!"}
    ], "Đảo Jeju (제주도), cố đô Gyeongju (경주) và thành phố biển Busan (부산) là 3 điểm du lịch nội địa tiêu biểu nhất Hàn Quốc.", [
        {"q": "[Sách bài tập Q2-B07] Chọn câu đúng nghĩa 'Tôi chưa từng ăn thử món mì lạnh':", "opts": ["냉면을 먹어 본 적이 없어요.", "냉면을 먹는 적이 없어요.", "냉면을 먹을 적이 없어요.", "냉면을 먹어 본 적이 안 있어요."], "ans": 0, "exp": "Kinh nghiệm quá khứ dùng 'V-(으)ㄴ 적이 있다/없다'."}
    ]),
    (8, "Ngày lễ & Phong tục Hàn Quốc", "명절과 풍습", [
        ("Phần 1 · Tết Seollal & Trung thu Chuseok", [
            ("명절", "ngày lễ cổ truyền", "myeong-jeol", "설날과 추석은 한국의 대표적인 명절이에요.", "Tết Âm lịch và Trung thu là hai ngày lễ cổ truyền tiêu biểu của Hàn Quốc.", ""),
            ("고향에 내려가다", "về quê", "go-hyang-e nae-ryeo-ga-da", "명절에는 가족들이 모두 고향에 내려가요.", "Vào dịp lễ cổ truyền cả gia đình đều về quê.", ""),
            ("세배를 하다", "lạy chúc Tết người lớn", "se-bae-reul ha-da", "설날 아침에 어른들께 세배를 해요.", "Sáng mồng 1 Tết con cháu lạy chúc Tết người lớn.", "세뱃돈: tiền lì xì."),
            ("떡국", "canh bánh gạo (ăn dịp Tết)", "tteok-guk", "설날에 떡국을 먹으면 한 살을 더 먹어요.", "Người Hàn quan niệm ăn canh bánh gạo ngày Tết là thêm một tuổi.", ""),
            ("송편", "bánh gạo hình bán nguyệt (Trung thu)", "song-pyeon", "추석에는 가족과 함께 송편을 빚어요.", "Dịp Trung thu gia đình cùng nhau nặn bánh Songpyeon.", ""),
            ("성묘를 가다", "đi tảo mộ", "seong-myo-reul ga-da", "명절 아침에 차례를 지내고 성묘를 가요.", "Sáng ngày lễ gia đình cúng gia tiên rồi đi tảo mộ.", "")
        ]),
        ("Phần 2 · Trò chơi dân gian & Lời chúc", [
            ("한복을 입다", "mặc Hanbok", "han-bog-eul ip-da", "명절에 아이들이 예쁜 한복을 입어요.", "Ngày lễ các em nhỏ mặc Hanbok xinh xắn.", ""),
            ("윷놀이", "trò chơi ném gậy Yut", "yun-no-ri", "친척들과 모여서 윷놀이를 했어요.", "Họ hàng quây quần chơi trò ném gậy Yut.", "Biến âm ㅊ+ㄴ → [윤노리]."),
            ("보름달", "trăng rằm", "bo-reum-dal", "추석 밤에 밝은 보름달을 보며 소원을 빌어요.", "Đêm Trung thu ngắm trăng rằm sáng và ước nguyện.", "소원을 빌다: cầu ước."),
            ("새해 복 많이 받으세요", "Chúc mừng năm mới nhiều phúc lộc", "sae-hae bok ma-ni ba-deu-se-yo", "선생님, 새해 복 많이 받으세요!", "Thưa thầy, chúc thầy năm mới dồi dào phúc lộc ạ!", "Câu chúc Tết chuẩn nhất.")
        ])
    ], [
        {"pattern": "-(으)ㄹ 때", "meaning": "Khi / Lúc...", "construction": "Động từ / Tính từ + -(으)ㄹ 때, Danh từ + 때", "usage": "Chỉ thời điểm diễn ra hành động hoặc trạng thái.", "example1Ko": "한복을 입을 때 기분이 특별해요.", "example1Vi": "Khi mặc Hanbok tâm trạng rất đặc biệt."},
        {"pattern": "-아/어 주다 (드리다)", "meaning": "Làm gì giúp / cho ai", "construction": "Động từ + -아/어 주다 (kính ngữ: 드리다)", "usage": "Thực hiện hành động vì lợi ích của người khác.", "example1Ko": "할머니께서 맛있는 전을 만들어 주셨어요.", "example1Vi": "Bà nội đã làm bánh rán ngon cho chúng tôi."}
    ], [
        {"speaker": "민수", "ko": "베트남에도 한국의 설날 같은 큰 명절이 있어요?", "vi": "Ở Việt Nam cũng có Tết lớn giống Seollal của Hàn Quốc chứ?"},
        {"speaker": "흐엉", "ko": "네, 베트남에서는 '뗏(Tết)'이라고 해요. 설날 때 온 가족이 모여요.", "vi": "Có chứ, ở Việt Nam gọi là Tết. Vào dịp Tết cả đại gia đình sum họp."},
        {"speaker": "민수", "ko": "한국하고 정말 비슷하네요! 그때는 주로 무슨 음식을 먹어요?", "vi": "Giống Hàn Quốc quá nhỉ! Vào dịp đó mọi người thường ăn món gì?"}
    ], "Việt Nam và Hàn Quốc có nét tương đồng văn hóa rất lớn ở Tết Nguyên Đán (설날) và Tết Trung Thu (추석), rất hay xuất hiện trong bài Đọc hiểu TOPIK.", [
        {"q": "[Sách bài tập Q2-B08] Chia '-(으)ㄹ 때' đúng với động từ '살다' (sống) và '듣다' (nghe):", "opts": ["살 때 / 들을 때", "살을 때 / 들을 때", "사을 때 / 듣을 때", "살 때 / 듣을 때"], "ans": 0, "exp": "Thân ㄹ ('살다') giữ nguyên + 때 → 살 때; bất quy tắc ㄷ ('듣다') → 들을 때."}
    ]),
    (9, "Sinh hoạt công cộng & Quy tắc", "공공장소 예절", [
        ("Phần 1 · Quy định nơi công cộng", [
            ("규칙을 지키다", "tuân thủ quy tắc", "gyu-chig-eul ji-ki-da", "공공장소에서는 기본 규칙을 지켜야 해요.", "Ở nơi công cộng phải tuân thủ các quy tắc cơ bản.", ""),
            ("줄을 서다", "xếp hàng", "jul-eul seo-da", "버스를 탈 때 차례대로 줄을 서세요.", "Khi lên xe buýt hãy xếp hàng theo thứ tự.", ""),
            ("금연 구역", "khu vực cấm hút thuốc", "geum-yeon gu-yeok", "건물 전체가 금연 구역이에요.", "Toàn bộ tòa nhà là khu vực cấm hút thuốc.", ""),
            ("정숙하다", "giữ trật tự, yên lặng", "jeong-suk-ha-da", "도서관 열람실에서는 정숙해 주세요.", "Trong phòng đọc thư viện xin vui lòng giữ yên lặng.", ""),
            ("사진 촬영 금지", "cấm chụp ảnh", "sa-jin chwal-yeong geum-ji", "미술관 안에서는 사진 촬영이 금지되어 있어요.", "Bên trong bảo tàng mỹ thuật cấm chụp ảnh.", ""),
            ("쓰레기를 버리다", "vứt rác", "sseu-re-gi-reul beo-ri-da", "길에 쓰레기를 함부로 버리면 안 돼요.", "Không được vứt rác bừa bãi ra đường.", "")
        ]),
        ("Phần 2 · Phân loại rác & Tiện ích đô thị", [
            ("분리수거하다", "phân loại rác tái chế", "bul-li-su-geo-ha-da", "종이와 플라스틱은 따로 분리수거해야 해요.", "Giấy và nhựa phải được phân loại rác riêng.", "Biến âm ㄴ+ㄹ → [불리수거]."),
            ("종량제 봉투", "túi rác tính phí theo dung tích", "jong-nyang-je bong-tu", "일반 쓰레기는 종량제 봉투에 담아 버려요.", "Rác sinh hoạt thường phải bỏ vào túi rác quy định.", ""),
            ("분실물 센터", "trung tâm đồ thất lạc", "bun-sil-mul sen-teo", "지하철에 가방을 두고 내려서 분실물 센터에 전화했어요.", "Để quên cặp trên tàu nên tôi đã gọi trung tâm đồ thất lạc.", ""),
            ("비상구", "lối thoát hiểm", "bi-sang-gu", "건물에 들어가면 비상구 위치를 확인하세요.", "Khi vào tòa nhà hãy kiểm tra vị trí lối thoát hiểm.", "")
        ])
    ], [
        {"pattern": "-아/어도 되다", "meaning": "Được phép làm gì", "construction": "Động từ + -아/어도 되다", "usage": "Xin phép hoặc cho phép thực hiện hành động.", "example1Ko": "로비에서는 사진을 찍어도 돼요.", "example1Vi": "Ở sảnh ngoài thì được phép chụp ảnh."},
        {"pattern": "-(으)니까 (발견)", "meaning": "Khi làm... thì thấy rằng...", "construction": "Động từ + -(으)니까", "usage": "Khi hành động vế trước xảy ra thì phát hiện kết quả ở vế sau.", "example1Ko": "밖으로 나오니까 비가 오고 있었어요.", "example1Vi": "Khi bước ra ngoài thì thấy trời đang mưa."}
    ], [
        {"speaker": "관리인", "ko": "학생, 일반 쓰레기는 그냥 버리면 안 돼요.", "vi": "Em sinh viên ơi, rác thường không được vứt không như vậy đâu."},
        {"speaker": "남", "ko": "죄송합니다! 한국에 온 지 얼마 안 돼서 잘 몰랐어요. 어떻게 해야 해요?", "vi": "Cháu xin lỗi ạ! Cháu mới sang Hàn chưa lâu nên chưa rõ. Phải làm thế nào ạ?"},
        {"speaker": "관리인", "ko": "편의점에서 종량제 봉투를 사서 버리고, 병과 캔은 분리수거함에 넣으세요.", "vi": "Em mua túi rác theo quy định ở cửa hàng tiện lợi để bỏ rác thường, còn chai lọ và lon thì bỏ vào thùng tái chế nhé."}
    ], "Hệ thống phân loại rác (분리수거) và túi rác theo thể tích (종량제 봉투) tại Hàn Quốc rất nghiêm ngặt, là chủ đề thực tế cực kỳ hay gặp trong đề Nghe – Đọc TOPIK.", [
        {"q": "[Sách bài tập Q2-B09] Chọn cặp cấu trúc Xin phép – Trả lời tự nhiên nhất:", "opts": ["여기에 앉아도 돼요? — 네, 앉으세요.", "여기에 앉으면 안 돼요? — 네, 안 돼요.", "여기에 앉아야 해요? — 아니요, 앉으세요.", "여기에 앉기로 했어요? — 네, 돼요."], "ans": 0, "exp": "'-아/어도 돼요?' dùng để xin phép lịch sự."}
    ]),
    (10, "Cuộc sống tại Hàn Quốc & Kế hoạch", "한국 생활과 계획", [
        ("Phần 1 · Thích nghi du học & Việc làm thêm", [
            ("적응하다", "thích nghi, hòa nhập", "jeog-eung-ha-da", "친구들 덕분에 한국 생활에 빨리 적응했어요.", "Nhờ các bạn mà tôi đã nhanh chóng thích nghi với cuộc sống Hàn Quốc.", ""),
            ("유학생", "du học sinh", "yu-hak-saeng", "우리 반에는 여러 나라에서 온 유학생이 있어요.", "Lớp tôi có du học sinh đến từ nhiều quốc gia.", ""),
            ("기숙사", "ký túc xá", "gi-suk-sa", "학교 안에 있는 기숙사에서 생활해요.", "Tôi sinh hoạt tại ký túc xá trong khuôn viên trường.", ""),
            ("아르바이트", "việc làm thêm (part-time)", "a-reu-ba-i-teu", "주말마다 커피숍에서 아르바이트를 해요.", "Mỗi cuối tuần tôi đi làm thêm ở quán cà phê.", "Viết tắt: 알바."),
            ("장학금을 받다", "nhận học bổng", "jang-hak-geum-eul bat-da", "열심히 공부해서 이번 학기에 장학금을 받았어요.", "Học tập chăm chỉ nên học kỳ này tôi đã nhận được học bổng.", ""),
            ("신청하다", "đăng ký, nộp đơn", "sin-cheong-ha-da", "다음 달 한국어능력시험(TOPIK)을 신청했어요.", "Tôi đã đăng ký kỳ thi năng lực tiếng Hàn TOPIK tháng sau.", "")
        ]),
        ("Phần 2 · Mục tiêu tương lai", [
            ("목표를 세우다", "đặt mục tiêu", "mok-pyo-reul se-u-da", "올해 토픽 2급 합격 목표를 세웠어요.", "Năm nay tôi đã đặt mục tiêu đỗ TOPIK Cấp 2.", ""),
            ("실력이 늘다", "năng lực/trình độ tiến bộ", "sil-lyeog-i neul-da", "매일 연습하니까 말하기 실력이 많이 늘었어요.", "Luyện tập mỗi ngày nên kỹ năng nói đã tiến bộ rõ rệt.", ""),
            ("합격하다", "thi đỗ, trúng tuyển", "hap-gyeok-ha-da", "시험에 꼭 합격하고 싶어요.", "Tôi nhất định muốn thi đỗ kỳ thi.", "Đối nghĩa: 불합격하다 / 떨어지다."),
            ("졸업하다", "tốt nghiệp", "jol-eop-ha-da", "대학교를 졸업한 후에 무역 회사에 취직할 거예요.", "Sau khi tốt nghiệp đại học tôi sẽ xin việc vào công ty thương mại.", "입학하다: nhập học."),
            ("취직하다", "xin được việc, đi làm", "chwi-jik-ha-da", "한국 기업에 취직하려고 한국어를 배워요.", "Tôi học tiếng Hàn để vào làm tại doanh nghiệp Hàn Quốc.", "")
        ])
    ], [
        {"pattern": "-(으)ㄴ 지 ... 되다", "meaning": "Đã được (bao lâu) kể từ khi...", "construction": "Động từ + -(으)ㄴ 지 + Thời gian + 되다", "usage": "Tính khoảng thời gian từ lúc bắt đầu một việc đến nay.", "example1Ko": "한국어를 배운 지 육 개월이 되었어요.", "example1Vi": "Tôi học tiếng Hàn đến nay đã được 6 tháng."},
        {"pattern": "-겠- (의지/추측)", "meaning": "Sẽ / Chắc hẳn là...", "construction": "Động từ / Tính từ + -겠-", "usage": "Diễn tả quyết tâm hoặc phỏng đoán.", "example1Ko": "앞으로도 매일 꾸준히 공부하겠습니다.", "example1Vi": "Sau này tôi cũng sẽ học tập đều đặn mỗi ngày."}
    ], [
        {"speaker": "선생님", "ko": "흐엉 씨, 한국어를 공부한 지 얼마나 됐어요?", "vi": "Hương học tiếng Hàn được bao lâu rồi?"},
        {"speaker": "흐엉", "ko": "공부한 지 이제 일 년쯤 됐어요. 요즘 발음과 듣기가 재미있어요.", "vi": "Em học đến nay được khoảng 1 năm rồi ạ. Dạo này thấy phát âm và nghe rất thú vị."},
        {"speaker": "선생님", "ko": "실력이 정말 많이 늘었네요! 이번 토픽 시험에 꼭 합격할 거예요.", "vi": "Trình độ của em tiến bộ nhiều thật đấy! Kỳ thi TOPIK tới chắc chắn em sẽ đỗ thôi."}
    ], "Đạt mốc TOPIK I Cấp 2 (≥ 140/200 điểm) là nền tảng vững chắc để bước sang Giáo trình Trung cấp 3 và chinh phục TOPIK II.", [
        {"q": "[Sách bài tập Q2-B10] Chọn câu đúng nghĩa 'Tôi đến Hàn Quốc đã được 1 năm':", "opts": ["한국에 온 지 일 년이 됐어요.", "한국에 오는 지 일 년이 됐어요.", "한국에 올 지 일 년이 됐어요.", "한국에 오은 지 일 년이 됐어요."], "ans": 0, "exp": "오다 + -ㄴ 지 → 온 지 + khoảng thời gian + 되다."}
    ])
]

# Also map the 15 chunks of topik1_bank.json (432 real MP3 items) as chapters 11..15 / extra practice parts of Q2 so Q2 has ALL 15 chapters + real MP3 sentences!
for extra_ls in range(11, 16):
    tp_chunk = [x for x in tp1_bank if x["lesson"] == (extra_ls - 10)]
    p1_rows = [(w["korean"], w["vietnamese"], w.get("pronunciation", ""), w["exampleKo"], w["exampleVi"], w.get("note", "")[:90]) for w in tp_chunk[:10]]
    p2_rows = [(w["korean"], w["vietnamese"], w.get("pronunciation", ""), w["exampleKo"], w["exampleVi"], w.get("note", "")[:90]) for w in tp_chunk[10:20]]
    p3_rows = [(w["korean"], w["vietnamese"], w.get("pronunciation", ""), w["exampleKo"], w["exampleVi"], w.get("note", "")[:90]) for w in tp_chunk[20:30]]
    titles_11_15 = {
        11: ("Phim ảnh & Văn hóa đại chúng", "영화와 대중문화"),
        12: ("Tìm nhà & Chuyển chỗ ở", "집 구하기와 이사"),
        13: ("Thư mời & Chúc mừng", "초대와 축하"),
        14: ("Sở thích nâng cao & CLB", "동아리와 여가"),
        15: ("Tổng ôn Sơ cấp 2 · Chinh phục 140+ TOPIK I", "초급 2 종합 복습")
    }
    t_vi, t_ko = titles_11_15[extra_ls]
    Q2_RAW_CHAPTERS.append((
        extra_ls, t_vi, t_ko,
        [
            ("Phần 1 · Từ vựng trọng tâm TOPIK I (Nhóm A)", p1_rows),
            ("Phần 2 · Từ vựng ngữ cảnh câu (Nhóm B)", p2_rows),
            ("Phần 3 · Mở rộng phản xạ đọc – nghe (Nhóm C)", p3_rows)
        ],
        [
            {"pattern": "-기 때문에", "meaning": "Bởi vì... nên...", "construction": "Động từ / Tính từ + -기 때문에, Danh từ + 때문에", "usage": "Nêu lý do rõ ràng trong cả văn nói và văn viết.", "example1Ko": "교통이 편리하기 때문에 이 집을 선택했어요.", "example1Vi": "Vì giao thông thuận tiện nên tôi đã chọn ngôi nhà này."}
        ],
        [
            {"speaker": "민수", "ko": f"오늘 {t_ko} 단어와 문법을 복습해 볼까요?", "vi": f"Hôm nay chúng mình cùng ôn tập từ vựng và ngữ pháp bài {t_vi} nhé?"},
            {"speaker": "흐엉", "ko": "좋아요! 작은 파트별로 나누어 외우니까 훨씬 쉽게 기억돼요.", "vi": "Tuyệt quá! Chia nhỏ từng phần để học nên dễ nhớ hơn hẳn."}
        ],
        "Chia từ vựng thành từng cụm 10 từ kèm câu ngữ cảnh giúp tăng tỷ lệ nhớ dài hạn gấp đôi so với học dồn hàng trăm từ.",
        [
            {"q": f"[Sách bài tập Q2-B{extra_ls:02d}] Chọn cách kết hợp danh từ với '때문에' đúng ngữ pháp:", "opts": ["비 때문에 소풍을 못 갔어요.", "비가 때문에 소풍을 못 갔어요.", "비기 때문에 소풍을 못 갔어요.", "비아서 소풍을 못 갔어요."], "ans": 0, "exp": "Danh từ gắn trực tiếp với '때문에' (비 때문에, 시험 때문에)."}
        ]
    ))

# --- BOOKS 3, 4, 5, 6: TRUNG CẤP 1–2 & CAO CẤP 1–2 (MỖI QUYỂN 8 CHƯƠNG CỐT LÕI × 2 PHẦN TỪ VỰNG + GIÁO TRÌNH + SÁCH BÀI TẬP) ---
HIGHER_BOOKS_SPEC = [
    {
        "bookId": "q3",
        "bookNum": 3,
        "title": "Tiếng Hàn Tổng Hợp · Quyển 3 (Trung cấp 1)",
        "shortTitle": "Quyển 3 · Trung cấp 1",
        "levelBadge": "TOPIK II · Cấp 3",
        "subtitle": "8 Chương cốt lõi · Tường thuật gián tiếp, Âm Hán–Hàn & Câu 1–20 TOPIK II",
        "scale": {"examLevel": "topik2", "maxScore": 300, "passScore": 120, "excellentScore": 145, "gradeName": "TOPIK II · Cấp 3"},
        "chapters": [
            (1, "Đời sống Đại học & Chọn chuyên ngành", "대학 생활과 전공", [
                ("Phần 1 · Học vụ & Đăng ký môn", [
                    ("전공하다", "học chuyên ngành", "jeon-gong-ha-da", "대학교에서 한국어교육을 전공하고 있습니다.", "Tôi đang học chuyên ngành Sư phạm Tiếng Hàn tại đại học.", "전공: chuyên ngành."),
                    ("수강 신청", "đăng ký tín chỉ/môn học", "su-gang sin-cheong", "수강 신청 기간을 놓치지 않도록 주의하세요.", "Hãy chú ý kẻo lỡ thời gian đăng ký môn học.", ""),
                    ("강의를 듣다", "nghe giảng, theo học môn", "gang-ui-reul deut-da", "이번 학기에 경제학 강의를 듣게 되었어요.", "Học kỳ này tôi được theo học bài giảng kinh tế học.", ""),
                    ("과제를 제출하다", "nộp bài tập tiểu luận", "gwa-je-reul je-chul-ha-da", "금요일 자정까지 보고서 과제를 제출해야 한다.", "Phải nộp bài báo cáo trước nửa đêm thứ Sáu.", ""),
                    ("학점을 따다", "đạt tín chỉ / điểm học phần", "hak-jeom-eul tta-da", "졸업하려면 백삼십 학점을 따야 합니다.", "Để tốt nghiệp phải tích lũy đủ 130 tín chỉ.", ""),
                    ("장학금 혜택", "chế độ ưu đãi học bổng", "jang-hak-geum hye-taek", "성적이 우수하면 장학금 혜택을 받을 수 있다.", "Nếu thành tích xuất sắc có thể nhận chế độ học bổng.", "")
                ]),
                ("Phần 2 · Giao lưu học đường & Định hướng", [
                    ("동아리에 가입하다", "gia nhập câu lạc bộ", "dong-a-ri-e ga-ip-ha-da", "사진 동아리에 가입해서 새 친구들을 사귀었다.", "Gia nhập CLB nhiếp ảnh nên tôi kết bạn được với nhiều người mới.", ""),
                    ("적성에 맞다", "phù hợp năng khiếu/sở trường", "jeok-seong-e mat-da", "통역 일이 제 적성에 아주 잘 맞아요.", "Công việc phiên dịch rất hợp với sở trường của tôi.", "Hay gặp Câu 1–4 TOPIK II."),
                    ("조언을 구하다", "xin lời khuyên", "jo-eon-eul gu-ha-da", "진로 문제로 지도 교수님께 조언을 구했다.", "Tôi đã xin lời khuyên từ giáo sư hướng dẫn về định hướng nghề nghiệp.", ""),
                    ("경험을 쌓다", "tích lũy kinh nghiệm", "gyeong-heom-eul ssa-ta", "방학 동안 인턴십을 하며 실무 경험을 쌓았다.", "Trong kỳ nghỉ tôi đi thực tập và tích lũy kinh nghiệm thực tế.", "쌓다 phát âm [싸타]."),
                    ("미루다", "trì hoãn", "mi-ru-da", "오늘 할 일을 내일로 미루지 마세요.", "Đừng trì hoãn việc hôm nay sang ngày mai.", ""),
                    ("성취감", "cảm giác thành tựu", "seong-chwi-gam", "목표를 이루었을 때 큰 성취감을 느낀다.", "Khi đạt được mục tiêu ta cảm nhận được thành tựu lớn.", "")
                ])
            ], [
                {"pattern": "-게 되다", "meaning": "Trở nên / Được / Phải (do hoàn cảnh dẫn tới)", "construction": "Động từ + -게 되다", "usage": "Diễn tả sự thay đổi sang trạng thái hoặc hoàn cảnh mới ngoài dự tính ban đầu.", "example1Ko": "한국 드라마를 보다가 한국어를 전공하게 되었어요.", "example1Vi": "Nhờ xem phim Hàn mà tôi đã đi đến quyết định học chuyên ngành tiếng Hàn."},
                {"pattern": "-도록", "meaning": "Để mà / Sao cho...", "construction": "Động từ + -도록", "usage": "Chỉ mục đích hoặc mức độ thực hiện hành động.", "example1Ko": "수업에 늦지 않도록 일찍 출발하세요.", "example1Vi": "Hãy xuất phát sớm để không bị muộn học."}
            ], [
                {"speaker": "선배", "ko": "신입생 여러분, 수강 신청을 할 때는 자신의 적성에 맞는 과목을 고르도록 하세요.", "vi": "Các bạn tân sinh viên, khi đăng ký môn hãy chọn môn phù hợp với sở trường của mình nhé."},
                {"speaker": "흐엉", "ko": "선배님, 전공 과목 외에 교양 수업도 들어야 하지요?", "vi": "Tiền bối ơi, ngoài môn chuyên ngành thì cũng phải học cả môn đại cương đúng không ạ?"}
            ], "Trong TOPIK II Câu 1–4, cấu trúc '-게 되다' và '-도록' xuất hiện với tần suất rất cao ở phần hoàn thành câu.", [
                {"q": "[Sách bài tập Q3-B01] Chọn cấu trúc đồng nghĩa gần nhất với '시험에 늦지 않게 일찍 잤다':", "opts": ["시험에 늦지 않도록 일찍 잤다.", "시험에 늦기 때문에 일찍 잤다.", "시험에 늦는 바람에 일찍 잤다.", "시험에 늦은 반면에 일찍 잤다."], "ans": 0, "exp": "'-지 않게' và '-지 않도록' đều mang nghĩa 'để không...'."}
            ]),
            (2, "Thói quen tiêu dùng & Mua sắm thông minh", "합리적인 소비", [
                ("Phần 1 · Chi tiêu & Ngân sách", [
                    ("소비 습관", "thói quen tiêu dùng", "so-bi seup-gwan", "올바른 소비 습관을 기르는 것이 중요하다.", "Rèn luyện thói quen tiêu dùng đúng đắn rất quan trọng.", ""),
                    ("충동구매", "mua sắm bốc đồng", "chung-dong-gu-mae", "할인 광고를 보고 충동구매를 후회했다.", "Xem quảng cáo giảm giá rồi mua bốc đồng nên tôi đã hối hận.", ""),
                    ("가계부를 쓰다", "ghi sổ chi tiêu gia đình", "ga-gye-bu-reul sseu-da", "지출을 줄이려고 매일 가계부를 쓴다.", "Để giảm chi tiêu tôi ghi sổ thu chi mỗi ngày.", ""),
                    ("절약하다", "tiết kiệm", "jeol-yak-ha-da", "전기 요금을 절약하기 위해 플러그를 뽑았다.", "Rút phích cắm để tiết kiệm tiền điện.", "Đối nghĩa: 낭비하다 (lãng phí)."),
                    ("가성비가 좋다", "giá trị tốt so với giá tiền", "ga-seong-bi-ga jo-ta", "이 노트북은 성능이 뛰어나고 가성비가 좋다.", "Chiếc laptop này hiệu năng cao và rất đáng đồng tiền.", ""),
                    ("비교하다", "so sánh", "bi-gyo-ha-da", "여러 쇼핑몰의 가격과 품질을 꼼꼼히 비교했다.", "Tôi đã so sánh kỹ giá cả và chất lượng giữa nhiều trang mua sắm.", "")
                ]),
                ("Phần 2 · Đánh giá sản phẩm & Dịch vụ", [
                    ("품질이 우수하다", "chất lượng ưu việt", "pum-jil-i u-su-ha-da", "가격은 조금 비싸지만 품질이 매우 우수하다.", "Giá hơi đắt một chút nhưng chất lượng vô cùng xuất sắc.", ""),
                    ("후기 / 리뷰", "đánh giá sau sử dụng", "hu-gi / ri-byu", "물건을 사기 전에 구매자 후기를 꼭 읽어 본다.", "Trước khi mua hàng tôi luôn đọc đánh giá của người mua trước.", ""),
                    ("무료 배송", "giao hàng miễn phí", "mu-ryo bae-song", "삼만 원 이상 구매하면 무료 배송이 된다.", "Mua từ 30.000 won trở lên sẽ được miễn phí vận chuyển.", ""),
                    ("유효 기간", "thời hạn sử dụng / hiệu lực", "yu-hyo gi-gan", "쿠폰의 유효 기간이 지나서 사용할 수 없다.", "Phiếu giảm giá đã quá hạn hiệu lực nên không dùng được.", ""),
                    ("수리비를 내다", "trả phí sửa chữa", "su-ri-bi-reul nae-da", "보증 기간이 지나서 수리비를 직접 내야 했다.", "Hết thời hạn bảo hành nên tôi phải tự trả phí sửa chữa.", ""),
                    ("만족스럽다", "đáng hài lòng", "man-jok-seu-reop-da", "배송도 빠르고 서비스도 만족스러웠다.", "Giao hàng nhanh mà dịch vụ cũng rất hài lòng.", "불만족스럽다: không hài lòng.")
                ])
            ], [
                {"pattern": "-(으)ㄴ/는 데다가", "meaning": "Không những... mà còn thêm...", "construction": "Động từ/Tính từ + -(으)ㄴ/는 데다가", "usage": "Bổ sung thêm một đặc điểm cùng chiều (tốt + tốt, xấu + xấu).", "example1Ko": "이 식당은 값이 싼 데다가 양도 푸짐해요.", "example1Vi": "Quán này không những giá rẻ mà khẩu phần còn đầy đặn."},
                {"pattern": "-는 바람에", "meaning": "Tại vì (sự cố bất ngờ) nên...", "construction": "Động từ + -는 바람에", "usage": "Nêu nguyên nhân ngoài ý muốn dẫn đến kết quả tiêu cực ở quá khứ.", "example1Ko": "갑자기 소나기가 오는 바람에 옷이 다 젖었어요.", "example1Vi": "Tại bất ngờ đổ mưa rào nên quần áo bị ướt hết."}
            ], [
                {"speaker": "남", "ko": "이 이어폰은 소리도 깨끗한 데다가 배터리도 오래 가네요.", "vi": "Chiếc tai nghe này không những âm thanh trong trẻo mà pin còn lâu nữa."},
                {"speaker": "수진", "ko": "맞아요. 후기를 꼼꼼히 비교하고 사서 정말 만족스러워요.", "vi": "Đúng vậy. Mình so sánh kỹ đánh giá rồi mới mua nên ưng ý lắm."}
            ], "Cặp cấu trúc '-(으)ㄴ/는 데다가' và '-는 바람에' là 2 mẫu câu kinh điển nhất của đề TOPIK II Cấp 3 (Câu 1–4).", [
                {"q": "[Sách bài tập Q3-B02] Chọn vế sau phù hợp với '늦잠을 자는 바람에 (               )':", "opts": ["기차를 놓치고 말았어요.", "일찍 도착할 수 있었어요.", "내일 일찍 일어나세요.", "아침을 여유 있게 먹었어요."], "ans": 0, "exp": "'-는 바람에' luôn dẫn tới kết quả không mong muốn ở quá khứ, không đi với mệnh lệnh."}
            ]),
            (3, "Tường thuật gián tiếp & Giao tiếp công sở", "간접화법과 직장 소통", [
                ("Phần 1 · Truyền đạt lời nói & Thông báo", [
                    ("전달하다", "truyền đạt, chuyển lời", "jeon-dal-ha-da", "팀장님의 지시 사항을 동료들에게 전달했다.", "Tôi đã truyền đạt nội dung chỉ đạo của trưởng nhóm tới đồng nghiệp.", ""),
                    ("공지 사항", "thông báo chung", "gong-ji sa-hang", "사내 게시판의 공지 사항을 확인하시기 바랍니다.", "Xin vui lòng kiểm tra mục thông báo trên bảng tin nội bộ.", "Hay gặp Câu 51 TOPIK II."),
                    ("일정이 변경되다", "lịch trình bị thay đổi", "il-jeong-i byeon-gyeong-doe-da", "세미나 일정이 다음 주 수요일로 변경되었다.", "Lịch hội thảo đã được dời sang thứ Tư tuần sau.", ""),
                    ("참석 여부를 알리다", "báo có tham dự hay không", "cham-seok yeo-bu-reul al-li-da", "금요일까지 행사 참석 여부를 알려 주십시오.", "Xin vui lòng báo việc tham dự sự kiện trước thứ Sáu.", "Cụm từ vàng cho Câu 51!"),
                    ("문의하다", "hỏi thông tin, liên hệ hỏi", "mun-ui-ha-da", "자세한 사항은 담당자에게 문의하시기 바랍니다.", "Chi tiết xin vui lòng liên hệ người phụ trách.", ""),
                    ("양해를 구하다", "mong thông cảm", "yang-hae-reul gu-ha-da", "공사 소음에 대해 주민들에게 양해를 구했다.", "Xin cư dân thông cảm về tiếng ồn thi công.", "")
                ]),
                ("Phần 2 · Họp hành & Báo cáo", [
                    ("회의록을 작성하다", "lập biên bản cuộc họp", "hoe-ui-rog-eul jak-seong-ha-da", "회의가 끝난 후 핵심 내용을 정리해 회의록을 작성했다.", "Sau cuộc họp tôi tổng hợp nội dung chính để lập biên bản.", ""),
                    ("의견을 제시하다", "đưa ra ý kiến", "ui-gyeon-eul je-si-ha-da", "신제품 홍보 방안에 대해 새로운 의견을 제시했다.", "Tôi đã đưa ra ý kiến mới về phương án quảng bá sản phẩm.", ""),
                    ("검토하다", "xem xét, rà soát", "geom-to-ha-da", "계약서 내용을 다시 한번 신중하게 검토했다.", "Xem xét lại một lần nữa nội dung hợp đồng một cách thận trọng.", ""),
                    ("승인을 받다", "nhận phê duyệt", "seung-in-eul bat-da", "예산안에 대해 부장님의 최종 승인을 받았다.", "Đã nhận phê duyệt cuối cùng của trưởng phòng cho bản dự toán.", "")
                ])
            ], [
                {"pattern": "-다고/냐고/라고/자고 하다", "meaning": "Tường thuật gián tiếp (nói rằng / hỏi rằng / bảo hãy / rủ hãy)", "construction": "Trần thuật -다고, Nghi vấn -냐고, Mệnh lệnh -(으)라고, Rủ rê -자고", "usage": "Truyền đạt lại lời nói của người khác.", "example1Ko": "과장님께서 오후 세 시까지 보고서를 내라고 하셨어요.", "example1Vi": "Trưởng phòng bảo hãy nộp báo cáo trước 3 giờ chiều."},
                {"pattern": "-(으)시기 바랍니다", "meaning": "Xin quý vị vui lòng...", "construction": "Động từ + -(으)시기 바랍니다", "usage": "Cấu trúc trang trọng trong thông báo, email công sở (Câu 51 TOPIK II).", "example1Ko": "변경된 장소를 꼭 확인하시기 바랍니다.", "example1Vi": "Xin quý vị vui lòng kiểm tra kỹ địa điểm đã thay đổi."}
            ], [
                {"speaker": "대리", "ko": "흐엉 씨, 방금 김 과장님께서 회의 시간이 네 시로 바뀌었다고 전해 달라고 하셨어요.", "vi": "Hương ơi, trưởng phòng Kim vừa nhắn chuyển lời rằng giờ họp đã đổi sang 4 giờ chiều nhé."},
                {"speaker": "흐엉", "ko": "네, 알겠습니다. 지금 바로 팀원들에게 공지 메일을 보내겠습니다.", "vi": "Vâng, em rõ rồi ạ. Em sẽ gửi email thông báo tới các thành viên ngay bây giờ."}
            ], "Nắm chắc bộ 4 đuôi tường thuật gián tiếp và mẫu câu công sở '-(으)시기 바랍니다' giúp bạn ăn trọn điểm Câu 51 phần Viết TOPIK II.", [
                {"q": "[Sách bài tập Q3-B03] Chuyển câu trực tiếp sau sang gián tiếp: 민수: '내일 같이 도서관에 갑시다.'", "opts": ["민수 씨가 내일 같이 도서관에 가자고 했어요.", "민수 씨가 내일 같이 도서관에 가라고 했어요.", "민수 씨가 내일 같이 도서관에 간다고 했어요.", "민수 씨가 내일 같이 도서관에 가냐고 했어요."], "ans": 0, "exp": "Câu rủ rê (-ㅂ시다) khi chuyển sang gián tiếp dùng 'V-자고 하다'."}
            ]),
            (4, "Sức khỏe, Thể chất & Thói quen sống", "건강과 생활 습관", [
                ("Phần 1 · Chăm sóc sức khỏe chủ động", [
                    ("면역력을 높이다", "tăng cường sức đề kháng", "myeon-yeong-nyeog-eul no-pi-da", "비타민이 풍부한 과일은 면역력을 높여 준다.", "Trái cây giàu vitamin giúp nâng cao sức đề kháng.", ""),
                    ("규칙적인 생활", "sinh hoạt điều độ", "gyu-chik-jeog-in saeng-hwal", "규칙적인 생활과 충분한 수면이 보약이다.", "Sinh hoạt điều độ và ngủ đủ giấc chính là thuốc bổ.", ""),
                    ("스트레스를 해소하다", "giải tỏa căng thẳng", "seu-teu-re-seu-reul hae-so-ha-da", "주말에 등산을 하며 스트레스를 해소한다.", "Cuối tuần đi leo núi giải tỏa căng thẳng.", "Đồng nghĩa: 스트레스를 풀다."),
                    ("영양소를 섭취하다", "hấp thụ chất dinh dưỡng", "yeong-yang-so-reul seop-chwi-ha-da", "다양한 식품을 통해 영양소를 골고루 섭취해야 한다.", "Cần hấp thụ cân bằng dưỡng chất qua đa dạng thực phẩm.", ""),
                    ("과로하다", "làm việc quá sức", "gwa-ro-ha-da", "며칠 동안 과로했더니 몸살이 났다.", "Làm việc quá sức mấy hôm nên bị ốm mỏi mình mẩy.", ""),
                    ("정기 검진", "khám sức khỏe định kỳ", "jeong-gi geom-jin", "질병을 예방하기 위해 매년 정기 검진을 받는다.", "Khám sức khỏe định kỳ hằng năm để phòng ngừa bệnh tật.", "")
                ]),
                ("Phần 2 · Triệu chứng & Khuyến nghị y khoa", [
                    ("예방하다", "phòng ngừa", "ye-bang-ha-da", "손을 자주 씻으면 감기를 예방할 수 있다.", "Rửa tay thường xuyên có thể phòng ngừa cảm cúm.", ""),
                    ("증상이 나타나다", "xuất hiện triệu chứng", "jeung-sang-i na-ta-na-da", "열이 나고 기침 증상이 나타나면 병원에 가야 한다.", "Nếu xuất hiện triệu chứng sốt và ho thì phải tới viện.", ""),
                    ("회복하다", "hồi phục", "hoe-bok-ha-da", "수술 후 건강을 빠르게 회복하고 있다.", "Sau ca phẫu thuật sức khỏe đang hồi phục nhanh chóng.", ""),
                    ("자세를 교정하다", "chỉnh tư thế", "ja-se-reul gyo-jeong-ha-da", "스마트폰을 볼 때 바른 자세로 교정해야 한다.", "Cần chỉnh lại tư thế đúng khi sử dụng điện thoại.", "")
                ])
            ], [
                {"pattern": "-(으)려면", "meaning": "Nếu muốn / Để làm gì thì...", "construction": "Động từ + -(으)려면 (= -(으)려고 하면)", "usage": "Nêu mục đích ở vế trước và điều kiện cần làm ở vế sau.", "example1Ko": "건강을 유지하려면 매일 삼십 분씩 걸어야 해요.", "example1Vi": "Nếu muốn duy trì sức khỏe thì mỗi ngày phải đi bộ 30 phút."},
                {"pattern": "-더니", "meaning": "Trước đây thấy... thế mà nay...", "construction": "Động từ/Tính từ + -더니", "usage": "Hồi tưởng điều người nói trực tiếp chứng kiến dẫn tới kết quả/thay đổi.", "example1Ko": "오전에는 하늘이 맑더니 오후부터 비가 내린다.", "example1Vi": "Buổi sáng trời quang đãng thế mà từ chiều lại đổ mưa."}
            ], [
                {"speaker": "의사", "ko": "최근에 잠을 잘 못 주무신다고요? 카페인 음료를 줄이셔야 합니다.", "vi": "Gần đây anh/chị bị khó ngủ phải không? Cần giảm bớt đồ uống chứa caffeine nhé."},
                {"speaker": "환자", "ko": "네, 숙면을 취하려면 저녁에는 따뜻한 차를 마시는 게 좋겠지요?", "vi": "Vâng, muốn ngủ sâu giấc thì buổi tối uống trà ấm sẽ tốt hơn bác sĩ nhỉ?"}
            ], "Chủ đề Sức khỏe & Dinh dưỡng xuất hiện trong gần như mọi đề Đọc Câu 13–20 và Câu 52 của TOPIK II.", [
                {"q": "[Sách bài tập Q3-B04] Điền vào chỗ trống: '목표를 달성하(       ) 구체적인 계획부터 세우세요.'", "opts": ["려면", "느라고", "는 바람에", "자마자"], "ans": 0, "exp": "'달성하려면' (Nếu muốn đạt được mục tiêu thì...) đi rất hợp với câu khuyên ở vế sau."}
            ])
        ]
    },
    {
        "bookId": "q4",
        "bookNum": 4,
        "title": "Tiếng Hàn Tổng Hợp · Quyển 4 (Trung cấp 2)",
        "shortTitle": "Quyển 4 · Trung cấp 2",
        "levelBadge": "TOPIK II · Cấp 4",
        "subtitle": "Chuyên sâu Đọc hiểu Trung cấp, Quán dụng ngữ & Viết Câu 51–53 (Biểu đồ)",
        "scale": {"examLevel": "topik2", "maxScore": 300, "passScore": 150, "excellentScore": 180, "gradeName": "TOPIK II · Cấp 4"},
        "chapters": [
            (1, "Văn hóa Doanh nghiệp & Phỏng vấn", "직장 문화와 면접", [
                ("Phần 1 · Tuyển dụng & Năng lực ứng viên", [
                    ("지원서를 내다", "nộp hồ sơ ứng tuyển", "ji-won-seo-reul nae-da", "관심 있던 무역 회사에 입사 지원서를 냈다.", "Tôi đã nộp đơn ứng tuyển vào công ty thương mại mình quan tâm.", ""),
                    ("자기소개서", "bản giới thiệu bản thân", "ja-gi-so-gae-seo", "경험을 중심으로 자기소개서를 구체적으로 작성했다.", "Viết bản tự giới thiệu cụ thể xoay quanh các trải nghiệm thực tế.", ""),
                    ("면접을 보다", "tham dự phỏng vấn", "myeon-jeob-eul bo-da", "긴장하지 않고 당당한 태도로 면접을 봤다.", "Không căng thẳng, tôi đã trả lời phỏng vấn với thái độ tự tin.", ""),
                    ("자격증을 따다", "lấy chứng chỉ chuyên môn", "ja-gyeok-jeung-eul tta-da", "취업 준비를 위해 컴퓨터 자격증을 땄다.", "Tôi đã thi lấy chứng chỉ tin học để chuẩn bị xin việc.", ""),
                    ("우대하다", "ưu tiên (tuyển dụng)", "u-dae-ha-da", "외국어 능통자를 특별히 우대합니다.", "Ưu tiên đặc biệt ứng viên thông thạo ngoại ngữ.", "Hay gặp trong thông báo tuyển dụng TOPIK II!"),
                    ("채용하다", "tuyển dụng", "chae-yong-ha-da", "올해 하반기에 신입 사원을 대거 채용할 예정이다.", "Dự kiến tuyển dụng số lượng lớn nhân viên mới vào nửa cuối năm nay.", "")
                ]),
                ("Phần 2 · Môi trường làm việc & Phúc lợi", [
                    ("근무 환경", "môi trường làm việc", "geun-mu hwan-gyeong", "쾌적한 근무 환경은 업무 효율을 높여 준다.", "Môi trường làm việc dễ chịu giúp nâng cao hiệu suất công việc.", ""),
                    ("연봉 / 급여", "mức lương năm / tiền lương", "yeon-bong / geub-yeo", "구직자들은 연봉뿐만 아니라 복지도 중요하게 본다.", "Người tìm việc coi trọng không chỉ mức lương mà cả chế độ phúc lợi.", ""),
                    ("재택근무", "làm việc tại nhà", "jae-taek-geun-mu", "일주일에 이틀은 재택근무를 실시하고 있다.", "Áp dụng làm việc từ xa tại nhà 2 ngày mỗi tuần.", ""),
                    ("업무 효율", "hiệu suất công việc", "eom-무 hyo-yul", "충분한 휴식을 취해야 업무 효율이 오른다.", "Phải nghỉ ngơi đầy đủ thì hiệu suất làm việc mới tăng.", "")
                ])
            ], [
                {"pattern": "-(으)ㄹ 뿐만 아니라", "meaning": "Không những... mà còn...", "construction": "Động từ/Tính từ + -(으)ㄹ 뿐만 아니라, Danh từ + 뿐만 아니라", "usage": "Nhấn mạnh cả hai mặt ưu điểm hoặc đặc tính trong văn viết chuẩn TOPIK II.", "example1Ko": "그 지원자는 한국어를 잘할 뿐만 아니라 실무 경험도 풍부하다.", "example1Vi": "Ứng viên đó không chỉ giỏi tiếng Hàn mà còn giàu kinh nghiệm thực tế."},
                {"pattern": "-(으)므로", "meaning": "Bởi vì... cho nên... (trang trọng)", "construction": "Động từ/Tính từ + -(으)므로", "usage": "Nêu căn cứ/nguyên nhân trong văn viết, thông báo và bài viết Câu 52–54.", "example1Ko": "마감일 이후에는 접수가 불가능하므로 기한을 엄수해 주십시오.", "example1Vi": "Vì sau ngày hạn chót không thể tiếp nhận hồ sơ nên xin tuân thủ đúng thời hạn."}
            ], [
                {"speaker": "면접관", "ko": "우리 회사에 지원하게 된 동기가 무엇입니까?", "vi": "Động lực khiến bạn ứng tuyển vào công ty chúng tôi là gì?"},
                {"speaker": "지원자", "ko": "한국과 베트남의 교류가 활발해짐에 따라 양국을 잇는 전문가로 성장하고 싶기 때문입니다.", "vi": "Bởi vì theo đà giao lưu Việt – Hàn ngày càng sôi nổi, tôi muốn phát triển thành chuyên gia kết nối hai nước ạ."}
            ], "Trong bài Đọc Quảng cáo / Thông báo tuyển dụng của TOPIK II, các từ '지원 자격', '우대 사항', '마감일' luôn là chìa khóa tìm đáp án đúng.", [
                {"q": "[Sách bài tập Q4-B01] Chọn câu viết chuẩn trang trọng dùng trong bài luận TOPIK II:", "opts": ["독서는 지식을 넓혀 줄 뿐만 아니라 상상력도 키워 준다.", "독서는 지식을 넓혀 줄 뿐만 아니라 상상력을 키워 주자.", "독서는 지식을 넓혀 주느라고 상상력도 키워 준다.", "독서는 지식을 넓혀 주는 바람에 상상력도 키워 준다."], "ans": 0, "exp": "'-(으)ㄹ 뿐만 아니라' nối hai lợi ích song song rất chuẩn văn phong viết."}
            ]),
            (2, "Phân tích Biểu đồ & Xu hướng Xã hội (Câu 53)", "도표 분석과 사회 변화", [
                ("Phần 1 · Từ vựng Tăng – Giảm – Tỷ lệ (Câu 53)", [
                    ("증가하다 / 급증하다", "tăng lên / tăng vọt", "jeung-ga-ha-da / geup-jeung-ha-da", "일인 가구 비율이 오 년 사이에 급증했다.", "Tỷ lệ hộ độc thân đã tăng vọt trong vòng 5 năm.", "Đối nghĩa: 감소하다 / 급감하다."),
                    ("차지하다", "chiếm (tỷ trọng %)", "cha-ji-ha-da", "이십 대 응답자가 전체의 사십 퍼센트를 차지했다.", "Người trả lời ở độ tuổi 20 chiếm 40% tổng số.", "Từ bắt buộc cho Câu 53!"),
                    ("나타나다", "cho thấy, thể hiện (kết quả khảo sát)", "na-ta-na-da", "조사 결과 건강에 대한 관심이 가장 높은 것으로 나타났다.", "Kết quả khảo sát cho thấy mối quan tâm về sức khỏe là cao nhất.", ""),
                    ("그치다", "chỉ dừng ở mức...", "geu-chi-da", "반면 오십 대 이상은 십 퍼센트에 그쳤다.", "Ngược lại nhóm trên 50 tuổi chỉ dừng ở mức 10%.", ""),
                    ("추세를 보이다", "cho thấy xu hướng", "chu-se-reul bo-i-da", "온라인 쇼핑 매출액이 꾸준한 증가 추세를 보이고 있다.", "Doanh số mua sắm trực tuyến đang cho thấy xu hướng tăng đều đặn.", ""),
                    ("전망이다", "dự báo sẽ...", "jeon-mang-i-da", "앞으로도 친환경 시장 규모는 더욱 확대될 전망이다.", "Quy mô thị trường xanh dự báo sẽ còn mở rộng hơn nữa trong tương lai.", "")
                ]),
                ("Phần 2 · Nguyên nhân & Biến đổi nhân khẩu", [
                    ("원인으로 꼽히다", "được chỉ ra là nguyên nhân chính", "won-in-eu-ro kko-pi-da", "가치관의 변화가 주요 원인으로 꼽힌다.", "Sự thay đổi quan niệm sống được xem là nguyên nhân chính.", ""),
                    ("영향을 미치다", "gây ảnh hưởng tới", "yeong-hyang-eul mi-chi-da", "기후 변화가 농작물 생산량에 큰 영향을 미쳤다.", "Biến đổi khí hậu đã tác động lớn tới sản lượng nông sản.", "Đồng nghĩa: 영향을 주다."),
                    ("비중이 높다", "tỷ trọng cao", "bi-jung-i nop-da", "여가 활동 중 동영상 시청의 비중이 가장 높았다.", "Trong các hoạt động giải trí, xem video chiếm tỷ trọng cao nhất.", ""),
                    ("대비", "so với (năm/mốc trước)", "dae-bi", "전년 대비 수출액이 십오 퍼센트 상승했다.", "Kim ngạch xuất khẩu tăng 15% so với năm trước.", "")
                ])
            ], [
                {"pattern": "-에 의하면 / -에 따르면", "meaning": "Theo (kết quả khảo sát / cơ quan)...", "construction": "Danh từ + -에 의하면 / -에 따르면", "usage": "Câu mở đầu chuẩn mực cho bài viết phân tích biểu đồ Câu 53 (30 điểm).", "example1Ko": "통계청 조사에 따르면 반려동물을 키우는 가구가 매년 증가하고 있다.", "example1Vi": "Theo khảo sát của Tổng cục Thống kê, số hộ nuôi thú cưng đang tăng lên mỗi năm."},
                {"pattern": "-(으)ㄴ/는 반면에", "meaning": "Trái lại / Ngược lại...", "construction": "Động từ/Tính từ + -(으)ㄴ/는 반면에", "usage": "Đối chiếu hai số liệu hoặc hai xu hướng trái ngược trên biểu đồ.", "example1Ko": "종이책 독서율은 감소한 반면에 전자책 이용률은 크게 늘었다.", "example1Vi": "Tỷ lệ đọc sách giấy giảm, ngược lại tỷ lệ dùng sách điện tử tăng mạnh."}
            ], [
                {"speaker": "강사", "ko": "쓰기 53번 그래프 문제에서는 조사 기관, 변화 추이, 원인, 전망 네 가지를 순서대로 쓰면 만점을 받습니다.", "vi": "Ở câu 53 phân tích biểu đồ, chỉ cần viết đủ 4 ý theo thứ tự: Cơ quan khảo sát – Xu hướng số liệu – Nguyên nhân – Dự báo là đạt điểm tối đa."},
                {"speaker": "학생", "ko": "'차지하다', '급증하다', '전망이다' 같은 핵심 표현을 꼭 외워 두겠습니다!", "vi": "Em nhất định sẽ học thuộc các cụm từ cốt lõi như 차지하다, 급증하다, 전망이다 ạ!"}
            ], "Câu 53 TOPIK II chiếm tới 30/100 điểm phần Viết nhưng có khung mẫu cố định dễ ăn điểm nhất trong cả đề thi.", [
                {"q": "[Sách bài tập Q4-B02] Chọn từ điền chuẩn nhất vào bài viết Câu 53: '2030년에는 시장 규모가 10조 원에 이를 (          ).'", "opts": ["전망이다", "바람이다", "탓이다", "셈이다"], "ans": 0, "exp": "Khi nêu dự báo năm tương lai ở cuối bài Câu 53, dùng '-(으)ㄹ 전망이다'."}
            ]),
            (3, "Môi trường, Tái chế & Phát triển bền vững", "환경 보호와 지속 가능성", [
                ("Phần 1 · Ô nhiễm & Khí hậu", [
                    ("일회용품을 줄이다", "giảm đồ dùng một lần", "il-hoe-yong-pum-eul ju-ri-da", "카페에서 플라스틱 컵 대신 텀블러를 써서 일회용품을 줄인다.", "Dùng bình cá nhân thay cốc nhựa ở quán cà phê để giảm đồ dùng 1 lần.", ""),
                    ("온실가스 배출", "phát thải khí nhà kính", "on-sil-ga-seu bae-chul", "온실가스 배출을 줄이기 위한 국제 협력이 시급하다.", "Hợp tác quốc tế nhằm giảm phát thải khí nhà kính đang rất cấp thiết.", ""),
                    ("미세먼지", "bụi mịn", "mi-se-meon-ji", "봄철에는 미세먼지 농도가 높아 마스크를 착용한다.", "Vào mùa xuân nồng độ bụi mịn cao nên mọi người đeo khẩu trang.", ""),
                    ("생태계 파괴", "phá hủy hệ sinh thái", "saeng-tae-gye pa-goe", "무분별한 개발로 인해 생태계 파괴가 심각해졌다.", "Phát triển bừa bãi khiến sự tàn phá hệ sinh thái trở nên nghiêm trọng.", ""),
                    ("자원을 재활용하다", "tái chế tài nguyên", "ja-won-eul jae-hwal-yong-ha-da", "버려지는 폐품을 모아 자원을 재활용한다.", "Thu gom phế liệu bỏ đi để tái chế tài nguyên.", "")
                ]),
                ("Phần 2 · Giải pháp Xanh & Ý thức cộng đồng", [
                    ("친환경 제품", "sản phẩm thân thiện môi trường", "chin-hwan-gyeong je-pum", "소비자들이 친환경 제품을 적극적으로 구매하고 있다.", "Người tiêu dùng đang tích cực mua các sản phẩm thân thiện môi trường.", ""),
                    ("캠페인을 벌이다", "phát động chiến dịch", "kaem-pe-in-eul beo-ri-da", "시민 단체가 에너지 절약 캠페인을 벌였다.", "Tổ chức dân sự đã phát động chiến dịch tiết kiệm năng lượng.", ""),
                    ("실천하다", "thực hành, hành động thực tế", "sil-cheon-ha-da", "작은 습관부터 일상에서 꾸준히 실천하는 자세가 필요하다.", "Cần thái độ kiên trì thực hành từ những thói quen nhỏ trong đời sống.", ""),
                    ("경각심을 가지다", "có ý thức cảnh giác", "gyeong-gak-sim-eul ga-ji-da", "환경 오염의 심각성에 대해 경각심을 가져야 한다.", "Phải có sự cảnh tỉnh trước mức độ nghiêm trọng của ô nhiễm môi trường.", "")
                ])
            ], [
                {"pattern": "-(으)로 인해(서)", "meaning": "Do / Bởi vì (nguyên nhân lớn)", "construction": "Danh từ + -(으)로 인해(서)", "usage": "Diễn tả nguyên nhân mang tính xã hội, tự nhiên trong bài báo và đề Đọc.", "example1Ko": "이상 기후로 인해 세계 곳곳에서 가뭄과 홍수가 발생하고 있다.", "example1Vi": "Do khí hậu bất thường nên hạn hán và lũ lụt đang xảy ra khắp nơi trên thế giới."}
            ], [
                {"speaker": "기자", "ko": "최근 가치 소비가 확산되면서 친환경 포장재를 사용하는 기업이 늘고 있습니다.", "vi": "Gần đây khi tiêu dùng có trách nhiệm lan rộng, số doanh nghiệp dùng bao bì thân thiện môi trường đang tăng lên."},
                {"speaker": "전문가", "ko": "기업의 노력뿐만 아니라 소비자들의 자발적인 실천도 뒷받침되어야 합니다.", "vi": "Không chỉ nỗ lực của doanh nghiệp mà hành động tự giác của người tiêu dùng cũng cần song hành."}
            ], "Chủ đề Môi trường & Đồ dùng 1 lần là một trong 3 chủ đề xuất hiện nhiều nhất ở cả Đọc hiểu và Câu 54 TOPIK II.", [
                {"q": "[Sách bài tập Q4-B03] Cụm từ nào đi hợp nhất với '캠페인을 (          )'?", "opts": ["벌이다", "차지하다", "그치다", "닮다"], "ans": 0, "exp": "Collocation chuẩn: '캠페인을 벌이다' (tổ chức/phát động chiến dịch)."}
            ]),
            (4, "Quán dụng ngữ & Tục ngữ Trọng tâm TOPIK II", "관용어와 속담", [
                ("Phần 1 · Quán dụng ngữ cơ thể người (Câu 1–4 & Đọc)", [
                    ("발이 넓다", "quen biết rộng, giao thiệp rộng", "bal-i neol-da", "민수 씨는 발이 넓어서 모르는 사람이 없다.", "Anh Minsu quen biết rộng nên chẳng ai là không biết.", ""),
                    ("손이 크다", "hào phóng, chuẩn bị đồ ăn/quà nhiều", "son-i keu-da", "어머니는 손이 크셔서 명절 음식을 늘 넉넉히 만드신다.", "Mẹ rộng tay nên dịp lễ lúc nào cũng làm dư dả đồ ăn.", ""),
                    ("눈이 높다", "tiêu chuẩn cao, kén chọn", "nun-i nop-da", "친구는 눈이 높아서 마음에 드는 옷을 쉽게 못 고른다.", "Bạn tôi mắt thẩm mỹ cao nên khó chọn được áo ưng ý ngay.", ""),
                    ("입이 무겁다", "kín miệng, giữ bí mật giỏi", "ib-i mu-geop-da", "그 동료는 입이 무거워서 비밀을 믿고 말할 수 있다.", "Đồng nghiệp đó rất kín tiếng nên có thể tin tưởng tâm sự bí mật.", "Đối nghĩa: 입이 가볍다."),
                    ("귀가 얇다", "nhẹ dạ cả tin", "gwi-ga yal-da", "귀가 얇아서 남의 말을 쉽게 믿고 물건을 산다.", "Vì nhẹ dạ nên dễ tin lời người khác rồi mua hàng.", ""),
                    ("마음을 먹다", "quyết tâm", "ma-eum-eul meok-da", "이번에는 꼭 시험에 합격하겠다고 단단히 마음을 먹었다.", "Lần này tôi đã quyết tâm sắt đá nhất định sẽ thi đỗ.", "")
                ]),
                ("Phần 2 · Quán dụng ngữ hành động & Tục ngữ", [
                    ("한눈을 팔다", "mất tập trung, xao nhãng", "han-nun-eul pal-da", "운전할 때 한눈을 팔면 큰 사고가 날 수 있다.", "Khi lái xe nếu lơ đãng nhìn sang chỗ khác có thể gây tai nạn lớn.", ""),
                    ("어깨가 무겁다", "trách nhiệm nặng nề", "eo-kkae-ga mu-geop-da", "새 프로젝트의 팀장을 맡게 되어 어깨가 무겁다.", "Đảm nhận vai trò trưởng nhóm dự án mới nên trách nhiệm rất nặng nề.", ""),
                    ("손을 잡다", "bắt tay hợp tác", "son-eul jap-da", "두 기업이 신기술 개발을 위해 손을 잡았다.", "Hai doanh nghiệp đã bắt tay hợp tác phát triển công nghệ mới.", "Hay gặp trên tiêu đề báo Câu 25–27!"),
                    ("발 벗고 나서다", "xắn tay áo tích cực vào cuộc", "bal beot-고 na-seo-da", "어려운 이웃을 돕기 위해 시민들이 발 벗고 나섰다.", "Người dân tích cực xắn tay vào cuộc giúp đỡ hàng xóm khó khăn.", "")
                ])
            ], [
                {"pattern": "-기 마련이다", "meaning": "Đương nhiên / Tất yếu sẽ...", "construction": "Động từ/Tính từ + -기 마련이다", "usage": "Diễn tả quy luật tự nhiên hiển nhiên ai cũng công nhận.", "example1Ko": "노력한 만큼 좋은 결과가 따라오기 마련이다.", "example1Vi": "Nỗ lực bao nhiêu thì kết quả tốt tất yếu sẽ theo sau bấy nhiêu."}
            ], [
                {"speaker": "수진", "ko": "이번 행사 준비를 맡게 돼서 어깨가 좀 무거워요.", "vi": "Đảm nhận khâu chuẩn bị sự kiện lần này nên mình thấy trách nhiệm hơi nặng nề."},
                {"speaker": "남", "ko": "수진 씨는 발도 넓고 일도 꼼꼼하니까 분명히 잘 해낼 거예요!", "vi": "Sujin vừa quen biết rộng vừa làm việc tỉ mỉ nên chắc chắn sẽ làm tốt thôi!"}
            ], "Quán dụng ngữ (관용어) luôn chiếm từ 2–3 câu trực tiếp trong phần Nghe, tiêu đề báo Câu 25–27 và truyện đọc Câu 19–22 của TOPIK II.", [
                {"q": "[Sách bài tập Q4-B04] Chọn quán dụng ngữ mang nghĩa 'tích cực chủ động đứng ra giải quyết':", "opts": ["발 벗고 나서다", "한눈을 팔다", "귀가 얇다", "손을 떼다"], "ans": 0, "exp": "'발 벗고 나서다' = xắn tay tích cực vào cuộc; '손을 떼다' = rút tay ngừng làm."}
            ])
        ]
    },
    {
        "bookId": "q5",
        "bookNum": 5,
        "title": "Tiếng Hàn Tổng Hợp · Quyển 5 (Cao cấp 1)",
        "shortTitle": "Quyển 5 · Cao cấp 1",
        "levelBadge": "TOPIK II · Cấp 5",
        "subtitle": "Đọc hiểu Báo chí – Kinh tế – Xã hội (Câu 25–40) & Nghị luận Câu 54",
        "scale": {"examLevel": "topik2", "maxScore": 300, "passScore": 190, "excellentScore": 215, "gradeName": "TOPIK II · Cấp 5"},
        "chapters": [
            (1, "Báo chí, Tiêu đề Tin tức & Dư luận (Câu 25–27)", "언론과 신문 기사 독해", [
                ("Phần 1 · Động từ đặc trưng trên tiêu đề báo", [
                    ("도입하다", "áp dụng, đưa vào sử dụng", "do-ip-ha-da", "정부가 새로운 대중교통 할인 제도를 도입했다.", "Chính phủ đã đưa vào áp dụng chế độ giảm giá giao thông công cộng mới.", ""),
                    ("촉구하다", "thúc giục, kêu gọi mạnh mẽ", "chok-gu-ha-da", "환경 단체들이 대책 마련을 강력히 촉구했다.", "Các tổ chức môi trường kêu gọi mạnh mẽ việc xây dựng đối sách.", ""),
                    ("우려의 목소리", "tiếng nói lo ngại", "u-ryeo-ui mok-so-ri", "물가 상승에 대한 우려의 목소리가 커지고 있다.", "Tiếng nói lo ngại về đà tăng vật giá ngày càng lớn.", ""),
                    ("급물살을 타다", "đẩy nhanh tiến độ thuận lợi", "geum-mul-sal-eul ta-da", "양국의 경제 협력 협상이 급물살을 타고 있다.", "Đàm phán hợp tác kinh tế giữa hai nước đang tiến triển nhanh chóng.", "Tiêu đề báo Câu 25–27!"),
                    ("제동이 걸리다", "bị phanh lại, gặp trở ngại", "je-dong-i geol-li-da", "예산 부족으로 사업 추진에 제동이 걸렸다.", "Do thiếu ngân sách nên việc xúc tiến dự án gặp trở ngại.", ""),
                    ("각광을 받다", "nhận được sự chú ý/ưa chuộng lớn", "gak-gwang-eul bat-da", "태양광 등 재생 에너지가 미래 산업으로 각광을 받고 있다.", "Năng lượng tái tạo như điện mặt trời đang được ưa chuộng như ngành công nghiệp tương lai.", "")
                ]),
                ("Phần 2 · Khái niệm Truyền thông & Phê bình", [
                    ("여론이 형성되다", "hình thành dư luận", "yeo-ron-i hyeong-seong-doe-da", "소셜 미디어를 통해 빠르게 여론이 형성된다.", "Dư luận hình thành nhanh chóng thông qua mạng xã hội.", ""),
                    ("신뢰성", "độ tin cậy", "sil-loe-seong", "정보의 출처와 신뢰성을 반드시 검증해야 한다.", "Nhất định phải kiểm chứng nguồn gốc và độ tin cậy của thông tin.", ""),
                    ("편향되다", "bị thiên lệch, phiến diện", "pyeon-hyang-doe-da", "알고리즘은 자칫 편향된 시각을 강화할 우려가 있다.", "Thuật toán có nguy cơ củng cố góc nhìn phiến diện.", ""),
                    ("비판적 사고", "tư duy phản biện", "bi-pan-jeok sa-go", "가짜 뉴스를 구별하려면 비판적 사고 능력이 필수적이다.", "Để phân biệt tin giả, năng lực tư duy phản biện là thiết yếu.", "")
                ])
            ], [
                {"pattern": "-는 바이다", "meaning": "Khẳng định quan điểm trang trọng", "construction": "Động từ + -는 바이다", "usage": "Dùng trong diễn văn, xã luận báo chí hoặc kết bài nghị luận.", "example1Ko": "지속 가능한 발전을 위해 모두의 동참을 촉구하는 바이다.", "example1Vi": "Chúng tôi kêu gọi sự đồng hành của tất cả mọi người vì sự phát triển bền vững."}
            ], [
                {"speaker": "앵커", "ko": "신기술 도입을 둘러싸고 기대와 우려의 목소리가 동시에 나오고 있습니다.", "vi": "Xoay quanh việc áp dụng công nghệ mới, những tiếng nói kỳ vọng và lo ngại đang đồng thời xuất hiện."},
                {"speaker": "해설위원", "ko": "제도적 보완책이 마련되어야 사업이 다시 급물살을 탈 수 있을 것입니다.", "vi": "Phải xây dựng được giải pháp bổ완 về thể chế thì dự án mới có thể tăng tốc trở lại."}
            ], "Trong Câu 25–27 TOPIK II, nắm vững các ẩn dụ báo chí như '급물살을 타다' (thuận lợi tăng tốc) ↔ '제동이 걸리다 / 난항을 겪다' (gặp cản trở) giúp chọn đúng đáp án trong 10 giây.", [
                {"q": "[Sách bài tập Q5-B01] Tiêu đề báo '신사업 추진, 예산 부족으로 제동' có nghĩa gần nhất với câu nào?", "opts": ["예산이 부족해 새로운 사업을 진행하는 데 어려움을 겪고 있다.", "예산이 충분해 새로운 사업이 빠르게 진행되고 있다.", "새로운 사업 덕분에 예산 부족 문제가 해결되었다.", "예산을 절약하기 위해 새로운 사업을 성공적으로 마쳤다."], "ans": 0, "exp": "'제동(이 걸리다)' trên tiêu đề báo nghĩa là bị chững lại, gặp khó khăn cản trở."}
            ]),
            (2, "Kinh tế, Xã hội Già hóa & Khoa học AI", "경제·고령화·첨단 기술", [
                ("Phần 1 · Kinh tế & Biến đổi dân số", [
                    ("저출산·고령화", "tỷ lệ sinh thấp & già hóa dân số", "jeo-chul-san go-ryeong-hwa", "저출산·고령화 현상으로 생산 가능 인구가 줄어들고 있다.", "Hiện tượng sinh thấp và già hóa đang làm giảm dân số trong độ tuổi lao động.", ""),
                    ("경기가 침체되다", "kinh tế suy thoái/trầm lắng", "gyeong-gi-ga chim-che-doe-da", "소비가 위축되면서 내수 경기가 침체되었다.", "Tiêu dùng thu hẹp khiến kinh tế nội địa rơi vào trầm lắng.", "Đối nghĩa: 경기가 회복되다."),
                    ("수요와 공급", "cung và cầu", "su-yo-wa gong-geup", "시장 가격은 수요와 공급의 원리에 따라 결정된다.", "Giá cả thị trường được quyết định theo nguyên lý cung cầu.", ""),
                    ("격차를 줄이다", "thu hẹp khoảng cách/chênh lệch", "gyeok-cha-reul ju-ri-da", "지역 간 의료 서비스 격차를 줄여야 한다.", "Cần thu hẹp khoảng cách dịch vụ y tế giữa các vùng miền.", ""),
                    ("제도적 뒷받침", "sự hậu thuẫn về thể chế/chính sách", "je-do-jeok dwit-bat-chim", "개인의 의지뿐만 아니라 정부의 제도적 뒷받침이 요구된다.", "Đòi hỏi không chỉ ý chí cá nhân mà cả sự hỗ trợ thể chế từ chính phủ.", "Câu kết vàng cho Câu 54!")
                ]),
                ("Phần 2 · Trí tuệ nhân tạo & Đạo đức công nghệ", [
                    ("인공지능(AI)", "trí tuệ nhân tạo", "in-gong-ji-neung", "인공지능 기술이 의료와 교육 분야에 폭넓게 활용된다.", "Công nghệ AI được ứng dụng rộng rãi trong y tế và giáo dục.", ""),
                    ("생산성을 향상시키다", "nâng cao năng suất", "saeng-san-seong-eul hyang-sang-si-ki-da", "자동화 시스템이 공장의 생산성을 크게 향상시켰다.", "Hệ thống tự động hóa đã nâng cao mạnh mẽ năng suất nhà máy.", ""),
                    ("부작용을 최소화하다", "tối thiểu hóa tác dụng phụ/hệ lụy", "bu-jag-yong-eul choe-so-hwa-ha-da", "기술 발전의 이점을 살리되 부작용을 최소화해야 한다.", "Cần phát huy lợi thế công nghệ đồng thời giảm thiểu hệ lụy.", ""),
                    ("양날의 검", "con dao hai lưỡi", "yang-nal-ui geom", "과학 기술은 어떻게 쓰느냐에 따라 양날의 검이 될 수 있다.", "Khoa học kỹ thuật có thể trở thành con dao hai lưỡi tùy cách con người sử dụng.", "Cụm từ đắt giá mở bài Câu 54!")
                ])
            ], [
                {"pattern": "-(으)ㄴ/는 데 반해", "meaning": "Trong khi... thì trái lại...", "construction": "Động từ/Tính từ + -(으)ㄴ/는 데 반해", "usage": "So sánh đối lập hai luận điểm học thuật trong bài đọc Cấp 5 và bài luận Câu 54.", "example1Ko": "과거에는 물질적 풍요를 중시한 데 반해 현대인은 삶의 질을 중시한다.", "example1Vi": "Trong khi trước đây coi trọng sự sung túc vật chất thì người hiện đại coi trọng chất lượng sống."}
            ], [
                {"speaker": "사회자", "ko": "인공지능의 확산이 일자리에 미치는 영향을 어떻게 보십니까?", "vi": "Ông đánh giá thế nào về tác động của sự lan rộng AI đối với việc làm?"},
                {"speaker": "교수", "ko": "단순 반복 업무는 대체되는 데 반해 창의적 직무에 대한 수요는 오히려 늘어날 것입니다.", "vi": "Trong khi các công việc lặp lại đơn giản bị thay thế thì nhu cầu cho nhóm nghề sáng tạo ngược lại sẽ tăng lên."}
            ], "Trong bài nghị luận Câu 54 (50 điểm), sử dụng các cụm học thuật như '양날의 검', '부작용을 최소화하다', '제도적 뒷받침' giúp bài viết đạt chuẩn Cấp 5–6.", [
                {"q": "[Sách bài tập Q5-B02] Cụm nào phù hợp nhất để kết luận giải pháp từ phía Nhà nước trong Câu 54?", "opts": ["제도적 뒷받침이 마련되어야 한다.", "충동구매를 자제해야 한다.", "일회용품을 포장해야 한다.", "노약자석을 양보해야 한다."], "ans": 0, "exp": "'제도적 뒷받침' = sự hỗ trợ/bảo đảm về mặt chính sách, thể chế."}
            ]),
            (3, "Phương pháp Lập dàn ý Nghị luận 600–700 chữ (Câu 54)", "논설문 작성 전략", [
                ("Phần 1 · Khung dẫn dắt Mở – Thân – Kết", [
                    ("화두로 떠오르다", "nổi lên thành chủ đề nóng", "hwa-du-ro tteo-o-reu-da", "오늘날 환경 보호는 전 세계적인 화두로 떠오르고 있다.", "Ngày nay bảo vệ môi trường đang nổi lên là chủ đề nóng toàn cầu.", ""),
                    ("양면성을 지니다", "mang tính hai mặt", "yang-myeon-seong-eul ji-ni-da", "경쟁은 발전을 촉진하지만 갈등을 유발하는 양면성을 지닌다.", "Cạnh tranh mang tính hai mặt: vừa thúc đẩy phát triển vừa gây mâu thuẫn.", ""),
                    ("필수 불가결하다", "thiết yếu không thể thiếu", "pil-su bul-ga-gyeol-ha-da", "국제 사회에서 상호 존중은 필수 불가결한 요소이다.", "Trong cộng đồng quốc tế, tôn trọng lẫn nhau là yếu tố không thể thiếu.", ""),
                    ("바람직하다", "đáng mong đợi, đúng đắn", "ba-ram-jik-ha-da", "균형 잡힌 시각을 유지하는 태도가 바람직하다.", "Thái độ duy trì góc nhìn cân bằng là điều đúng đắn.", ""),
                    ("균형을 이루다", "đạt được sự cân bằng", "gyun-hyeong-eul i-ru-da", "경제 성장과 환경 보존이 조화롭게 균형을 이루어야 한다.", "Tăng trưởng kinh tế và bảo tồn môi trường phải đạt được sự cân bằng hài hòa.", "")
                ]),
                ("Phần 2 · Động từ lập luận học thuật", [
                    ("초래하다", "dẫn đến, gây ra (hệ quả xấu)", "cho-rae-ha-da", "무관심은 결국 심각한 사회 문제를 초래할 수 있다.", "Sự thờ ơ rốt cuộc có thể dẫn tới vấn đề xã hội nghiêm trọng.", ""),
                    ("기여하다 / 이바지하다", "đóng góp, cống hiến cho", "gi-yeo-ha-da / i-ba-ji-ha-da", "문화 교류는 국가 간 이해를 넓히는 데 크게 기여한다.", "Giao lưu văn hóa đóng góp lớn vào việc mở rộng sự thấu hiểu giữa các quốc gia.", ""),
                    ("모색하다", "tìm kiếm (phương án, giải pháp)", "mo-saek-ha-da", "문제를 근본적으로 해결할 방안을 다각도로 모색해야 한다.", "Cần tìm kiếm phương án giải quyết tận gốc vấn đề từ nhiều góc độ.", ""),
                    ("인식을 개선하다", "cải thiện nhận thức", "in-sig-eul gae-seon-ha-da", "법적 규제와 더불어 시민들의 인식을 개선하려는 노력이 필요하다.", "Cùng với chế tài pháp lý, cần nỗ lực cải thiện nhận thức của người dân.", "")
                ])
            ], [
                {"pattern": "-다시피", "meaning": "Như (mọi người đều biết/thấy)...", "construction": "알다/보다 + -다시피", "usage": "Dẫn dắt luận cứ thuyết phục.", "example1Ko": "주지하다시피 소통의 부재는 오해와 갈등을 초래한다.", "example1Vi": "Như chúng ta đều biết, sự thiếu hụt giao tiếp sẽ dẫn đến hiểu lầm và xung đột."}
            ], [
                {"speaker": "첨삭 강사", "ko": "54번 글쓰기에서는 구어체 '-아/어요'가 아니라 반드시 문어체 '-ㄴ/는다, -다' 평서형을 일관되게 사용해야 합니다.", "vi": "Trong bài viết Câu 54, tuyệt đối không dùng đuôi văn nói -아/어요 mà phải dùng nhất quán đuôi văn viết -ㄴ/는다, -다."},
                {"speaker": "수험생", "ko": "서론-본론1-본론2-결론 네 문단으로 나누고 문단 첫 칸을 비우는 원고지 규칙도 꼭 지키겠습니다.", "vi": "Em cũng sẽ chia rõ 4 đoạn Mở – Thân 1 – Thân 2 – Kết và lùi đầu dòng 1 ô đúng quy tắc giấy 원고지 ạ."}
            ], "Trên giấy kẻ ô 원고지, đầu mỗi đoạn văn lùi 1 ô trống; dấu chấm (.) và dấu phẩy (,) chiếm riêng 1 ô (trừ khi rơi vào ô cuối dòng thì viết chung vào ô chữ cuối).", [
                {"q": "[Sách bài tập Q5-B03] Động từ nào mang sắc thái tích cực ('đóng góp vào kết quả tốt') trái ngược với '초래하다'?", "opts": ["기여하다", "악화시키다", "방해하다", "위축시키다"], "ans": 0, "exp": "'기여하다 / 이바지하다' đi với kết quả tích cực, còn '초래하다' thường đi với hệ quả tiêu cực."}
            ])
        ]
    },
    {
        "bookId": "q6",
        "bookNum": 6,
        "title": "Tiếng Hàn Tổng Hợp · Quyển 6 (Cao cấp 2)",
        "shortTitle": "Quyển 6 · Cao cấp 2",
        "levelBadge": "TOPIK II · Cấp 6",
        "subtitle": "Hán–Hàn học thuật, Thành ngữ 4 chữ (사자성어) & Chinh phục 230+/300 điểm",
        "scale": {"examLevel": "topik2", "maxScore": 300, "passScore": 230, "excellentScore": 260, "gradeName": "TOPIK II · Cấp 6"},
        "chapters": [
            (1, "Thành ngữ 4 chữ (사자성어) hay ra thi nhất", "필수 사자성어", [
                ("Phần 1 · Thành ngữ về Nỗ lực & Thích ứng", [
                    ("일석이조 (一石二鳥)", "một mũi tên trúng hai đích", "il-seog-i-jo", "자전거로 출퇴근하면 건강도 챙기고 교통비도 아끼니 일석이조이다.", "Đi làm bằng xe đạp vừa khỏe vừa tiết kiệm tiền xe nên đúng là nhất cử lưỡng tiện.", ""),
                    ("유비무환 (有備無患)", "có chuẩn bị trước thì không lo hậu họa", "yu-bi-mu-hwan", "재난에 대비해 미리 점검하는 유비무환의 자세가 필요하다.", "Cần thái độ lo xa chuẩn bị trước để ứng phó thiên tai.", ""),
                    ("동문서답 (東問西답)", "hỏi đông đáp tây, trả lời lạc đề", "dong-mun-seo-dap", "질문의 의도를 파악하지 못해 동문서답을 하고 말았다.", "Không nắm được ý câu hỏi nên đã trả lời lạc đề.", ""),
                    ("역지사지 (易地思之)", "đặt mình vào vị trí người khác", "yeok-ji-sa-ji", "갈등을 해결하려면 상대방 입장에서 생각하는 역지사지의 태도가 중요하다.", "Để hóa giải bất đồng, thái độ đặt mình vào hoàn cảnh đối phương rất quan trọng.", ""),
                    ("금상첨화 (錦上添花)", "thêm hoa trên gấm (tốt càng thêm tốt)", "geum-sang-cheom-hwa", "음식 맛도 훌륭한데 분위기까지 좋으니 금상첨화이다.", "Món ăn đã ngon mà không gian lại đẹp nữa thì đúng là hoàn hảo gấp bội.", "")
                ]),
                ("Phần 2 · Thành ngữ về Biến cố & Thành công", [
                    ("전화위복 (轉禍爲福)", "chuyển họa thành phúc", "jeon-hwa-wi-bok", "실패를 거울삼아 더 큰 성공을 거두었으니 전화위복이 되었다.", "Lấy thất bại làm gương để gặt hái thành công lớn hơn, biến rủi thành may.", ""),
                    ("설상가상 (雪上加霜)", "họa vô đơn chí (khó khăn chồng chất)", "seol-sang-ga-sang", "지갑을 잃어버린 데다가 설상가상으로 비까지 쏟아졌다.", "Đã mất ví rồi lại còn đổ mưa tầm tã, đúng là họa vô đơn chí.", ""),
                    ("다다익선 (多多益善)", "càng nhiều càng tốt", "da-da-ik-seon", "안전 점검은 아무리 강조해도 다다익선이다.", "Kiểm tra an toàn dù nhiều đến mấy cũng càng tốt.", ""),
                    ("우유부단 (優柔不斷)", "do dự thiếu quyết단", "u-yu-bu-dan", "리더가 우유부단하면 위기 상황에서 기회를 놓치기 쉽다.", "Nếu người lãnh đạo thiếu quyết đoán thì rất dễ lỡ cơ hội lúc khủng hoảng.", ""),
                    ("자업자득 (自業自得)", "gieo nhân nào gặt quả nấy", "ja-eop-ja-deuk", "평소에 불성실했으니 이번 결과는 자업자득이다.", "Ngày thường thiếu trung thực nên kết quả lần này là tự làm tự chịu.", "")
                ])
            ], [
                {"pattern": "-(으)ㄴ/는 셈이다", "meaning": "Coi như là / Tính ra thì gần như...", "construction": "Động từ/Tính từ + -(으)ㄴ/는 셈이다", "usage": "Đánh giá tổng kết một tình huống tương đương kết quả nào đó.", "example1Ko": "원금의 구십 퍼센트를 돌려받았으니 큰 손해는 피한 셈이다.", "example1Vi": "Nhận lại được 90% tiền gốc nên tính ra cũng coi như tránh được thiệt hại lớn."}
            ], [
                {"speaker": "교수", "ko": "토픽 고급 독해와 듣기 대담에서는 역지사지, 전화위복, 설상가상 같은 한자 성어가 선택지로 자주 출제됩니다.", "vi": "Trong phần Đọc cao cấp và Nghe tọa đàm của TOPIK, các thành ngữ Hán Hàn như 역지사지, 전화위복, 설상가상 rất hay xuất hiện ngay trong 4 đáp án."},
                {"speaker": "학생", "ko": "베트남 한자음(Âm Hán Việt)과 연결해서 외우니까 뜻이 한눈에 들어와요!", "vi": "Liên hệ với Âm Hán Việt để học nên em nắm nghĩa ngay lập tức ạ!"}
            ], "Người Việt học TOPIK Cấp 6 có lợi thế cực lớn ở mảng 사자성어 nhờ hệ thống Âm Hán–Việt tương đồng gần như 1:1 (역지사지 = Dịch địa tư chi, 전화위복 = Chuyển họa vi phúc).", [
                {"q": "[Sách bài tập Q6-B01] Tình huống 'Đã bị cảm lạnh lại còn phải làm thêm giờ đêm khuya' ứng với thành ngữ nào?", "opts": ["설상가상", "금상첨화", "유비무환", "일석이조"], "ans": 0, "exp": "'설상가상' (Tuyết thượng gia sương) chỉ việc xui rủi chồng chất thêm khó khăn."}
            ]),
            (2, "Triết học, Chính sách công & Đọc sâu Câu 41–50", "철학·공공 정책·고급 독해", [
                ("Phần 1 · Thuật ngữ Chính sách & Xã hội học", [
                    ("공익과 사익", "lợi ích công cộng và lợi ích cá nhân", "gong-ik-gwa sa-ik", "공공 정책은 공익과 사익의 조화를 추구해야 한다.", "Chính sách công phải theo đuổi sự hài hòa giữa lợi ích chung và lợi ích riêng.", ""),
                    ("형평성", "tính công bằng / bình đẳng", "hyeong-pyeong-seong", "세금 제도는 사회적 형평성을 고려하여 설계되어야 한다.", "Hệ thống thuế phải được thiết kế có cân nhắc tính công bằng xã hội.", ""),
                    ("실효성을 거두다", "đạt được hiệu quả thực tế", "sil-hyo-seong-eul geo-du-da", "현실을 반영하지 못한 대책은 실효성을 거두기 어렵다.", "Đối sách không phản ánh thực tế thì rất khó mang lại hiệu quả thực chất.", ""),
                    ("합의를 도출하다", "đi đến đồng thuận", "hab-ui-reul do-chul-ha-da", "긴 토론 끝에 노사 간의 원만한 합의를 도출했다.", "Sau cuộc thảo luận dài đã rút ra được sự đồng thuận êm đẹp giữa hai bên.", ""),
                    ("패러다임의 전환", "sự chuyển dịch mô hình tư duy", "pae-reo-da-im-ui jeon-hwan", "디지털 혁명은 교육 패러다임의 근본적인 전환을 요구한다.", "Cách mạng số đòi hỏi sự chuyển đổi căn bản mô hình giáo dục.", "")
                ]),
                ("Phần 2 · Thái độ Tác giả & Sắc thái Câu 41–50", [
                    ("회의적이다", "mang thái độ hoài nghi", "hoe-ui-jeog-i-da", "일부 학자들은 그 정책의 효과에 대해 회의적인 태도를 보인다.", "Một số học giả tỏ thái độ hoài nghi về hiệu quả của chính sách đó.", "Từ khóa thái độ tác giả Câu 41–50!"),
                    ("옹호하다", "ủng hộ, bảo vệ quan điểm", "ong-ho-ha-da", "필자는 표현의 자유를 적극적으로 옹호하고 있다.", "Tác giả đang tích cực bảo vệ quyền tự do ngôn luận.", "Đối lập: 비판하다 / 반박하다."),
                    ("간과하다", "xem nhẹ, bỏ sót", "gan-gwa-ha-da", "눈앞의 이익에만 급급해 본질적인 가치를 간과해서는 안 된다.", "Không được chỉ mải chạy theo lợi ích trước mắt mà bỏ quên giá trị cốt lõi.", ""),
                    ("자성하다", "tự nhìn nhận, tự phản tỉnh", "ja-seong-ha-da", "현대 문명의 물질주의에 대해 깊이 자성할 필요가 있다.", "Cần tự suy ngẫm sâu sắc về chủ nghĩa vật chất của nền văn minh hiện đại.", ""),
                    ("일맥상통하다", "thông suốt cùng một mạch ý", "il-maek-sang-tong-ha-da", "그의 주장은 전통 철학의 핵심 정신과 일맥상통한다.", "Luận điểm của ông ấy tương thông cùng một mạch với tinh thần triết học truyền thống.", "")
                ])
            ], [
                {"pattern": "-는 한이 있더라도", "meaning": "Dù cho có phải... đi chăng nữa", "construction": "Động từ + -는 한이 있더라도", "usage": "Nhấn mạnh quyết tâm hoặc nguyên tắc bất di bất dịch.", "example1Ko": "시간이 오래 걸리는 한이 있더라도 원칙과 절차를 지켜야 한다.", "example1Vi": "Dù cho có mất nhiều thời gian đi chăng nữa thì vẫn phải tuân thủ nguyên tắc và quy trình."}
            ], [
                {"speaker": "논설위원", "ko": "단기적인 효율성만을 내세워 절차적 정당성을 간과한다면 사회적 갈등 비용이 더 커질 뿐입니다.", "vi": "Nếu chỉ đề cao tính hiệu quả ngắn hạn mà xem nhẹ tính chính đáng về quy trình thì chi phí xung đột xã hội sẽ chỉ càng lớn hơn."},
                {"speaker": "진행자", "ko": "결국 충분한 공론화를 거쳐 사회적 합의를 도출하는 과정이 핵심이군요.", "vi": "Rốt cuộc quá trình thảo luận công khai đầy đủ để đi đến đồng thuận xã hội mới là cốt lõi."}
            ], "Ở nhóm Câu 41–50 TOPIK II (Cấp 6), nắm chắc các từ chỉ thái độ của người viết ('회의적이다', '옹호하다', '간과하다', '경계하다') giúp giải quyết ngay câu hỏi '태도 / 중심 생각'.", [
                {"q": "[Sách bài tập Q6-B02] Khi tác giả cho rằng một chính sách khó thành công trên thực tế, thái độ của tác giả được gọi là gì?", "opts": ["회의적이다", "낙관적이다", "우호적이다", "방관적이다"], "ans": 0, "exp": "'회의적이다' = hoài nghi tính khả thi; '낙관적이다' = lạc quan; '우호적이다' = thiện chí."}
            ])
        ]
    }
]

EXTRA_CHAPTERS_BY_BOOK = {
    "q3": [
        (5, "Nhà ở, Hợp đồng thuê nhà & Sửa chữa", "주거 계약과 수리", [
            ("Phần 1 · Hình thức thuê nhà tại Hàn Quốc", [
                ("전세 / 월세", "thuê đặt cọc trọn gói / thuê trả tháng", "jeon-se / wol-se", "학생들은 보증금이 적은 원룸 월세를 선호한다.", "Sinh viên ưa chuộng phòng đơn trả tiền thuê theo tháng có tiền cọc thấp.", ""),
                ("보증금", "tiền đặt cọc nhà", "bo-jeung-geum", "계약 기간이 끝나면 보증금을 전액 돌려받는다.", "Khi hết hạn hợp đồng sẽ nhận lại toàn bộ tiền đặt cọc.", ""),
                ("부동산 중개소", "văn phòng môi giới bất động sản", "bu-dong-san jung-gae-so", "학교 앞 부동산 중개소에서 방을 구했다.", "Tôi đã tìm được phòng qua văn phòng bất động sản trước trường.", ""),
                ("관리비", "phí quản lý tòa nhà", "gwal-li-bi", "월세 외에 매달 오만 원의 관리비를 따로 낸다.", "Ngoài tiền thuê tháng còn đóng riêng 50.000 won phí quản lý.", ""),
                ("계약을 맺다", "ký kết hợp đồng", "gye-yag-eul maet-da", "집주인과 인 년 동안 임대 계약을 맺었다.", "Đã ký hợp đồng thuê nhà 2 năm với chủ nhà.", "")
            ]),
            ("Phần 2 · Hỏng hóc & Yêu cầu sửa chữa", [
                ("고장이 나다", "bị hỏng", "go-jang-i na-da", "보일러가 갑자기 고장이 나서 찬물만 나온다.", "Bình nóng lạnh đột nhiên hỏng nên chỉ ra nước lạnh.", ""),
                ("물이 새다", "bị rò nước, dột nước", "mul-i sae-da", "세면대 파이프에서 물이 새서 수리를 요청했다.", "Ống bồn rửa mặt bị rò nước nên tôi đã yêu cầu sửa.", ""),
                ("수리 기사", "thợ sửa chữa", "su-ri gi-sa", "서비스 센터에 전화하니 수리 기사님이 방문하셨다.", "Gọi trung tâm bảo hành thì thợ sửa chữa đã tới nhà.", ""),
                ("점검하다", "kiểm tra, bảo dưỡng", "jeom-geom-ha-da", "겨울이 오기 전에 난방 시설을 미리 점검해야 한다.", "Trước khi mùa đông tới phải kiểm tra sẵn hệ thống sưởi.", ""),
                ("교체하다", "thay mới (linh kiện/bóng đèn)", "gyo-che-ha-da", "어두운 형광등을 밝은 엘이디(LED) 등으로 교체했다.", "Đã thay bóng huỳnh quang tối bằng đèn LED sáng.", "")
            ])
        ], [
            {"pattern": "-아/어 놓다 (두다)", "meaning": "Làm sẵn và giữ nguyên trạng thái", "construction": "Động từ + -아/어 놓다", "usage": "Chuẩn bị trước cho việc sau.", "example1Ko": "이사하기 전에 방 청소를 깨끗이 해 놓았어요.", "example1Vi": "Trước khi chuyển nhà tôi đã dọn dẹp phòng sạch sẽ sẵn rồi."}
        ], [
            {"speaker": "세입자", "ko": "집주인 아주머니, 어제부터 에어컨이 고장이 나서 작동이 안 돼요.", "vi": "Cô chủ nhà ơi, từ hôm qua điều hòa bị hỏng nên không chạy được ạ."},
            {"speaker": "집주인", "ko": "그래요? 오늘 오후에 수리 기사를 불러 놓을게요.", "vi": "Vậy à? Chiều nay cô sẽ gọi sẵn thợ sửa tới kiểm tra nhé."}
        ], "Hệ thống thuê nhà 전세 (đặt cọc lớn không trả tiền tháng) và 월세 (đặt cọc nhỏ + tiền thuê hằng tháng) là kiến thức thực tế quan trọng trong đề Nghe TOPIK II.", [
            {"q": "[Sách bài tập Q3-B05] Từ nào chỉ khoản tiền đặt cọc được hoàn lại khi kết thúc hợp đồng thuê nhà?", "opts": ["보증금", "관리비", "수수료", "수리비"], "ans": 0, "exp": "'보증금' là tiền đặt cọc bảo đảm hợp đồng thuê nhà."}
        ]),
        (6, "Sự cố, Thất lạc & Nhờ giúp đỡ", "사건·분실과 도움 요청", [
            ("Phần 1 · Thất lạc đồ & Xử lý tình huống", [
                ("분실하다 / 잃어버리다", "làm mất, thất lạc", "bun-sil-ha-da", "지하철 선반 위에 백팩을 두고 내려 분실했다.", "Để quên ba lô trên giá hành lý tàu điện ngầm nên bị thất lạc.", ""),
                ("신고하다", "khai báo, trình báo", "sin-go-ha-da", "신용카드를 잃어버리자마자 은행에 분실 신고를 했다.", "Ngay khi mất thẻ tín dụng tôi đã báo mất thẻ với ngân hàng.", ""),
                ("특징을 설명하다", "mô tả đặc điểm nhận dạng", "teuk-jing-eul seol-myeong-ha-da", "가방의 색깔과 모양 등 특징을 자세히 설명했다.", "Mô tả chi tiết đặc điểm màu sắc và hình dáng chiếc túi.", ""),
                ("보관하다", "cất giữ, bảo quản", "bo-gwan-ha-da", "습득한 지갑을 역무실에서 안전하게 보관하고 있다.", "Phòng quản lý nhà ga đang cất giữ an toàn chiếc ví nhặt được.", ""),
                ("되찾다", "tìm lại được", "doe-chat-da", "다행히 친절한 시민 덕분에 여권을 되찾았다.", "May mắn nhờ người dân tốt bụng mà tôi đã tìm lại được hộ chiếu.", "")
            ]),
            ("Phần 2 · Cảm xúc nhẹ nhõm & Biết ơn", [
                ("당황하다", "hốt hoảng, lúng túng", "dang-hwang-ha-da", "갑작스러운 질문에 당황해서 말이 나오지 않았다.", "Luống cuống trước câu hỏi bất ngờ nên không nói nên lời.", ""),
                ("안심하다", "yên tâm, thở phào", "an-sim-ha-da", "가방을 찾았다는 연락을 받고 비로소 안심했다.", "Nhận được tin đã thấy túi tôi mới thật sự yên tâm.", ""),
                ("사례하다", "hậu tạ, cảm tạ", "sa-rye-ha-da", "지갑을 찾아 준 분께 작은 선물로 사례했다.", "Cảm tạ người nhặt giúp chiếc ví bằng một món quà nhỏ.", ""),
                ("주의를 기울이다", "chú ý cẩn thận", "ju-ui-reul gi-ul-i-da", "소지품을 챙길 때 각별히 주의를 기울여야 한다.", "Khi thu dọn đồ cá nhân cần hết sức chú ý cẩn thận.", "")
            ])
        ], [
            {"pattern": "-자마자", "meaning": "Ngay sau khi...", "construction": "Động từ + -자마자", "usage": "Hành động sau nối tiếp tức thì ngay khi hành động trước vừa xảy ra.", "example1Ko": "내리자마자 가방을 두고 온 것이 생각났어요.", "example1Vi": "Vừa bước xuống tàu là tôi sực nhớ ra mình để quên cặp."}
        ], [
            {"speaker": "승객", "ko": "방금 삼 호선 열차에서 내리자마자 서류 가방을 두고 온 걸 알았어요.", "vi": "Tôi vừa xuống tàu tuyến số 3 thì phát hiện để quên cặp tài liệu trên tàu."},
            {"speaker": "역무원", "ko": "당황하지 마시고 열차 도착 시각과 가방 특징을 말씀해 주세요.", "vi": "Quý khách đừng hốt hoảng, xin hãy cho biết giờ tàu đến và đặc điểm chiếc cặp ạ."}
        ], "Hội thoại tại Trung tâm đồ thất lạc (분실물 센터) xuất hiện rất đều đặn ở Câu 1–12 phần Nghe TOPIK II.", [
            {"q": "[Sách bài tập Q3-B06] Chọn cách kết hợp '-자마자' đúng ngữ pháp:", "opts": ["도착하자마자 부모님께 전화했어요.", "도착했자마자 부모님께 전화했어요.", "도착할자마자 부모님께 전화했어요.", "도착은자마자 부모님께 전화했어요."], "ans": 0, "exp": "Trước '-자마자' luôn dùng thân động từ nguyên gốc, không chia quá khứ -았/었-."}
        ])
    ],
    "q4": [
        (5, "Truyền thông, Mạng xã hội & Đời sống số", "미디어와 디지털 사회", [
            ("Phần 1 · Thông tin trực tuyến & Tương tác", [
                ("실시간으로 소통하다", "giao tiếp theo thời gian thực", "sil-si-gan-eu-ro so-tong-ha-da", "SNS를 통해 전 세계 사람들과 실시간으로 소통한다.", "Giao tiếp thời gian thực với mọi người khắp thế giới qua mạng xã hội.", ""),
                ("정보를 공유하다", "chia sẻ thông tin", "jeong-bo-reul gong-yu-ha-da", "유익한 생활 정보를 온라인 커뮤니티에 공유했다.", "Chia sẻ thông tin đời sống hữu ích lên cộng đồng trực tuyến.", ""),
                ("사생활 침해", "xâm phạm đời tư", "sa-saeng-hwal chim-hae", "무분별한 사진 게시는 타인의 사생활 침해가 될 수 있다.", "Đăng ảnh tùy tiện có thể xâm phạm quyền riêng tư của người khác.", ""),
                ("중독되다", "bị nghiện (điện thoại/mạng)", "jung-dok-doe-da", "스마트폰에 지나치게 중독되지 않도록 사용 시간을 정했다.", "Đặt giới hạn giờ dùng để không bị nghiện điện thoại quá mức.", ""),
                ("저작권을 보호하다", "bảo vệ bản quyền", "jeo-jak-gwon-eul bo-ho-ha-da", "창작자의 저작권을 보호하는 성숙한 시민 의식이 필요하다.", "Cần ý thức văn minh bảo vệ bản quyền của người sáng tạo.", "")
            ]),
            ("Phần 2 · Ảnh hưởng văn hóa & Quảng cáo", [
                ("유행을 선도하다", "dẫn đầu xu hướng", "yu-haeng-eul seon-do-ha-da", "한국 드라마와 음악이 아시아의 대중문화를 선도하고 있다.", "Phim và nhạc Hàn đang dẫn dắt văn hóa đại chúng châu Á.", ""),
                ("과장 광고", "quảng cáo phóng đại", "gwa-jang gwang-go", "현명한 소비자는 과장 광고에 현혹되지 않는다.", "Người tiêu dùng thông thái không bị mê hoặc bởi quảng cáo phóng đại.", ""),
                ("파급 효과가 크다", "hiệu ứng lan tỏa lớn", "pa-geup hyo-gwa-ga keu-da", "인기 방송에 소개된 후 매출에 미치는 파급 효과가 컸다.", "Sau khi lên sóng chương trình nổi tiếng, hiệu ứng lan tỏa tới doanh thu rất lớn.", ""),
                ("소외감을 느끼다", "cảm thấy bị cô lập / lạc lõng", "so-oe-gam-eul neu-kki-da", "디지털 기기에 익숙하지 않은 노년층은 소외감을 느끼기 쉽다.", "Người cao tuổi chưa quen thiết bị số rất dễ cảm thấy bị bỏ lại phía sau.", "")
            ])
        ], [
            {"pattern": "-는 데 반해 / -(으)ㄴ 반면", "meaning": "Trong khi mặt này... thì mặt kia...", "construction": "Động từ + -는 반면, Tính từ + -(으)ㄴ 반면", "usage": "Phân tích ưu – nhược điểm của mạng xã hội trong Câu 52 & 54.", "example1Ko": "온라인 소통은 편리한 반면 깊은 인간관계를 맺기는 어렵다.", "example1Vi": "Giao tiếp trực tuyến tiện lợi nhưng ngược lại khó xây dựng mối quan hệ sâu sắc."}
        ], [
            {"speaker": "진행자", "ko": "디지털 기기 보급으로 생활은 편리해졌지만 노년층의 디지털 소외 문제도 커지고 있습니다.", "vi": "Thiết bị số phổ cập giúp cuộc sống tiện lợi hơn nhưng vấn đề người lớn tuổi bị tách biệt công nghệ cũng lớn dần."},
            {"speaker": "패널", "ko": "주민센터에서 키오스크 사용법 같은 맞춤형 교육을 확대해야 합니다.", "vi": "Cần mở rộng các lớp hướng dẫn sử dụng máy bán hàng tự động (kiosk) tại trung tâm dân cư."}
        ], "Chủ đề 'Khoảng cách số ở người cao tuổi (디지털 소외 / 키오스크)' vừa xuất hiện trực tiếp trong các kỳ thi TOPIK II gần đây (Kỳ 91–96).", [
            {"q": "[Sách bài tập Q4-B05] Cụm từ nào chỉ việc 'xâm phạm quyền riêng tư cá nhân' trên không gian mạng?", "opts": ["사생활 침해", "저작권 보호", "파급 효과", "실시간 소통"], "ans": 0, "exp": "'사생활' = đời sống riêng tư; '침해' = xâm phạm."}
        ]),
        (6, "Khoa học Thường thức, Tâm lý & Giáo dục (Câu 52)", "심리·교육과 설명문 완성", [
            ("Phần 1 · Tâm lý hành vi & Học tập", [
                ("동기를 부여하다", "tạo động lực", "dong-gi-reul bu-yeo-ha-da", "적절한 칭찬은 아이들에게 큰 학습 동기를 부여한다.", "Lời khen đúng lúc tạo động lực học tập lớn cho trẻ.", ""),
                ("잠재력을 발휘하다", "phát huy tiềm năng", "jam-jae-ryeog-eul bal-hwi-ha-da", "자유로운 분위기에서 학생들은 자신의 잠재력을 발휘한다.", "Trong bầu không khí cởi mở học sinh phát huy được tiềm năng của mình.", ""),
                ("선입견을 버리다", "xóa bỏ định kiến", "seon-ip-gyeon-eul beo-ri-da", "상대방을 있는 그대로 이해하려면 선입견을 버려야 한다.", "Muốn hiểu đối phương đúng bản chất cần bỏ đi định kiến ban đầu.", "Đồng nghĩa: 편견."),
                ("공감 능력", "khả năng thấu cảm", "gong-gam neung-nyeok", "타인의 아픔에 귀 기울이는 공감 능력이 중요하다.", "Khả năng đồng cảm lắng nghe nỗi đau của người khác rất quan trọng.", ""),
                ("창의성을 기르다", "bồi dưỡng tính sáng tạo", "chang-ui-seong-eul gi-reu-da", "독서와 토론 수업은 창의성을 기르는 데 효과적이다.", "Giờ đọc sách và thảo luận rất hiệu quả để rèn tính sáng tạo.", "")
            ]),
            ("Phần 2 · Cấu trúc đối xứng Câu 52 (설명문)", [
                ("원인과 결과", "nguyên nhân và kết quả", "won-in-gwa gyeol-gwa", "현상의 원인과 결과를 논리적으로 파악해야 한다.", "Cần nắm bắt logic nguyên nhân và kết quả của hiện tượng.", ""),
                ("역효과가 나다", "phản tác dụng", "yeok-hyo-gwa-ga na-da", "지나친 간섭은 오히려 역효과가 날 수 있다.", "Can thiệp quá mức ngược lại có thể gây phản tác dụng.", "Hay ra đáp án Câu 52!"),
                ("보완하다", "bổ sung, khắc phục điểm khuyết", "bo-wan-ha-da", "서로의 부족한 점을 보완하며 팀워크를 다졌다.", "Bổ sung điểm còn thiếu của nhau để củng cố tinh thần đồng đội.", ""),
                ("적용하다", "áp dụng vào thực tiễn", "jeog-yong-ha-da", "배운 이론을 실제 업무에 성공적으로 적용했다.", "Áp dụng thành công lý thuyết đã học vào công việc thực tế.", "")
            ])
        ], [
            {"pattern": "-기 일쑤이다", "meaning": "Rất hay / Thường xuyên (xảy ra lỗi/việc xấu)", "construction": "Động từ + -기 일쑤이다", "usage": "Nêu hệ quả tiêu cực thường gặp nếu thiếu chuẩn bị.", "example1Ko": "계획 없이 일을 시작하면 중도에 포기하기 일쑤이다.", "example1Vi": "Bắt đầu công việc mà không có kế hoạch thì rất dễ bỏ cuộc giữa chừng."}
        ], [
            {"speaker": "교사", "ko": "쓰기 52번 문제는 빈칸 앞뒤 문장의 대조 관계나 인과 관계에 숨은 힌트를 그대로 활용하면 됩니다.", "vi": "Ở Câu 52 phần Viết, bạn chỉ cần tận dụng ngay từ khóa gợi ý nằm ở quan hệ đối lập hoặc nhân quả của câu trước và câu sau chỗ trống."},
            {"speaker": "학생", "ko": "앞문장에 '칭찬하면 의욕이 높아진다'가 있으면 뒷문장 '꾸짖으면 의욕이 떨어진다'처럼 대칭으로 쓰면 되겠군요!", "vi": "Nếu câu trước có 'khen thì động lực tăng' thì câu sau viết đối xứng 'mắng thì động lực giảm' là chuẩn thầy nhỉ!"}
        ], "Mẹo vàng Câu 52 (10 điểm): Luôn tìm cặp từ trái nghĩa với vế đối lập trong chính đoạn văn và kết thúc bằng đuôi văn viết '-ㄴ/는다, -다'.", [
            {"q": "[Sách bài tập Q4-B06] Điền từ đúng: '무조건 혼내기만 하면 아이가 반발심을 가져 오히려 (          )가 날 수 있다.'", "opts": ["역효과", "잠재력", "보증금", "유효기간"], "ans": 0, "exp": "'역효과가 나다' = gây tác dụng ngược / phản tác dụng."}
        ])
    ],
    "q5": [
        (4, "Văn hóa Nghệ thuật, Di sản & Bảo tồn", "문화유산과 예술 비평", [
            ("Phần 1 · Giá trị Di sản & Truyền thống", [
                ("문화유산을 보존하다", "bảo tồn di sản văn hóa", "mun-hwa-yu-san-eul bo-jon-ha-da", "전통 건축물의 원형을 훼손하지 않고 보존해야 한다.", "Phải bảo tồn nguyên trạng kiến trúc truyền thống mà không làm hư hại.", ""),
                ("고유한 정체성", "bản sắc riêng độc đáo", "go-yu-han jeong-che-seong", "각 민족의 언어에는 고유한 문화적 정체성이 담겨 있다.", "Trong ngôn ngữ của mỗi dân tộc đều chứa đựng bản sắc văn hóa riêng.", ""),
                ("계승·발전시키다", "kế thừa và phát triển", "gye-seung bal-jeon-si-ki-da", "전통을 현대적 감각에 맞게 계승·발전시켜야 한다.", "Cần kế thừa và phát triển truyền thống phù hợp với cảm quan hiện đại.", ""),
                ("대중화하다", "đại chúng hóa", "dae-jung-hwa-ha-da", "전통 음악을 젊은 층도 즐길 수 있도록 대중화했다.", "Đại chúng hóa âm nhạc truyền thống để giới trẻ cũng có thể thưởng thức.", ""),
                ("가치를 재조명하다", "nhìn nhận lại / tôn vinh lại giá trị", "ga-chi-reul jae-jo-myeong-ha-da", "잊혀 가던 고전 문학의 가치를 새롭게 재조명했다.", "Soi chiếu, tôn vinh lại giá trị của các tác phẩm văn học cổ điển từng bị lãng quên.", "")
            ]),
            ("Phần 2 · Thưởng thức & Phê bình Nghệ thuật", [
                ("감동을 선사하다", "mang lại sự xúc động sâu sắc", "gam-dong-eul seon-sa-ha-da", "배우들의 열연이 관객들에게 깊은 감동을 선사했다.", "Diễn xuất xuất thần của các diễn viên đã mang đến sự xúc động sâu sắc cho khán giả.", ""),
                ("작품성이 뛰어나다", "giá trị nghệ thuật xuất sắc", "jak-pum-seong-이 ttwi-eo-na-da", "그 영화는 흥행성과 작품성이 모두 뛰어나다는 평을 받았다.", "Bộ phim được đánh giá xuất sắc cả về doanh thu lẫn tính nghệ thuật.", ""),
                ("호평을 받다", "nhận được đánh giá tích cực", "ho-pyeong-eul bat-da", "독창적인 연출로 평론가들에게 큰 호평을 받았다.", "Nhờ lối dàn dựng độc đáo, tác phẩm nhận được lời khen lớn từ giới phê bình.", "Đối nghĩa: 혹평을 받다."),
                ("공감을 불러일으키다", "khơi gợi sự đồng cảm", "gong-gam-eul bul-leo-i-reu-ki-da", "평범한 이웃의 이야기를 다뤄 폭넓은 공감을 불러일으켰다.", "Khai thác câu chuyện về những người bình dị nên đã khơi gợi sự đồng cảm rộng rãi.", "")
            ])
        ], [
            {"pattern": "-는 데 그치지 않고", "meaning": "Không chỉ dừng lại ở... mà còn...", "construction": "Động từ + -는 데 그치지 않고", "usage": "Diễn tả sự phát triển vượt lên tầm cao mới.", "example1Ko": "전통을 보존하는 데 그치지 않고 세계적인 콘텐츠로 발전시켰다.", "example1Vi": "Không chỉ dừng ở việc bảo tồn truyền thống mà còn phát triển thành nội dung vươn tầm thế giới."}
        ], [
            {"speaker": "큐레이터", "ko": "이번 전시는 고전 회화를 단순히 관람하는 데 그치지 않고 디지털 미디어로 직접 체험할 수 있습니다.", "vi": "Triển lãm lần này không chỉ dừng ở việc ngắm hội họa cổ điển mà còn cho phép trải nghiệm trực tiếp qua truyền thông số."},
            {"speaker": "관람객", "ko": "전통의 가치를 현대적으로 재조명한 점이 무척 인상적이네요.", "vi": "Điểm tái hiện giá trị truyền thống theo hơi thở hiện đại thực sự rất ấn tượng."}
        ], "Các bài Nghe phỏng vấn chuyên gia văn hóa (Câu 31–40) và bài Đọc nghệ thuật luôn xoay quanh sự kết hợp '보존 (bảo tồn) + 현대적 재해석 (tái diễn giải hiện đại)'.", [
            {"q": "[Sách bài tập Q5-B04] Từ nào trái nghĩa với '혹평을 받다' (bị chê bai gay gắt)?", "opts": ["호평을 받다", "제동이 걸리다", "우려를 낳다", "침체되다"], "ans": 0, "exp": "'호평' (Hảo bình) = lời khen ngợi, đánh giá tốt."}
        ]),
        (5, "Luật pháp, Quyền lợi & Trách nhiệm Xã hội", "법과 사회적 책임", [
            ("Phần 1 · Pháp chế & Bảo vệ quyền lợi", [
                ("법안을 발의하다 / 제정하다", "đề xuất / ban hành đạo luật", "beob-an-eul je-jeong-ha-da", "소비자 권익을 보호하기 위한 새로운 법률을 제정했다.", "Ban hành đạo luật mới nhằm bảo vệ quyền lợi người tiêu dùng.", ""),
                ("규제를 완화하다 / 강화하다", "nới lỏng / thắt chặt quy định", "gyu-je-reul gang-hwa-ha-da", "안전사고를 막기 위해 건축 안전 규제를 대폭 강화했다.", "Thắt chặt mạnh các quy định an toàn xây dựng để ngăn ngừa tai nạn.", ""),
                ("권리와 의무", "quyền lợi và nghĩa vụ", "gwol-li-wa ui-mu", "시민의 권리를 누리는 만큼 사회적 의무도 다해야 한다.", "Hưởng quyền lợi công dân bao nhiêu thì cũng phải làm tròn nghĩa vụ xã hội bấy nhiêu.", ""),
                ("처벌을 받다", "chịu hình phạt/chế tài", "cheo-beol-eul bat-da", "음주 운전은 법에 따라 엄중한 처벌을 받게 된다.", "Lái xe khi say rượu sẽ phải chịu mức phạt nghiêm khắc theo pháp luật.", ""),
                ("분쟁을 조정하다", "hòa giải tranh chấp", "bun-jaeng-eul jo-jeong-ha-da", "소비자원을 통해 판매자와의 계약 분쟁을 원만히 조정했다.", "Hòa giải êm thấm tranh chấp hợp đồng với người bán thông qua Ủy ban Bảo vệ người tiêu dùng.", "")
            ]),
            ("Phần 2 · Đạo đức doanh nghiệp & Cộng đồng", [
                ("사회적 책임을 다하다", "làm tròn trách nhiệm xã hội", "sa-hoe-jeok chaeg-im-eul da-ha-da", "기업은 이윤 추구와 함께 사회적 책임을 다해야 한다.", "Doanh nghiệp vừa tìm kiếm lợi nhuận vừa phải làm tròn trách nhiệm xã hội.", ""),
                ("취약 계층을 지원하다", "hỗ trợ nhóm yếu thế", "chwi-yak gye-cheung-eul ji-won-ha-da", "겨울철 에너지 취약 계층을 지원하는 예산이 편성되었다.", "Ngân sách hỗ trợ nhóm yếu thế về năng lượng mùa đông đã được phê duyệt.", ""),
                ("투명성을 확보하다", "đảm bảo tính minh bạch", "tu-myeong-seong-eul hwak-bo-ha-da", "기부금 사용 내역을 공개하여 운영의 투명성을 확보했다.", "Công khai chi tiết sử dụng tiền quyên góp để đảm bảo tính minh bạch vận hành.", ""),
                ("상생하다", "cùng tồn tại và cùng phát triển", "sang-saeng-ha-da", "대기업과 중소기업이 협력하여 상생하는 문화를 만들어야 한다.", "Doanh nghiệp lớn và doanh nghiệp vừa-nhỏ cần hợp tác tạo văn hóa cùng phát triển.", "")
            ])
        ], [
            {"pattern": "-에 비추어 볼 때", "meaning": "Khi xét dưới góc độ / Đối chiếu với...", "construction": "Danh từ + -에 비추어 볼 때", "usage": "Đặt chuẩn mực đối chiếu khi lập luận pháp lý – xã hội.", "example1Ko": "과거의 사례에 비추어 볼 때 사전 예방 교육이 무엇보다 중요하다.", "example1Vi": "Đối chiếu với các tiền lệ trong quá khứ, giáo dục phòng ngừa từ trước quan trọng hơn cả."}
        ], [
            {"speaker": "변호사", "ko": "기업이 지속 성장하려면 단기 이익보다 투명성을 확보하고 지역 사회와 상생해야 합니다.", "vi": "Để doanh nghiệp tăng trưởng bền vững thì hơn cả lợi nhuận ngắn hạn, cần đảm bảo tính minh bạch và cùng phát triển với cộng đồng."},
            {"speaker": "기자", "ko": "결국 기업의 사회적 책임이 선택이 아닌 필수가 된 시대군요.", "vi": "Suy cho cùng đây là thời đại mà trách nhiệm xã hội của doanh nghiệp là điều bắt buộc chứ không còn là lựa chọn."}
        ], "Đề tài '기업의 사회적 책임 (CSR) & 상생 (cùng phát triển)' đã nhiều lần được ra trực tiếp trong đề Viết Câu 54 của NIIED.", [
            {"q": "[Sách bài tập Q5-B05] Từ nào mang nghĩa 'cùng tồn tại và hỗ trợ nhau cùng phát triển'?", "opts": ["상생하다", "침체하다", "편향되다", "간과하다"], "ans": 0, "exp": "'상생 (相生)' = tương sinh, đôi bên cùng có lợi và cùng phát triển."}
        ]),
        (6, "Khoa học Tự nhiên, Tâm lý & Chèn câu <보기> (Câu 39–40)", "과학·심리와 문장 삽입", [
            ("Phần 1 · Từ nối chỉ thị giải mã Câu 39–40", [
                ("이러한 / 이와 같은", "như thế này / tương tự như trên", "i-reo-han", "이러한 현상은 기온 변화와 밀접한 관련이 있다.", "Hiện tượng như thế này có liên quan mật thiết với sự thay đổi nhiệt độ.", "Dấu hiệu số 1 tìm vị trí chèn câu!"),
                ("반면에 / 이와 달리", "ngược lại / khác với điều trên", "ban-myeon-e / i-wa dal-li", "이와 달리 심해 생물은 빛 없이도 에너지를 얻는다.", "Khác với điều đó, sinh vật biển sâu tạo năng lượng ngay cả khi không có ánh sáng.", ""),
                ("즉 / 다시 말해", "tức là / nói cách khác", "jeuk / da-si mal-hae", "즉 적절한 긴장감은 오히려 집중력을 높여 주는 역할을 한다.", "Nói cách khác, sự căng thẳng vừa phải lại đóng vai trò giúp tăng độ tập trung.", ""),
                ("그럼에도 불구하고", "mặc dù vậy nhưng...", "geu-reom-e-do bul-gu-ha-go", "실패 위험이 컸지만 그럼에도 불구하고 연구진은 실험을 계속했다.", "Rủi ro thất bại lớn, mặc dù vậy nhóm nghiên cứu vẫn tiếp tục thí nghiệm.", "")
            ]),
            ("Phần 2 · Từ vựng Nghiên cứu & Thực nghiệm", [
                ("가설을 입증하다", "chứng minh giả thuyết", "ga-seol-eul ip-jeung-ha-da", "반복된 실험을 통해 연구팀의 가설을 명확히 입증했다.", "Chứng minh rõ ràng giả thuyết của nhóm nghiên cứu qua các thí nghiệm lặp lại.", ""),
                ("상관관계", "mối tương quan", "sang-gwan-gwan-gye", "수면 시간과 기억력 사이의 밀접한 상관관계를 밝혀냈다.", "Làm sáng tỏ mối tương quan mật thiết giữa thời gian ngủ và trí nhớ.", ""),
                ("메커니즘 / 원리", "cơ chế / nguyên lý", "me-keo-ni-jeum / won-li", "식물이 빛을 에너지로 바꾸는 원리를 분석했다.", "Phân tích nguyên lý thực vật chuyển hóa ánh sáng thành năng lượng.", ""),
                ("주목할 만하다", "đáng chú ý", "ju-mok-hal man-ha-da", "이번 발굴 결과는 학계에서 매우 주목할 만한 성과이다.", "Kết quả khai quật lần này là thành tựu rất đáng chú ý trong giới học thuật.", "")
            ])
        ], [
            {"pattern": "-(으)ㄹ 따름이다", "meaning": "Chỉ là... mà thôi", "construction": "Động từ + -(으)ㄹ 따름이다", "usage": "Nhấn mạnh giới hạn duy nhất của hành동/cảm xúc.", "example1Ko": "도움을 주신 분들께 그저 감사할 따름이다.", "example1Vi": "Tôi chỉ biết vô cùng cảm kích những người đã giúp đỡ mà thôi."}
        ], [
            {"speaker": "독해 강사", "ko": "39~40번 <보기> 문장 삽입 문제는 <보기> 첫머리의 지시어(이, 그, 이러한, 그러나)가 가리키는 대상을 본문에서 찾는 것이 핵심입니다.", "vi": "Ở dạng Câu 39–40 chèn câu <보기>, mấu chốt là nhìn từ chỉ thị đầu câu <보기> (이, 그, 이러한, 그러나) để truy ngược đối tượng mà nó trỏ tới trong bài."},
            {"speaker": "수험생", "ko": "지시어 앞뒤의 단절 지점을 찾으니까 정답 위치가 정확히 보이네요!", "vi": "Tìm điểm đứt mạch ý trước – sau từ chỉ thị nên thấy ngay vị trí đáp án chính xác!"}
        ], "Dạng Câu 39–40 (Chèn câu vào đoạn văn) trở nên cực dễ khi khoanh tròn ngay các từ nối '그러나, 따라서, 이러한, 이처럼'.", [
            {"q": "[Sách bài tập Q5-B06] Nếu câu <보기> bắt đầu bằng '이러한 부작용을 막기 위해...', thì câu ĐỨNG NGAY TRƯỚC vị trí chèn bắt buộc phải nói về nội dung gì?", "opts": ["Một tác dụng phụ / hệ lụy tiêu cực cụ thể", "Một giải pháp đã thành công mỹ mãn", "Định nghĩa khái quát ban đầu", "Lời chào kết thúc bài phát biểu"], "ans": 0, "exp": "'이러한 부작용' (tác dụng phụ như thế này) đòi hỏi câu liền trước vừa nêu ra các tác dụng phụ đó."}
        ])
    ],
    "q6": [
        (3, "Kinh tế Vĩ mô, Ngoại giao & Toàn cầu hóa", "거시 경제와 국제 외교", [
            ("Phần 1 · Kinh tế vĩ mô & Thương mại", [
                ("금리를 인상/인하하다", "tăng / hạ lãi suất", "geum-ni-reul in-sang-ha-da", "중앙은행이 물가 안정을 위해 기준 금리를 인상했다.", "Ngân hàng trung ương đã tăng lãi suất cơ bản để ổn định vật giá.", ""),
                ("환율 변동성", "biến động tỷ giá", "hwan-yul byeon-dong-seong", "수출 기업들은 환율 변동성에 대비한 전략을 세웠다.", "Các doanh nghiệp xuất khẩu lập chiến lược ứng phó biến động tỷ giá.", ""),
                ("공급망을 다변화하다", "đa dạng hóa chuỗi cung ứng", "gong-geum-mang-eul da-byeon-hwa-ha-da", "특정 국가 의존도를 낮추고 원자재 공급망을 다변화했다.", "Giảm phụ thuộc vào một quốc gia và đa dạng hóa chuỗi cung ứng nguyên liệu.", ""),
                ("부가 가치를 창출하다", "tạo ra giá trị gia tăng", "bu-ga ga-chi-reul chang-chul-ha-da", "문화 산업은 높은 부가 가치를 창출하는 핵심 동력이다.", "Công nghiệp văn hóa là động lực cốt lõi tạo ra giá trị gia tăng cao.", ""),
                ("불황을 타개하다", "vượt qua suy thoái", "bul-hwang-eul ta-gae-ha-da", "과감한 기술 혁신으로 장기 불황을 타개했다.", "Vượt qua suy thoái kéo dài nhờ đổi mới công nghệ táo bạo.", "")
            ]),
            ("Phần 2 · Ngoại giao & Hợp tác quốc tế", [
                ("정상 회담", "hội nghị thượng đỉnh", "jeong-sang hoe-dam", "양국 정상이 만나 경제·안보 협력 방안을 논의했다.", "Nguyên thủ hai nước gặp gỡ thảo luận phương án hợp tác kinh tế – an ninh.", ""),
                ("협약을 체결하다", "ký kết hiệp ước / thỏa thuận", "hyeob-yag-eul che-gyeol-ha-da", "자유무역협정(FTA) 체결 이후 교역량이 크게 늘었다.", "Sau khi ký kết Hiệp định thương mại tự do, kim ngạch thương mại tăng mạnh.", ""),
                ("우호 관계를 다지다", "củng cố quan hệ hữu nghị", "u-ho gwan-gye-reul da-ji-da", "청년 교류 프로그램을 통해 양국의 우호 관계를 다졌다.", "Củng cố quan hệ hữu nghị hai nước thông qua chương trình giao lưu thanh niên.", ""),
                ("공조 체제를 구축하다", "xây dựng cơ chế phối hợp chung", "gong-jo che-je-reul gu-chuk-ha-da", "기후 위기 대응을 위해 국제적인 공조 체제를 구축했다.", "Xây dựng cơ chế phối hợp quốc tế để ứng phó khủng hoảng khí hậu.", "")
            ])
        ], [
            {"pattern": "-(으)ㅁ으로써", "meaning": "Bằng việc / Thông qua việc làm gì...", "construction": "Động từ + -(으)ㅁ으로써", "usage": "Cấu trúc danh từ hóa trang trọng bậc cao nêu phương thức đạt kết quả.", "example1Ko": "공급망을 다변화함으로써 외부 충격에 대한 대응력을 높였다.", "example1Vi": "Thông qua việc đa dạng hóa chuỗi cung ứng, đã nâng cao năng lực ứng phó trước cú sốc bên ngoài."}
        ], [
            {"speaker": "경제학자", "ko": "핵심 기술에 꾸준히 투자함으로써 고부가 가치 산업으로의 전환을 앞당겨야 합니다.", "vi": "Thông qua đầu tư bền bỉ vào công nghệ lõi, cần đẩy nhanh quá trình chuyển dịch sang ngành công nghiệp giá trị gia tăng cao."},
            {"speaker": "앵커", "ko": "국제 사회와의 긴밀한 공조 체제 구축 역시 빼놓을 수 없는 과제이겠군요.", "vi": "Việc xây dựng cơ chế phối hợp chặt chẽ với cộng đồng quốc tế hẳn cũng là nhiệm vụ không thể thiếu."}
        ], "Cấu trúc '-(으)ㅁ으로써' xuất hiện dày đặc trong các bài diễn văn Nghe Câu 41–50 và là vũ khí ăn điểm tuyệt đối ở kết bài Câu 54.", [
            {"q": "[Sách bài tập Q6-B03] Chọn từ điền đúng collocation ngoại giao: '양국이 전략적 동반자 협약을 (          ).'", "opts": ["체결했다", "발병했다", "지나쳤다", "세배했다"], "ans": 0, "exp": "'협약 / 조약을 체결하다' = ký kết hiệp ước, thỏa thuận."}
        ]),
        (4, "Lịch sử, Văn học & Nghe Chuyên sâu Câu 41–50", "역사·문학과 고급 대담", [
            ("Phần 1 · Diễn văn Lịch sử & Nhân văn", [
                ("시대정신", "tinh thần thời đại", "si-dae-jeong-sin", "문학 작품에는 당대의 시대정신과 민중의 삶이 투영된다.", "Trong tác phẩm văn học phản chiếu tinh thần thời đại và đời sống nhân dân đương thời.", ""),
                ("역사적 의의", "ý nghĩa lịch sử", "yeok-sa-jeok ui-ui", "훈민정음 창제는 민본 사상을 실현한 큰 역사적 의의를 지닌다.", "Việc sáng제 Huấn Dân Chính Âm mang ý nghĩa lịch sử to lớn khi hiện thực hóa tư tưởng lấy dân làm gốc.", ""),
                ("성찰하다", "chiêm nghiệm, suy xét nội tâm", "seong-chal-ha-da", "인문학은 인간다운 삶이 무엇인지 깊이 성찰하게 해 준다.", "Khoa học nhân văn giúp ta chiêm nghiệm sâu sắc thế nào là cuộc sống xứng đáng của con người.", ""),
                ("통찰력", "năng lực nhìn thấu bản chất (thấu thị)", "tong-chal-lyeok", "고전을 읽으면 시대를 꿰뚫어 보는 통찰력을 얻을 수 있다.", "Đọc tác phẩm kinh điển giúp đạt được nhãn quan sâu sắc xuyên suốt thời đại.", ""),
                ("맥락을 파악하다", "nắm bắt mạch văn / bối cảnh", "maeng-nag-eul pa-ak-ha-da", "단어의 사전적 의미보다 글 전체의 맥락을 파악하는 것이 중요하다.", "Nắm bắt mạch ngữ cảnh toàn bài quan trọng hơn nghĩa từ điển đơn lẻ.", "")
            ]),
            ("Phần 2 · Tổng duyệt Chiến thuật Cấp 6 (230+/300)", [
                ("논지를 전개하다", "triển khai luận điểm", "non-ji-reul jeon-gae-ha-da", "필자는 구체적인 통계 자료를 들어 논지를 설득력 있게 전개했다.", "Tác giả đưa số liệu thống kê cụ thể để triển khai luận điểm đầy thuyết phục.", ""),
                ("타당성을 뒷받침하다", "củng cố tính xác đáng/hợp lý", "ta-dang-seong-eul dwit-bat-chim-ha-da", "객관적인 근거가 주장의 타당성을 뒷받침한다.", "Căn cứ khách quan củng cố tính hợp lý cho luận điểm.", ""),
                ("함축적 의미", "ý nghĩa hàm ẩn", "ham-chuk-jeok ui-mi", "밑줄 친 비유 표현이 지닌 함축적 의미를 추론해 보자.", "Hãy suy luận ý nghĩa hàm ẩn của phép ẩn dụ được gạch chân.", "Câu hỏi đặc trưng Đọc Câu 46–50!"),
                ("일관성", "tính nhất quán", "il-gwan-seong", "정책이 신뢰를 얻으려면 장기적인 일관성을 유지해야 한다.", "Để chính sách tạo được niềm tin cần duy trì tính nhất quán dài hạn.", "")
            ])
        ], [
            {"pattern": "-기 나름이다", "meaning": "Tùy thuộc vào cách...", "construction": "Động từ + -기 나름이다, Danh từ + 나름이다", "usage": "Kết luận mang tính triết lý mở.", "example1Ko": "위기가 기회가 될지 시련으로 끝날지는 우리가 어떻게 대처하기 나름이다.", "example1Vi": "Khủng hoảng sẽ trở thành cơ hội hay khép lại như thử thách là tùy thuộc vào cách chúng ta ứng phó."}
        ], [
            {"speaker": "다큐 내레이션", "ko": "세종대왕께서 창제한 훈민정음은 백성이 쉽게 글을 익혀 뜻을 펴게 하려는 애민 정신의 결정체입니다.", "vi": "Huấn Dân Chính Âm do vua Sejong sáng chế là kết tinh của tinh thần thương dân, mong muốn trăm họ dễ dàng học chữ để bày tỏ ý nguyện."},
            {"speaker": "학자", "ko": "과학적 제자 원리와 인본주의 철학이 결합되었다는 점에서 세계 문자사적 의의가 매우 큽니다.", "vi": "Ở điểm kết hợp nguyên lý chế tự khoa học và triết lý nhân bản, bộ chữ mang ý nghĩa vô cùng lớn trong lịch sử văn tự thế giới."}
        ], "Phim tài liệu lịch sử (다큐멘터리 · Câu 43–44 Nghe) và bài giảng học thuật (강연 · Câu 41–42, 49–50) rất hay khai thác chủ đề Hangeul, kiến trúc Hanok và triết lý nhân văn Hàn Quốc.", [
            {"q": "[Sách bài tập Q6-B04] Chọn câu mang nghĩa 'Mọi việc thành bại đều tùy thuộc vào cách suy nghĩ':", "opts": ["모든 일은 마음먹기 나름이다.", "모든 일은 마음먹는 바람이다.", "모든 일은 마음먹기 일쑤이다.", "모든 일은 마음먹느라고 한다."], "ans": 0, "exp": "'마음먹기 나름이다' (tùy thuộc vào cách ta quyết tâm/nghĩ) là câu thành ngữ triết lý cực kỳ phổ biến."}
        ])
    ]
}

for spec in HIGHER_BOOKS_SPEC:
    extra = EXTRA_CHAPTERS_BY_BOOK.get(spec["bookId"], [])
    spec["chapters"].extend(extra)

all_books_output = [
    {
        "bookId": "q1",
        "legacyCode": "sc1",
        "bookNum": 1,
        "title": "Tiếng Hàn Tổng Hợp · Quyển 1 (Sơ cấp 1)",
        "shortTitle": "Quyển 1 · Sơ cấp 1",
        "levelBadge": "TOPIK I · Cấp 1",
        "subtitle": "15 Chương · 47 Phần từ vựng nhỏ (8–15 từ/phần) · Đủ Giáo trình & Sách bài tập",
        "scale": {"examLevel": "topik1", "maxScore": 200, "passScore": 80, "excellentScore": 115, "gradeName": "TOPIK I · Cấp 1"},
        "usesExternalVocab": "sc1_vocab",
        "chapters": q1_chapters,
        "vocab": []
    }
]

# Build Book 2
q2_vocab_all = []
q2_chapters_out = []
for (ls, title_vi, title_ko, raw_parts, grams, dlg, cult, wb_drills) in Q2_RAW_CHAPTERS:
    f_words, p_meta = make_vocab_entries("q2", ls, title_vi, raw_parts)
    q2_vocab_all.extend(f_words)
    q2_chapters_out.append({
        "lesson": ls,
        "title": title_vi,
        "koTitle": title_ko,
        "parts": p_meta,
        "textbook": {
            "grammars": [
                {"id": f"q2_g_{ls}_{gi+1}", "book": "q2", "lesson": ls, "lessonTitle": title_vi, **g}
                for gi, g in enumerate(grams)
            ],
            "dialogue": dlg,
            "culture": cult
        },
        "workbook": {
            "vocabGrammarDrills": wb_drills
        }
    })

all_books_output.append({
    "bookId": "q2",
    "legacyCode": "sc2",
    "bookNum": 2,
    "title": "Tiếng Hàn Tổng Hợp · Quyển 2 (Sơ cấp 2)",
    "shortTitle": "Quyển 2 · Sơ cấp 2",
    "levelBadge": "TOPIK I · Cấp 2",
    "subtitle": f"15 Chương · {sum(len(c['parts']) for c in q2_chapters_out)} Phần từ vựng nhỏ · Giáo trình & Sách bài tập chuẩn Cấp 2",
    "scale": {"examLevel": "topik1", "maxScore": 200, "passScore": 140, "excellentScore": 175, "gradeName": "TOPIK I · Cấp 2"},
    "usesExternalVocab": None,
    "chapters": q2_chapters_out,
    "vocab": q2_vocab_all
})

# Build Books 3..6
for spec in HIGHER_BOOKS_SPEC:
    bid = spec["bookId"]
    b_vocab = []
    b_chaps = []
    for (ls, title_vi, title_ko, raw_parts, grams, dlg, cult, wb_drills) in spec["chapters"]:
        f_words, p_meta = make_vocab_entries(bid, ls, title_vi, raw_parts)
        b_vocab.extend(f_words)
        b_chaps.append({
            "lesson": ls,
            "title": title_vi,
            "koTitle": title_ko,
            "parts": p_meta,
            "textbook": {
                "grammars": [
                    {"id": f"{bid}_g_{ls}_{gi+1}", "book": bid, "lesson": ls, "lessonTitle": title_vi, **g}
                    for gi, g in enumerate(grams)
                ],
                "dialogue": dlg,
                "culture": cult
            },
            "workbook": {
                "vocabGrammarDrills": wb_drills
            }
        })
    all_books_output.append({
        "bookId": bid,
        "legacyCode": bid,
        "bookNum": spec["bookNum"],
        "title": spec["title"],
        "shortTitle": spec["shortTitle"],
        "levelBadge": spec["levelBadge"],
        "subtitle": spec["subtitle"],
        "scale": spec["scale"],
        "usesExternalVocab": None,
        "chapters": b_chaps,
        "vocab": b_vocab
    })

out_path = os.path.join(DATA_DIR, "books_1_to_6_curriculum.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({"version": "2026.11.books6", "books": all_books_output}, f, ensure_ascii=False, indent=2)

print(f"Saved {out_path} ({os.path.getsize(out_path):,} bytes)")
for b in all_books_output:
    vc = 537 if b["bookId"] == "q1" else len(b["vocab"])
    pc = sum(len(c["parts"]) for c in b["chapters"])
    print(f"  {b['bookId']} ({b['shortTitle']}): {len(b['chapters'])} chapters, {pc} bite-sized parts, {vc} words")
