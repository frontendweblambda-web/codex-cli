import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Copies a template folder into the target directory.
 * Works in both src (dev) and dist (built) environments.
 */
export const copyTemplate = async (templateName: string, targetDir: string) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // 🔹 Detect project root — works from src/ or dist/
    const projectRoot = path.resolve(__dirname, "..", "..");

    // Try both possible template locations
    const srcTemplates = path.resolve(
      projectRoot,
      "src",
      "templates",
      templateName
    );
    const distTemplates = path.resolve(
      projectRoot,
      "dist",
      "templates",
      templateName
    );

    // Choose whichever exists
    let templatePath = (await fs.pathExists(srcTemplates))
      ? srcTemplates
      : distTemplates;

    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`❌ Template not found: ${templatePath}`);
    }

    // console.log(chalk.cyan(`📂 Copying template from: ${templatePath}`));

    await fs.copy(templatePath, targetDir, {
      filter: (src) =>
        !src.includes("node_modules") &&
        !src.includes(".next") &&
        !src.includes(".git"),
    });

    // console.log(chalk.green(`✅ Template copied to ${targetDir}`));
  } catch (err: any) {
    console.error(chalk.red("❌ Failed to copy template:"), err.message);
    process.exit(1);
  }
};
