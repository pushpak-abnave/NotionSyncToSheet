/// <reference types="google-apps-script" />

import { SHEETS } from "../../shared/sheetConfig";

/**
 * Get or create a sheet and guarantee headers match the config.
 */
export function getOrCreateSheet(configKey: keyof typeof SHEETS) {
    const cfg = SHEETS[configKey];

    const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
    let sheet = ss.getSheetByName(cfg.sheetName);

    // Auto-create sheet
    if (!sheet) {
        sheet = ss.insertSheet(cfg.sheetName);
    }

    const headers = Object.values(cfg.columns);
    const range = sheet.getRange(1, 1, 1, headers.length);
    const firstRow = range.getValues()[0].map((x) => String(x || "").trim());

    const needsUpdate =
        firstRow.length < headers.length ||
        headers.some((h, i) => firstRow[i] !== h);

    if (needsUpdate) {
        range.setValues([headers]);
    }

    return sheet;
}
