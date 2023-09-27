export class Route {
    route_id: string;
    agency?: string;
    name: Name;
    desc?: string;
    type?: number;
    url?: string;
    color?: RouteColor;
    sort_order?: number;
    network_id?: string;
}

export class Name {
    short: string;
    long: string;
}

export class RouteColor {
    color: string;
    text: string;
}