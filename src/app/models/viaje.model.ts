import { Linea } from "./linea.model";
import { Parada } from "./parada.model";

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
    bbox: number[];
}

export class HorarioViaje {
    idParada: string;
    horaLlegada?: string;
    horaSalida?: string;
    orden: number;
    letrero?: string;
    tipoRecogida?: number;
    tipoBajada?: number;
    recogidaContinua?: number;
    bajadaContinua?: number;
    distanciaRecorrida?: number;
    exacto?: boolean;

    paradaObj?: Parada;
    momentoLlegada?: moment.Moment;
    momentoSalida?: moment.Moment;
    tiempoRestante?: number;
    claseElemento?: string;
}

export class FrecuenciasViaje {
    horaInicio: string;
    horaFin: string;
    margen: number;
    exacto?: boolean;
}