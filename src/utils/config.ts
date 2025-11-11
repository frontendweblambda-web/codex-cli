import fs from "fs-extra";
import os from "os";
import path from "path";
import chalk from "chalk";
import type { Answers } from "../cli/prompt-duplicate.js";

const CONFIG_DIR = path.join(os.homedir(), ".codex");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

/**
 * Save user preferences after project creation
 */
export const saveUserConfig = async (answers: Answers): Promise<void> => {
  try {
    await fs.ensureDir(CONFIG_DIR);
    // Save only relevant parts (you can prune sensitive info here)
    await fs.writeJSON(CONFIG_FILE, answers, { spaces: 2 });
    console.log(chalk.green(`💾 Saved your Codex setup to ${CONFIG_FILE}`));
  } catch (err: any) {
    console.error(chalk.red("⚠️ Failed to save config:"), err.message);
  }
};

/**
 * Load saved user preferences (typed)
 */
export const loadUserConfig = async (): Promise<Answers | null> => {
  try {
    if (await fs.pathExists(CONFIG_FILE)) {
      const data = await fs.readJSON(CONFIG_FILE);
      // Validate that it has at least required fields
      if (data.projectName && data.framework && data.ui && data.registry) {
        return data as Answers;
      } else {
        console.warn(
          chalk.yellow("⚠️ Saved config is missing required fields — ignoring.")
        );
        return null;
      }
    }
    return null;
  } catch (err: any) {
    console.error(chalk.red("⚠️ Failed to load config:"), err.message);
    return null;
  }
};

/**
 * Clear saved configuration
 */
export const clearUserConfig = async (): Promise<void> => {
  if (await fs.pathExists(CONFIG_FILE)) {
    await fs.remove(CONFIG_FILE);
    console.log(chalk.yellow("🧹 Cleared saved Codex config."));
  } else {
    console.log(chalk.gray("No saved config found."));
  }
};
