import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CheckboxChangeEventDetail, IonCheckbox, IonicModule, MenuController, ToggleChangeEventDetail, ToggleCustomEvent } from '@ionic/angular';
import { MapaComponent } from '../mapa/mapa.component';
import { AgencyRoutes } from '../models/agencia.model';
import { CommonModule } from '@angular/common';
import { Linea } from '../models/linea.model';
import { AgenciasService } from '../services/agencias.service';
import { ActivatedRoute, Router, RouterModule} from '@angular/router'
import { MapaService } from '../services/mapa.service';
import { NavegacionService } from '../services/navegacion.service';
import { TiempoRealService } from '../services/tiemporeal.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class HomePage implements OnInit {  
  @ViewChild('chkbox_home_menu_agencias', { read: ElementRef }) agenciasCheckbox: IonCheckbox;
  agenciasCheckboxChecked: boolean = true;
  agenciasCheckboxIndeterminate: boolean = false;

  constructor(private menuCtrl: MenuController,
    private agenciesService: AgenciasService,
    private route: ActivatedRoute,
    private router: Router,
    private mapaService: MapaService,
    private navegacionService: NavegacionService,
    private tiempoReal: TiempoRealService) {}

  listaAgenciasLineas: AgencyRoutes[] = [];

  ngOnInit() {
    this.agenciesService.getAgenciasConLineas().subscribe((agencies) => {
      this.listaAgenciasLineas = agencies;
      this.listaAgenciasLineas.forEach(agencia => agencia.mostrar = true);
    });
  }

  abrirMenu() {
    this.menuCtrl.open();
  }

  navegarA(ruta: string[]) {
    this.navegacionService.navegarA(ruta, this.route);
  }

  agenciaCheckboxClick(event: Event, details: CheckboxChangeEventDetail<string>) {
    event.stopPropagation();
    // console.log(details);
    let index = this.listaAgenciasLineas.findIndex(agencia => agencia.idAgencia === details.value);
    this.listaAgenciasLineas[index].mostrar = details.checked;
    if (this.listaAgenciasLineas.every(agencia => agencia.mostrar)) {
      // console.log("Todos true");
      this.agenciasCheckboxChecked = true;
      this.agenciasCheckboxIndeterminate = false;
    } else if (this.listaAgenciasLineas.every(agencia => !agencia.mostrar)) {
      // console.log("Todos false");
      this.agenciasCheckboxChecked = false;
      this.agenciasCheckboxIndeterminate = false;
    } else {
      // console.log("Algunos true y otros false");
      this.agenciasCheckboxChecked = false;
      this.agenciasCheckboxIndeterminate = true;
    }

    // Enviar datos al mapa
    this.mapaService.setFiltrarMapa({
      agencias: this.listaAgenciasLineas.filter(agencia => agencia.mostrar).map(agencia => agencia.idAgencia)
    });
  }

  agenciaTodosCheckboxClick(event: Event, details: CheckboxChangeEventDetail<string>) {
    event.stopPropagation();
    // console.log(details);
    this.listaAgenciasLineas.forEach(agencia => agencia.mostrar = details.checked);    

    // Enviar datos al mapa
    this.mapaService.setFiltrarMapa({
      agencias: this.listaAgenciasLineas.filter(agencia => agencia.mostrar).map(agencia => agencia.idAgencia)
    });
  }

  mostrarLinea(event: Event, linea: Linea) {
    event.stopPropagation();
    // console.log("Mostrar linea: ", linea);

  }

  cambiarTiempoReal(event: ToggleCustomEvent) {
    event.stopPropagation();
    event.target.checked = this.tiempoReal.setEstadoTiempoReal(event.detail.checked);
  }
}
