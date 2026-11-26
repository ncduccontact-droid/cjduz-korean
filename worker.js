import { onRequest as handleApiRequest } from "./functions/api/[[path]].js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest({ request, env, ctx });
    }
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(request);
      if (res.status === 404 && !url.pathname.match(/\.(js|css|json|mp3|png|jpg|svg|ico)$/i)) {
        return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
      }
      return res;
    }
    return new Response("CJDUZ Worker running", { status: 200 });
  }
};
