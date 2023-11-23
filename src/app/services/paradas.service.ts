import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ViajeParada, Parada } from '../models/parada.model';
import { Linea } from '../models/linea.model';
import { Agencia } from '../models/agencia.model';

@Injectable({
  providedIn: 'root'
})
export class ParadasService {
  public baseUrl: string = environment.apiBaseUrl+"/paradas";

  constructor(private http: HttpClient) { }

  getParadas(): Observable<Parada[]> {
    return this.http.get<Parada[]>(this.baseUrl);
  }

  getParada(id: string): Observable<Parada> {
    return this.http.get<Parada>(this.baseUrl+"/"+id);
  }

  getLineasParada(id: string): Observable<Linea[]> {
    return this.http.get<Linea[]>(this.baseUrl+"/"+id+"/lineas");
  }

  getAgenciasParada(id: string): Observable<Agencia[]> {
    return this.http.get<Agencia[]>(this.baseUrl+"/"+id+"/agencias");
  }

  getHorariosParada(id: string): Observable<ViajeParada[]> {
    return this.http.get<ViajeParada[]>(this.baseUrl+"/"+id+"/horarios");
  }
}
