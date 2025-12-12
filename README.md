# Hybrid TypeScript + Google Apps Script Architecture

This project is a **hybrid TypeScript + Google Apps Script (GAS)** setup with:

- **TypeScript** as the single source of truth
- **esbuild** bundling into a single `build/Code.js` for GAS
- **Node.js** for local development and tests (Vitest)
- **OOP-style clients** for external systems (Notion, Sheets, etc.)
- **Pure functions** in `src/core` that can run in both GAS and Node

This README documents the **tools**, **structure**, and **architecture** for the codebase.

---

## 1. Tools & Config Files

### 1.1 Core tooling

- **TypeScript** – language + type system
- **esbuild** – bundler to produce GAS-compatible `Code.js`
- **Vitest** – test runner (Node environment)
- **Node.js** – local runtime for dev/tests
- **dotenv** – load environment variables from `.env` for Node-only code

### 1.2 Important config files

At repo root:


project-root/
  README.md
  package.json

  tsconfig.json
  tsconfig.node.json
  esbuild.config.ts
  vitest.config.ts
  .env

  src/
    core/        # Pure logic (no GAS, no Node globals)
    clients/     # OOP-style clients for external systems
    gas/         # GAS-specific helpers (SpreadsheetApp, UrlFetchApp, etc.)
    jobs/        # Workflows/orchestrators
    node/        # Node-specific utilities (optional)
    gas.entry.ts # GAS entrypoint (bundled → build/Code.js)
    node.entry.ts # Node entrypoint for local dev (optional)

  tests/
    core/        # Unit tests for src/core (pure logic)
    clients/     # Tests with mocks for clients
    jobs/        # Tests for workflow logic (with mocked clients)


---

## 2. System Overview

The **Automaton** project is designed to synchronize data between Notion databases and Google Sheets. It supports running in two environments:
1.  **Google Apps Script (GAS)**: The production environment where the code runs as a Google Workspace Add-on.
2.  **Node.js (Local)**: A development environment for testing logic without deploying to GAS.

### Core Components

-   **Entry Points (`src/gas/gas.entry.ts`)**: The main interface exposed to the GAS runtime. It defines global functions like `testMandateSync` and sets up logging.
-   **Clients (`src/clients/`)**: Wrappers for external APIs.
    -   `INotionClientSync`: Synchronous interface for GAS.
    -   `INotionClientAsync`: Asynchronous interface for Node.js.
-   **Jobs (`src/jobs/`)**: Business logic units (e.g., `mandatesJob.ts`) that coordinate fetching data from Notion and writing to Sheets.
-   **Writers (`src/gas/writer.ts`)**: specialized functions to write data to specific Sheets, handling headers and row appending.

---

## 3. Notion Parser & Sheet Mapper Architecture

To ensure robustness and consistency, the project follows a decoupled architecture for handling data.

### 3.1 Problem Statement

**As a workflow developer**, I need a robust way to convert raw Notion API responses into clean, predictable objects, and then map those objects into Google Sheet rows, avoiding ad-hoc parsing logic inside jobs.

### 3.2 Key Patterns

1.  **Parser Layer**: Converts `Raw Notion Page` -> `Clean Domain Object`
2.  **Mapper Layer**: Converts `Clean Domain Object` -> `Sheet Row`

#### Phase 1: The Clean Object (Domain Entity)

The "Clean Object" is a TypeScript interface representing the data in its purest form, independent of where it came from or where it's going.


// Example: Mandate Domain Object
export interface Mandate {
  id: string;              // Normalized Greybox ID (FirstName.LastName)
  status: string;          // e.g., "Active", "Pending"
  name: string;            // Mandate Title
  positionIds: string[];   // Array of related IDs
  teamCurrentId: string;   // Single resolved ID
  startDate: string;       // ISO Date string
  hoursInitial: number;
  emailOrg: string;
}


#### Phase 2: The Parser (Notion -> Clean Object)

The `NotionParser` is a class of static methods designed to safely extract typed data from Notion properties.


class NotionParser {
  static getTitle(p: any): string {
    return p?.title?.[0]?.plain_text || "";
  }

  static getSelect(p: any): string {
    return p?.select?.name || p?.status?.name || "";
  }

  // Parses a raw page into a clean Mandate object
  static parseMandate(page: any): Mandate {
    const props = page.properties || {};
    const fName = this.getRichText(props["First Name"]);
    const lName = this.getRichText(props["Last Name"]);
    
    return {
      id: (fName && lName) ? `${fName}.${lName}` : (fName || lName || ""),
      status: this.getSelect(props["Mandate (Status)"]),
      name: this.getTitle(props["Name"]),
      // ... other fields
    };
  }
}


#### Phase 3: The Mapper (Clean Object -> Sheet Row)

The `SheetMapper` transforms the Clean Object into the flat structure expected by `SheetWriter`.

typescript
// Matches the column headers defined in sheetConfig.ts
interface MandateSheetRow {
  Id: string;
  Mandate_Status: string;
  Name: string;
  // ...
}

const mapMandateToRow = (mandate: Mandate): MandateSheetRow => {
  return {
    Id: mandate.id,
    Mandate_Status: mandate.status,
    Name: mandate.name,
    // ...
  };
};


---

## 4. Key Code Patterns

### Global Logging in GAS
In `src/gas/gas.entry.ts`, we set up a global logger that works in GAS but can be mocked locally.

typescript
// src/gas/gas.entry.ts
; (globalThis as any).log = {
  debug: (...a: any[]) => Logger.log(["DEBUG", ...a].map(String).join(" ")),
  info: (...a: any[]) => Logger.log(["INFO ", ...a].map(String).join(" ")),
  warn: (...a: any[]) => Logger.log(["WARN ", ...a].map(String).join(" ")),
  error: (...a: any[]) => Logger.log(["ERROR", ...a].map(String).join(" ")),
};


### Generic Sheet Writer
The `writeObjects` function in `src/gas/writer.ts` is the standard way to write data. It dynamically maps object keys to Sheet headers.

typescript
// src/gas/writer.ts
export function writeObjects<T extends Record<string, any>>(
    configKey: keyof typeof SHEETS,
    rows: T[],
    mode: WriteMode = WriteMode.APPEND
) {
    // 1. Get Sheet Config
    const cfg = SHEETS[configKey];
    
     // 2. Map Object Keys to Column Indexes based on Headers
    // ... logic to find column index for each field ...

    // 3. Write data to range
    sheet.getRange(startRow, 1, outputValues.length, lastCol).setValues(outputValues);
}
