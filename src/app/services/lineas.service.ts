import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Linea, PatronLinea } from '../models/linea.model';
import { Parada } from '../models/parada.model';

@Injectable({
  providedIn: 'root'
})
export class LineasService {
  public baseUrl: string = environment.apiBaseUrl+"/lineas/";

  constructor(private http: HttpClient) { }

  getLineas(): Observable<Linea[]> {
    return this.http.get<Linea[]>(this.baseUrl);
  }

  getLinea(id: string): Observable<Linea> {
    return this.http.get<Linea>(this.baseUrl+id);
  }

  getParadasLinea(id: string): Observable<Parada[]> {
    return this.http.get<Parada[]>(this.baseUrl+id+"/paradas");
  }

  getPatronesLinea(id: string): Observable<PatronLinea[]> {
    return this.http.get<PatronLinea[]>(this.baseUrl+id+"/patrones");
  }
}
