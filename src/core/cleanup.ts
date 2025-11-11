import chalk from "chalk";
import fs from "fs-extra";

let cleanupPath: string | null = null;
let spinnerStopper: (() => void) | null = null;

/**
 * Register a project path to clean if the process exits early.
 */
export function registerCleanupPath(path: string) {
  cleanupPath = path;
}

/**
 * Register a spinner (or cleanup callback) to stop on exit.
 */
export function registerSpinnerStopper(stopFn: () => void) {
  spinnerStopper = stopFn;
}

/**
 * Perform cleanup when process is interrupted or crashes.
 */
async function handleExitGracefully(message: string) {
  console.log(chalk.yellow(`\n${message}`));

  if (spinnerStopper) {
    spinnerStopper();
    spinnerStopper = null;
  }

  if (cleanupPath && (await fs.pathExists(cleanupPath))) {
    console.log(chalk.gray(`🧹 Removing partial project at ${cleanupPath}...`));
    try {
      await fs.remove(cleanupPath);
      console.log(chalk.green(`✅ Cleaned up ${cleanupPath}\n`));
    } catch (err: any) {
      console.log(
        chalk.red(`⚠️  Failed to delete ${cleanupPath}: ${err.message}`)
      );
    }
  }

  process.exit(0);
}

/**
 * Setup signal handlers for Ctrl+C and unhandled errors.
 */
export function setupGracefulExit() {
  process.on("SIGINT", () =>
    handleExitGracefully("⚠️  Process interrupted by user (Ctrl+C).")
  );

  process.on("uncaughtException", async (err) => {
    if (err.name === "ExitPromptError") {
      await handleExitGracefully("👋 Prompt cancelled by user.");
      return;
    }
    console.error(chalk.red("\n❌ Uncaught error:"), err);
    await handleExitGracefully("🛑 Exiting due to unhandled error.");
  });

  process.on("unhandledRejection", async (reason: any) => {
    if (reason?.name === "ExitPromptError") {
      await handleExitGracefully("👋 Prompt cancelled by user.");
      return;
    }
    console.error(chalk.red("\n❌ Unhandled rejection:"), reason);
    await handleExitGracefully("🛑 Exiting due to promise rejection.");
  });
}
