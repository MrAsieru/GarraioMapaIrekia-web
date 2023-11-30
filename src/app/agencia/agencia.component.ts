import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { LateralComponent } from '../lateral/lateral.component';
import { Agencia } from '../models/agencia.model';
import { AgenciasService } from '../services/agencias.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MapaService } from '../services/mapa.service';
import { Linea } from '../models/linea.model';
import { LineasService } from '../services/lineas.service';
import { TiempoRealService } from '../services/tiemporeal.service';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ModalAlertasComponent } from '../modal-alertas/modal-alertas.component';
import { NavegacionService } from '../services/navegacion.service';

@Component({
    selector: 'app-agencia',
    templateUrl: './agencia.component.html',
    standalone: true,
    imports: [IonicModule, CommonModule, LateralComponent]
})
export class AgenciaComponent  implements OnInit {
  idAgencia: string | null;
  agencia: Agencia = new Agencia();
  lineas: Linea[] = [];

  primeraCarga: boolean = true;
  alertasTiempoReal: Array<transit_realtime.IAlert> = [];

  suscripcionTiempoReal: Subscription | undefined;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private agenciasService: AgenciasService,
    private mapaService: MapaService,
    private lineasService: LineasService,
    private tiempoRealService: TiempoRealService,
    private modalCtrl: ModalController,
    private navegacionService: NavegacionService) { }

  ngOnInit() {
    this.idAgencia = this.route.snapshot.paramMap.get('idAgencia');

    if (this.idAgencia) {
      this.agenciasService.getAgencia(this.idAgencia).subscribe(agencia => {
        this.agencia = agencia;

        this.mapaService.setAjusteMapa({
          bbox: agencia.bbox
        });

        this.mapaService.setFiltrarMapa({
          agencias: [agencia.idAgencia]
        });

        this.agenciasService.getLineasAgencia(agencia.idAgencia).subscribe(lineas => {
          const exiteOrden = lineas.every(linea => linea.orden !== undefined);
          if (exiteOrden) {
            lineas.sort((a, b) => (a.orden as number) - (b.orden as number));
          } else {
            lineas.sort((a, b) => (a.nombreCorto ?? a.nombreLargo)!.localeCompare((b.nombreCorto ?? b.nombreLargo)!));
          }

          this.lineas = [...lineas];

          // Comprobar colores
          lineas.forEach(linea => {
            if (linea.color && linea.colorTexto && linea.color === linea.colorTexto) {
              // Conseguir valores RGB
              const r = parseInt(linea.color.substring(1, 3), 16);
              const g = parseInt(linea.color.substring(3, 5), 16);
              const b = parseInt(linea.color.substring(5, 7), 16);

              if ((r*0.299 + g*0.587 + b*0.114) > 186) {
                linea.colorTexto = '#000000';
              } else {
                linea.colorTexto = '#FFFFFF';
              }
            }
          });
        });

        // Obtener alertas
        let selectorEntidadAgencia: transit_realtime.IEntitySelector = {
          agencyId: agencia.idAgencia
        };
        
        this.suscripcionTiempoReal = this.tiempoRealService.tiempoReal.subscribe((tiempoReal) => {
          if (this.primeraCarga || tiempoReal?.idFeed === agencia.idAgencia.split("_")[0]) {
            this.primeraCarga = false;

            let tmpAlertasAgencia = this.tiempoRealService.getInformacionAlertas([agencia.idAgencia.split("_")[0]], selectorEntidadAgencia);
            console.log(tmpAlertasAgencia);
            if (tmpAlertasAgencia) {
              this.alertasTiempoReal = tmpAlertasAgencia; 
            }
          }          
        });
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
