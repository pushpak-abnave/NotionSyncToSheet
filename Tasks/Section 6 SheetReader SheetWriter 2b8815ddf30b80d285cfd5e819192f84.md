# Section 6: SheetReader/SheetWriter

# ✅ **Unified Config-Driven Sheet Reader & Sheet Writer System**

---

## 1. Purpose

This document describes how to build a **config-driven system** for interacting with Google Sheets. The goal is:

- No more hard-coded sheet names or column names inside scripts.
- A **single config file** decides everything.
- A **SheetReader** loads rows into typed objects.
- A **SheetWriter** writes those objects back into the sheet.
- And **for Mandates specifically**, Reader + Writer must **auto-create the sheet and headers** if they do not exist.

This structure is required for making scalable GAS automations that many people can maintain.

---

## 2. System Overview

The system is made of four layers:

### **1. Config (shared across all runtimes)**

Defines:

- Spreadsheet ID
- Sheet name
- Column mapping

### **2. SheetReader**

- Reads rows using the config
- Converts Google Sheets data → typed objects
- For Mandates: **creates the sheet and headers if missing**

### **3. SheetWriter**

- Writes objects → Google Sheets
- Uses config to determine column order
- For Mandates: **creates sheet + headers before writing**

### **4. Jobs**

- Fetch from external sources (Notion, etc.)
- Map → objects
- Use Reader + Writer to sync

---

# 3. Unified Config File

Location:

```
src/shared/sheetConfig.ts

```

This file defines every Sheet we support.

```tsx
// src/shared/sheetConfig.ts
export type SheetConfig = {
  spreadsheetId: string;
  sheetName: string;
  columns: Record<string, string>; // fieldName -> header text
};

export const SHEETS = {
  peopleActivity: {
    spreadsheetId: "DEMO_SPREADSHEET_ID",
    sheetName: "People Activity",
    columns: {
      name: "Name",
      date: "Date",
      hours: "Hours",
      status: "Status",
      notes: "Notes",
    },
  } as SheetConfig,

  mandates: {
    spreadsheetId: "MANDATES_SHEET_ID",
    sheetName: "Mandates",
    columns: {
      id: "Mandate ID",
      title: "Title",
      owner: "Owner",
      status: "Status",
    },
  } as SheetConfig,
} as const;

```

---

# 4. Sheet Initialization Helper

### (Ensures Mandates Sheet is Created)

Location:

```
src/gas/utils/sheetInit.ts

```

```tsx
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

```

> Mandatory:
> 
> 
> MandatesReader + MandatesWriter **must use this helper.**
> 

---

# 5. SheetReader (General)

Location:

```
src/gas/reader.ts

```

```tsx
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

```

---

# 6. SheetWriter (General)

Location:

```
src/gas/writer.ts

```

```tsx
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

// Example: Mandates Writer
import type { MandateRow } from "./reader";

export function writeMandates(rows: MandateRow[]): void {
  appendObjects("mandates", rows);
}

```

---

# 7. Job Integration (Mandates Example)

Location:

```
src/jobs/mandatesJob.ts

```

```tsx
import type { INotionClientSync } from "../clients/notion/base";
import { readMandates, writeMandates } from "../gas/reader";
import { MandateRow } from "../gas/reader";

export function runMandatesSync(
  client: INotionClientSync,
  pageIds: string[]
) {
  const log = (globalThis as any).log ?? console;

  const existing = readMandates();
  log.info("Existing mandates:", existing.length);

  const newRows: MandateRow[] = [];

  for (const id of pageIds) {
    const res = client.get<any>(`/pages/${id}`);
    if (!res.ok) {
      log.error("Failed fetching", id);
      continue;
    }

    // TODO: map Notion → MandateRow
    newRows.push({
      id,
      title: "Placeholder",
      owner: "Unknown",
      status: "Active",
    });
  }

  if (newRows.length > 0) {
    writeMandates(newRows);
    log.info("Wrote new mandate rows:", newRows.length);
  }
}

```

---

# 8. Intern / Contributor Checklist

To add a new use case (ex: Timesheets, Tasks, Projects):

### **1. Add a config entry in `sheetConfig.ts`**

- spreadsheetId
- sheetName
- columns

### **2. Reader responsibilities**

- Use `getOrCreateSheet`
- Confirm sheet + headers exist
- Map data → objects

### **3. Writer responsibilities**

- Use `getOrCreateSheet`
- Append or update rows

### **4. Job responsibilities**

- Fetch external source (Notion, etc.)
- Map → sheet rows
- Use Reader & Writer correctly

---

# 9. Mandates Special Rule

> MANDATES MUST ALWAYS auto-create the sheet and headers.
> 
> 
> Both Reader and Writer must call:
> 

```tsx
getOrCreateSheet("mandates");

```

This guarantees Mandates always works even in a fresh spreadsheet.