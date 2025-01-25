import { Client } from "@notionhq/client";
import prettier from "prettier";

import { blocksToMarkdown } from "./markdown";
import { fetchBlocksWithChildren } from "./notion_api";

export async function notionToMarkdown({
  pageId,
  notion,
}: {
  pageId: string;
  notion: Client;
}) {
  const blocks = await fetchBlocksWithChildren(pageId, notion);
  const markdown = await blocksToMarkdown(blocks);
  const formatted = await prettier.format(markdown, { parser: "markdown" });

  return formatted;
}
