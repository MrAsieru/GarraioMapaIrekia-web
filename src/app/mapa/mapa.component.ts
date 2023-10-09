import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import maplibregl, { PointLike } from 'maplibre-gl';
import { ModalListaLineasParadasComponent } from '../modal-lista-lineasparadas/modal-lista-lineasparadas.component';
import { ShapeVectorProperties } from 'src/app/models/shape.model';
import { StopVectorProperties } from 'src/app/models/stop.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TileCatalogService } from '../services/tile-catalog.service';
import { Catalog, TileSet } from '../models/tileset.model';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  standalone: true,
  imports: [IonicModule],
})
export class MapaComponent implements OnInit {
  configuracion = {
    maxzoom: 22,
  }
  map: maplibregl.Map;
  modalListaLineasParadasDatos: BehaviorSubject<{lineas: ShapeVectorProperties[], paradas: StopVectorProperties[]}> | null;
  
  // iconos_paradas = [
  //   {id: 'tram', url: 'assets/map/tram.png'},
  //   {id: 'subway', url: 'assets/map/subway.png'},
  //   {id: 'train', url: 'assets/map/train.png'},
  //   {id: 'bus', url: 'assets/map/bus.png'},
  //   {id: 'ferry', url: 'assets/map/ferry.png'},
  //   {id: 'aeriallift', url: 'assets/map/aeriallift.png'},
  //   {id: 'funicular', url: 'assets/map/funicular.png'}
  // ];
  // tipos_paradas = { // Tipos de ruta GTFS
  //   '0': 'tram', // Tram
  //   '1': 'subway', // Subway
  //   '2': 'train', // Rail
  //   '3': 'bus', // Bus
  //   '4': 'ferry', // Ferry
  //   '5': 'tram', // Cable Tram
  //   '6': 'aeriallift', // Aerial Lift
  //   '7': 'funicular', // Funicular
  //   '11': 'bus', // Trolleybus
  //   '12': 'train' // Monorail
  // };

  iconos_paradas = [
    {id: 'parada', url: 'assets/map/parada.png'},
    {id: 'entrada', url: 'assets/map/entrada.png'},
  ];
  tipos_paradas = { // Tipos de parada
    '0': 'parada', // Stop or Platform
    '1': 'parada', // Station
    '2': 'entrada', // Station Entrance/Exit
    '3': 'parada', // Generic Node
    '4': 'parada', // Boarding Area
  };
  
  constructor(private modalCtrl: ModalController, private tileCatalogService: TileCatalogService) {}

  ngOnInit() {
    this.modalListaLineasParadasDatos = null;

    // Mapa base
    this.map = new maplibregl.Map({
      container: 'map',
      style: {
        'version': 8,
        'sources': {
          "osm_source": {
            "type": "raster",
            "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            "tileSize": 256,
            "attribution": "&copy; OpenStreetMap Contributors",
            "maxzoom": 19
          }
        },
        "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        'layers': [
          {
            'id': 'osm',
            'type': 'raster',
            'source': 'osm_source'
          }
        ]
      },
      center: [-3, 43.1], // starting position [lng, lat]
      zoom: 9
    });

    let tilesets = this.getTilesetsInfo();

    this.map.on('load', () => {
      this.map.resize();
      
      Promise.all(
        this.iconos_paradas.map(img => new Promise<void>((resolve, reject) => {
          this.map.loadImage(img.url, (error, res) => {
            if (error) throw error;
            this.map.addImage(img.id, res!)
            resolve();
          })
        }))
      ).then(() => {
        tilesets.then((tilesets) => {
          // Añadir las fuentes
          tilesets.forEach((tileset) => {
            console.log("maxzoom: "+tileset.maxzoom+" minzoom: "+tileset.minzoom)
            this.map.addSource(`${tileset.id}_source`, {
              type: 'vector',
              tiles: [environment.tilesUrl+'/'+tileset.id+'/{z}/{x}/{y}'],
              maxzoom: tileset.maxzoom,
              minzoom: tileset.minzoom
            });
          });

          // Añadir las lineas
          tilesets.forEach((tileset) => {
            tileset.vector_layers.forEach((layer) => {
              if (layer.id === 'lineas') {
                this.map.addLayer({
                  'id': `${tileset.id}_${layer.id}`, // Nombre de la capa
                  'type': 'line',
                  'source': `${tileset.id}_source`, // Nombre de la fuente
                  'source-layer': `${layer.id}`, // Nombre de la capa de la fuente
                  'maxzoom': this.configuracion.maxzoom,
                  'minzoom': layer.minzoom,
                  'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  'paint': {
                    'line-color': ['get', 'color'],
                    'line-width': 2
                  }
                });
              }         
            });
          });

          // Añadir las paradas (para que estén por encima de las lineas)
          tilesets.forEach((tileset) => {
            tileset.vector_layers.forEach((layer) => {
              if (layer.id === 'paradas') {
                this.map.addLayer({
                  'id': `${tileset.id}_${layer.id}`, // Nombre de la capa
                  'type': 'symbol',
                  'source': `${tileset.id}_source`, // Nombre de la fuente
                  'source-layer': `${layer.id}`, // Nombre de la capa de la fuente
                  'maxzoom': this.configuracion.maxzoom,
                  'minzoom': layer.minzoom,
                  'layout': {
                    'icon-image': ['get', ['get', 'location_type'], ['literal', this.tipos_paradas]],
                    'icon-allow-overlap': true,
                    'icon-size': 0.5
                  }
                });
              }   
            });
          });
        });
      });
    });
    this.map.on('click', (e) => {
      const ne: PointLike = [e.point.x + 10, e.point.y - 10];
      const sw: PointLike = [e.point.x - 10, e.point.y + 10];
      const features = this.map.queryRenderedFeatures([ne, sw]);

      var lineas: ShapeVectorProperties[] = [];
      features?.filter(f => f.layer.id.endsWith("_lineas")).map(f => f.properties as ShapeVectorProperties).forEach(f => {
        if (!lineas.some(l => l.route_id === f.route_id)) {
          lineas.push(f);
        }
      });
      var paradas: StopVectorProperties[] = features?.filter(f => f.layer.id.endsWith("_paradas")).map(f => f.properties as StopVectorProperties);
      console.log(lineas)
      console.log(paradas)

      if (lineas.length + paradas.length > 0) {
        this.mostrarModal(lineas, paradas)
      }
    });
  }

  async mostrarModal(lineas: ShapeVectorProperties[], paradas: StopVectorProperties[]) {
    if (this.modalListaLineasParadasDatos === null) {
      this.modalListaLineasParadasDatos = new BehaviorSubject<{lineas: ShapeVectorProperties[], paradas: StopVectorProperties[]}>({lineas: lineas, paradas: paradas});
      const modal = await this.modalCtrl.create({
        component: ModalListaLineasParadasComponent,
        mode: 'md',
        initialBreakpoint: 0.25,
        backdropDismiss: true,
        backdropBreakpoint: 0.5,
        breakpoints: [0, 0.25, 0.5, 0.75, 1],
        componentProps: { datos: this.modalListaLineasParadasDatos.asObservable() }
      });
      modal.present();
      modal.onDidDismiss().then(() => {
        this.modalListaLineasParadasDatos = null;
      });
    } else {
      this.modalListaLineasParadasDatos.next({lineas: lineas, paradas: paradas});
    }
  }

  // Get info from each tileset present in the catalog and return a promise
  getTilesetsInfo(): Promise<TileSet[]> {
    return new Promise((resolve, reject) => {
      this.tileCatalogService.getCatalog().subscribe((catalog: Catalog) => {
        let tilesets: TileSet[] = [];
        Object.keys(catalog.tiles).forEach((item) => {
          this.tileCatalogService.getTileset(item).subscribe((tileset) => {
            tileset.id = item;
            tilesets.push(tileset);
          });
        });
        resolve(tilesets);
      });
    });
  }

  filtrarCapas(agencias: {agency_id: string; mostrar: boolean;}[]) {
    console.log(agencias);
    agencias.forEach((agencia) => {
      // Ahora se usa el ID del feed en vez de todo agency_id
      //TODO: Cambiar esto para que se use el agency_id
      this.map.getStyle().layers?.filter((layer) => layer.id.startsWith(agencia.agency_id.split("_")[0])).forEach((layer) => {
        this.map.setLayoutProperty(layer.id, 'visibility', agencia.mostrar ? 'visible' : 'none');
      });
    });
  }
}
