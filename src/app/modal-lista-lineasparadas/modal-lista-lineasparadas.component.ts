import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ModalController, IonicModule, IonicSafeString, IonModal } from '@ionic/angular';
import { ShapeVectorProperties } from 'src/app/models/linea.model';
import { Parada, StopVectorProperties } from 'src/app/models/parada.model';
import { LineasService } from '../services/lineas.service';
import { ParadasService } from '../services/paradas.service';
import { Linea } from '../models/linea.model';
import { ModalInfoLineasparadasComponent } from '../modal-info-lineasparadas/modal-info-lineasparadas.component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-modal-lista-lineasparadas',
  templateUrl: './modal-lista-lineasparadas.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ModalListaLineasParadasComponent implements OnInit {
  @Input("route") route: ActivatedRoute;
  @Input("datos") datos: Observable<{lineas: ShapeVectorProperties[], paradas: StopVectorProperties[]}>;
  lineas: ShapeVectorProperties[] = [];
  paradas: Parada[] = [];
  constructor(private routesService: LineasService,
    private paradasService: ParadasService,
    private modalCtrl: ModalController,
    private router: Router) { }

  ngOnInit(): void {
    console.log("INIT");
    this.datos.subscribe((data) => {
      console.log(data);
      this.lineas = data.lineas;
      this.paradas = data.paradas;

      this.paradas.forEach((parada) => {
        this.paradasService.getParada(parada.idParada).subscribe((parada) => {
          this.paradasService.getLineasParada(parada.idParada).subscribe((lineas) => {
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
            parada.lineas = lineas;
            this.paradas[this.paradas.findIndex((parada2) => parada2.idParada === parada.idParada)] = parada;
          });          
        });
      });
    });
  }

  mostrarLinea(linea: Linea, event: MouseEvent) {
    // console.log(event)
    // this.routesService.getLinea(linea.route_id).subscribe((data) => {
    //   this.mostrarModal(data, undefined);
    // });
    this.navegarA(['linea', linea.idLinea]);
  }

  mostrarParada(parada: Parada, event: MouseEvent) {
    this.navegarA(['parada', parada.idParada]);
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

  navegarA(ruta: string[]) {
    this.modalCtrl.dismiss(undefined, undefined, 'modal-lista-lineasparadas');    
    this.router.navigate(ruta, {relativeTo: this.route});
  }
}
