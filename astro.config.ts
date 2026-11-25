import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// A fully static site: dist/ is served as Worker static assets (see wrangler.jsonc).
export default defineConfig({
  site: "https://resume.mihir.ch",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
