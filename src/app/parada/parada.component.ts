import { Component, OnDestroy, OnInit } from '@angular/core';
import { LateralComponent } from '../lateral/lateral.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Parada } from '../models/parada.model';
import { ParadasService } from '../services/paradas.service';
import { MapaService } from '../services/mapa.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parada',
  templateUrl: './parada.component.html',
  standalone: true,
  imports: [CommonModule, LateralComponent]
})
export class ParadaComponent  implements OnInit, OnDestroy {
  idParada: string | null;
  parada: Parada;

  constructor(private router: Router, private route: ActivatedRoute, private paradasService: ParadasService, private mapaService: MapaService) { }

  ngOnInit() {
    this.idParada = this.route.snapshot.paramMap.get('idParada');

    if (this.idParada) {
      this.paradasService.getParada(this.idParada).subscribe(parada => {
        this.parada = parada;

        if (parada.paradaPadre) {
          this.navegarA(['../', parada.paradaPadre])
        } else {
          this.mapaService.setFiltrarMapa({
            paradas: [parada.idParada],
            lineas: (parada.lineas as string[])
          });
  
          this.mapaService.setMovimientoMapa({
            latitud: parada.posicionLatitud,
            longitud: parada.posicionLongitud,
            zoom: 17
          });
        }        
      });
    }
  }

  ngOnDestroy() {
    this.mapaService.setFiltrarMapa({});
  }

  navegarA(ruta: string[]) {
    this.router.navigate(ruta, {relativeTo: this.route});
  }
}
