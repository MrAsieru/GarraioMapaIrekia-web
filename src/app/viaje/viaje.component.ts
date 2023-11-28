import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { DatetimeHighlight } from '@ionic/core';
import { IonPopover, IonicModule } from '@ionic/angular';
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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private viajesService: ViajesService,
    private lineasService: LineasService,
    private agenciasService: AgenciasService,
    private mapaService: MapaService) { }

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
          console.log(this.calendario);
        }

        this.actualizarTiempos();
        this.actualizarPosicion();
        setInterval(() => {
          this.actualizarTiempos();
          this.actualizarPosicion();
        }, 60000);
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
    if (this.viaje?.horarios) {
      const ahora = moment();
      let orden = -1;
      console.log(this.viaje.horarios)
      console.log(ahora)
      for (let i = 0; i < this.viaje.horarios.length; i++) {
        console.log(i)
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

      console.log(`orden: ${orden}`)

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

  ngOnDestroy() {
    this.mapaService.setFiltrarMapa({});
  }

  abrirUrl(url: string) {
    window.open(url, '_blank');
  }

  navegarA(ruta: string[]) {
    this.router.navigate(ruta, {relativeTo: this.route});
  }
}
