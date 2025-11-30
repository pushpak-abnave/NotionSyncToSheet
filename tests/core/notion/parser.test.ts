import { NotionParser } from '../../../src/core/notion/parser';
import { NotionPage } from '../../../src/core/notion/types';
import * as fs from 'fs';
import * as path from 'path';

describe('NotionParser', () => {
    let samplePage: NotionPage;

    beforeAll(() => {
        const samplePath = path.join(__dirname, '../../node/Sample.json');
        const fileContent = fs.readFileSync(samplePath, 'utf-8');
        samplePage = JSON.parse(fileContent) as NotionPage;
    });

    it('should parse basic metadata', () => {
        const result = NotionParser.parse(samplePage);
        expect(result.id).toBe('18f815dd-f30b-80b6-9976-c497322d40e9');
        expect(result.url).toBe('https://www.notion.so/Andrew-Lansangan-18f815ddf30b80b69976c497322d40e9');
        expect(result['Created Time']).toBe('2025-02-03T18:08:00.000Z');
    });

    it('should extract title', () => {
        const result = NotionParser.parse(samplePage);
        expect(result['Name']).toBe('Andrew Lansangan');
    });

    it('should extract email', () => {
        const result = NotionParser.parse(samplePage);
        expect(result['Email (Org)']).toBe('andrew.lansangan@grey-box.ca');
    });

    it('should extract multi_select values', () => {
        const result = NotionParser.parse(samplePage);
        expect(result['Skill (Current)']).toEqual(['Marketing', 'Website Development']);
    });

    it('should extract date', () => {
        const result = NotionParser.parse(samplePage);
        expect(result['Birthday']).toEqual({
            start: '1994-03-13',
            end: null,
            time_zone: null
        });
    });

    it('should extract relation IDs', () => {
        const result = NotionParser.parse(samplePage);
        expect(result['Position (Current)']).toEqual(['23a815dd-f30b-80b0-81ff-f5e2dc0121c4']);
    });

    it('should extract people names or IDs', () => {
        const result = NotionParser.parse(samplePage);
        // "Notion Profile" is a people property
        expect(result['Notion Profile']).toEqual(['andrew lansangan']);
    });

    it('should extract status', () => {
        const result = NotionParser.parse(samplePage);
        expect(result['Mandate (Status)']).toBe('Active');
    });

    it('should extract number', () => {
        const result = NotionParser.parse(samplePage);
        expect(result['Hours (Current)']).toBe(401.5);
    });

    it('should extract rich_text', () => {
        const result = NotionParser.parse(samplePage);
        // "Goal (Top 3)" is rich_text
        const goal = result['Goal (Top 3)'];
        expect(goal).toContain('Expand My Network');
        expect(goal).toContain('Work on a Real-World Project');
    });
});
