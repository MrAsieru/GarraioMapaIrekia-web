import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LateralComponent } from '../lateral/lateral.component';
import { Agencia } from '../models/agencia.model';
import { AgenciasService } from '../services/agencias.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MapaService } from '../services/mapa.service';
import { Linea } from '../models/linea.model';
import { LineasService } from '../services/lineas.service';

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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private agenciasService: AgenciasService,
    private mapaService: MapaService,
    private lineasService: LineasService) { }

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
