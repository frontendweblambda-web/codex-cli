import { Octokit } from "@octokit/rest";
import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";

export const createGitHubRepo = async ({
  projectName,
  visibility = "public",
  org,
  cwd,
}: {
  projectName: string;
  visibility: "public" | "private";
  org?: string | null;
  cwd: string;
}) => {
  const spinner = ora("Authenticating with GitHub...").start();

  try {
    const clientId = "Iv1.1234567890abcdef"; // replace with your actual GitHub OAuth App ID

    const auth = createOAuthDeviceAuth({
      clientType: "oauth-app",
      clientId,
      scopes: ["repo"],
      onVerification(verification) {
        spinner.stop();
        console.log(chalk.yellowBright(`\n🔑 Please complete authentication:`));
        console.log(chalk.cyan(`👉 ${verification.verification_uri}`));
        console.log(chalk.gray(`Your code: ${verification.user_code}\n`));
      },
    });

    const tokenAuth = await auth({ type: "oauth" });
    spinner.succeed("✅ Authenticated with GitHub!");

    const octokit = new Octokit({ auth: tokenAuth.token });

    const repoSpinner = ora("📦 Creating repository on GitHub...").start();
    let repo;

    if (org) {
      repo = await octokit.repos.createInOrg({
        org,
        name: projectName,
        private: visibility === "private",
      });
    } else {
      repo = await octokit.repos.createForAuthenticatedUser({
        name: projectName,
        private: visibility === "private",
      });
    }

    repoSpinner.succeed(
      `✅ GitHub repository created: ${chalk.cyan(repo.data.html_url)}`
    );

    // Link local repo → remote
    await execa("git", ["remote", "add", "origin", repo.data.ssh_url], {
      cwd,
      shell: true,
    });
    await execa("git", ["branch", "-M", "main"], { cwd, shell: true });
    await execa("git", ["push", "-u", "origin", "main"], { cwd, shell: true });

    console.log(chalk.greenBright("\n🚀 Pushed initial commit to GitHub!\n"));
    return repo.data.html_url;
  } catch (error: any) {
    spinner.fail("❌ GitHub repo creation failed");
    console.error(error.message || error);
    return null;
  }
};
