import { Route } from "./route.model";

export class Agency {
    agency_id: string;
    name: string;
    url: string;
    timezone: string;
    lang?: string;
    phone?: string;
    fare_url?: string;
    email?: string;
    mostrar: boolean = true;
}

export class AgencyRoutes extends Agency {
    routes: Route[];
}