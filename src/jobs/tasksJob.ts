import type { INotionClientSync } from "../clients/notion/base";
import { writeTasks, TaskRow } from "../gas/writer";
import { getOrCreateSheet } from "../gas/utils/sheetInit";

export function syncNotionTasks(
    client: INotionClientSync,
    dbId: string
) {
    const log = (globalThis as any).log ?? console;

    // 1. Fetch from Notion
    log.info(`Fetching tasks from Notion DB: ${dbId}`);
    const res = client.post<any>(`/databases/${dbId}/query`);

    if (!res.ok) {
        log.error("Failed to query Notion DB", res.data);
        return;
    }

    const pages = res.data.results || [];
    log.info(`Found ${pages.length} pages in Notion`);

    if (pages.length === 0) {
        log.info("No tasks to sync");
        return;
    }

    // 2. Map to TaskRow
    const newRows: TaskRow[] = pages.map((page: any) => {
        const props = page.properties || {};

        // Helper to safely get property values
        // Adjust these keys based on your actual Notion DB property names
        const getTitle = (p: any) => p?.title?.[0]?.plain_text || "";
        const getSelect = (p: any) => p?.select?.name || p?.status?.name || "";
        const getDate = (p: any) => p?.date?.start || "";
        const getPerson = (p: any) => p?.people?.[0]?.name || "";

        return {
            id: page.id,
            task: getTitle(props["Task Name"] || props["Name"] || props["Title"] || props["Task"]),
            status: getSelect(props["Status"]),
            dueDate: getDate(props["Due Date"] || props["Date"]),
            assignee: getPerson(props["Assignee"] || props["Person"] || props["Owner"]),
        };
    });

    // 3. Clear existing data (Sync strategy: Replace All)
    const sheet = getOrCreateSheet("tasks");
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
        // Clear everything below headers
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
        log.info("Cleared existing sheet content");
    }

    // 4. Write new data
    writeTasks(newRows);
    log.info(`Synced ${newRows.length} tasks to Sheet`);
}
