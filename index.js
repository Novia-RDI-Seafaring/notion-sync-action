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

async function updatePage() {
  try {
    let readmeContent = fs.readFileSync('README.md', 'utf8');

    // Remove within-document links (e.g., [Installation](#installation))
    console.log('Before replacement:', readmeContent);
    readmeContent = readmeContent.replace(/\[([^\]]+)\]\(#([^\)]+)\)/g, '$1');
    console.log('After replacement:', readmeContent);

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
        "Description": { rich_text: [{ text: { content: repoDescription } }] }
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
        },
        color: "orange_background"
      }
    };

    // Append the callout block
    try {
      await notion.blocks.children.append({
        block_id: pageId,
        children: [calloutBlock]
      });
    } catch (error) {
      console.error('Error appending callout block:', error);
    }

    // Append the converted Markdown blocks
    for (const block of notionBlocks) {
      try {
        await notion.blocks.children.append({
          block_id: pageId,
          children: [block]
        });
      } catch (error) {
        console.error('Error appending block:', error);
      }
    }

    console.log('Successfully updated Notion page');
  } catch (error) {
    console.error('Error updating Notion page:', error);
    process.exit(1);
  }
}

updatePage();
