import { Clipboard, showHUD, showToast, Toast } from "@raycast/api";
import { stashCurrentClipboard } from "./lib/clipboard-history";

// Strip rich-text formatting from the clipboard so the next paste is plain.
//
// We read the clipboard's text content (which is the plain-text representation
// of whatever is on the clipboard) and copy it back as a plain string. That
// replaces the rich-text version with a plain-text version while keeping the
// content identical.
export default async function command() {
  let text: string | undefined;
  try {
    text = await Clipboard.readText();
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Couldn't read the clipboard",
      message: error instanceof Error ? error.message : String(error),
    });
    return;
  }

  if (text === undefined || text.length === 0) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Clipboard has no text",
    });
    return;
  }

  await stashCurrentClipboard();
  await Clipboard.copy(text);
  await showHUD("Clipboard is now plain text");
}
