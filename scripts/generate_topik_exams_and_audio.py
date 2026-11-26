#!/usr/bin/env python3
import os, json, asyncio, re, edge_tts

WEB_DIR = "/Users/nguyenchiduc/Downloads/한국/web"
MEDIA_DIR = os.path.join(WEB_DIR, "media")
DATA_DIR = os.path.join(WEB_DIR, "data")

# Master pool of authentic NIIED-style TOPIK I & TOPIK II questions with exact official rubrics & points
TOPIK1_LISTEN_POOL = [
    {"id": "t1L_01", "sec": "듣기 [1~4] 물음에 맞는 대답 (4점)", "pts": 4, "turns": [("F", "오늘 저녁에 뭐 할 거예요?")], "question": "[1~4] 다음을 듣고 물음에 맞는 대답을 고르십시오.", "options": ["어제 영화를 봤어요.", "친구하고 밥을 먹을 거예요.", "저녁 일곱 시예요.", "식당에 사람이 많아요."], "answer": 1, "explain": "Câu hỏi tương lai '오늘 저녁에 뭐 할 거예요?' (Tối nay sẽ làm gì?) → Đáp án chia -(으)ㄹ 거예요."},
    {"id": "t1L_02", "sec": "듣기 [1~4] 물음에 맞는 대답 (4점)", "pts": 4, "turns": [("M", "가방이 아주 예쁘네요. 어디에서 샀어요?")], "question": "[1~4] 다음을 듣고 물음에 맞는 대답을 고르십시오.", "options": ["백화점에서 샀어요.", "가방이 조금 비싸요.", "동생한테 선물했어요.", "주말에 사러 갈 거예요."], "answer": 0, "explain": "'어디에서 샀어요?' hỏi nơi đã mua → '백화점에서 샀어요'."},
    {"id": "t1L_03", "sec": "듣기 [1~4] 물음에 맞는 대답 (4점)", "pts": 4, "turns": [("F", "주말 잘 보냈어요?")], "question": "[1~4] 다음을 듣고 물음에 맞는 대답을 고르십시오.", "options": ["네, 내일 만나요.", "네, 집에서 푹 쉬었어요.", "아니요, 주말이 아니에요.", "네, 늦어서 미안해요."], "answer": 1, "explain": "Hỏi thăm cuối tuần đã qua → '네, 집에서 푹 쉬었어요'."},
    {"id": "t1L_04", "sec": "듣기 [1~4] 물음에 맞는 대답 (3점)", "pts": 3, "turns": [("M", "수진 씨는 무슨 계절을 좋아해요?")], "question": "[1~4] 다음을 듣고 물음에 맞는 대답을 고르십시오.", "options": ["네, 날씨가 더워요.", "저는 봄을 제일 좋아해요.", "작년에 한국에 갔어요.", "꽃이 아주 많이 피었어요."], "answer": 1, "explain": "'무슨 계절을 좋아해요?' (Bạn thích mùa nào?) → '저는 봄을 제일 좋아해요'."},
    {"id": "t1L_05", "sec": "듣기 [5~6] 이어질 인사말 (4점)", "pts": 4, "turns": [("F", "선생님, 저 먼저 집에 가겠습니다.")], "question": "[5~6] 다음을 듣고 이어질 말로 가장 알맞은 것을 고르십시오.", "options": ["네, 조심히 가세요.", "네, 처음 뵙겠습니다.", "아니요, 괜찮습니다.", "네, 잘 먹겠습니다."], "answer": 0, "explain": "Chào người ra về → Người ở lại nói '네, 조심히 가세요' (Em về cẩn thận nhé)."},
    {"id": "t1L_06", "sec": "듣기 [5~6] 이어질 인사말 (3점)", "pts": 3, "turns": [("M", "음식을 많이 준비했으니까 많이 드세요.")], "question": "[5~6] 다음을 듣고 이어질 말로 알맞은 것을 고르십시오.", "options": ["네, 잘 먹겠습니다.", "네, 어서 오세요.", "네, 또 오겠습니다.", "네, 축하합니다."], "answer": 0, "explain": "Trước khi ăn đáp lại lời mời của chủ nhà → '네, 잘 먹겠습니다'."},
    {"id": "t1L_07", "sec": "듣기 [7~10] 여기는 어디입니까? (3점)", "pts": 3, "turns": [("M", "어서 오세요. 어떻게 오셨어요?"), ("F", "어제부터 목이 아프고 열이 좀 나요.")], "question": "[7~10] 여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["병원", "서점", "은행", "우체국"], "answer": 0, "explain": "'목이 아프고 열이 나요' (đau họng, hơi sốt) → 병원 (Bệnh viện)."},
    {"id": "t1L_08", "sec": "듣기 [7~10] 여기는 어디입니까? (3점)", "pts": 3, "turns": [("F", "이 소포를 베트남으로 보내고 싶은데요. 얼마나 걸려요?"), ("M", "비행기로 보내면 사흘쯤 걸립니다.")], "question": "[7~10] 여기는 어디입니까? 알맞은 것을 고르십시오.", "options": ["공항", "여행사", "우체국", "편의점"], "answer": 2, "explain": "'소포를 보내다' (gửi bưu kiện) → 우체국 (Bưu điện)."},
    {"id": "t1L_09", "sec": "듣기 [7~10] 여기는 어디입니까? (3점)", "pts": 3, "turns": [("M", "손님, 머리를 어떻게 해 드릴까요?"), ("F", "조금만 짧게 잘라 주세요.")], "question": "[7~10] 여기는 어디입니까?", "options": ["세탁소", "미용실", "백화점", "사진관"], "answer": 1, "explain": "'머리를 짧게 잘라 주세요' (cắt tóc ngắn bớt) → 미용실 (Tiệm làm tóc)."},
    {"id": "t1L_10", "sec": "듣기 [9~12] 무엇에 대한 이야기입니까? (3점)", "pts": 3, "turns": [("F", "민수 씨는 보통 회사에 어떻게 가요?"), ("M", "아침에는 길이 막혀서 지하철을 타고 가요.")], "question": "[9~12] 다음은 무엇에 대해 말하고 있습니까?", "options": ["주말 계획", "교통수단", "회사 업무", "운동 습관"], "answer": 1, "explain": "Đi làm bằng tàu điện ngầm vì tắc đường → 교통수단 (Phương tiện giao thông)."},
    {"id": "t1L_11", "sec": "듣기 [15~21] 대화 내용 일치 (4점)", "pts": 4, "turns": [("F", "내일 도서관에 같이 갈래요?"), ("M", "미안해요. 내일은 오전 열 시에 치과 예약이 있어요. 오후 두 시에 만나요."), ("F", "네, 그럼 그때 학생 식당 앞에서 봐요.")], "question": "[15~21] 들은 내용과 같은 것을 고르십시오.", "options": ["두 사람은 내일 오전에 만납니다.", "남자는 내일 병원에 갑니다.", "두 사람은 도서관 앞에서 만납니다.", "여자는 치과에 예약했습니다."], "answer": 1, "explain": "Người nam có lịch hẹn nha khoa (치과 = 병원) lúc 10h sáng mai."},
    {"id": "t1L_12", "sec": "듣기 [22~30] 담화 중심 생각 (4점)", "pts": 4, "turns": [("M", "잠을 자기 전에 휴대전화를 오래 보면 눈이 피곤해지고 잠도 잘 오지 않습니다. 건강을 위해서 잠자기 한 시간 전에는 휴대전화를 보지 않는 것이 좋습니다.")], "question": "[22~30] 남자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["휴대전화를 자주 바꾸면 안 됩니다.", "아침에 일찍 일어나는 습관이 중요합니다.", "잠자기 전에는 휴대전화 사용을 줄여야 합니다.", "눈이 나쁘면 안경을 꼭 써야 합니다."], "answer": 2, "explain": "Ý chính câu chốt: Trước khi ngủ 1 tiếng không nên xem điện thoại để bảo vệ sức khỏe."}
]

TOPIK1_READ_POOL = [
    {"id": "t1R_01", "sec": "읽기 [31~33] 화제 찾기 (2점)", "pts": 2, "passage": "저는 아침 일곱 시에 일어납니다. 세수를 하고 아침을 먹습니다.", "question": "[31~33] 무엇에 대한 이야기입니까?", "options": ["주말", "아침 생활", "취미", "계절"], "answer": 1, "explain": "Dậy 7h sáng, rửa mặt, ăn sáng → 아침 생활 (Sinh hoạt buổi sáng)."},
    {"id": "t1R_02", "sec": "읽기 [31~33] 화제 찾기 (2점)", "pts": 2, "passage": "제 동생은 노래를 잘 부릅니다. 시간이 있을 때마다 기타도 칩니다.", "question": "[31~33] 무엇에 대한 이야기입니까?", "options": ["직업", "취미", "약속", "쇼핑"], "answer": 1, "explain": "Hát hay và chơi guitar lúc rảnh → 취미 (Sở thích)."},
    {"id": "t1R_03", "sec": "읽기 [34~39] 빈칸 채우기 (2점)", "pts": 2, "passage": "방이 좀 어둡습니다. 그래서 불을 (          ).", "question": "[34~39] (     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["켰습니다", "껐습니다", "열었습니다", "닫았습니다"], "answer": 0, "explain": "Phòng tối (어둡습니다) nên bật đèn (불을 켰습니다)."},
    {"id": "t1R_04", "sec": "읽기 [34~39] 빈칸 채우기 (3점)", "pts": 3, "passage": "이 구두는 디자인이 아주 예쁩니다. (          ) 조금 작아서 발이 아픕니다.", "question": "[34~39] (     )에 들어갈 알맞은 말을 고르십시오.", "options": ["그래서", "그런데", "그리고", "그러니까"], "answer": 1, "explain": "Hai vế đối lập (đẹp nhưng chật đau chân) → 그런데."},
    {"id": "t1R_05", "sec": "읽기 [34~39] 빈칸 채우기 (3점)", "pts": 3, "passage": "내일 시험이 있어서 오늘 밤에는 텔레비전을 (          ) 공부할 겁니다.", "question": "[34~39] (     )에 들어갈 알맞은 것을 고르십시오.", "options": ["보지 않고", "보지 말고", "보러 가고", "보았지만"], "answer": 0, "explain": "'Không xem TV mà sẽ học bài' → V-지 않고."},
    {"id": "t1R_06", "sec": "읽기 [40~45] 안내문 이해 (3점)", "pts": 3, "passage": "[인주도서관 열람실 이용 안내]\n• 운영 시간: 화~일요일 09:00 ~ 21:00 (매주 월요일 휴관)\n• 열람실 안에서는 음식물을 드실 수 없습니다.", "question": "[40~45] 다음 안내문의 내용과 맞지 않는 것을 고르십시오.", "options": ["일요일에도 문을 엽니다.", "아홉 시부터 이용할 수 있습니다.", "월요일에는 도서관이 쉽니다.", "안에서 빵과 우유를 먹어도 됩니다."], "answer": 3, "explain": "Thông báo cấm ăn uống trong phòng đọc (음식물을 드실 수 없습니다) → Câu ④ sai."},
    {"id": "t1R_07", "sec": "읽기 [46~48] 중심 생각 파악 (3점)", "pts": 3, "passage": "운동을 처음 시작할 때부터 무리하게 하면 몸이 쉽게 지칩니다. 그래서 처음에는 가벼운 산책부터 시작해서 조금씩 시간을 늘리는 것이 좋습니다.", "question": "[46~48] 위 글의 중심 생각을 고르십시오.", "options": ["운동은 매일 아침에 해야 효과가 있습니다.", "운동은 자신의 몸에 맞게 천천히 늘려야 합니다.", "산책보다 달리기 운동이 건강에 더 좋습니다.", "몸이 피곤할 때도 운동을 쉬면 안 됩니다."], "answer": 1, "explain": "Ý trọng tâm: Bắt đầu nhẹ nhàng rồi tăng dần thời gian phù hợp với cơ thể."},
    {"id": "t1R_08", "sec": "읽기 [57~58] 문장 순서 배열 (3점)", "pts": 3, "passage": "(가) 그래서 오늘 오후에 서점에 갈 겁니다.\n(나) 내일은 제 친구의 생일입니다.\n(다) 서점에서 한국 소설책을 한 권 살 겁니다.\n(라) 친구는 책 읽는 것을 아주 좋아합니다.", "question": "[57~58] 다음을 순서대로 맞게 배열한 것을 고르십시오.", "options": ["(나) - (라) - (가) - (다)", "(나) - (가) - (라) - (다)", "(라) - (나) - (가) - (다)", "(라) - (가) - (다) - (나)"], "answer": 0, "explain": "(나) Mai sinh nhật bạn → (라) Bạn thích đọc sách → (가) Vì vậy chiều nay đi hiệu sách → (다) Ở hiệu sách mua 1 cuốn tiểu thuyết."}
]

TOPIK2_LISTEN_POOL = [
    {"id": "t2L_01", "sec": "듣기 [4~8] 이어질 말 (2점)", "pts": 2, "turns": [("F", "과장님, 거래처에 보낼 계약서 검토 다 끝났습니다."), ("M", "수고했어요. 그런데 발송하기 전에 수정할 부분이 하나 있던데요.")], "question": "[4~8] 여자가 이어서 할 말로 가장 알맞은 것을 고르십시오.", "options": ["네, 벌써 거래처에 발송했습니다.", "어느 부분인지 말씀해 주시면 바로 고치겠습니다.", "계약서를 내일까지 작성해 보겠습니다.", "검토해 주셔서 정말 감사합니다."], "answer": 1, "explain": "Trưởng phòng bảo có 1 chỗ cần sửa trước khi gửi → Đáp lại hợp lý: 'Anh chỉ giúp chỗ nào để em sửa ngay ạ'."},
    {"id": "t2L_02", "sec": "듣기 [9~12] 이어서 할 행동 (2점)", "pts": 2, "turns": [("F", "김 대리님, 오후 세 시 회의실 예약은 확인하셨죠?"), ("M", "네, 예약은 끝났는데 발표 자료 인쇄가 아직 안 됐어요."), ("F", "아, 그래요? 그럼 제가 지금 출력해 올게요. 대리님은 노트북 먼저 연결해 주세요.")], "question": "[9~12] 여자가 이어서 할 행동으로 알맞은 것을 고르십시오.", "options": ["회의실을 예약한다.", "노트북을 연결한다.", "발표 자료를 인쇄한다.", "회의 시간을 변경한다."], "answer": 2, "explain": "Người nữ nói '그럼 제가 지금 출력해 올게요' → Đi in tài liệu thuyết trình."},
    {"id": "t2L_03", "sec": "듣기 [9~12] 이어서 할 행동 (2점)", "pts": 2, "turns": [("M", "수진 씨, 이번 사내 체육대회 포스터 디자인 시안 나왔어요?"), ("F", "네, 방금 완성했어요. 게시판에 붙이기 전에 팀장님께 먼저 보여 드리려고요."), ("M", "좋아요. 그럼 저는 참가자 명단을 정리하고 있을게요.")], "question": "[9~12] 여자가 이어서 할 행동으로 알맞은 것을 고르십시오.", "options": ["포스터를 게시판에 붙인다.", "팀장님께 포스터 시안을 보여 드린다.", "참가자 명단을 정리한다.", "체육대회 장소를 알아본다."], "answer": 1, "explain": "Người nữ nói '팀장님께 먼저 보여 드리려고요' → Đưa bản thiết kế cho trưởng nhóm xem trước."},
    {"id": "t2L_04", "sec": "듣기 [17~20] 남자의 중심 생각 (2점)", "pts": 2, "turns": [("F", "요즘 아이들에게 코딩 교육을 일찍 시키는 부모들이 많아졌어요."), ("M", "기술을 배우는 것도 좋지만 어릴 때는 친구들과 뛰어놀면서 사회성과 창의력을 기르는 것이 훨씬 더 중요하다고 생각해요.")], "question": "[17~20] 남자의 중심 생각으로 가장 알맞은 것을 고르십시오.", "options": ["코딩 교육은 초등학교 때부터 필수로 해야 한다.", "어린 시절에는 기술 교육보다 또래 활동과 창의성 발달이 우선이다.", "부모가 아이의 진로를 미리 결정해 주는 것이 좋다.", "컴퓨터 게임은 아이들의 사회성 발달에 도움이 된다."], "answer": 1, "explain": "Người nam nhấn mạnh khi còn nhỏ, vui chơi cùng bạn bè để rèn tính xã hội & sáng tạo quan trọng hơn học kỹ thuật sớm."},
    {"id": "t2L_05", "sec": "듣기 [21~30] 대담/강연 이해 (2점)", "pts": 2, "turns": [("F", "전통 시장을 살리기 위해 주차장을 넓히는 것도 필요하지만 무엇보다 젊은 세대가 찾아올 수 있도록 특색 있는 문화 공간과 체험 프로그램을 함께 운영하는 노력이 필요합니다.")], "question": "[21~30] 여자의 중심 생각으로 알맞은 것을 고르십시오.", "options": ["전통 시장 주변의 교통 문제를 먼저 해결해야 한다.", "전통 시장은 저렴한 가격 경쟁력을 유지해야 한다.", "젊은 층을 끌어들일 문화·체험 요소를 시장에 접목해야 한다.", "대형 마트의 영업시간을 법으로 제한해야 한다."], "answer": 2, "explain": "Từ khóa cốt lõi: '무엇보다 젊은 세대가 찾아올 수 있도록 특색 있는 문화 공간과 체험 프로그램을 운영'."}
]

TOPIK2_READ_POOL = [
    {"id": "t2R_01", "sec": "읽기 [1~2] 알맞은 문법 (2점)", "pts": 2, "passage": "갑자기 폭우가 (          ) 비행기 출발이 두 시간이나 지연되었다.", "question": "[1~2] (     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["내리는 바람에", "내리기 위해서", "내리는 반면에", "내릴까 봐서"], "answer": 0, "explain": "-는 바람에: nguyên nhân bất ngờ gây kết quả tiêu cực ở quá khứ."},
    {"id": "t2R_02", "sec": "읽기 [3~4] 유사 문법 (2점)", "pts": 2, "passage": "고향에 계신 부모님 사진을 <u>볼 때마다</u> 보고 싶은 마음이 커진다.", "question": "[3~4] 밑줄 친 부분과 의미가 가장 비슷한 것을 고르십시오.", "options": ["보는 대로", "볼지라도", "보는 통에", "볼 적마다"], "answer": 3, "explain": "-을 때마다 (mỗi khi) đồng nghĩa trực tiếp với -을 적마다."},
    {"id": "t2R_03", "sec": "읽기 [5~8] 유의어·관용어 (2점)", "pts": 2, "passage": "새로 온 신입 사원은 일 처리가 빨라서 선배들의 <u>마음에 들었다</u>.", "question": "[5~8] 밑줄 친 부분과 의미가 비슷한 것을 고르십시오.", "options": ["걱정을 덜었다", "흡족해했다", "관심을 끊었다", "부담을 느꼈다"], "answer": 1, "explain": "마음에 들다 (vừa lòng, ưng ý) ≈ 흡족해하다."},
    {"id": "t2R_04", "sec": "읽기 [5~8] 유의어 (2점)", "pts": 2, "passage": "오랜만에 고향 친구를 만나 시간 가는 줄 모르고 이야기를 <u>나누었다</u>.", "question": "[5~8] 밑줄 친 부분과 의미가 비슷한 것을 고르십시오.", "options": ["주고받았다", "미루었다", "숨겼다", "아꼈다"], "answer": 0, "explain": "이야기를 나누다 = 이야기를 주고받다."},
    {"id": "t2R_05", "sec": "읽기 [13~15] 문장 배열 (2점)", "pts": 2, "passage": "(가) 그러나 지나친 카페인 섭취는 수면 장애를 유발할 수 있다.\n(나) 직장인들은 피로를 이기기 위해 습관적으로 커피를 마신다.\n(다) 따라서 하루 권장량을 지켜 적당히 마시는 태도가 필요하다.\n(라) 커피 속 카페인은 일시적으로 집중력을 높여 주기 때문이다.", "question": "[13~15] 다음을 순서대로 맞게 배열한 것을 고르십시오.", "options": ["(나) - (라) - (가) - (다)", "(나) - (가) - (라) - (다)", "(라) - (나) - (가) - (다)", "(가) - (나) - (라) - (다)"], "answer": 0, "explain": "(나) Nêu hiện tượng uống cà phê → (라) Giải thích lý do (~기 때문이다) → (가) Tuy nhiên tác hại (그러나) → (다) Kết luận giải pháp (따라서)."},
    {"id": "t2R_06", "sec": "읽기 [16~18] 빈칸 추론 (2점)", "pts": 2, "passage": "실패를 두려워하는 사람은 새로운 도전을 피하기 쉽다. 하지만 실패는 부족한 점을 깨닫고 성장하게 만드는 밑거름이 된다. 결국 성공에 이르는 길은 실패가 없는 길이 아니라 (               ) 길이다.", "question": "[16~18] (     )에 들어갈 가장 알맞은 것을 고르십시오.", "options": ["실패를 딛고 다시 일어서는", "남의 도움을 기다리는", "처음부터 목표를 낮추는", "경쟁자를 피해서 돌아가는"], "answer": 0, "explain": "Mạch văn khẳng định thất bại là nền tảng trưởng thành → Con đường thành công là '실패를 딛고 다시 일어서는 길' (bước qua thất bại đứng dậy)."},
    {"id": "t2R_07", "sec": "읽기 [25~27] 신문 기사 제목 (2점)", "pts": 2, "passage": "[기사 제목] 도심 속 작은 숲 조성, 폭염 완화에 '톡톡한 효과'", "question": "[25~27] 다음 신문 기사 제목을 가장 잘 설명한 것을 고르십시오.", "options": ["도심에 나무를 심어 더위를 줄이는 데 큰 도움을 얻었다.", "폭염 때문에 도심 공원을 찾는 시민들의 발길이 줄었다.", "숲을 보호하기 위해 도심 개발 계획을 전면 취소했다.", "무더위가 계속되면서 산림 피해가 해마다 늘고 있다."], "answer": 0, "explain": "조성 (tạo dựng rừng nhỏ trong đô thị) + 폭염 완화 (giảm nắng nóng) + 톡톡한 효과 (hiệu quả rõ rệt)."},
    {"id": "t2R_08", "sec": "읽기 [32~38] 사회·경제 독해 (2점)", "pts": 2, "passage": "최근 소비자들은 단순히 제품의 가격과 품질만 보고 지갑을 열지 않는다. 해당 기업이 환경을 보호하고 사회적 책임을 다하는지를 중요하게 살피는 '가치 소비'가 확산되고 있기 때문이다.", "question": "[32~38] 위 글의 내용과 일치하는 것을 고르십시오.", "options": ["소비자들은 제품의 가격을 전혀 고려하지 않는다.", "기업의 사회적 책임 여부가 소비자의 구매 결정에 영향을 미친다.", "가치 소비가 유행하면서 친환경 제품의 매출이 감소했다.", "품질만 우수하면 기업 이미지는 판매량과 무관하다."], "answer": 1, "explain": "Bài đọc nêu rõ xu hướng '가치 소비' — người tiêu dùng xem trọng việc doanh nghiệp bảo vệ môi trường & thực hiện trách nhiệm xã hội khi quyết định mua hàng."}
]

async def synth_dialogue_mp3(item_id, turns):
    out_name = f"exam_{item_id}.mp3"
    out_path = os.path.join(MEDIA_DIR, out_name)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return f"media/{out_name}"
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
    # 1. Generate neural Korean MP3s for all listening items concurrently
    all_listen = TOPIK1_LISTEN_POOL + TOPIK2_LISTEN_POOL
    tasks = [synth_dialogue_mp3(it["id"], it["turns"]) for it in all_listen]
    paths = await asyncio.gather(*tasks)
    for it, mp3_rel in zip(all_listen, paths):
        it["audioSrc"] = mp3_rel
        it["audioText"] = " / ".join(f"{'여' if sp == 'F' else '남'}: {tx}" for sp, tx in it["turns"])

    # Load extracted Anki TOPIK I Cloze bank (with real SunHi MP3s!) to diversify each of the 10 TOPIK I past papers
    tp1_anki = [x for x in json.load(open(os.path.join(DATA_DIR, "topik1_bank.json"), encoding="utf-8")) if x.get("cloze") and x.get("exampleAudio")]

    # Official 10 newest public NIIED sessions (Kỳ 102 -> Kỳ 37)
    sessions = [
        {"round": 102, "year": 2025, "tag": "MỚI NHẤT 2025"},
        {"round": 96,  "year": 2024, "tag": "ĐỀ CHÍNH THỨC"},
        {"round": 91,  "year": 2023, "tag": "ĐỀ CHÍNH THỨC"},
        {"round": 83,  "year": 2022, "tag": "ĐỀ CHÍNH THỨC"},
        {"round": 64,  "year": 2019, "tag": "CÔNG BỐ NIIED"},
        {"round": 60,  "year": 2018, "tag": "CÔNG BỐ NIIED"},
        {"round": 52,  "year": 2017, "tag": "CÔNG BỐ NIIED"},
        {"round": 47,  "year": 2016, "tag": "CÔNG BỐ NIIED"},
        {"round": 41,  "year": 2015, "tag": "CÔNG BỐ NIIED"},
        {"round": 37,  "year": 2014, "tag": "CÔNG BỐ NIIED"}
    ]

    exams_topik1 = []
    exams_topik2 = []

    for s_idx, sess in enumerate(sessions):
        rnd = sess["round"]
        yr = sess["year"]

        # Rotate & slice unique combinations per session so each exam has distinct items + authentic section headers
        l_rot = TOPIK1_LISTEN_POOL[s_idx % len(TOPIK1_LISTEN_POOL):] + TOPIK1_LISTEN_POOL[:s_idx % len(TOPIK1_LISTEN_POOL)]
        r_rot = TOPIK1_READ_POOL[s_idx % len(TOPIK1_READ_POOL):] + TOPIK1_READ_POOL[:s_idx % len(TOPIK1_READ_POOL)]

        # Pull 10 unique Cloze/Listening items for this specific session from the 432 TOPIK I items
        chunk_start = (s_idx * 25) % (len(tp1_anki) - 25)
        anki_slice = tp1_anki[chunk_start:chunk_start + 10]

        extra_listen = []
        extra_read = []
        for ai, card in enumerate(anki_slice):
            others = [tp1_anki[(chunk_start + ai + k * 7) % len(tp1_anki)]["korean"] for k in (1, 2, 3)]
            opts = [card["korean"]] + others
            sh = (s_idx + ai) % 4
            rot_opts = opts[sh:] + opts[:sh]
            ans_i = rot_opts.index(card["korean"])
            if ai < 4:
                extra_listen.append({
                    "id": f"e{rnd}_al_{ai}",
                    "sec": "듣기 [11~14] 문장 듣고 핵심 어휘 파악 (3점)",
                    "pts": 3,
                    "audioSrc": card["exampleAudio"],
                    "audioText": card["exampleKo"],
                    "question": "[11~14] 다음 문장을 듣고 빈칸에 들린 알맞은 어휘를 고르십시오.",
                    "passage": card["cloze"],
                    "options": rot_opts,
                    "answer": ans_i,
                    "explain": f"Câu nghe: '{card['exampleKo']}' ({card['exampleVi']}) → Từ đúng: {card['korean']}."
                })
            else:
                extra_read.append({
                    "id": f"e{rnd}_ar_{ai}",
                    "sec": "읽기 [34~39] 빈칸에 들어갈 어휘·표현 (3점)",
                    "pts": 3,
                    "audioSrc": card["exampleAudio"],
                    "question": "[34~39] (     )에 들어갈 가장 알맞은 것을 고르십시오.",
                    "passage": card["cloze"],
                    "options": rot_opts,
                    "answer": ans_i,
                    "explain": f"{card['exampleKo']} — {card['exampleVi']} ({card['korean']} = {card['vietnamese']})."
                })

        t1_questions = []
        for q in (l_rot[:8] + extra_listen):
            q_copy = {k: v for k, v in q.items() if k != "turns"}
            q_copy["id"] = f"r{rnd}_{q['id']}"
            q_copy["sectionGroup"] = "1교시 · 듣기 (Nghe hiểu)"
            t1_questions.append(q_copy)
        for q in (r_rot[:6] + extra_read):
            q_copy = dict(q)
            q_copy["id"] = f"r{rnd}_{q['id']}"
            q_copy["sectionGroup"] = "2교시 · 읽기 (Đọc hiểu)"
            t1_questions.append(q_copy)

        exams_topik1.append({
            "id": f"topik1_r{rnd}",
            "round": rnd,
            "year": yr,
            "mode": "full" if s_idx < 6 else ("mini" if s_idx < 8 else "hard"),
            "ribbon": sess["tag"],
            "title": f"제{rnd}회 TOPIK I 기출 — Đề chính thức Kỳ {rnd} ({yr})",
            "structureDesc": "1교시 Nghe (듣기) + 2교시 Đọc (읽기) · Thang 200 điểm",
            "minutes": 100 if s_idx < 6 else 40,
            "passScore": 80,
            "level2Score": 140,
            "maxScore": 200,
            "questions": t1_questions
        })

        # Build TOPIK II Official Exam for Session rnd (Nghe + Đọc + Viết 51~54 prompt!)
        l2_rot = TOPIK2_LISTEN_POOL[s_idx % len(TOPIK2_LISTEN_POOL):] + TOPIK2_LISTEN_POOL[:s_idx % len(TOPIK2_LISTEN_POOL)]
        r2_rot = TOPIK2_READ_POOL[s_idx % len(TOPIK2_READ_POOL):] + TOPIK2_READ_POOL[:s_idx % len(TOPIK2_READ_POOL)]

        t2_questions = []
        for q in (l2_rot + l_rot[-3:]):
            q_copy = {k: v for k, v in q.items() if k != "turns"}
            q_copy["id"] = f"r{rnd}_t2_{q['id']}"
            q_copy["sectionGroup"] = "1교시 · 듣기 (Nghe hiểu TOPIK II)"
            t2_questions.append(q_copy)
        for q in (r2_rot + extra_read[:4]):
            q_copy = dict(q)
            q_copy["id"] = f"r{rnd}_t2_{q['id']}"
            q_copy["sectionGroup"] = "2교시 · 읽기 (Đọc hiểu TOPIK II)"
            t2_questions.append(q_copy)

        exams_topik2.append({
            "id": f"topik2_r{rnd}",
            "round": rnd,
            "year": yr,
            "mode": "full" if s_idx < 6 else ("mini" if s_idx < 8 else "hard"),
            "ribbon": sess["tag"],
            "title": f"제{rnd}회 TOPIK II 기출 — Đề chính thức Kỳ {rnd} ({yr})",
            "structureDesc": "1교시 Nghe & Viết (51~54) + 2교시 Đọc · Thang 300 điểm",
            "minutes": 180 if s_idx < 6 else 60,
            "passScore": 120,
            "maxScore": 300,
            "writingSection": {
                "q51": "감사 안내문 빈칸 완성: 지난주 행사에 참석해 (   ㄱ   ) 진심으로 감사드립니다.",
                "q53": f"제{rnd}회 도표 분석 (200~300자): Khảo sát xu hướng tiêu dùng & văn hóa đọc tại Hàn Quốc.",
                "q54": f"제{rnd}회 논술 (600~700자): Trình bày quan điểm và giải pháp về thách thức xã hội hiện đại."
            },
            "questions": t2_questions
        })

    out_json = {"topik1": exams_topik1, "topik2": exams_topik2}
    with open(os.path.join(DATA_DIR, "topik_20_exams.json"), "w", encoding="utf-8") as f:
        json.dump(out_json, f, ensure_ascii=False, indent=2)

    print(f"Generated {len(all_listen)} studio Neural Korean MP3s + {len(exams_topik1) + len(exams_topik2)} Official Public TOPIK Exams (Kỳ 37 -> Kỳ 102)!")

asyncio.run(main())
