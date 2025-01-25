#!/usr/bin/env node

import { Client } from "@notionhq/client";
import fs from "fs";

import { getAuthToken } from "./env";
import { notionToMarkdown } from "./notion_to_markdown";
import { getOutputPath, getPageId } from "./utils";

async function main() {
  const pageId = getPageId();
  const notion = new Client({ auth: getAuthToken() });
  const outputPath = await getOutputPath(pageId, notion);
  const markdown = await notionToMarkdown({ pageId, notion });
  fs.writeFileSync(outputPath, markdown);
}

main().catch((e) => console.error("Uncaught error:", e));
