# Sync README to Notion

A GitHub Action to sync the `README.md` file of a repository to a specified Notion page. This action is useful for keeping documentation in sync between GitHub and Notion.

## Features

- Automatically updates a Notion page with the contents of a `README.md` file.
- Supports manual and automatic triggers on changes to the `README.md`.

## Prerequisites

- A Notion integration token with access to the target page.
- The Notion page ID where the README content will be synced.

## Setup

1. **Create a Notion Integration**:
   - Go to [Notion Integrations](https://www.notion.so/my-integrations) and create a new integration.
   - Note the integration token.

2. **Connect Notion Page to Integration**:

3. **Add Secrets to Your Repository**:
   - Go to your GitHub repository settings.
   - Under "Secrets and variables" > "Actions", add the following repository secrets:
     - `NOTION_TOKEN`: Your Notion integration token.
     - `NOTION_PAGE_ID`: The ID of the Notion page to update.

## Usage