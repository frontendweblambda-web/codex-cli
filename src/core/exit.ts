// src/core/exit.ts
import chalk from "chalk";

import { stopSpinner } from "./spinner.js";
import { cleanupRegisteredPaths } from "./cleanup.js";

let exitHandled = false;

/**
 * Setup global signal handlers (Ctrl+C, uncaught errors)
 */
export function setupGracefulExit() {
  const handleExitGracefully = async (signal?: string) => {
    if (exitHandled) return;
    exitHandled = true;

    console.log(
      chalk.yellow(`\n⚠️  Caught ${signal || "exit"} — cleaning up...`)
    );
    stopSpinner(false);

    await cleanupRegisteredPaths();

    console.log(chalk.gray("\n👋 Exiting Codex App Generator gracefully.\n"));
    process.exit(signal === "SIGINT" ? 130 : 1);
  };

  process.on("SIGINT", () => handleExitGracefully("SIGINT"));
  process.on("SIGTERM", () => handleExitGracefully("SIGTERM"));

  process.on("uncaughtException", async (err) => {
    console.error(chalk.red("\n❌ Uncaught error:"), err);
    await handleExitGracefully("uncaughtException");
  });

  process.on("unhandledRejection", async (reason) => {
    console.error(chalk.red("\n❌ Unhandled promise rejection:"), reason);
    await handleExitGracefully("unhandledRejection");
  });

  // Return handle to manually trigger cleanup if needed
  return handleExitGracefully;
}
