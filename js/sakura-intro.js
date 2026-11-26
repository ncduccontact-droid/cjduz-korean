// Aesthetic Sakura Wind-Gust Screen Wipe Transition on Page Load
// Sweeps 3D fluttering cherry blossom petals diagonally across a soft veil, wiping open the web underneath.

export function playSakuraPageIntro() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    const pre = document.getElementById("sakura-intro-veil");
    if (pre) pre.remove();
    return;
  }

  let veil = document.getElementById("sakura-intro-veil");
  if (!veil) {
    veil = document.createElement("div");
    veil.id = "sakura-intro-veil";
    document.body.appendChild(veil);
  }
  // Never block touch or click events on mobile/desktop during intro animation
  veil.style.pointerEvents = "none";

  const canvas = document.createElement("canvas");
  canvas.id = "sakura-intro-canvas";
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;";
  document.body.appendChild(canvas);

  // Hard failsafe cleanup so throttled background/low-power mobile tabs always clear overlay
  const failsafeTimer = setTimeout(() => {
    if (veil) { veil.remove(); veil = null; }
    canvas.remove();
  }, 2400);

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = window.innerWidth;
  let H = window.innerHeight;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const PETAL_COLORS = [
    ["#FFD8E6", "#FFB2C9"],
    ["#FFE6F0", "#FFC4D8"],
    ["#DCFCE7", "#6EE7B7"],
    ["#FFF2F7", "#FFD2E2"],
    ["#CCFBF1", "#5EEAD4"]
  ];

  // Create 82 multi-depth sakura petals + 7 full 5-petal blossoms sweeping from bottom-left / left to top-right / right
  const diag = Math.hypot(W, H);
  const count = W < 640 ? 58 : 88;
  const petals = [];

  for (let i = 0; i < count; i++) {
    const depth = Math.random(); // 0 = far small, 1 = close bokeh large
    const waveBand = Math.random(); // clusters thickest around the wipe front
    const isFullFlower = i % 13 === 0;
    const size = isFullFlower
      ? 11 + depth * 10
      : 8 + depth * 16;

    // Spawn staggered off-screen left / top-left so the gust sweeps left -> right with gentle upward-curving S-flow
    const delay = waveBand * 0.62;
    const startX = -60 - Math.random() * (W * 0.45);
    const startY = Math.random() * (H * 1.15) - H * 0.08;
    const speedX = (W + 320) / (0.88 + (1 - depth) * 0.45);
    const speedY = (Math.random() - 0.56) * 190;

    const palette = PETAL_COLORS[i % PETAL_COLORS.length];

    petals.push({
      x: startX,
      y: startY,
      vx: speedX,
      vy: speedY,
      size,
      depth,
      delay,
      isFullFlower,
      cLight: palette[0],
      cDeep: palette[1],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 6.5,
      flipPhase: Math.random() * Math.PI * 2,
      flipSpeed: 4.5 + Math.random() * 5.5,
      swayAmp: 18 + Math.random() * 34,
      swayFreq: 2.8 + Math.random() * 2.5,
      alpha: 0.72 + depth * 0.26
    });
  }

  function drawNotchedSakuraPetal(size, cLight, cDeep) {
    const g = ctx.createLinearGradient(0, -size, 0, size);
    g.addColorStop(0, cLight);
    g.addColorStop(1, cDeep);
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(0, size * 0.95);
    ctx.bezierCurveTo(-size * 0.85, size * 0.35, -size * 0.78, -size * 0.72, -size * 0.17, -size * 0.95);
    // Characteristic sakura heart-notch at petal tip
    ctx.lineTo(0, -size * 0.68);
    ctx.lineTo(size * 0.17, -size * 0.95);
    ctx.bezierCurveTo(size * 0.78, -size * 0.72, size * 0.85, size * 0.35, 0, size * 0.95);
    ctx.closePath();
    ctx.fill();
  }

  function drawFullBlossom(r, cLight, cDeep) {
    for (let k = 0; k < 5; k++) {
      ctx.save();
      ctx.rotate((k * Math.PI * 2) / 5);
      ctx.translate(0, -r * 0.58);
      drawNotchedSakuraPetal(r * 0.56, cLight, cDeep);
      ctx.restore();
    }
    ctx.fillStyle = "#FDE047";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  const TOTAL_DURATION = 2.05; // seconds
  const WIPE_START = 0.22;
  const WIPE_END = 1.18;
  const t0 = performance.now();
  let lastT = t0;
  let veilUnlocked = false;

  function frame(now) {
    const elapsed = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    ctx.clearRect(0, 0, W, H);

    // Update diagonal mask wipe on #sakura-intro-veil so the web reveals right behind the dense petal wave!
    if (veil) {
      const p = Math.max(0, Math.min(1, (elapsed - WIPE_START) / (WIPE_END - WIPE_START)));
      // Smooth cubic ease-in-out
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const pct = Math.round(ease * 145) - 20;
      const maskGrad = `linear-gradient(108deg, transparent 0%, transparent ${pct}%, rgba(0,0,0,0.5) ${pct + 14}%, #000 ${pct + 28}%)`;
      veil.style.webkitMaskImage = maskGrad;
      veil.style.maskImage = maskGrad;

      if (p >= 0.65 && !veilUnlocked) {
        veilUnlocked = true;
        veil.style.pointerEvents = "none";
      }
      if (p >= 1) {
        veil.remove();
        veil = null;
      }
    }

    let alive = 0;
    for (const pt of petals) {
      if (elapsed < pt.delay) {
        alive++;
        continue;
      }
      const localT = elapsed - pt.delay;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt + Math.sin(localT * pt.swayFreq + pt.flipPhase) * pt.swayAmp * dt * 3.2;
      pt.rot += pt.rotSpeed * dt;

      if (pt.x < W + 120) alive++;

      const fadeOut = elapsed > TOTAL_DURATION - 0.45
        ? Math.max(0, (TOTAL_DURATION - elapsed) / 0.45)
        : 1;
      if (fadeOut <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = pt.alpha * fadeOut;
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.rot);

      if (pt.isFullFlower) {
        drawFullBlossom(pt.size, pt.cLight, pt.cDeep);
      } else {
        const scaleY = 0.28 + 0.72 * Math.abs(Math.cos(localT * pt.flipSpeed + pt.flipPhase));
        ctx.scale(1, scaleY);
        ctx.shadowColor = "rgba(244, 114, 182, 0.22)";
        ctx.shadowBlur = pt.depth > 0.7 ? 8 : 0;
        drawNotchedSakuraPetal(pt.size, pt.cLight, pt.cDeep);
      }
      ctx.restore();
    }

    if (elapsed < TOTAL_DURATION && alive > 0) {
      requestAnimationFrame(frame);
    } else {
      clearTimeout(failsafeTimer);
      if (veil) veil.remove();
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
}
