import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Linea } from '../models/linea.model';

@Injectable({
  providedIn: 'root'
})
export class LineasService {
  public baseUrl: string = environment.apiBaseUrl+"/lineas";

  constructor(private http: HttpClient) { }

  getLineas(): Observable<Linea[]> {
    return this.http.get<Linea[]>(this.baseUrl);
  }

  getLinea(id: string, incluirParadas: boolean = false): Observable<Linea> {
    return this.http.get<Linea>(this.baseUrl+"/"+id, {params: {incluirParadas: incluirParadas}});
  }

  getLineaConParadas(id: string): Observable<Linea> {
    return this.http.get<Linea>(this.baseUrl+"/"+id, {params: {incluirParadas: "true"}});
  }
}
