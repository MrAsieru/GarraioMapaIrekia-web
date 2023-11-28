import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LateralComponent } from '../lateral/lateral.component';
import { Linea, PatronLinea } from '../models/linea.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MapaService } from '../services/mapa.service';
import { LineasService } from '../services/lineas.service';
import { IonPopover, IonicModule } from '@ionic/angular';

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
  patrones: PatronLinea[] = [];
  patronSeleccionado: PatronLinea | undefined = undefined;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private lineasService: LineasService,
    private mapaService: MapaService) { }

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
            console.log(this.patrones);
            this.seleccionarPatron(0);
            this.patrones.forEach(patron => {
              patron.paradasObj = patron.paradas.map(idParada => paradas.find(parada => parada.idParada == idParada)!);
            });
          });
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

  ngOnDestroy() {
    this.mapaService.setFiltrarMapa({});
  }

  abrirUrl(url: string | undefined) {
    if (url) {
      window.open(url, '_blank');
    }    
  }

  navegarA(ruta: string[]) {
    this.router.navigate(ruta, {relativeTo: this.route});
  }
}
