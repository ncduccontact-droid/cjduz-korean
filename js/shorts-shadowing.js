import { daisyLogoSVG } from "./icons.js?v=20261127-12";

// Temporarily locked while refreshing original licensed audio/video content
export const YOUTUBE_SHORTS_CLIPS = [];

export function renderShortsShadowingStudio(stage, _db, onPickOtherSkill = null) {
  if (!stage) return;

  stage.innerHTML = `
    <div class="box-kind" style="max-width:520px;margin:12px auto 0;padding:36px 24px;text-align:center;">
      <div style="margin-bottom:12px;">
        ${daisyLogoSVG(56)}
      </div>
      <h2 style="margin:0 0 16px;font-size:21px;font-weight:750;color:var(--text-main);">
        Đang nâng cấp, đợi tớ nhé
      </h2>
      <button type="button" class="btn-primary" id="btn-back-practice-main">
        Quay lại luyện tập
      </button>
    </div>
  `;

  if (typeof onPickOtherSkill === "function") {
    stage.querySelector("#btn-back-practice-main")?.addEventListener("click", () => {
      onPickOtherSkill("translate");
    });
  }
}
