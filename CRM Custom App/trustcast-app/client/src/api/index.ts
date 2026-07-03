import { api as remoteApi } from "./client";
import { localApi } from "./localClient";

// GitHub Pages (and any other static host) can't run the Express server, so
// the static build (VITE_STATIC=true) runs the same rule-based engine
// in-browser instead of calling /api/*. `npm run dev` still talks to the
// real server.
export const api = import.meta.env.VITE_STATIC === "true" ? localApi : remoteApi;
