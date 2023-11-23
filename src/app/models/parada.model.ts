import { Area } from "./area.model";
import { Linea } from "./linea.model";
import { HorarioViaje, Viaje } from "./viaje.model";

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

export class ViajeParada extends Viaje {
    horario: HorarioParada;
    zonaHoraria: string;
    linea?: Linea;
    tiempoRestante?: number; // en minutos
}

export class HorarioParada extends HorarioViaje {
    momentoLlegada?: moment.Moment;
    momentoSalida?: moment.Moment;
}