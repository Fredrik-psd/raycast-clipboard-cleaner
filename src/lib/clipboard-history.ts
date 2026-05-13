// Tiny clipboard-history layer used to support "Restore Previous Clipboard".
//
// Before every cleaner writes new text, we read the current clipboard and
// save it to LocalStorage. The Restore command reads the stash back and
// writes it to the clipboard, then clears the stash.
//
// Only the most recent original is kept — undo is one level deep, like
// most apps.

import {
  Clipboard,
  LocalStorage,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";

const STASH_KEY = "previous-clipboard";

export async function readClipboardText(): Promise<string | undefined> {
  try {
    return await Clipboard.readText();
  } catch {
    return undefined;
  }
}

export async function stashCurrentClipboard(): Promise<void> {
  const current = await readClipboardText();
  if (current === undefined) {
    // Don't stash an empty/missing clipboard — would make restore useless.
    await LocalStorage.removeItem(STASH_KEY);
    return;
  }
  await LocalStorage.setItem(STASH_KEY, current);
}

export async function readStashedClipboard(): Promise<string | undefined> {
  const value = await LocalStorage.getItem<string>(STASH_KEY);
  return typeof value === "string" ? value : undefined;
}

export async function clearStashedClipboard(): Promise<void> {
  await LocalStorage.removeItem(STASH_KEY);
}

// Convenience wrapper: stash → clean → copy → HUD.
export async function applyCleanedText(
  cleanedText: string,
  summary: string,
): Promise<void> {
  await stashCurrentClipboard();
  await Clipboard.copy(cleanedText);
  await showHUD(summary);
}

export async function reportMissingClipboard(): Promise<void> {
  await showToast({
    style: Toast.Style.Failure,
    title: "Clipboard has no text",
  });
}
