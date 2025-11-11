// src/core/cleanup.ts
import fs from "fs-extra";
import chalk from "chalk";

const cleanupPaths: string[] = [];

/** Register a path (directory or file) to be cleaned up on exit. */
export function registerCleanupPath(path: string) {
  if (!cleanupPaths.includes(path)) cleanupPaths.push(path);
}

/** Remove all registered paths (e.g., incomplete project directories). */
export async function cleanupRegisteredPaths() {
  if (!cleanupPaths.length) return;
  console.log(chalk.yellow("\n🧹 Cleaning up incomplete project files..."));
  for (const dir of cleanupPaths) {
    try {
      if (await fs.pathExists(dir)) await fs.remove(dir);
      console.log(chalk.gray(`  Removed: ${dir}`));
    } catch (err) {
      console.warn(
        chalk.red(`⚠️ Failed to remove ${dir}:`),
        (err as Error).message
      );
    }
  }
  cleanupPaths.length = 0;
}

/** Mark project as finalized (removes from cleanup list). */
export function markProjectFinalized(path: string) {
  const index = cleanupPaths.indexOf(path);
  if (index !== -1) cleanupPaths.splice(index, 1);
}
