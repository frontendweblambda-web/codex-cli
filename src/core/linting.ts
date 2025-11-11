import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { detectPackageManager } from "./package-manager.js";
import { Answers } from "../cli/prompt.js";

/**
 * Sets up ESLint automatically for React (Vite), Next.js, or Vue (Vite)
 * using official framework configurations.
 */
export async function setupLinting(targetDir: string, config: Answers) {
  const framework = config.framework;
  console.log(
    chalk.cyan(`🔍 Setting up ESLint for ${framework.toUpperCase()}...`)
  );

  const pm = detectPackageManager();
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = (await fs.pathExists(pkgPath))
    ? await fs.readJson(pkgPath)
    : { scripts: {} };

  const ignorePatterns = ["node_modules", "dist", "build", "coverage", ".next"];
  let devDeps: string[] = [];
  let eslintConfigContent = "";
  let eslintFileName = "";

  // =============================
  // ⚛️ REACT (Vite)
  // =============================
  if (framework === "react") {
    devDeps = [
      "eslint",
      "@eslint/js",
      "@typescript-eslint/parser",
      "@typescript-eslint/eslint-plugin",
      "eslint-plugin-react",
      "eslint-plugin-react-hooks",
      "eslint-plugin-import",
      "eslint-plugin-prettier",
      "eslint-config-prettier",
      "globals",
    ];

    eslintFileName = "eslint.config.js";
    eslintConfigContent = `
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    ignores: ["dist", "build", "coverage", "node_modules"],
    languageOptions: {
      parser: tsParser,
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module"
    },
    plugins: {
      "@typescript-eslint": ts,
      react,
      "react-hooks": reactHooks,
      prettier
    },
    settings: {
      react: { version: "detect" }
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "import/order": [
        "warn",
        {
          "groups": [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
          "newlines-between": "always"
        }
      ],
      "prettier/prettier": "error"
    }
  }
];
    `.trim();
  }

  // =============================
  // ⚡ NEXT.JS
  // =============================
  else if (framework === "next") {
    devDeps = [
      "eslint",
      "eslint-config-next",
      "eslint-plugin-prettier",
      "eslint-config-prettier",
    ];

    eslintFileName = ".eslintrc.json";
    eslintConfigContent = JSON.stringify(
      {
        root: true,
        extends: ["next/core-web-vitals", "plugin:prettier/recommended"],
        rules: {
          "prettier/prettier": "error",
        },
      },
      null,
      2
    );
  }

  // =============================
  // 🧩 VUE (Vite)
  // =============================
  else if (framework === "vue") {
    devDeps = [
      "eslint",
      "eslint-plugin-vue",
      "@vue/eslint-config-typescript",
      "@vue/eslint-config-prettier",
    ];

    eslintFileName = ".eslintrc.cjs";
    eslintConfigContent = `
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "vue/multi-word-component-names": "off",
    "prettier/prettier": "error"
  }
};
    `.trim();
  } else {
    console.log(chalk.red(`❌ Unknown framework: ${framework}`));
    return;
  }

  // =============================
  // 📦 INSTALL ESLINT DEPENDENCIES
  // =============================
  console.log(chalk.cyan("📦 Installing ESLint dependencies..."));
  try {
    await execa(pm, ["install", "-D", ...devDeps], {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(chalk.green("✅ ESLint dependencies installed."));
  } catch (err: any) {
    console.log(chalk.red("❌ ESLint installation failed:"), err.message);
  }

  // =============================
  // 📝 WRITE ESLINT CONFIGURATION
  // =============================
  const eslintConfigPath = path.join(targetDir, eslintFileName);
  await fs.writeFile(eslintConfigPath, eslintConfigContent + "\n");
  console.log(chalk.green(`✅ Created ${path.basename(eslintConfigPath)}`));

  // =============================
  // 📄 WRITE .eslintignore
  // =============================
  await fs.writeFile(
    path.join(targetDir, ".eslintignore"),
    ignorePatterns.join("\n") + "\n"
  );
  console.log(chalk.green("✅ Created .eslintignore"));

  // =============================
  // 🔧 ADD SCRIPTS
  // =============================
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.lint =
    framework === "next"
      ? "next lint"
      : framework === "vue"
      ? "eslint . --ext .ts,.tsx,.js,.jsx,.vue"
      : "eslint . --ext .ts,.tsx,.js,.jsx";

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  console.log(chalk.green("✅ Added lint script to package.json"));

  console.log(
    chalk.greenBright(
      `✨ ESLint setup complete for ${framework.toUpperCase()}!\n`
    )
  );
}
