import { ico, daisyLogoSVG } from "./icons.js?v=20261127-09";

// Temporarily locked while refreshing original licensed audio/video content
export const YOUTUBE_SHORTS_CLIPS = [];

export function renderShortsShadowingStudio(stage, _db, onPickOtherSkill = null) {
  if (!stage) return;

  stage.innerHTML = `
    <div class="box-kind" style="max-width:620px;margin:8px auto 0;padding:clamp(28px,5vw,42px) clamp(18px,4vw,32px);text-align:center;">
      <div style="display:inline-flex;align-items:center;justify-content:center;position:relative;margin-bottom:14px;">
        ${daisyLogoSVG(64)}
        <span style="position:absolute;right:-8px;bottom:-4px;background:#FFFFFF;border:1px solid var(--border-card);border-radius:50%;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(15,23,42,0.08);">
          ${ico("lock", 18)}
        </span>
      </div>

      <div style="margin-bottom:8px;">
        <span class="badge-orange">${ico("lock", 13)} Tạm khóa tính năng</span>
      </div>

      <h2 style="margin:0 0 8px;font-size:clamp(19px,4.5vw,23px);font-weight:800;color:var(--text-main);letter-spacing:-0.01em;">
        Đang nâng cấp, đợi tớ nhé
      </h2>

      <p style="margin:0 auto 20px;max-width:440px;font-size:14px;line-height:1.6;color:var(--text-muted);">
        Phần Shadowing đang được tớ làm mới kho nội dung riêng. Trong lúc chờ, cậu luyện các kỹ năng bên dưới trước nha!
      </p>

      <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
        <button type="button" class="btn-primary" data-alt-skill="translate">
          ${ico("pen", 16)} Dịch câu &amp; Bài tập
        </button>
        <button type="button" class="btn-soft-jade" data-alt-skill="listening">
          ${ico("headphones", 16)} Nghe chép
        </button>
        <button type="button" class="btn-outline-teal" data-alt-skill="reading">
          ${ico("book", 16)} Đọc hiểu
        </button>
      </div>
    </div>
  `;

  if (typeof onPickOtherSkill === "function") {
    stage.querySelectorAll("[data-alt-skill]").forEach((btn) => {
      btn.addEventListener("click", () => {
        onPickOtherSkill(btn.dataset.altSkill);
      });
    });
  }
}
