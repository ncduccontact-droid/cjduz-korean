import { store, evaluateRoadmapScore, speakKoreanTTS } from "../store.js?v=20261127-05";
import { ico } from "../icons.js?v=20261127-05";
import { analyzePronunciationRules, conjugateKoreanPredicate } from "../korean-engine.js?v=20261127-05";
import { renderRoadmapScoreCardHTML } from "./roadmap.js?v=20261127-05";

const PARTICLE_NOTES = [
  { suffix: "에서는", role: "Tiểu từ Nơi diễn ra hành động + Nhấn mạnh chủ đề" },
  { suffix: "에서", role: "Tiểu từ Địa điểm hành động ('ở') hoặc Xuất phát ('từ')" },
  { suffix: "으로", role: "Tiểu từ Phương hướng / Phương tiện / Tư cách" },
  { suffix: "부터", role: "Tiểu từ Mốc bắt đầu thời gian ('từ lúc')" },
  { suffix: "까지", role: "Tiểu từ Mốc kết thúc ('đến tận')" },
  { suffix: "에게", role: "Tiểu từ Đối tượng nhận hành động ('cho ai')" },
  { suffix: "한테", role: "Tiểu từ Đối tượng nhận (văn nói thân mật)" },
  { suffix: "께서", role: "Tiểu từ Chủ ngữ kính trọng (của 이/가)" },
  { suffix: "은", role: "Tiểu từ Chủ đề / So sánh (sau patchim)" },
  { suffix: "는", role: "Tiểu từ Chủ đề / So sánh (không patchim)" },
  { suffix: "이", role: "Tiểu từ Chủ ngữ (sau patchim)" },
  { suffix: "가", role: "Tiểu từ Chủ ngữ (không patchim)" },
  { suffix: "을", role: "Tiểu từ Tân ngữ trực tiếp (sau patchim)" },
  { suffix: "를", role: "Tiểu từ Tân ngữ trực tiếp (không patchim)" },
  { suffix: "에", role: "Tiểu từ Đích đến / Thời gian / Tồn tại tĩnh" },
  { suffix: "와", role: "Tiểu từ Nối danh từ 'và/với' (không patchim)" },
  { suffix: "과", role: "Tiểu từ Nối danh từ 'và/với' (sau patchim)" },
  { suffix: "도", role: "Tiểu từ Bổ sung ('cũng')" },
  { suffix: "만", role: "Tiểu từ Giới hạn ('chỉ')" }
];

const ENDING_NOTES = [
  { suffix: "습니까지", role: "" },
  { suffix: "습니까", role: "Đuôi câu hỏi Trang trọng (하십시오체)" },
  { suffix: "습니다", role: "Đuôi trần thuật Trang trọng (하십시오체)" },
  { suffix: "입니까", role: "Là ... phải không? (Trang trọng)" },
  { suffix: "입니다", role: "Là ... (Trang trọng)" },
  { suffix: "았어요", role: "Thì Quá khứ lịch sự (-았어요)" },
  { suffix: "었어요", role: "Thì Quá khứ lịch sự (-었어요)" },
  { suffix: "했어요", role: "Thì Quá khứ lịch sự của 하다" },
  { suffix: "거예요", role: "Thì Tương lai / Dự đoán (-(으)ㄹ 거예요)" },
  { suffix: "으세요", role: "Đuôi Kính ngữ / Đề nghị lịch sự (-(으)세요)" },
  { suffix: "세요", role: "Đuôi Kính ngữ / Đề nghị lịch sự (-세요)" },
  { suffix: "아요", role: "Đuôi Lịch sự hằng ngày (해요체)" },
  { suffix: "어요", role: "Đuôi Lịch sự hằng ngày (해요체)" },
  { suffix: "해요", role: "Đuôi Lịch sự hằng ngày của 하다" }
];

export function xrayKoreanSentence(sentence, vocabList) {
  const dict = new Map();
  vocabList.forEach((w) => {
    if (!dict.has(w.korean)) dict.set(w.korean, w.vietnamese);
  });

  const tokens = (sentence || "").trim().split(/\s+/).filter(Boolean);
  return tokens.map((raw) => {
    const clean = raw.replace(/[.,?!""'']/g, "");
    let stem = clean;
    let grammarRole = "Từ vựng / Thành phần câu";

    for (const end of ENDING_NOTES) {
      if (end.role && clean.endsWith(end.suffix) && clean.length > end.suffix.length) {
        stem = clean.slice(0, clean.length - end.suffix.length);
        grammarRole = end.role;
        break;
      }
    }

    if (stem === clean) {
      for (const p of PARTICLE_NOTES) {
        if (clean.endsWith(p.suffix) && clean.length > p.suffix.length) {
          stem = clean.slice(0, clean.length - p.suffix.length);
          grammarRole = `+ ${p.suffix}: ${p.role}`;
          break;
        }
      }
    }

    const directMeaning = dict.get(clean) || dict.get(stem) || dict.get(stem + "다") || dict.get(stem + "하다") || "";
    return {
      surface: raw,
      stem,
      grammarRole,
      meaning: directMeaning
    };
  });
}

export function renderCheckAndToolsView(root, db, navigate, params = {}) {
  let tab = params.tab || "analytics"; // analytics | mistakes | xray | import
  let sentenceInput = "저는 오늘 도서관에서 한국어를 공부합니다.";
  let verbQuery = "듣다";

  const allVocab = [...db.sc1Vocab, ...db.sejongVocab, ...db.topik1Bank, ...db.customVocab];

  function render() {
    const mistakes = store.state.mistakes;
    const partEntries = Object.entries(store.state.partStats);

    root.innerHTML = `
      <div class="container-web">
        <div class="breadcrumb-bar">
          <span>Công cụ</span>
          <span>/</span>
          <span>Thống kê &amp; Trợ thủ học tập</span>
        </div>

        <div class="skill-pills-row">
          <button class="btn-skill ${tab === "analytics" ? "active" : ""}" data-tb="analytics">${ico("chart", 17)} Điểm yếu &amp; Lịch sử thi</button>
          <button class="btn-skill ${tab === "mistakes" ? "active" : ""}" data-tb="mistakes">${ico("target", 17)} Sổ tay câu sai (${mistakes.length})</button>
          <button class="btn-skill ${tab === "xray" ? "active" : ""}" data-tb="xray">${ico("xray", 17)} Giải phẫu câu &amp; Chia ĐT</button>
          <button class="btn-skill ${tab === "import" ? "active" : ""}" data-tb="import">${ico("upload", 17)} Nhập gói Anki (.apkg)</button>
        </div>

        <div id="check-tools-body"></div>
      </div>
    `;

    root.querySelectorAll("[data-tb]").forEach((b) => {
      b.addEventListener("click", () => { navigate("check-tools", { tab: b.dataset.tb }); });
    });

    const body = root.querySelector("#check-tools-body");

    if (tab === "analytics") {
      const masteredCount = allVocab.filter((c) => store.isMastered(c.id)).length;
      const evalObj = evaluateRoadmapScore(db);
      body.innerHTML = `
        <div style="margin-bottom:20px;">
          ${renderRoadmapScoreCardHTML(evalObj)}
        </div>
        <div class="grid-3" style="margin-bottom:22px;">
          <div class="box-kind">
            <div style="font-size:13.5px;color:var(--text-muted);">Tổng từ vựng đã thuộc (SRS >= 2)</div>
            <div style="font-size:28px;font-weight:800;color:var(--primary-1);margin-top:4px;">${masteredCount} / ${allVocab.length}</div>
          </div>
          <div class="box-kind">
            <div style="font-size:13.5px;color:var(--text-muted);">Số đề thi thử đã hoàn thành</div>
            <div style="font-size:28px;font-weight:800;color:var(--primary-1);margin-top:4px;">${store.state.examHistory.length} đề</div>
          </div>
          <div class="box-kind">
            <div style="font-size:13.5px;color:var(--text-muted);">Câu sai cần xử lý lại</div>
            <div style="font-size:28px;font-weight:800;color:${mistakes.length > 0 ? "var(--danger)" : "var(--success)"};margin-top:4px;">${mistakes.length} câu</div>
          </div>
        </div>

        <div class="grid-2" style="align-items:start;">
          <!-- Accuracy by Question Structure -->
          <div class="box-kind">
            <h3 style="margin:0 0 14px;font-size:18px;display:flex;align-items:center;gap:8px;">${ico("target", 20)} Tỷ lệ đúng theo từng dạng câu TOPIK</h3>
            ${partEntries.length === 0 ? `
              <p style="color:var(--text-muted);font-size:14.5px;">Chưa có dữ liệu làm bài. Hãy làm thử vài câu tại mục <strong>Luyện tập</strong> hoặc <strong>Đề thi</strong> để hệ thống tự động bắt bệnh điểm yếu cho bạn!</p>
              <button class="btn-primary" id="btn-go-prac-now">Đi tới Ôn cấu trúc đề TOPIK →</button>
            ` : `
              <div style="display:flex;flex-direction:column;gap:14px;">
                ${partEntries.map(([pid, st]) => {
                  const pct = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
                  const cls = pct < 50 ? "danger" : (pct < 75 ? "warn" : "");
                  return `
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:5px;">
                        <strong>${st.title || pid}</strong>
                        <span>${st.correct}/${st.total} (${pct}%)</span>
                      </div>
                      <div class="progress-track">
                        <div class="progress-fill ${cls}" style="width:${pct}%"></div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            `}
          </div>

          <!-- Exam History & Backup -->
          <div class="box-kind">
            <h3 style="margin:0 0 14px;font-size:18px;display:flex;align-items:center;gap:8px;">${ico("trophy", 20)} Lịch sử chấm điểm Đề thi &amp; Sao lưu</h3>
            ${store.state.examHistory.length === 0 ? `
              <p style="color:var(--text-muted);font-size:14.5px;">Bạn chưa nộp đề thi thử nào.</p>
            ` : `
              <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
                ${store.state.examHistory.slice(0, 6).map((h) => `
                  <div style="background:#F8FAFB;padding:10px 14px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <strong style="display:block;font-size:14.5px;">${h.examTitle}</strong>
                      <span style="font-size:12.5px;color:var(--text-muted);">${h.date} · Đúng ${h.correctCount}/${h.totalCount} câu</span>
                    </div>
                    <div style="text-align:right;">
                      <strong style="color:var(--primary-1);font-size:16px;">${h.score}/${h.maxScore}đ</strong>
                      <div style="font-size:12px;color:var(--yellow-2);font-weight:700;">${h.grade}</div>
                    </div>
                  </div>
                `).join("")}
              </div>
            `}

            <div style="border-top:1px solid #EEE;padding-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn-outline-teal" id="btn-export-backup">${ico("save", 16)} Xuất file sao lưu tiến độ (.json)</button>
              <label class="btn-outline-teal" style="cursor:pointer;">
                ${ico("folder", 16)} Khôi phục sao lưu
                <input type="file" id="inp-import-backup" accept=".json" style="display:none;" />
              </label>
            </div>
          </div>
        </div>
      `;

      const goBtn = body.querySelector("#btn-go-prac-now");
      if (goBtn) goBtn.addEventListener("click", () => navigate("practice", { sub: "topik1" }));
      body.querySelector("#btn-export-backup").addEventListener("click", () => store.exportJSON());
      body.querySelector("#inp-import-backup").addEventListener("change", async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const txt = await f.text();
        store.importJSON(txt);
        render();
      });
    } else if (tab === "mistakes") {
      body.innerHTML = mistakes.length === 0 ? `
        <div class="prediction-banner">
          <div>
            <h3 style="margin:0 0 6px;color:var(--primary-1);display:flex;align-items:center;gap:8px;">${ico("trophy", 22)} Sổ tay câu sai hiện đang trống (0 lỗi tồn đọng)</h3>
            <p style="margin:0;color:var(--text-muted);">Mọi câu bạn làm sai trong phần Đọc hiểu, Ôn cấu trúc TOPIK hoặc Đề thi thử sẽ tự động được gom về đây kèm lời giải tiếng Việt để bạn làm lại.</p>
          </div>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${mistakes.map((m, mi) => `
            <div class="box-kind">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span class="badge-orange" style="background:rgba(254,154,5,0.14);">${m.partTitle}</span>
                <span style="font-size:12.5px;color:var(--danger);font-weight:700;">Bạn đã chọn sai → Hãy chọn lại đáp án đúng để xóa khỏi sổ!</span>
              </div>
              <strong style="display:block;margin-bottom:8px;">${m.question}</strong>
              ${m.passage ? `<pre class="ko" style="white-space:pre-wrap;background:#F8FAFB;padding:12px;border-radius:8px;margin:0 0 10px;">${m.passage}</pre>` : ""}
              <div class="grid-2">
                ${m.options.map((opt, oi) => `
                  <button type="button" class="ko" data-retry-idx="${mi}" data-oi="${oi}" style="text-align:left;padding:10px 14px;border-radius:8px;border:1.5px solid #E5E7EB;background:#FFF;cursor:pointer;">
                    ${["①", "②", "③", "④"][oi] || `${oi + 1}.`} ${opt}
                  </button>
                `).join("")}
              </div>
              <div style="margin-top:10px;font-size:13.5px;color:var(--text-muted);display:flex;align-items:center;gap:6px;">${ico("bulb", 16)} <span>Gợi ý giải thích: ${m.explain}</span></div>
            </div>
          `).join("")}
        </div>
      `;

      body.querySelectorAll("[data-retry-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = mistakes[Number(btn.dataset.retryIdx)];
          const oi = Number(btn.dataset.oi);
          if (oi === item.answer) {
            store.recordQuestionResult(item.partId, item.partTitle, item, oi);
            render();
          } else {
            btn.style.borderColor = "var(--danger)";
            btn.style.background = "rgba(255,90,96,0.12)";
          }
        });
      });
    } else if (tab === "xray") {
      body.innerHTML = `
        <div class="outline-ai" style="margin-bottom:22px;">
          <h3 style="margin:0 0 8px;display:flex;align-items:center;gap:8px;">${ico("xray", 21)} Giải phẫu câu tiếng Hàn X-Ray (D ● TOPIK Studio)</h3>
          <p style="margin:0 0 10px;font-size:14px;color:var(--text-muted);">
            Dán bất kỳ câu tiếng Hàn nào để tách từng thành phần tiểu từ, đuôi câu kính ngữ, tra từ vựng và soi biến âm:
          </p>
          <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
            <input id="xray-inp" class="ko" value="${sentenceInput.replace(/"/g, "&quot;")}" style="flex:1;min-width:200px;padding:11px 16px;font-size:17px;font-weight:700;" />
            <button type="button" class="btn-primary" id="xray-speak">${ico("speaker", 17)} Đọc câu</button>
          </div>
          <div id="xray-live-results"></div>
        </div>

        <div class="box-kind">
          <h3 style="margin:0 0 10px;display:flex;align-items:center;gap:8px;">${ico("gear", 20)} Máy chia Động/Tính từ Bất quy tắc nhanh</h3>
          <input id="tool-verb-inp" class="ko" value="${verbQuery.replace(/"/g, "&quot;")}" placeholder="Nhập động/tính từ nguyên thể (VD: 춥다, 듣다, 모르다, 쓰다, 짓다)..." style="max-width:420px;width:100%;padding:9px 16px;font-size:17px;font-weight:700;margin-bottom:12px;" />
          <div id="verb-live-results"></div>
        </div>
      `;

      const xrayOut = body.querySelector("#xray-live-results");
      const verbOut = body.querySelector("#verb-live-results");

      const updateXrayDOM = () => {
        const tokens = xrayKoreanSentence(sentenceInput, allVocab);
        const pron = analyzePronunciationRules(sentenceInput);
        xrayOut.innerHTML = `
          ${pron.hasChange ? `<div class="ko" style="margin-bottom:12px;font-size:15px;color:var(--primary-1);font-weight:700;display:flex;align-items:center;gap:6px;">${ico("speaker", 17)} <span>Phát âm nối/biến âm toàn câu: [${pron.pronounced}]</span></div>` : ""}
          <div class="grid-3">
            ${tokens.map((t) => `
              <div style="background:var(--bg-body);border-radius:10px;padding:12px;border-top:3px solid var(--primary);">
                <strong class="ko" style="font-size:19px;color:var(--primary-1);display:block;">${t.surface}</strong>
                <div style="font-size:13px;color:var(--yellow-2);font-weight:700;margin-top:3px;">Gốc: <span class="ko">${t.stem}</span></div>
                <div style="font-size:13px;color:var(--text-muted);margin-top:3px;">${t.grammarRole}</div>
                ${t.meaning ? `<div style="font-size:14px;font-weight:600;margin-top:4px;color:var(--text-main);">Nghĩa: ${t.meaning}</div>` : ""}
              </div>
            `).join("")}
          </div>
        `;
      };

      const updateVerbDOM = () => {
        const conj = conjugateKoreanPredicate(verbQuery);
        verbOut.innerHTML = conj ? `
          <div style="font-size:13.5px;color:var(--primary-1);font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px;">${ico("bolt", 16)} <span>${conj.irregularNote}</span></div>
          <div class="grid-3">
            ${conj.forms.map((f) => `
              <div style="background:var(--bg-body);padding:10px 12px;border-radius:10px;">
                <div style="font-size:12.5px;color:var(--text-muted);">${f.label}</div>
                <strong class="ko" style="font-size:17px;color:var(--primary-1);">${f.ko}</strong>
              </div>
            `).join("")}
          </div>
        ` : `<div style="font-size:13.5px;color:var(--text-muted);">Nhập động/tính từ kết thúc bằng -다 (VD: 듣다, 춥다, 가다) để chia tự động.</div>`;
      };

      updateXrayDOM();
      updateVerbDOM();

      body.querySelector("#xray-inp").addEventListener("input", (e) => {
        sentenceInput = e.target.value;
        updateXrayDOM();
      });
      body.querySelector("#xray-speak").addEventListener("click", () => speakKoreanTTS(sentenceInput));
      body.querySelector("#tool-verb-inp").addEventListener("input", (e) => {
        verbQuery = e.target.value;
        updateVerbDOM();
      });
    } else if (tab === "import") {
      body.innerHTML = `
        <div class="box-kind" style="text-align:center;padding:36px 24px;border:1.5px dashed rgba(13,148,136,0.4);">
          <div style="margin-bottom:10px;">${ico("box", 46)}</div>
          <h3 style="margin:0 0 8px;">Kéo-thả hoặc chọn gói thẻ Anki (.apkg) để nạp thẳng vào Web</h3>
          <p style="margin:0 auto 18px;max-width:580px;color:var(--text-muted);font-size:14.5px;">
            Hệ thống sẽ tự động giải nén cơ sở dữ liệu thẻ + toàn bộ file âm thanh <code>.mp3</code> bên trong gói <code>.apkg</code> của bạn (Sơ cấp 2, Trung cấp 3–4, TOPIK II...) và đưa ngay lên kệ <strong>Lý thuyết &amp; Từ vựng</strong>!
          </p>
          <label class="btn-primary" style="cursor:pointer;">
            ${ico("folder", 17)} Chọn file .apkg từ máy
            <input type="file" id="apkg-file-input" accept=".apkg" style="display:none;" />
          </label>
          <div id="apkg-status" style="margin-top:14px;font-weight:600;"></div>
        </div>

        ${db.customDecks.length > 0 ? `
          <div class="section-head"><h2>Các bộ thẻ đã nạp thêm (${db.customDecks.length})</h2></div>
          <div class="grid-2">
            ${db.customDecks.map((d) => `
              <div class="theory-card" data-open-custom="${d.deckId}">
                <div>
                  <strong style="font-size:16.5px;display:block;">${d.title}</strong>
                  <span style="font-size:13.5px;color:var(--text-muted);">${d.count} mục từ/câu · ${d.audioCount} file âm thanh</span>
                </div>
                <span style="color:var(--primary-1);font-weight:700;">Học ngay →</span>
              </div>
            `).join("")}
          </div>
        ` : ""}
      `;

      body.querySelector("#apkg-file-input").addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const st = body.querySelector("#apkg-status");
        st.innerHTML = `<span style="color:var(--primary-1);">${ico("clock", 16)} Đang giải nén thẻ &amp; âm thanh từ "${file.name}"...</span>`;
        try {
          const buf = await file.arrayBuffer();
          const res = await fetch("/api/import-apkg", {
            method: "POST",
            headers: { "X-Filename": encodeURIComponent(file.name) },
            body: buf
          });
          const data = await res.json();
          if (data.ok) {
            db.customDecks.push(data.deck);
            db.customVocab.push(...data.deck.items);
            st.innerHTML = `<span style="color:var(--success);">${ico("check", 16)} Đã nạp thành công "${data.deck.title}" (${data.deck.count} thẻ, ${data.deck.audioCount} audio)!</span>`;
            setTimeout(() => render(), 900);
          } else {
            st.innerHTML = `<span style="color:var(--danger);">Lỗi: ${data.error}</span>`;
          }
        } catch (err) {
          st.innerHTML = `<span style="color:var(--danger);">Không thể nạp file: ${err.message}</span>`;
        }
      });

      body.querySelectorAll("[data-open-custom]").forEach((el) => {
        el.addEventListener("click", () => navigate("theory", { sub: "vocab-book", book: el.dataset.openCustom }));
      });
    }
  }

  render();
}
