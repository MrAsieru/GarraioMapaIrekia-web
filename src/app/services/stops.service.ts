import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Stop } from '../models/stop.model';

@Injectable({
  providedIn: 'root'
})
export class StopsService {
  public baseUrl: string = environment.apiBaseUrl+"/stops";

  constructor(private http: HttpClient) { }

  getStops(): Observable<Stop[]> {
    return this.http.get<Stop[]>(this.baseUrl);
  }

  getStop(id: string): Observable<Stop> {
    return this.http.get<Stop>(this.baseUrl+"/"+id);
  }
}
