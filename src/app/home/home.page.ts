import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CheckboxChangeEventDetail, IonCheckbox, IonicModule, MenuController } from '@ionic/angular';
import { MapaComponent } from '../mapa/mapa.component';
import { AgencyRoutes } from '../models/agency.model';
import { CommonModule } from '@angular/common';
import { Route } from '../models/route.model';
import { AgenciesService } from '../services/agencies.service';


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

  constructor(private menuCtrl: MenuController, private agenciesService: AgenciesService) {}

  listaAgenciasLineas: AgencyRoutes[] = [];

  ngOnInit() {
    this.agenciesService.getAgenciesRoutes().subscribe((agencies) => {
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
    let index = this.listaAgenciasLineas.findIndex(agencia => agencia.agency_id === details.value);
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
    this.mapa.filtrarCapas(this.listaAgenciasLineas.map(agencia => ({"agency_id": agencia.agency_id, "mostrar": agencia.mostrar})));
  }

  agenciaTodosCheckboxClick(event: Event, details: CheckboxChangeEventDetail<string>) {
    event.stopPropagation();
    console.log(details);
    this.listaAgenciasLineas.forEach(agencia => agencia.mostrar = details.checked);    

    // Enviar datos al mapa
    this.mapa.filtrarCapas(this.listaAgenciasLineas.map(agencia => ({"agency_id": agencia.agency_id, "mostrar": agencia.mostrar})));
  }

  mostrarLinea(event: Event, linea: Route) {
    event.stopPropagation();
    console.log("Mostrar linea: ", linea);

  }
}
