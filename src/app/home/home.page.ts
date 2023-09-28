import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import maplibregl, { PointLike } from 'maplibre-gl';
import { ModalListaLineasParadasComponent } from '../modal-lista-lineasparadas/modal-lista-lineasparadas.component';
import { ShapeVectorProperties } from 'src/app/models/shape.model';
import { StopVectorProperties } from 'src/app/models/stop.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  standalone: true,
  imports: [IonicModule],
})
export class HomePage implements OnInit {
  modalListaLineasParadasDatos: BehaviorSubject<{lineas: ShapeVectorProperties[], paradas: StopVectorProperties[]}> | null;
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.modalListaLineasParadasDatos = null;

    var map = new maplibregl.Map({
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

    map.on('load', function () {
      map.resize();
      map.addSource('bizkaibus_source', {
        type: 'vector',
        tiles: [environment.tilesUrl+'/bizkaibus/{z}/{x}/{y}'],
        maxzoom: 18
      });

      const images = [{url:'assets/icon/favicon.png',id:'bus'}]
      Promise.all(
        images.map(img => new Promise<void>((resolve, reject) => {
          map.loadImage(img.url, function (error, res) {
            if (error) throw error;
            map.addImage(img.id, res!)
            resolve();
          })
        }))
      ).then(() => {
        map.addLayer({
          'id': 'bizkaibus_paradas', // Nombre de la capa
          'type': 'symbol',
          'source': 'bizkaibus_source', // Nombre de la fuente
          'source-layer': 'paradas', // Nombre de la capa de la fuente
          'layout': {
            'icon-image': 'bus'
          }
        });
      });

        
      map.addLayer({
        'id': 'bizkaibus_lineas', // Nombre de la capa
        'type': 'line',
        'source': 'bizkaibus_source', // Nombre de la fuente
        'source-layer': 'lineas', // Nombre de la capa de la fuente
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': ['get', 'route_color'],
          'line-width': 2
        }
      });
    });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      // map.on('click', 'bizkaibus_lineas', function (e) {
      //   console.log(e)
      //   var coordinates = e.features?.[0].geometry.bbox;
      //   var lineas = e.features?.map(f => f.properties['name']);
      //   console.log(lineas)
      // });
      
      // // Change the cursor to a pointer when the mouse is over the places layer.
      // map.on('mouseenter', 'mi-capa', function () {
      //   map.getCanvas().style.cursor = 'pointer';
      // });
      
      // // Change it back to a pointer when it leaves.
      // map.on('mouseleave', 'mi-capa', function () {
      //   map.getCanvas().style.cursor = '';
      // });

      map.on('click', (e) => {
        const ne: PointLike = [e.point.x + 10, e.point.y - 10];
        const sw: PointLike = [e.point.x - 10, e.point.y + 10];
        const features = map.queryRenderedFeatures([ne, sw]);

        var lineas: ShapeVectorProperties[] = [];
        features?.filter(f => f.layer.id === 'bizkaibus_lineas').map(f => f.properties as ShapeVectorProperties).forEach(f => {
          if (!lineas.some(l => l.route_id === f.route_id)) {
            lineas.push(f);
          }
        });
        var paradas: StopVectorProperties[] = features?.filter(f => f.layer.id === 'bizkaibus_paradas').map(f => f.properties as StopVectorProperties);
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
        backdropDismiss: false,
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
}
