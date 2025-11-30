import { SheetMapper } from '../../../src/core/notion/mapper';
import { CleanObject } from '../../../src/core/notion/types';

describe('SheetMapper', () => {
    const columns = {
        id: 'ID',
        name: 'Name',
        tags: 'Tags',
        status: 'Status',
        meta: 'Metadata'
    };

    it('should map CleanObject to SheetRow correctly', () => {
        const obj: CleanObject = {
            id: '123',
            url: 'http://example.com',
            name: 'Test Item',
            tags: ['A', 'B'],
            status: { name: 'Done' },
            meta: null
        };

        const row = SheetMapper.mapToSheetRow(obj, columns);

        // Expected order: ID, Name, Tags, Status, Metadata
        expect(row[0]).toBe('123');
        expect(row[1]).toBe('Test Item');
        expect(row[2]).toBe('A, B');
        expect(row[3]).toBe('Done');
        expect(row[4]).toBe('');
    });

    it('should handle missing fields gracefully', () => {
        const obj: CleanObject = {
            id: '123',
            url: 'http://example.com'
        };

        const row = SheetMapper.mapToSheetRow(obj, columns);

        expect(row[1]).toBe(''); // Name
        expect(row[2]).toBe(''); // Tags
    });

    it('should map SheetRow back to CleanObject', () => {
        const row = ['123', 'Test Item', 'A, B', 'Done', ''];

        const obj = SheetMapper.mapFromSheetRow(row, columns);

        expect(obj.id).toBe('123');
        expect(obj.name).toBe('Test Item');
        expect(obj.tags).toBe('A, B'); // Note: Reverse mapping currently keeps strings as is
        expect(obj.status).toBe('Done');
    });

    it('should handle complex array objects by stringifying or extracting name', () => {
        const obj: CleanObject = {
            id: '123',
            url: '',
            tags: [{ name: 'Tag1' }, { id: 'Tag2' }]
        };
        // We only map 'tags' here to test the specific logic
        const row = SheetMapper.mapToSheetRow(obj, { tags: 'Tags' });
        expect(row[0]).toBe('Tag1, Tag2');
    });
});
