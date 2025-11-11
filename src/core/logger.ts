// src/core/logger.ts
import chalk from "chalk";

type LogLevel = "info" | "warn" | "error" | "success" | "debug";

let isVerbose = false;

/**
 * Sets logger verbosity (true = show debug logs)
 */
export function setVerbose(enabled: boolean) {
  isVerbose = enabled;
}

/**
 * Log helper with emojis, colors, and optional debug control.
 */
export const logger = {
  info: (msg: string) => console.log(chalk.cyan(`ℹ️  ${msg}`)),
  success: (msg: string) => console.log(chalk.green(`✅ ${msg}`)),
  warn: (msg: string) => console.log(chalk.yellow(`⚠️  ${msg}`)),
  error: (msg: string) => console.log(chalk.red(`❌ ${msg}`)),
  step: (msg: string) => console.log(chalk.magenta(`🧩 ${msg}`)),
  title: (msg: string) =>
    console.log(chalk.bold.cyanBright(`\n🚀 ${msg.toUpperCase()}\n`)),
  debug: (msg: string) => {
    if (isVerbose) console.log(chalk.gray(`🪶 ${msg}`));
  },
};

/**
 * Wraps async steps with error handling and time measurement.
 */
export async function runStep(
  title: string,
  fn: () => Promise<void> | void
): Promise<void> {
  const start = Date.now();
  logger.step(title);
  try {
    await fn();
    const ms = Date.now() - start;
    logger.success(`${title} (in ${ms}ms)`);
  } catch (err: any) {
    logger.error(`${title} failed: ${err.message}`);
    if (isVerbose) console.error(err);
    process.exit(1);
  }
}
