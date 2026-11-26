// Hierarchical Multi-Layer URL Router for D ● TOPIK (History API + Sub-Part Support + Ancestor Chain Guard)

export function buildUrl(route, params = {}) {
  if (!route || route === "home") return "/";
  if (route === "roadmap") return "/lo-trinh";

  if (route === "theory") {
    const sub = params.sub || "index";
    if (sub === "index") {
      return params.book ? `/ly-thuyet/quyen/${encodeURIComponent(params.book)}` : "/ly-thuyet";
    }
    if (sub === "vocab-book") return `/ly-thuyet/sach/${encodeURIComponent(params.book || "q1")}`;
    if (sub === "lesson-detail") {
      const bk = encodeURIComponent(params.book || "q1");
      const ls = Number(params.lesson || 1);
      const tab = params.tab || "vocab";
      const partSeg = params.part ? `/phan-${Number(params.part)}` : "";
      return tab === "vocab"
        ? `/ly-thuyet/sach/${bk}/bai-${ls}${partSeg}`
        : `/ly-thuyet/sach/${bk}/bai-${ls}/${encodeURIComponent(tab)}`;
    }
    if (sub === "vocab-review") {
      const bk = encodeURIComponent(params.book || "q1");
      const mode = encodeURIComponent(params.mode || "flashcard");
      if (params.lesson && params.part) {
        return `/ly-thuyet/on-tu-vung/${bk}/bai-${Number(params.lesson)}/phan-${Number(params.part)}/${mode}`;
      }
      if (params.lesson) return `/ly-thuyet/on-tu-vung/${bk}/bai-${Number(params.lesson)}/${mode}`;
      return `/ly-thuyet/on-tu-vung/${bk}/${mode}`;
    }
    if (sub === "hangeul") return "/ly-thuyet/hangeul";
    if (sub === "grammar-list") return `/ly-thuyet/ngu-phap/${encodeURIComponent(params.mode || "sc1")}`;
    if (sub === "frequent") return "/ly-thuyet/cau-thuong-gap";
    if (sub === "hanja") return "/ly-thuyet/am-han-han";
    if (sub === "textbook-detail") return `/ly-thuyet/sach/${encodeURIComponent(params.bookId || "q2")}`;
    return "/ly-thuyet";
  }

  if (route === "practice") {
    if (params.sub === "topik1" || params.sub === "topik2") {
      const lvSlug = params.sub === "topik2" ? "topik-2" : "topik-1";
      const sk = encodeURIComponent(params.skill || "listening");
      if (params.partId) return `/luyen-tap/cau-truc/${lvSlug}/${sk}/${encodeURIComponent(params.partId)}`;
      return `/luyen-tap/cau-truc/${lvSlug}/${sk}`;
    }
    const sk = params.skill || "translate";
    if (sk === "translate") return `/luyen-tap/dich-cau/bai-${Number(params.lesson || 1)}`;
    return `/luyen-tap/ky-nang/${encodeURIComponent(sk)}`;
  }

  if (route === "mock-test") {
    const lvSlug = params.sub === "topik2" ? "topik-2" : "topik-1";
    if (params.examId) {
      const exId = encodeURIComponent(params.examId);
      if (params.action === "room") {
        const scope = encodeURIComponent(params.scope || "full");
        return `/de-thi/${lvSlug}/de/${exId}/phong-thi/${scope}`;
      }
      return `/de-thi/${lvSlug}/de/${exId}`;
    }
    if (params.viewMode === "segments") {
      const sk = encodeURIComponent(params.skill || "listening");
      if (params.typeId) return `/de-thi/${lvSlug}/tung-phan/${sk}/${encodeURIComponent(params.typeId)}`;
      return `/de-thi/${lvSlug}/tung-phan/${sk}`;
    }
    const cat = params.category || "all";
    if (cat === "all") return `/de-thi/${lvSlug}`;
    return `/de-thi/${lvSlug}/nhom/${encodeURIComponent(cat)}`;
  }

  if (route === "check-tools") {
    const tab = params.tab || "analytics";
    return tab === "analytics" ? "/cong-cu" : `/cong-cu/${encodeURIComponent(tab)}`;
  }

  return "/";
}

export function parseUrl(pathname = "/") {
  const clean = (pathname || "/").replace(/\/+$/, "") || "/";
  if (clean === "/") return { route: "home", params: {} };
  if (clean === "/lo-trinh") return { route: "roadmap", params: {} };

  const segs = clean.split("/").filter(Boolean).map((s) => decodeURIComponent(s));

  if (segs[0] === "ly-thuyet") {
    if (segs.length === 1) return { route: "theory", params: { sub: "index" } };
    if (segs[1] === "quyen") {
      return { route: "theory", params: { sub: "index", book: segs[2] || "q1" } };
    }
    if (segs[1] === "sach" || segs[1] === "giao-trinh") {
      const book = segs[2] || "q1";
      if (!segs[3]) return { route: "theory", params: { sub: "vocab-book", book } };
      const m = segs[3].match(/^bai-(\d+)$/);
      const lesson = m ? Number(m[1]) : 1;
      if (segs[4] && segs[4].startsWith("phan-")) {
        const part = Number(segs[4].slice(5)) || 1;
        return { route: "theory", params: { sub: "lesson-detail", book, lesson, tab: "vocab", part } };
      }
      const tab = segs[4] || "vocab";
      return { route: "theory", params: { sub: "lesson-detail", book, lesson, tab } };
    }
    if (segs[1] === "on-tu-vung") {
      const book = segs[2] === "all" ? undefined : segs[2];
      if (segs[3] && segs[3].startsWith("bai-")) {
        const lesson = Number(segs[3].slice(4)) || 1;
        if (segs[4] && segs[4].startsWith("phan-")) {
          const part = Number(segs[4].slice(5)) || 1;
          const mode = segs[5] || "flashcard";
          return { route: "theory", params: { sub: "vocab-review", book, lesson, part, mode } };
        }
        const mode = segs[4] || "flashcard";
        return { route: "theory", params: { sub: "vocab-review", book, lesson, mode } };
      }
      const mode = segs[3] || "flashcard";
      return { route: "theory", params: { sub: "vocab-review", book, mode } };
    }
    if (segs[1] === "hangeul") return { route: "theory", params: { sub: "hangeul" } };
    if (segs[1] === "ngu-phap") return { route: "theory", params: { sub: "grammar-list", mode: segs[2] || "sc1" } };
    if (segs[1] === "cau-thuong-gap") return { route: "theory", params: { sub: "frequent" } };
    if (segs[1] === "am-han-han") return { route: "theory", params: { sub: "hanja" } };
    return { route: "theory", params: { sub: "index" } };
  }

  if (segs[0] === "luyen-tap") {
    if (segs.length === 1) return { route: "practice", params: { sub: "skills", skill: "translate" } };
    if (segs[1] === "cau-truc") {
      const sub = segs[2] === "topik-2" ? "topik2" : "topik1";
      const skill = segs[3] || "listening";
      const partId = segs[4] || null;
      return { route: "practice", params: { sub, skill, partId } };
    }
    if (segs[1] === "dich-cau") {
      const m = (segs[2] || "").match(/^bai-(\d+)$/);
      return { route: "practice", params: { sub: "skills", skill: "translate", lesson: m ? Number(m[1]) : 1 } };
    }
    if (segs[1] === "ky-nang") {
      return { route: "practice", params: { sub: "skills", skill: segs[2] || "translate" } };
    }
    return { route: "practice", params: { sub: "skills", skill: "translate" } };
  }

  if (segs[0] === "de-thi") {
    if (segs.length === 1) return { route: "mock-test", params: { sub: "topik1", viewMode: "exams", category: "all" } };
    if (segs[1] === "tuyen-chon") return { route: "mock-test", params: { sub: "topik1", viewMode: "exams", category: "curated" } };
    const sub = segs[1] === "topik-2" ? "topik2" : "topik1";
    if (segs.length === 2) return { route: "mock-test", params: { sub, viewMode: "exams", category: "all" } };
    if (segs[2] === "nhom") {
      return { route: "mock-test", params: { sub, viewMode: "exams", category: segs[3] || "all" } };
    }
    if (segs[2] === "tung-phan") {
      const skill = segs[3] || "listening";
      const typeId = segs[4] || null;
      return { route: "mock-test", params: { sub, viewMode: "segments", skill, typeId } };
    }
    if (segs[2] === "de" && segs[3]) {
      const examId = segs[3];
      if (segs[4] === "phong-thi") {
        return { route: "mock-test", params: { sub, examId, action: "room", scope: segs[5] || "full" } };
      }
      return { route: "mock-test", params: { sub, examId, action: "overview" } };
    }
    return { route: "mock-test", params: { sub, viewMode: "exams", category: "all" } };
  }

  if (segs[0] === "cong-cu") {
    return { route: "check-tools", params: { tab: segs[1] || "analytics" } };
  }

  return { route: "home", params: {} };
}

export function getParentUrl(pathname = "/") {
  const clean = (pathname || "/").replace(/\/+$/, "") || "/";
  if (clean === "/") return "/";
  const segs = clean.split("/").filter(Boolean);

  if (segs[0] === "ly-thuyet") {
    if (segs.length === 1) return "/";
    if (segs[1] === "quyen") return "/ly-thuyet";
    if (segs[1] === "sach" || segs[1] === "giao-trinh") {
      if (segs.length === 3) return "/ly-thuyet";
      if (segs.length === 4) return `/ly-thuyet/sach/${segs[2]}`;
      if (segs.length >= 5) return `/ly-thuyet/sach/${segs[2]}/${segs[3]}`;
    }
    if (segs[1] === "on-tu-vung") {
      const bk = segs[2];
      if (segs[3]?.startsWith("bai-") && segs[4]?.startsWith("phan-")) {
        return `/ly-thuyet/sach/${bk}/${segs[3]}/${segs[4]}`;
      }
      if (segs[3]?.startsWith("bai-")) return `/ly-thuyet/sach/${bk}/${segs[3]}`;
      if (bk && bk !== "all") return `/ly-thuyet/sach/${bk}`;
      return "/ly-thuyet";
    }
    return "/ly-thuyet";
  }

  if (segs[0] === "luyen-tap") {
    if (segs.length <= 2) return "/";
    if (segs[1] === "cau-truc") {
      if (segs.length >= 5) return `/luyen-tap/cau-truc/${segs[2]}/${segs[3]}`;
      return "/luyen-tap/dich-cau/bai-1";
    }
    if (segs[1] === "ky-nang" && segs[2] === "textbook-shadow") {
      return "/luyen-tap/ky-nang/shadowing";
    }
    return "/";
  }

  if (segs[0] === "de-thi") {
    if (segs.length <= 2) return "/";
    const lv = segs[1] === "topik-2" ? "topik-2" : "topik-1";
    if (segs[2] === "nhom") return `/de-thi/${lv}`;
    if (segs[2] === "tung-phan") {
      if (segs.length >= 5) return `/de-thi/${lv}/tung-phan/${segs[3]}`;
      return `/de-thi/${lv}`;
    }
    if (segs[2] === "de") {
      if (segs.length >= 5) return `/de-thi/${lv}/de/${segs[3]}`;
      return `/de-thi/${lv}`;
    }
    return `/de-thi/${lv}`;
  }

  if (segs[0] === "cong-cu") {
    return segs.length >= 2 ? "/cong-cu" : "/";
  }

  return "/";
}

export function getAncestorChain(pathname = "/") {
  const clean = (pathname || "/").replace(/\/+$/, "") || "/";
  if (clean === "/") return [];
  const chain = [];
  let cur = clean;
  let safety = 0;
  while (cur !== "/" && safety < 8) {
    chain.unshift(cur);
    cur = getParentUrl(cur);
    safety++;
  }
  return chain;
}
