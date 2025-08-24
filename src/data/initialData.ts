export type Placement = "left" | "right";

export type SectionBase = {
  key: string; // unique id e.g. "summary"
  title: string; // display title e.g. "Summary"
  placement: Placement; // left/right column
  order: number; // sort order within the column
  type: "rich" | "grouped" | "timeline";
};

export type Contact = {
  label: string;
  value: string;
  type: "link" | "phone" | "email";
};

export type RichSection = SectionBase & {
  type: "rich";
  content: string; // markdown-ish plain text
};

export type GroupedSection = SectionBase & {
  type: "grouped";
  groups: { name: string; items: string[] }[];
};

export type TimelineItem = {
  heading: string; // e.g. Company / Project / Degree
  subheading?: string; // role / brief (deprecated, use positions instead)
  start?: string;
  end?: string;
  bullets?: string[];
  meta?: string;
  positions?: {
    title: string;
    start?: string;
    end?: string;
    bullets?: string[];
  }[];
};

export type TimelineSection = SectionBase & {
  type: "timeline";
  items: TimelineItem[];
};

export type Section = RichSection | GroupedSection | TimelineSection;

export type ResumeData = {
  meta: {
    fullName: string;
    title: string;
    contact: Contact[]; // lines like "github.com/..." or email/phone
  };
  layout: {
    leftWidth: number; // percentage for left col (e.g. 32)
    rightWidth: number; // 68
  };
  sections: Section[];
};

export const initialData: ResumeData = {
  meta: {
    fullName: "Gitanshu Talwar",
    title: "Full Stack Software Engineer",
    contact: [
      { label: "Phone", value: "+91 8126081194", type: "phone" },
      { label: "Email", value: "gitanshutalwar@gmail.com", type: "email" },
      { label: "Portfolio", value: "https://gitanshutalwar.com", type: "link" },
      {
        label: "GitHub",
        value: "https://github.com/gitatractivo",
        type: "link",
      },
      {
        label: "LinkedIn",
        value: "https://linkedin.com/in/gitanshutalwar",
        type: "link",
      },
      {
        label: "Twitter",
        value: "https://twitter.com/gitatractivo",
        type: "link",
      },
    ],
  },
  layout: { leftWidth: 34, rightWidth: 66 },
  sections: [
    {
      key: "summary",
      title: "Summary",
      placement: "left",
      order: 1,
      type: "rich",
      content:
        "Engineer with 2+ years building production-grade web apps and backends. Comfortable across frontend, backend, and DevOps (Kubernetes, AWS/Azure). Passionate about reliability, performance, and clean DX.",
    },
    {
      key: "skills",
      title: "Skills",
      placement: "left",
      order: 1,
      type: "grouped",
      groups: [
        {
          name: "Frontend",
          items: ["React", "Next.js", "TypeScript", "Tailwind"],
        },
        {
          name: "Backend",
          items: ["Node.js", "Django", "FastAPI", "Go", "GraphQL"],
        },
        {
          name: "DevOps",
          items: ["Kubernetes", "Docker", "Terraform", "AWS", "Azure", "GCP"],
        },
        { name: "Databases", items: ["PostgreSQL", "MongoDB", "SQL"] },
      ],
    },
    {
      key: "experience",
      title: "Experience",
      placement: "right",
      order: 2,
      type: "timeline",
      items: [
        {
          heading: "A.P. Moller Maersk",
          positions: [
            {
              title: "Associate Software Engineer — Java Microservices, Azure",
              start: "Jul 2024",
              end: "Present",
              bullets: [
                "Developed & deployed APIs used daily by logistics users; ensured HA & scalability on Azure.",
                "Implemented monitoring with Azure Monitor & App Insights; improved reliability KPIs.",
              ],
            },
            {
              title: "Software Engineer Intern — Java, Spring Boot, Azure",
              start: "Jan 2024",
              end: "Jun 2024",
              bullets: [
                "Built microservices for internal logistics platform; deployed on Azure Kubernetes Service.",
                "Collaborated with senior engineers on code reviews and best practices.",
              ],
            },
          ],
        },
        {
          heading: "Smollan India",
          subheading: "Software Engineer — Next.js, FastAPI, WebRTC, Kafka",
          start: "Mar 2024",
          end: "Apr 2024",
          bullets: [
            "Built features used by 10k+ daily users; deployed on AWS & GCP.",
            "Implemented CI/CD and observability with Grafana/Prometheus.",
          ],
        },
      ],
    },
    {
      key: "projects",
      title: "Projects",
      placement: "right",
      order: 3,
      type: "timeline",
      items: [
        {
          heading: "SocialSphere",
          subheading: "Twitter-like platform — Next.js 14, TRPC, PostgreSQL",
          bullets: [
            "Auth, feeds, notifications; deployment-ready architecture.",
          ],
        },
        {
          heading: "E-commerce",
          subheading: "Stripe, PostgreSQL, Prisma, Cloudinary",
          bullets: [
            "Payments, product catalog, file uploads; admin dashboards.",
          ],
        },
      ],
    },
    {
      key: "education",
      title: "Education",
      placement: "right",
      order: 4,
      type: "timeline",
      items: [
        {
          heading: "Manipal University Jaipur — B.Tech Computer Engineering",
          subheading: "CGPA 8.75 • Expected Jul 2025",
        },
      ],
    },
  ],
};
