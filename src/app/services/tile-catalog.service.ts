import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Catalog, TileSet } from '../models/tileset.model';

@Injectable({
  providedIn: 'root'
})
export class TileCatalogService {
  public baseUrl: string = environment.tilesUrl;

  constructor(private http: HttpClient) { }

  getCatalog(): Observable<Catalog> {
    return this.http.get<Catalog>(this.baseUrl+"/catalog");
  }

  getTileset(id: string): Observable<TileSet> {
    return this.http.get<TileSet>(this.baseUrl+"/"+id);
  }

  getTilesets(ids: string[]): Observable<TileSet[]> {
    return this.http.get<TileSet[]>(this.baseUrl+"/"+ids.join(","));
  }
}
