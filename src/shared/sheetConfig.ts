export type SheetConfig = {
    spreadsheetId: string;
    sheetName: string;
    columns: Record<string, string>; // fieldName -> header text
};

export const SHEETS = {
    mandates: {
        spreadsheetId: "1XXw4MdnBFadtJny82-3OUetNwbmAy1P3zmcOi-sq9xQ", // TODO: Replace with actual ID
        sheetName: "Mandates",
        columns: {
            id: "Mandate ID",
            title: "Title",
            owner: "Owner",
            status: "Status",
        },
    } as SheetConfig,

    tasks: {
        spreadsheetId: "1XXw4MdnBFadtJny82-3OUetNwbmAy1P3zmcOi-sq9xQ", // Using same sheet for now
        sheetName: "Tasks",
        columns: {
            id: "Task ID",
            task: "Task Name",
            status: "Status",
            dueDate: "Due Date",
            assignee: "Assignee",
        },
    } as SheetConfig,

    people: {
        spreadsheetId: "1XXw4MdnBFadtJny82-3OUetNwbmAy1P3zmcOi-sq9xQ",
        sheetName: "People",
        columns: {
            id: "Notion ID",
            "Name": "Full Name",
            "Email (Org)": "Email",
            "Skill (Current)": "Skills",
            "Mandate (Status)": "Status",
            "Hours (Current)": "Hours"
        }
    } as SheetConfig,
} as const;
