import { Component, OnInit } from '@angular/core';
import { LateralComponent } from '../lateral/lateral.component';

@Component({
  selector: 'app-parada',
  templateUrl: './parada.component.html',
  standalone: true,
  imports: [LateralComponent]
})
export class ParadaComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
