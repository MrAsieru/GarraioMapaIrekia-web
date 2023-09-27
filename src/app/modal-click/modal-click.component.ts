import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ShapeVectorProperties } from 'src/models/shape.model';
import { StopVectorProperties } from 'src/models/stop.model';

@Component({
  selector: 'app-modal-click',
  templateUrl: './modal-click.component.html',
  styleUrls: ['./modal-click.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ModalClickComponent implements OnInit {
  @Input("lineas") lineas: ShapeVectorProperties[];
  @Input("paradas") paradas: StopVectorProperties[];
  constructor() { }

  ngOnInit() {
    console.log(this.lineas);
    console.log(this.paradas);
  }

}
