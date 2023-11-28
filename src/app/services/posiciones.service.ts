import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PosicionRespuesta } from '../models/posicion.model';
import moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class PosicionesService {
  public baseUrl: string = environment.apiBaseUrl+"/posiciones/";

  constructor(private http: HttpClient) { }

  getPosicionesActuales(agencias: string[]): Observable<PosicionRespuesta> {
    // Solicitud con fecha actual
    return this.http.post<PosicionRespuesta>(this.baseUrl, {
      "fecha": moment().seconds(0).milliseconds(0).toISOString(true),
      "agencias": agencias
    });
  }

  getPosicionesProximoMinuto(agencias: string[]): Observable<PosicionRespuesta> {
    // Solicitud con fecha siguiente
    return this.http.post<PosicionRespuesta>(this.baseUrl, {
      "fecha": moment().seconds(0).milliseconds(0).add(1, 'minutes').toISOString(true),
      "agencias": agencias
    });
  }
}
