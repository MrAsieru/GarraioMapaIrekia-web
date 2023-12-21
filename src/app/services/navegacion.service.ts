import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PeticionNavegacion, RespuestaNavegacion } from '../models/navegacion.model';

@Injectable({
  providedIn: 'root'
})
export class NavegacionService {
  public baseUrl: string = environment.apiBaseUrl+"/navegacion/";

  constructor(private http: HttpClient) { }

  getNavegacion(peticion: PeticionNavegacion): Observable<RespuestaNavegacion> {
    return this.http.post<RespuestaNavegacion>(this.baseUrl, peticion);
  }
}
