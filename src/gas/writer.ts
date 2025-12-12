/// <reference types="google-apps-script" />

import { SHEETS } from "../shared/sheetConfig";
import { getOrCreateSheet } from "./utils/sheetInit";

export function appendObjects<T extends Record<string, any>>(
    configKey: keyof typeof SHEETS,
    rows: T[]
) {
    const cfg = SHEETS[configKey];
    const sheet = getOrCreateSheet(configKey);

    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0]
        .map((x) => String(x || "").trim());

    const fields = Object.keys(cfg.columns);
    const columnIndexes = fields.map((field) => {
        const headerName = cfg.columns[field];
        const idx = headerRow.indexOf(headerName);
        if (idx < 0) throw new Error(`Missing header "${headerName}"`);
        return idx;
    });

    const values = rows.map((obj) =>
        columnIndexes.map((_, i) => obj[fields[i]] ?? "")
    );

    sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headerRow.length)
        .setValues(values);
}

export function appendRows(
    configKey: keyof typeof SHEETS,
    rows: any[][]
) {
    const sheet = getOrCreateSheet(configKey);
    if (rows.length === 0) return;

    // Ensure we don't write more columns than headers exist (or let Sheet expand?)
    // For safety, we should probably respect the config column count, but for now let's write what we have.
    // SheetMapper should ensure correct length.
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
        .setValues(rows);
}

// Example: Mandates Writer
import type { MandateRow, TaskRow } from "./reader";

export function writeMandates(rows: MandateRow[]): void {
    appendObjects("mandates", rows);
}

export function writeTasks(rows: TaskRow[]): void {
    appendObjects("tasks", rows);
}

export function writePeople(rows: any[][]): void {
    appendRows("people", rows);
}
