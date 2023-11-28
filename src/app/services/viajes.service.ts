import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Viaje } from '../models/viaje.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Parada } from '../models/parada.model';

@Injectable({
  providedIn: 'root'
})
export class ViajesService {
  public baseUrl: string = environment.apiBaseUrl+"/viajes/";

  constructor(private http: HttpClient) { }

  getViaje(id: string, parametros?: {
    incluirHorarios?: boolean,
    incluirParadas?: boolean,
    incluirFechas?: boolean,
    incluirFrecuencias?: boolean
  }): Observable<Viaje> {
    return this.http.get<Viaje>(this.baseUrl+id, {params: parametros});
  }

  getParadasViaje(id: string): Observable<Parada[]> {
    return this.http.get<Parada[]>(this.baseUrl+id+"/paradas");
  }
}
