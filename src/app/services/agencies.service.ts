import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Agency, AgencyRoutes } from '../models/agency.model';

@Injectable({
  providedIn: 'root'
})
export class AgenciesService {
  public baseUrl: string = environment.apiBaseUrl+"/agencies";

  constructor(private http: HttpClient) { }

  getAgencies(): Observable<Agency[]> {
    return this.http.get<Agency[]>(this.baseUrl);
  }

  getAgency(id: string): Observable<Agency> {
    return this.http.get<Agency>(this.baseUrl+'/'+id);
  }

  getAgenciesRoutes(): Observable<AgencyRoutes[]> {
    return this.http.get<AgencyRoutes[]>(this.baseUrl+'/routes');
  }
}
