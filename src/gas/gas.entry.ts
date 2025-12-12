/// <reference types="google-apps-script" />

// 1) Flags and logger globals for GAS – set BEFORE imports that use `log`
; (globalThis as any).DEBUG = true;
; (globalThis as any).DRY_RUN = false;

; (globalThis as any).log = {
  debug: (...a: any[]) => Logger.log(["DEBUG", ...a].map(String).join(" ")),
  info: (...a: any[]) => Logger.log(["INFO ", ...a].map(String).join(" ")),
  warn: (...a: any[]) => Logger.log(["WARN ", ...a].map(String).join(" ")),
  error: (...a: any[]) => Logger.log(["ERROR", ...a].map(String).join(" ")),
};

// 2) Now import your core + jobs
import { testRunCore } from "../core/testCore";
import { runPeopleActivityJob } from "../jobs/peopleActivityJobs"; // <- singular file name

// If you already have a GAS Notion client, you’d import it here too:
// import { NotionClientGas } from "../clients/notion/gasClient";
// const notionGas = new NotionClientGas({ debug: true });

// 3) Expose GAS entrypoints on globalThis

; (globalThis as any).testRun = function (): string {
  return testRunCore();
};

// Example job entrypoint (stub – fill pageIds & client later)
; (globalThis as any).notionPeopleActivityDaily = function (): void {
  const pageIds: string[] = []; // TODO: pull from config / sheet
  // runPeopleActivityJob(notionGas, pageIds); // once notionGas is wired
};

import { testSyncSampleData } from "./debug";
; (globalThis as any).testSyncSampleData = function (): void {
  testSyncSampleData();
};
