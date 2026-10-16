export interface ProjectTile {
  seed: string;
  big: string;
  cap: string;
}

interface ProjectMeta {
  label: string;
  value: string;
}

export type Audience = "dev" | "design";

export interface Project {
  id: string;
  idx: string;
  audience: Audience;
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
    audience: "dev",
    title: "SIJAGA",
    year: "Thesis · 2025 – 2026",
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
    audience: "dev",
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
    id: "proj-fundtogether",
    idx: "/ 03",
    audience: "dev",
    title: "FundTogether",
    year: "Web3 · 2025",
    ariaLabel: "FundTogether details",
    description:
      "<strong>Crowdfunding, rebuilt for verifiable trust.</strong> FundTogether pairs a familiar <em>Midtrans</em> payment flow for fiat donors with blockchain-backed funding mechanisms, so campaigns raise money through normal checkout while funding records stay independently checkable. A practical step into Web3 product engineering - accountable fundraising infrastructure, not speculation.",
    meta: [
      { label: "Role", value: "Product · Full-stack" },
      { label: "Stack", value: "AdonisJS · Tailwind · Midtrans" },
      { label: "Focus", value: "Crowdfunding · Web3" },
    ],
    tiles: [
      {
        seed: "fundtogether-campaign",
        big: "Campaigns people can actually verify.",
        cap: "FUNDTOGETHER / CAMPAIGN.TXT",
      },
      {
        seed: "fundtogether-payments",
        big: "Fiat in, without the friction.",
        cap: "FUNDTOGETHER / PAYMENTS.TXT",
      },
      {
        seed: "fundtogether-chain",
        big: "Funding events anchored on-chain.",
        cap: "FUNDTOGETHER / CHAIN.TXT",
      },
      {
        seed: "fundtogether-trust",
        big: "Trust designed into every pledge.",
        cap: "FUNDTOGETHER / TRUST.TXT",
      },
    ],
  },
  {
    id: "proj-csirt",
    idx: "/ 04",
    audience: "dev",
    title: "CSIRT Bank Sulteng",
    year: "Security · 2025",
    ariaLabel: "CSIRT Bank Sulteng details",
    description:
      "<strong>Security work is mostly evidence.</strong> At Bank Sulteng the focus was auditability: tamper-evident logging for asset transactions, anchored to an <em>Ethereum testnet</em> so changes leave a trail that is hard to quietly rewrite. The emphasis is accountability - who changed what, when, and whether the record still matches.",
    meta: [
      { label: "Role", value: "Security · Audit" },
      { label: "Stack", value: "Ethereum Testnet · Hardhat · Audit Logs" },
      { label: "Org", value: "PT Bank Sulteng" },
    ],
    tiles: [
      {
        seed: "csirt-audit-trail",
        big: "Every change leaves evidence.",
        cap: "BANK SULTENG / AUDIT.TXT",
      },
      {
        seed: "csirt-testnet",
        big: "Logs anchored beyond the database.",
        cap: "BANK SULTENG / TESTNET.TXT",
      },
      {
        seed: "csirt-integrity",
        big: "Tampering should be obvious.",
        cap: "BANK SULTENG / INTEGRITY.TXT",
      },
      {
        seed: "csirt-accountability",
        big: "Who changed what, and when.",
        cap: "BANK SULTENG / LEDGER.TXT",
      },
    ],
  },
  {
    id: "proj-pt-admin",
    idx: "/ 05",
    audience: "design",
    title: "Tadulako Admin Dashboard",
    year: "UI/UX · 2025",
    ariaLabel: "Tadulako Admin Dashboard details",
    description:
      "<strong>An admin interface designed before it was built.</strong> I mapped Programming Tadulako\u2019s operational workflow in <em>Figma</em> first - navigation, dense data views, repeat actions - then translated the layouts into reusable React and Tailwind components. Community operations, treated like a product: consistent, scannable, ready to extend.",
    meta: [
      { label: "Role", value: "UI/UX · Front-end" },
      { label: "Stack", value: "Figma · React · Tailwind" },
      { label: "Org", value: "Programming Tadulako" },
    ],
    tiles: [
      {
        seed: "pt-admin-system",
        big: "Operations, organized like a product.",
        cap: "ADMIN / SYSTEM.TXT",
      },
      {
        seed: "pt-admin-figma",
        big: "Every screen resolved in Figma first.",
        cap: "ADMIN / FIGMA.TXT",
      },
      {
        seed: "pt-admin-components",
        big: "Layouts became reusable components.",
        cap: "ADMIN / COMPONENTS.TXT",
      },
      {
        seed: "pt-admin-usability",
        big: "Dense data, made scannable.",
        cap: "ADMIN / USABILITY.TXT",
      },
    ],
  },
  {
    id: "proj-hmti",
    idx: "/ 06",
    audience: "design",
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
];
