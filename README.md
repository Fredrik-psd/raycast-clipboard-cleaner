# Clipboard Cleaner

A Raycast extension that cleans up text already on your clipboard. Open the **Clipboard Cleaner** command, pick a cleaner, and your clipboard is updated in place. The previous contents are stashed so you can undo with **Restore Previous Clipboard**.

## Commands

- **Clipboard Cleaner** — picker with every cleaner.
- **Paste as Plain Text** — strip rich-text formatting from the clipboard.
- **Restore Previous Clipboard** — undo the most recent cleaner.

## Cleaners

### Lines
- **Remove Empty Lines** — drop every blank line.
- **Trim Whitespace** — strip leading/trailing whitespace on each line.
- **Collapse Blank Lines** — turn runs of blank lines into a single blank line.
- **Sort Lines** — alphabetical, case-insensitive, natural order.
- **Dedupe Lines** — keep only the first occurrence of each line.

### Case
- **Lowercase** / **UPPERCASE** / **Title Case** / **Sentence case**.

### URLs and characters
- **Strip Tracking Parameters** — remove `utm_*`, `fbclid`, `gclid`, `mc_eid` and friends from URLs in the clipboard.
- **Straighten Smart Quotes** — replace curly quotes, em-/en-dashes, ellipses, and non-breaking spaces with ASCII equivalents.
- **URL Encode** / **URL Decode**.

### Code
- **Pretty-Print JSON** / **Minify JSON**.

### With input (with live preview)
- **Add Space** — surround every occurrence of a chosen character with spaces (whitespace-aware).
- **Replace Text** — find a string and replace or delete it, with a preview of the result before you commit.

## Undo

Every cleaner stashes the previous clipboard contents in Raycast's local storage before writing the cleaned version. Run **Restore Previous Clipboard** to bring back what was there. Only the most recent clean is kept — undo is one level deep.
