import { store, UI_THEMES, isLocalPreviewHost, playAudio, preloadAudioUrls, stopAllAudio, speakKoreanTTS, bindHangulEnter } from "./store.js?v=20261127-12";
import { ico, daisyLogoSVG } from "./icons.js?v=20261127-12";
import { conjugateKoreanPredicate } from "./korean-engine.js?v=20261127-12";
import { openAuthModal } from "./auth-modal.js?v=20261127-12";
import { playSakuraPageIntro } from "./sakura-intro.js?v=20261127-12";
import { buildUrl, parseUrl, getAncestorChain } from "./router.js?v=20261127-12";
import { renderHomeView, renderAdminSupportCardHTML, bindAdminSupportCardEvents } from "./views/home.js?v=20261127-12";
import { renderTheoryView } from "./views/theory.js?v=20261127-12";
import { renderRoadmapView, getGuidedStudyPlan } from "./views/roadmap.js?v=20261127-12";
import { renderSkillsPracticeView } from "./views/skills-practice.js?v=20261127-12";
import { renderTopikPracticeView } from "./views/topik-practice.js?v=20261127-12";
import { renderMockTestView } from "./views/mocktest.js?v=20261127-12";
import { renderCheckAndToolsView } from "./views/check-tools.js?v=20261127-12";

const appRoot = document.getElementById("app-root");
const modalRoot = document.getElementById("modal-root");
const trialSlot = document.getElementById("trial-banner-slot");
const bottomSupportSlot = document.getElementById("bottom-support-slot");

const db = {
  sc1Vocab: [],
  sc1Grammar: [],
  sejongVocab: [],
  topik1Bank: [],
  books6: [],
  topikFullSystem: { taxonomy: { topik1: {}, topik2: {} }, itemPool: {}, exams: { topik1: [], topik2: [] } },
  customDecks: [],
  customVocab: []
};

let currentRoute = "home";
let currentParams = {};
let activeCleanups = [];
let activeGuidedSession = null;
let isDataBooted = false;
let navWired = false;

const ROUTE_LABELS = {
  home: "Trang chủ",
  theory: "Giáo trình",
  practice: "Luyện tập",
  "mock-test": "Đề thi TOPIK",
  roadmap: "Lộ trình",
  "check-tools": "Công cụ"
};

function startGuidedStep(meta) {
  activeGuidedSession = meta;
}

function renderGuidedRibbon() {
  if (!trialSlot) return;

  if (!isDataBooted || !activeGuidedSession || currentRoute === "home" || currentRoute === "roadmap") {
    trialSlot.innerHTML = "";
    return;
  }

  const plan = getGuidedStudyPlan(db, navigate, startGuidedStep);
  const { activeDay, nextTask } = plan;
  const gDay = activeGuidedSession.day || activeDay.day;
  const gIdx = activeGuidedSession.stepIdx;
  const dayObj = plan.days.find((d) => d.day === gDay) || activeDay;
  const curStep = dayObj.tasks[gIdx] || nextTask;
  const isLastStepInDay = curStep.stepIdx >= dayObj.totalSteps - 1;

  trialSlot.innerHTML = `
    <div class="guided-active-bar">
      <div class="guided-active-inner" style="flex-wrap:nowrap;">
        <div style="display:flex;align-items:center;gap:8px;font-size:13.5px;min-width:0;flex:1;">
          <span class="badge-orange" style="flex-shrink:0;">Bước ${curStep.stepIdx + 1}/${dayObj.totalSteps}</span>
          <span style="color:var(--text-main);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${curStep.label}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <button type="button" class="btn-primary" id="btn-complete-guided-step" style="min-height:38px;padding:6px 14px;font-size:13px;">
            ${isLastStepInDay ? `Hoàn thành Ngày ${dayObj.day}` : `Bước ${curStep.stepIdx + 2} →`}
          </button>
          <button type="button" id="btn-guided-close" aria-label="Đóng thanh lộ trình" style="background:#F1F5F9;border:none;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;color:var(--text-secondary);">×</button>
        </div>
      </div>
    </div>
  `;

  trialSlot.querySelector("#btn-complete-guided-step").addEventListener("click", () => {
    store.setRoadmapStepDone(dayObj.day, curStep.stepIdx, dayObj.totalSteps, true);
    const updatedPlan = getGuidedStudyPlan(db, navigate, startGuidedStep);
    if (isLastStepInDay) {
      activeGuidedSession = null;
      navigate("home");
    } else {
      const nextInSameDay = updatedPlan.days.find((d) => d.day === dayObj.day)?.tasks.find((t) => !t.done);
      if (nextInSameDay) nextInSameDay.go();
      else {
        activeGuidedSession = null;
        navigate("home");
      }
    }
  });

  trialSlot.querySelector("#btn-guided-close").addEventListener("click", () => {
    activeGuidedSession = null;
    renderGuidedRibbon();
  });
}

function registerCleanup(fn) {
  if (typeof fn === "function") activeCleanups.push(fn);
}

function runViewCleanups() {
  stopAllAudio();
  while (activeCleanups.length > 0) {
    const fn = activeCleanups.pop();
    try { fn(); } catch {}
  }
  if (window._cjduzArenaKeyHandler) {
    window.removeEventListener("keydown", window._cjduzArenaKeyHandler);
    window._cjduzArenaKeyHandler = null;
  }
}

function hydrateStaticChromeIcons() {
  const sIco = document.getElementById("streak-ico");
  if (sIco) sIco.innerHTML = ico("sprout", 18);
  const tIco = document.getElementById("theme-ico");
  if (tIco) tIco.innerHTML = ico("palette", 18);
  const qIco = document.getElementById("search-ico");
  if (qIco) qIco.innerHTML = ico("search", 17);
  const fMascot = document.getElementById("footer-mascot");
  if (fMascot) fMascot.innerHTML = daisyLogoSVG(24);

  document.querySelectorAll("[data-dico]").forEach((el) => {
    el.innerHTML = ico(el.dataset.dico, 17);
  });

  document.querySelectorAll("[data-mico]").forEach((el) => {
    el.innerHTML = ico(el.dataset.mico, 20);
  });
}

function renderThemePopover() {
  const pop = document.getElementById("theme-popover");
  if (!pop) return;
  const activeId = store.state.uiTheme || "jade_grad";
  pop.innerHTML = `
    <div style="font-size:12px;font-weight:700;color:var(--text-muted);padding:2px 4px 4px;">
      Chọn dải màu Xanh Ngọc
    </div>
    ${UI_THEMES.map((t) => `
      <button type="button" class="theme-opt-btn ${t.id === activeId ? "active" : ""}" data-pick-theme="${t.id}">
        <span style="width:22px;height:22px;border-radius:7px;background:${t.swatch};border:1.5px solid rgba(15,23,42,0.08);flex-shrink:0;"></span>
        <span style="line-height:1.25;">
          <strong style="font-size:13px;display:block;color:var(--text-main);">${t.name}</strong>
          <span style="font-size:11.5px;color:var(--text-muted);">${t.desc}</span>
        </span>
      </button>
    `).join("")}
  `;

  pop.querySelectorAll("[data-pick-theme]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      store.setTheme(btn.dataset.pickTheme);
      renderThemePopover();
    });
  });
}

function renderBottomSupportSlot() {
  if (!bottomSupportSlot) return;
  const nonHomeRoutes = ["theory", "practice", "mock-test", "roadmap", "check-tools"];
  if (!nonHomeRoutes.includes(currentRoute)) {
    bottomSupportSlot.innerHTML = "";
    return;
  }
  const wrapCls = currentRoute === "roadmap" ? "bottom-support-wrap narrow" : "bottom-support-wrap";
  bottomSupportSlot.innerHTML = `<div class="${wrapCls}">${renderAdminSupportCardHTML()}</div>`;
  bindAdminSupportCardEvents(bottomSupportSlot, modalRoot);
}

function updateNavUI() {
  const authed = store.isAuthenticated();
  renderGuidedRibbon();
  renderBottomSupportSlot();

  document.querySelectorAll(".nav-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.route === currentRoute);
  });
  document.querySelectorAll(".mobile-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mroute === currentRoute);
  });

  const streakEl = document.getElementById("streak-count");
  if (streakEl) {
    streakEl.textContent = `${store.state.streak || 1} ngày`;
  }

  const dot = document.getElementById("cloud-sync-dot");
  if (dot) {
    dot.classList.toggle("syncing", store.syncStatus === "syncing");
    dot.title = store.syncStatus === "syncing" ? "Đang lưu..." : (authed ? "Đã lưu tiến độ" : "Đăng nhập đồng bộ");
  }

  const footerBadge = document.getElementById("footer-sync-badge");
  if (footerBadge) {
    if (isLocalPreviewHost() && !store.hasCloudAccount()) {
      footerBadge.textContent = "Chế độ Local · Tự động lưu trên trình duyệt";
    } else if (authed) {
      footerBadge.textContent = store.syncStatus === "syncing"
        ? "Đang đồng bộ..."
        : `Đã lưu (${store.session.user.email})`;
    } else {
      footerBadge.textContent = "Đăng nhập để lưu Cloud";
    }
  }

  const userLabel = document.getElementById("nav-user-label");
  if (userLabel) {
    userLabel.textContent = authed ? store.session.user.name : "Đăng nhập";
  }
  renderThemePopover();
}

export function navigate(route, params = {}, opts = {}) {
  runViewCleanups();
  if (modalRoot && !opts.keepModal) {
    modalRoot.innerHTML = "";
  }
  currentRoute = route || "home";
  currentParams = params || {};

  const targetUrl = buildUrl(currentRoute, currentParams);
  if (!opts.fromPopState) {
    if (opts.replace) {
      window.history.replaceState({ cjduz: true, path: targetUrl }, "", targetUrl);
    } else if (window.location.pathname !== targetUrl) {
      window.history.pushState({ cjduz: true, path: targetUrl }, "", targetUrl);
    }
  }

  updateNavUI();
  window.scrollTo({ top: 0, behavior: "auto" });

  if (!isDataBooted) {
    appRoot.innerHTML = `<div class="container-web"><div class="box-kind" style="text-align:center;padding:36px;">Đang mở <strong>${ROUTE_LABELS[currentRoute] || "bài học"}</strong>...</div></div>`;
    return;
  }

  const openProfileSettings = () => {
    openAuthModal(modalRoot, store.isAuthenticated() ? "profile" : "login", () => {
      updateNavUI();
      navigate(currentRoute, currentParams, { replace: true });
    });
  };

  if (currentRoute === "home") return renderHomeView(appRoot, db, navigate, startGuidedStep, openProfileSettings, modalRoot);
  if (currentRoute === "theory") return renderTheoryView(appRoot, db, navigate, currentParams);
  if (currentRoute === "roadmap") return renderRoadmapView(appRoot, db, navigate, openProfileSettings);
  if (currentRoute === "practice") {
    if (currentParams.sub === "topik1" || currentParams.sub === "topik2") {
      return renderTopikPracticeView(appRoot, db, navigate, currentParams, registerCleanup);
    }
    return renderSkillsPracticeView(appRoot, db, navigate, currentParams);
  }
  if (currentRoute === "mock-test") return renderMockTestView(appRoot, db, navigate, currentParams, registerCleanup);
  if (currentRoute === "check-tools") return renderCheckAndToolsView(appRoot, db, navigate, currentParams);
  return renderHomeView(appRoot, db, navigate, startGuidedStep, openProfileSettings, modalRoot);
}

function initHierarchicalHistory() {
  const initialPath = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
  if (!window.history.state?.cjduz) {
    const chain = getAncestorChain(initialPath);
    window.history.replaceState({ cjduz: true, rootFloor: true, path: "/" }, "", "/");
    for (const stepPath of chain) {
      window.history.pushState({ cjduz: true, path: stepPath }, "", stepPath);
    }
  }

  window.addEventListener("popstate", (ev) => {
    if (modalRoot && modalRoot.innerHTML.trim() !== "") {
      modalRoot.innerHTML = "";
    }
    if (ev.state?.rootFloor) {
      window.history.pushState({ cjduz: true, path: "/" }, "", "/");
      navigate("home", {}, { fromPopState: true });
      return;
    }
    const parsed = parseUrl(window.location.pathname);
    navigate(parsed.route, parsed.params, { fromPopState: true });
  });
}

function openQuickLookupModal() {
  const extraBookWords = (db.books6 || []).filter((b) => b.bookId !== "q1").flatMap((b) => b.vocab || []);
  const allItems = [...db.sc1Vocab, ...extraBookWords, ...db.sejongVocab, ...db.topik1Bank, ...db.customVocab];
  let q = "";

  modalRoot.innerHTML = `
    <div class="modal-backdrop" id="quick-modal-bg">
      <div class="modal-panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <strong style="font-size:17px;color:var(--text-main);">Tra từ &amp; Chia động từ</strong>
          <button type="button" id="close-quick-modal" aria-label="Đóng tra từ" style="background:#F1F5F9;border:none;width:38px;height:38px;border-radius:50%;font-size:18px;cursor:pointer;color:var(--text-secondary);">×</button>
        </div>

        <input id="quick-dict-inp" class="ko" value="" placeholder="Nhập tiếng Hàn (학교, 듣다, 춥다...) hoặc nghĩa tiếng Việt..." style="width:100%;padding:12px 15px;border-radius:12px;font-size:15.5px;margin-bottom:14px;" />

        <div id="quick-dict-results"></div>
      </div>
    </div>
  `;

  const resultsSlot = modalRoot.querySelector("#quick-dict-results");
  const inp = modalRoot.querySelector("#quick-dict-inp");

  function renderLookupResults() {
    const cleanQ = q.trim().toLowerCase();
    const matches = cleanQ
      ? allItems.filter((w) =>
          w.korean.toLowerCase().includes(cleanQ) ||
          w.vietnamese.toLowerCase().includes(cleanQ) ||
          (w.pronunciation || "").toLowerCase().includes(cleanQ)
        ).slice(0, 10)
      : allItems.slice(0, 6);

    preloadAudioUrls(matches.map((m) => m.wordAudio || m.exampleAudio).filter(Boolean));
    const conj = cleanQ.endsWith("다") ? conjugateKoreanPredicate(cleanQ) : null;

    resultsSlot.innerHTML = `
      ${conj ? `
        <div style="background:var(--primary-3);border:1px solid var(--powder-border);border-radius:12px;padding:12px 14px;margin-bottom:12px;">
          <strong style="color:var(--text-main);display:block;margin-bottom:6px;font-size:13.5px;">Chia động từ "${conj.dictForm}" (${conj.irregularNote})</strong>
          <div class="grid-2" style="gap:6px;">
            ${conj.forms.slice(0, 6).map((f) => `
              <div style="font-size:13.5px;">• ${f.label}: <strong class="ko" style="color:var(--primary-1);">${f.ko}</strong></div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <div style="display:flex;flex-direction:column;gap:8px;">
        ${matches.length === 0 ? `<div style="color:var(--text-muted);font-size:14.5px;padding:8px 4px;">Không tìm thấy từ khớp với "${q}".</div>` : matches.map((m) => `
          <div style="background:#F8FAFC;border:1px solid var(--border-light);padding:11px 14px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
              <div>
                <strong class="ko" style="font-size:17.5px;color:var(--primary-1);">${m.korean}</strong>
                ${m.pronunciation ? `<span style="font-size:12.5px;color:var(--text-muted);margin-left:6px;">/${m.pronunciation}/</span>` : ""}
                <span style="font-weight:600;margin-left:8px;">${m.vietnamese}</span>
              </div>
              ${m.exampleKo ? `<div class="ko" style="font-size:13.5px;color:var(--text-muted);margin-top:3px;">${m.exampleKo} — ${m.exampleVi}</div>` : ""}
            </div>
            <button type="button" class="btn-audio" aria-label="Nghe ${m.korean}" data-mplay="${m.wordAudio || m.exampleAudio || ""}" data-mtts="${m.korean}">${ico("speaker", 16)}</button>
          </div>
        `).join("")}
      </div>
    `;

    resultsSlot.querySelectorAll("[data-mplay]").forEach((b) => {
      b.addEventListener("click", () => {
        if (b.dataset.mplay) playAudio(b.dataset.mplay);
        else speakKoreanTTS(b.dataset.mtts);
      });
    });
  }

  renderLookupResults();
  inp.focus();
  inp.addEventListener("input", (e) => {
    q = e.target.value;
    renderLookupResults();
  });
  bindHangulEnter(inp, () => {
    renderLookupResults();
  });
  inp.addEventListener("keydown", (e) => {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === "Escape") modalRoot.innerHTML = "";
  });

  modalRoot.querySelector("#close-quick-modal").addEventListener("click", () => { modalRoot.innerHTML = ""; });
  modalRoot.querySelector("#quick-modal-bg").addEventListener("click", (e) => {
    if (e.target.id === "quick-modal-bg") modalRoot.innerHTML = "";
  });
}

function wireNavigationEventsOnce() {
  if (navWired) return;
  navWired = true;

  const themeWrap = document.getElementById("theme-menu-wrap");
  const themeBtn = document.getElementById("btn-theme-toggle");
  if (themeBtn && themeWrap) {
    themeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      renderThemePopover();
      themeWrap.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!themeWrap.contains(e.target)) themeWrap.classList.remove("open");
    });
  }

  const triggerRouteFromNav = (r) => {
    activeGuidedSession = null;
    if (r === "practice") navigate("practice", { sub: "skills", skill: "translate" });
    else if (r === "mock-test") navigate("mock-test", { sub: "topik1", viewMode: "exams", category: "all" });
    else navigate(r);
  };

  document.addEventListener("click", (e) => {
    const mBtn = e.target.closest(".mobile-tab-btn[data-mroute]");
    if (mBtn) {
      e.preventDefault();
      triggerRouteFromNav(mBtn.dataset.mroute);
      return;
    }

    const dropBtn = e.target.closest(".dropdown-link[data-route]");
    if (dropBtn) {
      e.preventDefault();
      e.stopPropagation();
      const params = { sub: dropBtn.dataset.sub };
      if (dropBtn.dataset.vmode) params.viewMode = dropBtn.dataset.vmode;
      if (dropBtn.dataset.cat) params.category = dropBtn.dataset.cat;
      navigate(dropBtn.dataset.route, params);
      return;
    }

    const dBtn = e.target.closest(".nav-pill[data-route]");
    if (dBtn) {
      e.preventDefault();
      triggerRouteFromNav(dBtn.dataset.route);
      return;
    }

    if (e.target.closest("#brand-home-btn")) {
      navigate("home");
    }
  });

  document.getElementById("open-quick-tool-btn")?.addEventListener("click", openQuickLookupModal);
  document.getElementById("open-auth-btn")?.addEventListener("click", () => {
    openAuthModal(modalRoot, store.isAuthenticated() ? "profile" : "login", () => {
      updateNavUI();
      navigate(currentRoute, currentParams, { replace: true });
    });
  });
}

function safeJsonFetch(url, fallback) {
  return fetch(url)
    .then((r) => (r.ok ? r.json() : fallback))
    .catch(() => fallback);
}

async function initApp() {
  store.init();
  playSakuraPageIntro();
  hydrateStaticChromeIcons();

  const initialParsed = parseUrl(window.location.pathname);
  currentRoute = initialParsed.route;
  currentParams = initialParsed.params;

  initHierarchicalHistory();
  wireNavigationEventsOnce();
  updateNavUI();

  appRoot.innerHTML = `<div class="container-web"><div class="box-kind" style="text-align:center;padding:36px;">Đang tải dữ liệu học tập...</div></div>`;

  const [sc1V, sc1G, sjV, tp1, books6Res, fullSys, custom] = await Promise.all([
    safeJsonFetch("/data/sc1_vocab.json", []),
    safeJsonFetch("/data/sc1_grammar.json", []),
    safeJsonFetch("/data/sejong_vocab.json", []),
    safeJsonFetch("/data/topik1_bank.json", []),
    safeJsonFetch("/data/books_1_to_6_curriculum.json?v=20261127-12", { books: [] }),
    safeJsonFetch("/data/topik_full_system.json", { taxonomy: { topik1: {}, topik2: {} }, itemPool: {}, exams: { topik1: [], topik2: [] } }),
    safeJsonFetch("/api/custom-decks", [])
  ]);

  db.sc1Vocab = sc1V || [];
  db.sc1Grammar = sc1G || [];
  db.sejongVocab = sjV || [];
  db.topik1Bank = tp1 || [];
  db.books6 = books6Res?.books || [];
  db.topikFullSystem = fullSys || { taxonomy: { topik1: {}, topik2: {} }, itemPool: {}, exams: { topik1: [], topik2: [] } };
  db.customDecks = custom || [];
  db.customVocab = (custom || []).flatMap((d) => d.items || []);

  isDataBooted = true;
  store.subscribe(updateNavUI);

  navigate(currentRoute, currentParams, { fromPopState: true });

  store.restoreCloudSession().then(() => {
    if (store.isAuthenticated()) {
      store.touchStreak();
      preloadAudioUrls(db.sc1Vocab.slice(0, 16).map((w) => w.wordAudio));
    }
    updateNavUI();
    if (currentRoute === "home" || currentRoute === "roadmap") {
      navigate(currentRoute, currentParams, { replace: true, keepModal: true });
    }
  }).catch(() => {});
}

initApp();
