export function smartSplitIntoChunks(text: string, maxLength = 1000): string[] {
  const chunks: string[] = [];
  let current = "";

  const words = text.split(" ");

  for (const word of words) {
    const testChunk = current + (current ? " " : "") + word;

    if (testChunk.length > maxLength && current) {
      chunks.push(current.trim());
      current = word;
    } else {
      current = testChunk;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

export function validateJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

export function healJSON(jsonString: string): string {
  let healed = jsonString.trim();

  healed = healed.replace(/,\s*}/g, "}");
  healed = healed.replace(/,\s*]/g, "]");

  healed = healed.replace(/}\s*{/g, "},{");
  healed = healed.replace(/]\s*\[/g, "],[");

  if (!healed.startsWith("{") && !healed.startsWith("[")) {
    healed = "{" + healed;
  }

  if (!healed.endsWith("}") && !healed.endsWith("]")) {
    healed = healed + "}";
  }

  const openBraces = (healed.match(/{/g) || []).length;
  const closeBraces = (healed.match(/}/g) || []).length;
  const openBrackets = (healed.match(/\[/g) || []).length;
  const closeBrackets = (healed.match(/]/g) || []).length;

  if (openBraces > closeBraces) {
    healed += "}".repeat(openBraces - closeBraces);
  }
  if (openBrackets > closeBrackets) {
    healed += "]".repeat(openBrackets - closeBrackets);
  }

  return healed;
}

export function mergeChunks(chunks: string[]): string {
  return chunks.join("");
}

export function rebuildJSON(text: string): any {
  let cleaned = healJSON(text);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Failed to rebuild JSON: ${error}`);
  }
}
