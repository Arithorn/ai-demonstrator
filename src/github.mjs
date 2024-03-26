// Import the OpenAI SDK.
// Ensure that you've installed the latest OpenAI SDK version that supports these features.
import OpenAI from "openai";
import { Octokit } from "octokit";

// Updated function signature to take an object with destructuring, including `openAiModel`
const reviewPullRequest = async (
  res,
  {
    githubUsername,
    githubRepo,
    pullRequestNumber,
    model, // Take OpenAI model as an input parameter
  }
) => {
  const openai = new OpenAI();

  // GitHub API client initialization
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    // Fetch pull request details from GitHub
    const pullRequestResponse = await octokit.rest.pulls.get({
      owner: githubUsername,
      repo: githubRepo,
      pull_number: pullRequestNumber,
    });

    // Extract pull request data
    const pullRequestData = pullRequestResponse.data;

    // Fetch files changed in the pull request
    const filesResponse = await octokit.rest.pulls.listFiles({
      owner: githubUsername,
      repo: githubRepo,
      pull_number: pullRequestNumber,
    });

    // Fetch contents for the changed files
    const changedFiles = await Promise.all(
      filesResponse.data.map(async (file) => {
        const fileContentResponse = await octokit.rest.repos.getContent({
          owner: githubUsername,
          repo: githubRepo,
          path: file.filename,
          ref: pullRequestData.head.sha,
        });
        return `${file.filename}:\n\n${Buffer.from(
          fileContentResponse.data.content,
          "base64"
        ).toString("utf-8")}`;
      })
    );

    // Prepare the prompt for the OpenAI model
    const prompt = `Please review the following pull request:

Repository: https://github.com/${githubUsername}/${githubRepo}
Pull Request Title: ${pullRequestData.title}
Pull Request Description: ${pullRequestData.body}

Changed Files:
${changedFiles.join("\n\n")}

Things to consider:
- Code quality and best practices
- Potential bugs or issues
- Readability and maintainability
- Compliance with project guidelines and conventions
- Performance and efficiency
- Security concerns
- Documentation and comments

Please provide a comprehensive review, highlighting any areas of concern or potential improvements.`;

    // Call the OpenAI model to generate a review using the provided `openAiModel`
    const messages = [
      {
        role: "system",
        content:
          "You are a code reviewer reviewing a pull request. The pull request is a request to merge changes from a feature branch into the main branch of a repository. The pull request includes a title, description, and a list of files that have been changed. Your task is to review the pull request and provide feedback on the changes. You should consider the code quality, potential bugs, readability, maintainability, compliance with project guidelines, performance, security, and documentation. You should provide a comprehensive review, highlighting any areas of concern or potential improvements.",
      },
      { role: "user", content: prompt },
    ];
    const res = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 4096,
    });
    // console.log(res.choices[0].message);
    // console.log(prompt);
    // return prompt;
    return {
      status: true,
      reason: res.choices[0].finish_reason,
      result: res.choices[0].message,
    };
  } catch (error) {
    console.error("Error during pull request review generation:", error);
    throw error;
  }
};

export { reviewPullRequest };
