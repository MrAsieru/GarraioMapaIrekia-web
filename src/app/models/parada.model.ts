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
    lineas?: Array<string | Linea>;
    viajes?: string[];
    areas?: string[] | Area[];
    nivel?: Nivel;
    agencias?: string[];
}

export class Nivel {
    idNivel: string;
    indice: string;
    nombre?: string;
}

export class StopVectorProperties {
    idParada: string;
    nombre: string;
    idZona: string;
    tipo: number;
    paradaPadre: string;
    codigoPlataforma: string;
    agencias: string[];
}

export class HorarioParada {
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
    horario: Horario;
    paradas?: string[];
    frecuencias?: FrecuenciasViaje[];
    fechas?: Date[];
    zonaHoraria: string;
    linea?: Linea;
    tiempoRestante?: number; // en minutos
}

export class Horario {
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
    momentoLlegada?: moment.Moment;
    momentoSalida?: moment.Moment;
}

export class FrecuenciasViaje {
    horaInicio: string;
    horaFin: string;
    margen: number;
    exacto?: boolean;
}