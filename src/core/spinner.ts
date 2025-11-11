// src/core/spinner.ts
import ora, { Ora } from "ora";

let activeSpinner: Ora | null = null;

/** Start a global spinner safely */
export function startSpinner(text: string) {
  stopSpinner();
  activeSpinner = ora({ text, spinner: "dots" }).start();
  return activeSpinner;
}

/** Stop spinner gracefully */
export function stopSpinner(success = true, text?: string) {
  if (activeSpinner) {
    if (success) activeSpinner.succeed(text ?? "Done");
    else activeSpinner.fail(text ?? "Failed");
    activeSpinner = null;
  }
}

/** Forcefully stop any spinner on exit */
export function registerSpinnerStopper() {
  process.on("exit", () => stopSpinner(false));
  process.on("SIGINT", () => stopSpinner(false));
  process.on("SIGTERM", () => stopSpinner(false));
}
