import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

/**
 * Sets up .editorconfig and IDE-specific configuration
 */
export const setupEditorConfig = async (
  targetDir: string,
  editor: "vscode" | "sublime" | "atom" | "none"
) => {
  console.log(chalk.cyan(`🧠 Configuring editor settings for ${editor}...\n`));

  // --- Step 1: Universal .editorconfig ---
  const editorConfig = `
# EditorConfig helps maintain consistent coding styles
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
`;

  await fs.writeFile(path.join(targetDir, ".editorconfig"), editorConfig);
  console.log(chalk.green("✅ Added .editorconfig"));

  // --- Step 2: Editor-specific configs ---
  switch (editor) {
    case "vscode":
      await setupVSCodeConfig(targetDir);
      break;

    case "sublime":
      await setupSublimeConfig(targetDir);
      break;

    case "atom":
      await setupAtomConfig(targetDir);
      break;

    case "none":
      console.log(chalk.gray("⚙️ Skipping editor-specific settings."));
      break;
  }

  console.log(chalk.greenBright("✨ Editor configuration complete!\n"));
};

// === VS Code ===
async function setupVSCodeConfig(targetDir: string) {
  const vscodeDir = path.join(targetDir, ".vscode");
  await fs.ensureDir(vscodeDir);

  const settings = {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true,
    },
    "eslint.validate": [
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact",
    ],
    "files.exclude": {
      "**/node_modules": true,
      "**/dist": true,
    },
    "typescript.tsdk": "node_modules/typescript/lib",
    "prettier.printWidth": 100,
    "prettier.singleQuote": false,
    "prettier.trailingComma": "all",
    "prettier.tabWidth": 2,
    "prettier.semi": true,
  };

  await fs.writeJson(path.join(vscodeDir, "settings.json"), settings, {
    spaces: 2,
  });
  console.log(
    chalk.green("💻 Added VS Code workspace settings (.vscode/settings.json)")
  );
}

// === Sublime Text ===
async function setupSublimeConfig(targetDir: string) {
  const sublimeProject = {
    folders: [{ path: "." }],
    settings: {
      tab_size: 2,
      translate_tabs_to_spaces: true,
      ensure_newline_at_eof_on_save: true,
      trim_trailing_white_space_on_save: true,
      default_line_ending: "unix",
      ruler: [100],
    },
  };

  const projectName = path.basename(targetDir);
  await fs.writeJson(
    path.join(targetDir, `${projectName}.sublime-project`),
    sublimeProject,
    {
      spaces: 2,
    }
  );
  console.log(chalk.green("📝 Added Sublime Text project configuration"));
}

// === Atom Editor ===
async function setupAtomConfig(targetDir: string) {
  const atomConfig = `
"*":
  core:
    telemetryConsent: "no"
    projectHome: "${targetDir}"
  editor:
    tabLength: 2
    softTabs: true
    showIndentGuide: true
    showInvisibles: true
    preferredLineLength: 100
  whitespace:
    removeTrailingWhitespace: true
`;
  await fs.ensureDir(path.join(targetDir, ".atom"));
  await fs.writeFile(path.join(targetDir, ".atom", "config.cson"), atomConfig);
  console.log(chalk.green("⚛️ Added Atom configuration (.atom/config.cson)"));
}
