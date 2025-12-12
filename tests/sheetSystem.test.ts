import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readMandates, readTasks } from '../src/gas/reader';
import { writeMandates, writeTasks } from '../src/gas/writer';
import { syncNotionTasks } from '../src/jobs/tasksJob';
import { SHEETS } from '../src/shared/sheetConfig';

// Mock Google Apps Script SpreadsheetApp
const mockSheet = {
    getDataRange: vi.fn(),
    getRange: vi.fn(),
    getLastColumn: vi.fn(),
    getLastRow: vi.fn(),
    insertSheet: vi.fn(),
};

const mockSpreadsheet = {
    getSheetByName: vi.fn(),
    insertSheet: vi.fn(),
};

const mockSpreadsheetApp = {
    openById: vi.fn(),
};

// Global mock
vi.stubGlobal('SpreadsheetApp', mockSpreadsheetApp);

describe('Sheet System', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSpreadsheetApp.openById.mockReturnValue(mockSpreadsheet);
        mockSpreadsheet.getSheetByName.mockReturnValue(mockSheet);
        mockSpreadsheet.insertSheet.mockReturnValue(mockSheet);

        // Default range mock
        const mockRange = {
            getValues: vi.fn().mockReturnValue([[]]), // Default empty values
            setValues: vi.fn(),
            clearContent: vi.fn(),
        };
        mockSheet.getDataRange.mockReturnValue(mockRange);
        mockSheet.getRange.mockReturnValue(mockRange);
        mockSheet.getLastColumn.mockReturnValue(0);
        mockSheet.getLastRow.mockReturnValue(0);
    });

    it('should read mandates correctly', () => {
        const headers = ["Mandate ID", "Title", "Owner", "Status"];
        const row1 = ["123", "Test Mandate", "Alice", "Active"];

        const mockHeaderRange = {
            getValues: vi.fn().mockReturnValue([headers]),
            setValues: vi.fn(),
        };
        const mockDataRange = {
            getValues: vi.fn().mockReturnValue([headers, row1]),
        };

        mockSheet.getRange.mockReturnValue(mockHeaderRange);
        mockSheet.getDataRange.mockReturnValue(mockDataRange);

        const result = readMandates();

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: "123",
            title: "Test Mandate",
            owner: "Alice",
            status: "Active",
        });
    });

    it('should write mandates correctly', () => {
        const headers = ["Mandate ID", "Title", "Owner", "Status"];

        const mockHeaderRange = {
            getValues: vi.fn().mockReturnValue([headers]),
        };
        const mockWriteRange = {
            setValues: vi.fn(),
        };

        mockSheet.getLastColumn.mockReturnValue(4);
        mockSheet.getLastRow.mockReturnValue(10);

        mockSheet.getRange.mockImplementation((row, col, numRows, numCols) => {
            if (row === 1) return mockHeaderRange;
            return mockWriteRange;
        });

        const newRows = [{
            id: "456",
            title: "New Mandate",
            owner: "Bob",
            status: "Pending",
        }];

        writeMandates(newRows);

        expect(mockWriteRange.setValues).toHaveBeenCalledWith([
            ["456", "New Mandate", "Bob", "Pending"]
        ]);
    });

    it('should read tasks correctly', () => {
        const headers = ["Task ID", "Task Name", "Status", "Due Date", "Assignee"];
        const row1 = ["T-1", "Fix Bug", "In Progress", "2023-10-01", "Dev"];

        const mockHeaderRange = {
            getValues: vi.fn().mockReturnValue([headers]),
            setValues: vi.fn(),
        };
        const mockDataRange = {
            getValues: vi.fn().mockReturnValue([headers, row1]),
        };

        mockSheet.getRange.mockReturnValue(mockHeaderRange);
        mockSheet.getDataRange.mockReturnValue(mockDataRange);

        const result = readTasks();

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: "T-1",
            task: "Fix Bug",
            status: "In Progress",
            dueDate: "2023-10-01",
            assignee: "Dev",
        });
    });

    it('should write tasks correctly', () => {
        const headers = ["Task ID", "Task Name", "Status", "Due Date", "Assignee"];

        const mockHeaderRange = {
            getValues: vi.fn().mockReturnValue([headers]),
        };
        const mockWriteRange = {
            setValues: vi.fn(),
        };

        mockSheet.getLastColumn.mockReturnValue(5);
        mockSheet.getLastRow.mockReturnValue(20);

        mockSheet.getRange.mockImplementation((row, col, numRows, numCols) => {
            if (row === 1) return mockHeaderRange;
            return mockWriteRange;
        });

        const newRows = [{
            id: "T-2",
            task: "New Feature",
            status: "Todo",
            dueDate: "2023-11-01",
            assignee: "PM",
        }];

        writeTasks(newRows);

        expect(mockWriteRange.setValues).toHaveBeenCalledWith([
            ["T-2", "New Feature", "Todo", "2023-11-01", "PM"]
        ]);
    });

    it('should sync notion tasks correctly', () => {
        // Mock Notion Client
        const mockNotionClient = {
            post: vi.fn().mockReturnValue({
                ok: true,
                data: {
                    results: [
                        {
                            id: "page-1",
                            properties: {
                                "Task Name": { title: [{ plain_text: "Synced Task" }] },
                                "Status": { select: { name: "Done" } },
                                "Due Date": { date: { start: "2023-12-25" } },
                                "Assignee": { people: [{ name: "Santa" }] },
                            }
                        }
                    ]
                }
            }),
            request: vi.fn(),
            get: vi.fn(),
            patch: vi.fn(),
        };

        // Mock Sheet for clearing and writing
        const mockHeaderRange = {
            getValues: vi.fn().mockReturnValue([["Task ID", "Task Name", "Status", "Due Date", "Assignee"]]),
        };
        const mockWriteRange = {
            setValues: vi.fn(),
        };
        const mockClearRange = {
            clearContent: vi.fn(),
        };

        mockSheet.getLastColumn.mockReturnValue(5);
        mockSheet.getLastRow.mockReturnValue(5); // Simulate existing data

        mockSheet.getRange.mockImplementation((row, col, numRows, numCols) => {
            if (row === 1) return mockHeaderRange;
            if (row === 2 && numRows === 4) return mockClearRange; // Clearing existing
            return mockWriteRange; // Writing new
        });

        syncNotionTasks(mockNotionClient, "db-id");

        // Verify Notion fetch
        expect(mockNotionClient.post).toHaveBeenCalledWith('/databases/db-id/query');

        // Verify Clear
        expect(mockClearRange.clearContent).toHaveBeenCalled();

        // Verify Write
        expect(mockWriteRange.setValues).toHaveBeenCalledWith([
            ["page-1", "Synced Task", "Done", "2023-12-25", "Santa"]
        ]);
    });
});
