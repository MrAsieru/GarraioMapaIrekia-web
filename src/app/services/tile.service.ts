import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Catalog, TileSet } from '../models/tileset.model';

@Injectable({
  providedIn: 'root'
})
export class TileService {
  public baseUrl: string = environment.tilesUrl;

  constructor(private http: HttpClient) { }

  getTileset(): Observable<TileSet> {
    return this.http.get<TileSet>(this.baseUrl+"/tiles");
  }
}
