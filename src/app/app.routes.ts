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
import { PaginaNoEncontradaComponent } from './pagina-no-encontrada/pagina-no-encontrada.component';
import { NavegacionComponent } from './navegacion/navegacion.component';

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
      },
      {
        path: 'navegacion',
        component: NavegacionComponent,
        pathMatch: 'full',
        title: 'Navegación'
      },
      {
        path: 'oh',
        component: PaginaNoEncontradaComponent,
        pathMatch: 'full',
        title: 'Pagina no encontrada'
      },
      {
        path: '**',
        redirectTo: 'oh'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'app/oh'
  }
];
