import { Client } from "@notionhq/client";
import axios from "axios";
import fs from "fs";
import { resolve } from "node:path";
import * as util from "node:util";
import path from "path";

import { fetchPageTitleText } from "./notion_api";

export function getPageId() {
  const { values } = util.parseArgs({
    options: { url: { type: "string" } },
    allowPositionals: true,
  });
  const url = values.url;
  if (!url) {
    console.error("url is required");
    process.exit(1);
  }

  const parsedUrl = new URL(url);
  const pathParts = parsedUrl.pathname.split("/");
  const lastPart = pathParts[pathParts.length - 1] || "";
  return lastPart.slice(-32);
}

function sanitizeFilename(before: string) {
  const invalidChars = /[\s\/\\:*?"<>|]/g;

  let sanitized = before.replace(invalidChars, "_").trim();

  const maxLength = 255;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  if (sanitized === "") {
    sanitized = "notion_page";
  }

  return sanitized;
}

export async function getOutputPath(pageId: string, notion: Client) {
  const outputPathArg = resolve(process.argv[2]);
  if (outputPathArg.endsWith(".md")) {
    return outputPathArg;
  }
  const pageTitle = await fetchPageTitleText(pageId, notion);
  return `${sanitizeFilename(pageTitle)}.md`;
}

export async function downloadImage(url: string, blockId: string) {
  const extension = path.extname(new URL(url).pathname);
  const filename = `${blockId}${extension}`;
  const folderPath = "images";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const filePath = path.join(folderPath, filename);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(fs.createWriteStream(filePath));

  return new Promise<string>((resolve, reject) => {
    response.data.on("end", () => resolve(filePath));
    response.data.on("error", (err: any) => reject(err));
  });
}

export function throwNotSupportedError(type: string): never {
  throw new Error(`Not supported type: ${type}`);
}
