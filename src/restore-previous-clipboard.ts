import { Clipboard, showHUD, showToast, Toast } from "@raycast/api";
import {
  clearStashedClipboard,
  readStashedClipboard,
} from "./lib/clipboard-history";

export default async function command() {
  const stashed = await readStashedClipboard();

  if (stashed === undefined) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Nothing to restore",
      message: "Run a cleaner first, then come back here to undo.",
    });
    return;
  }

  await Clipboard.copy(stashed);
  await clearStashedClipboard();
  await showHUD("Restored previous clipboard");
}
