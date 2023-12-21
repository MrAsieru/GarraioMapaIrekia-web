import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { AjusteMapa, FiltroMapa, MovimientoMapa, NavegacionMapa } from '../models/mapa.model';
import { AgenciasService } from './agencias.service';
import { Agencia } from '../models/agencia.model';
import { LngLat } from 'maplibre-gl';

@Injectable({
  providedIn: 'root'
})
export class MapaService {
  private listaAgenciasSubject: BehaviorSubject<Agencia[]> = new BehaviorSubject<Agencia[]>([]);
  listaAgencias = this.listaAgenciasSubject.asObservable();

  private agenciasVisiblesSubject: Subject<string[]> = new Subject<string[]>();
  private filtrarMapaSubject: BehaviorSubject<FiltroMapa> = new BehaviorSubject<FiltroMapa>({});
  private movimientoMapaSubject: BehaviorSubject<MovimientoMapa> = new BehaviorSubject<MovimientoMapa>({});
  private ajusteMapaSubject: BehaviorSubject<AjusteMapa> = new BehaviorSubject<AjusteMapa>({});
  private localizacionSubject: Subject<boolean> = new Subject<boolean>();
  private clickMapaSubject: Subject<LngLat> = new Subject<LngLat>();
  private navegacionSubject: BehaviorSubject<NavegacionMapa | null> = new BehaviorSubject<NavegacionMapa | null>(null);

  constructor(private agenciasService: AgenciasService) {
    this.agenciasService.getAgencias().subscribe(agencias => {
      // console.log(agencias)
      this.listaAgenciasSubject.next(agencias);
    });
  }

  public setAgenciasVisibles(agenciasVisibles: string[]) {
    // console.log(`setAgenciasVisibles(${agenciasVisibles})`)
    this.agenciasVisiblesSubject.next(agenciasVisibles);
  }

  public getAgenciasVisibles(): Observable<string[]> {
    return this.agenciasVisiblesSubject.asObservable();
  }

  public setFiltrarMapa(filtroMapa: FiltroMapa) {
    this.filtrarMapaSubject.next(filtroMapa);
  }

  public getFiltrosMapa(): Observable<FiltroMapa> {
    return this.filtrarMapaSubject.asObservable();
  }

  public setMovimientoMapa(movimientoMapa: MovimientoMapa) {
    this.movimientoMapaSubject.next(movimientoMapa);
  }

  public getMovimientoMapa(): Observable<MovimientoMapa> {
    return this.movimientoMapaSubject.asObservable();
  }

  public setAjusteMapa(ajusteMapa: AjusteMapa) {
    this.ajusteMapaSubject.next(ajusteMapa);
  }

  public getAjusteMapa(): Observable<AjusteMapa> {
    return this.ajusteMapaSubject.asObservable();
  }

  public setLocalizacion(localizacion: boolean) {
    this.localizacionSubject.next(localizacion);
  }

  public getLocalizacion(): Observable<boolean> {
    return this.localizacionSubject.asObservable();
  }

  public setClickMapa(clickMapa: LngLat) {
    this.clickMapaSubject.next(clickMapa);
  }

  public getClickMapa(): Observable<LngLat> {
    return this.clickMapaSubject.asObservable();
  }

  public setNavegacion(navegacion: NavegacionMapa | null) {
    this.navegacionSubject.next(navegacion);
  }

  public getNavegacion(): Observable<NavegacionMapa | null> {
    return this.navegacionSubject.asObservable();
  }
}
