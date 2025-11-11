import chalk from "chalk";

import { setupVitest } from "./vitest.js";
import { setupJest } from "./jest.js";
import { setupPlaywright } from "./playwright.js";
import { setupCypress } from "./cypress.js";
import { Answers } from "../cli/prompt-duplicate.js";

export async function setupTesting(targetDir: string, config: Answers) {
  if (config.testing === "none") {
    console.log(chalk.yellow("⚙️ Skipping testing setup (user choice)."));
    return;
  }

  console.log(
    chalk.cyan(
      `🧪 Setting up ${config.testing} for ${config.framework.toUpperCase()}...`
    )
  );

  try {
    switch (config.testing) {
      case "vitest":
        await setupVitest(targetDir, config.framework);
        break;
      case "jest":
        await setupJest(targetDir, config.framework);
        break;
      case "playwright":
        await setupPlaywright(targetDir, config.framework);
        break;
      case "cypress":
        await setupCypress(targetDir, config.framework);
        break;
      default:
        console.log(chalk.red(`❌ Unknown testing type: ${config.testing}`));
        return;
    }

    console.log(
      chalk.greenBright(
        `✅ ${config.testing.toUpperCase()} configured successfully!\n`
      )
    );
  } catch (err: any) {
    console.error(chalk.red("❌ Testing setup failed:"), err.message);
  }
}
