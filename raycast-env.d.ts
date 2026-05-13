/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `clipboard-cleaner` command */
  export type ClipboardCleaner = ExtensionPreferences & {}
  /** Preferences accessible in the `paste-as-plain-text` command */
  export type PasteAsPlainText = ExtensionPreferences & {}
  /** Preferences accessible in the `restore-previous-clipboard` command */
  export type RestorePreviousClipboard = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `clipboard-cleaner` command */
  export type ClipboardCleaner = {}
  /** Arguments passed to the `paste-as-plain-text` command */
  export type PasteAsPlainText = {}
  /** Arguments passed to the `restore-previous-clipboard` command */
  export type RestorePreviousClipboard = {}
}

