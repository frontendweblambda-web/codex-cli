import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { detectPackageManager } from "./package-manager.js";

export async function setupJest(targetDir: string, framework: string) {
  const pm = detectPackageManager();

  console.log(
    chalk.cyan("📦 Installing Jest & Testing Library dependencies...")
  );

  const deps = [
    "jest",
    "babel-jest",
    "ts-jest",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "@testing-library/user-event",
    "@types/jest",
  ];

  await execa(pm, ["install", "-D", ...deps], {
    cwd: targetDir,
    stdio: "inherit",
  });

  console.log(chalk.gray("🧠 Creating Jest configuration..."));

  // jest.config.cjs
  const jestConfig = `
/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  transform: {
    "^.+\\\\.(t|j)sx?$": ["ts-jest", { tsconfig: "tsconfig.json" }]
  }
};
`;
  await fs.writeFile(
    path.join(targetDir, "jest.config.cjs"),
    jestConfig.trim() + "\n"
  );

  // setup file
  await fs.ensureDir(path.join(targetDir, "src/tests"));
  await fs.writeFile(
    path.join(targetDir, "src/tests/setup.ts"),
    `import "@testing-library/jest-dom";\n`
  );

  // example test
  const exampleTest = `
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

test("renders home page", () => {
  render(<Home />);
  expect(screen.getByText(/hello/i)).toBeInTheDocument();
});
`;
  await fs.writeFile(
    path.join(targetDir, "src/tests/example.test.tsx"),
    exampleTest.trim() + "\n"
  );

  // package.json script
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.test = "jest";
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  console.log(chalk.green("✅ Jest setup complete."));
}
