import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CheckboxChangeEventDetail, IonCheckbox, IonicModule, MenuController } from '@ionic/angular';
import { MapaComponent } from '../mapa/mapa.component';
import { AgencyRoutes } from '../models/agencia.model';
import { CommonModule } from '@angular/common';
import { Linea } from '../models/linea.model';
import { AgenciasService } from '../services/agencias.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule, MapaComponent],
})
export class HomePage implements OnInit {  
  @ViewChild(MapaComponent) mapa: MapaComponent;
  @ViewChild('chkbox_home_menu_agencias', { read: ElementRef }) agenciasCheckbox: IonCheckbox;
  agenciasCheckboxChecked: boolean = true;
  agenciasCheckboxIndeterminate: boolean = false;

  constructor(private menuCtrl: MenuController, private agenciesService: AgenciasService) {}

  listaAgenciasLineas: AgencyRoutes[] = [];

  ngOnInit() {
    this.agenciesService.getAgenciasLineas().subscribe((agencies) => {
      this.listaAgenciasLineas = agencies;
      this.listaAgenciasLineas.forEach(agencia => agencia.mostrar = true);
    });
  }

  abrirMenu() {
    this.menuCtrl.open();
  }

  agenciaCheckboxClick(event: Event, details: CheckboxChangeEventDetail<string>) {
    event.stopPropagation();
    console.log(details);
    let index = this.listaAgenciasLineas.findIndex(agencia => agencia.idAgencia === details.value);
    this.listaAgenciasLineas[index].mostrar = details.checked;
    if (this.listaAgenciasLineas.every(agencia => agencia.mostrar)) {
      console.log("Todos true");
      this.agenciasCheckboxChecked = true;
      this.agenciasCheckboxIndeterminate = false;
    } else if (this.listaAgenciasLineas.every(agencia => !agencia.mostrar)) {
      console.log("Todos false");
      this.agenciasCheckboxChecked = false;
      this.agenciasCheckboxIndeterminate = false;
    } else {
      console.log("Algunos true y otros false");
      this.agenciasCheckboxChecked = false;
      this.agenciasCheckboxIndeterminate = true;
    }

    // Enviar datos al mapa
    this.mapa.filtrarAgencias(this.listaAgenciasLineas.map(agencia => ({"idAgencia": agencia.idAgencia, "mostrar": agencia.mostrar})));
  }

  agenciaTodosCheckboxClick(event: Event, details: CheckboxChangeEventDetail<string>) {
    event.stopPropagation();
    console.log(details);
    this.listaAgenciasLineas.forEach(agencia => agencia.mostrar = details.checked);    

    // Enviar datos al mapa
    this.mapa.filtrarAgencias(this.listaAgenciasLineas.map(agencia => ({"idAgencia": agencia.idAgencia, "mostrar": agencia.mostrar})));
  }

  mostrarLinea(event: Event, linea: Linea) {
    event.stopPropagation();
    console.log("Mostrar linea: ", linea);

  }
}
