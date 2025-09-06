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
  link?:string;
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
  invisibleKeywords?: string[]; // ATS-visible keywords that are invisible to humans
};

export const initialData: ResumeData = {
  meta: {
    fullName: "Gitanshu Talwar",
    title: "Backend Software Engineer",
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
  layout: { leftWidth: 30, rightWidth: 70 },
  sections: [
    {
      key: "summary",
      title: "Summary",
      placement: "left",
      order: 1,
      type: "rich",
      content:
        "Backend Software Engineer with 2+ years experience building Java Spring Boot microservices, caching layers, and cloud-native backend systems on Azure and AWS. Skilled in designing secure, reliable, and high-performance services. Also experienced with frontend (React, Next.js) and DevOps (Kubernetes, Terraform), enabling full end-to-end delivery.”",
    },
    {
      key: "education",
      title: "Education",
      placement: "left",
      order: 2,
      type: "timeline",

      items: [
        {
          heading: "Manipal University Jaipur ",
          subheading: "B.Tech Computer and Communication Engineering",
          start: "2021",
          end: "2025",
          bullets: ["Grade: 8.75", "Awards: Dean's List"],
        },
      ],
    },
    {
      key: "skills",
      title: "Skills",
      placement: "left",
      order: 3,
      type: "grouped",
      groups: [
        {
          name: "Frontend",
          items: ["React", "Next.js", "TypeScript", "Tailwind", "Angular"],
        },
        {
          name: "Backend",
          items: [
            "Java",
            "Spring Boot",
            "Node.js",
            "Django",
            "FastAPI",
            "Go",
            "GraphQL",
            "Express",
            "Firebase",
            "System Design",
          ],
        },
        {
          name: "DevOps",
          items: [
            "Kubernetes",
            "Docker",
            "Terraform",
            "AWS",
            "Azure",
            "GCP",
            "Github Actions",
            "Grafana",
            "Prometheus",
            "Linux",
            "Agrocd",
          ],
        },
        { name: "Databases", items: ["PostgreSQL", "MongoDB", "SQL Server"] },
        {
          name: "Other",
          items: [
            "RESTful Apis",
            "GraphQL",
            "Websockets",
            "Kafka",
            // "Microservices",
            // "System Design",
          ],
        },
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
              start: "Jul 2025",
              end: "Present",
              bullets: [
                "Built and deployed Java Spring Boot microservices used daily by thousands of logistics user.",
                "Implemented caching + SQL Server optimizations, reducing API response times by ~40%.",
                "Deployed Java microservices on Azure Kubernetes Service (AKS), with end-to-end monitoring and observability using Grafana, Loki, and Prometheus to track performance, reliability, and system health.",

                "Implemented Kafka event streaming from multiple warehouse management systems into a single global visibility platform.",
                "Designed a custom OAuth + SSO-based auth flow for secure access across distributed systems",
              ],
            },
            {
              title: "Software Engineer Intern — Java, Spring Boot, Azure",
              start: "Jul 2024",
              end: "Jul 2025",
              bullets: [
                "Built microservices for an internal logistics platform; deployed on Azure Kubernetes Service with DevOps pipelines.",
                "Deployed automated shipping reports on Azure Blob Storage, improving data accessibility for global teams.",
                "Collaborated with senior engineers on code reviews and best practices for scalable Java microservices.",
              ],
            },
          ],
        },
        {
          heading: "Smollan India",
          subheading: "Software Engineer Intern",
          start: "Mar 2024",
          end: "Apr 2024",
          bullets: [
            "Collaborated on Google projects, including a marketing product currently used by 10,000+ people daily.",
            "Created a custom Webflow-like platform using GrapesJS and agentic AI, enabling rapid generation of tailored websites with minimal manual effort.",
            "Engineered full-stack applications with Next.js, FastAPI, Unity, and BigQuery, integrating real-time communication (WebRTC, WebSocket, webhooks, Kafka) and deploying end-to-end DevOps pipelines on AWS & GCP with CI/CD automation for scalable, production-grade delivery.",
          ],
        },
        {
          heading: "Constituents Ai And Technology",
          subheading: "Software Engineer Intern",
          start: "Nov 2023",
          end: "Mar 2024",
          bullets: [
            "Built web apps with React, TypeScript, Next.js, FastAPI, and GenAI integrations.",
            "Optimized website performance and collaborated with cross-functional teams.",
            "Developed React Native shipment tracking app integrating RFID readers.",
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
          heading: "TypeMasterPro",
          subheading: "React.js, WebSockets, Real-Time Collaboration",
          bullets: [
            "Built a typing platform with WebSocket-based real-time collaboration, achieving 50+ concurrent users with <100ms latency.",
            "Integrated WebSocket-based real-time collaboration for multi-user typing sessions.",
            "Designed modular architecture to extend into competitive typing modes and themes.",
          ],
          link: "https://github.com/gitatractivo/TypeMasterPro",
        },

        {
          heading: "Go ToDo CLI",
          subheading: "Go, Makefile, CLI tooling",
          bullets: [
            "Built a robust command-line ToDo manager in Go with structured project setup.",
            "Implemented task management, persistence, and automation with Makefiles.",
          ],
          link: "https://github.com/gitatractivo/gotodocli",
        },
        {
          heading: "Application Design Studio",
          subheading: "HTML Canvas, REST API, Kubernetes, Jenkins",
          bullets: [
            "Developed a system design tool with REST API persistence for canvas elements.",
            "Implemented CI/CD pipelines using Jenkins and deployed on Kubernetes for scale.",
            "Built a Data Flow Modeling Editor with WebSocket collaboration for visualizing data flows.",
          ],
          link: "https://github.com/gitatractivo/designStudio",
        },

        {
          heading: "SocialSphere",
          subheading: "Twitter-like platform — Next.js 14, TRPC, PostgreSQL",
          bullets: [
            "Auth, feeds, notifications; production-ready architecture.",
            "Tech: Next.js, TRPC, PostgreSQL, Prisma, Docker.",
          ],
          link: "https://github.com/gitatractivo/SocialSphere",
        },
      ],
    },
  ],
  invisibleKeywords: [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Rust",
    "HTML",
    "CSS",
    "SASS",
    "SCSS",
    "Less",
    "Bootstrap",
    "Material-UI",
    "Ant Design",
    "Redux",
    "Vue.js",
    "Angular",
    "Svelte",
    "jQuery",
    "Lodash",
    "Axios",
    "Fetch API",
    "REST API",
    "SOAP",
    "gRPC",
    "WebSocket",
    "Socket.io",
    "JWT",
    "OAuth",
    "OpenID",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "Cassandra",
    "DynamoDB",
    "Firebase",
    "Supabase",
    "Git",
    "SVN",
    "Bitbucket",
    "GitLab",
    "Jenkins",
    "GitHub Actions",
    "CircleCI",
    "Travis CI",
    "Linux",
    "Unix",
    "Windows",
    "macOS",
    "Ubuntu",
    "CentOS",
    "Debian",
    "Microservices",
    "Monolith",
    "Serverless",
    "API Gateway",
    "Load Balancer",
    "CDN",
    "Agile",
    "Scrum",
    "Kanban",
    "Waterfall",
    "TDD",
    "BDD",
    "DDD",
    "SOLID",
    "DRY",
    "Machine Learning",
    "AI",
    "Deep Learning",
    "Neural Networks",
    "TensorFlow",
    "PyTorch",
    "Data Science",
    "Big Data",
    "Hadoop",
    "Spark",
    "Kafka",
    "RabbitMQ",
    "SQS",
    "Security",
    "Authentication",
    "Authorization",
    "Encryption",
    "SSL",
    "TLS",
    "HTTPS",
    "Performance",
    "Optimization",
    "Caching",
    "CDN",
    "Load Testing",
    "Stress Testing",
    "Monitoring",
    "Logging",
    "Alerting",
    "Metrics",
    "Dashboard",
    "Analytics",
    "Mobile Development",
    "React Native",
    "Flutter",
    "Ionic",
    // "Cordova",
    "Progressive Web App",
    "Cloud Computing",
    "Virtualization",
    "Containerization",
    "Orchestration",
    "Service Mesh",
    // "Blockchain",
    // "Cryptocurrency",
    // "Smart Contracts",
    // "Web3",
    // "DeFi",
    // "NFT",
    "DevOps",
    // "Site Reliability Engineering",
    "Infrastructure as Code",
    "Configuration Management",
    "Testing",
    "Unit Testing",
    "Integration Testing",
    "End-to-End Testing",
    "Manual Testing",
    "Project Management",
    "Team Leadership",
    // "Mentoring",
    "Code Review",
    "Technical Documentation",
    "Problem Solving",
    "Critical Thinking",
    "Analytical Skills",
    "Communication",
    "Collaboration",
  ],
};
