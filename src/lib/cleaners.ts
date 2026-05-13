// Pure cleaning functions. Each cleaner takes a string and returns
// `{ cleanedText, summary }`, where `summary` is a short human-readable
// message describing what was changed (e.g. "Removed 3 empty lines").

export type CleanResult = {
  cleanedText: string;
  summary: string;
};

export function removeEmptyLines(text: string): CleanResult {
  const lines = text.split(/\r\n|\n|\r/);
  const cleanedLines = lines.filter((line) => line.trim().length > 0);
  const removed = lines.length - cleanedLines.length;

  return {
    cleanedText: cleanedLines.join("\n"),
    summary:
      removed === 0
        ? "No empty lines found"
        : `Removed ${removed} empty ${removed === 1 ? "line" : "lines"}`,
  };
}

export function trimLines(text: string): CleanResult {
  const lines = text.split(/\r\n|\n|\r/);
  let trimmed = 0;

  const cleanedLines = lines.map((line) => {
    const next = line.trim();
    if (next !== line) {
      trimmed += 1;
    }
    return next;
  });

  return {
    cleanedText: cleanedLines.join("\n"),
    summary:
      trimmed === 0
        ? "No leading or trailing whitespace found"
        : `Trimmed ${trimmed} ${trimmed === 1 ? "line" : "lines"}`,
  };
}

export function collapseBlankLines(text: string): CleanResult {
  const lines = text.split(/\r\n|\n|\r/);
  const cleanedLines: string[] = [];
  let removed = 0;
  let previousBlank = false;

  for (const line of lines) {
    const isBlank = line.trim().length === 0;

    if (isBlank && previousBlank) {
      removed += 1;
      continue;
    }

    cleanedLines.push(line);
    previousBlank = isBlank;
  }

  return {
    cleanedText: cleanedLines.join("\n"),
    summary:
      removed === 0
        ? "No consecutive blank lines found"
        : `Collapsed ${removed} extra blank ${removed === 1 ? "line" : "lines"}`,
  };
}

export function toLowerCase(text: string): CleanResult {
  const cleanedText = text.toLowerCase();
  return {
    cleanedText,
    summary:
      cleanedText === text ? "Already lowercase" : "Converted to lowercase",
  };
}

export function toUpperCase(text: string): CleanResult {
  const cleanedText = text.toUpperCase();
  return {
    cleanedText,
    summary:
      cleanedText === text ? "Already uppercase" : "Converted to uppercase",
  };
}

export function toTitleCase(text: string): CleanResult {
  const cleanedText = text.replace(
    /\b([\p{L}\p{N}])([\p{L}\p{N}'’]*)/gu,
    (_, first, rest) => {
      return first.toUpperCase() + rest.toLowerCase();
    },
  );
  return {
    cleanedText,
    summary:
      cleanedText === text
        ? "Already in title case"
        : "Converted to Title Case",
  };
}

export function toSentenceCase(text: string): CleanResult {
  // Lowercase everything, then capitalize the first letter of every sentence.
  const lowered = text.toLowerCase();
  const cleanedText = lowered.replace(
    /(^|[.!?]\s+)(\p{L})/gu,
    (_, separator, letter) => separator + letter.toUpperCase(),
  );
  return {
    cleanedText,
    summary:
      cleanedText === text
        ? "Already in sentence case"
        : "Converted to sentence case",
  };
}

const TRACKING_PARAM_PATTERNS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^gclsrc$/i,
  /^dclid$/i,
  /^mc_eid$/i,
  /^mc_cid$/i,
  /^msclkid$/i,
  /^yclid$/i,
  /^_hsenc$/i,
  /^_hsmi$/i,
  /^hsCtaTracking$/i,
  /^icid$/i,
  /^igshid$/i,
  /^vero_id$/i,
  /^wickedid$/i,
  /^oly_anon_id$/i,
  /^oly_enc_id$/i,
  /^ref_src$/i,
  /^ref_url$/i,
  /^ref$/i,
  /^source$/i,
  /^campaign_id$/i,
];

function isTrackingParam(name: string): boolean {
  return TRACKING_PARAM_PATTERNS.some((pattern) => pattern.test(name));
}

export function stripTrackingParams(text: string): CleanResult {
  let strippedCount = 0;
  // Match http(s) URLs and clean their query strings.
  const cleanedText = text.replace(/https?:\/\/\S+/gi, (urlString) => {
    try {
      const url = new URL(urlString);
      const params = url.searchParams;
      const toDelete: string[] = [];

      params.forEach((_, key) => {
        if (isTrackingParam(key)) {
          toDelete.push(key);
        }
      });

      for (const key of toDelete) {
        params.delete(key);
        strippedCount += 1;
      }

      // Preserve the trailing punctuation that wasn't part of the URL.
      return url.toString();
    } catch {
      return urlString;
    }
  });

  return {
    cleanedText,
    summary:
      strippedCount === 0
        ? "No tracking parameters found"
        : `Stripped ${strippedCount} tracking ${strippedCount === 1 ? "parameter" : "parameters"}`,
  };
}

const SMART_REPLACEMENTS: Array<[RegExp, string]> = [
  [/[‘’‚‛]/g, "'"], // single quotes
  [/[“”„‟]/g, '"'], // double quotes
  [/[–—]/g, "--"], // en/em dashes
  [/…/g, "..."], // ellipsis
  [/\u00A0/g, " "], // non-breaking space
];

export function straightenQuotes(text: string): CleanResult {
  let replacements = 0;
  let cleanedText = text;

  for (const [pattern, replacement] of SMART_REPLACEMENTS) {
    const matches = cleanedText.match(pattern);
    if (matches) {
      replacements += matches.length;
      cleanedText = cleanedText.replace(pattern, replacement);
    }
  }

  return {
    cleanedText,
    summary:
      replacements === 0
        ? "No smart quotes or special characters found"
        : `Replaced ${replacements} smart ${replacements === 1 ? "character" : "characters"}`,
  };
}

export function sortLines(text: string): CleanResult {
  const lines = text.split(/\r\n|\n|\r/);
  const sorted = [...lines].sort((first, second) =>
    first.localeCompare(second, undefined, {
      sensitivity: "base",
      numeric: true,
    }),
  );
  const changed = sorted.some((line, index) => line !== lines[index]);

  return {
    cleanedText: sorted.join("\n"),
    summary: changed ? `Sorted ${lines.length} lines` : "Lines already sorted",
  };
}

export function dedupeLines(text: string): CleanResult {
  const lines = text.split(/\r\n|\n|\r/);
  const seen = new Set<string>();
  const cleanedLines: string[] = [];

  for (const line of lines) {
    if (seen.has(line)) {
      continue;
    }
    seen.add(line);
    cleanedLines.push(line);
  }

  const removed = lines.length - cleanedLines.length;

  return {
    cleanedText: cleanedLines.join("\n"),
    summary:
      removed === 0
        ? "No duplicate lines found"
        : `Removed ${removed} duplicate ${removed === 1 ? "line" : "lines"}`,
  };
}

export function urlEncode(text: string): CleanResult {
  const cleanedText = encodeURIComponent(text);
  return {
    cleanedText,
    summary:
      cleanedText === text ? "Nothing to encode" : "URL-encoded the clipboard",
  };
}

export function urlDecode(text: string): CleanResult {
  try {
    const cleanedText = decodeURIComponent(text);
    return {
      cleanedText,
      summary:
        cleanedText === text
          ? "Nothing to decode"
          : "URL-decoded the clipboard",
    };
  } catch {
    return {
      cleanedText: text,
      summary: "Clipboard isn't valid URL-encoded text",
    };
  }
}

export function prettyJson(text: string): CleanResult {
  try {
    const value = JSON.parse(text);
    const cleanedText = JSON.stringify(value, null, 2);
    return {
      cleanedText,
      summary:
        cleanedText === text
          ? "JSON is already formatted"
          : "Pretty-printed JSON",
    };
  } catch {
    return {
      cleanedText: text,
      summary: "Clipboard isn't valid JSON",
    };
  }
}

export function minifyJson(text: string): CleanResult {
  try {
    const value = JSON.parse(text);
    const cleanedText = JSON.stringify(value);
    return {
      cleanedText,
      summary:
        cleanedText === text ? "JSON is already minified" : "Minified JSON",
    };
  } catch {
    return {
      cleanedText: text,
      summary: "Clipboard isn't valid JSON",
    };
  }
}

// "Add Space" - adds spaces around every occurrence of a single character.
// Treats any whitespace (space, tab, newline) as already-spaced.
export function addSpacesAround(text: string, character: string): CleanResult {
  if (character.length !== 1) {
    return {
      cleanedText: text,
      summary: "Pick a single character",
    };
  }

  let cleanedText = "";
  let inserted = 0;

  for (let index = 0; index < text.length; index++) {
    const currentCharacter = text[index];

    if (currentCharacter !== character) {
      cleanedText += currentCharacter;
      continue;
    }

    const prev = index > 0 ? text[index - 1] : "";
    const next = index < text.length - 1 ? text[index + 1] : "";

    if (prev !== "" && !/\s/.test(prev)) {
      cleanedText += " ";
      inserted += 1;
    }

    cleanedText += currentCharacter;

    if (next !== "" && !/\s/.test(next)) {
      cleanedText += " ";
      inserted += 1;
    }
  }

  return {
    cleanedText,
    summary:
      inserted === 0
        ? `No "${character}" found that needed spacing`
        : `Added ${inserted} ${inserted === 1 ? "space" : "spaces"}`,
  };
}

export function replaceAllText(
  text: string,
  findText: string,
  replaceText: string,
): CleanResult {
  if (findText.length === 0) {
    return { cleanedText: text, summary: "Enter text to find" };
  }

  const parts = text.split(findText);
  const replacementCount = parts.length - 1;

  return {
    cleanedText: parts.join(replaceText),
    summary:
      replacementCount === 0
        ? "No matches found"
        : `Replaced ${replacementCount} ${replacementCount === 1 ? "match" : "matches"}`,
  };
}
