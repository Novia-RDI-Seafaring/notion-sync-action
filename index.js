const { Client } = require('@notionhq/client');
const fs = require('fs');

const notion = new Client({ auth: process.env.INPUT_NOTION_TOKEN });
const pageId = process.env.INPUT_NOTION_PAGE_ID;

async function updatePage() {
  try {
    const readmeContent = fs.readFileSync('README.md', 'utf8');

    // Add indication text before and after the README content
    const contentWithIndication = `
This content is automatically generated from the GitHub repository.

${readmeContent}

---

*This content is automatically generated from the GitHub repository.*
`;

    const { results } = await notion.blocks.children.list({ block_id: pageId });
    for (const block of results) {
      await notion.blocks.update({
        block_id: block.id,
        archived: true
      });
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        title: {
          title: [{ text: { content: "README" } }]
        }
      }
    });

    // Split content into chunks of 2000 characters
    const chunks = contentWithIndication.match(/.{1,2000}/gs) || [];

    // Create callout blocks for each chunk
    const calloutBlocks = chunks.map(chunk => ({
      object: "block",
      type: "callout",
      callout: {
        rich_text: [
          {
            type: "text",
            text: {
              content: chunk
            }
          }
        ],
        icon: {
          type: "emoji",
          emoji: "ℹ️"
        }
      }
    }));

    await notion.blocks.children.append({
      block_id: pageId,
      children: calloutBlocks
    });

    console.log('Successfully updated Notion page');
  } catch (error) {
    console.error('Error updating Notion page:', error);
    process.exit(1);
  }
}

updatePage();