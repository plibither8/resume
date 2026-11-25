import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseInline, parseResume, plainText, TexError } from "./parse";
import { tokenize } from "./tokenize";

const doc = (body: string): string =>
  `\\documentclass{article}\n\\newcommand{\\x}{$|$}\n\\begin{document}\n${body}\n\\end{document}\n`;

const minimal = (sections: string): string =>
  doc(
    `\\resumeSummary{Hi.}\n\\resumeHeader{Ada}{\\resumeContact{a@b.c}{mailto:a@b.c}}\n${sections}`
  );

const inline = (src: string) => parseInline(tokenize(src));

describe("inline text", () => {
  it("applies TeX typography", () => {
    expect(
      plainText(inline("a -- b --- c ``q'' it's 99\\% \\$1 \\& x~y"))
    ).toBe("a \u2013 b \u2014 c \u201Cq\u201D it\u2019s 99% $1 & x\u00A0y");
  });

  it("parses bold, italic, links and underline", () => {
    expect(
      inline(
        "\\textbf{B} \\emph{E} \\textit{I} \\href{https://x.y}{\\underline{L}}"
      )
    ).toEqual([
      { type: "bold", children: [{ type: "text", text: "B" }] },
      { type: "text", text: " " },
      { type: "italic", children: [{ type: "text", text: "E" }] },
      { type: "text", text: " " },
      { type: "italic", children: [{ type: "text", text: "I" }] },
      { type: "text", text: " " },
      {
        type: "link",
        href: "https://x.y",
        children: [{ type: "text", text: "L" }],
      },
    ]);
  });

  it("keeps the full side of \\variant and the content of \\fullonly", () => {
    expect(plainText(inline("\\variant{long}{short} \\fullonly{extra}"))).toBe(
      "long extra"
    );
  });

  it("collapses whitespace and line breaks", () => {
    expect(plainText(inline("  one\n   two  "))).toBe("one two");
  });
});

describe("errors", () => {
  it("rejects unknown macros with a line number", () => {
    expect(() => parseResume(minimal("\\section{S}\n\\resumeTypo{x}"))).toThrow(
      /line 7: unknown macro \\resumeTypo/
    );
  });

  it("rejects unknown macros inside text", () => {
    expect(() =>
      parseResume(minimal("\\section{S}\n\\resumeSkill{A}{\\LaTeX}"))
    ).toThrow(TexError);
  });

  it("rejects unknown macros on the 1-page side of \\variant", () => {
    expect(() =>
      parseResume(
        minimal(
          "\\section{S}\n\\resumeSubheading{a}{b}{c}{d}\n\\variant{\\resumeItem{ok}}{\\resumeItme{typo}}"
        )
      )
    ).toThrow(/resumeItme/);
  });

  it("rejects stray text in the body", () => {
    expect(() => parseResume(minimal("\\section{S}\nforgot a macro"))).toThrow(
      /stray text "forgot a macro"/
    );
  });

  it("rejects math in the body", () => {
    expect(() =>
      parseResume(minimal("\\section{S}\n\\resumeSkill{A}{$x$}"))
    ).toThrow(/math/);
  });

  it("rejects an unclosed argument", () => {
    expect(() =>
      parseResume(minimal("\\section{S}\n\\resumeSkill{A}{oops"))
    ).toThrow(/never closed/);
  });

  it("rejects bullets with nothing to attach to", () => {
    expect(() => parseResume(minimal("\\section{S}\n\\resumeItem{x}"))).toThrow(
      /must follow/
    );
  });

  it("rejects a missing header", () => {
    expect(() => parseResume(doc("\\resumeSummary{x}"))).toThrow(
      /missing \\resumeHeader/
    );
  });
});

describe("structure", () => {
  it("attaches bullets to the entry before them and skips layout macros", () => {
    const r = parseResume(
      minimal(`\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading{Role}{2020 -- 2021}{Co}{Remote}
      \\resumeItemListStart
        \\resumeItem{One}
        \\variant{\\resumeItem{Two}}{\\resumeItem{Short}}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd
\\section{Skills}
  \\resumeSkills{\\resumeSkill{Core}{TS}}`)
    );
    expect(r.name).toBe("Ada");
    expect(r.contacts).toEqual([
      { label: [{ type: "text", text: "a@b.c" }], href: "mailto:a@b.c" },
    ]);
    expect(r.sections.map((s) => s.title)).toEqual(["Experience", "Skills"]);
    const entry = r.sections[0]!.blocks[0]!;
    expect(entry.kind).toBe("entry");
    expect(entry.kind === "entry" && entry.bullets.map(plainText)).toEqual([
      "One",
      "Two",
    ]);
    expect(plainText(entry.kind === "entry" ? entry.dates : [])).toBe(
      "2020 \u2013 2021"
    );
  });

  it("treats an empty contact url as plain text", () => {
    const r = parseResume(
      doc("\\resumeSummary{x}\\resumeHeader{A}{\\resumeContact{plain}{}}")
    );
    expect(r.contacts[0]!.href).toBeNull();
  });
});

describe("resume/resume.tex", () => {
  const src = readFileSync(
    new URL("../../../resume/resume.tex", import.meta.url),
    "utf8"
  );
  const resume = parseResume(src);
  const everything = JSON.stringify(resume);

  it("parses", () => {
    expect(resume).toMatchSnapshot();
  });

  it("has no phone number anywhere", () => {
    expect(everything).not.toMatch(/\+91|882/);
    expect(src.slice(src.indexOf("\\begin{document}"))).not.toMatch(
      /\+91|882\\?,?\s?646/
    );
  });

  it("has the sections in PDF order", () => {
    expect(resume.sections.map((s) => s.title)).toEqual([
      "Experience",
      "Education",
      "Projects",
      "Achievements",
      "Skills",
    ]);
  });

  it("shows every \\resumeItem from the full PDF", () => {
    // Count the bullets the full PDF prints: all \resumeItem calls outside the short side of \variant.
    const bullets = resume.sections.flatMap((s) =>
      s.blocks.flatMap((b) => ("bullets" in b ? b.bullets : []))
    );
    expect(bullets.length).toBe(7 + 2 + 4 + 3 + 3 + 2 + 1);
  });
});
