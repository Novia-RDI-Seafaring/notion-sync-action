const { Client } = require('@notionhq/client');
const fs = require('fs');
const { markdownToBlocks } = require('@tryfabric/martian');
const github = require('@actions/github');

const notion = new Client({ auth: process.env.INPUT_NOTION_TOKEN });
const pageId = process.env.INPUT_NOTION_PAGE_ID;

// Extract GitHub metadata
const { owner, repo } = github.context.repo;
const branch = github.context.ref.replace('refs/heads/', ''); // Get branch name
const repoDescription = process.env.INPUT_REPO_DESCRIPTION || 'No description provided';

// Extract latest commit date from GitHub context
const latestCommitDate = github.context.payload.head_commit?.timestamp
  ? new Date(github.context.payload.head_commit.timestamp).toISOString()
  : github.context.payload.repository?.pushed_at
  ? new Date(github.context.payload.repository.pushed_at).toISOString()
  : null; // Use null to avoid Notion validation error


async function updatePage() {
  try {
    const readmeContent = fs.readFileSync('README.md', 'utf8');
    const warningText = "This page's content is automatically copied from the connected GitHub repository.";

    // Clear existing blocks
    const { results } = await notion.blocks.children.list({ block_id: pageId });
    for (const block of results) {
      await notion.blocks.update({ block_id: block.id, archived: true });
    }

    // Update Notion page title with repo name and branch
    await notion.pages.update({
      page_id: pageId,
      properties: {
        title: { title: [{ text: { content: `${repo} (${branch})` } }] },
        Description: { rich_text: [{ text: { content: repoDescription } }] },
        "Latest Commit Date": { date: { start: latestCommitDate } }
      }
    });

    // Convert Markdown to Notion blocks
    const notionBlocks = markdownToBlocks(readmeContent);

    // Create warning callout block
    const calloutBlock = {
      object: "block",
      type: "callout",
      callout: {
        rich_text: [{ type: "text", text: { content: warningText } }],
        icon: { type: "emoji", emoji: "⚠️" },
        color: "orange_background" // Sets the Notion callout to have an orange background
      }
    };

    // Append blocks
    await notion.blocks.children.append({
      block_id: pageId,
      children: [calloutBlock, ...notionBlocks]
    });

    console.log('Successfully updated Notion page');
  } catch (error) {
    console.error('Error updating Notion page:', error);
    process.exit(1);
  }
}

updatePage();
