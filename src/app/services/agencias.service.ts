import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Agencia, AgencyRoutes } from '../models/agencia.model';
import { Linea } from '../models/linea.model';

@Injectable({
  providedIn: 'root'
})
export class AgenciasService {
  public baseUrl: string = environment.apiBaseUrl+"/agencias";

  constructor(private http: HttpClient) { }

  getAgencias(): Observable<Agencia[]> {
    return this.http.get<Agencia[]>(this.baseUrl);
  }

  getAgencia(id: string): Observable<Agencia> {
    return this.http.get<Agencia>(this.baseUrl+'/'+id);
  }

  getLineasAgencia(id: string): Observable<Linea[]> {
    return this.http.get<Linea[]>(this.baseUrl+'/'+id+'/lineas');
  }

  getAgenciasConLineas(): Observable<AgencyRoutes[]> {
    return this.http.get<AgencyRoutes[]>(this.baseUrl+'/lineas');
  }
}
