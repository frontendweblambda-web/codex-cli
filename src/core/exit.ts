import chalk from "chalk";

/**
 * Handles SIGINT (Ctrl+C) and cleanly exits the CLI.
 */
export function setupGracefulExit() {
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n\n⚠️  Process interrupted by user (Ctrl+C)."));
    console.log(chalk.gray("🧹 Cleaning up before exit...\n"));
    process.exit(0);
  });

  process.on("uncaughtException", (err) => {
    if (err.name === "ExitPromptError") {
      console.log(chalk.yellow("\n\n👋 Prompt cancelled by user.\n"));
      process.exit(0);
    }
    console.error(chalk.red("❌ Uncaught error:"), err);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason: any) => {
    if (reason?.name === "ExitPromptError") {
      console.log(chalk.yellow("\n\n👋 Prompt cancelled by user.\n"));
      process.exit(0);
    }
    console.error(chalk.red("❌ Unhandled rejection:"), reason);
    process.exit(1);
  });
}
