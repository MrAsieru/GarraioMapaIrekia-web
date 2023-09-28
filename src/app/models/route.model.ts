import { Agency } from "./agency.model";

export interface Route {
    route_id: string;
    agency?: Agency;
    name: Name;
    desc?: string;
    type?: number;
    url?: string;
    color?: RouteColor;
    sort_order?: number;
    network_id?: string;
}

export interface Name {
    short?: string;
    long?: string;
}

export interface RouteColor {
    color: string;
    text: string;
}