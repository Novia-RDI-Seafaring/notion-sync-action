const { Client } = require('@notionhq/client');
const fs = require('fs');
const { markdownToBlocks } = require('@tryfabric/martian');
const github = require('@actions/github');

const notion = new Client({ auth: process.env.INPUT_NOTION_TOKEN });
const pageId = process.env.INPUT_NOTION_PAGE_ID;

async function updatePage() {
  try {
    const readmeContent = fs.readFileSync('README.md', 'utf8');

    // Add indication text at the top
    const warningText = "⚠️ This page's content is automatically copied from the connected GitHub repository.";

    const { results } = await notion.blocks.children.list({ block_id: pageId });
    for (const block of results) {
      await notion.blocks.update({
        block_id: block.id,
        archived: true
      });
    }

    // Get the repository name from the GitHub context
    const repoName = github.context.repo.repo;

    await notion.pages.update({
      page_id: pageId,
      properties: {
        title: {
          title: [{ text: { content: repoName } }]
        }
      }
    });

    // Convert Markdown to Notion blocks
    const notionBlocks = markdownToBlocks(readmeContent);

    // Prepend the warning callout block
    const calloutBlock = {
      object: "block",
      type: "callout",
      callout: {
        rich_text: [
          {
            type: "text",
            text: {
              content: warningText
            }
          }
        ],
        icon: {
          type: "emoji",
          emoji: "⚠️"
        }
      }
    };

    // Append the callout block and the converted Markdown blocks
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