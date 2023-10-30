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
}