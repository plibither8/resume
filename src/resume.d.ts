interface Dates {
  start: string;
  end: string;
}

interface Link {
  name: string;
  link: string;
}

interface Meta {
  title: string;
  lastUpdated: string;
  viewOn: Link[];
}

interface Header {
  name: string;
  title: string;
  logo: {
    path: string;
    alt: string;
  };
}

interface Navigation extends Link {
  alias: string;
}

interface Education extends Link {
  logo: string;
  dates: Dates;
  degree: string;
  score: string;
}

interface Experience extends Link {
  branding: {
    logo: string;
    color: string;
  };
  links: Link[];
  dates: Dates;
  role: string;
  location: string;
  description: string[];
}

interface Project extends Link {
  subtitle: string;
  links: Link[];
  description: string[];
}

type Highlight = string;

interface Skill {
  type: string;
  items: string[];
}

interface Resume {
  meta: Meta;
  header: Header;
  navigation: Navigation[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  highlights: Highlight[];
  skills: Skill[];
}
