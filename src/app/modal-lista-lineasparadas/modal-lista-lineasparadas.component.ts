import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController, IonicModule, IonicSafeString } from '@ionic/angular';
import { ShapeVectorProperties } from 'src/app/models/shape.model';
import { Stop, StopVectorProperties } from 'src/app/models/stop.model';
import { RoutesService } from '../services/routes.service';
import { StopsService } from '../services/stops.service';
import { Route } from '../models/route.model';
import { ModalInfoLineasparadasComponent } from '../modal-info-lineasparadas/modal-info-lineasparadas.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-modal-lista-lineasparadas',
  templateUrl: './modal-lista-lineasparadas.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ModalListaLineasParadasComponent implements OnInit {
  @Input("datos") datos: Observable<{lineas: ShapeVectorProperties[], paradas: StopVectorProperties[]}>;
  lineas: ShapeVectorProperties[] = [];
  paradas: StopVectorProperties[] = [];
  constructor(private routesService: RoutesService, private stopsService: StopsService, private modalCtrl: ModalController) { }

  ngOnInit(): void {
    console.log("INIT");
    this.datos.subscribe((data) => {
      console.log(data);
      this.lineas = data.lineas;
      this.paradas = data.paradas;
    });
  }

  mostrarLinea(linea: ShapeVectorProperties, event: MouseEvent) {
    console.log(event)
    this.routesService.getRoute(linea.route_id).subscribe((data) => {
      this.mostrarModal(data, undefined);
    });
  }

  mostrarParada(parada: StopVectorProperties, event: MouseEvent) {
    console.log(event)
    this.stopsService.getStop(parada.stop_id).subscribe((data) => {
      this.mostrarModal(undefined, data);
    });
  }

  async mostrarModal(linea?: Route, parada?: Stop) {
    const modal = await this.modalCtrl.create({
      component: ModalInfoLineasparadasComponent,
      mode: 'md',
      showBackdrop: true,
      backdropDismiss: true,
      cssClass: 'modal-info-lineasparadas',
      componentProps: { linea: linea, parada: parada }
    });
    modal.present();
  }
}
