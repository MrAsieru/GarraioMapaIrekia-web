import { Linea } from "./linea.model";

export class Agencia {
    idAgencia: string;
    nombre: string;
    url: string;
    zonaHoraria: string;
    idioma?: string;
    telefono?: string;
    urlTarifa?: string;
    email?: string;
    lineas?: string[] | Linea[];
    bbox: number[];
    mostrar: boolean = true;
}

export class AgencyRoutes extends Agencia {
    override lineas: Linea[];
}