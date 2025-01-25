# notion-to-markdown

A CLI tool that converts a Notion page to a Markdown file.

## Features

- Uses the [Notion API](https://developers.notion.com/) to fetch text, images, and other block data
- Converts fetched blocks into Markdown
- Automatically downloads images to the `images/` folder
- Supports rich text features such as formulas and code blocks
- The generated Markdown is formatted via [Prettier](https://prettier.io/)

## Installation

Make sure you have Node.js and npm installed. First clone this repository and then run:

```bash
npm install
npm install -g
```

## Usage

### 1. Set up Environment Variables

Create a `.env` file in the project root (same level as the `src` folder) with your Notion API token:

```
NOTION_AUTH_TOKEN=...
```

> **NOTE:**  
> You must create a Notion Integration and use its "Internal Integration Token" here.  
> Refer to the [official Notion Docs on creating integrations](https://developers.notion.com/docs/create-a-notion-integration) for more information.

### 2. Running the Command

Use the `n2md` command:

```bash
n2md <output-file.md> --url "<Notion-page-URL>"
```

- If `<output-file.md>` ends with `.md`, it will be used as the output file name.
- If no file name is provided or if it does not end with `.md`, the Notion page title will be used automatically, creating `<title>.md`.
- `--url` is required to specify the Notion page URL.

Example:

```bash
n2md MyNotionPage.md --url "https://www.notion.so/Example-Page-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3. Output

- The converted Markdown will be saved in either the specified or auto-generated file.
- If the page contains images, an `images/` folder will be created, and all images will be downloaded there.

## Supported Block Types

- Paragraph (paragraph)
- Headings (heading_1, heading_2, heading_3)
- Lists (bulleted_list_item, numbered_list_item)
- To-do List (to_do)
- Code Blocks (code)
- Equations (equation)
- Divider (divider)
- Images (image)
  - External (URL)
  - File (uploaded to Notion)
- Quote (quote)
- Callout (callout)
- Toggle (toggle)
- Synced Block (synced_block)

Other block types are not currently supported. If encountered, the script will throw an error and exit.

## Development and Build

1. Clone the repository, add a `.env` file, and run `npm install` to install dependencies.
2. To build (and watch) with TypeScript, run:

   ```bash
   npm run start
   ```

   This generates transpiled files in the `dist` directory.

3. You can then run the tool locally as:
   ```bash
   node dist/index.js <output-file.md> --url "<Notion-page-URL>"
   ```
