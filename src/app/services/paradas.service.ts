import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Parada } from '../models/parada.model';

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
}
