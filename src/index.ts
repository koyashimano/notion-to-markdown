#!/usr/bin/env node

import { Client } from "@notionhq/client";
import fs from "fs";
import prettier from "prettier";

import { getAuthToken } from "./env";
import { blocksToMarkdown } from "./markdown";
import { fetchBlocksWithChildren } from "./notion_api";
import { getOutputPath, getPageId } from "./utils";

async function main() {
  const notion = new Client({ auth: getAuthToken() });
  const pageId = getPageId();
  const outputPath = await getOutputPath(pageId, notion);

  const blocks = await fetchBlocksWithChildren(pageId, notion);
  const markdown = await blocksToMarkdown(blocks);
  const formatted = await prettier.format(markdown, { parser: "markdown" });

  fs.writeFileSync(outputPath, formatted);
}

main().catch((e) => console.error("Uncaught error:", e));
