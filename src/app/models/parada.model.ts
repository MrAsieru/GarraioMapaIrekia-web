import { Area } from "./area.model";
import { Linea } from "./linea.model";

export class Parada {
    idParada: string;
    codigo?: string;
    nombre?: string;
    nombreTTs?: string;
    descripcion?: string;
    posicionLatitud?: number;
    posicionLongitud?: number;
    idZona?: string;
    url?: string;
    tipo?: number;
    paradaPadre?: string;
    zonaHoraria?: string;
    accesibilidad?: number;
    idNivel?: string;
    codigoPlataforma?: string;
    lineas?: string[] | Linea[];
    viajes?: string[];
    areas?: string[] | Area[];
    nivel?: Nivel;
}

export class Nivel {
    idNivel: string;
    indice: string;
    nombre?: string;
}

export class StopVectorProperties {
    stop_id: string;
    name: string;
    zone_id: string;
    location_type: number;
    parent_station: string;
    platform_code: string;
}