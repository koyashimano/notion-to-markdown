import { richTextsToMarkdown } from "./rich_text";
import { BlockObjectResponseWithChildren } from "./types";
import { downloadImage, throwNotSupportedError } from "./utils";

async function getParentText(block: BlockObjectResponseWithChildren) {
  if (!("type" in block)) {
    return "";
  }

  switch (block.type) {
    case "paragraph":
      return richTextsToMarkdown(block.paragraph.rich_text);
    case "callout":
    case "quote":
      return ""; // Quote is handled in the children
    case "equation":
      return `$$\n${block.equation.expression}\n$$`;
    case "heading_1":
      return `# ${richTextsToMarkdown(block.heading_1.rich_text)}`;
    case "heading_2":
      return `## ${richTextsToMarkdown(block.heading_2.rich_text)}`;
    case "heading_3":
      return `### ${richTextsToMarkdown(block.heading_3.rich_text)}`;
    case "bulleted_list_item":
      return `- ${richTextsToMarkdown(block.bulleted_list_item.rich_text)}`;
    case "numbered_list_item":
      return `1. ${richTextsToMarkdown(block.numbered_list_item.rich_text)}`;
    case "to_do":
      return `- [${block.to_do.checked ? "x" : " "}] ${richTextsToMarkdown(
        block.to_do.rich_text
      )}`;
    case "code":
      return `\`\`\`${block.code.language}\n${richTextsToMarkdown(
        block.code.rich_text
      )}\n\`\`\``;
    case "divider":
      return `---`;
    case "synced_block":
      if (block.children.length === 0) {
        throw new Error("Empty synced block.");
      }
      return "";
    case "image":
      if (block.image.type === "external") {
        return `![${richTextsToMarkdown(block.image.caption)}](${
          block.image.external.url
        })`;
      }

      const filePath = await downloadImage(block.image.file.url, block.id);
      return `![${richTextsToMarkdown(block.image.caption)}](${filePath})`;
    case "toggle":
      return richTextsToMarkdown(block.toggle.rich_text);
    case "audio":
    case "bookmark":
    case "breadcrumb":
    case "child_database":
    case "child_page":
    case "column":
    case "column_list":
    case "embed":
    case "file":
    case "link_preview":
    case "link_to_page":
    case "pdf":
    case "table":
    case "table_of_contents":
    case "table_row":
    case "template":
    case "unsupported":
    case "video":
      throwNotSupportedError(block.type);
  }
}

async function getChildrenText(block: BlockObjectResponseWithChildren) {
  const isQuote =
    "type" in block && (block.type === "quote" || block.type === "callout");

  const children: BlockObjectResponseWithChildren[] = (() => {
    if (isQuote) {
      const richText =
        block.type === "quote"
          ? block.quote.rich_text
          : block.callout.rich_text;

      return richText.length > 0
        ? [
            {
              ...block,
              type: "paragraph",
              paragraph: {
                rich_text: richText,
              },
              children: [],
            },
            ...block.children,
          ]
        : block.children;
    }
    return block.children;
  })();

  const childrenText = await blocksToMarkdown(children);

  const indentedChildrenText = childrenText
    .split("\n")
    .map((line) => {
      if (
        "type" in block &&
        (block.type === "toggle" || block.type === "synced_block")
      ) {
        return line;
      }
      return isQuote ? `> ${line}` : `  ${line}`;
    })
    .join("\n");

  return indentedChildrenText;
}

async function blockToMarkdown(
  block: BlockObjectResponseWithChildren
): Promise<string> {
  const parentText = await getParentText(block);
  const childrenText = await getChildrenText(block);

  return parentText + (parentText && childrenText ? "\n\n" : "") + childrenText;
}

export async function blocksToMarkdown(
  blocks: BlockObjectResponseWithChildren[]
) {
  return (await Promise.all(blocks.map(blockToMarkdown))).join("\n\n");
}
