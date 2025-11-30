import { CleanObject, NotionPage, NotionProperty } from './types';

export class NotionParser {
    static parse(page: NotionPage): CleanObject {
        const cleanObj: CleanObject = {
            id: page.id,
            url: page.url,
        };

        for (const [key, prop] of Object.entries(page.properties)) {
            cleanObj[key] = this.extractValue(prop);
        }

        // Add metadata if needed, e.g., created_time, last_edited_time
        cleanObj['Created Time'] = page.created_time;
        cleanObj['Last Edited Time'] = page.last_edited_time;

        return cleanObj;
    }

    private static extractValue(prop: NotionProperty): any {
        switch (prop.type) {
            case 'title':
                return prop.title?.map((t: any) => t.plain_text).join('') || '';
            case 'rich_text':
                return prop.rich_text?.map((t: any) => t.plain_text).join('') || '';
            case 'number':
                return prop.number;
            case 'select':
                return prop.select?.name || null;
            case 'multi_select':
                return prop.multi_select?.map((s: any) => s.name) || [];
            case 'date':
                if (!prop.date) return null;
                return {
                    start: prop.date.start,
                    end: prop.date.end,
                    time_zone: prop.date.time_zone
                };
            case 'people':
                return prop.people?.map((p: any) => p.name || p.id) || []; // Fallback to ID if name missing
            case 'files':
                return prop.files?.map((f: any) => f.name) || [];
            case 'checkbox':
                return prop.checkbox;
            case 'url':
                return prop.url;
            case 'email':
                return prop.email;
            case 'phone_number':
                return prop.phone_number;
            case 'formula':
                if (prop.formula?.type === 'string') return prop.formula.string;
                if (prop.formula?.type === 'number') return prop.formula.number;
                if (prop.formula?.type === 'boolean') return prop.formula.boolean;
                if (prop.formula?.type === 'date') return prop.formula.date?.start; // Simplified
                return null;
            case 'relation':
                return prop.relation?.map((r: any) => r.id) || [];
            case 'rollup':
                // Simplified rollup handling: return array of values if possible, or raw
                // This often needs specific logic depending on rollup type (array, number, etc.)
                // For now, returning the raw array or mapped values if simple
                if (prop.rollup?.type === 'array') {
                    // Try to extract values from the array items if they are simple types
                    // This is complex because rollup array items are properties themselves
                    // For MVP, let's return the raw array or try to simplify common cases
                    return prop.rollup.array;
                }
                return prop.rollup?.[prop.rollup.type];
            case 'created_time':
                return prop.created_time;
            case 'created_by':
                return prop.created_by?.name || prop.created_by?.id;
            case 'last_edited_time':
                return prop.last_edited_time;
            case 'last_edited_by':
                return prop.last_edited_by?.name || prop.last_edited_by?.id;
            case 'status':
                return prop.status?.name || null;
            default:
                return null; // Unknown type
        }
    }
}
