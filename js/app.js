import { store, playAudio, preloadAudioUrls, speakKoreanTTS } from "./store.js";
import { conjugateKoreanPredicate } from "./korean-engine.js";
import { openAuthModal, renderMandatoryAuthGate } from "./auth-modal.js";
import { buildUrl, parseUrl, getAncestorChain } from "./router.js";
import { renderHomeView } from "./views/home.js";
import { renderTheoryView } from "./views/theory.js";
import { renderRoadmapView } from "./views/roadmap.js";
import { renderSkillsPracticeView } from "./views/skills-practice.js";
import { renderTopikPracticeView } from "./views/topik-practice.js";
import { renderMockTestView } from "./views/mocktest.js";
import { renderCheckAndToolsView } from "./views/check-tools.js";

const appRoot = document.getElementById("app-root");
const modalRoot = document.getElementById("modal-root");
const trialSlot = document.getElementById("trial-banner-slot");

const db = {
  sc1Vocab: [],
  sc1Grammar: [],
  sejongVocab: [],
  topik1Bank: [],
  topikFullSystem: { taxonomy: { topik1: {}, topik2: {} }, itemPool: {}, exams: { topik1: [], topik2: [] } },
  customDecks: [],
  customVocab: []
};

let currentRoute = "home";
let currentParams = {};
let activeCleanups = [];

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

function updateNavUI() {
  const authed = store.isAuthenticated();
  if (trialSlot) trialSlot.innerHTML = "";

  document.querySelectorAll(".nav-pill").forEach((pill) => {
    pill.classList.toggle("active", authed && pill.dataset.route === currentRoute);
  });
  document.querySelectorAll(".mobile-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", authed && btn.dataset.mroute === currentRoute);
  });

  const streakEl = document.getElementById("streak-count");
  if (streakEl) {
    streakEl.textContent = `${store.state.streak || 1} ngày`;
  }

  const userLabel = document.getElementById("nav-user-label");
  if (userLabel) {
    userLabel.textContent = authed ? store.session.user.name : "Đăng ký / Đăng nhập";
  }
}

export function navigate(route, params = {}, opts = {}) {
  runViewCleanups();
  currentRoute = route;
  currentParams = params;

  const targetUrl = buildUrl(route, params);
  if (!opts.fromPopState) {
    if (opts.replace) {
      window.history.replaceState({ cjduz: true, path: targetUrl }, "", targetUrl);
    } else if (window.location.pathname !== targetUrl) {
      window.history.pushState({ cjduz: true, path: targetUrl }, "", targetUrl);
    }
  }

  updateNavUI();
  window.scrollTo({ top: 0, behavior: "smooth" });

  // MANDATORY EMAIL AUTH GATE
  if (!store.isAuthenticated()) {
    return renderMandatoryAuthGate(appRoot, () => {
      updateNavUI();
      preloadAudioUrls(db.sc1Vocab.slice(0, 16).map((w) => w.wordAudio));
      navigate(currentRoute, currentParams, { replace: true });
    });
  }

  if (route === "home") return renderHomeView(appRoot, db, navigate);
  if (route === "theory") return renderTheoryView(appRoot, db, navigate, params);
  if (route === "roadmap") {
    return renderRoadmapView(appRoot, db, navigate, () => {
      openAuthModal(modalRoot, "profile", () => navigate("roadmap", {}, { replace: true }));
    });
  }
  if (route === "practice") {
    if (params.sub === "topik1" || params.sub === "topik2") {
      return renderTopikPracticeView(appRoot, db, navigate, params, registerCleanup);
    }
    return renderSkillsPracticeView(appRoot, db, navigate, params);
  }
  if (route === "mock-test") return renderMockTestView(appRoot, db, navigate, params, registerCleanup);
  if (route === "check-tools") return renderCheckAndToolsView(appRoot, db, navigate, params);
}

function initHierarchicalHistory() {
  const initialPath = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
  if (!window.history.state?.cjduz) {
    const chain = getAncestorChain(initialPath);
    // Floor guard at "/" so pressing Back from sub-layers steps back layer by layer to "/" without exiting the site
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
      // Re-anchor "/" so an accidental extra swipe-back on Home stays inside the app
      window.history.pushState({ cjduz: true, path: "/" }, "", "/");
      navigate("home", {}, { fromPopState: true });
      return;
    }
    const parsed = parseUrl(window.location.pathname);
    navigate(parsed.route, parsed.params, { fromPopState: true });
  });
}

function openQuickLookupModal() {
  if (!store.isAuthenticated()) {
    navigate("home");
    return;
  }
  const allItems = [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank, ...db.customVocab];
  let q = "";

  function drawModal() {
    const cleanQ = q.trim().toLowerCase();
    const matches = cleanQ
      ? allItems.filter((w) =>
          w.korean.toLowerCase().includes(cleanQ) ||
          w.vietnamese.toLowerCase().includes(cleanQ) ||
          (w.pronunciation || "").toLowerCase().includes(cleanQ)
        ).slice(0, 12)
      : allItems.slice(0, 6);

    preloadAudioUrls(matches.map((m) => m.wordAudio || m.exampleAudio).filter(Boolean));
    const conj = cleanQ.endsWith("다") ? conjugateKoreanPredicate(cleanQ) : null;

    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="quick-modal-bg">
        <div class="modal-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <strong style="font-size:19px;color:var(--primary-1);">🔎 Tra từ nhanh Hàn – Việt &amp; Chia Động/Tính từ</strong>
            <button type="button" id="close-quick-modal" style="background:#F2F4F7;border:none;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;">×</button>
          </div>

          <input id="quick-dict-inp" class="ko" value="${q}" placeholder="Nhập tiếng Hàn (VD: 학교, 듣다, 춥다, 어떻다) hoặc nghĩa tiếng Việt..." style="width:100%;padding:12px 18px;border-radius:99px;border:2px solid var(--primary);font-size:16px;margin-bottom:16px;" />

          ${conj ? `
            <div style="background:var(--primary-3);border-radius:12px;padding:12px 16px;margin-bottom:14px;">
              <strong style="color:var(--primary-4);display:block;margin-bottom:6px;">⚡ Bảng chia tự động "${conj.dictForm}" (${conj.irregularNote}):</strong>
              <div class="grid-2">
                ${conj.forms.slice(0, 6).map((f) => `
                  <div style="font-size:13.5px;">• ${f.label}: <strong class="ko" style="color:var(--primary-1);">${f.ko}</strong></div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <div style="display:flex;flex-direction:column;gap:10px;">
            ${matches.map((m) => `
              <div style="background:#F8FAFB;padding:12px 14px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                <div>
                  <div>
                    <strong class="ko" style="font-size:18px;color:var(--primary-1);">${m.korean}</strong>
                    ${m.pronunciation ? `<span style="font-size:13px;color:var(--text-muted);margin-left:6px;">/${m.pronunciation}/</span>` : ""}
                    <span style="font-weight:600;margin-left:8px;">— ${m.vietnamese}</span>
                  </div>
                  ${m.exampleKo ? `<div class="ko" style="font-size:13.5px;color:var(--text-muted);margin-top:3px;">${m.exampleKo} (${m.exampleVi})</div>` : ""}
                </div>
                <button class="btn-audio" data-mplay="${m.wordAudio || m.exampleAudio}" data-mtts="${m.korean}">🔊</button>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    const inp = modalRoot.querySelector("#quick-dict-inp");
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
    inp.addEventListener("input", (e) => { q = e.target.value; drawModal(); });

    modalRoot.querySelector("#close-quick-modal").addEventListener("click", () => { modalRoot.innerHTML = ""; });
    modalRoot.querySelector("#quick-modal-bg").addEventListener("click", (e) => {
      if (e.target.id === "quick-modal-bg") modalRoot.innerHTML = "";
    });
    modalRoot.querySelectorAll("[data-mplay]").forEach((b) => {
      b.addEventListener("pointerdown", () => {
        if (b.dataset.mplay) playAudio(b.dataset.mplay);
        else speakKoreanTTS(b.dataset.mtts);
      });
    });
  }

  drawModal();
}

async function initApp() {
  appRoot.innerHTML = `<div class="container-web"><div class="box-kind" style="text-align:center;padding:40px;">⏳ Đang tải hệ thống CJDUZ Korean &amp; Kho 30 Full Đề TOPIK (70 &amp; 104 câu)...</div></div>`;

  const [sc1V, sc1G, sjV, tp1, fullSys, custom] = await Promise.all([
    fetch("/data/sc1_vocab.json").then((r) => r.json()),
    fetch("/data/sc1_grammar.json").then((r) => r.json()),
    fetch("/data/sejong_vocab.json").then((r) => r.json()),
    fetch("/data/topik1_bank.json").then((r) => r.json()),
    fetch("/data/topik_full_system.json").then((r) => r.json()).catch(() => ({ taxonomy: { topik1: {}, topik2: {} }, itemPool: {}, exams: { topik1: [], topik2: [] } })),
    fetch("/api/custom-decks").then((r) => r.json()).catch(() => [])
  ]);

  db.sc1Vocab = sc1V;
  db.sc1Grammar = sc1G;
  db.sejongVocab = sjV;
  db.topik1Bank = tp1;
  db.topikFullSystem = fullSys;
  db.customDecks = custom;
  db.customVocab = custom.flatMap((d) => d.items || []);

  await store.restoreCloudSession();
  if (store.isAuthenticated()) {
    store.touchStreak();
    preloadAudioUrls(db.sc1Vocab.slice(0, 16).map((w) => w.wordAudio));
  }
  store.subscribe(updateNavUI);

  document.getElementById("brand-home-btn").addEventListener("click", () => navigate("home"));
  document.querySelectorAll(".nav-pill[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = btn.dataset.route;
      if (r === "practice") navigate("practice", { sub: "skills", skill: "shadowing" });
      else if (r === "mock-test") navigate("mock-test", { sub: "topik1", viewMode: "exams", category: "all" });
      else navigate(r);
    });
  });

  document.querySelectorAll(".mobile-tab-btn[data-mroute]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = btn.dataset.mroute;
      if (r === "practice") navigate("practice", { sub: "skills", skill: "shadowing" });
      else if (r === "mock-test") navigate("mock-test", { sub: "topik1", viewMode: "exams", category: "all" });
      else navigate(r);
    });
  });

  document.querySelectorAll(".dropdown-link[data-route]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const params = { sub: btn.dataset.sub };
      if (btn.dataset.vmode) params.viewMode = btn.dataset.vmode;
      if (btn.dataset.cat) params.category = btn.dataset.cat;
      navigate(btn.dataset.route, params);
    });
  });

  document.getElementById("open-quick-tool-btn").addEventListener("click", openQuickLookupModal);
  document.getElementById("open-auth-btn").addEventListener("click", () => {
    if (!store.isAuthenticated()) {
      navigate("home");
      return;
    }
    openAuthModal(modalRoot, "profile", () => {
      updateNavUI();
      navigate(currentRoute, currentParams, { replace: true });
    });
  });

  initHierarchicalHistory();
  const initialRoute = parseUrl(window.location.pathname);
  navigate(initialRoute.route, initialRoute.params, { fromPopState: true });
}

initApp();
