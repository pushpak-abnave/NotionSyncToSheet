export interface NotionPage {
    id: string;
    url: string;
    properties: Record<string, NotionProperty>;
    created_time: string;
    last_edited_time: string;
    [key: string]: any;
}

export interface NotionProperty {
    id: string;
    type: NotionPropertyType;
    [key: string]: any;
}

export type NotionPropertyType =
    | 'title'
    | 'rich_text'
    | 'number'
    | 'select'
    | 'multi_select'
    | 'date'
    | 'people'
    | 'files'
    | 'checkbox'
    | 'url'
    | 'email'
    | 'phone_number'
    | 'formula'
    | 'relation'
    | 'rollup'
    | 'created_time'
    | 'created_by'
    | 'last_edited_time'
    | 'last_edited_by'
    | 'status';

export interface CleanObject {
    id: string;
    url: string;
    [key: string]: any;
}

export type SheetRow = (string | number | boolean | null)[];
