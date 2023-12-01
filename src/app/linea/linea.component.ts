import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LateralComponent } from '../lateral/lateral.component';
import { Linea, PatronLinea } from '../models/linea.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MapaService } from '../services/mapa.service';
import { LineasService } from '../services/lineas.service';
import { IonPopover, IonicModule, ModalController } from '@ionic/angular';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { TiempoRealService } from '../services/tiemporeal.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ModalAlertasComponent } from '../modal-alertas/modal-alertas.component';
import { AgenciasService } from '../services/agencias.service';
import { Agencia } from '../models/agencia.model';
import { NavegacionService } from '../services/navegacion.service';

@Component({
  selector: 'app-linea',
  templateUrl: './linea.component.html',
  styleUrls: ['./linea.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, LateralComponent]
})
export class LineaComponent  implements OnInit {
  @ViewChild(IonPopover) popoverPatrones: IonPopover;
  idLinea: string | null;
  linea: Linea = new Linea();
  agencia: Agencia | undefined;
  patrones: PatronLinea[] = [];
  patronSeleccionado: PatronLinea | undefined = undefined;

  primeraCarga: boolean = true;
  alertasTiempoReal: Array<transit_realtime.IAlert> = [];

  suscripcionTiempoReal: Subscription | undefined;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private lineasService: LineasService,
    private mapaService: MapaService,
    private tiempoRealService: TiempoRealService,
    private agenciasService: AgenciasService,
    private modalCtrl: ModalController,
    private navegacionService: NavegacionService) { }

  ngOnInit() {
    this.idLinea = this.route.snapshot.paramMap.get('idLinea');

    if (this.idLinea) {
      this.lineasService.getLinea(this.idLinea).subscribe(linea => {
        this.linea = linea;

        if (linea.color) {
          document.body.style.setProperty('--actual', linea.color);
        }        

        this.mapaService.setFiltrarMapa({
          paradas: (linea.paradas as string[]),
          lineas: [linea.idLinea]
        });

        this.mapaService.setAjusteMapa({
          bbox: linea.bbox
        });

        this.lineasService.getParadasLinea(linea.idLinea).subscribe(paradas => {
          this.lineasService.getPatronesLinea(linea.idLinea).subscribe(patrones => {
            this.patrones = patrones.sort((a, b) => b.numViajes - a.numViajes);
            // console.log(this.patrones);
            this.seleccionarPatron(0);
            this.patrones.forEach(patron => {
              patron.paradasObj = patron.paradas.map(idParada => paradas.find(parada => parada.idParada == idParada)!);
            });
          });
        });

        this.agenciasService.getAgencia(linea.idAgencia).subscribe(agencia => {
          this.agencia = agencia;
        });

        // Obtener alertas
        let selectorEntidadLinea: transit_realtime.IEntitySelector = {
          routeId: linea.idLinea
        };
        this.suscripcionTiempoReal = this.tiempoRealService.tiempoReal.subscribe((tiempoReal) => {
          if (this.primeraCarga || tiempoReal?.idFeed === linea.idAgencia.split("_")[0]) {
            this.primeraCarga = false;
            // console.log(selectorEntidadLinea);
            let tmpAlertasLinea = this.tiempoRealService.getInformacionAlertas([linea.idAgencia.split("_")[0]], selectorEntidadLinea);
            // console.log(tmpAlertasLinea);
            if (tmpAlertasLinea) {
              this.alertasTiempoReal = tmpAlertasLinea; 
            }
          }          
        });
      });
    }
  }

  abrirPopover() {
    //TODO: Comprobar si es necesario o con trigger sirve
    this.popoverPatrones.present();
  }

  seleccionarPatron(index: number) {
    this.patronSeleccionado = this.patrones[index];
    this.popoverPatrones.dismiss();

    this.mapaService.setFiltrarMapa({
      paradas: this.patronSeleccionado.paradas,
      lineas: [this.linea.idLinea]
    });
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

  abrirUrl(url: string | undefined) {
    if (url) {
      window.open(url, '_blank');
    }    
  }

  navegarA(ruta: string[]) {
    this.navegacionService.navegarA(ruta, this.route);
  }
}
