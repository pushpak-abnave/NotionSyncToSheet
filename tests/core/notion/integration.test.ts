import { NotionParser } from '../../../src/core/notion/parser';
import { SheetMapper } from '../../../src/core/notion/mapper';
import { SHEETS } from '../../../src/shared/sheetConfig';
import { NotionPage } from '../../../src/core/notion/types';
import * as fs from 'fs';
import * as path from 'path';

describe('Integration: Notion -> Sheet', () => {
    let samplePage: NotionPage;

    beforeAll(() => {
        const samplePath = path.join(__dirname, '../../node/Sample.json');
        const fileContent = fs.readFileSync(samplePath, 'utf-8');
        samplePage = JSON.parse(fileContent) as NotionPage;
    });

    it('should correctly transform Sample.json to a People sheet row', () => {
        // 1. Parse
        const cleanObj = NotionParser.parse(samplePage);

        // 2. Map using 'people' config
        // Note: We added 'people' to sheetConfig.ts in the previous step
        // @ts-ignore - ignoring TS error if types aren't updated yet in IDE context
        const config = SHEETS.people;

        const row = SheetMapper.mapToSheetRow(cleanObj, config.columns);

        // 3. Verify
        // Columns: id, Name, Email (Org), Skill (Current), Mandate (Status), Hours (Current)

        // ID
        expect(row[0]).toBe('18f815dd-f30b-80b6-9976-c497322d40e9');

        // Name
        expect(row[1]).toBe('Andrew Lansangan');

        // Email
        expect(row[2]).toBe('andrew.lansangan@grey-box.ca');

        // Skills (Multi-select -> comma separated)
        expect(row[3]).toBe('Marketing, Website Development');

        // Status
        expect(row[4]).toBe('Active');

        // Hours
        expect(row[5]).toBe(401.5);

        console.log('Mapped Row:', row);
    });
});
