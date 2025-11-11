import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { detectPackageManager } from "./package-manager.js";

/**
 *
 */
export const setupPrettier = async (targetDir: string) => {
  console.log(chalk.cyan("🎨 Setting up Prettier configuration..."));

  const prettierConfig = {
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    tabWidth: 2,
    printWidth: 100,
    arrowParens: "always",
    plugins: [
      "@trivago/prettier-plugin-sort-imports",
      "prettier-plugin-tailwindcss",
    ],
    importOrder: ["^react$", "<THIRD_PARTY_MODULES>", "^@/", "^[./]"],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    tailwindConfig: "./tailwind.config.ts",
  };

  await fs.writeJson(path.join(targetDir, ".prettierrc"), prettierConfig, {
    spaces: 2,
  });

  const prettierIgnore = `
node_modules
dist
build
coverage
.vscode
.husky
`;

  await fs.writeFile(path.join(targetDir, ".prettierignore"), prettierIgnore);

  // 3. install prettier
  const pm = detectPackageManager();
  const deps = [
    "prettier",
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ];
  console.log(chalk.cyan(`📦 Installing Prettier dependencies using ${pm}...`));

  try {
    await execa(pm, ["install", "-D", ...deps], {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(chalk.green("✅ Prettier and plugins installed successfully"));
  } catch (err: any) {
    console.error(
      chalk.red("❌ Failed to install Prettier dependencies:"),
      err.message
    );
  }

  console.log(chalk.greenBright("✨ Prettier setup complete!\n"));
};
