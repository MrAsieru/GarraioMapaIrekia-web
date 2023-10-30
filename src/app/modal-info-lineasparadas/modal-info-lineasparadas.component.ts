import { Component, Input, OnInit } from '@angular/core';
import { Linea } from '../models/linea.model';
import { Parada } from '../models/parada.model';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-info-lineasparadas',
  templateUrl: './modal-info-lineasparadas.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ModalInfoLineasparadasComponent {
  @Input("linea") linea: Linea;
  @Input("parada") parada: Parada;
  constructor() {}
}
