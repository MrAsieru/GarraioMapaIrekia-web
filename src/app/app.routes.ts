import { RouterModule, Routes } from '@angular/router';
import { LateralComponent } from './lateral/lateral.component';
import { NgModule } from '@angular/core';
import { HomePage } from './home/home.page';
import { MapaComponent } from './mapa/mapa.component';
import { ParadaComponent } from './parada/parada.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full'
  },
  {
    path: 'app',
    component: MapaComponent,
    children: [
      {
        path: '',
        component: HomePage,
        outlet: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'parada',
        component: ParadaComponent,
        pathMatch: 'full'
      }
    ]
  }
];
