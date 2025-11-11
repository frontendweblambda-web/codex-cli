#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateReactTemplate } from "../core/generator.js";
import { run as runInstaller } from "../core/install.js";
import { initGit } from "../core/git.js";
import { createGitHubRepo } from "../core/github.js";
import { saveUserConfig } from "../utils/config.js";
import { setupPrettier } from "../core/prettier.js";
import { previousConfig } from "../core/saved-config.js";
import { setupEditorConfig } from "../core/editor.js";
import { setupLinting } from "../core/linting.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

async function main() {
  program
    .name("create-codex-app")
    .version("1.0.0")
    .description("🧱 Codex App Generator - Create modern web apps instantly")
    .argument("[projectName]", "Name of your new project")
    .option("--framework <framework>", "Choose framework (react, next, vue)")
    .option("--ui <ui>", "UI library (tailwind, mui, shadcn, antd)")
    .option("--skip-install", "Skip dependency installation")
    .option("--no-git", "Skip Git initialization")
    .action(async (cliProjectName, options) => {
      console.clear();
      console.log(chalk.magentaBright("\n🚀 Welcome to Codex App Generator\n"));

      // 🧠 STEP 1: Try to load previous config
      let answers = await previousConfig(cliProjectName, options);

      // ✅ STEP 2: Define a guaranteed project name
      const finalName = answers.projectName || cliProjectName || "my-codex-app";
      answers.projectName = finalName;

      if (!finalName || typeof finalName !== "string") {
        console.error(
          chalk.red("❌ Invalid project name. Please provide a valid name.")
        );
        process.exit(1);
      }

      const projectDir = path.resolve(process.cwd(), finalName);

      // ✅ STEP 3: Ensure directory is empty
      if (await fs.pathExists(projectDir)) {
        console.log(chalk.red(`❌ Directory ${finalName} already exists.`));
        process.exit(1);
      }

      // ✅ STEP 4: Create directory
      await fs.ensureDir(projectDir);
      console.log(chalk.cyan(`\n📁 Creating project in ${projectDir}\n`));

      // ✅ STEP 5: Generate base template
      if (answers.framework === "react") {
        await generateReactTemplate(projectDir, answers.ui);
      } else {
        console.log(
          chalk.red(`❌ Framework ${answers.framework} not yet supported.`)
        );
        process.exit(1);
      }

      if (answers.formatting === "prettier") {
        await setupPrettier(projectDir);
      }

      if (answers.linting == "eslint") {
        await setupLinting(projectDir, answers);
      }

      await setupEditorConfig(projectDir, answers.editor);

      // ✅ STEP 6: Install dependencies
      if (!options.skipInstall) {
        console.log(chalk.cyan("\n📦 Installing dependencies...\n"));
        await runInstaller(projectDir);
      }

      // ✅ STEP 7: Initialize local Git
      if (answers.initGit && options.git !== false) {
        console.log(chalk.cyan("\n🐙 Initializing local Git repository...\n"));
        await initGit(projectDir);

        // ✅ STEP 8: Optional GitHub repo creation
        if (answers.createRemote) {
          const url = await createGitHubRepo({
            projectName: answers.projectName,
            visibility: answers.repoVisibility || "public",
            org: answers.remoteOrg,
            cwd: projectDir,
          });

          if (url) {
            console.log(
              chalk.greenBright(`🌍 Remote GitHub repo linked: ${url}`)
            );
          }
        }
      } else {
        console.log(
          chalk.yellow("\n⚙️ Skipping Git initialization as per user choice.\n")
        );
      }

      // ✅ STEP 9: Save config for next time
      await saveUserConfig(answers);

      // ✅ STEP 10: Final message
      // ✅ STEP 10: Start dev server automatically if chosen
      if (answers.autoStart) {
        console.log(chalk.cyan("\n▶️ Starting development server...\n"));
        const { execa } = await import("execa");
        try {
          const pm = answers.registry || "npm";
          await execa(pm, ["run", "dev"], {
            cwd: projectDir,
            stdio: "inherit",
          });
        } catch (err) {
          console.error(
            chalk.red("❌ Failed to start dev server:"),
            (err as Error).message
          );
        }
      }
      console.log(
        chalk.greenBright(`\n✅ Project "${finalName}" created successfully!`)
      );
      console.log(`
Next steps:
  cd ${finalName}
  ${answers.registry || "npm"} run dev

Happy coding! 🎨
`);
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(chalk.red("❌ Fatal error:"), err);
  process.exit(1);
});
