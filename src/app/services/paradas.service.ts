import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HorarioParada, Parada } from '../models/parada.model';
import { Linea } from '../models/linea.model';

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

  getHorariosParada(id: string): Observable<HorarioParada[]> {
    return this.http.get<HorarioParada[]>(this.baseUrl+"/"+id+"/horarios");
  }
}
