import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TiempoRealMensaje } from '../models/tiemporeal.model';
import { transit_realtime } from 'gtfs-realtime-bindings';

@Injectable({
  providedIn: 'root'
})

export class TiempoRealService {
  public baseUrl: string = environment.websocketBaseUrl+"/tiempoReal";
  private socket: WebSocket;

  private tiempoRealSubject = new BehaviorSubject<{idFeed: string, entidades: transit_realtime.IFeedEntity[]} | undefined>(undefined);
  tiempoReal = this.tiempoRealSubject.asObservable();

  mapaTiempoReal: Map<string, transit_realtime.IFeedEntity[]> = new Map();

  constructor() {
    this.socket = new WebSocket(this.baseUrl);
    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = () => {
      this.socket.send(JSON.stringify([]))
    }
    this.socket.onmessage = (event) => this.guardarTiempoReal(event);
  }

  private guardarTiempoReal(event: MessageEvent<ArrayBuffer>) {
    const mensaje = this.leerMensajeWebsocket(event.data);

    if (mensaje.mensajeFeed.entity) {
      // Notificar suscriptores
      this.tiempoRealSubject.next({idFeed: mensaje.idFeed, entidades: mensaje.mensajeFeed.entity})

      // Guardar en mapa
      this.mapaTiempoReal.set(mensaje.idFeed, mensaje.mensajeFeed.entity);
    }
  }

  private leerMensajeWebsocket(data: ArrayBuffer): TiempoRealMensaje {
    // Formato de mensaje binario: [Longitud idFeed (2 Bytes)][idFeed (x Bytes)][Protobuf (y Bytes)]
    const view = new DataView(data);
    const idFeedLon = view.getUint16(0);

    // Conseguir el valor string idFeed segun longitud idFeedLon
    const idFeed = new TextDecoder().decode(data.slice(2, 2 + idFeedLon));
    console.log(`idFeed: ${idFeed}`);

    // Conseguir FeedMessage
    const protobuf = data.slice(2 + idFeedLon);
    const mensaje = transit_realtime.FeedMessage.decode(new Uint8Array(protobuf));

    return new TiempoRealMensaje(idFeed, mensaje);
  }

  public actualizar_feeds(listaFeeds: string[]) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(listaFeeds));
    }
  }
}
