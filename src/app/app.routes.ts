import { RouterModule, Routes } from '@angular/router';
import { LateralComponent } from './lateral/lateral.component';
import { NgModule } from '@angular/core';
import { HomePage } from './home/home.page';
import { MapaComponent } from './mapa/mapa.component';
import { ParadaComponent } from './parada/parada.component';
import { LineaComponent } from './linea/linea.component';
import { AgenciaComponent } from './agencia/agencia.component';
import { ViajeComponent } from './viaje/viaje.component';
import { AtribucionesComponent } from './atribuciones/atribuciones.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full'
  },
  {
    path: 'app',
    component: MapaComponent,
    title: 'App',
    children: [
      {
        path: '',
        component: HomePage,
        outlet: 'inicio',
        pathMatch: 'full',
        title: 'Inicio'
      },
      {
        path: 'parada/:idParada',
        component: ParadaComponent,
        pathMatch: 'full',
        title: 'Parada'
      },
      {
        path: 'linea/:idLinea',
        component: LineaComponent,
        pathMatch: 'full',
        title: 'Linea'
      },
      {
        path: 'agencia/:idAgencia',
        component: AgenciaComponent,
        pathMatch: 'full',
        title: 'Agencia'
      },
      {
        path: 'viaje/:idViaje',
        component: ViajeComponent,
        pathMatch: 'full',
        title: 'Viaje'
      },
      {
        path: 'atribuciones',
        component: AtribucionesComponent,
        pathMatch: 'full',
        title: 'Atribuciones'
      }
    ]
  }
];
