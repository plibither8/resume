# [Resume](https://resume.mihir.ch)

> Mihir Chaturvedi's resume. One LaTeX file builds both PDFs and the website.

## How it works

- **[`resume/resume.tex`](resume/resume.tex) is the only place resume content lives.** Edit it, push, and everything below rebuilds.
- [`resume/resume-1page.tex`](resume/resume-1page.tex) is a one-line wrapper. It defines `\onepage` and inputs `resume.tex`. In the body, `\variant{full}{short}` picks text per PDF, and `\fullonly{...}` appears only in the full PDF.
- [Tectonic](https://tectonic-typesetting.github.io) compiles both PDFs (`scripts/build-pdf.sh`).
- The site is [Astro](https://astro.build) + Tailwind. [`src/lib/tex`](src/lib/tex) parses the tex body into a typed model that the page renders.
- The tex body may only use the content macros declared in the preamble. Anything else fails the build with a line number, so nothing can silently go missing from the site.
- GitHub Actions tests and builds every push. On `main` it deploys `dist/` to a Cloudflare Worker that serves static assets.

## Development

Needs Node 24 (`.nvmrc`), pnpm and Tectonic (`brew install tectonic`).

```sh
pnpm install
pnpm dev     # builds the PDFs, then starts Astro
pnpm test    # parser tests, including a snapshot of the parsed resume
pnpm check   # astro check (types)
pnpm build   # PDFs + static site into dist/
```

After a content change, run `pnpm test -u` to update the snapshot.

## License

[MIT](LICENSE)
