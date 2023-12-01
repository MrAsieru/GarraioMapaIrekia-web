import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ModalController, IonicModule, IonicSafeString, IonModal } from '@ionic/angular';
import { ShapePropiedadesVectoriales } from 'src/app/models/linea.model';
import { Parada, StopPropiedadesVectoriales } from 'src/app/models/parada.model';
import { LineasService } from '../services/lineas.service';
import { ParadasService } from '../services/paradas.service';
import { Linea } from '../models/linea.model';
import { Observable } from 'rxjs';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NavegacionService } from '../services/navegacion.service';
import { Viaje, ViajePropiedadesVectoriales } from '../models/viaje.model';
import { ViajesService } from '../services/viajes.service';

@Component({
  selector: 'app-modal-lista-elementos',
  templateUrl: './modal-lista-elementos.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ModalListaElementosComponent implements OnInit {
  @Input("route") route: ActivatedRoute;
  @Input("datos") datos: Observable<{lineas: ShapePropiedadesVectoriales[], paradas: StopPropiedadesVectoriales[], viajes: ViajePropiedadesVectoriales[]}>;
  lineas: ShapePropiedadesVectoriales[] = [];
  paradas: Parada[] = [];
  viajes: Array<Viaje & ViajePropiedadesVectoriales & {linea?: Linea}> = [];
  constructor(private paradasService: ParadasService,
    private modalCtrl: ModalController,
    private navegacionService: NavegacionService,
    private viajesService: ViajesService,
    private lineasService: LineasService) { }

  ngOnInit(): void {
    // console.log("INIT");
    this.datos.subscribe((data) => {
      // console.log(data);
      this.lineas = data.lineas.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
      this.paradas = data.paradas;
      this.viajes = data.viajes;

      this.paradas.forEach((parada) => {
        this.paradasService.getParada(parada.idParada, {incluirLineas: true}).subscribe((parada) => {
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
      
      if (this.viajes && this.viajes.length > 0) {
        this.viajes.forEach((viaje) => {
          this.viajesService.getViaje(viaje.idViaje, {incluirHorarios: true}).subscribe((viaje) => {
            let viajeTmp = this.viajes.find((viaje2) => viaje2.idViaje === viaje.idViaje);
            if (viajeTmp) {
              if (!viajeTmp.letrero || viajeTmp.letrero === "") {
                // De la lista de horarios coger el primer letrero
                viajeTmp.letrero = viaje.horarios?.find((horario) => horario.letrero && horario.letrero !== "")?.letrero;
              } else {
                viajeTmp.letrero = viaje.letrero;
              }              
            }
          });
        });

        new Set(this.viajes.map((viaje) => viaje.idLinea)).forEach((idLinea) => {
          this.lineasService.getLinea(idLinea).subscribe((linea) => {
            this.viajes.forEach((viaje) => {
              if (viaje.idLinea === linea.idLinea) {
                viaje.linea = linea;
              }
            });
          });
        });
      }
    });
  }

  mostrarLinea(linea: Linea, event: MouseEvent) {
    this.navegarA(['linea', linea.idLinea]);
  }

  mostrarParada(parada: Parada, event: MouseEvent) {
    this.navegarA(['parada', parada.idParada]);
  }

  mostrarViaje(viaje: Viaje, event: MouseEvent) {
    this.navegarA(['viaje', viaje.idViaje]);
  }

  navegarA(ruta: string[]) {
    console.log(this.route.toString())
    this.modalCtrl.dismiss(undefined, undefined, 'modal-lista-elementos');    
    this.navegacionService.navegarA(ruta, this.route);
  }

  cerrar() {
    this.modalCtrl.dismiss(undefined, undefined, 'modal-lista-elementos');
  }
}
