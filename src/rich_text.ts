import {
  MentionRichTextItemResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { AnnotationResponse, BlockObjectResponseWithChildren } from "./types";
import { throwNotSupportedError } from "./utils";

function annotate(text: string, annotation: AnnotationResponse) {
  let annotated = text;
  if (annotation.code) {
    annotated = `\`${annotated}\``;
  }
  if (annotation.bold) {
    annotated = `**${annotated}**`;
  }
  if (annotation.italic) {
    annotated = `*${annotated}*`;
  }
  if (annotation.strikethrough) {
    annotated = `~~${annotated}~~`;
  }

  return annotated;
}

function mentionToMarkdown(mention: MentionRichTextItemResponse["mention"]) {
  switch (mention.type) {
    case "user":
      if ("name" in mention.user) {
        return `@${mention.user.name}`;
      }
      return `@${mention.user.id}`;
    default:
      throwNotSupportedError(`mention ${mention.type}`);
  }
}

function richTextToMarkdown(richText: RichTextItemResponse) {
  const content = (() => {
    switch (richText.type) {
      case "text":
        return annotate(richText.text.content, richText.annotations);
      case "mention":
        return annotate(
          mentionToMarkdown(richText.mention),
          richText.annotations
        );
      case "equation":
        return `$${richText.equation.expression}$`;
    }
  })();

  return richText.href ? `[${content}](${richText.href})` : content;
}

export function richTextsToMarkdown(richTexts: RichTextItemResponse[]) {
  return richTexts.map(richTextToMarkdown).join("");
}
