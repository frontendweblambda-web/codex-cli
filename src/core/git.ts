import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import ora from "ora";

export const initGit = async (cwd: string) => {
  const spinner = ora("Initializing local git repository...").start();

  try {
    // Step 1 — Init repo
    await execa("git", ["init"], { cwd, shell: true });

    // Step 2 — Write a default .gitignore if missing
    const gitignorePath = path.join(cwd, ".gitignore");
    if (!(await fs.pathExists(gitignorePath))) {
      await fs.writeFile(gitignorePath, "node_modules/\ndist/\n.env\n");
    }

    // Step 3 — Stage and commit
    await execa("git", ["add", "-A"], { cwd, shell: true });
    await execa("git", ["commit", "-m", "🎉 Initial commit from Codex"], {
      cwd,
      shell: true,
    });

    spinner.succeed("✅ Local git repo initialized successfully");
  } catch (err: any) {
    spinner.fail("⚠️ Git initialization failed or skipped");
    console.error(err.message || err);
  }
};
