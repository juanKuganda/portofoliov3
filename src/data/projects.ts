export interface ProjectTile {
  seed: string;
  big: string;
  cap: string;
}

export interface ProjectMeta {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  idx: string;
  title: string;
  year: string;
  ariaLabel: string;
  description: string;
  meta: ProjectMeta[];
  tiles: ProjectTile[];
}

export const projects: Project[] = [
  {
    id: "proj-sijaga",
    idx: "/ 01",
    title: "SIJAGA",
    year: "Thesis · 2025 – 26",
    ariaLabel: "SIJAGA details",
    description:
      "<strong>Decentralized diploma verification.</strong> Most systems prove a diploma is <em>authentic</em> by matching university archives. SIJAGA proves <em>who owns it</em> - a non-transferable certificate held in the graduate\u2019s own wallet, designed with Indonesian data-protection law in mind.",
    meta: [
      { label: "Role", value: "Research · Full-stack" },
      { label: "Stack", value: "Next.js · Solidity · Hardhat" },
      { label: "Status", value: "Thesis project" },
    ],
    tiles: [
      {
        seed: "sijaga-problem",
        big: "Diploma fraud is identity fraud.",
        cap: "SIJAGA / PROBLEM.TXT",
      },
      {
        seed: "sijaga-protocol",
        big: "A soulbound certificate, held by the graduate.",
        cap: "SIJAGA / PROTOCOL.TXT",
      },
      {
        seed: "sijaga-stack",
        big: "Next.js · Solidity · Hardhat",
        cap: "SIJAGA / STACK.TXT",
      },
      {
        seed: "sijaga-audit",
        big: "8 critical · 7 high · 10 medium findings audited.",
        cap: "SIJAGA / AUDIT.TXT",
      },
    ],
  },
  {
    id: "proj-siasti",
    idx: "/ 02",
    title: "SIASTI",
    year: "Internship · 2025",
    ariaLabel: "SIASTI details",
    description:
      "<strong>Asset management dashboard</strong> built during my internship at PT Bank Sulteng. A Laravel + React dashboard for tracking company assets, with an audit log anchored to an Ethereum testnet so every change leaves a tamper-evident trail.",
    meta: [
      { label: "Role", value: "Front-end · Smart contract" },
      { label: "Stack", value: "Laravel · React · Hardhat" },
      { label: "Org", value: "PT Bank Sulteng" },
    ],
    tiles: [
      {
        seed: "siasti-system",
        big: "Every asset, one dashboard.",
        cap: "SIASTI / SYSTEM.TXT",
      },
      {
        seed: "siasti-ledger",
        big: "Audit log anchored to an ETH testnet.",
        cap: "SIASTI / LEDGER.TXT",
      },
      {
        seed: "siasti-stack",
        big: "Laravel · React · Hardhat",
        cap: "SIASTI / STACK.TXT",
      },
      {
        seed: "siasti-context",
        big: "Built Sep – Dec 2025, Bank Sulteng.",
        cap: "SIASTI / CONTEXT.TXT",
      },
    ],
  },
  {
    id: "proj-hmti",
    idx: "/ 03",
    title: "HMTI Website",
    year: "Ongoing · 2024 – Present",
    ariaLabel: "HMTI website details",
    description:
      "<strong>Website for HMTI UNTAD</strong>, the informatics student association. I handle the front-end: structure, styling, and ongoing updates for announcements, events, and organizational profiles.",
    meta: [
      { label: "Role", value: "Front-end developer" },
      { label: "Stack", value: "React · Tailwind" },
      { label: "Since", value: "Jun 2024" },
    ],
    tiles: [
      {
        seed: "hmti-site",
        big: "The association\u2019s front door.",
        cap: "HMTI / SITE.TXT",
      },
      {
        seed: "hmti-role",
        big: "Front-end developer since Jun 2024.",
        cap: "HMTI / ROLE.TXT",
      },
      {
        seed: "hmti-stack",
        big: "React · Tailwind",
        cap: "HMTI / STACK.TXT",
      },
      {
        seed: "hmti-scope",
        big: "Events, announcements, profiles.",
        cap: "HMTI / SCOPE.TXT",
      },
    ],
  },
  {
    id: "proj-mentor",
    idx: "/ 04",
    title: "Web Mentoring",
    year: "Ongoing · 2025 – Present",
    ariaLabel: "Mentoring details",
    description:
      "<strong>Weekly web development mentoring</strong> for two Palu communities: Programming Tadulako and HammerCode. Sessions run from HTML/CSS/JS fundamentals up to building and shipping real projects.",
    meta: [
      { label: "Role", value: "Mentor" },
      { label: "Communities", value: "Programming Tadulako · HammerCode" },
      { label: "Since", value: "Jan 2025" },
    ],
    tiles: [
      {
        seed: "mentor-format",
        big: "Teaching the web, weekly.",
        cap: "MENTOR / FORMAT.TXT",
      },
      {
        seed: "mentor-reach",
        big: "Programming Tadulako · HammerCode.",
        cap: "MENTOR / REACH.TXT",
      },
      {
        seed: "mentor-topics",
        big: "HTML · CSS · JavaScript · React",
        cap: "MENTOR / TOPICS.TXT",
      },
      {
        seed: "mentor-method",
        big: "Fundamentals → real projects.",
        cap: "MENTOR / METHOD.TXT",
      },
    ],
  },
];
