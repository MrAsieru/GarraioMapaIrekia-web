import { Agencia } from "./agencia.model";
import { Parada } from "./parada.model";
const Omit = <T, K extends keyof T>(Class: new () => T, keys: K[]): new () => Omit<T, typeof keys[number]> => Class;


export class Linea {
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
    recogidaContinua?: number;
    bajadaContinua?: number;
    idRed?: string;
    paradas?: string[] | Parada[];
    viajes?: string[];
    bbox: number[];
    patrones?: PatronLinea[];
}

export class PatronLinea {
    de: string;
    a: string;
    direccion?: number;
    letrero?: string;
    paradas: string[];
    paradasObj?: Parada[];
    numViajes: number;
}

export class ShapePropiedadesVectoriales {
    idRecorrido: string;
    idLinea: string;
    idAgencia: string;
    nombreAgencia: string;
    nombreLargo?: string;
    nombreCorto?: string;
    orden?: number;
    tipo?: number;
    color?: string;
    colorTexto?: string;
    bbox: number[];
}