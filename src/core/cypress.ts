import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { detectPackageManager } from "./package-manager.js";

export async function setupCypress(targetDir: string, framework: string) {
  const pm = detectPackageManager();
  console.log(chalk.cyan("🧭 Installing Cypress for E2E testing..."));

  await execa(pm, ["install", "-D", "cypress", "@testing-library/cypress"], {
    cwd: targetDir,
    stdio: "inherit",
  });

  console.log(chalk.gray("🧠 Creating Cypress configuration..."));

  // Create cypress.config.ts
  const config = `
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx,js,jsx}",
  },
});
`;
  await fs.writeFile(
    path.join(targetDir, "cypress.config.ts"),
    config.trim() + "\n"
  );

  // Example test
  const test = `
describe("Homepage", () => {
  it("should load and show header", () => {
    cy.visit("/");
    cy.contains("Hello").should("exist");
  });
});
`;
  await fs.ensureDir(path.join(targetDir, "cypress/e2e"));
  await fs.writeFile(
    path.join(targetDir, "cypress/e2e/example.cy.ts"),
    test.trim() + "\n"
  );

  // Support file
  await fs.ensureDir(path.join(targetDir, "cypress/support"));
  await fs.writeFile(
    path.join(targetDir, "cypress/support/e2e.ts"),
    `import "@testing-library/cypress/add-commands";\n`
  );

  // Add npm scripts
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["test:e2e"] = "cypress run";
  pkg.scripts["test:e2e:open"] = "cypress open";
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  console.log(chalk.green("✅ Cypress E2E setup complete."));
}
