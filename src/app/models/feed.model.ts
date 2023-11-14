export class Feed {
    idFeed: string;
    info?: FeedInfo;
    atribuciones?: FeedAtribucion;
    tiempoReal?: string[];
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
}