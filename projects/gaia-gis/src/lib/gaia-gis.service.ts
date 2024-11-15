import { Injectable } from '@angular/core';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { GeoTIFF } from 'ol/source';
import { Tile } from 'ol/layer';
import GeoTIFFSource from 'ol/source/GeoTIFF.js';
import TileLayer from 'ol/layer/Tile.js';
import { fromLonLat } from 'ol/proj.js';
import OSM from 'ol/source/OSM.js';
@Injectable({
  providedIn: 'root',
})
export class GaiaGisService {
  private map!: Map;
  private rasterLayers: TileLayer[] = [];

  constructor() {}

  initializeMap(
    target: string,
    center: [number, number] = [0, 0],
    zoom: number = 2
  ): void {
    console.log('Inicializando el mapaSDAWD');
    this.map = new Map({
      target: target,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
    });
  }

  addRasterLayer(url: string): void {
    const rasterLayer = new TileLayer({
      source: new GeoTIFFSource({
        sources: [
          {
            url: url,
            bands: [1], // Select the band
          },
        ],
      }),
    });
    this.map.addLayer(rasterLayer);
    this.rasterLayers.push(rasterLayer);
  }

  removeRasterLayer(index: number): void {
    const layer = this.rasterLayers[index];
    if (layer) {
      this.map.removeLayer(layer);
      this.rasterLayers.splice(index, 1);
    }
  }

  setView(center: [number, number], zoom: number): void {
    this.map.getView().setCenter(fromLonLat(center));
    this.map.getView().setZoom(zoom);
  }

  zoomToExtent(extent: [number, number, number, number]): void {
    this.map.getView().fit(extent);
  }
}
