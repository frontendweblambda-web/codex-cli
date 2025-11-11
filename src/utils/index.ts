import deepmerge from "deepmerge";
import fs from "fs-extra";
import path from "path";

/**
 * Merges dependencies, devDependencies, and scripts
 * from a partial package.json into the main one.
 */
export const mergePackageJson = async (targetDir: string, fragmentPath: string) => {
  const mainPkgPath = path.join(targetDir, "package.json");

  if (!(await fs.pathExists(mainPkgPath))) {
    throw new Error(`Main package.json not found in ${targetDir}`);
  }

  const mainPkg = await fs.readJson(mainPkgPath);
  const fragment = await fs.readJson(fragmentPath);

  const merged = deepmerge(mainPkg, fragment, {
    arrayMerge: (_dest, src) => [...new Set(src)],
  });

  await fs.writeJson(mainPkgPath, merged, { spaces: 2 });
  console.log(`📦 Merged ${path.basename(fragmentPath)} into package.json`);
};
