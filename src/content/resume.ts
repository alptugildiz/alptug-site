export const profile = {
  name: "Alptug Ildiz",
  firstName: "Alptug",
  lastName: "Ildiz",
  role: "Software Engineer",
  location: "Istanbul, Türkiye",
  timezone: "Europe/Istanbul",
  email: "alptugildiz@gmail.com",
  site: "https://alptugildiz.com",
  github: "https://github.com/alptugildiz",
  linkedin: "https://www.linkedin.com/in/alptugildiz/",
  startYear: 2020,
  summary:
    "Software engineer focused on the frontend, building production web applications with React, Next.js and TypeScript. At Odeon Technology I work on a B2C tourism e-commerce platform serving 13 countries and the CMS behind it, and as co-founder of 21collective I lead the frontend of client products built on Node.js and Supabase. I care about fast pages, component architecture that stays maintainable, and interfaces that feel crafted rather than assembled.",
  intro: [
    "I build interfaces people actually enjoy using — fast, accessible, and a little bit playful.",
    "Five years across enterprise dashboards, a live-learning platform, and tourism e-commerce taught me that good frontend is equal parts engineering discipline and taste.",
  ],
} as const;

export type Experience = {
  role: string;
  company: string;
  companyNote?: string;
  start: string;
  end: string;
  location: string;
  stack: string[];
  highlights: string[];
};

export const experience: Experience[] = [
  {
    role: "Software Engineer",
    company: "Odeon Technology",
    start: "Mar 2023",
    end: "Present",
    location: "Istanbul",
    stack: ["Next.js", "React", "TypeScript", "Redux", "Ant Design", "Jest"],
    highlights: [
      "Build and maintain a B2C tourism e-commerce platform serving 13 countries, where pages are composed dynamically from CMS-configured widgets, using Next.js, React and TypeScript.",
      "Ship new UI features from Figma designs and business analysis, and own performance optimization and bug fixing across the customer-facing site.",
      "Apply Next.js rendering strategies (SSR, ISR) and write middleware for request-level logic.",
      "Analyze requirements and design the UI/UX for the CMS, building the admin panels content teams use to configure the widget-based page layouts.",
      "Work in a 20-person Scrum team with code review; Redux for state, Ant Design for admin UIs, Jest for unit tests.",
    ],
  },
  {
    role: "Co-founder & Software Engineer",
    company: "21collective",
    start: "2025",
    end: "Present",
    location: "Istanbul",
    stack: ["Next.js", "React", "Node.js", "MongoDB", "Supabase", "GSAP", "Three.js"],
    highlights: [
      "Co-founded a three-person digital studio (two engineers, one designer) that builds corporate websites, admin panels and workflow-tracking web applications for clients.",
      "Own the frontends of full-stack client products (Next.js, React, GSAP, Three.js) built on Node.js, MongoDB and Supabase backends.",
      "Developed most of the Academy of Resin Dentistry platform: live-streaming system, user registration, admin panels and UI/UX features.",
    ],
  },
  {
    role: "Software Engineer",
    company: "BadiWorks",
    companyNote: "Öğrenci Kariyeri",
    start: "Feb 2022",
    end: "Mar 2023",
    location: "Istanbul",
    stack: ["Vue.js", "PHP", "MySQL", "JavaScript"],
    highlights: [
      "Sole software engineer at a digital agency, owning every project end to end: requirements, Vue.js frontends, PHP backends, MySQL databases, hosting and deployment.",
      "Developed Young Executive Academy (YEA), a live-learning platform selling training programs to students with live classes and recorded sessions; owned its UI/UX and exam mechanics.",
      "Built a feature that identifies students who hadn't completed their exams and feeds them into targeted re-engagement offers, generating 300,000+ TRY in profit every six months.",
      "Integrated live broadcasts into the platform and built admin tools for stream management, user requests, income/expense tracking and database administration.",
      "Delivered client landing pages, event promotion sites on the company's own domains, and internal management dashboards for the team.",
    ],
  },
  {
    role: "Junior Software Developer",
    company: "Teklas",
    start: "Aug 2020",
    end: "Dec 2021",
    location: "Istanbul",
    stack: ["JavaScript", "jQuery", "Kendo UI", "ASP.NET MVC"],
    highlights: [
      "Developed features for internal budget and project management applications built with ASP.NET MVC Razor views (.cshtml), jQuery and Kendo UI.",
      "Resolved user-reported bugs and provided production support to keep business-critical applications stable.",
    ],
  },
];

export const education = {
  degree: "B.Sc. Software Engineering",
  school: "Beykent University",
  location: "Istanbul",
  start: "2016",
  end: "2021",
} as const;

export const skills = {
  Languages: ["TypeScript", "JavaScript", "PHP"],
  Frameworks: ["React", "Next.js", "Redux", "Vue.js", "Angular"],
  Backend: ["PHP", "MySQL"],
  "UI & Motion": ["Tailwind CSS", "GSAP", "Three.js", "WebGL", "Ant Design"],
  Tooling: ["Jest", "Storybook", "Jenkins", "Docker", "Git", "Figma"],
} as const;

export type Project = {
  code: string;
  title: string;
  context: string;
  year: string;
  summary: string;
  stack: string[];
  href?: string;
};

export const projects: Project[] = [
  {
    code: "P-01",
    title: "Tourism E-commerce",
    context: "Odeon Technology",
    year: "2023—",
    summary:
      "B2C tourism e-commerce serving 13 countries. Pages are assembled from CMS-configured widgets, and I also build the admin panels content teams use to compose them.",
    stack: ["Next.js", "React", "TypeScript", "Redux", "Ant Design"],
  },
  {
    code: "P-02",
    title: "Young Executive Academy",
    context: "BadiWorks",
    year: "2022",
    summary:
      "Live-learning platform selling training programs to students, with live classes, recordings and exams. A re-engagement feature I built for students who hadn't finished their exams brings in 300,000+ TRY profit every six months.",
    stack: ["Vue.js", "PHP", "MySQL"],
  },
  {
    code: "P-03",
    title: "Academy of Resin Dentistry",
    context: "21collective",
    year: "2025—",
    summary:
      "Live-streaming education platform for dentists. I built most of it: the streaming system, user registration, admin panels and the UI/UX layer.",
    stack: ["Next.js", "React", "Node.js", "Supabase"],
  },
  {
    code: "P-04",
    title: "Budget Management",
    context: "Teklas",
    year: "2021",
    summary:
      "Features and bug fixes for an internal budget management application, built on ASP.NET MVC Razor views with jQuery and Kendo UI.",
    stack: ["ASP.NET MVC", "jQuery", "Kendo UI"],
  },
];

export function yearsOfExperience(now = new Date()) {
  return now.getFullYear() - profile.startYear;
}
