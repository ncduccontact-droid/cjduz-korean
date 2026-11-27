// Clean page entry helper (decorative falling petals removed to keep reading & CTAs crisp)
export function playSakuraPageIntro() {
  if (typeof document === "undefined") return;
  const pre = document.getElementById("sakura-intro-veil");
  if (pre) pre.remove();
  const canvas = document.getElementById("sakura-intro-canvas");
  if (canvas) canvas.remove();
}
