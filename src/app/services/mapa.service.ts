import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AjusteMapa, FiltroMapa, MovimientoMapa } from '../models/mapa.model';

@Injectable({
  providedIn: 'root'
})
export class MapaService {

  private filtrarMapaSubject: BehaviorSubject<FiltroMapa> = new BehaviorSubject<FiltroMapa>({});
  private movimientoMapaSubject: BehaviorSubject<MovimientoMapa> = new BehaviorSubject<MovimientoMapa>({});
  private ajusteMapaSubject: BehaviorSubject<AjusteMapa> = new BehaviorSubject<AjusteMapa>({});

  constructor() { }

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
}
