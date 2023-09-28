import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Route } from '../models/route.model';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  public baseUrl: string = environment.apiBaseUrl+"/routes";

  constructor(private http: HttpClient) { }

  getRoutes(): Observable<Route[]> {
    return this.http.get<Route[]>(this.baseUrl);
  }

  getRoute(id: string): Observable<Route> {
    return this.http.get<Route>(this.baseUrl+"/"+id);
  }
}
