import { Agencia } from "./agencia.model";
import { Parada } from "./parada.model";

export interface Linea {
    idLinea: string;
    idAgencia: string;
    agencia?: Agencia;
    nombreCorto?: string;
    nombreLargo?: string;
    descripcion?: string;
    tipo?: number;
    url?: string;
    color?: string;
    colorTexto?: string;
    orden?: number;
    idRed?: string;
    paradas?: string[] | Parada[];
    viajes?: string[];
    bbox: number[];
}

export class ShapeVectorProperties {
    idRecorrido: string;
    idLinea: string;
    idAgencia: string;
    nombreAgencia: string;
    nombreLargo?: string;
    nombreCorto?: string;
    tipo?: number;
    color?: string;
    colorTexto?: string;
    bbox: number[];
}