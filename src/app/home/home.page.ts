import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HomePage implements OnInit {
  constructor() {}

  ngOnInit() {
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
        tiles: ['http://192.168.1.10:3000/bizkaibus/{z}/{x}/{y}'],
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
      map.on('click', 'mi-capa', function (e) {
        console.log(e)
        var coordinates = e.features?.[0].geometry.bbox;
        var lineas = e.features?.map(f => f.properties['name']);
        console.log(lineas)
      });
      
      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'mi-capa', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'mi-capa', function () {
        map.getCanvas().style.cursor = '';
      });
  }
}
