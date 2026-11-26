const GUEST_STORAGE_KEY = "hanmastery_migii_state_v1";
const AUTH_SESSION_KEY = "cjduz_auth_session_v1";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const DEFAULT_ROADMAP_PROFILE = {
  startStage: "sc1",        // zero | sc1 | sc2 | tc3
  focusTrack: "balanced",   // balanced | topik_intensive | speaking_first
  dailyMinutes: 30,         // 15 | 30 | 60
  targetLevel: "TOPIK II - Cấp 4",
  examDate: "2027-04-18"
};

function createFreshState(roadmapProfile = DEFAULT_ROADMAP_PROFILE) {
  return {
    targetLevel: roadmapProfile.targetLevel || "TOPIK II - Cấp 4",
    examDate: roadmapProfile.examDate || "2027-04-18",
    roadmapProfile: { ...DEFAULT_ROADMAP_PROFILE, ...roadmapProfile },
    lastLesson: roadmapProfile.startStage === "zero"
      ? { book: "sc1", lesson: 1, title: "Nhập môn Hangeul & Bài 01" }
      : (roadmapProfile.startStage === "sc2"
        ? { book: "topik1", lesson: 1, title: "Chặng 1 · Từ vựng & Câu TOPIK I" }
        : { book: "sc1", lesson: 1, title: "Bài 01 · Giới thiệu" }),
    streak: 1,
    lastActiveDate: todayISO(),
    srs: {},
    completedLessons: {},
    roadmapDone: {},
    partStats: {},
    mistakes: [],
    examHistory: [],
    geminiApiKey: ""
  };
}

function loadSessionMeta() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return { mode: "trial", token: "", user: null, trialStartedAt: Date.now() };
    return JSON.parse(raw);
  } catch {
    return { mode: "trial", token: "", user: null, trialStartedAt: Date.now() };
  }
}

function stateKeyForSession(sess) {
  if (sess?.mode === "user" && sess?.user?.id) {
    return `cjduz_user_state_${sess.user.id}`;
  }
  return GUEST_STORAGE_KEY;
}

let syncTimer = null;

export const store = {
  session: loadSessionMeta(),
  state: createFreshState(),
  listeners: new Set(),

  init() {
    this.state = this.loadStateForCurrentSession();
    // Save initial trial timestamp if first visit
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.session));
  },

  loadStateForCurrentSession() {
    try {
      const raw = localStorage.getItem(stateKeyForSession(this.session));
      if (!raw) return createFreshState();
      const parsed = JSON.parse(raw);
      return {
        ...createFreshState(parsed.roadmapProfile),
        ...parsed,
        roadmapProfile: { ...DEFAULT_ROADMAP_PROFILE, ...(parsed.roadmapProfile || {}) }
      };
    } catch {
      return createFreshState();
    }
  },

  save(skipCloud = false) {
    localStorage.setItem(stateKeyForSession(this.session), JSON.stringify(this.state));
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.session));
    this.listeners.forEach((fn) => fn(this.state, this.session));

    if (!skipCloud && this.session.mode === "user" && this.session.token) {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        fetch("/api/user/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.session.token}`
          },
          body: JSON.stringify({ state: this.state })
        }).catch(() => {});
      }, 450);
    }
  },

  applyAuthenticatedUser(token, userObj) {
    const serverState = userObj.state && Object.keys(userObj.state).length > 0
      ? userObj.state
      : createFreshState(userObj.roadmapProfile || DEFAULT_ROADMAP_PROFILE);

    this.session = {
      mode: "user",
      token,
      user: {
        id: userObj.id,
        email: userObj.email,
        name: userObj.name,
        avatar: userObj.avatar || "",
        authProvider: userObj.authProvider || "email"
      },
      trialStartedAt: this.session.trialStartedAt || Date.now()
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
    this.save(false);
  },

  logoutToTrial() {
    this.session = { mode: "trial", token: "", user: null, trialStartedAt: Date.now() };
    this.state = this.loadStateForCurrentSession();
    this.save(true);
  },

  updateRoadmapProfile(newProfile, resetCheckedDays = false) {
    this.state.roadmapProfile = {
      ...DEFAULT_ROADMAP_PROFILE,
      ...(this.state.roadmapProfile || {}),
      ...newProfile
    };
    if (newProfile.targetLevel) this.state.targetLevel = newProfile.targetLevel;
    if (newProfile.examDate) this.state.examDate = newProfile.examDate;
    if (resetCheckedDays) this.state.roadmapDone = {};
    this.save();
  },

  async restoreCloudSession() {
    if (this.session.mode !== "user" || !this.session.token) return;
    try {
      const res = await fetch("/api/user/me", {
        headers: { "Authorization": `Bearer ${this.session.token}` }
      });
      if (!res.ok) {
        this.logoutToTrial();
        return;
      }
      const data = await res.json();
      if (data.ok && data.user) {
        this.applyAuthenticatedUser(this.session.token, data.user);
      }
    } catch {
      // Offline graceful fallback keeps local user cache
    }
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

let currentAudio = null;
export function playAudio(src, rate = 1.0) {
  if (!src) return null;
  if (currentAudio) {
    currentAudio.pause();
  }
  const cleanSrc = src.startsWith("/") ? src : `/${src}`;
  const audio = new Audio(cleanSrc);
  audio.playbackRate = rate;
  currentAudio = audio;
  audio.play().catch(() => {});
  return audio;
}

export function speakKoreanTTS(text, rate = 0.95) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}
