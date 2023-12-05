import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CheckboxChangeEventDetail, InputChangeEventDetail, IonCheckbox, IonicModule, MenuController, ToggleChangeEventDetail, ToggleCustomEvent } from '@ionic/angular';
import { MapaComponent } from '../mapa/mapa.component';
import { Agencia, AgencyRoutes } from '../models/agencia.model';
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

  listaAgencias: Array<Agencia & {mostrar: boolean}> = [];
  listaAgenciasBusqueda: Array<Agencia & {mostrar: boolean}> = [];
  agenciasCheckboxChecked: boolean = true;
  agenciasCheckboxIndeterminate: boolean = false;

  constructor(private menuCtrl: MenuController,
    private agenciasService: AgenciasService,
    private route: ActivatedRoute,
    private router: Router,
    private mapaService: MapaService,
    private navegacionService: NavegacionService,
    private tiempoReal: TiempoRealService) {
      this.listaAgenciasBusqueda = this.listaAgencias.map(agencia => ({ ...agencia, mostrar: true }));
  }

  ngOnInit() {
    this.mapaService.listaAgencias.subscribe((agencias) => {
      if (agencias.length > 0 && this.listaAgencias.length === 0) {
        this.listaAgencias = agencias.map(agencia => ({ ...agencia, mostrar: true })).sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.listaAgenciasBusqueda = this.listaAgencias;
      }      
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
    let index = this.listaAgencias.findIndex(agencia => agencia.idAgencia === details.value);
    this.listaAgencias[index].mostrar = details.checked;
    if (this.listaAgencias.every(agencia => agencia.mostrar)) {
      // console.log("Todos true");
      this.agenciasCheckboxChecked = true;
      this.agenciasCheckboxIndeterminate = false;
    } else if (this.listaAgencias.every(agencia => !agencia.mostrar)) {
      // console.log("Todos false");
      this.agenciasCheckboxChecked = false;
      this.agenciasCheckboxIndeterminate = false;
    } else {
      // console.log("Algunos true y otros false");
      this.agenciasCheckboxChecked = false;
      this.agenciasCheckboxIndeterminate = true;
    }

    // Enviar datos al mapa
    this.mapaService.setAgenciasVisibles(this.listaAgencias.filter(agencia => agencia.mostrar).map(agencia => agencia.idAgencia));
  }

  agenciaTodosCheckboxClick(event: Event, details: CheckboxChangeEventDetail<string>) {
    // console.log(details);
    this.listaAgencias.forEach(agencia => agencia.mostrar = details.checked);    

    // Enviar datos al mapa
    this.mapaService.setAgenciasVisibles(this.listaAgencias.filter(agencia => agencia.mostrar).map(agencia => agencia.idAgencia));
  }

  buscarAgencias(event: InputChangeEventDetail) {
    if (event.value && event.value.trim() !== '') {
      this.listaAgenciasBusqueda = this.listaAgencias.filter(agencia => agencia.nombre.toLowerCase().includes(event.value!.toLowerCase()));
    } else {
      this.listaAgenciasBusqueda = this.listaAgencias;
    }
  }

  cambiarTiempoReal(event: ToggleCustomEvent) {
    event.stopPropagation();
    event.target.checked = this.tiempoReal.setEstadoTiempoReal(event.detail.checked);
  }

  cambiarLocalizacion(event: ToggleCustomEvent) {
    event.stopPropagation();
    this.mapaService.setLocalizacion(event.detail.checked);
  }
}
