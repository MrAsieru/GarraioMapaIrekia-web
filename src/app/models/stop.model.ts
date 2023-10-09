export class Stop {
    stop_id: string;
    code?: string;
    name?: string;
    desc?: string;
    coords_lat?: number;
    coords_lon?: number;
    zone_id?: string;
    url?: string;
    location_type?: number;
    parent_station?: string;
    timezone?: string;
    wheelchair_boarding?: number;
    level_id?: string;
    platform_code?: string;
}

export class StopVectorProperties {
    stop_id: string;
    name: string;
    zone_id: string;
    location_type: number;
    parent_station: string;
    platform_code: string;
}