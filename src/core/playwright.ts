import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { detectPackageManager } from "./package-manager.js";

export async function setupPlaywright(targetDir: string, framework: string) {
  const pm = detectPackageManager();
  console.log(chalk.cyan("🎭 Installing Playwright for E2E testing..."));

  await execa(pm, ["install", "-D", "@playwright/test"], {
    cwd: targetDir,
    stdio: "inherit",
  });

  // Optionally install browsers automatically
  await execa("npx", ["playwright", "install"], {
    cwd: targetDir,
    stdio: "inherit",
  });

  // playwright.config.ts
  const config = `
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 1,
  reporter: [["list"], ["html"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
`;

  await fs.writeFile(
    path.join(targetDir, "playwright.config.ts"),
    config.trim() + "\n"
  );

  // Example test
  const testFile = `
import { test, expect } from "@playwright/test";

test("homepage has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Vite|React|Next|Vue/i);
});
`;
  await fs.ensureDir(path.join(targetDir, "tests/e2e"));
  await fs.writeFile(
    path.join(targetDir, "tests/e2e/example.spec.ts"),
    testFile.trim() + "\n"
  );

  // Add npm scripts
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["test:e2e"] = "playwright test";
  pkg.scripts["test:e2e:ui"] = "playwright test --ui";
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  console.log(chalk.green("✅ Playwright E2E setup complete."));
}
