import inquirer from "inquirer";

export type Answers = {
  projectName: string;
  description?: string;
  author?: string;
  license?: string;
  packageScope?: string | null;

  registry: "npm" | "pnpm" | "yarn" | "bun";
  workspace: "single" | "turborepo";

  framework: "react" | "next" | "vue" | "svelte" | "framer" | "rect-router";
  ui: "tailwind" | "mui" | "shadcn" | "antd" | "none";
  routing?: "app" | "pages" | "react-router" | "vue-router";
  store?: "pinia" | "zustand" | "redux";

  language: "typescript" | "javascript"; // ✅ added
  structure: "flat" | "src-folder"; // ✅ added

  testing: "vitest" | "jest" | "none" | "playwright" | "cypress";
  linting: "eslint" | "none";
  formatting: "prettier" | "none";
  commitConventions: boolean;

  editor: "vscode" | "sublime" | "atom" | "none";

  auth: boolean;
  authProvider?: "custom" | "nextauth" | "clerk" | "supabase" | "none";

  database?: "none" | "postgresql" | "supabase" | "mongo" | "sqlite";
  orm?: "prisma" | "typeorm" | "mongoose" | "none";

  caching?: "none" | "api-cache" | "edge" | "redis";
  analytics?: boolean;
  monitoring?: boolean;

  initGit: boolean;
  createRemote: boolean;
  repoVisibility?: "public" | "private";
  remoteOrg?: string | null; // optional GitHub org

  setupCI: boolean;
  ciProvider?: "vercel" | "netlify" | "github-actions" | "none";
  autoInstall: boolean;
  autoStart: boolean;

  useAI?: boolean;
};

export async function askQuestions(
  defaultName?: string,
  flags: any = {}
): Promise<Answers> {
  // validation helpers
  const validateName = (v: string) => {
    if (!v || !v.trim()) return "Project name cannot be empty";
    if (!/^[a-z0-9\-_]+$/i.test(v)) return "Use only letters, numbers, - or _";
    return true;
  };

  // ✅ Ensure CLI args are preloaded
  if (defaultName && !flags.projectName) flags.projectName = defaultName;

  const answers: Partial<Answers> = {};

  // ──────────────── 1. GIT FIRST ────────────────
  const git = await inquirer.prompt([
    {
      type: "confirm",
      name: "initGit",
      message: "🐙 Initialize a Git repository?",
      default: true,
    },
    {
      type: "confirm",
      name: "createRemote",
      message: "📦 Create a remote GitHub repository?",
      default: false,
      when: (a) => a.initGit === true,
    },
    {
      type: "input",
      name: "remoteOrg",
      message: "🏢 GitHub organization (optional):",
      when: (a) => a.createRemote === true,
      default: flags.remoteOrg || "",
    },
    {
      type: "list",
      name: "repoVisibility",
      message: "🔒 Repository visibility:",
      choices: [
        { name: "Public", value: "public" },
        { name: "Private", value: "private" },
      ],
      default: "public",
      when: (a) => a.createRemote === true,
    },
    {
      type: "confirm",
      name: "setupCI",
      message: "⚙️ Setup CI/CD pipeline?",
      default: false,
      when: (a) => a.createRemote === true,
    },
    {
      type: "list",
      name: "ciProvider",
      message: "🚀 Choose deployment target:",
      choices: [
        { name: "Vercel", value: "vercel" },
        { name: "Netlify", value: "netlify" },
        { name: "GitHub Actions", value: "github-actions" },
        { name: "None", value: "none" },
      ],
      when: (a) => a.setupCI === true,
    },
  ]);
  Object.assign(answers, git);

  // Basic metadata
  const meta = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "🧱 Project name:",
      default: defaultName || flags.projectName || "my-codex-app",
      validate: validateName,
      when: !(defaultName || flags.projectName), // 🧠 skip if already passed
    },
    {
      type: "input",
      name: "description",
      message: "📝 Short description (optional):",
      default: flags.description || "",
    },
    {
      type: "input",
      name: "author",
      message: "👤 Author (name/email) (optional):",
      default: flags.author || "",
    },
    {
      type: "list",
      name: "license",
      message: "📜 License:",
      choices: ["MIT", "Apache-2.0", "GPL-3.0", "Unlicense", "Other"],
      default: flags.license || "MIT",
    },
    {
      type: "input",
      name: "packageScope",
      message: "📦 Package scope (optional, without @):",
      default: flags.packageScope || "",
      filter: (v: string) => (v ? `@${v}` : null),
    },
  ]);
  Object.assign(answers, meta);

  // ──────────────── 3. LANGUAGE & STRUCTURE ────────────────
  const language = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "💬 Language preference:",
      choices: [
        { name: "TypeScript", value: "typescript" },
        { name: "JavaScript", value: "javascript" },
      ],
      default: "typescript",
    },
    {
      type: "list",
      name: "structure",
      message: "📁 Project structure:",
      choices: [
        { name: "Flat (no src folder)", value: "flat" },
        { name: "With src/ folder", value: "src-folder" },
      ],
      default: "src-folder",
    },
  ]);
  Object.assign(answers, language);

  // Environment choices
  const env = await inquirer.prompt([
    {
      type: "list",
      name: "registry",
      message: "📦 Package manager:",
      choices: ["npm", "pnpm", "yarn", "bun"],
      default: flags.registry || "npm",
    },
    {
      type: "list",
      name: "workspace",
      message: "🧩 Workspace type:",
      choices: [
        { name: "Single project", value: "single" },
        { name: "Turborepo (monorepo)", value: "turborepo" },
      ],
      default: flags.workspace || "single",
    },
  ]);
  Object.assign(answers, env);

  // Framework / UI / routing
  const fw = await inquirer.prompt([
    {
      type: "list",
      name: "framework",
      message: "⚙️ Choose framework:",
      choices: [
        { name: "React (Vite)", value: "react" },
        { name: "Next.js (App Router)", value: "next" },
        { name: "Vue (Vite)", value: "vue" },
      ],
      default: flags.framework || "react",
      when: !flags.framework, // 👈 skip if CLI provided
    },
    {
      type: "list",
      name: "ui",
      message: "🎨 UI library:",
      choices: ["tailwind", "mui", "shadcn", "antd", "none"],
      default: flags.ui || "tailwind",
      when: !flags.ui, // 👈 skip if CLI provided
    },
    {
      type: "list",
      name: "routing",
      message: "🗺 Routing:",
      choices: (answersSoFar: any) => {
        const fwChoice = (answersSoFar.framework ||
          answers.framework) as string;
        if (fwChoice === "next")
          return [
            { name: "App Router (recommended)", value: "app" },
            { name: "Pages Router", value: "pages" },
          ];
        if (fwChoice === "vue")
          return [{ name: "Vue Router", value: "vue-router" }];
        return [{ name: "React Router (vite)", value: "react-router" }];
      },
      default: flags.routing || undefined,
    },
  ]);
  Object.assign(answers, fw);

  // Testing, linting, formatting and commit conventions
  const quality = await inquirer.prompt([
    {
      type: "list",
      name: "editor",
      message: "🧠 Preferred editor configuration:",
      choices: [
        { name: "VS Code", value: "vscode" },
        { name: "Sublime Text", value: "sublime" },
        { name: "Atom", value: "atom" },
        { name: "None", value: "none" },
      ],
      default: flags.editor || "vscode",
      when: !flags.editor, // skip if passed via CLI
    },
    {
      type: "list",
      name: "testing",
      message: "🧪 Testing framework:",
      choices: [
        { name: "Vitest (unit, fast, Vite-friendly)", value: "vitest" },
        { name: "Jest (Next.js default)", value: "jest" },
        { name: "Playwright (E2E browser tests)", value: "playwright" },
        { name: "Cypress (E2E UI tests)", value: "cypress" },
        { name: "None", value: "none" },
      ],
      default: flags.testing || "none",
      when: !flags.testing,
    },

    {
      type: "list",
      name: "linting",
      message: "🔍 Linting:",
      choices: [
        { name: "ESLint", value: "eslint" },
        { name: "None", value: "none" },
      ],
      default: flags.linting || "eslint",
    },
    {
      type: "list",
      name: "formatting",
      message: "🎨 Formatting:",
      choices: [
        { name: "Prettier", value: "prettier" },
        { name: "None", value: "none" },
      ],
      default: flags.formatting || "prettier",
    },
    {
      type: "confirm",
      name: "commitConventions",
      message: "🔁 Use Conventional Commits (commitlint + husky)?",
      default: true,
    },
  ]);
  Object.assign(answers, quality);

  // Auth, DB, caching, analytics
  const infra = await inquirer.prompt([
    {
      type: "confirm",
      name: "auth",
      message: "🔐 Add authentication (starter setup)?",
      default: !!flags.auth,
    },
    {
      type: "list",
      name: "authProvider",
      message: "🔑 Auth Provider:",
      choices: [
        { name: "NextAuth (Next only)", value: "nextauth" },
        { name: "Clerk", value: "clerk" },
        { name: "Supabase Auth", value: "supabase" },
        { name: "None", value: "none" },
      ],
      when: (a: any) => a.auth === true,
      default: "nextauth",
    },
    {
      type: "list",
      name: "database",
      message: "🗄 Database (for starter config):",
      choices: [
        { name: "None", value: "none" },
        { name: "Postgres (Prisma)", value: "prisma-postgres" },
        { name: "Supabase", value: "supabase" },
        { name: "MongoDB", value: "mongo" },
        { name: "SQLite (local)", value: "sqlite" },
      ],
      default: flags.database || "none",
    },
    {
      type: "list",
      name: "orm",
      message: "🧭 ORM:",
      choices: (a: any) => {
        if (a.database === "prisma-postgres" || a.database === "sqlite")
          return [
            { name: "Prisma", value: "prisma" },
            { name: "None", value: "none" },
          ];
        if (a.database === "mongo")
          return [
            { name: "Mongoose/TypeORM", value: "typeorm" },
            { name: "None", value: "none" },
          ];
        return [{ name: "None", value: "none" }];
      },
      when: (a: any) => a.database && a.database !== "none",
      default: flags.orm || "prisma",
    },
    {
      type: "list",
      name: "caching",
      message: "⚡ Caching strategy:",
      choices: [
        { name: "None", value: "none" },
        {
          name: "API-level cache (stale-while-revalidate)",
          value: "api-cache",
        },
        { name: "Edge cache (CDN)", value: "edge" },
        { name: "Redis (external)", value: "redis" },
      ],
      default: flags.caching || "none",
    },
    {
      type: "confirm",
      name: "analytics",
      message: "📈 Add analytics starter (PostHog / Plausible)?",
      default: false,
    },
    {
      type: "confirm",
      name: "monitoring",
      message: "🛠 Add error monitoring (Sentry / Playwright traces)?",
      default: false,
    },
  ]);
  Object.assign(answers, infra);

  // Git & Repo details
  const repo = await inquirer.prompt([
    {
      type: "confirm",
      name: "initGit",
      message: "🐙 Initialize local git repo?",
      default: true,
    },
    {
      type: "confirm",
      name: "createRemote",
      message: "📦 Create remote GitHub repo?",
      default: false,
      when: (a: any) => a.initGit === true,
    },
    {
      type: "input",
      name: "remoteOrg",
      message: "🏢 GitHub organization (leave blank to use your account)",
      when: (a: any) => a.createRemote === true,
      default: flags.remoteOrg || "",
    },
    {
      type: "list",
      name: "repoVisibility",
      message: "🔒 Repo visibility:",
      choices: [
        { name: "Public", value: "public" },
        { name: "Private", value: "private" },
      ],
      when: (a: any) => a.createRemote === true,
      default: "public",
    },
    {
      type: "confirm",
      name: "setupCI",
      message: "⚡ Configure CI / deploy?",
      default: false,
      when: (a: any) => a.createRemote === true,
    },
    {
      type: "list",
      name: "ciProvider",
      message: "🚀 Deployment target:",
      choices: [
        { name: "Vercel", value: "vercel" },
        { name: "Netlify", value: "netlify" },
        { name: "GitHub Actions", value: "github-actions" },
        { name: "None", value: "none" },
      ],
      when: (a: any) => a.setupCI === true,
    },
  ]);
  Object.assign(answers, repo);

  // Convenience & automation
  const automation = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoInstall",
      message: "⚙️ Run package install after generation?",
      default: true,
    },
    {
      type: "confirm",
      name: "autoStart",
      message: "▶️ Start dev server after install?",
      default: false,
    },
    {
      type: "confirm",
      name: "useAI",
      message: "🤖 Let AI suggest config (experimental)?",
      default: false,
    },
  ]);
  Object.assign(answers, automation);

  // final return as typed Answers
  return answers as Answers;
}
