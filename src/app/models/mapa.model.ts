export class FiltroMapa {
    agencias?: string[];
    lineas?: string[];
    paradas?: string[];
}

export class MovimientoMapa {
    latitud?: number;
    longitud?: number;
    zoom?: number;
}

export class AjusteMapa {
    bbox?: number[];
    offset?: number;
    zoomMax?: number;
    linear?: boolean;
}