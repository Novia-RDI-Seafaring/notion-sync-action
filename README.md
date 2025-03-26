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

Here's an example of how to use this GitHub Action in a workflow:

```yaml
name: Sync README to Notion

on:
  workflow_dispatch: # Allows manual triggering of the workflow
  push:
    branches:
      - main
    paths:
      - 'README.md'

jobs:
  sync_readme:
    runs-on: ubuntu-latest
    name: Sync README to Notion
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Sync README to Notion
        uses: Novia-RDI-Seafaring/notion-sync-action@main
        with:
          notion_token: ${{ secrets.NOTION_TOKEN }}
          notion_page_id: ${{ secrets.NOTION_PAGE_ID }}
          repo_description: <Short description of the REPO>
```

This example demonstrates how to set up a workflow that triggers on pushes to the `main` branch when the `README.md` file is changed. It checks out the code, sets up Node.js, and then runs the action to sync the README to Notion.



# For Development
## Managing Dependencies

To manage dependencies without checking in your `node_modules` directory, you can use `@vercel/ncc` to compile your code and modules into a single file for distribution. Therefore, after adjusting the `index.js` it must be recompiled.

1. **Install `@vercel/ncc`**:
   - Run the following command in your terminal:
     ```bash
     npm i -g @vercel/ncc
     ```

2. **Compile Your Code**:
   - Compile your `index.js` file using `ncc`:
     ```bash
     ncc build index.js --license licenses.txt
     ```
   - This will create a `dist/index.js` file with your code and compiled modules, and a `dist/licenses.txt` file with the licenses of the `node_modules` you are using.