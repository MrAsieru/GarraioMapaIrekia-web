import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import maplibregl, { AttributionControl, ExpressionSpecification, FilterSpecification, GeoJSONSource, PointLike } from 'maplibre-gl';
import { ModalListaElementosComponent } from '../modal-lista-elementos/modal-lista-elementos.component';
import { ShapePropiedadesVectoriales } from 'src/app/models/linea.model';
import { StopPropiedadesVectoriales } from 'src/app/models/parada.model';
import { BehaviorSubject, Observable, Subject, Subscription, first } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TileService } from '../services/tile.service';
import { Catalog, TileSet } from '../models/tileset.model';
import { PosicionRespuesta, PosicionesFechas, PosicionesViajes } from '../models/posicion.model';
import { PosicionesService } from '../services/posiciones.service';
import moment, { Moment } from 'moment';
import { AgenciasService } from '../services/agencias.service';
import { TiempoRealService } from '../services/tiemporeal.service';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { FeedsService } from '../services/feeds.service';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { MapaService } from '../services/mapa.service';
import { AjusteMapa, FiltroMapa, MovimientoMapa } from '../models/mapa.model';
import { NavegacionService } from '../services/navegacion.service';
import { ViajePropiedadesVectoriales } from '../models/viaje.model';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  standalone: true,
  imports: [IonicModule, RouterModule],
})
export class MapaComponent implements OnInit, OnDestroy {
  configuracion = {
    maxzoom: 19,
  }
  map: maplibregl.Map;
  controlGeolocalizacion: maplibregl.GeolocateControl;
  modalListaElementosDatos: BehaviorSubject<{lineas: ShapePropiedadesVectoriales[], paradas: StopPropiedadesVectoriales[], viajes: ViajePropiedadesVectoriales[]}> | null;
  
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

  iconos = [
    {id: 'parada', url: 'assets/map/parada.png'},
    {id: 'entrada', url: 'assets/map/entrada.png'},
    {id: 'vehiculo', url: 'assets/map/bus.png'},
    {id: 'vehiculo_tr', url: 'assets/map/tiemporeal.png'}
  ];
  tipos_paradas = { // Tipos de parada
    '0': 'parada', // Stop or Platform
    '1': 'parada', // Station
    '2': 'entrada', // Station Entrance/Exit
    '3': 'parada', // Generic Node
    '4': 'parada', // Boarding Area
  };

  listaPosiciones: Map<string, GeoJSON.FeatureCollection<GeoJSON.Point>> | undefined = undefined; // Llave: idViaje, Valor: Lista de fechas y posiciones

  suscripcionTiempoReal: Subscription | undefined;

  private listaAgencias: string[] = [];
  private listaAgenciasVisibles: string[] = [];
  private listaFeedTiempoReal: string[] = [];
  private listaFeaturesTiempoReal: Map<string, Array<GeoJSON.Feature<GeoJSON.Point>>> = new Map();

  constructor(private modalCtrl: ModalController, 
    private tileService: TileService, 
    private posicionesService: PosicionesService, 
    private agenciasService: AgenciasService,
    private tiemporealService: TiempoRealService,
    private feedsService: FeedsService,
    private route: ActivatedRoute,
    private router: Router,
    private mapaService: MapaService,
    private navegacionService: NavegacionService) {}

  ngOnInit() {
    this.modalListaElementosDatos = null;

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
            "attribution": "&copy; <a href='https://www.openstreetmap.org/copyright'>Colaboradores de OpenStreetMap</a>",
            "maxzoom": this.configuracion.maxzoom
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
      zoom: 9,
      maxZoom: this.configuracion.maxzoom - 1,
      attributionControl: false
    });

    this.map.on('load', () => {
      this.map.resize();

      this.map.addControl(new maplibregl.ScaleControl({unit: 'metric'}), 'bottom-left');
      this.controlGeolocalizacion = new maplibregl.GeolocateControl({positionOptions: {enableHighAccuracy: true}, trackUserLocation: true});
      this.map.addControl(new AttributionControl({compact: false}), 'bottom-right');

      // Añadir fuentes
      this.map.addSource("posiciones", {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': []
        }
      });

      this.map.addSource("posiciones_tr", {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': []
        }
      });

      Promise.all(
        this.iconos.map(img => new Promise<void>((resolve, reject) => {
          this.map.loadImage(img.url, (error, res) => {
            if (error) throw error;
            this.map.addImage(img.id, res!)
            resolve();
          })
        }))
      ).then(() => {
        this.tileService.getTileset().subscribe((tileset) => {
          this.map.addSource("tiles_source", {
            type: 'vector',
            tiles: [environment.tilesUrl+'/tiles/{z}/{x}/{y}'],
            maxzoom: tileset.maxzoom,
            minzoom: tileset.minzoom,
            bounds: [tileset.bounds[0], tileset.bounds[1], tileset.bounds[2], tileset.bounds[3]],
            scheme: 'xyz'
          });

          // Añadir capas
          this.map.addLayer({
            'id': "lineas", // Nombre de la capa
            'type': 'line',
            'source': `tiles_source`, // Nombre de la fuente
            'source-layer': "lineas", // Nombre de la capa de la fuente
            'maxzoom': this.configuracion.maxzoom,
            'minzoom': tileset.vector_layers.find(layer => layer.id === "lineas")?.minzoom && 0,
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': ['get', 'color'],
              'line-width': 2
            }
          });

          this.map.addLayer({
            'id': "paradas", // Nombre de la capa
            'type': 'symbol',
            'source': "tiles_source", // Nombre de la fuente
            'source-layer': "paradas", // Nombre de la capa de la fuente
            'maxzoom': this.configuracion.maxzoom,
            'minzoom': tileset.vector_layers.find(layer => layer.id === "paradas")?.minzoom && 0,
            'layout': {
              'icon-image': ['get', ['get', 'tipo'], ['literal', this.tipos_paradas]],
              'icon-allow-overlap': true,
              'icon-size': 0.5
            }
          });

          this.map.addLayer({
            'id': "posiciones", // Nombre de la capa
            'type': 'symbol',
            'source': "posiciones", // Nombre de la fuente
            'maxzoom': this.configuracion.maxzoom,
            'minzoom': 0,
            'layout': {
              'icon-image': 'vehiculo_tr',
              'icon-allow-overlap': true,
              'icon-size': 0.5,
              'icon-anchor': 'bottom'
            }
          });

          this.map.addLayer({
            'id': "posiciones_tr", // Nombre de la capa
            'type': 'symbol',
            'source': "posiciones_tr", // Nombre de la fuente
            'maxzoom': this.configuracion.maxzoom,
            'minzoom': 0,
            'layout': {
              'icon-image': 'vehiculo_tr',
              'icon-allow-overlap': true,
              'icon-size': 0.5,
              'icon-anchor': 'bottom'
            }
          });

          this.mapaService.getAgenciasVisibles().subscribe((agencias) => {
            console.log(`getAgenciasVisibles(${agencias})`)
            this.filtrarAgencias(agencias);
          });

          this.mapaService.getFiltrosMapa().subscribe((filtros) => {
            this.filtrarMapa(filtros);
          });
    
          this.mapaService.getMovimientoMapa().subscribe((movimiento) => {
            this.moverMapa(movimiento);
          });

          this.mapaService.getAjusteMapa().subscribe((ajuste) => {
            this.ajustarMapa(ajuste);
          });

          this.mapaService.getLocalizacion().subscribe((localizar) => {
            if (localizar) {
              this.map.addControl(this.controlGeolocalizacion);
              setTimeout(() => {
                this.controlGeolocalizacion.trigger();
              }, 50);
            } else {
              this.map.removeControl(this.controlGeolocalizacion);
            }            
          });
        });
      });

      // Actualizar posiciones en el mapa
      setInterval(() => {
        const posiciones = this.listaPosiciones?.get(moment().milliseconds(0).toISOString());
        // console.log(posiciones)
        if (posiciones !== undefined) {
          // Actualizar fuente
          (this.map.getSource("posiciones") as GeoJSONSource).setData(posiciones);
        }
      }, 1000);


    });

    this.map.on('mouseenter', 'paradas', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    this.map.on('mouseleave', 'paradas', () => {
      this.map.getCanvas().style.cursor = '';
    });

    this.map.on('click', (e) => {
      const ne: PointLike = [e.point.x + 10, e.point.y - 10];
      const sw: PointLike = [e.point.x - 10, e.point.y + 10];
      console.log(`Click: ${JSON.stringify(ne)}, ${JSON.stringify(sw)}`);

      const neCoords = this.map.unproject(ne);
      const swCoords = this.map.unproject(sw);

      // Insert rectangle into the map
      this.map.addLayer({
        'id': `rectangle-${moment().format("HH:mm:ss.SSS")}`,
        'type': 'line',
        'source': {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [
                [swCoords.lng, neCoords.lat], // top left
                [neCoords.lng, neCoords.lat], // top right
                [neCoords.lng, swCoords.lat], // bottom right
                [swCoords.lng, swCoords.lat], // bottom left
                [swCoords.lng, neCoords.lat]  // back to top left
              ]
            }
          }
        },
        'paint': {
          'line-color': '#0000FF',
          'line-width': 1,
        }
      });

      let features = this.map.queryRenderedFeatures([ne, sw], { layers: ['posiciones'] });
      console.log(JSON.stringify(features));
      if (features.length > 0) {
        if (features.length == 1) {
          this.navegarA(['viaje', features[0].properties["idViaje"]]);
        } else {
          if (this.map.getZoom() < this.map.getMaxZoom() - 2) {
            // Ajustar mapa a posiciones
            let bounds = new maplibregl.LngLatBounds();
            features.forEach((feature) => {
              const coordenadas = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
              bounds.extend({lon: coordenadas[0], lat: coordenadas[1]});
            });
            this.map.fitBounds(bounds, {padding: 50, maxZoom: this.configuracion.maxzoom});
          } else {
            // Mostrar modal
            let viajes: ViajePropiedadesVectoriales[] = features.map(f => f.properties as ViajePropiedadesVectoriales);
            this.mostrarModalSeleccion([], [], viajes);            
          }
        }
        return;
      }

      features = this.map.queryRenderedFeatures([ne, sw], { layers: ['posiciones_tr'] });
      console.log(JSON.stringify(features));
      if (features.length > 0) {
        if (features.length == 1) {
          if (features[0].properties["idViaje"]) {
            this.navegarA(['viaje', features[0].properties["idViaje"]]);
          } else if (features[0].properties["idLinea"]) {
            this.navegarA(['linea', features[0].properties["idLinea"]]);
          }
        } else {
          if (this.map.getZoom() < this.map.getMaxZoom() - 2) {
            // Ajustar mapa a posiciones
            let bounds = new maplibregl.LngLatBounds();
            features.forEach((feature) => {
              const coordenadas = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
              bounds.extend({lon: coordenadas[0], lat: coordenadas[1]});
            });
            this.map.fitBounds(bounds, {padding: 50, maxZoom: this.configuracion.maxzoom});
          } else {
            // Mostrar modal
            let viajes: ViajePropiedadesVectoriales[] = features.map(f => f.properties as ViajePropiedadesVectoriales);
            this.mostrarModalSeleccion([], [], viajes);            
          }
        }
        return;
      }

      features = this.map.queryRenderedFeatures([ne, sw], { layers: ['paradas'] }).filter((feature) => feature.properties["paradaPadre"] === undefined || feature.properties["paradaPadre"] === "");
      console.log(JSON.stringify(features));
      // console.log(JSON.stringify(features));
      if (features.length > 0) {
        if (features.length == 1) {
          this.navegarA(['parada', features[0].properties["idParada"]]);
        } else {
          if (this.map.getZoom() < this.map.getMaxZoom() - 2) {
            // Ajustar mapa a paradas
            let bounds = new maplibregl.LngLatBounds();
            features.forEach((feature) => {
              const coordenadas = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
              bounds.extend({lon: coordenadas[0], lat: coordenadas[1]});
            });
            this.map.fitBounds(bounds, {padding: 50, maxZoom: this.configuracion.maxzoom});
          } else {
            const paradaUnica = new Set(...features.map(f => (f.properties["paradaPadre"] === "") ?  f.properties["idParada"] : f.properties["paradaPadre"] ));

            if (paradaUnica.size == 1) {
              this.navegarA(['parada', paradaUnica.values().next().value]);
            } else {
              // Mostrar modal
              let paradas: StopPropiedadesVectoriales[] = features.map(f => f.properties as StopPropiedadesVectoriales);
              this.mostrarModalSeleccion([], paradas, []);
            }
            
          }
        }
        return;
      }

      features = this.map.queryRenderedFeatures([ne, sw], { layers: ['lineas'] });
      console.log(JSON.stringify(features));
      if (features.length > 0) {
        const lineas = new Set(features.map(f => f.properties["idLinea"] as string));
        // console.log(lineas);
        if (lineas.size == 1) {
          this.navegarA(['linea', lineas.values().next().value]);
        } else {
          // Mostrar modal
          let lineas: ShapePropiedadesVectoriales[] = features.map(f => f.properties as ShapePropiedadesVectoriales).filter((linea, index, self) => self.findIndex(l => l.idLinea === linea.idLinea) === index);
          this.mostrarModalSeleccion(lineas, [], []);
        }
        return;
      }
    });

    this.map.on('mouseenter', 'lineas', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'lineas', () => {
      this.map.getCanvas().style.cursor = '';
    });

    this.feedsService.getFeedsTiempoReal().subscribe((feeds) => {
      this.listaFeedTiempoReal = feeds.map(f => f.idFeed);
      this.tiemporealService.actualizar_feeds(this.listaFeedTiempoReal);
    });

    this.suscripcionTiempoReal = this.tiemporealService.tiempoReal.subscribe((tiempoReal) => {
      // console.log(tiempoReal);
      // Añadir posiciones al mapa
      if (tiempoReal !== undefined) {
        let geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
          'type': 'FeatureCollection',
          'features': []
        };

        let features: Array<GeoJSON.Feature<GeoJSON.Point>> = [];
        tiempoReal.entidades.forEach((entidad: transit_realtime.IFeedEntity) => {
          if (entidad.vehicle) {
            features.push({
              type: 'Feature',
              geometry: {
                'type': 'Point',
                'coordinates': [entidad.vehicle.position!.longitude, entidad.vehicle.position!.latitude]
              },
              properties: {
                'idFeed': tiempoReal.idFeed,
                ...(entidad.vehicle?.trip?.tripId && {'idViaje': tiempoReal.idFeed+"_"+entidad.vehicle?.trip?.tripId}),
                ...(entidad.vehicle?.trip?.routeId && {'idLinea': tiempoReal.idFeed+"_"+entidad.vehicle?.trip?.routeId}),
                ...(entidad.vehicle?.trip?.directionId && {'direccion': entidad.vehicle?.trip?.directionId}),
                ...(entidad.vehicle?.trip?.scheduleRelationship && {'relacionHorario': entidad.vehicle?.trip?.scheduleRelationship}),
                ...(entidad.vehicle?.vehicle?.label && {'etiqueta': entidad.vehicle?.vehicle?.label}),
                ...(entidad.vehicle?.vehicle?.licensePlate && {'matricula': entidad.vehicle?.vehicle?.licensePlate}),
                // ...(entidad.vehicle?.vehicle?. && {'accesibilidad': entidad.vehicle?.trip?.routeId}),
                ...(entidad.vehicle?.position?.bearing && {'rumbo': entidad.vehicle?.position?.bearing}),
                ...(entidad.vehicle?.position?.odometer && {'odometro': entidad.vehicle?.position?.odometer}),
                ...(entidad.vehicle?.position?.speed && {'velocidad': entidad.vehicle?.position?.speed}),
                ...(entidad.vehicle?.currentStopSequence && {'secuenciaParada': entidad.vehicle?.currentStopSequence}),
                ...(entidad.vehicle?.stopId && {'idParada': tiempoReal.idFeed+"_"+entidad.vehicle?.stopId}),
                ...(entidad.vehicle?.currentStatus && {'estadoActual': entidad.vehicle?.currentStatus}),
                ...(entidad.vehicle?.timestamp && {'timestamp': entidad.vehicle?.timestamp}),
                ...(entidad.vehicle?.congestionLevel && {'congestion': entidad.vehicle?.congestionLevel}),
                ...(entidad.vehicle?.occupancyStatus && {'ocupacion': entidad.vehicle?.occupancyStatus}),
                ...(entidad.vehicle?.occupancyPercentage && {'ocupacionPorcentaje': entidad.vehicle?.occupancyPercentage}),
              }
            });
          }
        });

        // Guardar features de este feed
        this.listaFeaturesTiempoReal.set(tiempoReal.idFeed, features);

        // Unir todas las features de todos los feeds
        this.listaFeaturesTiempoReal.forEach((features, idFeed) => {
          geojson.features.push(...features);
        });

        // Actualizar fuente
        (this.map.getSource("posiciones_tr") as GeoJSONSource)?.setData(geojson);
      }
    });

    // Obtener lista de agencias
    this.mapaService.listaAgencias.subscribe((agencias) => {
      if (agencias.length > 0 && this.listaAgencias.length === 0) {
        this.listaAgencias = agencias.map(a => a.idAgencia);
        this.listaAgenciasVisibles = this.listaAgencias;

        this.prepararPosiciones();
      }      
    });
  }

  prepararPosiciones() {
    // Descargar posiciones de este minuto
    console.log(`${moment().format("HH:mm:ss.SSS")} - Descargar posiciones`)
    this.descargarPosiciones(this.listaAgencias);

    // Descargar proximas posiciones cada minuto en el segundo 30
    let millisegundos = moment().seconds() * 1000 + moment().milliseconds();
    let timeout: number;
    console.log(`${moment().format("HH:mm:ss.SSS")} - ms: ${millisegundos}`)
    if (millisegundos > 30000) {
      timeout = 60000 - millisegundos + 30000;
      console.log(`${moment().format("HH:mm:ss.SSS")} - Timeout: ${timeout}`)
      console.log(`${moment().format("HH:mm:ss.SSS")} - Descargar posiciones`)
      this.descargarPosiciones(this.listaAgencias);
    } else {
      timeout = 30000 - millisegundos;
      console.log(`${moment().format("HH:mm:ss.SSS")} - Timeout: ${timeout}`)
    }
    setTimeout(() => {
      // Si hace falta sincronizar usar this.cadaMinuto
      console.log(`${moment().format("HH:mm:ss.SSS")} - SetInterval`)
      this.descargarPosiciones(this.listaAgencias);
      setInterval(() => {console.log(`${moment().format("HH:mm:ss.SSS")} - Intervalo segundo 30`); this.descargarPosiciones(this.listaAgencias); console.log(`${moment().format("HH:mm:ss.SSS")} - Vuelta al ciclo`);}, 60000-25); // 25ms: Lo que tarda en volver al ciclo normalmente
    }, timeout);
  }

  async mostrarModalSeleccion(lineas: ShapePropiedadesVectoriales[], paradas: StopPropiedadesVectoriales[], viajes: ViajePropiedadesVectoriales[]) {
    if (this.modalListaElementosDatos === null) {
      this.modalListaElementosDatos = new BehaviorSubject<{lineas: ShapePropiedadesVectoriales[], paradas: StopPropiedadesVectoriales[], viajes: ViajePropiedadesVectoriales[]}>({lineas: lineas, paradas: paradas, viajes: viajes});
      const modal = await this.modalCtrl.create({
        id: 'modal-lista-elementos',
        component: ModalListaElementosComponent,
        mode: 'md',
        initialBreakpoint: 0.25,
        backdropDismiss: true,
        backdropBreakpoint: 0.5,
        breakpoints: [0, 0.25, 0.5, 0.75, 1],
        componentProps: { route: this.route, datos: this.modalListaElementosDatos.asObservable() }
      });
      modal.present();
      modal.onDidDismiss().then(() => {
        this.modalListaElementosDatos = null;
      });
    } else {
      this.modalListaElementosDatos.next({lineas: [...lineas], paradas: [...paradas], viajes: [...viajes]});
    }
  }

  filtrarAgencias(agencias: string[]) {
    console.log(`filtrarAgencias(${agencias})`);
    this.listaAgenciasVisibles = agencias;

    this.filtrarMapa({});
  }

  filtrarMapa(filtrosMapa: FiltroMapa) {
    // console.log(filtrosMapa);
    let agencias_lineas_posiciones = null;
    let agencias_paradas: ExpressionSpecification | null = null;
    let feeds_posiciones: FilterSpecification | null = null;
    let lineas = null;
    let paradas = null;
    let viajes = null;
    let recorridos = null;
    let posiciones_tr_lineas_viajes = null;
    if (filtrosMapa.agencias) {
      agencias_lineas_posiciones = ['in', 'idAgencia', ...filtrosMapa.agencias!] as FilterSpecification;
      agencias_paradas = ['any', ...filtrosMapa.agencias.map((agencia) => ['in', agencia, ['get', 'agencias']] as ExpressionSpecification)];  
      feeds_posiciones= ['in', 'idFeed', ...filtrosMapa.agencias.map((agencia) => agencia.split(/_(.*)/s)[0])];
    } else {
      console.trace()
      console.log(this.listaAgencias)
      console.log(this.listaAgenciasVisibles)
      if (!filtrosMapa.lineas && !filtrosMapa.paradas && !filtrosMapa.recorridos && !filtrosMapa.viajes && this.listaAgencias.length - this.listaAgenciasVisibles.length > 0) {
        agencias_lineas_posiciones = ['in', 'idAgencia', ...this.listaAgenciasVisibles] as FilterSpecification;
        agencias_paradas = ['any', ...this.listaAgenciasVisibles.map((agencia) => ['in', agencia, ['get', 'agencias']] as ExpressionSpecification)];
        feeds_posiciones= ['in', 'idFeed', ...this.listaAgenciasVisibles.map((agencia) => agencia.split(/_(.*)/s)[0])];
      }
      if (filtrosMapa.lineas) {
        lineas = ['in', 'idLinea', ...filtrosMapa.lineas!] as FilterSpecification;
      }
      if (filtrosMapa.paradas) {
        paradas = ['any', ['in', 'idParada', ...filtrosMapa.paradas!] as FilterSpecification, ['in', 'paradaPadre', ...filtrosMapa.paradas!] as FilterSpecification] as FilterSpecification
        // paradas = ['in', 'idParada', ...filtrosMapa.paradas!] as FilterSpecification;
      }
      if (filtrosMapa.viajes) {
        viajes = ['in', 'idViaje', ...filtrosMapa.viajes!] as FilterSpecification;
      }
      if (filtrosMapa.recorridos) {
        recorridos = ['in', 'idRecorrido', ...filtrosMapa.recorridos!] as FilterSpecification;
      }
      if (filtrosMapa.lineas && filtrosMapa.viajes) {
        posiciones_tr_lineas_viajes = ['any', ['in', 'idLinea', ...filtrosMapa.lineas!] as FilterSpecification, ['in', 'idViaje', ...filtrosMapa.viajes!] as FilterSpecification] as FilterSpecification;
      }
    }

    this.map.setFilter("lineas", (agencias_lineas_posiciones !== null) ? agencias_lineas_posiciones : ((lineas != null) ? lineas : recorridos));
    this.map.setFilter("posiciones", (agencias_lineas_posiciones !== null) ? agencias_lineas_posiciones : ((lineas != null) ? lineas : viajes));
    this.map.setFilter("posiciones_tr", (feeds_posiciones !== null) ? feeds_posiciones : ((posiciones_tr_lineas_viajes !== null) ? posiciones_tr_lineas_viajes : ((lineas != null) ? lineas : viajes)));
    this.map.setFilter("paradas", (agencias_paradas !== null) ? agencias_paradas : paradas);
  }

  moverMapa(movimientoMapa: MovimientoMapa) {
    const lat = movimientoMapa.latitud || this.map.getCenter().lat;
    const lon = movimientoMapa.longitud || this.map.getCenter().lng;
    const zoom = movimientoMapa.zoom || this.map.getZoom();

    this.map.flyTo({
      center: [lon, lat],
      zoom: (zoom >= 0) ? zoom : this.map.getMaxZoom()
    });
  }

  ajustarMapa(ajusteMapa: AjusteMapa) {
    if (ajusteMapa.bbox) {
      const bbox = ajusteMapa.bbox;
      const offset = ajusteMapa.offset || 50;
      const zoomMax = ajusteMapa.zoomMax || this.map.getMaxZoom();
      const linear = ajusteMapa.linear || false;
  
      this.map.fitBounds([bbox[0], bbox[1], bbox[2], bbox[3]], {padding: offset, maxZoom: zoomMax, linear: linear});
    }
  }

  cadaMinuto(callback: () => void) {
    // https://stackoverflow.com/a/53892053
    var timerFunc = function () {
        // get the current time rounded down to a whole second (with a 10% margin)
        var now = 1000 * Math.floor(Date.now() / 1000 + 0.1);
        // run the callback
        callback();
        // wait for the next whole minute
        setTimeout(timerFunc, now + 60000 - Date.now());
    };
    timerFunc();
  }

  descargarPosiciones(agencias: string[]) {
    const inicio = moment()
    let endpoint: Observable<PosicionRespuesta>;
    if (this.listaPosiciones === undefined) {
      // console.log(`Descargar (primero) - ${moment().toISOString()}`)
      console.log(`${moment().format("HH:mm:ss.SSS")} - Descargar (primero)`)
      this.listaPosiciones = new Map();
      endpoint = this.posicionesService.getPosicionesActuales(agencias);
    } else {
      // console.log(`Descargar - ${moment().toISOString()}`)
      console.log(`${moment().format("HH:mm:ss.SSS")} - Descargar (siguiente)`)
      endpoint = this.posicionesService.getPosicionesProximoMinuto(agencias);
    }

    endpoint.subscribe((posiciones) => {
      console.log(`${moment().format("HH:mm:ss.SSS")} - Posiciones descargadas ${posiciones.fecha}`)
      let listaFechas: Array<{fecha: string, features: Array<GeoJSON.Feature<GeoJSON.Point>>}> = [];
      posiciones.agencias.forEach((agencia) => {
        agencia.viajes.forEach((viaje) => {
          let posiciones_decodificadas = this.decodificarPosiciones(moment(posiciones.fecha), viaje.posiciones);
          Object.keys(posiciones_decodificadas).forEach((fecha) => {
            if (!listaFechas.some(f => f.fecha === fecha)) {
              listaFechas.push({fecha: fecha, features: []});
            }

            const posicion = posiciones_decodificadas[fecha];
            // Get the feature array by fecha
            listaFechas.find(f => f.fecha === fecha)?.features.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [posicion.lon, posicion.lat]
              },
              properties: {
                idAgencia: agencia.idAgencia,
                idLinea: viaje.idLinea,
                idViaje: viaje.idViaje,
                proximoOrdenParada: posicion.proximoOrdenParada
              }
            });
          });
        });
      });

      // Guardar features
      console.log(`${moment().format("HH:mm:ss.SSS")} - Guardar features`)
      listaFechas.forEach((t) => {
        let geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
          'type': 'FeatureCollection',
          'features': t.features
        };
        this.listaPosiciones?.set(t.fecha, geojson);
      });

      // console.log(this.listaPosiciones)

      // Eliminar posiciones antiguas
      console.log(`${moment().format("HH:mm:ss.SSS")} - Eliminar posiciones antiguas`)
      this.listaPosiciones?.forEach((_, fecha) => {
        if (moment(fecha).isBefore(moment(posiciones.fecha).subtract(1, 'minute'))) {
          this.listaPosiciones?.delete(fecha);
        }
      });

      // console.log("Descargado en " + moment().diff(inicio, 'milliseconds') + "ms");
      console.log(`${moment().format("HH:mm:ss.SSS")} - Descargado en ${moment().diff(inicio, 'milliseconds')}ms`)
    });
  }

  decodificarPosiciones(fechaInicial: Moment, posiciones: string): PosicionesFechas {
    // Formato: lat|lon|proximoOrdenParada~lat|lon|proximoOrdenParada~...
    // ~: separa posiciones, |: separa lat, lon y proximoOrdenParada, @: datos vacios
    let PRECISION_COORDENADAS = 6;

    let posiciones_decodificadas: PosicionesFechas = {};
    let posiciones_separadas = posiciones.split("~");

    let latAnterior: number | undefined = undefined;
    let lonAnterior: number | undefined = undefined;
    let lat: number;
    let lon: number;

    let i = 0;
    posiciones_separadas.forEach((posicion) => {
      let posicion_separada = posicion.split("|");
      if (posicion_separada[0] !== '@' && posicion_separada[1] !== '@' && posicion_separada[2] !== '@') {
        if (latAnterior === undefined || lonAnterior === undefined) {
          lat = parseFloat(posicion_separada[0]);
          lon = parseFloat(posicion_separada[1]);
        } else {
          lat = latAnterior + (parseFloat(posicion_separada[0]) / Math.pow(10, PRECISION_COORDENADAS));
          lon = lonAnterior + (parseFloat(posicion_separada[1]) / Math.pow(10, PRECISION_COORDENADAS));
        }
        latAnterior = lat;
        lonAnterior = lon;
        let proximoOrdenParada = parseInt(posicion_separada[2]);
        let fecha = fechaInicial.clone().add(i++, 'seconds').milliseconds(0).toISOString();
        posiciones_decodificadas[fecha] = {lat: lat, lon: lon, proximoOrdenParada: proximoOrdenParada};

        latAnterior = lat;
        lonAnterior = lon;
      }
    });

    return posiciones_decodificadas;
  }

  ngOnDestroy() {
    this.suscripcionTiempoReal?.unsubscribe();
  }

  navegarA(ruta: string[]) {
    this.navegacionService.navegarA(ruta, this.route);
  }
}
