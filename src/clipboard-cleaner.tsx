import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  Icon,
  List,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";
import type { ReactElement } from "react";

type Cleaner = {
  title: string;
  subtitle: string;
  keywords: string[];
  icon: Icon;
  action: ReactElement;
};

const cleaners: Cleaner[] = [
  {
    title: "Line Cleaner",
    subtitle: "Remove empty lines from copied text",
    keywords: ["line-cleaner", "lines", "empty", "blank"],
    icon: Icon.BulletPoints,
    action: (
      <Action
        title="Clean Clipboard"
        icon={Icon.Eraser}
        onAction={cleanClipboardLines}
      />
    ),
  },
  {
    title: "Add Space",
    subtitle: "Add spaces around a character",
    keywords: ["space", "character", "separator"],
    icon: Icon.Text,
    action: (
      <Action.Push
        title="Choose Character"
        icon={Icon.TextCursor}
        target={<AddSpaceForm />}
      />
    ),
  },
  {
    title: "Replace Text",
    subtitle: "Find text and replace or delete it",
    keywords: ["replace", "find", "delete", "remove"],
    icon: Icon.Replace,
    action: (
      <Action.Push
        title="Replace Text"
        icon={Icon.Replace}
        target={<ReplaceTextForm />}
      />
    ),
  },
];

export default function Command() {
  return (
    <List searchBarPlaceholder="Pick cleaner">
      {cleaners.map((cleaner) => (
        <List.Item
          key={cleaner.title}
          title={cleaner.title}
          subtitle={cleaner.subtitle}
          keywords={cleaner.keywords}
          icon={cleaner.icon}
          actions={<ActionPanel>{cleaner.action}</ActionPanel>}
        />
      ))}
    </List>
  );
}

function AddSpaceForm() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Clean Clipboard"
            icon={Icon.Eraser}
            onSubmit={addSpacesAroundCharacter}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="character"
        title="Character"
        placeholder="-"
        autoFocus
      />
    </Form>
  );
}

function ReplaceTextForm() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Replace Text"
            icon={Icon.Replace}
            onSubmit={replaceClipboardText}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="findText" title="Find" autoFocus />
      <Form.TextField id="replaceText" title="Replace With" />
    </Form>
  );
}

async function cleanClipboardLines() {
  const text = await Clipboard.readText();

  if (text === undefined || text.length === 0) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Clipboard has no text",
    });
    return;
  }

  const { cleanedText, removedLineCount } = removeEmptyLines(text);

  await Clipboard.copy(cleanedText);

  if (removedLineCount === 0) {
    await showHUD("No empty lines found");
    return;
  }

  await showHUD(
    `Removed ${removedLineCount} empty ${removedLineCount === 1 ? "line" : "lines"}`,
  );
}

function removeEmptyLines(text: string) {
  const lines = text.split(/\r\n|\n|\r/);
  const cleanedLines = lines.filter((line) => line.trim().length > 0);

  return {
    cleanedText: cleanedLines.join("\n"),
    removedLineCount: lines.length - cleanedLines.length,
  };
}

async function addSpacesAroundCharacter(values: { character: string }) {
  const characters = Array.from(values.character.trim());

  if (characters.length !== 1) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Enter one character",
    });
    return;
  }

  const text = await Clipboard.readText();

  if (text === undefined || text.length === 0) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Clipboard has no text",
    });
    return;
  }

  const cleanedText = addSpacesAround(text, characters[0]);

  await Clipboard.copy(cleanedText);
  await showHUD("Added spaces");
}

function addSpacesAround(text: string, character: string) {
  let cleanedText = "";

  for (let index = 0; index < text.length; index++) {
    const currentCharacter = text[index];

    if (currentCharacter !== character || isAtSentenceEnd(text, index)) {
      cleanedText += currentCharacter;
      continue;
    }

    if (!hasSpaceBefore(text, index)) {
      cleanedText += " ";
    }

    cleanedText += currentCharacter;

    if (!hasSpaceAfter(text, index)) {
      cleanedText += " ";
    }
  }

  return cleanedText;
}

function hasSpaceBefore(text: string, index: number) {
  return index === 0 || text[index - 1] === " ";
}

function hasSpaceAfter(text: string, index: number) {
  return index === text.length - 1 || text[index + 1] === " ";
}

function isAtSentenceEnd(text: string, index: number) {
  const nextNonSpace = text.slice(index + 1).match(/[^ ]/);

  return (
    nextNonSpace === null ||
    nextNonSpace[0] === "\n" ||
    nextNonSpace[0] === "\r" ||
    [".", "!", "?"].includes(nextNonSpace[0])
  );
}

async function replaceClipboardText(values: {
  findText: string;
  replaceText: string;
}) {
  if (values.findText.length === 0) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Enter text to find",
    });
    return;
  }

  const text = await Clipboard.readText();

  if (text === undefined || text.length === 0) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Clipboard has no text",
    });
    return;
  }

  const { replacedText, replacementCount } = replaceAllText(
    text,
    values.findText,
    values.replaceText,
  );

  await Clipboard.copy(replacedText);

  if (replacementCount === 0) {
    await showHUD("No matches found");
    return;
  }

  await showHUD(
    `Replaced ${replacementCount} ${replacementCount === 1 ? "match" : "matches"}`,
  );
}

function replaceAllText(text: string, findText: string, replaceText: string) {
  const parts = text.split(findText);
  const replacementCount = parts.length - 1;

  return {
    replacedText: parts.join(replaceText),
    replacementCount,
  };
}
