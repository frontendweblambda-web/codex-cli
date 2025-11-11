import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { mergePackageJson } from "../utils/index.js";
import { copyTemplate } from "./copy.js";
import { detectPackageManager } from "./package-manager.js";

/**
 * Generates a fully configured React template.
 * - Copies base + UI templates
 * - Merges package fragments
 * - Ensures correct type setup and dependencies
 */
export const generateReactTemplate = async (targetDir: string, ui: string) => {
  // console.log(chalk.cyan("🧱 Generating base React project..."));
  await copyTemplate("react/base", targetDir);

  // === Step 1: Apply UI template if selected ===
  if (ui && ui !== "none") {
    console.log(chalk.cyan(`🎨 Applying ${ui} UI configuration...`));
    await copyTemplate(`react/ui/${ui}`, targetDir);

    const pkgFragment = path.join(targetDir, `${ui}.pkg.json`);
    if (await fs.pathExists(pkgFragment)) {
      await mergePackageJson(targetDir, pkgFragment);
      await fs.remove(pkgFragment);
      // console.log(chalk.green(`✅ Merged ${ui}.pkg.json into package.json`));
    }
  }

  // === Step 2: Ensure "type": "module" in package.json ===
  const pkgPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    pkg.type = pkg.type || "module"; // ensure ESM mode
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    // console.log(chalk.gray(`🧩 Ensured "type": "module" in package.json`));
  }

  // === Step 3: Ensure required type dependencies ===
  const pm = detectPackageManager();
  const deps = ["@types/react", "@types/react-dom", "typescript"];

  // console.log(chalk.cyan(`📦 Ensuring required dev dependencies...`));
  try {
    await execa(pm, ["install", "-D", ...deps], {
      cwd: targetDir,
      stdio: "inherit",
    });
    // Step 2 — run audit fix safely (optional)
    await execa(pm, ["audit", "fix", "--force"], {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(chalk.green(`✅ Installed React type packages successfully`));
  } catch (err: any) {
    console.log(chalk.red(`⚠️ Failed to auto-install types:`), err.message);
  }

  console.log(chalk.greenBright("✅ React template setup complete!\n"));
};
