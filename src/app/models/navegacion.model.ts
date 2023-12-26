export class PeticionNavegacion {
    fecha?: string; // YYYY-MM-DD
    hora?: string; // hh:mm:ss
    origen: Coordenadas;
    destino: Coordenadas;
    accesibleSillaDeRuedas?: boolean;
    respuestaMaxItinerarios?: number;
    cursorPagina?: string;
    llegada?: boolean;
    locale?: string;
}

export class Coordenadas {
    lat: number;
    lon: number;
}

export class RespuestaNavegacion {
    data: {
        plan: PlanNavegacion
    }    
}

export class PlanNavegacion {
    date?: number; // Timestamp (ms)
    from: {
        name?: string;
        lat: number;
        lon: number;
    }
    to: {
        name?: string;
        lat: number;
        lon: number;
    }
    itineraries: Trayecto[];
    nextPageCursor?: string;
}

export class Trayecto {
    startTime?: number; // Timestamp (ms)
    endTime?: number; // Timestamp (ms)
    duration?: number; // Segundos
    waitingTime?: number; // Segundos
    walkTime?: number; // Segundos
    walkDistance?: number; // Metros
    legs: {
        startTime?: number; // Timestamp (ms)
        endTime?: number; // Timestamp (ms)
        departureDelay?: number; // Segundos
        arrivalDelay?: number; // Segundos
        mode?: string;
        duration?: number; // Segundos
        legGeometry?: {
            length?: number;
            points?: string; // Google polyline
        }
        agency?: {
            gtfsId: string;
            name: string;
        }
        realTime?: boolean;
        realtimeState?: string;
        distance?: number; // Metros
        transitLeg?: boolean;
        walkingBike?: boolean;
        from: {
            name?: string;
            lat: number;
            lon: number;
            arrivalTime: number; // Timestamp (ms)
            departureTime: number; // Timestamp (ms)
        }
        to: {
            name?: string;
            lat: number;
            lon: number;
            arrivalTime: number; // Timestamp (ms)
            departureTime: number; // Timestamp (ms)
        }
        route?: {
            gtfsId: string;
            shortName?: string;
            longName?: string;
            mode?: string;
            type?: string;
            color?: string;
            textColor?: string;
            bikesAllowed?: string;
        }
        trip?: {
            gtfsId: string;
            tripShortName?: string;
            tripHeadsign?: string;
            shapeId?: string;
            wheelchairAccessible?: string;
            bikesAllowed?: string;
        }
        intermediatePlaces?: {
            name?: string;
            lat: number;
            lon: number;
            arrivalTime?: number;
            departureTime?: number;
        }[]
        intermediatePlace?: boolean;
        steps?: {
            distance?: number; // Metros
            relativeDirection?: string;
            streetName?: string;
            stayOn?: boolean;
            bogusName?: boolean;
        }[]
        headsign?: string;
        pickupType?: string;
        dropoffType?: string;
    }[]
    accessibilityScore?: number;
    numberOfTransfers: number;
    fares?: {
        type: string;
        currency: string;
        cents: number;
    }[]
}