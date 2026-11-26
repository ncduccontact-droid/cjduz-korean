// 100% Cloud-Account Bound Progress Store (Zero localStorage progress dependency)
const AUTH_TOKEN_KEY = "cjduz_auth_token_v3";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const UI_THEMES = [
  { id: "mint", name: "Matcha Daisy", desc: "Xanh ngọc sữa & Cúc vàng (Khuyên dùng)", swatch: "#149E8E", accent: "#F59E0B" },
  { id: "soda", name: "Soda Sky", desc: "Xanh dương pastel Hàn Quốc & Kem bơ", swatch: "#3B7DDD", accent: "#F59E0B" },
  { id: "peach", name: "Peach Camellia", desc: "Hồng đào phấn dịu & Lá trà non", swatch: "#E06D85", accent: "#149E8E" },
  { id: "lavender", name: "Taro Milk", desc: "Tím khoai môn sữa & Cam quýt", swatch: "#6E62D6", accent: "#F59E0B" }
];

export const DEFAULT_ROADMAP_PROFILE = {
  startStage: "sc1",        // zero | sc1 | sc2 | tc3
  focusTrack: "balanced",   // balanced | topik_intensive | speaking_first
  dailyMinutes: 30,         // 15 | 30 | 60
  targetLevel: "TOPIK II - Cấp 4",
  examDate: "2027-04-18"
};

function createFreshState(roadmapProfile = DEFAULT_ROADMAP_PROFILE) {
  return {
    uiTheme: "mint",
    targetLevel: roadmapProfile.targetLevel || "TOPIK II - Cấp 4",
    examDate: roadmapProfile.examDate || "2027-04-18",
    roadmapProfile: { ...DEFAULT_ROADMAP_PROFILE, ...roadmapProfile },
    lastLesson: roadmapProfile.startStage === "zero"
      ? { book: "sc1", lesson: 1, title: "Nhập môn Hangeul & Bài 01" }
      : (roadmapProfile.startStage === "sc2"
        ? { book: "topik1", lesson: 1, title: "Chặng 1 · Từ vựng TOPIK I" }
        : { book: "sc1", lesson: 1, title: "Bài 01 · Giới thiệu" }),
    streak: 1,
    lastActiveDate: todayISO(),
    srs: {},
    completedLessons: {},
    chapterHomeworkDone: {},
    roadmapDone: {},
    roadmapStepDone: {},
    partStats: {},
    mistakes: [],
    examHistory: [],
    customYoutubeClips: [],
    updatedAt: 0
  };
}

// Clean up any legacy browser-stored progress keys so ONLY server account holds user progress
function purgeLegacyLocalProgress() {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("cjduz_user_state_") || k === "cjduz_guest_temp")) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

function loadSavedTokenMeta() {
  try {
    // Migrate from v2 session token if present so existing logged-in tab stays signed in seamlessly
    const rawV3 = localStorage.getItem(AUTH_TOKEN_KEY);
    if (rawV3) {
      const p = JSON.parse(rawV3);
      if (p?.mode === "user" && p?.user) return p;
    }
    const rawV2 = localStorage.getItem("cjduz_auth_session_v2");
    if (rawV2) {
      const p2 = JSON.parse(rawV2);
      if (p2?.mode === "user" && p2?.user) {
        localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(p2));
        return p2;
      }
    }
  } catch {}
  return { mode: "guest", token: "", user: null };
}

function applyDocumentTheme(themeId) {
  const valid = UI_THEMES.some((t) => t.id === themeId) ? themeId : "mint";
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = valid;
  }
}

let syncTimer = null;
let dirtyPendingSync = false;

export const store = {
  session: loadSavedTokenMeta(),
  state: createFreshState(),
  syncStatus: "synced", // synced | syncing | error
  listeners: new Set(),

  init() {
    purgeLegacyLocalProgress();
    applyDocumentTheme(this.state.uiTheme);

    if (typeof window !== "undefined") {
      const flushOnUnload = () => {
        if (dirtyPendingSync && this.isAuthenticated()) {
          this.flushCloudSyncBeacon();
        }
      };
      window.addEventListener("pagehide", flushOnUnload);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushOnUnload();
      });
    }
  },

  isAuthenticated() {
    return this.session?.mode === "user" && Boolean(this.session?.user?.email);
  },

  setTheme(themeId) {
    const valid = UI_THEMES.some((t) => t.id === themeId) ? themeId : "mint";
    this.state.uiTheme = valid;
    applyDocumentTheme(valid);
    this.save();
  },

  flushCloudSyncBeacon() {
    if (!this.isAuthenticated()) return;
    clearTimeout(syncTimer);
    dirtyPendingSync = false;
    try {
      const payload = JSON.stringify({ token: this.session.token || "", state: this.state });
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/user/sync", blob);
      } else {
        fetch("/api/user/sync", {
          method: "POST",
          keepalive: true,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(this.session.token ? { "Authorization": `Bearer ${this.session.token}` } : {})
          },
          body: payload
        }).catch(() => {});
      }
    } catch {}
  },

  async pushToCloudNow() {
    if (!this.isAuthenticated()) return;
    dirtyPendingSync = false;
    this.syncStatus = "syncing";
    this.notify();
    try {
      const res = await fetch("/api/user/sync", {
        method: "POST",
        keepalive: true,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(this.session.token ? { "Authorization": `Bearer ${this.session.token}` } : {})
        },
        body: JSON.stringify({ token: this.session.token || "", state: this.state })
      });
      if (res.ok) {
        this.syncStatus = "synced";
      } else {
        this.syncStatus = "error";
      }
    } catch {
      this.syncStatus = "error";
    }
    this.notify();
  },

  notify() {
    this.listeners.forEach((fn) => fn(this.state, this.session, this.syncStatus));
  },

  save(skipCloud = false) {
    this.state.updatedAt = Date.now();
    applyDocumentTheme(this.state.uiTheme);
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(this.session));
    } catch {}
    this.notify();

    if (!skipCloud && this.isAuthenticated()) {
      dirtyPendingSync = true;
      this.syncStatus = "syncing";
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        this.pushToCloudNow();
      }, 120);
    }
  },

  applyAuthenticatedUser(token, userObj, syncBack = false) {
    const serverState = userObj.state && Object.keys(userObj.state).length > 0
      ? userObj.state
      : createFreshState(userObj.roadmapProfile || DEFAULT_ROADMAP_PROFILE);

    this.session = {
      mode: "user",
      token: token || this.session.token || "",
      user: {
        id: userObj.id,
        email: userObj.email,
        name: userObj.name,
        avatar: userObj.avatar || "",
        authProvider: userObj.authProvider || "email"
      }
    };

    this.state = {
      ...createFreshState(userObj.roadmapProfile),
      ...serverState,
      roadmapProfile: {
        ...DEFAULT_ROADMAP_PROFILE,
        ...(userObj.roadmapProfile || {}),
        ...(serverState.roadmapProfile || {})
      }
    };
    this.syncStatus = "synced";
    applyDocumentTheme(this.state.uiTheme);
    this.save(!syncBack);
  },

  async logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(this.session.token ? { "Authorization": `Bearer ${this.session.token}` } : {})
        },
        body: JSON.stringify({ token: this.session.token || "" })
      });
    } catch {}
    this.session = { mode: "guest", token: "", user: null };
    this.state = createFreshState();
    this.syncStatus = "synced";
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem("cjduz_auth_session_v2");
    } catch {}
    applyDocumentTheme("mint");
    this.notify();
  },

  updateRoadmapProfile(newProfile, resetCheckedDays = false) {
    this.state.roadmapProfile = {
      ...DEFAULT_ROADMAP_PROFILE,
      ...(this.state.roadmapProfile || {}),
      ...newProfile
    };
    if (newProfile.targetLevel) this.state.targetLevel = newProfile.targetLevel;
    if (newProfile.examDate) this.state.examDate = newProfile.examDate;
    if (resetCheckedDays) {
      this.state.roadmapDone = {};
      this.state.roadmapStepDone = {};
    }
    this.save();
  },

  setRoadmapStepDone(day, stepIdx, totalSteps, val = true) {
    if (!this.state.roadmapStepDone) this.state.roadmapStepDone = {};
    const key = `d${day}_${stepIdx}`;
    if (val) this.state.roadmapStepDone[key] = true;
    else delete this.state.roadmapStepDone[key];

    // Sync whole-day flag automatically
    let allDone = true;
    for (let i = 0; i < totalSteps; i++) {
      if (!this.state.roadmapStepDone[`d${day}_${i}`]) allDone = false;
    }
    if (allDone) this.state.roadmapDone[day] = true;
    else delete this.state.roadmapDone[day];

    this.touchStreak();
    this.save();
  },

  async restoreCloudSession() {
    // Always query /api/user/me (supports both HttpOnly cookie AND Bearer token, so clearing localStorage still recovers via cookie!)
    try {
      const headers = {};
      if (this.session?.token) {
        headers["Authorization"] = `Bearer ${this.session.token}`;
      }
      const res = await fetch("/api/user/me", {
        credentials: "include",
        headers
      });
      if (!res.ok) {
        this.session = { mode: "guest", token: "", user: null };
        try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch {}
        return;
      }
      const data = await res.json();
      if (data.ok && data.user) {
        this.applyAuthenticatedUser(this.session.token || "cookie", data.user, false);
      }
    } catch {}
  },

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },

  touchStreak() {
    const today = todayISO();
    if (this.state.lastActiveDate !== today) {
      const prev = new Date(this.state.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - prev) / 86400000);
      if (diffDays === 1) {
        this.state.streak = (this.state.streak || 1) + 1;
      } else if (diffDays > 1) {
        this.state.streak = 1;
      }
      this.state.lastActiveDate = today;
      this.save();
    }
  },

  rateCard(cardId, quality) {
    const cur = this.state.srs[cardId] || { level: 0, nextDue: 0, wrongCount: 0, starred: false };
    const intervalsHours = [0.1, 12, 24, 72, 168, 360, 720];
    if (quality === 0) {
      cur.level = 0;
      cur.wrongCount = (cur.wrongCount || 0) + 1;
      cur.nextDue = Date.now() + 5 * 60 * 1000;
    } else if (quality === 1) {
      cur.level = Math.max(1, cur.level);
      cur.nextDue = Date.now() + intervalsHours[cur.level] * 3600 * 1000 * 0.6;
    } else if (quality === 2) {
      cur.level = Math.min(6, cur.level + 1);
      cur.nextDue = Date.now() + intervalsHours[cur.level] * 3600 * 1000;
    } else {
      cur.level = Math.min(6, cur.level + 2);
      cur.nextDue = Date.now() + intervalsHours[cur.level] * 3600 * 1000 * 1.4;
    }
    this.state.srs[cardId] = cur;
    this.touchStreak();
    this.save();
  },

  toggleStar(cardId) {
    const cur = this.state.srs[cardId] || { level: 0, nextDue: 0, wrongCount: 0, starred: false };
    cur.starred = !cur.starred;
    this.state.srs[cardId] = cur;
    this.save();
    return cur.starred;
  },

  isMastered(cardId) {
    return (this.state.srs[cardId]?.level || 0) >= 2;
  },

  getDueCardIds(allCards) {
    const now = Date.now();
    return allCards
      .filter((c) => {
        const s = this.state.srs[c.id];
        return s && s.nextDue <= now;
      })
      .map((c) => c.id);
  },

  recordQuestionResult(partId, partTitle, qObj, userChoice) {
    if (!this.state.partStats[partId]) {
      this.state.partStats[partId] = { correct: 0, total: 0, title: partTitle };
    }
    this.state.partStats[partId].total += 1;
    this.state.partStats[partId].title = partTitle;
    const isCorrect = userChoice === qObj.answer;
    if (isCorrect) {
      this.state.partStats[partId].correct += 1;
      this.state.mistakes = this.state.mistakes.filter((m) => m.id !== qObj.id);
    } else {
      const exists = this.state.mistakes.findIndex((m) => m.id === qObj.id);
      const entry = {
        id: qObj.id,
        partId,
        partTitle,
        question: qObj.question,
        passage: qObj.passage || "",
        audioSrc: qObj.audioSrc || "",
        audioText: qObj.audioText || "",
        options: qObj.options,
        userChoice,
        answer: qObj.answer,
        explain: qObj.explain,
        timestamp: Date.now()
      };
      if (exists >= 0) {
        this.state.mistakes[exists] = entry;
      } else {
        this.state.mistakes.unshift(entry);
      }
    }
    this.touchStreak();
    this.save();
    return isCorrect;
  },

  exportJSON() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cjduz_korean_backup_${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importJSON(jsonStr) {
    const parsed = JSON.parse(jsonStr);
    this.state = { ...createFreshState(parsed.roadmapProfile), ...parsed };
    this.save();
  }
};

store.init();

// ===== ZERO-LATENCY PRELOAD AUDIO ENGINE (LRU Cache) =====
const audioCache = new Map();
const MAX_AUDIO_CACHE = 90;
let currentAudio = null;

function normalizeAudioPath(src) {
  if (!src) return "";
  return src.startsWith("/") || src.startsWith("http") ? src : `/${src}`;
}

export function preloadAudioUrls(urls = []) {
  urls.forEach((raw) => {
    const clean = normalizeAudioPath(raw);
    if (!clean || audioCache.has(clean)) return;
    if (audioCache.size >= MAX_AUDIO_CACHE) {
      const oldestKey = audioCache.keys().next().value;
      audioCache.delete(oldestKey);
    }
    const a = new Audio();
    a.preload = "auto";
    a.src = clean;
    a.load();
    audioCache.set(clean, a);
  });
}

export function playAudio(src, rate = 1.0) {
  const cleanSrc = normalizeAudioPath(src);
  if (!cleanSrc) return null;

  if (currentAudio && currentAudio.src !== cleanSrc) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  let audio = audioCache.get(cleanSrc);
  if (!audio) {
    audio = new Audio(cleanSrc);
    audio.preload = "auto";
    if (audioCache.size >= MAX_AUDIO_CACHE) {
      audioCache.delete(audioCache.keys().next().value);
    }
    audioCache.set(cleanSrc, audio);
  }

  audio.pause();
  audio.currentTime = 0;
  audio.playbackRate = rate;
  currentAudio = audio;
  audio.play().catch(() => {});
  return audio;
}

export function speakKoreanTTS(text, rate = 0.96) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = rate;
  const voices = window.speechSynthesis.getVoices?.() || [];
  const bestKo = voices.find((v) => v.lang.startsWith("ko") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Siri")))
    || voices.find((v) => v.lang.startsWith("ko"));
  if (bestKo) u.voice = bestKo;
  window.speechSynthesis.speak(u);
}
