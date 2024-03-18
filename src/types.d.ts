import { DistTypes } from 'gpl-core'
interface ModTypes {
    slug: string;
    title: string;
    description: string;
    categories: string[];
    client_side: string;
    server_side: string;
    project_type: string;
    downloads: number;
    icon_url: string;
    color: number;
    thread_id: string;
    monetization_status: string;
    project_id: string;
    author: string;
    display_categories: string[];
    versions: string[];
    follows: number;
    date_created: string;
    date_modified: string;
    latest_version: string;
    license: string;
    gallery: string[];
    featured_gallery: string;
}
interface SearchArgs {
    query: string;
    facets: string;
    index: string;
    offset: number;
    limit: number;
}
interface ServerTypes {
    "status": string;
    "online": boolean;
    "motd": string;
    "motd_json": {
        "extra": {
            "color": string;
            "text": string;
        }[];
        "text": string;
    };
    "favicon": string;
    "error": boolean;
    "players": {
        "max": number;
        "now": number;
        "sample": {
            "name": string;
            "id": string;
        }[]
    },
    "server": {
        "name": string;
        "protocol": number;
    },
    "last_updated": string;
    "duration": string;
}

interface StoreMemoryTypes {
    min: string;
    max: string
}
interface StoreTypes {
    username: string;
    dist: DistTypes;
    gameRoot: string;
    clientMods: string[];
    memoryMin: number;
    memoryMax: number;
    quickPlay: object;
    fullscreen: boolean;
    windowW: number;
    windowH: number;
    lang: string;
}
interface DownloadDataTypes {
    name: string;
    type: string;
    current: number;
    total: number;
}
