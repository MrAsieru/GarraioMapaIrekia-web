import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LateralComponent } from '../lateral/lateral.component';
import { Linea } from '../models/linea.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ParadasService } from '../services/paradas.service';
import { MapaService } from '../services/mapa.service';
import { LineasService } from '../services/lineas.service';

@Component({
  selector: 'app-linea',
  templateUrl: './linea.component.html',
  standalone: true,
  imports: [CommonModule, LateralComponent]
})
export class LineaComponent  implements OnInit {
  idLinea: string | null;
  linea: Linea;

  constructor(private router: Router, private route: ActivatedRoute, private lineasService: LineasService, private mapaService: MapaService) { }

  ngOnInit() {
    this.idLinea = this.route.snapshot.paramMap.get('idLinea');

    if (this.idLinea) {
      this.lineasService.getLinea(this.idLinea, true).subscribe(linea => {
        this.linea = linea;

        this.mapaService.setFiltrarMapa({
          paradas: (linea.paradas as string[]),
          lineas: [linea.idLinea]
        });

        this.mapaService.setAjusteMapa({
          bbox: linea.bbox
        });
      });
    }
  }

  ngOnDestroy() {
    this.mapaService.setFiltrarMapa({});
  }
}
