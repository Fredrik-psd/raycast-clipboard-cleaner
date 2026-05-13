import {
  Action,
  ActionPanel,
  Form,
  Icon,
  List,
  useNavigation,
} from "@raycast/api";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  addSpacesAround,
  collapseBlankLines,
  dedupeLines,
  minifyJson,
  prettyJson,
  removeEmptyLines,
  replaceAllText,
  sortLines,
  straightenQuotes,
  stripTrackingParams,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toUpperCase,
  trimLines,
  urlDecode,
  urlEncode,
} from "./lib/cleaners";
import type { CleanResult } from "./lib/cleaners";
import {
  applyCleanedText,
  readClipboardText,
  reportMissingClipboard,
} from "./lib/clipboard-history";

type InstantCleaner = {
  kind: "instant";
  title: string;
  subtitle: string;
  keywords: string[];
  icon: Icon;
  clean: (text: string) => CleanResult;
};

type FormCleaner = {
  kind: "form";
  title: string;
  subtitle: string;
  keywords: string[];
  icon: Icon;
  form: ReactNode;
};

type Cleaner = InstantCleaner | FormCleaner;

const cleaners: Cleaner[] = [
  {
    kind: "instant",
    title: "Remove Empty Lines",
    subtitle: "Drop every blank line in the clipboard",
    keywords: ["empty", "blank", "lines", "remove"],
    icon: Icon.BulletPoints,
    clean: removeEmptyLines,
  },
  {
    kind: "instant",
    title: "Trim Whitespace",
    subtitle: "Strip leading and trailing whitespace from each line",
    keywords: ["trim", "whitespace", "spaces", "lines"],
    icon: Icon.Text,
    clean: trimLines,
  },
  {
    kind: "instant",
    title: "Collapse Blank Lines",
    subtitle: "Turn runs of blank lines into a single blank line",
    keywords: ["collapse", "blank", "lines", "compact"],
    icon: Icon.AlignLeft,
    clean: collapseBlankLines,
  },
  {
    kind: "instant",
    title: "Lowercase",
    subtitle: "Convert all letters to lowercase",
    keywords: ["lowercase", "case", "lower"],
    icon: Icon.Lowercase,
    clean: toLowerCase,
  },
  {
    kind: "instant",
    title: "UPPERCASE",
    subtitle: "Convert all letters to uppercase",
    keywords: ["uppercase", "case", "upper", "caps"],
    icon: Icon.Uppercase,
    clean: toUpperCase,
  },
  {
    kind: "instant",
    title: "Title Case",
    subtitle: "Capitalise the first letter of every word",
    keywords: ["title", "case", "capitalise", "capitalize"],
    icon: Icon.TextCursor,
    clean: toTitleCase,
  },
  {
    kind: "instant",
    title: "Sentence case",
    subtitle: "Capitalise only the first letter of each sentence",
    keywords: ["sentence", "case"],
    icon: Icon.Paragraph,
    clean: toSentenceCase,
  },
  {
    kind: "instant",
    title: "Strip Tracking Parameters",
    subtitle: "Remove utm_*, fbclid, gclid, and friends from URLs",
    keywords: ["tracking", "utm", "url", "parameters", "fbclid", "gclid"],
    icon: Icon.Link,
    clean: stripTrackingParams,
  },
  {
    kind: "instant",
    title: "Straighten Smart Quotes",
    subtitle: "Replace curly quotes, em-dashes, and ellipsis with ASCII",
    keywords: ["smart", "quotes", "straighten", "ascii", "em-dash", "ellipsis"],
    icon: Icon.QuoteBlock,
    clean: straightenQuotes,
  },
  {
    kind: "instant",
    title: "Sort Lines",
    subtitle: "Sort the clipboard lines alphabetically (case-insensitive)",
    keywords: ["sort", "lines", "alphabetical"],
    icon: Icon.ArrowDown,
    clean: sortLines,
  },
  {
    kind: "instant",
    title: "Dedupe Lines",
    subtitle: "Keep only the first occurrence of each line",
    keywords: ["dedupe", "duplicate", "lines", "unique"],
    icon: Icon.Filter,
    clean: dedupeLines,
  },
  {
    kind: "instant",
    title: "URL Encode",
    subtitle: "Percent-encode the clipboard text",
    keywords: ["url", "encode", "percent"],
    icon: Icon.Code,
    clean: urlEncode,
  },
  {
    kind: "instant",
    title: "URL Decode",
    subtitle: "Percent-decode the clipboard text",
    keywords: ["url", "decode", "percent"],
    icon: Icon.Code,
    clean: urlDecode,
  },
  {
    kind: "instant",
    title: "Pretty-Print JSON",
    subtitle: "Format JSON with 2-space indentation",
    keywords: ["json", "pretty", "format", "indent"],
    icon: Icon.Code,
    clean: prettyJson,
  },
  {
    kind: "instant",
    title: "Minify JSON",
    subtitle: "Compact JSON to a single line",
    keywords: ["json", "minify", "compact"],
    icon: Icon.Code,
    clean: minifyJson,
  },
  {
    kind: "form",
    title: "Add Space",
    subtitle: "Add spaces around every occurrence of a character",
    keywords: ["space", "character", "separator", "pad"],
    icon: Icon.Text,
    form: <AddSpaceForm />,
  },
  {
    kind: "form",
    title: "Replace Text",
    subtitle: "Find a string and replace or delete it (with preview)",
    keywords: ["replace", "find", "delete", "remove", "substitute"],
    icon: Icon.Replace,
    form: <ReplaceTextForm />,
  },
];

export default function Command() {
  return (
    <List searchBarPlaceholder="Pick a cleaner">
      {cleaners.map((cleaner) => (
        <List.Item
          key={cleaner.title}
          title={cleaner.title}
          subtitle={cleaner.subtitle}
          keywords={cleaner.keywords}
          icon={cleaner.icon}
          actions={
            <ActionPanel>
              <CleanerAction cleaner={cleaner} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function CleanerAction({ cleaner }: { cleaner: Cleaner }) {
  if (cleaner.kind === "instant") {
    return (
      <Action
        title="Clean Clipboard"
        icon={Icon.Eraser}
        onAction={() => runInstantCleaner(cleaner.clean)}
      />
    );
  }

  return (
    <Action.Push title="Continue" icon={cleaner.icon} target={cleaner.form} />
  );
}

async function runInstantCleaner(clean: (text: string) => CleanResult) {
  const text = await readClipboardText();

  if (text === undefined || text.length === 0) {
    await reportMissingClipboard();
    return;
  }

  const { cleanedText, summary } = clean(text);

  if (cleanedText === text) {
    // Nothing changed — don't bother stashing or copying.
    const { showHUD } = await import("@raycast/api");
    await showHUD(summary);
    return;
  }

  await applyCleanedText(cleanedText, summary);
}

function AddSpaceForm() {
  const { pop } = useNavigation();
  const [character, setCharacter] = useState("");
  const [previewText, setPreviewText] = useState<string | undefined>(undefined);
  const [previewSummary, setPreviewSummary] = useState<string>("");
  const [originalText, setOriginalText] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    readClipboardText().then((value) => setOriginalText(value));
  }, []);

  useEffect(() => {
    if (originalText === undefined) {
      return;
    }
    const trimmedCharacter = character.trim();
    if (trimmedCharacter.length !== 1) {
      setPreviewText(undefined);
      setPreviewSummary(
        trimmedCharacter.length === 0
          ? "Pick a single character to surround with spaces."
          : "Pick exactly one character.",
      );
      return;
    }
    const result = addSpacesAround(originalText, trimmedCharacter);
    setPreviewText(result.cleanedText);
    setPreviewSummary(result.summary);
  }, [character, originalText]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Clean Clipboard"
            icon={Icon.Eraser}
            onSubmit={async () => {
              if (originalText === undefined) {
                await reportMissingClipboard();
                pop();
                return;
              }
              const result = addSpacesAround(originalText, character.trim());
              if (result.cleanedText === originalText) {
                const { showHUD } = await import("@raycast/api");
                await showHUD(result.summary);
              } else {
                await applyCleanedText(result.cleanedText, result.summary);
              }
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="character"
        title="Character"
        placeholder="-"
        autoFocus
        value={character}
        onChange={setCharacter}
      />
      <Form.Description title="Status" text={previewSummary} />
      {previewText !== undefined && (
        <Form.Description title="Preview" text={truncatePreview(previewText)} />
      )}
    </Form>
  );
}

function ReplaceTextForm() {
  const { pop } = useNavigation();
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [originalText, setOriginalText] = useState<string | undefined>(
    undefined,
  );
  const [previewSummary, setPreviewSummary] = useState<string>(
    "Enter text to find.",
  );
  const [previewText, setPreviewText] = useState<string | undefined>(undefined);

  useEffect(() => {
    readClipboardText().then((value) => setOriginalText(value));
  }, []);

  useEffect(() => {
    if (originalText === undefined) {
      setPreviewSummary("Clipboard has no text.");
      setPreviewText(undefined);
      return;
    }
    if (findText.length === 0) {
      setPreviewSummary("Enter text to find.");
      setPreviewText(undefined);
      return;
    }
    const result = replaceAllText(originalText, findText, replaceText);
    setPreviewSummary(result.summary);
    setPreviewText(result.cleanedText);
  }, [findText, replaceText, originalText]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Replace Text"
            icon={Icon.Replace}
            onSubmit={async () => {
              if (originalText === undefined) {
                await reportMissingClipboard();
                pop();
                return;
              }
              if (findText.length === 0) {
                return;
              }
              const result = replaceAllText(
                originalText,
                findText,
                replaceText,
              );
              if (result.cleanedText === originalText) {
                const { showHUD } = await import("@raycast/api");
                await showHUD(result.summary);
              } else {
                await applyCleanedText(result.cleanedText, result.summary);
              }
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="findText"
        title="Find"
        autoFocus
        value={findText}
        onChange={setFindText}
      />
      <Form.TextField
        id="replaceText"
        title="Replace With"
        value={replaceText}
        onChange={setReplaceText}
      />
      <Form.Description title="Status" text={previewSummary} />
      {previewText !== undefined && (
        <Form.Description title="Preview" text={truncatePreview(previewText)} />
      )}
    </Form>
  );
}

function truncatePreview(text: string, maxLength = 400): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "…";
}
