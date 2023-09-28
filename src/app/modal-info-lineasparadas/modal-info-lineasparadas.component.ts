import { Component, Input, OnInit } from '@angular/core';
import { Route } from '../models/route.model';
import { Stop } from '../models/stop.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-info-lineasparadas',
  templateUrl: './modal-info-lineasparadas.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ModalInfoLineasparadasComponent {
  @Input("linea") linea: Route;
  @Input("parada") parada: Stop;
  constructor() {}
}
