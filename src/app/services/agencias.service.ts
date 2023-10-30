import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Agencia, AgencyRoutes } from '../models/agencia.model';

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

  getAgenciasLineas(): Observable<AgencyRoutes[]> {
    return this.http.get<AgencyRoutes[]>(this.baseUrl+'/lineas');
  }
}
