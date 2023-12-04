import { Agencia } from "./agencia.model";
import { Linea } from "./linea.model";
import { Viaje } from "./viaje.model";

export class Feed {
    idFeed: string;
    nombre: string;
    fuentes?: FeedFuente[];
    info?: FeedInfo;
    atribuciones?: FeedAtribucion[];
    agencias?: FeedAtribucionNombre[];
    lineas?: FeedAtribucionNombre[];
    viajes?: FeedAtribucionNombre[];
}

export class FeedFuente {
    tipo: string;
    atribucion: string;
    urlAtribucion: string;
    url?: string;
    conjuntoDatoId?: number;
}

export class FeedInfo {
    nombreEditor: string;
    urlEditor: string;
    idioma: string;
    idiomaPredeterminado?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    version?: string;
    email?: string;
    urlContacto?: string;
}

export class FeedAtribucion {
    idAtribucion?: string;
    idAgencia?: string;
    idLinea?: string;
    idViaje?: string;
    nombreOrganizacion: string;
    esProductor?: Boolean;
    esOperador?: Boolean;
    esAutoridad?: Boolean;
    url?: string;
    email?: string;
    telefono?: string;

    nombre?: FeedAtribucionNombre;
}

export class FeedAtribucionNombre {
    id: string;
    nombre?: string;
    nombreCorto?: string;
    nombreLargo?: string;
}