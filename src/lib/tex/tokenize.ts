export type Token =
  | { type: "command"; name: string; line: number }
  | { type: "open"; line: number }
  | { type: "close"; line: number }
  | { type: "text"; text: string; line: number }
  | { type: "math"; line: number };

export class TexError extends Error {
  constructor(
    message: string,
    readonly line: number
  ) {
    super(`resume.tex line ${line}: ${message}`);
    this.name = "TexError";
  }
}

const SPECIAL = new Set(["\\", "{", "}", "%", "$"]);
const isLetter = (c: string | undefined): boolean =>
  c !== undefined && /[A-Za-z@]/.test(c);

/**
 * Splits LaTeX source into commands, braces, text and math markers.
 * Comments are dropped. As in TeX, spaces (and one line break) after a
 * control word are skipped, so `\textbf {x}` and `\textbf{x}` read the same.
 */
export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let line = 1;
  let i = 0;

  while (i < src.length) {
    const c = src[i]!;

    if (c === "%") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }

    if (c === "\\") {
      const next = src[i + 1];
      if (next === undefined)
        throw new TexError("lone backslash at end of file", line);
      if (isLetter(next)) {
        let j = i + 1;
        while (isLetter(src[j])) j++;
        tokens.push({ type: "command", name: src.slice(i + 1, j), line });
        // Skip spaces after a control word, including a single line break.
        let sawNewline = false;
        while (j < src.length) {
          const s = src[j];
          if (s === " " || s === "\t") j++;
          else if (s === "\n" && !sawNewline) {
            sawNewline = true;
            line++;
            j++;
          } else break;
        }
        i = j;
      } else {
        tokens.push({ type: "command", name: next, line });
        if (next === "\n") line++;
        i += 2;
      }
      continue;
    }

    if (c === "{") {
      tokens.push({ type: "open", line });
      i++;
      continue;
    }
    if (c === "}") {
      tokens.push({ type: "close", line });
      i++;
      continue;
    }
    if (c === "$") {
      tokens.push({ type: "math", line });
      i++;
      continue;
    }

    const start = i;
    const startLine = line;
    while (i < src.length && !SPECIAL.has(src[i]!)) {
      if (src[i] === "\n") line++;
      i++;
    }
    tokens.push({ type: "text", text: src.slice(start, i), line: startLine });
  }

  return tokens;
}
