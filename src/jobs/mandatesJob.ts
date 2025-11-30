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
        // This is a placeholder mapping. In a real scenario, we would extract properties from res.data
        newRows.push({
            id,
            title: "Placeholder Title",
            owner: "Unknown Owner",
            status: "Active",
        });
    }

    if (newRows.length > 0) {
        writeMandates(newRows);
        log.info("Wrote new mandate rows:", newRows.length);
    }
}
