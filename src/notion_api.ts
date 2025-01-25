import { Client, iteratePaginatedAPI } from "@notionhq/client";

import { richTextsToMarkdown } from "./rich_text";
import { BlockObjectResponseWithChildren } from "./types";

export async function fetchPageTitleText(pageId: string, notion: Client) {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return "properties" in response &&
    "Title" in response.properties &&
    "title" in response.properties.Title
    ? richTextsToMarkdown(response.properties.Title.title)
    : pageId;
}

export async function fetchBlocksWithChildren(blockId: string, notion: Client) {
  const blocks: BlockObjectResponseWithChildren[] = [];
  for await (const block of iteratePaginatedAPI(notion.blocks.children.list, {
    block_id: blockId,
  })) {
    const children = await (async () => {
      if (!("has_children" in block && block.has_children)) {
        return [];
      }
      const ch = await fetchBlocksWithChildren(block.id, notion);
      if (
        "type" in block &&
        block.type === "synced_block" &&
        ch.length === 0 &&
        block.synced_block.synced_from
      ) {
        return await fetchBlocksWithChildren(
          block.synced_block.synced_from.block_id,
          notion
        );
      }
      return ch;
    })();

    blocks.push({ ...block, children });
  }

  return blocks;
}
