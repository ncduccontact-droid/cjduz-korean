import { store, playAudio, speakKoreanTTS } from "./store.js?v=20261127-06";
import { analyzePronunciationRules } from "./korean-engine.js?v=20261127-06";
import { ico } from "./icons.js?v=20261127-06";

// Curated Real YouTube Shorts Shadowing Library (from 6F0uUJgeJQI, @Tienghanvoihailey & @hongtuoissem)
export const YOUTUBE_SHORTS_CLIPS = [
  {
    id: "yt_6F0uUJgeJQI",
    videoId: "6F0uUJgeJQI",
    channel: "@Tienghanvoihailey",
    level: "Trung cấp · K-Drama Truyền cảm hứng",
    title: "Nỗ lực & Kết quả (니가 꼴등이면 왜? 부끄러워?)",
    lines: [
      { start: 0.0, end: 2.1, ko: "니가 꼴등이면 왜? 부끄러워?", romaja: "ni-ga kkol-deung-i-myeon wae? bu-kkeu-reo-wo?", vi: "Nếu cậu đứng bét thì sao? Xấu hổ à?", keyWord: "부끄러워" },
      { start: 2.1, end: 3.3, ko: "넌 안 부끄러워?", romaja: "neon an bu-kkeu-reo-wo?", vi: "Cậu không thấy xấu hổ à?", keyWord: "부끄러워" },
      { start: 3.3, end: 6.1, ko: "응 노력 안 했으니까 당연한 결과지", romaja: "eung no-ryeok an haess-eu-ni-kka dang-yeon-han gyeol-gwa-ji", vi: "Ừ, vì đã không nỗ lực nên đó là kết quả hiển nhiên thôi.", keyWord: "노력" },
      { start: 6.1, end: 11.5, ko: "노력도 안 해놓고 잘하길 바라는 게 더 부끄럽지 않나?", romaja: "no-ryeok-do an hae-no-ko jal-ha-gil ba-ra-neun ge deo bu-kkeu-reop-ji an-na?", vi: "Chẳng nỗ lực mà lại mong làm tốt, chẳng phải điều đó còn đáng xấu hổ hơn sao?", keyWord: "바라는" }
    ],
    glossary: {
      "니가": "cậu, bạn (văn nói thân mật của 네가)",
      "꼴등이면": "꼴등 (đứng bét, hạng chót) + -(으)면 (nếu là)",
      "부끄러워": "xấu hổ, ngại ngùng (gốc: 부끄럽다 - bất quy tắc ㅂ)",
      "노력": "nỗ lực, sự cố gắng (Nỗ lực)",
      "했으니까": "vì đã làm (-았/었으니까)",
      "당연한": "đương nhiên, hiển nhiên (당연하다)",
      "결과지": "결과 (kết quả) + -지 (chứ còn gì nữa)",
      "해놓고": "làm sẵn / để mặc như vậy (-아/어 놓다)",
      "잘하길": "잘하다 (làm tốt) + -기를 (mong việc...)",
      "바라는": "mong muốn, kỳ vọng (gốc: 바라다)",
      "부끄럽지": "đáng xấu hổ (-지 않다: chẳng phải ... sao?)"
    }
  },
  {
    id: "yt_Y8_Lot_iiGE",
    videoId: "Y8_Lot_iiGE",
    channel: "@Tienghanvoihailey",
    level: "Trung – Cao cấp · Diễn thuyết động lực",
    title: "Thế giới thuộc về người lạc quan (낙관하는 사람들)",
    lines: [
      { start: 0.0, end: 3.4, ko: "세상은 믿는 사람들 낙관하는 사람들의 것이라고 믿습니다.", romaja: "se-sang-eun min-neun sa-ram-deul nak-gwan-ha-neun sa-ram-deul-ui geos-i-ra-go mit-seum-ni-da", vi: "Tôi tin rằng thế giới thuộc về những người có niềm tin, những người lạc quan.", keyWord: "믿습니다" },
      { start: 3.4, end: 7.2, ko: "비관하고 그래 내 말이 맞지 내가 맞췄어 하는 삶보다", romaja: "bi-gwan-ha-go geu-rae nae mal-i mat-ji nae-ga mat-chwoss-eo ha-neun sam-bo-da", vi: "Thay vì sống bi quan kiểu 'Thấy chưa, lời tôi nói đúng mà, tôi đoán chuẩn rồi'...", keyWord: "삶보다" },
      { start: 7.2, end: 12.1, ko: "낙관하고 틀리고 깨지고 그렇게 계속 도전하는 삶이 더 멋있다고 믿습니다.", romaja: "nak-gwan-ha-go teul-li-go kkae-ji-go geu-reo-ke gye-sok do-jeon-ha-neun sam-i deo meos-it-da-go mit-seum-ni-da", vi: "Tôi tin sống lạc quan, sai lầm, vấp ngã rồi vẫn tiếp tục thử thách mới tuyệt vời hơn.", keyWord: "도전하는" },
      { start: 12.1, end: 14.3, ko: "절대 한 치의 의심도 하지 마십시오.", romaja: "jeol-dae han chi-ui ui-sim-do ha-ji ma-sip-si-o", vi: "Tuyệt đối đừng nghi ngờ dù chỉ một chút.", keyWord: "의심도" },
      { start: 14.3, end: 18.0, ko: "그리고 한 치의 의심도 심지 마십시오.", romaja: "geu-ri-go han chi-ui ui-sim-do sim-ji ma-sip-si-o", vi: "Và cũng đừng gieo rắc dù chỉ một chút nghi ngờ.", keyWord: "심지" }
    ],
    glossary: {
      "세상은": "thế giới, cuộc đời (Thế thượng)",
      "믿는": "tin tưởng (gốc: 믿다)",
      "낙관하는": "lạc quan (Lạc quan - 낙관하다)",
      "비관하고": "bi quan (Bi quan - 비관하다)",
      "삶보다": "삶 (cuộc sống) + -보다 (so với)",
      "틀리고": "sai lầm (틀리다)",
      "깨지고": "vấp ngã, vỡ vụn (깨지다)",
      "도전하는": "thử thách, dấn thân (Khiêu chiến - 도전하다)",
      "멋있다고": "ngầu, tuyệt vời (멋있다)",
      "절대": "tuyệt đối (Tuyệt đối)",
      "의심도": "sự nghi ngờ (Nghi tâm - 의심)",
      "심지": "gieo trồng, gieo rắc (gốc: 심다)"
    }
  },
  {
    id: "yt_2_jBkoGqr-E",
    videoId: "2_jBkoGqr-E",
    channel: "@Tienghanvoihailey",
    level: "Sơ – Trung cấp · Jungkook (BTS)",
    title: "Tự tạo ước mơ của riêng mình (꿈을 향하여 파이팅!)",
    lines: [
      { start: 0.0, end: 5.8, ko: "공부는 해야 돼. 너무 공부에만 시달리지 말라는 그런 말이지.", romaja: "gong-bu-neun hae-ya dwae. neo-mu gong-bu-e-man si-dal-li-ji mal-la-neun geu-reon mal-i-ji", vi: "Học thì phải học chứ. Nhưng ý là đừng để việc học hành giày vò mình quá thôi.", keyWord: "공부는" },
      { start: 5.8, end: 8.3, ko: "그러다가 본인이 하고 싶은 걸 놓칠 수가 있어.", romaja: "geu-reo-da-ga bon-in-i ha-go sip-eun geol no-chil su-ga iss-eo", vi: "Cứ như thế thì có thể đánh mất điều bản thân thực sự muốn làm.", keyWord: "놓칠" },
      { start: 8.3, end: 14.0, ko: "자기가 스스로 꿈을 만들어야지 주위의 강요에 의해서", romaja: "ja-gi-ga seu-seu-ro kkum-eul man-deul-eo-ya-ji ju-wi-ui gang-yo-e ui-hae-seo", vi: "Mình phải tự tay tạo nên ước mơ, chứ không phải do sự ép buộc từ xung quanh...", keyWord: "스스로" },
      { start: 14.0, end: 17.8, ko: "꿈을 못 만들게 되면 참 마음이 아픈 것 같아.", romaja: "kkum-eul mot man-deul-ge doe-myeon cham ma-eum-i a-peun geot gat-a", vi: "Nếu không thể tạo nên ước mơ thì thật sự đau lòng lắm.", keyWord: "마음이" },
      { start: 17.8, end: 22.0, ko: "꿈을 향하여 꿈을 향하여 파이팅!", romaja: "kkum-eul hyang-ha-yeo kkum-eul hyang-ha-yeo pa-i-ting!", vi: "Hướng về ước mơ, hướng về ước mơ, cố lên!", keyWord: "향하여" }
    ],
    glossary: {
      "공부는": "việc học (Công phu)",
      "시달리지": "bị đè nặng, bị giày vò (시달리다)",
      "본인이": "bản thân mình (Bản nhân - 본인)",
      "놓칠": "bỏ lỡ, tuột mất (gốc: 놓치다)",
      "스스로": "tự mình, tự thân",
      "꿈을": "ước mơ, giấc mơ (꿈)",
      "주위의": "của xung quanh (Chu vi - 주위)",
      "강요에": "sự ép buộc (Cưỡng yêu - 강요)",
      "마음이": "tấm lòng, trái tim (마음이 아프다: đau lòng)",
      "향하여": "hướng về phía (향하다)"
    }
  },
  {
    id: "yt_LZBiMXwja5A",
    videoId: "LZBiMXwja5A",
    channel: "@hongtuoissem",
    level: "Sơ cấp · Podcast Chậm rõ",
    title: "Chủ đề 주말 · Cuối tuần gặp bạn đại học ở Ikseon-dong",
    lines: [
      { start: 0.0, end: 5.5, ko: "그리고 저녁에 대학 동기들을 만났어요.", romaja: "geu-ri-go jeo-nyeok-e dae-hak dong-gi-deul-eul man-nass-eo-yo", vi: "Và vào buổi tối hôm đó, tôi đã gặp những người bạn cùng khóa đại học.", keyWord: "만났어요" },
      { start: 5.5, end: 11.0, ko: "익선동에서 만났어요. 맛있는 음식도 먹고 이야기했어요.", romaja: "ik-seon-dong-e-seo man-nass-eo-yo. mas-in-neun eum-sik-do meok-go i-ya-gi-haess-eo-yo", vi: "Chúng tôi gặp nhau ở Ikseon-dong, vừa ăn món ngon vừa trò chuyện.", keyWord: "익선동에서" }
    ],
    glossary: {
      "그리고": "và, sau đó",
      "저녁에": "vào buổi tối",
      "대학": "đại học (Đại học)",
      "동기들을": "những người bạn cùng khóa (Đồng kỳ - 동기)",
      "만났어요": "đã gặp gỡ (gốc: 만나다)",
      "익선동에서": "ở khu phố cổ Ikseon-dong (Seoul)",
      "맛있는": "ngon miệng (맛있다)",
      "음식도": "món ăn cũng (Ẩm thực - 음식)"
    }
  },
  {
    id: "yt_x3zSfdZFQVQ",
    videoId: "x3zSfdZFQVQ",
    channel: "@hongtuoissem",
    level: "Sơ cấp 1 · Thói quen hằng ngày",
    title: "Chủ đề 루틴 · Thói quen uống cà phê Americano đá",
    lines: [
      { start: 0.0, end: 4.0, ko: "그리고 아침에 커피 마셔요.", romaja: "geu-ri-go a-chim-e keo-pi ma-syeo-yo", vi: "Và vào buổi sáng tôi uống cà phê.", keyWord: "마셔요" },
      { start: 4.0, end: 8.5, ko: "저는 아이스 아메리카노를 좋아해요.", romaja: "jeo-neun a-i-seu a-me-ri-ka-no-reul jo-a-hae-yo", vi: "Tôi thích món cà phê Americano đá.", keyWord: "좋아해요" },
      { start: 8.5, end: 13.0, ko: "여러분은 무슨 커피 좋아해요?", romaja: "yeo-reo-bun-eun mu-seun keo-pi jo-a-hae-yo?", vi: "Mọi người thích loại cà phê nào vậy?", keyWord: "무슨" }
    ],
    glossary: {
      "아침에": "vào buổi sáng",
      "커피": "cà phê",
      "마셔요": "uống (gốc: 마시다)",
      "아이스": "đá lạnh (Ice)",
      "좋아해요": "thích, yêu thích (좋아하다)",
      "여러분은": "các bạn, mọi người thì",
      "무슨": "loại gì, nào (đứng trước danh từ)"
    }
  }
];

let ytApiPromise = null;
function ensureYouTubeIframeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return ytApiPromise;
}

function fmtSec(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
}

export function renderShortsShadowingStudio(stage, db, onSwitchToTextbookShadowing) {
  const allClips = [...YOUTUBE_SHORTS_CLIPS, ...(store.state.customYoutubeClips || [])];
  let clipIdx = 0;
  let studyMode = "subtitle"; // subtitle | shadowing | dictation | cloze
  let showRomaja = false;
  let showVi = true;
  let loopCurrentLine = false;
  let playbackSpeed = 1.0;
  let activeLineIdx = 0;
  let activeWordIdx = -1;
  let dictPopup = null; // { word, stem, meaning, pron, matchCard }
  let addingClipModal = false;
  let sttResult = "";
  let isRec = false;
  let player = null;
  let syncTimer = null;

  // Build fast Korean dictionary map from all 1,100+ extracted cards
  const vocabMap = new Map();
  [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank].forEach((w) => {
    if (!vocabMap.has(w.korean)) vocabMap.set(w.korean, w);
  });

  function cleanupPlayer() {
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = null;
    if (player && typeof player.destroy === "function") {
      try { player.destroy(); } catch {}
    }
    player = null;
  }

  function lookupWord(rawToken, clipGlossary = {}) {
    const clean = rawToken.replace(/[.,?!""''~]/g, "").trim();
    const stripped = clean.replace(/(에서는|에서|으로|부터|까지|이라서|라서|이면|면|은|는|이|가|을|를|에|와|과|도|만|의)$/, "");
    const pron = analyzePronunciationRules(clean);

    if (clipGlossary[clean]) {
      return { word: clean, meaning: clipGlossary[clean], pron, matchCard: vocabMap.get(clean) || vocabMap.get(stripped) || null };
    }
    if (clipGlossary[stripped]) {
      return { word: `${clean} (gốc: ${stripped})`, meaning: clipGlossary[stripped], pron, matchCard: vocabMap.get(stripped) || null };
    }
    if (vocabMap.has(clean)) {
      const c = vocabMap.get(clean);
      return { word: clean, meaning: c.vietnamese, pron, matchCard: c };
    }
    if (vocabMap.has(stripped)) {
      const c = vocabMap.get(stripped);
      return { word: `${clean} (gốc: ${stripped})`, meaning: c.vietnamese, pron, matchCard: c };
    }
    return {
      word: clean,
      meaning: "Từ hội thoại mở rộng — bấm nút Loa để nghe phát âm chậm rõ từng âm tiết.",
      pron,
      matchCard: null
    };
  }

  function mountYouTubePlayer(clip) {
    cleanupPlayer();
    ensureYouTubeIframeAPI().then((YT) => {
      const slot = stage.querySelector("#yt-shorts-mount");
      if (!slot) return;
      player = new YT.Player("yt-shorts-mount", {
        videoId: clip.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            const iframe = stage.querySelector("#yt-shorts-mount");
            if (iframe) iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
            if (player.setPlaybackRate) player.setPlaybackRate(playbackSpeed);
          }
        }
      });

      syncTimer = setInterval(() => {
        if (!document.body.contains(stage)) {
          cleanupPlayer();
          return;
        }
        if (!player || typeof player.getCurrentTime !== "function" || typeof player.getPlayerState !== "function") return;
        const st = player.getPlayerState();
        if (st !== 1) return; // Only sync when playing (1 = YT.PlayerState.PLAYING)

        const t = player.getCurrentTime();
        const line = clip.lines[activeLineIdx];

        // Handle A-B sentence loop if enabled!
        if (loopCurrentLine && line && t >= line.end) {
          player.seekTo(line.start, true);
          return;
        }

        const foundIdx = clip.lines.findIndex((l) => t >= l.start && t < l.end);
        if (foundIdx >= 0) {
          const ln = clip.lines[foundIdx];
          const words = ln.ko.split(/\s+/);
          const ratio = Math.min(0.999, Math.max(0, (t - ln.start) / Math.max(0.2, ln.end - ln.start)));
          const wIdx = Math.floor(ratio * words.length);

          if (foundIdx !== activeLineIdx || wIdx !== activeWordIdx) {
            activeLineIdx = foundIdx;
            activeWordIdx = wIdx;
            updateLiveHighlightDOM(clip);
          }
        }
      }, 110);
    });
  }

  // Fast DOM class update without re-mounting the YouTube iframe!
  function updateLiveHighlightDOM(clip) {
    stage.querySelectorAll(".shorts-line-card").forEach((el, idx) => {
      const isAct = idx === activeLineIdx;
      el.classList.toggle("active", isAct);
      el.querySelectorAll(".shorts-word").forEach((wEl, wi) => {
        wEl.classList.toggle("spoken-now", isAct && wi === activeWordIdx);
      });
      if (isAct) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
    const liveCap = stage.querySelector("#live-overlay-caption");
    if (liveCap && clip.lines[activeLineIdx]) {
      liveCap.textContent = clip.lines[activeLineIdx].ko;
    }
  }

  function renderDictionaryCard(clip) {
    const slot = stage.querySelector("#shorts-dict-drawer");
    if (!slot) return;
    if (!dictPopup) {
      slot.innerHTML = `
        <div style="font-size:13px;color:#94A3B8;padding:8px 4px;display:flex;align-items:center;gap:6px;">
          ${ico("bulb", 16)} <span><strong>Bấm vào bất kỳ từ tiếng Hàn nào</strong> trong phụ đề bên dưới — video sẽ <strong>tự động tạm dừng</strong> và mở từ điển giải nghĩa ngay tại chỗ!</span>
        </div>
      `;
      return;
    }

    const rawWord = dictPopup.word.split("(")[0].trim();
    slot.innerHTML = `
      <div style="background:#0F292A;border:1.5px solid var(--primary);border-radius:14px;padding:12px 16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong class="ko" style="font-size:20px;color:#FFD769;">${dictPopup.word}</strong>
            ${dictPopup.pron?.hasChange ? `<span class="ko" style="font-size:13px;background:rgba(254,154,5,0.2);color:#FDBA74;padding:2px 8px;border-radius:99px;">[${dictPopup.pron.pronounced}]</span>` : ""}
          </div>
          <div style="font-size:14.5px;color:#FFFFFF;font-weight:600;margin-top:3px;">Nghĩa: ${dictPopup.meaning}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button type="button" class="btn-outline-teal" id="dict-speak-word" style="padding:5px 12px;font-size:13px;">${ico("speaker", 16)} Phát âm từ</button>
          ${dictPopup.matchCard ? `<button type="button" class="btn-orange" id="dict-save-word" style="padding:5px 12px;font-size:13px;">${ico("star", 15)} Lưu từ</button>` : ""}
          <button type="button" class="btn-primary" id="dict-resume-vid" style="padding:6px 14px;font-size:13px;">${ico("play", 15)} Xem tiếp clip</button>
        </div>
      </div>
    `;

    slot.querySelector("#dict-speak-word").addEventListener("pointerdown", () => {
      if (dictPopup.matchCard?.wordAudio) playAudio(dictPopup.matchCard.wordAudio);
      else speakKoreanTTS(rawWord, 0.9);
    });
    slot.querySelector("#dict-save-word")?.addEventListener("click", (e) => {
      store.toggleStar(dictPopup.matchCard.id);
      e.currentTarget.innerHTML = `${ico("check", 14)} Đã lưu!`;
    });
    slot.querySelector("#dict-resume-vid").addEventListener("click", () => {
      dictPopup = null;
      renderDictionaryCard(clip);
      if (player && typeof player.playVideo === "function") player.playVideo();
    });
  }

  function renderTranscriptList(clip) {
    const listEl = stage.querySelector("#shorts-lines-container");
    if (!listEl) return;

    if (studyMode === "subtitle" || studyMode === "shadowing") {
      listEl.innerHTML = clip.lines.map((ln, li) => `
        <div class="shorts-line-card ${li === activeLineIdx ? "active" : ""}" data-line-idx="${li}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-family:monospace;font-size:12px;color:#38BDF8;background:rgba(56,189,248,0.12);padding:2px 7px;border-radius:6px;">
              ${fmtSec(ln.start)}
            </span>
            <div style="display:flex;gap:6px;">
              <button type="button" data-seek-line="${li}" style="background:rgba(255,255,255,0.1);color:#FFF;border:none;border-radius:6px;padding:3px 9px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
                ${ico("play", 13)} Nghe câu này
              </button>
              ${studyMode === "shadowing" ? `
                <button type="button" data-rec-line="${li}" style="background:var(--yellow-2);color:#FFF;border:none;border-radius:6px;padding:3px 9px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
                  ${ico("mic", 13)} Nhại theo
                </button>
              ` : ""}
            </div>
          </div>

          <div class="ko" style="font-size:18.5px;font-weight:700;color:#FFFFFF;line-height:1.6;">
            ${ln.ko.split(/\s+/).map((tok, wi) => `
              <span class="shorts-word ${li === activeLineIdx && wi === activeWordIdx ? "spoken-now" : ""}" data-word="${tok}">${tok}</span>
            `).join(" ")}
          </div>

          ${showRomaja && ln.romaja ? `<div style="font-size:12.5px;color:#93C5FD;margin-top:2px;">${ln.romaja}</div>` : ""}
          ${showVi ? `<div style="font-size:14px;color:#94A3B8;margin-top:3px;">${ln.vi}</div>` : ""}
        </div>
      `).join("");

      listEl.querySelectorAll("[data-seek-line]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          activeLineIdx = Number(btn.dataset.seekLine);
          const ln = clip.lines[activeLineIdx];
          if (player && typeof player.seekTo === "function") {
            player.seekTo(ln.start, true);
            player.playVideo();
          }
          updateLiveHighlightDOM(clip);
        });
      });

      listEl.querySelectorAll(".shorts-word").forEach((wSpan) => {
        wSpan.addEventListener("click", (e) => {
          e.stopPropagation();
          if (player && typeof player.pauseVideo === "function") {
            player.pauseVideo();
          }
          dictPopup = lookupWord(wSpan.dataset.word, clip.glossary || {});
          renderDictionaryCard(clip);
        });
      });

      listEl.querySelectorAll("[data-rec-line]").forEach((recBtn) => {
        recBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          activeLineIdx = Number(recBtn.dataset.recLine);
          if (player && typeof player.pauseVideo === "function") player.pauseVideo();
          const targetKo = clip.lines[activeLineIdx].ko;
          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SR) {
            sttResult = "Trình duyệt chưa bật nhận diện giọng nói (Khuyến nghị dùng Chrome).";
            renderSpeechStatus();
            return;
          }
          const rec = new SR();
          rec.lang = "ko-KR";
          isRec = true;
          sttResult = `${ico("mic", 15)} Đang nghe bạn đọc nhại theo câu...`;
          renderSpeechStatus();
          rec.onresult = (ev) => {
            const spoken = ev.results[0][0].transcript;
            isRec = false;
            sttResult = `Bạn vừa đọc: "${spoken}" — Câu chuẩn: "${targetKo}"`;
            renderSpeechStatus();
          };
          rec.onerror = () => { isRec = false; sttResult = "Không nghe rõ giọng đọc, hãy bấm nút Nhại theo để thử lại nhé."; renderSpeechStatus(); };
          rec.start();
        });
      });
    } else if (studyMode === "dictation") {
      const ln = clip.lines[activeLineIdx] || clip.lines[0];
      listEl.innerHTML = `
        <div style="background:rgba(255,255,255,0.06);border-radius:14px;padding:18px;">
          <div style="font-size:13px;color:#38BDF8;font-weight:700;margin-bottom:6px;">CHẾ ĐỘ CHÍNH TẢ · CÂU ${activeLineIdx + 1}/${clip.lines.length} (${fmtSec(ln.start)})</div>
          <div style="font-size:15px;color:#CBD5E1;margin-bottom:12px;">Nghĩa tiếng Việt: <strong>${ln.vi}</strong></div>
          <div style="display:flex;gap:8px;margin-bottom:12px;">
            <button type="button" class="btn-primary" id="dict-replay-seg">${ico("refresh", 16)} Phát đoạn này trong Clip</button>
            <button type="button" class="btn-outline-teal" id="dict-next-seg" style="background:transparent;color:#FFF;">Câu tiếp →</button>
          </div>
          <input id="shorts-dict-inp" class="ko" placeholder="Gõ lại câu tiếng Hàn nhân vật vừa nói..." style="width:100%;padding:11px 14px;border-radius:10px;border:1.5px solid var(--primary);background:#0F172A;color:#FFF;font-size:17px;" />
          <div id="shorts-dict-fb" style="margin-top:10px;font-size:14px;"></div>
        </div>
      `;
      listEl.querySelector("#dict-replay-seg").addEventListener("click", () => {
        loopCurrentLine = true;
        if (player?.seekTo) { player.seekTo(ln.start, true); player.playVideo(); }
      });
      listEl.querySelector("#dict-next-seg").addEventListener("click", () => {
        activeLineIdx = (activeLineIdx + 1) % clip.lines.length;
        renderTranscriptList(clip);
      });
      listEl.querySelector("#shorts-dict-inp").addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229) return;
        if (e.key === "Enter") {
          const fb = listEl.querySelector("#shorts-dict-fb");
          fb.innerHTML = `<span style="color:#FFD769;">Đáp án chuẩn trong clip: <strong class="ko">${ln.ko}</strong></span>`;
        }
      });
    } else if (studyMode === "cloze") {
      listEl.innerHTML = clip.lines.map((ln, li) => {
        const kw = ln.keyWord || ln.ko.split(/\s+/)[0];
        const blanked = ln.ko.replace(kw, " [ ______ ] ");
        return `
          <div class="shorts-line-card" data-line-idx="${li}">
            <div style="font-size:12px;color:#38BDF8;margin-bottom:4px;">${fmtSec(ln.start)} · ${ln.vi}</div>
            <div class="ko" style="font-size:17.5px;font-weight:700;color:#FFF;margin-bottom:8px;">${blanked}</div>
            <div style="display:flex;gap:8px;align-items:center;">
              <input class="ko" data-cloze-ans="${kw}" placeholder="Điền từ bị ẩn..." style="padding:6px 12px;border-radius:8px;border:1px solid #475569;background:#0F172A;color:#FFF;font-size:15px;" />
              <button type="button" data-reveal="${kw}" style="background:rgba(255,255,255,0.12);color:#FFD769;border:none;border-radius:8px;padding:6px 10px;font-size:12.5px;cursor:pointer;">Xem từ</button>
            </div>
          </div>
        `;
      }).join("");
      listEl.querySelectorAll("[data-cloze-ans]").forEach((inp) => {
        inp.addEventListener("input", () => {
          if (inp.value.trim() === inp.dataset.clozeAns) {
            inp.style.borderColor = "var(--success)";
            inp.style.color = "#4ADE80";
          }
        });
      });
      listEl.querySelectorAll("[data-reveal]").forEach((b) => {
        b.addEventListener("click", () => {
          b.previousElementSibling.value = b.dataset.reveal;
          b.previousElementSibling.style.borderColor = "var(--yellow-2)";
        });
      });
    }
  }

  function renderSpeechStatus() {
    const sEl = stage.querySelector("#shorts-stt-bar");
    if (sEl) {
      sEl.innerHTML = sttResult ? `<div class="ko" style="margin-top:10px;padding:8px 12px;border-radius:8px;background:rgba(0,178,165,0.2);color:#A7F3D0;font-size:13.5px;">${sttResult}</div>` : "";
    }
  }

  function renderFullStudio() {
    const clips = [...YOUTUBE_SHORTS_CLIPS, ...(store.state.customYoutubeClips || [])];
    const clip = clips[clipIdx % clips.length];

    stage.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;width:100%;max-width:100%;min-width:0;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;min-width:0;max-width:100%;flex:1 1 260px;">
          <strong style="display:inline-flex;align-items:center;gap:6px;">${ico("video", 19)} Chọn Clip YouTube Shorts:</strong>
          <select id="shorts-clip-select" class="box-select" style="flex:1 1 220px;min-width:0;max-width:100%;">
            ${clips.map((c, i) => `<option value="${i}" ${i === clipIdx ? "selected" : ""}>[${c.channel}] ${c.title}</option>`).join("")}
          </select>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;max-width:100%;">
          <button type="button" class="btn-outline-teal" id="btn-add-yt-clip" style="padding:6px 13px;font-size:13px;">${ico("plus", 15)} Thêm Clip YouTube</button>
          <button type="button" class="btn-outline-teal" id="btn-switch-kyuri-shadow" style="padding:6px 13px;font-size:13px;">${ico("book", 15)} Shadowing Sơ cấp 1 (Kyuri)</button>
        </div>
      </div>

      ${addingClipModal ? `
        <div class="box-kind" style="margin-bottom:18px;border-color:rgba(13,148,136,0.38);">
          <h3 style="margin:0 0 8px;font-size:17px;">Thêm Clip YouTube Shorts mới kèm phụ đề tự chạy</h3>
          <div class="grid-2" style="gap:10px;margin-bottom:10px;">
            <input id="new-yt-url" placeholder="Dán link YouTube Shorts (VD: https://youtube.com/shorts/6F0uUJgeJQI)..." style="padding:9px 14px;" />
            <input id="new-yt-title" placeholder="Tiêu đề bài học của clip..." style="padding:9px 14px;" />
          </div>
          <textarea id="new-yt-subs" rows="4" class="ko" placeholder="Mỗi dòng theo mẫu: Giây_bắt_đầu | Câu tiếng Hàn | Nghĩa tiếng Việt\nVí dụ:\n0 | 안녕하세요 여러분 | Xin chào mọi người\n3 | 오늘 같이 한국어 공부해요 | Hôm nay cùng học tiếng Hàn nhé" style="width:100%;padding:10px;margin-bottom:10px;"></textarea>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn-primary" id="btn-save-new-clip">Lưu Clip vào tài khoản</button>
            <button type="button" class="btn-outline-teal" id="btn-cancel-new-clip">Đóng</button>
          </div>
        </div>
      ` : ""}

      <div class="shorts-studio-grid">
        <!-- LEFT: 9:16 Vertical YouTube Shorts Player + Playback Controls -->
        <div class="shorts-player-frame">
          <div class="shorts-video-wrap">
            <div id="yt-shorts-mount"></div>
          </div>
          <div id="live-overlay-caption" class="ko" style="text-align:center;font-weight:700;color:#FFD769;font-size:15px;margin-top:10px;min-height:24px;">
            ${clip.lines[0]?.ko || ""}
          </div>
          <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:10px;">
            <button type="button" id="ctrl-play-pause" style="background:var(--primary);color:#FFF;border:none;border-radius:99px;padding:7px 15px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:5px;">
              ${ico("play", 15)} Phát / Tạm dừng
            </button>
            <button type="button" id="ctrl-loop-line" style="background:${loopCurrentLine ? "var(--yellow-2)" : "rgba(255,255,255,0.14)"};color:#FFF;border:none;border-radius:99px;padding:7px 12px;font-size:12.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:5px;">
              ${ico("refresh", 15)} ${loopCurrentLine ? "Đang lặp câu" : "Lặp câu"}
            </button>
            <button type="button" id="ctrl-speed" style="background:rgba(255,255,255,0.14);color:#FFF;border:none;border-radius:99px;padding:7px 12px;font-size:12.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:5px;">
              ${ico("turtle", 16)} ${playbackSpeed}x
            </button>
          </div>
        </div>

        <!-- RIGHT: Miraa / 6F0uUJgeJQI Dark-Mode Synced Bilingual Transcript & Instant Dictionary -->
        <div class="shorts-transcript-panel">
          <!-- Mode Pills + Display Toggles -->
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${[
                { k: "subtitle", label: "Phụ đề" },
                { k: "shadowing", label: `${ico("mic", 14)} Shadowing` },
                { k: "dictation", label: "Chính tả" },
                { k: "cloze", label: "Điền từ" }
              ].map((m) => `
                <button type="button" data-smode="${m.k}" style="background:${studyMode === m.k ? "var(--primary)" : "rgba(255,255,255,0.08)"};color:#FFF;border:none;border-radius:99px;padding:6px 14px;font-size:13px;font-weight:700;cursor:pointer;">
                  ${m.label}
                </button>
              `).join("")}
            </div>

            <div style="display:flex;gap:6px;">
              <button type="button" id="tog-romaja" style="background:${showRomaja ? "var(--yellow-2)" : "rgba(255,255,255,0.1)"};color:#FFF;border:none;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer;" title="Bật/Tắt phiên âm kiểu @hongtuoissem">Aa Phiên âm</button>
              <button type="button" id="tog-vi" style="background:${showVi ? "var(--primary-1)" : "rgba(255,255,255,0.1)"};color:#FFF;border:none;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer;">文A Dịch Việt</button>
            </div>
          </div>

          <!-- Instant Tap-to-Dictionary Drawer -->
          <div id="shorts-dict-drawer"></div>

          <!-- Scrollable Synced Lines -->
          <div class="shorts-lines-scroll" id="shorts-lines-container"></div>
          <div id="shorts-stt-bar"></div>
        </div>
      </div>
    `;

    renderDictionaryCard(clip);
    renderTranscriptList(clip);
    mountYouTubePlayer(clip);

    stage.querySelector("#shorts-clip-select").addEventListener("change", (e) => {
      clipIdx = Number(e.target.value);
      activeLineIdx = 0;
      activeWordIdx = -1;
      dictPopup = null;
      renderFullStudio();
    });

    stage.querySelector("#btn-switch-kyuri-shadow").addEventListener("click", () => {
      cleanupPlayer();
      onSwitchToTextbookShadowing();
    });

    stage.querySelector("#btn-add-yt-clip").addEventListener("click", () => {
      addingClipModal = !addingClipModal;
      renderFullStudio();
    });

    stage.querySelector("#btn-cancel-new-clip")?.addEventListener("click", () => {
      addingClipModal = false;
      renderFullStudio();
    });

    stage.querySelector("#btn-save-new-clip")?.addEventListener("click", () => {
      const rawUrl = stage.querySelector("#new-yt-url").value.trim();
      const title = stage.querySelector("#new-yt-title").value.trim() || "Clip tự thêm";
      const rawSubs = stage.querySelector("#new-yt-subs").value.trim();
      const m = rawUrl.match(/(?:shorts\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if (!m) {
        alert("Link YouTube chưa đúng định dạng (Cần chứa mã video 11 ký tự).");
        return;
      }
      const parsedLines = rawSubs.split("\n").map((l) => l.split("|").map((s) => s.trim())).filter((p) => p.length >= 2).map((p, idx, arr) => {
        const st = parseFloat(p[0]) || idx * 4;
        const nextSt = arr[idx + 1] ? (parseFloat(arr[idx + 1][0]) || st + 4) : st + 5;
        return { start: st, end: nextSt, ko: p[1], vi: p[2] || "", romaja: "" };
      });
      if (!store.state.customYoutubeClips) store.state.customYoutubeClips = [];
      store.state.customYoutubeClips.push({
        id: `custom_yt_${Date.now()}`,
        videoId: m[1],
        channel: "Tự biên tập",
        level: "Tùy chọn",
        title,
        lines: parsedLines.length ? parsedLines : [{ start: 0, end: 15, ko: "자막을 클릭하여 사전을 확인하세요.", vi: "Bấm vào chữ để tra từ điển." }],
        glossary: {}
      });
      store.save();
      addingClipModal = false;
      clipIdx = YOUTUBE_SHORTS_CLIPS.length + store.state.customYoutubeClips.length - 1;
      renderFullStudio();
    });

    stage.querySelector("#ctrl-play-pause").addEventListener("click", () => {
      if (!player || typeof player.getPlayerState !== "function") return;
      const st = player.getPlayerState();
      if (st === 1) player.pauseVideo();
      else player.playVideo();
    });

    stage.querySelector("#ctrl-loop-line").addEventListener("click", (e) => {
      loopCurrentLine = !loopCurrentLine;
      const btn = e.currentTarget;
      btn.style.background = loopCurrentLine ? "var(--yellow-2)" : "rgba(255,255,255,0.14)";
      btn.innerHTML = `${ico("refresh", 15)} ${loopCurrentLine ? "Đang lặp câu" : "Lặp câu"}`;
    });

    stage.querySelector("#ctrl-speed").addEventListener("click", (e) => {
      playbackSpeed = playbackSpeed === 1.0 ? 0.75 : 1.0;
      if (player?.setPlaybackRate) player.setPlaybackRate(playbackSpeed);
      e.currentTarget.innerHTML = `${ico("turtle", 16)} ${playbackSpeed}x`;
    });

    stage.querySelectorAll("[data-smode]").forEach((b) => {
      b.addEventListener("click", () => {
        studyMode = b.dataset.smode;
        stage.querySelectorAll("[data-smode]").forEach((x) => {
          x.style.background = x.dataset.smode === studyMode ? "var(--primary)" : "rgba(255,255,255,0.08)";
        });
        renderTranscriptList(clip);
      });
    });

    stage.querySelector("#tog-romaja").addEventListener("click", (e) => {
      showRomaja = !showRomaja;
      e.target.style.background = showRomaja ? "var(--yellow-2)" : "rgba(255,255,255,0.1)";
      renderTranscriptList(clip);
    });

    stage.querySelector("#tog-vi").addEventListener("click", (e) => {
      showVi = !showVi;
      e.target.style.background = showVi ? "var(--primary-1)" : "rgba(255,255,255,0.1)";
      renderTranscriptList(clip);
    });
  }

  renderFullStudio();
}
