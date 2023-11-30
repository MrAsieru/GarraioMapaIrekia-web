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
      // Guardar en mapa
      this.mapaTiempoReal.set(mensaje.idFeed, mensaje.mensajeFeed.entity);

      // Notificar suscriptores
      this.tiempoRealSubject.next({idFeed: mensaje.idFeed, entidades: mensaje.mensajeFeed.entity})
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

  public getInformacionVehiculoViaje(idFeed: string, descriptorViaje: transit_realtime.ITripDescriptor): transit_realtime.IVehiclePosition | undefined {
    const entidades = this.mapaTiempoReal.get(idFeed);
    if (!entidades) return undefined

    descriptorViaje = {...descriptorViaje};

    if (descriptorViaje.tripId) {
      descriptorViaje.tripId = descriptorViaje.tripId.split(/_(.*)/s)[1];
    }
    if (descriptorViaje.routeId) {
      descriptorViaje.routeId = descriptorViaje.routeId.split(/_(.*)/s)[1];
    }
    console.log(descriptorViaje)

    const busqueda = entidades.filter(entidad => {
      if (entidad.vehicle?.trip) {
        if (entidad.vehicle.trip.scheduleRelationship !== undefined && entidad.vehicle.trip.scheduleRelationship !== transit_realtime.TripDescriptor.ScheduleRelationship.SCHEDULED) return false;

        return this.mismoDescriptorViaje(descriptorViaje, entidad.vehicle.trip);
      }
      return false;
    });

    if (busqueda.length !== 1) return undefined;

    return busqueda[0].vehicle!;
  }

  public getInformacionActualizacionViaje(idFeed: string, descriptorViaje: transit_realtime.ITripDescriptor): transit_realtime.ITripUpdate | undefined {
    const entidades = this.mapaTiempoReal.get(idFeed);
    if (!entidades) return undefined

    descriptorViaje = {...descriptorViaje};

    if (descriptorViaje.tripId) {
      descriptorViaje.tripId = descriptorViaje.tripId.split(/_(.*)/s)[1];
    }
    if (descriptorViaje.routeId) {
      descriptorViaje.routeId = descriptorViaje.routeId.split(/_(.*)/s)[1];
    }
    console.log(descriptorViaje)

    const busqueda = entidades.filter(entidad => {
      if (entidad.tripUpdate?.trip) {
        if (entidad.tripUpdate.trip.scheduleRelationship !== undefined && entidad.tripUpdate.trip.scheduleRelationship !== transit_realtime.TripDescriptor.ScheduleRelationship.SCHEDULED) return false;

        return this.mismoDescriptorViaje(descriptorViaje, entidad.tripUpdate.trip);
      }
      return false;
    });

    if (busqueda.length !== 1) return undefined;

    return busqueda[0].tripUpdate!;
  }

  public getInformacionAlertas(idFeeds: Array<string>, selectorEntidad: transit_realtime.IEntitySelector): Array<transit_realtime.IAlert> | undefined {
    console.log(this.mapaTiempoReal)
    console.log(idFeeds)
    // Get entidades from idFeeds as keys of mapaTiempoReal
    let entidades: transit_realtime.IFeedEntity[] | undefined = [];
    idFeeds.forEach(idFeed => {
      if (this.mapaTiempoReal.has(idFeed)) {
        entidades = entidades!.concat(this.mapaTiempoReal.get(idFeed)!);
      }
    });
    if (!entidades) return undefined

    selectorEntidad = {...selectorEntidad};

    if (selectorEntidad.agencyId) {
      selectorEntidad.agencyId = selectorEntidad.agencyId.split(/_(.*)/s)[1];
    }
    if (selectorEntidad.routeId) {
      selectorEntidad.routeId = selectorEntidad.routeId.split(/_(.*)/s)[1];
    }
    if (selectorEntidad.trip) {
      if (selectorEntidad.trip.tripId) {
        selectorEntidad.trip.tripId = selectorEntidad.trip.tripId.split(/_(.*)/s)[1];
      }
      if (selectorEntidad.trip.routeId) {
        selectorEntidad.trip.routeId = selectorEntidad.trip.routeId.split(/_(.*)/s)[1];
      }
    }
    if (selectorEntidad.stopId) {
      selectorEntidad.stopId = selectorEntidad.stopId.split(/_(.*)/s)[1];
    }
    
    console.log(selectorEntidad)

    const busqueda = entidades.filter(entidad => {
      if (!entidad.alert || !entidad.alert.informedEntity) return false;

      return entidad.alert.informedEntity.some(informedEntity => {
        // Comprobar el selector es igual 
        return this.mismoSelectorEntidad(selectorEntidad, informedEntity);
      });
    });

    console.log(busqueda)
    return busqueda.map(entidad => entidad.alert!);
  }

  

  mismoSelectorEntidad(selector1: transit_realtime.IEntitySelector, selector2: transit_realtime.IEntitySelector): boolean {
    const fieldNames: Array<keyof transit_realtime.IEntitySelector> = [
      'agencyId',
      'routeId',
      'routeType',
      'directionId',
      'trip',
      'stopId'
    ];
  
    // Recorrer todos los campos del selector
    let cont = 0;
    for (const fieldName of fieldNames) {  
      // Si alguno de los valores es undefined, pasar al siguiente campo
      if (!selector1[fieldName] || !selector2[fieldName]) {
        cont++;
        continue;
      }
  
      // Si los valores no son iguales, los descriptores son diferentes
      if (fieldName === 'trip') {    
        if (!this.mismoDescriptorViaje(selector1[fieldName] as transit_realtime.ITripDescriptor, selector2[fieldName] as transit_realtime.ITripDescriptor)) {
          return false;
        }
      } else if (selector1[fieldName] !== selector2[fieldName]) {
        return false;
      }
    }
  
    // Si todos los campos especificados son iguales, los descriptores son iguales
    return cont < fieldNames.length;
  }

  mismoDescriptorViaje(descriptor1: transit_realtime.ITripDescriptor, descriptor2: transit_realtime.ITripDescriptor): boolean {
    const tripFieldNames: Array<keyof transit_realtime.ITripDescriptor> = [
      'tripId',
      'routeId',
      'directionId',
      'startTime',
      'startDate',
      'scheduleRelationship'
    ];
  
    // Recorrer todos los campos del descriptor
    for (const fieldName of tripFieldNames) {  
      // Si alguno de los valores es undefined, pasar al siguiente campo
      if (!descriptor1[fieldName] || !descriptor2[fieldName]) {
        continue;
      }
  
      // Si los valores no son iguales, los descriptores son diferentes
      if (descriptor1[fieldName] !== descriptor2[fieldName]) {
        return false;
      }
    }
  
    // Si todos los campos especificados son iguales, los descriptores son iguales
    return true;
  }
}
