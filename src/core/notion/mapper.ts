import { CleanObject, SheetRow } from './types';

export class SheetMapper {
    /**
     * Maps a CleanObject to a SheetRow based on the provided column mapping.
     * @param obj The CleanObject to map.
     * @param columns A Record where keys are the property names in CleanObject and values are the Sheet headers.
     *                The order of keys in this object determines the order of columns in the row.
     * @returns A SheetRow (array of values).
     */
    static mapToSheetRow(obj: CleanObject, columns: Record<string, string>): SheetRow {
        const row: SheetRow = [];
        for (const key of Object.keys(columns)) {
            const value = obj[key];
            row.push(this.normalizeForSheet(value));
        }
        return row;
    }

    /**
     * Reverse maps a SheetRow to a CleanObject.
     * @param row The SheetRow to map.
     * @param columns A Record where keys are the property names in CleanObject and values are the Sheet headers.
     *                The order of keys must match the order of columns in the row.
     * @returns A CleanObject.
     */
    static mapFromSheetRow(row: SheetRow, columns: Record<string, string>): CleanObject {
        const obj: CleanObject = { id: '', url: '' }; // Minimum required fields, though id/url might be in the row
        const keys = Object.keys(columns);

        keys.forEach((key, index) => {
            if (index < row.length) {
                obj[key] = row[index];
            }
        });

        return obj;
    }

    private static normalizeForSheet(value: any): string | number | boolean | null {
        if (value === null || value === undefined) {
            return '';
        }
        if (Array.isArray(value)) {
            // Join arrays with commas for simple representation
            // For complex objects in arrays, we might need more specific logic, 
            // but CleanObject should ideally have flattened or simplified data already.
            return value.map(v => {
                if (typeof v === 'object' && v !== null) {
                    // Try to extract a name or label if possible, otherwise stringify
                    return v.name || v.id || JSON.stringify(v);
                }
                return String(v);
            }).join(', ');
        }
        if (typeof value === 'object') {
            // Similar fallback for single objects
            return value.name || value.id || JSON.stringify(value);
        }
        return value;
    }
}
