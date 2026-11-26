// Real Korean Hangeul Jamo Engine, Pronunciation Rule Detector & Verb Conjugator

const CHOSEONG = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNGSEONG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONGSEONG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

export function isHangulSyllable(ch) {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

export function decomposeSyllable(ch) {
  if (!isHangulSyllable(ch)) return null;
  const code = ch.charCodeAt(0) - 0xAC00;
  const jong = code % 28;
  const jung = ((code - jong) / 28) % 21;
  const cho = Math.floor((code - jong) / 28 / 21);
  return { cho: CHOSEONG[cho], jung: JUNGSEONG[jung], jong: JONGSEONG[jong], choIdx: cho, jungIdx: jung, jongIdx: jong };
}

export function composeSyllable(cho, jung, jong = "") {
  const choIdx = CHOSEONG.indexOf(cho);
  const jungIdx = JUNGSEONG.indexOf(jung);
  const jongIdx = JONGSEONG.indexOf(jong);
  if (choIdx < 0 || jungIdx < 0 || jongIdx < 0) return cho + jung + jong;
  return String.fromCharCode(0xAC00 + (choIdx * 21 + jungIdx) * 28 + jongIdx);
}

// Detect 7 core Korean phonological rules inside any Korean word/sentence
export function analyzePronunciationRules(text) {
  const chars = Array.from(text || "");
  const rulesFound = [];
  const pronounced = [...chars];

  const liaisonMap = { "ㄱ":"ㄱ", "ㄲ":"ㄲ", "ㄳ":"ㅅ", "ㄴ":"ㄴ", "ㄵ":"ㅈ", "ㄷ":"ㄷ", "ㄹ":"ㄹ", "ㄺ":"ㄱ", "ㄻ":"ㅁ", "ㄼ":"ㅂ", "ㅁ":"ㅁ", "ㅂ":"ㅂ", "ㅄ":"ㅅ", "ㅅ":"ㅅ", "ㅆ":"ㅆ", "ㅈ":"ㅈ", "ㅊ":"ㅊ", "ㅋ":"ㅋ", "ㅌ":"ㅌ", "ㅍ":"ㅍ" };
  const residualJong = { "ㄳ":"ㄱ", "ㄵ":"ㄴ", "ㄺ":"ㄹ", "ㄻ":"ㄹ", "ㄼ":"ㄹ", "ㅄ":"ㅂ" };
  const fortisMap = { "ㄱ":"ㄲ", "ㄷ":"ㄸ", "ㅂ":"ㅃ", "ㅅ":"ㅆ", "ㅈ":"ㅉ" };
  const aspirateMap = { "ㄱ":"ㅋ", "ㄷ":"ㅌ", "ㅂ":"ㅍ", "ㅈ":"ㅊ" };

  for (let i = 0; i < chars.length - 1; i++) {
    const a = decomposeSyllable(pronounced[i]);
    const b = decomposeSyllable(pronounced[i + 1]);
    if (!a || !b || !a.jong) continue;

    // 1. Palatalization 구개음화: ㄷ/ㅌ + 이 -> 지/치
    if ((a.jong === "ㄷ" || a.jong === "ㅌ") && b.cho === "ㅇ" && b.jung === "ㅣ") {
      const nextCho = a.jong === "ㄷ" ? "ㅈ" : "ㅊ";
      pronounced[i] = composeSyllable(a.cho, a.jung, "");
      pronounced[i + 1] = composeSyllable(nextCho, b.jung, b.jong);
      rulesFound.push({ rule: "Vòm âm hóa (구개음화)", detail: `${chars[i]}${chars[i+1]} → [${pronounced[i]}${pronounced[i+1]}] (patchim ${a.jong} gặp 이 đổi thành ${nextCho})` });
      continue;
    }

    // 2. Liaison 연음: patchim + ㅇ (except ㅇ/ㅎ)
    if (b.cho === "ㅇ" && a.jong !== "ㅇ" && a.jong !== "ㅎ" && liaisonMap[a.jong]) {
      const carry = liaisonMap[a.jong];
      const rem = residualJong[a.jong] || "";
      pronounced[i] = composeSyllable(a.cho, a.jung, rem);
      pronounced[i + 1] = composeSyllable(carry, b.jung, b.jong);
      rulesFound.push({ rule: "Nối âm (연음)", detail: `${chars[i]}${chars[i+1]} → [${pronounced[i]}${pronounced[i+1]}] (nối phụ âm cuối sang nguyên âm sau)` });
      continue;
    }

    // 3. Nasalization 비음화: ㄱ/ㄷ/ㅂ 계열 + ㄴ/ㅁ -> ㅇ/ㄴ/ㅁ
    if ((b.cho === "ㄴ" || b.cho === "ㅁ") && ["ㄱ","ㄲ","ㅋ","ㄳ","ㄺ","ㄷ","ㅅ","ㅆ","ㅈ","ㅊ","ㅌ","ㅂ","ㅍ","ㅄ"].includes(a.jong)) {
      const nasal = ["ㄱ","ㄲ","ㅋ","ㄳ","ㄺ"].includes(a.jong) ? "ㅇ" : (["ㅂ","ㅍ","ㅄ"].includes(a.jong) ? "ㅁ" : "ㄴ");
      pronounced[i] = composeSyllable(a.cho, a.jung, nasal);
      rulesFound.push({ rule: "Biến âm mũi (비음화)", detail: `${chars[i]}${chars[i+1]} → [${pronounced[i]}${pronounced[i+1]}] (gặp ${b.cho} biến thành âm mũi [${nasal}])` });
      continue;
    }

    // 4. Liquidization 유음화: ㄴ+ㄹ or ㄹ+ㄴ -> ㄹ+ㄹ
    if ((a.jong === "ㄴ" && b.cho === "ㄹ") || (a.jong === "ㄹ" && b.cho === "ㄴ")) {
      pronounced[i] = composeSyllable(a.cho, a.jung, "ㄹ");
      pronounced[i + 1] = composeSyllable("ㄹ", b.jung, b.jong);
      rulesFound.push({ rule: "Nhũ âm hóa (유음화)", detail: `${chars[i]}${chars[i+1]} → [${pronounced[i]}${pronounced[i+1]}] (ㄴ + ㄹ đồng hóa thành [ㄹㄹ])` });
      continue;
    }

    // 5. Aspiration 격음화: ㅎ + ㄱ/ㄷ/ㅂ/ㅈ or ㄱ/ㄷ/ㅂ/ㅈ + ㅎ
    if (a.jong === "ㅎ" && aspirateMap[b.cho]) {
      pronounced[i] = composeSyllable(a.cho, a.jung, "");
      pronounced[i + 1] = composeSyllable(aspirateMap[b.cho], b.jung, b.jong);
      rulesFound.push({ rule: "Bật hơi hóa (격음화)", detail: `${chars[i]}${chars[i+1]} → [${pronounced[i]}${pronounced[i+1]}] (ㅎ kết hợp ${b.cho} thành âm bật hơi ${aspirateMap[b.cho]})` });
      continue;
    }
    if (b.cho === "ㅎ" && aspirateMap[a.jong]) {
      pronounced[i] = composeSyllable(a.cho, a.jung, "");
      pronounced[i + 1] = composeSyllable(aspirateMap[a.jong], b.jung, b.jong);
      rulesFound.push({ rule: "Bật hơi hóa (격음화)", detail: `${chars[i]}${chars[i+1]} → [${pronounced[i]}${pronounced[i+1]}] (${a.jong} + ㅎ thành âm bật hơi ${aspirateMap[a.jong]})` });
      continue;
    }

    // 6. Tensification 경음화: ㄱ/ㄷ/ㅂ obstruents + ㄱ/ㄷ/ㅂ/ㅅ/ㅈ
    if (["ㄱ","ㄲ","ㅋ","ㄳ","ㄺ","ㄷ","ㅅ","ㅆ","ㅈ","ㅊ","ㅌ","ㅂ","ㅍ","ㅄ"].includes(a.jong) && fortisMap[b.cho]) {
      pronounced[i + 1] = composeSyllable(fortisMap[b.cho], b.jung, b.jong);
      rulesFound.push({ rule: "Căng âm hóa (경음화)", detail: `${chars[i]}${chars[i+1]} → [${pronounced[i]}${pronounced[i+1]}] (phụ âm sau đọc căng thành ${fortisMap[b.cho]})` });
    }
  }

  return {
    original: text,
    pronounced: pronounced.join(""),
    hasChange: pronounced.join("") !== text,
    rules: rulesFound
  };
}

// Korean Verb & Adjective Conjugator (supports regular + major irregulars ㅂ, ㄷ, 르, 으, ㅅ)
const B_IRREGULAR_EXCEPTIONS = new Set(["입다", "잡다", "좁다", "뽑다", "씹다", "업다"]);
const D_IRREGULAR_VERBS = new Set(["듣다", "걷다", "묻다", "깨닫다", "싣다"]);
const S_IRREGULAR_WORDS = new Set(["짓다", "낫다", "붓다", "긋다", "잇다"]);
const H_IRREGULAR_EXCEPTIONS = new Set(["좋다", "많다", "싫다", "괜찮다", "낳다", "넣다", "놓다", "쌓다"]);

export function conjugateKoreanPredicate(dictForm) {
  const clean = (dictForm || "").trim();
  if (!clean.endsWith("다") || clean.length < 2) {
    return null;
  }
  const stem = clean.slice(0, -1);
  const lastChar = stem[stem.length - 1];
  const prefix = stem.slice(0, -1);
  const dec = decomposeSyllable(lastChar);
  if (!dec) return null;

  let irregularNote = "Quy tắc chuẩn (규칙)";

  // Helper for vowel harmony (ㅏ, ㅗ -> 아, else 어)
  const isBright = (jung) => jung === "ㅏ" || jung === "ㅗ" || jung === "ㅑ" || jung === "ㅘ";

  // Polite informal (-아/어요) & Past (-았/었어요) & Formal (-ㅂ니다/습니다) & Modifier/Future
  let politeBase = ""; // e.g. 가, 먹어, 추워, 들어, 몰라
  let formalPresent = "";
  let futureForm = "";
  let reasonConnective = "";

  if (clean.endsWith("하다")) {
    irregularNote = "Động/Tính từ đuôi 하다 → 해요";
    politeBase = stem.slice(0, -1) + "해";
    formalPresent = prefix + composeSyllable(dec.cho, dec.jung, "ㅂ") + "니다";
    futureForm = prefix + composeSyllable(dec.cho, dec.jung, "ㄹ") + " 거예요";
    reasonConnective = politeBase + "서";
  } else if (clean === "이다") {
    irregularNote = "Động từ đặc biệt 이다 (Là)";
    return {
      dictForm: clean,
      irregularNote,
      forms: [
        { label: "Trang trọng (하십시오체)", ko: "입니다 / 입니까?", note: "Dùng trong thuyết trình, phỏng vấn" },
        { label: "Lịch sự thân thiện (해요체)", ko: "이에요 (có patchim) / 예요 (không patchim)", note: "Giao tiếp hằng ngày" },
        { label: "Thân mật (반말)", ko: "이야 / 야", note: "Bạn bè thân, nhỏ tuổi hơn" },
        { label: "Quá khứ lịch sự", ko: "이었어요 / 였어요", note: "Đã là..." },
        { label: "Nguyên nhân (-아서/어서)", ko: "이라서 / 라서", note: "Vì là..." }
      ]
    };
  } else if (dec.jong === "ㅂ" && !B_IRREGULAR_EXCEPTIONS.has(clean)) {
    // ㅂ irregular (춥다 -> 추워요, 돕다 -> 도와요)
    irregularNote = "Bất quy tắc ㅂ (ㅂ 불규칙): Lược ㅂ + 우/오";
    const baseNoB = composeSyllable(dec.cho, dec.jung, "");
    const useO = clean === "돕다" || clean === "곱다";
    politeBase = prefix + baseNoB + (useO ? "와" : "워");
    formalPresent = stem + "습니다";
    futureForm = prefix + baseNoB + (useO ? "울 거예요" : "울 거예요");
    reasonConnective = politeBase + "서";
  } else if (dec.jong === "ㄷ" && D_IRREGULAR_VERBS.has(clean)) {
    // ㄷ irregular (듣다 -> 들어요)
    irregularNote = "Bất quy tắc ㄷ (ㄷ 불규칙): Đổi ㄷ → ㄹ khi gặp nguyên âm";
    const baseR = composeSyllable(dec.cho, dec.jung, "ㄹ");
    const harmony = isBright(dec.jung) ? "아" : "어";
    politeBase = prefix + baseR + harmony;
    formalPresent = stem + "습니다";
    futureForm = prefix + baseR + "을 거예요";
    reasonConnective = politeBase + "서";
  } else if (lastChar === "르" && prefix.length > 0) {
    // 르 irregular (모르다 -> 몰라요, 빠르다 -> 빨라요)
    const prevDec = decomposeSyllable(prefix[prefix.length - 1]);
    if (prevDec && !prevDec.jong) {
      irregularNote = "Bất quy tắc 르 (르 불규칙): Thêm ㄹ vào chữ trước + 라/러";
      const prevWithR = composeSyllable(prevDec.cho, prevDec.jung, "ㄹ");
      const harmony = isBright(prevDec.jung) ? "라" : "러";
      politeBase = prefix.slice(0, -1) + prevWithR + harmony;
      formalPresent = stem + "ㅂ니다".replace("ㅂ", "") ? prefix + composeSyllable("ㄹ", "ㅡ", "ㅂ") + "니다" : "";
      futureForm = prefix + composeSyllable("ㄹ", "ㅡ", "ㄹ") + " 거예요";
      reasonConnective = politeBase + "서";
    }
  } else if (dec.jung === "ㅡ" && !dec.jong) {
    // 으 dropout (쓰다 -> 써요, 아프다 -> 아파요)
    irregularNote = "Bất quy tắc 으 (으 탈락): Lược ㅡ khi gặp -아/어";
    const prevDec = prefix.length > 0 ? decomposeSyllable(prefix[prefix.length - 1]) : null;
    const harmonyJung = prevDec && isBright(prevDec.jung) ? "ㅏ" : "ㅓ";
    politeBase = prefix + composeSyllable(dec.cho, harmonyJung, "");
    formalPresent = prefix + composeSyllable(dec.cho, "ㅡ", "ㅂ") + "니다";
    futureForm = prefix + composeSyllable(dec.cho, "ㅡ", "ㄹ") + " 거예요";
    reasonConnective = politeBase + "서";
  } else if (dec.jong === "ㅅ" && S_IRREGULAR_WORDS.has(clean)) {
    irregularNote = "Bất quy tắc ㅅ (ㅅ 불규칙): Lược ㅅ nhưng không gộp nguyên âm";
    const baseNoS = composeSyllable(dec.cho, dec.jung, "");
    const harmony = isBright(dec.jung) ? "아" : "어";
    politeBase = prefix + baseNoS + harmony;
    formalPresent = stem + "습니다";
    futureForm = prefix + baseNoS + "을 거예요";
    reasonConnective = politeBase + "서";
  } else if (dec.jong === "ㅎ" && !H_IRREGULAR_EXCEPTIONS.has(clean)) {
    irregularNote = "Bất quy tắc ㅎ (ㅎ 불규칙): Lược ㅎ và biến nguyên âm thành ㅐ/ㅒ (VD: 어떻다 → 어때요)";
    const newJung = dec.jung === "ㅑ" ? "ㅒ" : "ㅐ";
    politeBase = prefix + composeSyllable(dec.cho, newJung, "");
    formalPresent = stem + "습니다";
    futureForm = prefix + composeSyllable(dec.cho, dec.jung, "ㄹ") + " 거예요";
    reasonConnective = politeBase + "서";
  }

  if (!politeBase) {
    // Standard conjugation
    if (!dec.jong) {
      formalPresent = prefix + composeSyllable(dec.cho, dec.jung, "ㅂ") + "니다";
      futureForm = prefix + composeSyllable(dec.cho, dec.jung, "ㄹ") + " 거예요";
      if (dec.jung === "ㅏ" || dec.jung === "ㅓ" || dec.jung === "ㅐ" || dec.jung === "ㅔ") {
        politeBase = stem;
      } else if (dec.jung === "ㅗ") {
        politeBase = prefix + composeSyllable(dec.cho, "ㅘ", "");
      } else if (dec.jung === "ㅜ") {
        politeBase = prefix + composeSyllable(dec.cho, "ㅝ", "");
      } else if (dec.jung === "ㅣ") {
        politeBase = prefix + composeSyllable(dec.cho, "ㅕ", "");
      } else {
        politeBase = stem + (isBright(dec.jung) ? "아" : "어");
      }
    } else {
      formalPresent = dec.jong === "ㄹ"
        ? prefix + composeSyllable(dec.cho, dec.jung, "ㅂ") + "니다"
        : stem + "습니다";
      futureForm = dec.jong === "ㄹ"
        ? stem + " 거예요"
        : stem + "을 거예요";
      if (dec.jong === "ㄹ") {
        irregularNote = "Bất quy tắc ㄹ (ㄹ 탈락): Lược ㄹ khi gặp ㄴ, ㅂ, ㅅ";
      }
      politeBase = stem + (isBright(dec.jung) ? "아" : "어");
    }
    reasonConnective = politeBase + "서";
  }

  // Build past base from politeBase
  const lastPol = politeBase[politeBase.length - 1];
  const pDec = decomposeSyllable(lastPol);
  const pastPolite = pDec && !pDec.jong
    ? politeBase.slice(0, -1) + composeSyllable(pDec.cho, pDec.jung, "ㅆ") + "어요"
    : politeBase + "았어요";

  return {
    dictForm: clean,
    irregularNote,
    forms: [
      { label: "Trang trọng (하십시오체)", ko: formalPresent, note: "Thuyết trình, công sở, tin tức" },
      { label: "Lịch sự hằng ngày (해요체)", ko: politeBase + "요", note: "Giao tiếp lịch sự phổ biến nhất" },
      { label: "Thân mật (반말)", ko: politeBase, note: "Bạn bè thân thiết" },
      { label: "Quá khứ lịch sự (-았/었어요)", ko: pastPolite, note: "Đã xảy ra" },
      { label: "Tương lai / Dự định (-(으)ㄹ 거예요)", ko: futureForm, note: "Sẽ / Dự định làm" },
      { label: "Nguyên nhân / Trình tự (-아/어서)", ko: reasonConnective, note: "Vì... nên / Rồi..." },
      { label: "Phủ định ngắn (안)", ko: clean.endsWith("하다") ? `${clean.slice(0, -2)} 안 해요` : `안 ${politeBase}요`, note: "Không (ý chí/trạng thái)" }
    ]
  };
}

// 2-Beolsik On-Screen Jamo Append Helper
const DOUBLE_JUNG = { "ㅗㅏ":"ㅘ", "ㅗㅐ":"ㅙ", "ㅗㅣ":"ㅚ", "ㅜㅓ":"ㅝ", "ㅜㅔ":"ㅞ", "ㅜㅣ":"ㅟ", "ㅡㅣ":"ㅢ", "ㅏㅣ":"ㅐ", "ㅓㅣ":"ㅔ", "ㅑㅣ":"ㅒ", "ㅕㅣ":"ㅖ" };
const DOUBLE_JONG = { "ㄱㅅ":"ㄳ", "ㄴㅈ":"ㄵ", "ㄴㅎ":"ㄶ", "ㄹㄱ":"ㄺ", "ㄹㅁ":"ㄻ", "ㄹㅂ":"ㄼ", "ㄹㅅ":"ㄽ", "ㄹㅌ":"ㄾ", "ㄹㅍ":"ㄿ", "ㄹㅎ":"ㅀ", "ㅂㅅ":"ㅄ" };
const SPLIT_JONG = Object.fromEntries(Object.entries(DOUBLE_JONG).map(([k, v]) => [v, [k[0], k[1]]]));

export function appendJamoToText(currentText, jamo) {
  if (!currentText) return jamo;
  const last = currentText[currentText.length - 1];
  const rest = currentText.slice(0, -1);
  const isVowel = JUNGSEONG.includes(jamo);
  const isConsonant = CHOSEONG.includes(jamo);

  // Case 1: Last char is bare Choseong + incoming vowel -> syllable
  if (CHOSEONG.includes(last) && isVowel) {
    return rest + composeSyllable(last, jamo, "");
  }
  // Case 2: Last char is full Hangul syllable
  const dec = decomposeSyllable(last);
  if (dec) {
    if (isVowel) {
      if (!dec.jong) {
        const mergedV = DOUBLE_JUNG[dec.jung + jamo];
        if (mergedV) return rest + composeSyllable(dec.cho, mergedV, "");
        return currentText + jamo;
      } else {
        // Move jongseong (or split double jongseong) to become choseong of next syllable
        if (SPLIT_JONG[dec.jong]) {
          const [j1, j2] = SPLIT_JONG[dec.jong];
          return rest + composeSyllable(dec.cho, dec.jung, j1) + composeSyllable(j2, jamo, "");
        }
        if (CHOSEONG.includes(dec.jong)) {
          return rest + composeSyllable(dec.cho, dec.jung, "") + composeSyllable(dec.jong, jamo, "");
        }
      }
    } else if (isConsonant) {
      if (!dec.jong && JONGSEONG.includes(jamo)) {
        return rest + composeSyllable(dec.cho, dec.jung, jamo);
      }
      if (dec.jong && DOUBLE_JONG[dec.jong + jamo]) {
        return rest + composeSyllable(dec.cho, dec.jung, DOUBLE_JONG[dec.jong + jamo]);
      }
    }
  }
  return currentText + jamo;
}
