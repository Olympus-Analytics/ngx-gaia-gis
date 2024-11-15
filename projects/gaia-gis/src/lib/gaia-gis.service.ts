import { Injectable } from '@angular/core';
import TileLayer from 'ol/layer/tile';
import { XYZ } from 'ol/source';
import { transformExtent, fromLonLat } from 'ol/proj';
import { Feature, Map, View } from 'ol';
import { Style, Icon, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { FitOptions } from 'ol/View';
import 'ol/ol.css';
import VectorSource from 'ol/source/Vector';
import { MapsDesign } from './interfaces/MapDesigns';
@Injectable({
  providedIn: 'root',
})
export class GaiaGisService {
  private map!: Map;
  private labels = new TileLayer({
    source: new XYZ({
      url: 'https://{1-4}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png',
      attributions:
        'Gaia-GIS by © <a href="https://carto.com/attribution">Olympus Analytics</a>',
    }),
  });
  private rasterLayers: TileLayer[] = [];
  private pointLayer!: VectorLayer;

  constructor() {}

  /**
   * Initializes the map with a given target, center, zoom level, and design.
   * @param {string} target - The target element ID for the map.
   * @param {[number, number]} [center=[0, 0]] - The initial center of the map.
   * @param {number} [zoom=2] - The initial zoom level of the map.
   * @param {MapsDesign} [design=MapsDesign.CARTOCDN] - The design of the map.
   */
  initializeMap(
    target: string,
    {
      center = [0, 0],
      zoom = 2,
      design = MapsDesign.CARTOCDN,
    }: {
      center?: [number, number];
      zoom?: number;
      design?: MapsDesign;
    } = {
      center: [0, 0],
      zoom: 2,
      design: MapsDesign.CARTOCDN,
    }
  ): void {
    console.log('Inicializando el mapa...');
    this.map = new Map({
      target: target,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: design,
          }),
        }),
        this.labels,
      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
    });

    // Initialize the point layer
    this.pointLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'black', width: 1 }),
        }),
      }),
    });

    this.map.addLayer(this.pointLayer);
  }

  /**
   * Adds a raster layer to the map using a given URL.
   * @param {string} url - The URL of the GeoTIFF file.
   * @returns {Promise<void>}
   */
  async addRasterLayer(url: string): Promise<void> {
    try {
      const encodedUrl = encodeURIComponent(url);
      const boundsUrl = `https://tiles.rdnt.io/bounds?url=${encodedUrl}`;
      const response = await fetch(boundsUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const extent = transformExtent(result.bounds, 'EPSG:4326', 'EPSG:3857');
      this.map.getView().fit(extent, this.map.getSize() as FitOptions);

      const tilesUrl = this.createTilesUrl(encodedUrl);
      const cogLayer = new TileLayer({
        source: new XYZ({
          url: tilesUrl,
        }),
      });

      const layers = this.map.getLayers();
      if (layers.getLength() > 2) {
        layers.removeAt(2); // Remove the previous COG map
      }
      this.map.addLayer(cogLayer);
      this.rasterLayers.push(cogLayer);
    } catch (error) {
      console.error('Error al cargar el archivo GeoTIFF:', error);
      alert(`Request failed. Are you sure '${url}' is a valid COG?`);
    }
  }

  /**
   * Creates a tiles URL for the given encoded URL.
   * @param {string} url - The encoded URL of the GeoTIFF file.
   * @returns {string} - The tiles URL.
   */
  private createTilesUrl(url: string): string {
    return `https://tiles.rdnt.io/tiles/{z}/{x}/{y}?url=${url}`;
  }

  /**
   * Removes a raster layer from the map by its index.
   * @param {number} index - The index of the raster layer to remove.
   */
  removeRasterLayer(index: number): void {
    const layer = this.rasterLayers[index];
    if (layer) {
      this.map.removeLayer(layer);
      this.rasterLayers.splice(index, 1);
    }
  }

  /**
   * Sets the view of the map to a given center and zoom level.
   * @param {[number, number]} center - The new center of the map.
   * @param {number} zoom - The new zoom level of the map.
   */
  setView(center: [number, number], zoom: number): void {
    this.map.getView().setCenter(fromLonLat(center));
    this.map.getView().setZoom(zoom);
  }

  /**
   * Zooms the map to fit a given extent.
   * @param {[number, number, number, number]} extent - The extent to fit the map to.
   */
  zoomToExtent(extent: [number, number, number, number]): void {
    this.map.getView().fit(extent);
  }

  /**
   * Adds a list of points to the map.
   * @param {[number, number][]} points - The list of points to add to the map.
   * @param {string} [iconUrl='https://openlayers.org/en/latest/examples/data/icon.png'] - The URL of the icon to use for the points.
   */
  addPoints(
    points: [number, number][],
    iconUrl: string = 'https://openlayers.org/en/latest/examples/data/icon.png'
  ): void {
    console.log('Añadiendo puntos al mapa...');
    const features = points.map((point) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(point)),
      });
      feature.setStyle(
        new Style({
          image: new Icon({
            src: iconUrl,
            scale: 2, // Adjust the scale as needed
          }),
        })
      );
      return feature;
    });

    this.pointLayer.getSource()?.clear();
    this.pointLayer.getSource()?.addFeatures(features);
  }
}
