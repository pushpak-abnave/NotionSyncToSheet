import { NotionParser } from '../core/notion/parser';
import { SheetMapper } from '../core/notion/mapper';
import { SHEETS } from '../shared/sheetConfig';
import { writePeople } from './writer';
import { NotionPage } from '../core/notion/types';

// Hardcoded sample data from Sample.json
const SAMPLE_DATA = {
    "object": "page",
    "id": "18f815dd-f30b-80b6-9976-c497322d40e9",
    "created_time": "2025-02-03T18:08:00.000Z",
    "last_edited_time": "2025-11-15T17:37:00.000Z",
    "created_by": {
        "object": "user",
        "id": "18fd872b-594c-8119-ad9c-00021ceea036"
    },
    "last_edited_by": {
        "object": "user",
        "id": "18fd872b-594c-8119-ad9c-00021ceea036"
    },
    "cover": null,
    "icon": {
        "type": "emoji",
        "emoji": "🚊"
    },
    "parent": {
        "type": "data_source_id",
        "data_source_id": "a92f493a-6843-4b0d-9812-117d699055db",
        "database_id": "3cf44b08-8a8f-4d6b-8abc-989353abcdb1"
    },
    "archived": false,
    "in_trash": false,
    "is_locked": false,
    "properties": {
        "Unit Lead": {
            "id": "%3A%3Dba",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Created (Profile)": {
            "id": "%3CJD~",
            "type": "created_time",
            "created_time": "2025-02-03T18:08:00.000Z"
        },
        "Team (Previous) (New)": {
            "id": "%3Cb%3DP",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Belbin (Top 3)": {
            "id": "%3D_hK",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Email (Org)": {
            "id": "%3DpiE",
            "type": "email",
            "email": "andrew.lansangan@grey-box.ca"
        },
        "Photo & Media": {
            "id": "%40ZO%5D",
            "type": "files",
            "files": [
                {
                    "name": "20250204_100108.jpg",
                    "type": "file",
                    "file": {
                        "url": "https://prod-files-secure.s3.us-west-2.amazonaws.com/7158bfba-25f6-42db-943a-2f20fdafef81/cbdc4e65-11f4-44ed-a7db-0c706e18d6bf/20250204_100108.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46635VX57BK%2F20251128%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20251128T160245Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEO3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIFqq3W583lApkmKtKChoENQ%2B7U2zw%2FvogPYyWmLjg7pkAiBChnD6Z8KbaP5b8X6Xy520sDouBAD4I1x1gdTa9ZZWJyqIBAi2%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIM%2BU9MenWJd7HwMY52KtwDYXR0sLsTsgLqB9z3minIckUd3TtlKqfycLtxGeH3aM7LiFAaHbDzW%2BnvWDSVSaemdT%2F9T4BiVeHYfyu%2FJVYyAXtT1cKKUMOLnfhedTGXirozZB17YVlbTYdKZKXktNCHRF600lRKpOkqSBkXq8n6pR6MkzuIVwhuYxnUVczqiWtRvRcyB1LUtd7ez5ekxQX76CTTHf8hY2rOBVtkX7IIPyvA2vZTl9a1zkSP9an%2BDTkmwkC3IHOUQBdn5id1Mx%2B88U0ggIHKue7iuraFFZGhRosYdhIXw2rHsHsiqVWA7EOD9Yxpg42phkymMdvFrtDxlH7%2FUEB8S8RBYCcNsbmNSN8F3C%2BSAx8Vqlvr5izte6QeSpvp0hsOIUJU2faCOUWrm95QdBaDNcNnv%2Fg1qG5f5Q0b8tfwQswAz1EsiaGWobHYynhWT%2FCpRJp7kfZVwKRHJekZt8p9lAU6qdzA66xHr%2BifJwfdP5L4nUIg%2FGN%2F4ud34ls%2FUPzZWfsYyRxRpBwGqYzcJXeaApNrADaNZd%2FMWFt6FOdY%2FggMQGV9UB0pV9zA98xedHg6oBIslM%2BIASrbb0%2BZzhNuytDhLdoAFuWsTJJ7EbpEtY9LkxZa%2FsOIFUXDosspbUYCZXS7HGEwub%2BmyQY6pgGIM4eGBnwVAQ%2BPOAUxQZUMFkQ6Pqvx7Ft5b9pGR7n8oLOsJ8t%2FYL9%2F5mw4Sz5OC8IRY2rVmfO8z8DN0viZRhFBgH46T9GLsz1J9kltT4jy60vgXO2Q%2FgjoEKga85%2FJzLX40JlkEJ1hNmL40GIw8iGzOWBePC2mb9tHkfuf0JtDGW%2FDZfLAKSvherjsudNdOQzl9DtIx525GvpTJIg1NnJMJ1GZczd1&X-Amz-Signature=886480109c34ffefe77f2087b2409d074b1f130af31ef1c236401358e0038499&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
                        "expiry_time": "2025-11-28T17:02:45.911Z"
                    }
                }
            ]
        },
        "Last edited time": {
            "id": "E%3BDo",
            "type": "last_edited_time",
            "last_edited_time": "2025-11-15T17:37:00.000Z"
        },
        "LinkedIn Profile": {
            "id": "FtCy",
            "type": "url",
            "url": null
        },
        "Team Scrum": {
            "id": "GqsY",
            "type": "rollup",
            "rollup": {
                "type": "array",
                "array": [
                    {
                        "type": "relation",
                        "relation": []
                    },
                    {
                        "type": "relation",
                        "relation": []
                    },
                    {
                        "type": "relation",
                        "relation": []
                    }
                ],
                "function": "show_original"
            }
        },
        "Skill (Current)": {
            "id": "HA%40l",
            "type": "multi_select",
            "multi_select": [
                {
                    "id": "bc2d8bd6-e52b-4184-8498-48664090a088",
                    "name": "Marketing",
                    "color": "purple"
                },
                {
                    "id": "e69ec01e-9c90-44e3-b8f7-d04744385d8b",
                    "name": "Website Development",
                    "color": "gray"
                }
            ]
        },
        "First Name": {
            "id": "HSJF",
            "type": "rich_text",
            "rich_text": [
                {
                    "type": "text",
                    "text": {
                        "content": "Andrew",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "Andrew",
                    "href": null
                }
            ]
        },
        "Birthday": {
            "id": "J%3EFQ",
            "type": "date",
            "date": {
                "start": "1994-03-13",
                "end": null,
                "time_zone": null
            }
        },
        "(L) Mandate (Date)": {
            "id": "NpaR",
            "type": "rollup",
            "rollup": {
                "type": "array",
                "array": [],
                "function": "show_original"
            }
        },
        "GitHub Profile": {
            "id": "O%7CE%7C",
            "type": "url",
            "url": "https://github.com/AndrewLansangan"
        },
        "Team Status": {
            "id": "PKIu",
            "type": "rollup",
            "rollup": {
                "type": "array",
                "array": [
                    {
                        "type": "status",
                        "status": {
                            "id": "3b5dc65f-376f-4baa-840b-6c52c518cf44",
                            "name": "Completed",
                            "color": "green"
                        }
                    },
                    {
                        "type": "status",
                        "status": {
                            "id": "2a742a22-ee28-45c4-9c56-7a2637c8506b",
                            "name": "In progress",
                            "color": "blue"
                        }
                    },
                    {
                        "type": "status",
                        "status": {
                            "id": "211678ab-63ae-4b7c-bc37-5c57aedfc3c8",
                            "name": "Not started",
                            "color": "default"
                        }
                    }
                ],
                "function": "show_original"
            }
        },
        "(L) Team (Current)": {
            "id": "QEZ%7C",
            "type": "rollup",
            "rollup": {
                "type": "array",
                "array": [],
                "function": "show_original"
            }
        },
        "Mandate (Status)": {
            "id": "QyDj",
            "type": "status",
            "status": {
                "id": "177a4ab5-6d75-4304-8c0c-3f2f139c9e4d",
                "name": "Active",
                "color": "blue"
            }
        },
        "Position (OLD)": {
            "id": "R_%5EY",
            "type": "multi_select",
            "multi_select": [
                {
                    "id": "e85a0b87-0e1c-4261-813e-d17fc338de3f",
                    "name": "Intern",
                    "color": "brown"
                }
            ]
        },
        "People Directory (Count)": {
            "id": "T%40wC",
            "type": "formula",
            "formula": {
                "type": "number",
                "number": 0
            }
        },
        "Hours (Last Update)": {
            "id": "UwGe",
            "type": "date",
            "date": {
                "start": "2025-09-03T18:30:00.000+00:00",
                "end": null,
                "time_zone": null
            }
        },
        "(L) Hours (Initial)": {
            "id": "X%60Pi",
            "type": "rollup",
            "rollup": {
                "type": "array",
                "array": [],
                "function": "show_original"
            }
        },
        "Unit Technical Lead (Advisor)": {
            "id": "%5ETLH",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Position (Current)": {
            "id": "%5EzmL",
            "type": "relation",
            "relation": [
                {
                    "id": "23a815dd-f30b-80b0-81ff-f5e2dc0121c4"
                }
            ],
            "has_more": false
        },
        "(L) Mandate (Status)": {
            "id": "_L%3C%3F",
            "type": "rollup",
            "rollup": {
                "type": "array",
                "array": [],
                "function": "show_original"
            }
        },
        "Hardware (Org)": {
            "id": "_tFj",
            "type": "multi_select",
            "multi_select": []
        },
        "People Directory (Sync)": {
            "id": "bvcY",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Scrum of": {
            "id": "cHVZ",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Hardware (Personal)": {
            "id": "eM%5BI",
            "type": "multi_select",
            "multi_select": [
                {
                    "id": "b9042d55-df97-4fc0-8873-145a83f34712",
                    "name": "Windows Desktop",
                    "color": "yellow"
                },
                {
                    "id": "46849834-5e22-4856-b448-2f74d8d2bfac",
                    "name": "Windows Laptop + Android Phone (Samsung Galaxy S10) + Several Android Tablets",
                    "color": "default"
                }
            ]
        },
        "Last Name": {
            "id": "fA%3Ey",
            "type": "rich_text",
            "rich_text": [
                {
                    "type": "text",
                    "text": {
                        "content": "Lansangan",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "Lansangan",
                    "href": null
                }
            ]
        },
        "🧰 Tech Skill (Future)": {
            "id": "gQ%40Y",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Onboarding (%)": {
            "id": "gT~h",
            "type": "formula",
            "formula": {
                "type": "number",
                "number": 80
            }
        },
        "Skill (Future)": {
            "id": "jW%5Ct",
            "type": "multi_select",
            "multi_select": []
        },
        "Team (Current)": {
            "id": "m%5DQ%60",
            "type": "relation",
            "relation": [
                {
                    "id": "18f815dd-f30b-802d-9a11-d148e8fa26e4"
                },
                {
                    "id": "1c8815dd-f30b-8047-b006-eca99cf4b12f"
                },
                {
                    "id": "26f815dd-f30b-80d2-9cff-e831818b38c8"
                }
            ],
            "has_more": false
        },
        "Tracking Calendar": {
            "id": "nNDx",
            "type": "url",
            "url": null
        },
        "Mandate (Date)": {
            "id": "nkQi",
            "type": "date",
            "date": {
                "start": "2025-03-03",
                "end": "2025-04-14",
                "time_zone": null
            }
        },
        "Unit (Current Team)": {
            "id": "ohIH",
            "type": "rollup",
            "rollup": {
                "type": "array",
                "array": [
                    {
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": null
                        }
                    },
                    {
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": null
                        }
                    },
                    {
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": null
                        }
                    }
                ],
                "function": "show_unique"
            }
        },
        "Position (Previous)": {
            "id": "qcS%5E",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Goal (Top 3)": {
            "id": "r_q%3F",
            "type": "rich_text",
            "rich_text": [
                {
                    "type": "text",
                    "text": {
                        "content": "Expand My Network",
                        "link": null
                    },
                    "annotations": {
                        "bold": true,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "Expand My Network",
                    "href": null
                },
                {
                    "type": "text",
                    "text": {
                        "content": " – Connect with industry professionals, attend events, or join tech communities\n",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": " – Connect with industry professionals, attend events, or join tech communities\n",
                    "href": null
                },
                {
                    "type": "text",
                    "text": {
                        "content": "Work on a Real-World Project",
                        "link": null
                    },
                    "annotations": {
                        "bold": true,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "Work on a Real-World Project",
                    "href": null
                },
                {
                    "type": "text",
                    "text": {
                        "content": " – Contribute meaningful code to a project used by actual users.\n",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": " – Contribute meaningful code to a project used by actual users.\n",
                    "href": null
                },
                {
                    "type": "text",
                    "text": {
                        "content": "Learn from Experienced Developers",
                        "link": null
                    },
                    "annotations": {
                        "bold": true,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "Learn from Experienced Developers",
                    "href": null
                },
                {
                    "type": "text",
                    "text": {
                        "content": " – Absorb as much knowledge as possible from mentors and colleagues.\n",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": " – Absorb as much knowledge as possible from mentors and colleagues.\n",
                    "href": null
                }
            ]
        },
        "MBTI": {
            "id": "uA%7DV",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Unit (Current Team) (Patch)": {
            "id": "uOL%60",
            "type": "formula",
            "formula": {
                "type": "string",
                "string": null
            }
        },
        "Team (Current)(Old)": {
            "id": "v%7Bp%7D",
            "type": "multi_select",
            "multi_select": []
        },
        "Hours (Current)": {
            "id": "wxy%5C",
            "type": "number",
            "number": 401.5
        },
        "Evaluation": {
            "id": "x%5Cuc",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Hours (Initial)": {
            "id": "xoCL",
            "type": "number",
            "number": 300
        },
        "Notion Profile": {
            "id": "xt%3B%5B",
            "type": "people",
            "people": [
                {
                    "object": "user",
                    "id": "18fd872b-594c-8119-ad9c-00021ceea036",
                    "name": "andrew lansangan",
                    "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLJmZF0BRlFlPi_FUJX2plbRzdcTzlq1aZ0CzDnhOnhpl-5=s100",
                    "type": "person",
                    "person": {
                        "email": "andrew.lansangan@grey-box.ca"
                    }
                }
            ]
        },
        "🧰 Tech Skill (Current)": {
            "id": "yAc%3C",
            "type": "relation",
            "relation": [],
            "has_more": false
        },
        "Team (Previous)(Old)": {
            "id": "%7DPn%7C",
            "type": "multi_select",
            "multi_select": []
        },
        "Availability (avg h/w)": {
            "id": "%7Dsd%5C",
            "type": "rich_text",
            "rich_text": [
                {
                    "type": "text",
                    "text": {
                        "content": "33h",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "33h",
                    "href": null
                }
            ]
        },
        "Name": {
            "id": "title",
            "type": "title",
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "Andrew Lansangan",
                        "link": null
                    },
                    "annotations": {
                        "bold": false,
                        "italic": false,
                        "strikethrough": false,
                        "underline": false,
                        "code": false,
                        "color": "default"
                    },
                    "plain_text": "Andrew Lansangan",
                    "href": null
                }
            ]
        }
    },
    "url": "https://www.notion.so/Andrew-Lansangan-18f815ddf30b80b69976c497322d40e9",
    "public_url": null,
    "developer_survey": "https://notionup.typeform.com/to/bllBsoI4?utm_source=postman",
    "request_id": "ce84f67d-bedb-48ab-835d-eb8e1e2e1c9c"
} as unknown as NotionPage;

export function testSyncSampleData() {
    // 1. Parse
    const cleanObj = NotionParser.parse(SAMPLE_DATA);

    // 2. Map
    // @ts-ignore
    const config = SHEETS.people;
    const row = SheetMapper.mapToSheetRow(cleanObj, config.columns);

    // 3. Write
    writePeople([row]);

    Logger.log('Successfully wrote sample data to People sheet');
}
