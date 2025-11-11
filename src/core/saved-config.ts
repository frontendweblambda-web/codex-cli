import chalk from "chalk";
import { loadUserConfig } from "../utils/config.js";
import { askQuestions } from "../cli/prompt.js";
import inquirer from "inquirer";

/**
 * Loads previous user config (if available),
 * and allows changing project name before reuse.
 */
export const previousConfig = async (cliProjectName: string, options: any) => {
  const saved = await loadUserConfig();

  // 🧠 No previous config saved
  if (!saved) {
    return askQuestions(cliProjectName, options);
  }

  console.log(chalk.gray("🧠 Found your last Codex setup."));

  const { reuse } = await inquirer.prompt([
    {
      type: "confirm",
      name: "reuse",
      message: "Would you like to reuse your last configuration?",
      default: true,
    },
  ]);

  if (!reuse) {
    // 👇 Start fresh config
    return await askQuestions(cliProjectName, options);
  }

  // ✅ Ask only for new project name
  const { newName } = await inquirer.prompt([
    {
      type: "input",
      name: "newName",
      message: "🧱 Enter a new project name:",
      default: cliProjectName || `${saved.projectName}-2`,
      validate: (v: string) => {
        if (!v || !v.trim()) return "Project name cannot be empty";
        if (!/^[a-zA-Z0-9-_]+$/.test(v))
          return "Use only letters, numbers, dashes or underscores";
        return true;
      },
    },
  ]);

  // 🧩 Merge the new name with the old config
  const mergedConfig = {
    ...saved,
    projectName: newName,
  };

  console.log(
    chalk.green(
      `✅ Reusing your previous setup with new project name "${newName}"\n`
    )
  );

  return mergedConfig;
};
