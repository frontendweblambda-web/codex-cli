import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { detectPackageManager } from "./package-manager.js";

export async function setupVitest(targetDir: string, framework: string) {
  const pm = detectPackageManager();

  console.log(
    chalk.cyan("📦 Installing Vitest & Testing Library dependencies...")
  );

  const deps = [
    "vitest",
    "@vitest/ui",
    "@testing-library/dom",
    "@testing-library/jest-dom",
    "@testing-library/user-event",
    "@types/jest",
    "jsdom",
  ];

  if (framework === "react") deps.push("@testing-library/react");
  if (framework === "vue") deps.push("@testing-library/vue");

  await execa(pm, ["install", "-D", ...deps], {
    cwd: targetDir,
    stdio: "inherit",
  });

  console.log(chalk.gray("🧠 Creating Vitest configuration..."));

  // vitest.config.ts
  const vitestConfig = `
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx,js,jsx}"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
`;
  await fs.writeFile(
    path.join(targetDir, "vitest.config.ts"),
    vitestConfig.trim() + "\n"
  );

  // setup file
  await fs.ensureDir(path.join(targetDir, "src/tests"));
  await fs.writeFile(
    path.join(targetDir, "src/tests/setup.ts"),
    `import "@testing-library/jest-dom";\n`
  );

  // example test
  const exampleTest =
    framework === "react"
      ? `
import { render, screen } from "@testing-library/react";
import App from "../app";

test("renders the app", () => {
  render(<App />);
  expect(screen.getByText(/Vite + React/i)).toBeInTheDocument();
});
`
      : `
import { render, screen } from "@testing-library/vue";
import App from "../App.vue";

test("renders the app", () => {
  render(App);
  expect(screen.getByText(/Vite + React/i)).toBeTruthy();
});
`;

  await fs.writeFile(
    path.join(targetDir, "src/tests/example.test.tsx"),
    exampleTest.trim() + "\n"
  );

  // package.json scripts
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.test = "vitest --ui";
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  console.log(chalk.green("✅ Vitest setup complete."));
}
