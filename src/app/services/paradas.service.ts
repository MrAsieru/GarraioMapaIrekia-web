import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ViajeParada, Parada } from '../models/parada.model';
import { Linea } from '../models/linea.model';
import { Agencia } from '../models/agencia.model';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class ParadasService {
  public baseUrl: string = environment.apiBaseUrl+"/paradas/";

  constructor(private http: HttpClient) { }

  getParadas(): Observable<Parada[]> {
    return this.http.get<Parada[]>(this.baseUrl);
  }

  getParada(id: string, parametros?: {
    incluirLineas?: boolean,
    incluirViajes?: boolean,
    incluirAgencias?: boolean
  }): Observable<Parada> {
    return this.http.get<Parada>(this.baseUrl+id, {params: parametros});
  }

  getLineasParada(id: string, parametros?: {
    incluirViajes?: boolean,
    incluirPatrones?: boolean,
    incluirParadas?: boolean
  }): Observable<Linea[]> {
    return this.http.get<Linea[]>(this.baseUrl+id+"/lineas", {params: parametros});
  }

  getAgenciasParada(id: string): Observable<Agencia[]> {
    return this.http.get<Agencia[]>(this.baseUrl+id+"/agencias");
  }

  getHorariosParada(id: string, parametros?: {
    desde?: string,
    hasta?: string
  }): Observable<ViajeParada[]> {
    return this.http.get<ViajeParada[]>(this.baseUrl+id+"/horarios", {params: parametros});
  }
}
