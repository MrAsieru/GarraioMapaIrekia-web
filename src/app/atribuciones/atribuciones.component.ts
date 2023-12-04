import { Component, OnInit } from '@angular/core';
import { LateralComponent } from '../lateral/lateral.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FeedsService } from '../services/feeds.service';
import { Feed } from '../models/feed.model';

@Component({
  selector: 'app-atribuciones',
  templateUrl: './atribuciones.component.html',
  styleUrls: ['./atribuciones.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LateralComponent],
})
export class AtribucionesComponent  implements OnInit {
  feeds: Feed[] = [];
  constructor(private feedsService: FeedsService) { }

  ngOnInit() {
    this.feedsService.getFeeds().subscribe((feeds: Feed[]) => {
      feeds.forEach((feed: Feed) => {
        feed.atribuciones?.sort((a, b) => a.nombreOrganizacion.localeCompare(b.nombreOrganizacion));
      });
      this.feeds = feeds.sort((a, b) => a.nombre.localeCompare(b.nombre));

      feeds.forEach((feed: Feed) => {
        // Recorrer atribuciones y establecer agencia al mismo que en la lista agencias
        feed.atribuciones?.forEach((atribucion) => {
          if (atribucion.idAgencia) {
            atribucion.nombre = feed.agencias?.find((agencia) => agencia.id === atribucion.idAgencia);
          }
          if (atribucion.idLinea) {
            atribucion.nombre = feed.lineas?.find((linea) => linea.id === atribucion.idLinea);
          }
          if (atribucion.idViaje) {
            atribucion.nombre = feed.viajes?.find((viaje) => viaje.id === atribucion.idViaje);
          }
        });
      });
    });
  }

}
