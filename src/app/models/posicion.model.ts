export class PosicionRespuesta {
    fecha: Date;
    agencias: PosicionRespuestaAgencia[];
}

export class PosicionRespuestaAgencia {
    idAgencia: string;
    viajes: PosicionRespuestaViaje[];
}

export class PosicionRespuestaViaje {
    idViaje: string;
    idLinea: string;
    tipo?: number; //TODO: Quitar ?
    posiciones: string;
}

export class PosicionesViajes {
    [key: string]: PosicionesFechas; // key: idViaje
}

export class PosicionesFechas {
    [key: string]: Posicion // key: fecha (ISO 8601)
}

export class Posicion {
    lat: number;
    lon: number;
}