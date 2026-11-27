// 100% Cloud-Account Bound Progress Store on Production + Automatic Localhost Review Bypass
const AUTH_TOKEN_KEY = "cjduz_auth_token_v3";
const LOCAL_PREVIEW_STATE_KEY = "dtopik_local_preview_state_v1";

export function isLocalPreviewHost() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h.endsWith(".local");
}

function createLocalReviewSession() {
  return {
    mode: "local-preview",
    token: "",
    user: {
      id: 0,
      email: "local-review@d-topik",
      name: "Review Local",
      avatar: "",
      authProvider: "local"
    }
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const DEFAULT_THEME_ID = "jade_grad";

export const UI_THEMES = [
  { id: "jade_grad", name: "Ngọc Bích Thanh Lịch", desc: "Nền sáng tinh gọn, điểm nhấn gradient xanh ngọc", swatch: "linear-gradient(135deg,#0D9488,#10B981,#24C6B2)", accent: "#F5F7FA" },
  { id: "jade_aurora", name: "Ngọc Lục Bảo Đậm", desc: "Thanh điều hướng xanh ngọc đậm chuyển sắc", swatch: "linear-gradient(135deg,#0B5550,#0D7A70,#129E8F)", accent: "#99F6E4" },
  { id: "celadon_mist", name: "Sương Mai Ngọc Bích", desc: "Sắc xanh ngọc dịu nhẹ trên nền giấy sáng", swatch: "linear-gradient(135deg,#0E8F79,#16B996,#34D399)", accent: "#D1FAE5" },
  { id: "lagoon_jade", name: "Ngọc Lam Biển", desc: "Gradient xanh ngọc pha lam tươi mát", swatch: "linear-gradient(135deg,#0C8288,#14B8A6,#38BDF8)", accent: "#CCFBF1" }
];

export const BOOK_SURVEY_OPTIONS = [
  { id: "hangeul", badge: "Nhập môn", title: "Bảng chữ Hangeul & Biến âm", sub: "Bắt đầu từ số 0 → Vào Quyển 1", defaultTarget: "TOPIK I - Cấp 1", legacyStage: "zero" },
  { id: "q1", badge: "Quyển 1", title: "Tiếng Hàn Tổng Hợp · Quyển 1", sub: "Sơ cấp 1 (Bài 1–15) · Từ vựng & Dịch câu", defaultTarget: "TOPIK I - Cấp 1", legacyStage: "sc1" },
  { id: "q2", badge: "Quyển 2", title: "Tiếng Hàn Tổng Hợp · Quyển 2", sub: "Sơ cấp 2 · Tăng tốc đỗ TOPIK I (Cấp 2)", defaultTarget: "TOPIK I - Cấp 2", legacyStage: "sc2" },
  { id: "q3", badge: "Quyển 3", title: "Tiếng Hàn Tổng Hợp · Quyển 3", sub: "Trung cấp 1 · Âm Hán–Hàn & Câu 1–20", defaultTarget: "TOPIK II - Cấp 3", legacyStage: "tc3" },
  { id: "q4", badge: "Quyển 4", title: "Tiếng Hàn Tổng Hợp · Quyển 4", sub: "Trung cấp 2 · Đồng nghĩa & Viết Câu 51–53", defaultTarget: "TOPIK II - Cấp 4", legacyStage: "tc3" },
  { id: "q5", badge: "Quyển 5", title: "Tiếng Hàn Tổng Hợp · Quyển 5", sub: "Cao cấp 1 · Báo chí, xã hội & Nghị luận 54", defaultTarget: "TOPIK II - Cấp 5", legacyStage: "tc3" },
  { id: "q6", badge: "Quyển 6", title: "Tiếng Hàn Tổng Hợp · Quyển 6", sub: "Cao cấp 2 · Học thuật & Full 104 câu TOPIK II", defaultTarget: "TOPIK II - Cấp 6", legacyStage: "tc3" }
];

export const DEFAULT_ROADMAP_PROFILE = {
  startBook: "q1",          // hangeul | q1 | q2 | q3 | q4 | q5 | q6
  startStage: "sc1",        // zero | sc1 | sc2 | tc3
  focusTrack: "balanced",   // balanced | topik_intensive | speaking_first
  dailyMinutes: 30,         // 15 | 30 | 60
  targetLevel: "TOPIK II - Cấp 4",
  examDate: "2027-04-18"
};

function createFreshState(roadmapProfile = DEFAULT_ROADMAP_PROFILE) {
  return {
    uiTheme: DEFAULT_THEME_ID,
    onboardingCompleted: true,
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
    workbookScores: {},
    workbookAnswers: {},
    topikDrillAnswers: {},
    translationDone: {},
    roadmapDone: {},
    roadmapStepDone: {},
    partStats: {},
    mistakes: [],
    examHistory: [],
    scoreHistory: [],
    quizBestScores: {},
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
  if (isLocalPreviewHost()) return createLocalReviewSession();
  return { mode: "guest", token: "", user: null };
}

function normalizeThemeId(themeId) {
  return UI_THEMES.some((t) => t.id === themeId) ? themeId : DEFAULT_THEME_ID;
}

function loadInitialState() {
  const base = createFreshState();
  try {
    const rawLocal = isLocalPreviewHost() && typeof localStorage !== "undefined"
      ? localStorage.getItem(LOCAL_PREVIEW_STATE_KEY)
      : null;
    const rawSession = typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(LOCAL_PREVIEW_STATE_KEY)
      : null;
    const raw = rawLocal || rawSession;
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...base, ...parsed, uiTheme: normalizeThemeId(parsed.uiTheme), onboardingCompleted: true };
    }
  } catch {}
  return base;
}

function applyDocumentTheme(themeId) {
  const valid = normalizeThemeId(themeId);
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = valid;
  }
}

let syncTimer = null;
let dirtyPendingSync = false;

export const store = {
  session: loadSavedTokenMeta(),
  state: loadInitialState(),
  syncStatus: "synced", // synced | syncing | error
  listeners: new Set(),

  init() {
    purgeLegacyLocalProgress();
    applyDocumentTheme(this.state.uiTheme);

    if (typeof window !== "undefined") {
      const flushOnUnload = () => {
        if (dirtyPendingSync && this.hasCloudAccount()) {
          this.flushCloudSyncBeacon();
        }
      };
      window.addEventListener("pagehide", flushOnUnload);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushOnUnload();
      });
    }
  },

  hasCloudAccount() {
    return this.session?.mode === "user" && Boolean(this.session?.user?.email);
  },

  isAuthenticated() {
    if (isLocalPreviewHost()) return true;
    return this.hasCloudAccount();
  },

  setTheme(themeId) {
    const valid = normalizeThemeId(themeId);
    this.state.uiTheme = valid;
    applyDocumentTheme(valid);
    this.save();
  },

  flushCloudSyncBeacon() {
    if (!this.hasCloudAccount()) return;
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
    if (!this.hasCloudAccount()) return;
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
    const validTheme = normalizeThemeId(this.state.uiTheme);
    this.state.uiTheme = validTheme;
    applyDocumentTheme(validTheme);
    try {
      if (this.hasCloudAccount()) {
        localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(this.session));
      } else if (isLocalPreviewHost() && typeof localStorage !== "undefined") {
        localStorage.setItem(LOCAL_PREVIEW_STATE_KEY, JSON.stringify(this.state));
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(LOCAL_PREVIEW_STATE_KEY, JSON.stringify(this.state));
        }
      } else if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(LOCAL_PREVIEW_STATE_KEY, JSON.stringify(this.state));
      }
    } catch {}
    this.notify();

    if (!skipCloud && this.hasCloudAccount()) {
      dirtyPendingSync = true;
      this.syncStatus = "syncing";
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        this.pushToCloudNow();
      }, 120);
    }
  },

  applyAuthenticatedUser(token, userObj, syncBack = false, isNewSignup = false) {
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

    const normalizedTheme = normalizeThemeId(serverState.uiTheme);
    const upgradedLegacyTheme = normalizedTheme !== serverState.uiTheme;
    const upgradedOnboarding = !isNewSignup && !serverState.onboardingCompleted;

    this.state = {
      ...createFreshState(userObj.roadmapProfile),
      ...serverState,
      uiTheme: normalizedTheme,
      onboardingCompleted: isNewSignup ? false : true,
      roadmapProfile: {
        ...DEFAULT_ROADMAP_PROFILE,
        ...(userObj.roadmapProfile || {}),
        ...(serverState.roadmapProfile || {})
      }
    };
    this.syncStatus = "synced";
    applyDocumentTheme(this.state.uiTheme);
    this.save(!(syncBack || upgradedLegacyTheme || upgradedOnboarding));
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
    this.session = isLocalPreviewHost() ? createLocalReviewSession() : { mode: "guest", token: "", user: null };
    this.state = createFreshState();
    this.syncStatus = "synced";
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem("cjduz_auth_session_v2");
      localStorage.removeItem(LOCAL_PREVIEW_STATE_KEY);
      if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(LOCAL_PREVIEW_STATE_KEY);
    } catch {}
    applyDocumentTheme(DEFAULT_THEME_ID);
    this.notify();
  },

  async deleteAccount() {
    const res = await fetch("/api/auth/delete-account", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(this.session.token ? { "Authorization": `Bearer ${this.session.token}` } : {})
      },
      body: JSON.stringify({ token: this.session.token || "" })
    });
    const data = await res.json().catch(() => ({ ok: false }));
    if (!data.ok && !isLocalPreviewHost()) {
      throw new Error(data.error || "Không thể xóa tài khoản lúc này.");
    }
    this.session = isLocalPreviewHost() ? createLocalReviewSession() : { mode: "guest", token: "", user: null };
    this.state = createFreshState();
    this.syncStatus = "synced";
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem("cjduz_auth_session_v2");
      localStorage.removeItem(LOCAL_PREVIEW_STATE_KEY);
      if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(LOCAL_PREVIEW_STATE_KEY);
    } catch {}
    applyDocumentTheme(DEFAULT_THEME_ID);
    this.notify();
    return true;
  },

  updateRoadmapProfile(newProfile, resetCheckedDays = false) {
    const pickedOpt = BOOK_SURVEY_OPTIONS.find((b) => b.id === newProfile.startBook);
    const syncedStage = pickedOpt ? pickedOpt.legacyStage : (newProfile.startStage || this.state.roadmapProfile?.startStage || "sc1");

    this.state.roadmapProfile = {
      ...DEFAULT_ROADMAP_PROFILE,
      ...(this.state.roadmapProfile || {}),
      ...newProfile,
      startStage: syncedStage
    };
    this.state.onboardingCompleted = true;
    if (newProfile.targetLevel) this.state.targetLevel = newProfile.targetLevel;
    else if (pickedOpt) this.state.targetLevel = pickedOpt.defaultTarget;
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

  recordWorkbookScore(bookId, lessonNum, correct, total, answersSnapshot = null, submitted = true) {
    if (!this.state.workbookScores) this.state.workbookScores = {};
    if (!this.state.workbookAnswers) this.state.workbookAnswers = {};
    if (!this.state.chapterHomeworkDone) this.state.chapterHomeworkDone = {};
    const normBook = bookId === "sc1" ? "q1" : (bookId === "sc2" ? "q2" : bookId);
    const key = `${normBook}_${lessonNum}`;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const prev = this.state.workbookScores[key];
    this.state.workbookScores[key] = {
      correct: prev ? Math.max(prev.correct || 0, correct) : correct,
      lastCorrect: correct,
      total,
      pct: prev ? Math.max(prev.pct || 0, pct) : pct,
      lastPct: pct,
      submitted: Boolean(submitted),
      updatedAt: Date.now()
    };
    if (answersSnapshot && typeof answersSnapshot === "object") {
      this.state.workbookAnswers[key] = {
        submitted: Boolean(submitted),
        picks: { ...answersSnapshot }
      };
    }
    if (submitted && total > 0) {
      this.state.chapterHomeworkDone[key] = true;
      if (normBook === "q1") this.state.chapterHomeworkDone[`sc1_${lessonNum}`] = true;
    }
    this.touchStreak();
    this.save();
  },

  recordTranslationSolved(bookId, lessonNum) {
    if (!this.state.translationDone) this.state.translationDone = {};
    if (!this.state.chapterHomeworkDone) this.state.chapterHomeworkDone = {};
    const normBook = bookId === "sc1" ? "q1" : (bookId === "sc2" ? "q2" : bookId);
    const key = `${normBook}_${lessonNum}`;
    this.state.translationDone[key] = (this.state.translationDone[key] || 0) + 1;
    this.state.chapterHomeworkDone[key] = true;
    if (normBook === "q1") this.state.chapterHomeworkDone[`sc1_${lessonNum}`] = true;
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
        this.session = isLocalPreviewHost() ? createLocalReviewSession() : { mode: "guest", token: "", user: null };
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

  resetChapterQuiz(bookId, lessonNum, kind = "workbook") {
    const normBook = bookId === "sc1" ? "q1" : (bookId === "sc2" ? "q2" : bookId);
    const key = `${normBook}_${lessonNum}`;
    if (kind === "workbook") {
      if (this.state.workbookAnswers) delete this.state.workbookAnswers[key];
      if (this.state.workbookScores?.[key]) {
        this.state.workbookScores[key].submitted = false;
      }
    } else if (kind === "topik") {
      if (this.state.topikDrillAnswers) delete this.state.topikDrillAnswers[key];
    }
    this.save();
  },

  recordScoreHistory({
    quizKey = "",
    category = "Bài tập",
    title = "",
    score = 0,
    maxScore = 100,
    correctCount = 0,
    totalCount = 0,
    route = "home",
    params = {},
    deferSave = false
  }) {
    if (!Array.isArray(this.state.scoreHistory)) this.state.scoreHistory = [];
    if (!this.state.quizBestScores) this.state.quizBestScores = {};
    const safeMax = Math.max(1, Number(maxScore || 100));
    const safeScore = Math.max(0, Math.round(Number(score || 0)));
    const pct = Math.min(100, Math.round((safeScore / safeMax) * 100));
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${pad(now.getHours())}:${pad(now.getMinutes())} · ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const entry = {
      id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      quizKey,
      category,
      title,
      score: safeScore,
      maxScore: safeMax,
      pct,
      correctCount: Number(correctCount || 0),
      totalCount: Number(totalCount || 0),
      route,
      params,
      date: dateStr,
      timestamp: Date.now()
    };
    this.state.scoreHistory.unshift(entry);
    if (this.state.scoreHistory.length > 120) {
      this.state.scoreHistory = this.state.scoreHistory.slice(0, 120);
    }
    if (quizKey) {
      const prev = this.state.quizBestScores[quizKey];
      this.state.quizBestScores[quizKey] = {
        bestScore: prev ? Math.max(prev.bestScore ?? 0, safeScore) : safeScore,
        maxScore: safeMax,
        bestPct: prev ? Math.max(prev.bestPct ?? 0, pct) : pct,
        lastScore: safeScore,
        lastPct: pct,
        correctCount: Number(correctCount || 0),
        totalCount: Number(totalCount || 0),
        attempts: (prev?.attempts || 0) + 1,
        updatedAt: Date.now()
      };
    }
    if (!deferSave) {
      this.touchStreak();
      this.save();
    }
    return entry;
  },

  getQuizSummary(quizKey) {
    if (!quizKey) return null;
    return this.state.quizBestScores?.[quizKey] || null;
  },

  recordQuestionResult(partId, partTitle, qObj, userChoice, opts = {}) {
    if (!this.state.partStats[partId]) {
      this.state.partStats[partId] = { correct: 0, total: 0, title: partTitle };
    }
    this.state.partStats[partId].total += 1;
    if (partTitle) {
      this.state.partStats[partId].title = partTitle;
    }
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
    if (!opts.deferSave) {
      this.touchStreak();
      this.save();
    }
    return isCorrect;
  },

  exportJSON() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `d_topik_backup_${todayISO()}.json`;
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

// ===== ROADMAP-CALIBRATED SCORE SCALE & READINESS EVALUATOR =====
export const ROADMAP_SCORE_SCALES = {
  hangeul: { bookId: "q1", label: "Nhập môn & Quyển 1", examLevel: "topik1", maxScore: 200, passScore: 80, nextScore: 140, gradeName: "TOPIK I · Cấp 1" },
  q1: { bookId: "q1", label: "Quyển 1 · Sơ cấp 1", examLevel: "topik1", maxScore: 200, passScore: 80, nextScore: 140, gradeName: "TOPIK I · Cấp 1" },
  q2: { bookId: "q2", label: "Quyển 2 · Sơ cấp 2", examLevel: "topik1", maxScore: 200, passScore: 140, nextScore: 180, gradeName: "TOPIK I · Cấp 2" },
  q3: { bookId: "q3", label: "Quyển 3 · Trung cấp 1", examLevel: "topik2", maxScore: 300, passScore: 120, nextScore: 150, gradeName: "TOPIK II · Cấp 3" },
  q4: { bookId: "q4", label: "Quyển 4 · Trung cấp 2", examLevel: "topik2", maxScore: 300, passScore: 150, nextScore: 190, gradeName: "TOPIK II · Cấp 4" },
  q5: { bookId: "q5", label: "Quyển 5 · Cao cấp 1", examLevel: "topik2", maxScore: 300, passScore: 190, nextScore: 230, gradeName: "TOPIK II · Cấp 5" },
  q6: { bookId: "q6", label: "Quyển 6 · Cao cấp 2", examLevel: "topik2", maxScore: 300, passScore: 230, nextScore: 270, gradeName: "TOPIK II · Cấp 6" }
};

export function normalizeBookId(raw) {
  if (!raw || raw === "sc1" || raw === "hangeul" || raw === "zero") return "q1";
  if (raw === "sc2") return "q2";
  if (raw === "tc3") return "q3";
  if (raw === "tc4") return "q4";
  if (raw === "cc5") return "q5";
  if (raw === "cc6") return "q6";
  return raw;
}

export function getBookWords(db, rawBookId) {
  const bid = normalizeBookId(rawBookId);
  if (rawBookId === "topik1") return db.topik1Bank || [];
  if (rawBookId === "sejong1") return db.sejongVocab || [];
  if (rawBookId && String(rawBookId).startsWith("custom_")) {
    return db.customDecks?.find((d) => d.deckId === rawBookId)?.items || [];
  }
  if (bid === "q1") return db.sc1Vocab || [];
  const found = (db.books6 || []).find((b) => b.bookId === bid);
  return found?.vocab || [];
}

export function getBookCurriculum(db, rawBookId) {
  const bid = normalizeBookId(rawBookId);
  return (db.books6 || []).find((b) => b.bookId === bid) || (db.books6 || [])[0] || null;
}

export function evaluateRoadmapScore(db) {
  const s = store.state;
  const profile = s.roadmapProfile || DEFAULT_ROADMAP_PROFILE;
  const startKey = profile.startBook || "q1";
  const scale = ROADMAP_SCORE_SCALES[startKey] || ROADMAP_SCORE_SCALES.q1;
  const curBook = getBookCurriculum(db, scale.bookId);
  const bookWords = getBookWords(db, scale.bookId);
  const chapCount = Math.max(1, curBook?.chapters?.length || 15);

  // 1. Vocabulary Mastery in Current Book (25%)
  const masteredWords = bookWords.filter((w) => store.isMastered(w.id)).length;
  const vocabPct = bookWords.length > 0 ? Math.min(100, Math.round((masteredWords / bookWords.length) * 100)) : 0;

  // 2. Workbook Exercises in Current Book (25%)
  const wbEntries = Object.entries(s.workbookScores || {}).filter(([k]) => k.startsWith(`${scale.bookId}_`));
  const wbAvgAccuracy = wbEntries.length > 0
    ? wbEntries.reduce((acc, [, v]) => acc + (v.pct || 0), 0) / wbEntries.length
    : 0;
  const wbCoverage = Math.min(1, wbEntries.length / Math.max(3, Math.ceil(chapCount * 0.5)));
  const workbookPct = Math.min(100, Math.round(wbAvgAccuracy * (0.45 + 0.55 * wbCoverage)));

  // 3. Sentence Translation Mastery in Current Book (20%)
  const trEntries = Object.entries(s.translationDone || {}).filter(([k]) => k.startsWith(`${scale.bookId}_`));
  const totalTranslated = trEntries.reduce((acc, [, cnt]) => acc + Number(cnt || 0), 0);
  const targetTrans = Math.max(12, chapCount * 3);
  const translatePct = Math.min(100, Math.round((totalTranslated / targetTrans) * 100));

  // 4. Exam & Segmented Drill Performance at Current Level (30%)
  const prefix = scale.examLevel === "topik2" ? "t2_" : "t1_";
  const partVals = Object.entries(s.partStats || {})
    .filter(([pid]) => pid.startsWith(prefix) || !pid.startsWith("t"))
    .map(([, v]) => v);
  const drillTotal = partVals.reduce((a, v) => a + (v.total || 0), 0);
  const drillCorrect = partVals.reduce((a, v) => a + (v.correct || 0), 0);
  const drillAcc = drillTotal > 0 ? Math.round((drillCorrect / drillTotal) * 100) : 0;

  const matchingExams = (s.examHistory || []).filter((h) => h.isFullExam !== false && h.maxScore === scale.maxScore);
  let examPct = drillTotal > 0 ? Math.min(100, Math.round(drillAcc * Math.min(1, 0.5 + drillTotal / 30))) : 0;
  if (matchingExams.length > 0) {
    const recentAvgScore = matchingExams.slice(0, 3).reduce((a, h) => a + Number(h.score || 0), 0) / Math.min(3, matchingExams.length);
    const recentPct = Math.round((recentAvgScore / scale.maxScore) * 100);
    examPct = drillTotal > 0 ? Math.round(recentPct * 0.65 + examPct * 0.35) : recentPct;
  }

  // Weighted Composite Mastery (0..100) mapped onto Official TOPIK Scale (0..200 or 0..300)
  const compositePct = vocabPct * 0.25 + workbookPct * 0.25 + translatePct * 0.20 + examPct * 0.30;
  // Calibrate so 70% mastery of the active book reaches passScore, and 100% reaches nextScore/maxScore
  let estimatedScore = 0;
  if (compositePct <= 70) {
    estimatedScore = Math.round((compositePct / 70) * scale.passScore);
  } else {
    estimatedScore = Math.round(scale.passScore + ((compositePct - 70) / 30) * (scale.nextScore - scale.passScore));
  }
  if (matchingExams.length > 0) {
    const latestReal = Number(matchingExams[0].score || 0);
    estimatedScore = Math.round(latestReal * 0.6 + estimatedScore * 0.4);
  }
  estimatedScore = Math.max(0, Math.min(scale.maxScore, estimatedScore));

  const gapToPass = Math.max(0, scale.passScore - estimatedScore);
  const passed = estimatedScore >= scale.passScore;

  const pillarList = [
    { key: "vocab", label: "Từ vựng", pct: vocabPct, detail: `${masteredWords}/${bookWords.length} từ` },
    { key: "workbook", label: "Sách bài tập", pct: workbookPct, detail: `${wbEntries.length}/${chapCount} bài` },
    { key: "translate", label: "Dịch câu", pct: translatePct, detail: `${totalTranslated} câu` },
    { key: "exam", label: "Luyện đề", pct: examPct, detail: matchingExams.length ? `${matchingExams.length} đề` : `${drillTotal} câu` }
  ];
  const weakest = [...pillarList].sort((a, b) => a.pct - b.pct)[0];

  const statusLabel = passed
    ? `Đạt ngưỡng chuẩn ${scale.gradeName} (≥ ${scale.passScore}/${scale.maxScore}đ)`
    : `Cần thêm +${gapToPass}đ để chạm chuẩn ${scale.gradeName} (${scale.passScore}/${scale.maxScore}đ)`;

  return {
    ...scale,
    compositePct: Math.round(compositePct),
    estimatedScore,
    gapToPass,
    passed,
    statusLabel,
    pillars: pillarList,
    weakestPillar: weakest
  };
}

// ===== ZERO-LATENCY PRELOAD AUDIO ENGINE (LRU Cache + Cloud Korean TTS) =====
const audioCache = new Map();
const MAX_AUDIO_CACHE = 90;
let currentAudio = null;
let activeTtsSeq = 0;

const BANNED_NOVELTY_VOICES = [
  "eddy", "flo", "grandma", "grandpa", "reed", "rocko", "sandy", "shelley",
  "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
  "good news", "jester", "organ", "superstar", "trinoids", "whisper", "wobble", "zarvox"
];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    window.speechSynthesis.getVoices?.();
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {
      window.speechSynthesis.getVoices?.();
    });
  } catch {}
}

function normalizeAudioPath(src) {
  if (!src) return "";
  return src.startsWith("/") || src.startsWith("http") ? src : `/${src}`;
}

export function stopAllAudio() {
  activeTtsSeq += 1;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
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

  activeTtsSeq += 1;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }

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

function sanitizeKoreanSpeechText(raw) {
  if (!raw) return "";
  return String(raw)
    // Remove parentheticals containing Latin/Vietnamese notes while keeping pure Hangul notes
    .replace(/\([^)]*[A-Za-zÀ-ỹ][^)]*\)/g, " ")
    .replace(/\[[^\]]*[A-Za-zÀ-ỹ][^\]]*\]/g, " ")
    .replace(/[＝=↔·/]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSpeechChunks(text, maxLen = 165) {
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  const chunks = [];
  let buf = "";
  for (const s of sentences) {
    if (!buf) {
      buf = s;
    } else if ((buf + " " + s).length <= maxLen) {
      buf += " " + s;
    } else {
      chunks.push(buf);
      buf = s;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.flatMap((c) => {
    if (c.length <= maxLen) return [c];
    const words = c.split(" ");
    const sub = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length <= maxLen) cur = (cur + " " + w).trim();
      else {
        if (cur) sub.push(cur);
        cur = w;
      }
    }
    if (cur) sub.push(cur);
    return sub;
  });
}

function pickCleanKoreanVoice(voices) {
  const koVoices = (voices || []).filter((v) => {
    if (!v?.lang?.toLowerCase().startsWith("ko")) return false;
    const nm = (v.name || "").toLowerCase();
    return !BANNED_NOVELTY_VOICES.some((bad) => nm.includes(bad));
  });
  return koVoices.find((v) => /sunhi|natural|online/i.test(v.name))
    || koVoices.find((v) => /google/i.test(v.name))
    || koVoices.find((v) => /yuna|sora|minsu|siri/i.test(v.name))
    || koVoices[0]
    || null;
}

function speakWebSpeechFallback(cleanText, rate = 0.96) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !cleanText) return;
  window.speechSynthesis.cancel();
  const speakNow = () => {
    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = "ko-KR";
    u.rate = rate;
    const best = pickCleanKoreanVoice(window.speechSynthesis.getVoices?.() || []);
    if (best) u.voice = best;
    window.speechSynthesis.speak(u);
  };
  const loaded = window.speechSynthesis.getVoices?.() || [];
  if (loaded.length > 0) {
    speakNow();
  } else {
    let fired = false;
    const onReady = () => {
      if (fired) return;
      fired = true;
      window.speechSynthesis.removeEventListener?.("voiceschanged", onReady);
      speakNow();
    };
    window.speechSynthesis.addEventListener?.("voiceschanged", onReady);
    setTimeout(onReady, 220);
  }
}

export function speakKoreanTTS(text, rate = 0.96) {
  const cleanText = sanitizeKoreanSpeechText(text);
  if (!cleanText || typeof window === "undefined") return;

  stopAllAudio();
  const mySeq = activeTtsSeq;
  const chunks = splitSpeechChunks(cleanText, 165);
  if (!chunks.length) return;

  const playChunkAt = (idx) => {
    if (mySeq !== activeTtsSeq || idx >= chunks.length) return;
    const url = `/api/tts?q=${encodeURIComponent(chunks[idx])}`;
    let audio = audioCache.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.preload = "auto";
      if (audioCache.size >= MAX_AUDIO_CACHE) {
        audioCache.delete(audioCache.keys().next().value);
      }
      audioCache.set(url, audio);
    }
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = rate;
    currentAudio = audio;
    audio.onended = () => {
      if (mySeq === activeTtsSeq) playChunkAt(idx + 1);
    };
    audio.onerror = () => {
      if (mySeq === activeTtsSeq) speakWebSpeechFallback(chunks.slice(idx).join(" "), rate);
    };
    audio.play().catch(() => {
      if (mySeq === activeTtsSeq) speakWebSpeechFallback(chunks.slice(idx).join(" "), rate);
    });
  };

  playChunkAt(0);
}

/**
 * Safely binds Enter key on Korean Hangul inputs without firing prematurely
 * while committing a syllable via macOS/Windows/Mobile Korean IME.
 */
export function bindHangulEnter(inputEl, onSubmit) {
  if (!inputEl || typeof onSubmit !== "function") return;
  let composing = false;
  let lastCompEndAt = 0;
  inputEl.addEventListener("compositionstart", () => {
    composing = true;
  });
  inputEl.addEventListener("compositionend", () => {
    composing = false;
    lastCompEndAt = Date.now();
  });
  inputEl.addEventListener("keydown", (e) => {
    if (e.isComposing || e.keyCode === 229 || composing || (Date.now() - lastCompEndAt < 70)) {
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(e);
    }
  });
}

/**
 * Renders concise feedback status with expandable "Xem giải thích" disclosure
 * so full grammar/listening/reading explanations stay accessible without cluttering cards.
 */
export function renderExplainDisclosure({ isCorrect, statusHtml, explainHtml = "", transcriptHtml = "" }) {
  const hasDetail = Boolean((explainHtml && String(explainHtml).trim()) || (transcriptHtml && String(transcriptHtml).trim()));
  return `
    <div class="quiz-feedback-box ${isCorrect ? "is-ok" : "is-err"}">
      <div class="quiz-feedback-head">${statusHtml}</div>
      ${hasDetail ? `
        <details class="explain-details">
          <summary>Xem giải thích</summary>
          <div class="explain-body">
            ${transcriptHtml ? `<div class="ko" style="margin-bottom:5px;"><strong>Lời thoại:</strong> ${transcriptHtml}</div>` : ""}
            ${explainHtml ? `<div>${explainHtml}</div>` : ""}
          </div>
        </details>
      ` : ""}
    </div>
  `;
}

export function renderQuizHistoryPillHTML(quizKey) {
  const info = store.getQuizSummary(quizKey);
  if (!info) return "";
  return `<span class="badge-orange nw" title="Đã làm ${info.attempts} lần">Gần nhất: ${info.lastScore}/${info.maxScore}đ · Cao nhất: ${info.bestScore}/${info.maxScore}đ</span>`;
}
