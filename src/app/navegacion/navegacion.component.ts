import { CommonModule } from '@angular/common';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { CheckboxCustomEvent, DatetimeCustomEvent, IonicModule, SegmentCustomEvent, ToggleCustomEvent } from '@ionic/angular';
import { LateralComponent } from '../lateral/lateral.component';
import { NavegacionService } from '../services/navegacion.service';
import { MapaService } from '../services/mapa.service';
import { first } from 'rxjs';
import { LngLat } from 'maplibre-gl';
import moment from 'moment-timezone';
import { MomentPipe } from '../moment/moment.pipe';
import { PeticionNavegacion, PlanNavegacion, RespuestaNavegacion } from '../models/navegacion.model';
import { MomentDurationPipe } from '../moment-duration/moment-duration.pipe';
import { FloorPipe } from '../floor/floor.pipe';
import { decode } from "@googlemaps/polyline-codec";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navegacion',
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LateralComponent, MomentPipe, MomentDurationPipe, FloorPipe, TranslateModule]
})
export class NavegacionComponent  implements OnInit {
  public origen: LngLat | undefined;
  public destino: LngLat | undefined;
  public accesibilidad: boolean;
  public llegar: boolean;
  public fechaHora: moment.Moment = moment();

  public plan: PlanNavegacion | undefined | null;

  public estadoOrigen: number = 0; // 0: Vacío, 1: Esperando, 2: Seleccionado
  public estadoDestino: number = 0; // 0: Vacío, 1: Esperando, 2: Seleccionado
  public detalleEtapa: boolean = false;

  constructor(private navegacionService: NavegacionService, private mapaService: MapaService) { }

  ngOnInit() {}

  seleccionarOrigenDestino(esOrigen: boolean) {
    if (esOrigen) {
      this.estadoOrigen = 1;
    } else {
      this.estadoDestino = 1;
    }
    this.mapaService.getClickMapa().pipe(first()).subscribe((clickMapa: LngLat) => {
      console.log(clickMapa)
      if (esOrigen) {
        this.origen = clickMapa;
        this.estadoOrigen = 2;
      } else {
        this.destino = clickMapa;
        this.estadoDestino = 2;
      }

      this.mapaService.setNavegacion({origen: this.origen, destino: this.destino});

      this.consultarTrayectos();
    });
  }

  seleccionarAccesibilidad(event: CheckboxCustomEvent) {
    this.accesibilidad = event.detail.checked;

    this.consultarTrayectos();
  }

  seleccionarSalirLlegar(event: SegmentCustomEvent) {
    this.llegar = event.detail.value === 'llegar';

    this.consultarTrayectos();
  }

  seleccionarFechaHora(event: DatetimeCustomEvent) {
    this.fechaHora = moment(event.detail.value);

    this.consultarTrayectos();
  }

  consultarTrayectos() {
    if (this.origen && this.destino) {
      const peticion: PeticionNavegacion = {
        fecha: this.fechaHora.format('YYYY-MM-DD'),
        hora: this.fechaHora.format('HH:mm'),
        origen: {
          lat: this.origen.lat,
          lon: this.origen.lng
        },
        destino: {
          lat: this.destino.lat,
          lon: this.destino.lng
        },
        accesibleSillaDeRuedas: this.accesibilidad,
        llegada: this.llegar,
        locale: 'es',
        respuestaMaxItinerarios: 3
      }
      this.plan = null
      this.navegacionService.getNavegacion(peticion).subscribe((respuesta: RespuestaNavegacion) => {
        this.plan = respuesta?.data?.plan;
        console.log(respuesta)
      });
    }
  }

  mostrarTrayecto(index: number) {
    let elementos = document.getElementsByClassName('trayecto_content');
    if (!this.detalleEtapa) {
      for (let i = 0; i < elementos.length; i++) {
        if (i === index) {
          elementos[i].classList.toggle('oculto');
        } else {
          elementos[i].classList.add('oculto');
        }
      }
    }    

    if (this.detalleEtapa || !elementos?.[index].classList.contains('oculto')) {
      const trayecto = this.plan!.itineraries[index];
      this.mapaService.setNavegacion({
        origen: this.origen,
        destino: this.destino,
        trayecto: trayecto
      });
      this.detalleEtapa = false;
    }    
  }

  mostrarEtapa(indexTrayecto: number, indexEtapa: number) {
    const etapa = this.plan!.itineraries[indexTrayecto].legs[indexEtapa];
    const geometria = decode(etapa.legGeometry?.points ?? "", 5); // lat, lon
    const bbox_sw = geometria.reduce((acc, cur) => {
      return [Math.min(acc[0], cur[0]), Math.min(acc[1], cur[1])];
    });
    const bbox_ne = geometria.reduce((acc, cur) => {
      return [Math.max(acc[0], cur[0]), Math.max(acc[1], cur[1])];
    });

    this.detalleEtapa = true;
    
    this.mapaService.setAjusteMapa({bbox: [bbox_sw[1], bbox_sw[0], bbox_ne[1], bbox_ne[0]]})
  }

  limpiarOrigenDestino() {
    this.origen = undefined;
    this.destino = undefined;
    this.estadoOrigen = 0;
    this.estadoDestino = 0;
    this.mapaService.setNavegacion(null);
    this.plan = undefined;
  }

  intercambiarOrigenDestino() {
    const aux = this.origen;
    this.origen = this.destino;
    this.destino = aux;
    this.mapaService.setNavegacion({origen: this.origen, destino: this.destino});
    this.plan = undefined;
    this.consultarTrayectos();
  }

  masTrayectos() {
    if (this.origen && this.destino && this.plan) {
      const peticion: PeticionNavegacion = {
        fecha: this.fechaHora.format('YYYY-MM-DD'),
        hora: this.fechaHora.format('HH:mm'),
        origen: {
          lat: this.origen.lat,
          lon: this.origen.lng
        },
        destino: {
          lat: this.destino.lat,
          lon: this.destino.lng
        },
        accesibleSillaDeRuedas: this.accesibilidad,
        llegada: this.llegar,
        locale: 'es',
        respuestaMaxItinerarios: 3,
        cursorPagina: this.plan?.nextPageCursor
      }

      this.navegacionService.getNavegacion(peticion).subscribe((respuesta: RespuestaNavegacion) => {
        // Merge plan and respuesta.data.plan
        this.plan!.itineraries = this.plan!.itineraries.concat(respuesta.data.plan.itineraries);
        this.plan!.nextPageCursor = respuesta.data.plan.nextPageCursor;
        console.log(respuesta)
      });
    }
  }

  ngOnDestroy() {
    this.mapaService.setNavegacion(null);
  }
}
