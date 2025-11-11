import { execa } from "execa";
import which from "which";
import ora from "ora";
import { detectPackageManager } from "./package-manager.js";

export const run = async (cwd: string) => {
  const manager = detectPackageManager();
  const spinner = ora(`Installing with ${manager}...`).start();
  try {
    const args = manager === "yarn" ? ["install"] : ["install"];
    await execa(manager, args, { cwd, stdio: "inherit", shell: true });
    spinner.succeed(`Dependencies installed with ${manager}`);
  } catch (err) {
    spinner.fail("Install failed");
    throw err;
  }
};
