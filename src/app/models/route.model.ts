import { Agency } from "./agency.model";

export interface Route {
    route_id: string;
    agency_id: string;
    agency?: Agency;
    short_name?: string;
    long_name?: string;
    desc?: string;
    type?: number;
    url?: string;
    color?: string;
    text_color?: string;
    sort_order?: number;
    network_id?: string;
}