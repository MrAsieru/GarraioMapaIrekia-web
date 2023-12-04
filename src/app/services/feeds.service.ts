import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Feed } from '../models/feed.model';

@Injectable({
  providedIn: 'root'
})
export class FeedsService {
  public baseUrl: string = environment.apiBaseUrl+"/feeds/";

  constructor(private http: HttpClient) { }

  getFeeds(): Observable<Feed[]> {
    return this.http.get<Feed[]>(this.baseUrl);
  }

  getFeedsTiempoReal(): Observable<Feed[]> {
    return this.http.get<Feed[]>(this.baseUrl+"tiempoReal");
  }
}
