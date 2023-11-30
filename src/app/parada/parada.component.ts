import { Component, OnDestroy, OnInit } from '@angular/core';
import { LateralComponent } from '../lateral/lateral.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Parada, ViajeParada } from '../models/parada.model';
import { ParadasService } from '../services/paradas.service';
import { MapaService } from '../services/mapa.service';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { LineasService } from '../services/lineas.service';
import * as moment from 'moment-timezone';
import { MomentPipe } from '../moment/moment.pipe';
import { Agencia } from '../models/agencia.model';
import { AgenciasService } from '../services/agencias.service';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { TiempoRealService } from '../services/tiemporeal.service';
import { BehaviorSubject } from 'rxjs';
import { ModalAlertasComponent } from '../modal-alertas/modal-alertas.component';

@Component({
  selector: 'app-parada',
  templateUrl: './parada.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, LateralComponent, MomentPipe]
})
export class ParadaComponent  implements OnInit, OnDestroy {
  idParada: string | null;
  parada: Parada = new Parada();
  viajes: ViajeParada[] = [];
  agencias: Agencia[] = [];

  primeraCarga: boolean = true;
  alertasTiempoReal: Array<transit_realtime.IAlert> = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private paradasService: ParadasService,
    private mapaService: MapaService,
    private lineasService: LineasService,
    private agenciasService: AgenciasService,
    private tiempoRealService: TiempoRealService,
    private modalCtrl: ModalController) { }

  ngOnInit() {
    this.idParada = this.route.snapshot.paramMap.get('idParada');

    if (this.idParada) {
      this.paradasService.getParada(this.idParada, {incluirLineas: true, incluirViajes: true}).subscribe(parada => {
        this.parada = parada;

        if (parada.paradaPadre) {
          this.navegarA(['../', parada.paradaPadre])
        } else {
          this.mapaService.setFiltrarMapa({
            paradas: [parada.idParada],
            lineas: (parada.lineas as string[]),
            viajes: (parada.viajes as string[])
          });
  
          this.mapaService.setMovimientoMapa({
            latitud: parada.posicionLatitud,
            longitud: parada.posicionLongitud,
            zoom: 17
          });
          
          this.paradasService.getAgenciasParada(parada.idParada).subscribe(agencias => {
            agencias.sort((a, b) => a.nombre!.localeCompare(b.nombre!));
            this.agencias = agencias;

            // Obtener alertas
            let selectorEntidadParada: transit_realtime.IEntitySelector = {
              stopId: parada.idParada
            };
            this.tiempoRealService.tiempoReal.subscribe((tiempoReal) => {
              if (this.primeraCarga || agencias.some(agencia => agencia.idAgencia.split("_")[0] === tiempoReal?.idFeed)) {
                this.primeraCarga = false;

                let tmpAlertasParada = this.tiempoRealService.getInformacionAlertas(Array.from(new Set(agencias.map(agencia => agencia.idAgencia.split("_")[0]))), selectorEntidadParada);
                console.log(tmpAlertasParada);
                if (tmpAlertasParada) {
                  this.alertasTiempoReal = tmpAlertasParada; 
                }
              }          
            });
          });
          

          this.paradasService.getHorariosParada(parada.idParada).subscribe(viajes => {
            new Set(viajes.map(viaje => viaje.idLinea)).forEach(idLinea => {
              this.lineasService.getLinea(idLinea).subscribe(linea => {
                viajes.filter(viaje => viaje.idLinea == idLinea).forEach(viaje => viaje.linea = linea);
              });
            });

            viajes.forEach(viaje => {
              if (viaje.horario.horaLlegada) {
                let [horas, minutos, segundos] = (viaje.horario.horaLlegada as string).split(':').map(Number);
                viaje.horario.momentoLlegada = moment().startOf('day').add(horas, 'hours').add(minutos, 'minutes').add(segundos, 'seconds');
              }
              if (viaje.horario.horaSalida) {
                let [horas, minutos, segundos] = (viaje.horario.horaSalida as string).split(':').map(Number);
                viaje.horario.momentoSalida = moment().startOf('day').add(horas, 'hours').add(minutos, 'minutes').add(segundos, 'seconds');
              }

              if(viaje.horario.horaSalida) {
                viaje.tiempoRestante = (viaje.horario.momentoSalida as moment.Moment).diff(moment(), 'minutes');
              } else {
                viaje.tiempoRestante = (viaje.horario.momentoLlegada as moment.Moment).diff(moment(), 'minutes');
              }

              if (viaje.letrero === undefined || viaje.letrero === "") {
                viaje.letrero = viaje.horario.letrero;
              }
            });
            this.viajes = viajes.sort((a, b) => a.tiempoRestante! - b.tiempoRestante!);
          });
        }        
      });
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
    this.mapaService.setFiltrarMapa({});
  }

  navegarA(ruta: string[]) {
    this.router.navigate(ruta, {relativeTo: this.route});
  }
}
