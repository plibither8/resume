import { TexError, tokenize, type Token } from "./tokenize";
import type { Block, Contact, Inline, Resume, Section } from "./types";

/*
 * Parses the body of resume/resume.tex (everything between \begin{document}
 * and \end{document}) into a Resume. The preamble is never read: it only
 * holds layout. The body may use exactly the macros handled below; anything
 * else is an error with a line number, so content can't silently go missing
 * from the site.
 */

/** Layout macros with no content: skipped at block level. Value = argument count. */
const LAYOUT: Record<string, number> = {
  resumeSubHeadingListStart: 0,
  resumeSubHeadingListEnd: 0,
  resumeItemListStart: 0,
  resumeItemListEnd: 0,
  vspace: 1,
};

/** Escaped characters allowed in text. */
const SYMBOLS: Record<string, string> = {
  "%": "%",
  $: "$",
  "&": "&",
  "#": "#",
  _: "_",
  "{": "{",
  "}": "}",
  ",": " ",
  " ": " ",
};

class Cursor {
  private pos = 0;
  constructor(private readonly tokens: Token[]) {}

  done(): boolean {
    return this.pos >= this.tokens.length;
  }
  next(): Token {
    const t = this.tokens[this.pos++];
    if (!t) throw new Error("read past end of tokens");
    return t;
  }

  /** Reads one {...} argument for \name and returns the tokens inside it. */
  arg(name: string, line: number): Token[] {
    while (!this.done()) {
      const t = this.tokens[this.pos]!;
      if (t.type === "text" && t.text.trim() === "") this.pos++;
      else break;
    }
    const open = this.tokens[this.pos];
    if (!open || open.type !== "open") {
      throw new TexError(
        `\\${name} is missing a {...} argument`,
        open?.line ?? line
      );
    }
    this.pos++;
    const inner: Token[] = [];
    let depth = 1;
    while (!this.done()) {
      const t = this.next();
      if (t.type === "open") depth++;
      if (t.type === "close" && --depth === 0) return inner;
      inner.push(t);
    }
    throw new TexError(`the argument of \\${name} is never closed`, open.line);
  }

  args(name: string, line: number, count: number): Token[][] {
    return Array.from({ length: count }, () => this.arg(name, line));
  }
}

// ---------- inline ----------

function typography(text: string): string {
  return text
    .replace(/[ \t\r\n]+/g, " ")
    .replace(/---/g, "—")
    .replace(/--/g, "–")
    .replace(/``/g, "“")
    .replace(/''/g, "”")
    .replace(/`/g, "‘")
    .replace(/'/g, "’")
    .replace(/~/g, " ");
}

/** Merges adjacent text nodes, collapses spaces, and trims the ends. */
function tidy(nodes: Inline[], trim = true): Inline[] {
  const out: Inline[] = [];
  for (const n of nodes) {
    const last = out[out.length - 1];
    if (n.type === "text" && last?.type === "text") {
      last.text = (last.text + n.text).replace(/ {2,}/g, " ");
    } else {
      out.push(n.type === "text" ? { ...n } : n);
    }
  }
  if (trim) {
    const first = out[0];
    if (first?.type === "text") first.text = first.text.trimStart();
    const last = out[out.length - 1];
    if (last?.type === "text") last.text = last.text.trimEnd();
  }
  return out.filter((n) => n.type !== "text" || n.text !== "");
}

function parseInlineRaw(tokens: Token[]): Inline[] {
  const cur = new Cursor(tokens);
  const out: Inline[] = [];
  while (!cur.done()) {
    const t = cur.next();
    switch (t.type) {
      case "text":
        out.push({ type: "text", text: typography(t.text) });
        break;
      case "open": {
        // A bare group: read to its matching close and inline its contents.
        const inner: Token[] = [];
        let depth = 1;
        while (!cur.done()) {
          const u = cur.next();
          if (u.type === "open") depth++;
          if (u.type === "close" && --depth === 0) break;
          inner.push(u);
        }
        if (depth !== 0) throw new TexError("unclosed {", t.line);
        out.push(...parseInlineRaw(inner));
        break;
      }
      case "close":
        throw new TexError("unexpected }", t.line);
      case "math":
        throw new TexError(
          "math ($...$) isn't allowed in the body; move it into a macro in the preamble",
          t.line
        );
      case "command": {
        const sym = SYMBOLS[t.name];
        if (sym !== undefined) {
          out.push({ type: "text", text: sym });
          break;
        }
        switch (t.name) {
          case "textbf":
            out.push({
              type: "bold",
              children: parseInline(cur.arg(t.name, t.line)),
            });
            break;
          case "emph":
          case "textit":
            out.push({
              type: "italic",
              children: parseInline(cur.arg(t.name, t.line)),
            });
            break;
          case "underline":
            out.push(...parseInlineRaw(cur.arg(t.name, t.line)));
            break;
          case "href": {
            const [url, label] = cur.args(t.name, t.line, 2) as [
              Token[],
              Token[],
            ];
            out.push({
              type: "link",
              href: rawText(url, t.line),
              children: parseInline(label),
            });
            break;
          }
          case "variant": {
            const [full, short] = cur.args(t.name, t.line, 2) as [
              Token[],
              Token[],
            ];
            parseInlineRaw(short); // validate the 1-page text too
            out.push(...parseInlineRaw(full));
            break;
          }
          case "fullonly":
            out.push(...parseInlineRaw(cur.arg(t.name, t.line)));
            break;
          default:
            throw new TexError(`unknown macro \\${t.name} in text`, t.line);
        }
      }
    }
  }
  return out;
}

export function parseInline(tokens: Token[]): Inline[] {
  return tidy(parseInlineRaw(tokens));
}

/** Text with no formatting, e.g. a URL or a section title. */
function rawText(tokens: Token[], line: number): string {
  let s = "";
  for (const t of tokens) {
    if (t.type === "text") s += t.text;
    else if (
      t.type === "command" &&
      SYMBOLS[t.name] !== undefined &&
      t.name !== ","
    )
      s += t.name;
    else throw new TexError("expected plain text here", t.line ?? line);
  }
  return s.trim();
}

export function plainText(nodes: Inline[]): string {
  return nodes
    .map((n) => (n.type === "text" ? n.text : plainText(n.children)))
    .join("");
}

// ---------- blocks ----------

interface State {
  name: string | null;
  contacts: Contact[];
  summary: Inline[] | null;
  sections: Section[];
  /** The entry or project that \resumeItem bullets attach to. */
  current: { bullets: Inline[][] } | null;
}

function currentSection(state: State, what: string, line: number): Section {
  const section = state.sections[state.sections.length - 1];
  if (!section) throw new TexError(`${what} must come after a \\section`, line);
  return section;
}

function push(state: State, block: Block, line: number): void {
  currentSection(
    state,
    `\\resume${block.kind[0]!.toUpperCase()}${block.kind.slice(1)}`,
    line
  ).blocks.push(block);
  state.current =
    block.kind === "entry" || block.kind === "project" ? block : null;
}

function parseContacts(tokens: Token[], state: State): void {
  const cur = new Cursor(tokens);
  while (!cur.done()) {
    const t = cur.next();
    if (t.type === "text" && t.text.trim() === "") continue;
    if (t.type === "command" && t.name === "resumeContact") {
      const [label, url] = cur.args(t.name, t.line, 2) as [Token[], Token[]];
      const href = rawText(url, t.line);
      state.contacts.push({
        label: parseInline(label),
        href: href === "" ? null : href,
      });
      continue;
    }
    throw new TexError(
      "\\resumeHeader's second argument may only hold \\resumeContact{label}{url}",
      t.line
    );
  }
}

function parseBlocks(tokens: Token[], state: State): void {
  const cur = new Cursor(tokens);
  while (!cur.done()) {
    const t = cur.next();
    if (t.type === "text") {
      if (t.text.trim() !== "") {
        throw new TexError(
          `stray text "${t.text.trim().slice(0, 40)}"; wrap it in a content macro`,
          t.line
        );
      }
      continue;
    }
    if (t.type !== "command") {
      throw new TexError(
        t.type === "math"
          ? "math isn't allowed in the body"
          : `unexpected ${t.type === "open" ? "{" : "}"}`,
        t.line
      );
    }

    const n = t.name;
    const layoutArgs = LAYOUT[n];
    if (layoutArgs !== undefined) {
      cur.args(n, t.line, layoutArgs);
      continue;
    }

    switch (n) {
      case "section": {
        const title = plainText(parseInline(cur.arg(n, t.line)));
        state.sections.push({ title, blocks: [] });
        state.current = null;
        break;
      }
      case "resumeSummary":
        state.summary = parseInline(cur.arg(n, t.line));
        break;
      case "resumeHeader": {
        const [name, contacts] = cur.args(n, t.line, 2) as [Token[], Token[]];
        state.name = plainText(parseInline(name));
        parseContacts(contacts, state);
        break;
      }
      case "resumeSubheading": {
        const [title, dates, subtitle, meta] = cur
          .args(n, t.line, 4)
          .map(parseInline) as [Inline[], Inline[], Inline[], Inline[]];
        push(
          state,
          { kind: "entry", title, dates, subtitle, meta, bullets: [] },
          t.line
        );
        break;
      }
      case "resumeProject": {
        const [name, description] = cur.args(n, t.line, 2).map(parseInline) as [
          Inline[],
          Inline[],
        ];
        push(
          state,
          { kind: "project", name, description, bullets: [] },
          t.line
        );
        break;
      }
      case "resumeItem": {
        const bullet = parseInline(cur.arg(n, t.line));
        if (!state.current)
          throw new TexError(
            "\\resumeItem must follow a \\resumeSubheading or \\resumeProject",
            t.line
          );
        state.current.bullets.push(bullet);
        break;
      }
      case "resumeAchievements":
      case "resumeSkills":
        parseBlocks(cur.arg(n, t.line), state);
        break;
      case "resumeAchievement": {
        const [title, detail] = cur.args(n, t.line, 2).map(parseInline) as [
          Inline[],
          Inline[],
        ];
        push(state, { kind: "achievement", title, detail }, t.line);
        break;
      }
      case "resumeSkill": {
        const [label, items] = cur.args(n, t.line, 2).map(parseInline) as [
          Inline[],
          Inline[],
        ];
        push(state, { kind: "skill", label, items }, t.line);
        break;
      }
      case "variant": {
        const [full, short] = cur.args(n, t.line, 2) as [Token[], Token[]];
        // Parse the 1-page side into a throwaway copy so its mistakes still fail the build.
        parseBlocks(short, structuredClone(state));
        parseBlocks(full, state);
        break;
      }
      case "fullonly":
        parseBlocks(cur.arg(n, t.line), state);
        break;
      default:
        throw new TexError(
          `unknown macro \\${n}; the body may only use the content macros listed in the preamble`,
          t.line
        );
    }
  }
}

/** Returns the tokens between \begin{document} and \end{document}. */
function body(tokens: Token[]): Token[] {
  const find = (env: "begin" | "end", from: number): number => {
    for (let i = from; i < tokens.length - 3; i++) {
      const [a, b, c, d] = [
        tokens[i],
        tokens[i + 1],
        tokens[i + 2],
        tokens[i + 3],
      ];
      if (
        a?.type === "command" &&
        a.name === env &&
        b?.type === "open" &&
        c?.type === "text" &&
        c.text === "document" &&
        d?.type === "close"
      )
        return i;
    }
    return -1;
  };
  const start = find("begin", 0);
  if (start < 0) throw new TexError("no \\begin{document}", 1);
  const end = find("end", start + 4);
  if (end < 0)
    throw new TexError(
      "no \\end{document}",
      tokens[tokens.length - 1]?.line ?? 1
    );
  return tokens.slice(start + 4, end);
}

export function parseResume(src: string): Resume {
  const state: State = {
    name: null,
    contacts: [],
    summary: null,
    sections: [],
    current: null,
  };
  parseBlocks(body(tokenize(src)), state);
  if (!state.name) throw new TexError("missing \\resumeHeader", 1);
  if (!state.summary) throw new TexError("missing \\resumeSummary", 1);
  return {
    name: state.name,
    contacts: state.contacts,
    summary: state.summary,
    sections: state.sections,
  };
}

export { TexError };
