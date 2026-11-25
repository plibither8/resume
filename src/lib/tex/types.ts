/** Inline text from a macro argument: plain text plus the formatting the tex body may use. */
export type Inline =
  | { type: "text"; text: string }
  | { type: "bold"; children: Inline[] }
  | { type: "italic"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] };

export interface Contact {
  label: Inline[];
  /** null when the tex gives an empty url (plain text). */
  href: string | null;
}

/** \resumeSubheading{title}{dates}{subtitle}{meta} and the \resumeItem bullets after it. */
export interface Entry {
  kind: "entry";
  title: Inline[];
  dates: Inline[];
  subtitle: Inline[];
  meta: Inline[];
  bullets: Inline[][];
}

/** \resumeProject{name}{description} and the \resumeItem bullets after it. */
export interface Project {
  kind: "project";
  name: Inline[];
  description: Inline[];
  bullets: Inline[][];
}

export interface Achievement {
  kind: "achievement";
  title: Inline[];
  detail: Inline[];
}

export interface Skill {
  kind: "skill";
  label: Inline[];
  items: Inline[];
}

export type Block = Entry | Project | Achievement | Skill;

export interface Section {
  title: string;
  blocks: Block[];
}

export interface Resume {
  name: string;
  contacts: Contact[];
  /** null when the tex has no \resumeSummary. */
  summary: Inline[] | null;
  sections: Section[];
}
