export class Viaje {
    idAgencia: string;
    idViaje: string;
    idLinea: string;
    idServicio: string;
    letrero?: string;
    nombre?: string;
    direccion?: number;
    idBloque?: string;
    idRecorrido?: string;
    accesibilidad?: number;
    bicicletas?: number;
    horarios?: HorarioViaje[];
    paradas?: string[];
    frecuencias?: FrecuenciasViaje[];
    fechas?: Date[];
}

export class HorarioViaje {
    idParada: string;
    horaLlegada?: string;
    horaSalida?: string;
    orden: number;
    letrero?: string;
    tipoRecogida?: number;
    tipoBajada?: number;
    recogidaContinua?: boolean;
    bajadaContinua?: boolean;
    distanciaRecorrida?: number;
    exacto?: boolean;
}

export class FrecuenciasViaje {
    horaInicio: string;
    horaFin: string;
    margen: number;
    exacto?: boolean;
}