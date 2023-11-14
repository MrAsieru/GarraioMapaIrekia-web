import { transit_realtime } from "gtfs-realtime-bindings";

export class TiempoRealMensaje {
    idFeed: string;
    mensajeFeed: transit_realtime.IFeedMessage;

    constructor(idFeed: string, mensajeFeed: transit_realtime.IFeedMessage) {
        this.idFeed = idFeed;
        this.mensajeFeed = mensajeFeed;
    }
}