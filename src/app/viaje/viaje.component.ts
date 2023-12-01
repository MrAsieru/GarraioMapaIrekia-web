import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { DatetimeHighlight } from '@ionic/core';
import { IonPopover, IonicModule, ModalController } from '@ionic/angular';
import { LateralComponent } from '../lateral/lateral.component';
import { Linea, PatronLinea } from '../models/linea.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LineasService } from '../services/lineas.service';
import { MapaService } from '../services/mapa.service';
import { HorarioViaje, Viaje } from '../models/viaje.model';
import { ViajesService } from '../services/viajes.service';
import * as moment from 'moment-timezone';
import { MomentPipe } from "../moment/moment.pipe";
import { Agencia } from '../models/agencia.model';
import { AgenciasService } from '../services/agencias.service';
import { TiempoRealService } from '../services/tiemporeal.service';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ModalAlertasComponent } from '../modal-alertas/modal-alertas.component';
import { NavegacionService } from '../services/navegacion.service';

@Component({
    selector: 'app-viaje',
    templateUrl: './viaje.component.html',
    styleUrls: ['./viaje.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, LateralComponent, MomentPipe]
})
export class ViajeComponent  implements OnInit {
  @Inject(LOCALE_ID) public locale: string
  @ViewChild(IonPopover) popoverPatrones: IonPopover;
  idViaje: string | null;
  viaje: Viaje | undefined;
  linea: Linea | undefined;
  agencia: Agencia | undefined;
  letreros: string[] = [];
  calendario: {
    fechas?: DatetimeHighlight[],
    fechaMin?: string,
    fechaMax?: string,
  } = {};

  primeraCarga: boolean = true;
  momentoActualizacion: moment.Moment | undefined = undefined;
  vehiculoTiempoReal: transit_realtime.IVehiclePosition | undefined;
  viajeTiempoReal: transit_realtime.ITripUpdate | undefined;
  alertasTiempoReal: Array<transit_realtime.IAlert> = [];

  tripScheduleRelationshipEnum = transit_realtime.TripDescriptor.ScheduleRelationship;
  stopScheduleRelationshipEnum = transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship;
  vehicleStopStatusEnum = transit_realtime.VehiclePosition.VehicleStopStatus;
  congestionLevelEnum = transit_realtime.VehiclePosition.CongestionLevel;
  occupancyStatusEnum = transit_realtime.VehiclePosition.OccupancyStatus;

  suscripcionTiempoReal: Subscription | undefined;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private viajesService: ViajesService,
    private lineasService: LineasService,
    private agenciasService: AgenciasService,
    private mapaService: MapaService,
    private tiempoRealService: TiempoRealService,
    private modalCtrl: ModalController,
    private navegacionService: NavegacionService) { }
    
  ngOnInit() {
    this.idViaje = this.route.snapshot.paramMap.get('idViaje');

    document.body.style.setProperty('--color-linea', '#FFFFFF');
    document.body.style.setProperty('--actual', '#FFC107');

    if (this.idViaje) {
      this.viajesService.getViaje(this.idViaje, {incluirHorarios: true, incluirFechas: true, incluirFrecuencias: true}).subscribe(viaje => {
        this.viaje = viaje;
        this.viaje.horarios?.sort((a, b) => a.orden - b.orden);

        this.lineasService.getLinea(viaje.idLinea).subscribe(linea => {
          this.linea = linea;

          if (linea.color) {
            document.body.style.setProperty('--color-linea', linea.color);
          } else {
            document.body.style.setProperty('--color-linea', '#000000');
          }
        });

        this.agenciasService.getAgencia(viaje.idAgencia).subscribe(agencia => {
          this.agencia = agencia;
        });

        if (viaje.letrero === undefined || viaje.letrero === "") {
          this.viaje.letrero = viaje.horarios?.find(horario => horario.letrero)?.letrero;
        }
        this.letreros = (viaje.horarios ?? []).filter((horario) => horario.letrero !== undefined && horario.letrero !== "").map(horario => horario.letrero!).filter((letrero, index, letreros) => letreros.indexOf(letrero) === index);

        this.mapaService.setAjusteMapa({
          bbox: viaje.bbox
        });

        viaje.horarios?.forEach(horario => {
          if (horario.horaLlegada) {
            let [horas, minutos, segundos] = (horario.horaLlegada as string).split(':').map(Number);
            horario.momentoLlegada = moment().startOf('day').add(horas, 'hours').add(minutos, 'minutes').add(segundos, 'seconds');
          }
          if (horario.horaSalida) {
            let [horas, minutos, segundos] = (horario.horaSalida as string).split(':').map(Number);
            horario.momentoSalida = moment().startOf('day').add(horas, 'hours').add(minutos, 'minutes').add(segundos, 'seconds');
          }

          if(horario.horaSalida) {
            horario.tiempoRestante = (horario.momentoSalida as moment.Moment).diff(moment(), 'minutes');
          } else {
            horario.tiempoRestante = (horario.momentoLlegada as moment.Moment).diff(moment(), 'minutes');
          }
        });

        this.viajesService.getParadasViaje(viaje.idViaje).subscribe(paradas => {
          this.mapaService.setFiltrarMapa({
            paradas: paradas.map(parada => parada.idParada),
            viajes: [viaje.idViaje],
            recorridos: viaje.idRecorrido ? [viaje.idRecorrido] : undefined
          });

          paradas.forEach(parada => {
            let horario = viaje.horarios?.find(horario => horario.idParada == parada.idParada);
            if (horario) horario.paradaObj = parada;
          });
        });

        if (viaje.fechas) {
          this.calendario.fechas = viaje.fechas.map(fecha => ({
            date: moment(fecha).format('YYYY-MM-DD'),
            textColor: "#333333",
            backgroundColor: "#77DD77"
          }));
          this.calendario.fechas.sort((a, b) => a.date.localeCompare(b.date));
          this.calendario.fechaMin = this.calendario.fechas[0].date;
          this.calendario.fechaMax = this.calendario.fechas[viaje.fechas.length - 1].date;
          // console.log(this.calendario);
        }

        this.actualizarTiempos();
        this.actualizarPosicion();
        setInterval(() => {
          this.actualizarTiempos();
          this.actualizarPosicion();
        }, 60000);

        
        this.suscripcionTiempoReal = this.tiempoRealService.tiempoReal.subscribe((tiempoReal) => {
          if (this.primeraCarga || tiempoReal?.idFeed === this.viaje!.idViaje.split("_")[0]) {
            this.primeraCarga = false;
            this.actualizarTiempoReal();
          }          
        });
      });
    }
  }

  actualizarTiempos() {   
    this.viaje?.horarios?.forEach(horario => {
      // Actualizar tiempos
      if (horario.horaLlegada) {
        let [horas, minutos, segundos] = (horario.horaLlegada as string).split(':').map(Number);
        horario.momentoLlegada = moment().startOf('day').add(horas, 'hours').add(minutos, 'minutes').add(segundos, 'seconds');
      }
      if (horario.horaSalida) {
        let [horas, minutos, segundos] = (horario.horaSalida as string).split(':').map(Number);
        horario.momentoSalida = moment().startOf('day').add(horas, 'hours').add(minutos, 'minutes').add(segundos, 'seconds');
      }

      if(horario.horaSalida) {
        horario.tiempoRestante = (horario.momentoSalida as moment.Moment).diff(moment(), 'minutes');
      } else {
        horario.tiempoRestante = (horario.momentoLlegada as moment.Moment).diff(moment(), 'minutes');
      }
    });
  }

  actualizarPosicion() {
    if (this.vehiculoTiempoReal?.currentStopSequence && this.vehiculoTiempoReal?.currentStopSequence >= 0) {
      // console.log(`orden: ${this.vehiculoTiempoReal?.currentStopSequence}`)

      this.viaje?.horarios?.forEach(horario => {
        if (horario.orden < this.vehiculoTiempoReal?.currentStopSequence!) {
          horario.claseElemento = 'pasada';
        } else if (horario.orden == this.vehiculoTiempoReal?.currentStopSequence) {
          horario.claseElemento = 'actual';
        } else {
          horario.claseElemento = 'futura';
        }          
      });
    } else if (this.viaje?.horarios) {
      const ahora = moment();
      let orden = -1;
      // console.log(this.viaje.horarios)
      // console.log(ahora)
      for (let i = 0; i < this.viaje.horarios.length; i++) {
        // console.log(i)
        const horarioAnterior: HorarioViaje | undefined = (i > 0) ? this.viaje.horarios[i-1] : undefined;
        const horario: HorarioViaje = this.viaje.horarios[i];

        // A: h[i].LL < ahora < h[i].Sa
        // B: h[i-1].(Sa|LL) < ahora
        // C: h[i-1].(!Sa|!LL)
        // D: ahora < h[i].(Sa|LL)
        // A || ((B || C) && D)
        if ((horario.momentoLlegada && horario.momentoSalida && horario.momentoLlegada.isBefore(ahora) && ahora.isBefore(horario.momentoSalida))
          || (horarioAnterior 
            && (((horarioAnterior?.momentoLlegada || horarioAnterior?.momentoSalida) && (horarioAnterior?.momentoSalida ?? horarioAnterior?.momentoLlegada)!.isBefore(ahora)) || (!horarioAnterior?.momentoLlegada && !horarioAnterior?.momentoSalida))
            && ((horario.momentoLlegada || horario.momentoSalida) && ahora.isBefore((horario.momentoLlegada ?? horario.momentoSalida)!)))
          ) {
          orden = horario.orden;
          break;
        }        
      }

      if (orden === -1) {
        if (ahora.isBefore(this.viaje.horarios[0].momentoLlegada!)) orden = this.viaje.horarios[0].orden;
        else orden = this.viaje.horarios[this.viaje.horarios.length - 1].orden;
      }

      // console.log(`orden: ${orden}`)

      this.viaje.horarios?.forEach(horario => {
        if (horario.orden < orden) {
          horario.claseElemento = 'pasada';
        } else if (horario.orden == orden) {
          horario.claseElemento = 'actual';
        } else {
          horario.claseElemento = 'futura';
        }          
      });
    }    
  }

  actualizarTiempoReal() {
    let tmpVehiculo = this.tiempoRealService.getInformacionVehiculoViaje(this.viaje!.idViaje.split("_")[0], {
      tripId: this.viaje!.idViaje,
      routeId: this.viaje!.idLinea,
      directionId: this.viaje!.direccion
    });  
    // console.log(tmpVehiculo)
    if (tmpVehiculo) {
      this.vehiculoTiempoReal = tmpVehiculo;
      this.momentoActualizacion = moment();
      this.actualizarPosicion();

      if (this.vehiculoTiempoReal.position?.latitude && this.vehiculoTiempoReal.position?.longitude) {
        this.mapaService.setMovimientoMapa({
          latitud: this.vehiculoTiempoReal.position?.latitude ?? 0,
          longitud: this.vehiculoTiempoReal.position?.longitude ?? 0,
          zoom: 13
        });
      }      
    }

    let tmpViaje = this.tiempoRealService.getInformacionActualizacionViaje(this.viaje!.idViaje.split("_")[0], {
      tripId: this.viaje!.idViaje,
      routeId: this.viaje!.idLinea,
      directionId: this.viaje!.direccion
    });  
    // console.log(tmpViaje)
    if (tmpViaje) {
      this.viajeTiempoReal = tmpViaje;
      this.momentoActualizacion = moment();

      if (this.viajeTiempoReal?.stopTimeUpdate && this.viajeTiempoReal?.stopTimeUpdate?.length > 0) {
        this.viajeTiempoReal.stopTimeUpdate.forEach(stopTimeUpdate => {
          this.viaje?.horarios?.forEach(horario => {
            if (horario.idParada.split(/_(.*)/s)[1] == stopTimeUpdate.stopId) {
              horario.tiempoReal = stopTimeUpdate;
              if (stopTimeUpdate.arrival?.time) {
                horario.momentoLlegadaTiempoReal = moment.unix((stopTimeUpdate.arrival?.time as number));
              } else if (stopTimeUpdate.arrival?.delay) {
                horario.momentoLlegadaTiempoReal = horario.momentoLlegada?.clone().add(stopTimeUpdate.arrival?.delay, 'seconds');
              }

              if (stopTimeUpdate.departure?.time) {
                horario.momentoSalidaTiempoReal = moment.unix((stopTimeUpdate.departure?.time as number));
              } else if (stopTimeUpdate.departure?.delay) {
                horario.momentoSalidaTiempoReal = horario.momentoSalida?.clone().add(stopTimeUpdate.departure?.delay, 'seconds');
              }

              
              if (horario.momentoLlegadaTiempoReal) {
                horario.retrasoLlegadaTiempoReal = horario.momentoLlegadaTiempoReal.diff(horario.momentoLlegada, 'seconds');
              }
              if (horario.momentoSalidaTiempoReal) {
                horario.retrasoSalidaTiempoReal = horario.momentoSalidaTiempoReal.diff(horario.momentoSalida, 'seconds');
              }
              if (horario.retrasoLlegadaTiempoReal && horario.retrasoSalidaTiempoReal) {
                horario.retrasoTiempoReal = Math.max(horario.retrasoLlegadaTiempoReal, horario.retrasoSalidaTiempoReal);
              }
              // console.log(horario)
            }
          });
        });
      } 
    }

    let tmpAlertasLinea = this.tiempoRealService.getInformacionAlertas([this.viaje!.idAgencia.split("_")[0]], {
      trip: {
        tripId: this.viaje!.idViaje,
        routeId: this.viaje!.idLinea,
        directionId: this.viaje!.direccion
      }
    });
    // console.log(tmpAlertasLinea);
    if (tmpAlertasLinea) {
      this.alertasTiempoReal = tmpAlertasLinea; 
    }
  }

  async mostrarModalAlertas() {
    if (this.alertasTiempoReal.length > 0) {
      let datosModal = new BehaviorSubject<Array<transit_realtime.IAlert>>(this.alertasTiempoReal);
      const modal = await this.modalCtrl.create({
        id: 'modal-alertas',
        component: ModalAlertasComponent,
        backdropDismiss: true,
        componentProps: { alertas: datosModal.asObservable() }
      });
      modal.present();
    }
  }

  ngOnDestroy() {
    this.suscripcionTiempoReal?.unsubscribe();
    this.mapaService.setFiltrarMapa({});
  }

  abrirUrl(url: string) {
    window.open(url, '_blank');
  }

  navegarA(ruta: string[]) {
    this.navegacionService.navegarA(ruta, this.route);
  }
}
