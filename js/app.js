import { store, UI_THEMES, isLocalPreviewHost, playAudio, preloadAudioUrls, speakKoreanTTS } from "./store.js?v=20261127-01";
import { ico, daisyLogoSVG } from "./icons.js?v=20261127-01";
import { conjugateKoreanPredicate } from "./korean-engine.js?v=20261127-01";
import { openAuthModal, renderMandatoryAuthGate, renderOnboardingSurvey } from "./auth-modal.js?v=20261127-01";
import { playSakuraPageIntro } from "./sakura-intro.js?v=20261127-01";
import { buildUrl, parseUrl, getAncestorChain } from "./router.js?v=20261127-01";
import { renderHomeView } from "./views/home.js?v=20261127-01";
import { renderTheoryView } from "./views/theory.js?v=20261127-01";
import { renderRoadmapView, getGuidedStudyPlan } from "./views/roadmap.js?v=20261127-01";
import { renderSkillsPracticeView } from "./views/skills-practice.js?v=20261127-01";
import { renderTopikPracticeView } from "./views/topik-practice.js?v=20261127-01";
import { renderMockTestView } from "./views/mocktest.js?v=20261127-01";
import { renderCheckAndToolsView } from "./views/check-tools.js?v=20261127-01";

const appRoot = document.getElementById("app-root");
const modalRoot = document.getElementById("modal-root");
const trialSlot = document.getElementById("trial-banner-slot");

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
let activeGuidedSession = null; // { day, stepIdx, totalSteps, label }
let isDataBooted = false;
let navWired = false;

const ROUTE_LABELS = {
  home: "Trang chủ",
  theory: "Lý thuyết & Sách 1–6",
  practice: "Luyện tập & Shadowing",
  "mock-test": "Đề thi TOPIK",
  roadmap: "Lộ trình 30 ngày",
  "check-tools": "Công cụ tiếng Hàn"
};

function startGuidedStep(meta) {
  activeGuidedSession = meta;
}

function renderGuidedRibbon() {
  if (!trialSlot) return;

  if (!store.isAuthenticated() && currentRoute === "home") {
    trialSlot.innerHTML = `
      <div class="guided-active-bar">
        <div class="guided-active-inner">
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;min-width:0;flex-wrap:wrap;">
            <span class="badge-orange">${ico("cloud", 13)} Chế độ xem &amp; học nhanh</span>
            <span style="color:var(--text-main);font-weight:600;">Đăng nhập để lưu tiến độ Cloud &amp; cá nhân hóa Quyển 1–6</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <button type="button" class="btn-primary" id="btn-banner-login" style="padding:5px 14px;font-size:12.5px;">
              Đăng nhập / Tạo tài khoản
            </button>
          </div>
        </div>
      </div>
    `;
    trialSlot.querySelector("#btn-banner-login")?.addEventListener("click", () => {
      openAuthModal(modalRoot, "login", () => {
        updateNavUI();
        navigate(currentRoute, currentParams, { replace: true });
      });
    });
    return;
  }

  if (!isDataBooted || currentRoute === "home" || currentRoute === "roadmap") {
    trialSlot.innerHTML = "";
    return;
  }

  // Always compute live Today's next step so even if user entered a tab directly, they see what's next today!
  const plan = getGuidedStudyPlan(db, navigate, startGuidedStep);
  const { activeDay, nextTask } = plan;
  const gDay = activeGuidedSession?.day || activeDay.day;
  const gIdx = activeGuidedSession ? activeGuidedSession.stepIdx : nextTask.stepIdx;
  const dayObj = plan.days.find((d) => d.day === gDay) || activeDay;
  const curStep = dayObj.tasks[gIdx] || nextTask;
  const isLastStepInDay = curStep.stepIdx >= dayObj.totalSteps - 1;

  trialSlot.innerHTML = `
    <div class="guided-active-bar">
      <div class="guided-active-inner">
        <div style="display:flex;align-items:center;gap:8px;font-size:13.5px;min-width:0;">
          <span class="badge-orange" style="padding:2px 9px;font-size:12px;">Ngày ${dayObj.day} · Bước ${curStep.stepIdx + 1}/${dayObj.totalSteps}</span>
          <strong style="color:var(--text-main);">${curStep.label}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button type="button" class="btn-primary" id="btn-complete-guided-step" style="padding:5px 14px;font-size:13px;">
            ${isLastStepInDay ? `🎉 Hoàn thành Ngày ${dayObj.day}` : `✔ Xong bước này · Qua Bước ${curStep.stepIdx + 2} →`}
          </button>
          <button type="button" class="btn-outline-teal" id="btn-guided-back-home" style="padding:5px 11px;font-size:12.5px;">
            Hôm nay học gì?
          </button>
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

  trialSlot.querySelector("#btn-guided-back-home").addEventListener("click", () => {
    navigate("home");
  });
}

function registerCleanup(fn) {
  if (typeof fn === "function") activeCleanups.push(fn);
}

function runViewCleanups() {
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
  if (sIco) sIco.innerHTML = ico("sprout", 16);
  const tIco = document.getElementById("theme-ico");
  if (tIco) tIco.innerHTML = ico("palette", 16);
  const qIco = document.getElementById("search-ico");
  if (qIco) qIco.innerHTML = ico("search", 15);
  const fMascot = document.getElementById("footer-mascot");
  if (fMascot) fMascot.innerHTML = daisyLogoSVG(28);

  document.querySelectorAll("[data-mico]").forEach((el) => {
    el.innerHTML = ico(el.dataset.mico, 19);
  });
}

function renderThemePopover() {
  const pop = document.getElementById("theme-popover");
  if (!pop) return;
  const activeId = store.state.uiTheme || "jade_grad";
  pop.innerHTML = `
    <div style="font-size:12.5px;font-weight:800;color:var(--text-muted);padding:2px 4px 4px;">
      Chọn dải màu Xanh Ngọc (Gradient)
    </div>
    ${UI_THEMES.map((t) => `
      <button type="button" class="theme-opt-btn ${t.id === activeId ? "active" : ""}" data-pick-theme="${t.id}">
        <span style="width:24px;height:24px;border-radius:8px;background:${t.swatch};border:2px solid rgba(0,0,0,0.08);flex-shrink:0;position:relative;">
          <span style="position:absolute;right:-3px;bottom:-3px;width:10px;height:10px;border-radius:50%;background:${t.accent};border:1.5px solid #FFF;"></span>
        </span>
        <span style="line-height:1.25;">
          <strong style="font-size:13.5px;display:block;color:var(--text-main);">${t.name}</strong>
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

function updateNavUI() {
  const authed = store.isAuthenticated();
  renderGuidedRibbon();

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
    dot.title = store.syncStatus === "syncing" ? "Đang lưu lên tài khoản..." : (authed ? "Đã lưu an toàn trên tài khoản" : "Chạm để đăng nhập đồng bộ Cloud");
  }

  const footerBadge = document.getElementById("footer-sync-badge");
  if (footerBadge) {
    if (isLocalPreviewHost() && !store.hasCloudAccount()) {
      footerBadge.innerHTML = `${ico("cloud", 15)} Chế độ Review Local · Đã bỏ qua đăng nhập`;
    } else if (authed) {
      footerBadge.innerHTML = store.syncStatus === "syncing"
        ? `${ico("cloud", 15)} Đang đồng bộ lên tài khoản...`
        : `${ico("cloud", 15)} Tiến độ lưu theo tài khoản (${store.session.user.email})`;
    } else {
      footerBadge.innerHTML = `${ico("cloud", 15)} Đăng nhập để đồng bộ tiến độ lên Cloud`;
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
    appRoot.innerHTML = `<div class="container-web"><div class="box-kind" style="text-align:center;padding:36px;">Đang mở mục <strong>${ROUTE_LABELS[currentRoute] || "học tập"}</strong>...</div></div>`;
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
  if (currentRoute === "roadmap") {
    return renderRoadmapView(appRoot, db, navigate, openProfileSettings);
  }
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
          <strong style="font-size:18px;color:var(--primary-1);">${ico("search", 18)} Tra từ &amp; Chia động từ</strong>
          <button type="button" id="close-quick-modal" style="background:var(--bg-body);border:1.5px solid var(--border-card);width:34px;height:34px;border-radius:10px;font-size:18px;cursor:pointer;">×</button>
        </div>

        <input id="quick-dict-inp" class="ko" value="" placeholder="Nhập tiếng Hàn (학교, 듣다, 춥다...) hoặc tiếng Việt..." style="width:100%;padding:11px 16px;border-radius:14px;border:1.5px solid var(--primary);font-size:15.5px;margin-bottom:14px;" />

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
        <div style="background:var(--primary-3);border:1.5px solid var(--border-card);border-radius:14px;padding:12px 14px;margin-bottom:12px;">
          <strong style="color:var(--primary-4);display:block;margin-bottom:6px;font-size:14px;">Chia tự động "${conj.dictForm}" (${conj.irregularNote}):</strong>
          <div class="grid-2" style="gap:6px;">
            ${conj.forms.slice(0, 6).map((f) => `
              <div style="font-size:13.5px;">• ${f.label}: <strong class="ko" style="color:var(--primary-1);">${f.ko}</strong></div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <div style="display:flex;flex-direction:column;gap:8px;">
        ${matches.length === 0 ? `<div style="color:var(--text-muted);font-size:14px;padding:8px 4px;">Không tìm thấy mục từ khớp với "${q}".</div>` : matches.map((m) => `
          <div style="background:var(--bg-body);border:1px solid var(--border-card);padding:10px 14px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
              <div>
                <strong class="ko" style="font-size:17.5px;color:var(--primary-1);">${m.korean}</strong>
                ${m.pronunciation ? `<span style="font-size:12.5px;color:var(--text-muted);margin-left:6px;">/${m.pronunciation}/</span>` : ""}
                <span style="font-weight:600;margin-left:8px;">${m.vietnamese}</span>
              </div>
              ${m.exampleKo ? `<div class="ko" style="font-size:13px;color:var(--text-muted);margin-top:2px;">${m.exampleKo} — ${m.exampleVi}</div>` : ""}
            </div>
            <button type="button" class="btn-audio" data-mplay="${m.wordAudio || m.exampleAudio || ""}" data-mtts="${m.korean}">${ico("speaker", 16)}</button>
          </div>
        `).join("")}
      </div>
    `;

    resultsSlot.querySelectorAll("[data-mplay]").forEach((b) => {
      b.addEventListener("pointerdown", () => {
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
    if (r === "practice") navigate("practice", { sub: "skills", skill: "shadowing" });
    else if (r === "mock-test") navigate("mock-test", { sub: "topik1", viewMode: "exams", category: "all" });
    else navigate(r);
  };

  // Delegated click handler on document so mobile bottom tabs & desktop pills ALWAYS fire on first tap!
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

  appRoot.innerHTML = `<div class="container-web"><div class="box-kind" style="text-align:center;padding:36px;">Đang tải dữ liệu học tập D ● TOPIK...</div></div>`;

  const [sc1V, sc1G, sjV, tp1, books6Res, fullSys, custom] = await Promise.all([
    safeJsonFetch("/data/sc1_vocab.json", []),
    safeJsonFetch("/data/sc1_grammar.json", []),
    safeJsonFetch("/data/sejong_vocab.json", []),
    safeJsonFetch("/data/topik1_bank.json", []),
    safeJsonFetch("/data/books_1_to_6_curriculum.json", { books: [] }),
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

  // Render immediately so user never waits on cloud auth network roundtrip
  navigate(currentRoute, currentParams, { fromPopState: true });

  // Restore Cloud session in background & refresh UI smoothly if logged in
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
