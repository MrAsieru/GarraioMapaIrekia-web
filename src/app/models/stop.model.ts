export class Stop {
    stop_id: string;
    code?: string;
    name?: string;
    desc?: string;
    coords?: Coords;
    zone_id?: string;
    url?: string;
    location_type?: number;
    parent_station?: string;
    timezone?: string;
    wheelchair_boarding?: number;
    level_id?: string;
    platform_code?: string;
}

export class Coords {
    lat: number;
    lon: number;
}

export class StopVectorProperties {
    stop_id: string;
    stop_name: string;
    zone_id: string;
    location_type: number;
    parent_station: string;
    platform_code: string;
}