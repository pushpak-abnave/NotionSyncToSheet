/// <reference types="google-apps-script" />

import { SHEETS } from "../shared/sheetConfig";
import { getOrCreateSheet } from "./utils/sheetInit";

export function readAsObjects<T>(
    configKey: keyof typeof SHEETS
): T[] {
    const sheet = getOrCreateSheet(configKey);
    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return [];

    const cfg = SHEETS[configKey];
    const headerRow = values[0].map((x) => String(x || "").trim());
    const dataRows = values.slice(1);

    // Map header → field index
    const colByField: Record<string, number> = {};
    for (const field in cfg.columns) {
        const headerName = cfg.columns[field];
        const idx = headerRow.indexOf(headerName);
        if (idx >= 0) colByField[field] = idx;
    }

    return dataRows.map((row) => {
        const obj: any = {};
        for (const field in colByField) {
            obj[field] = row[colByField[field]];
        }
        return obj as T;
    });
}

// Example: Mandates Reader
export type MandateRow = {
    id: string;
    title: string;
    owner: string;
    status: string;
};

export function readMandates(): MandateRow[] {
    return readAsObjects<MandateRow>("mandates");
}

export type TaskRow = {
    id: string;
    task: string;
    status: string;
    dueDate: string;
    assignee: string;
};

export function readTasks(): TaskRow[] {
    return readAsObjects<TaskRow>("tasks");
}
