import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { LateralComponent } from '../lateral/lateral.component';

@Component({
  selector: 'app-pagina-no-encontrada',
  templateUrl: './pagina-no-encontrada.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, LateralComponent]
})
export class PaginaNoEncontradaComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
