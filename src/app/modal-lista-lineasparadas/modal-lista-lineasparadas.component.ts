import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController, IonicModule, IonicSafeString } from '@ionic/angular';
import { ShapeVectorProperties } from 'src/app/models/shape.model';
import { Parada, StopVectorProperties } from 'src/app/models/parada.model';
import { LineasService } from '../services/lineas.service';
import { ParadasService } from '../services/paradas.service';
import { Linea } from '../models/linea.model';
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
  constructor(private routesService: LineasService, private stopsService: ParadasService, private modalCtrl: ModalController) { }

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
    this.routesService.getLinea(linea.route_id).subscribe((data) => {
      this.mostrarModal(data, undefined);
    });
  }

  mostrarParada(parada: StopVectorProperties, event: MouseEvent) {
    console.log(event)
    this.stopsService.getParada(parada.stop_id).subscribe((data) => {
      this.mostrarModal(undefined, data);
    });
  }

  async mostrarModal(linea?: Linea, parada?: Parada) {
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
