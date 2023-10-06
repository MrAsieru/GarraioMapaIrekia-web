export class Catalog {
    tiles: {
        [key: string]: {
            name: string;
            description: string;
        }
    }
}

export class TileSet {
    id?: string;
    vector_layers: [
        {
            id: string;
            maxzoom: number;
            minzoom: number;
        }
    ]
    bounds: number[]; // [oeste, sur, este, norte]
    center: number[]; // [longitud, latitud, zoom]
    minzoom: number;
    maxzoom: number;
}