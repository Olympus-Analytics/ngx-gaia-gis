import { Injectable } from '@angular/core';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import { transformExtent, fromLonLat } from 'ol/proj';
import { Feature, Map, View } from 'ol';
import { Style, Icon, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { FitOptions } from 'ol/View';
import 'ol/ol.css';
import VectorSource from 'ol/source/Vector';
import { MapsDesign, Option } from '../interfaces';
import OSM from 'ol/source/OSM';
import { jsPDF } from 'jspdf';
import Overlay from 'ol/Overlay';
import { PointGaia } from '../interfaces/PointGaia.model';
@Injectable({
  providedIn: 'root',
})
export class GaiaGisService {
  private map!: Map;
  private labels = new TileLayer({
    source: new XYZ({
      attributions:
        'Gaia-GIS by © <a href="https://carto.com/attribution">Olympus Analytics</a>',
    }),
  });
  private rasterLayers: TileLayer[] = [];
  private pointLayer: VectorLayer<VectorSource>;
  private popup!: Overlay;

  constructor() {
    this.pointLayer = new VectorLayer({
      source: new VectorSource(),
    });
  }

  /**
   * Initializes the map with the specified target, center, zoom level, and design.
   * @param {string} target - The target element ID for the map.
   * @param {Object} options - Options for configuring the map.
   * @param {[number, number]} [options.center=[0, 0]] - The initial center of the map.
   * @param {number} [options.zoom=2] - The initial zoom level of the map.
   * @param {string} [options.design=MapsDesign.CARTOCDN] - The design of the map.
   */
  initializeMap(target: string, options: Option = {}): void {
    const { center = [0, 0], zoom = 2, design = MapsDesign.CARTOCDN } = options;

    let baseLayer: TileLayer;

    if (
      design.includes('{z}') &&
      design.includes('{x}') &&
      design.includes('{y}')
    ) {
      baseLayer = new TileLayer({
        source: new XYZ({
          url: design,
          crossOrigin: 'anonymous', // Add this line
        }),
      });
    } else {
      baseLayer = new TileLayer({
        source: new OSM(),
      });
    }

    this.labels = new TileLayer({
      source: new XYZ({
        url: 'https://{1-4}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png',
        attributions:
          'Gaia-GIS by © <a href="https://carto.com/attribution">Olympus Analytics</a>',
        crossOrigin: 'anonymous', // Add this line
      }),
    });

    this.map = new Map({
      target: target,
      layers: [
        baseLayer,
        this.pointLayer, // Add pointLayer here
      ],
      view: new View({
        center: fromLonLat(center),
        zoom: zoom,
      }),
    });

    this.initializePopup();
  }

  /**
   * Initializes the popup overlay for the map.
   */
  private initializePopup(): void {
    const container = document.getElementById('popup')!;
    const content = document.getElementById('popup-content')!;
    this.popup = new Overlay({
      element: container,
      autoPan: true,
    });
    this.map.addOverlay(this.popup);

    // Variable para controlar si el popup está visible
    let isPopupVisible = false;

    this.map.on('click', (event) => {
      const feature = this.map.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat
      );
      if (feature && feature.get('info')) {
        const coordinates = (feature.getGeometry() as Point).getCoordinates();
        content.innerHTML = feature.get('info');
        this.popup.setPosition(coordinates);

        // Mostrar el popup con animación
        if (!isPopupVisible) {
          container.classList.remove('hide');
          container.classList.add('show');
          isPopupVisible = true;
        }
      } else {
        if (isPopupVisible) {
          // Ocultar el popup con animación
          container.classList.remove('show');
          container.classList.add('hide');
          isPopupVisible = false;
        }
        // Asegurarse de que el popup se ocultará completamente después de la transición
        setTimeout(() => {
          this.popup.setPosition(undefined);
        }, 300); // Tiempo debe coincidir con la duración de la transición CSS
      }
    });

    // Cerrar el popup al hacer clic en el mapa en un área sin features
    this.map.on('pointermove', (event) => {
      this.map.getTargetElement().style.cursor = this.map.hasFeatureAtPixel(
        event.pixel
      )
        ? 'pointer'
        : '';
    });
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
   * Adds a list of points to the map with an optional icon.
   * @param {Array<{ coords: [number, number], info?: string }>} points - The list of points to add to the map.
   * @param {string} [iconUrl] - The URL of the icon to use for the points.
   */
  addPoints(points: PointGaia[], iconUrl?: string): void {
    console.log('Adding points to the map...');
    const features = points.map((point) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(point.coords)),
      });
      if (point.info) {
        feature.set('info', point.info);
      }
      if (iconUrl) {
        feature.setStyle(
          new Style({
            image: new Icon({
              src: iconUrl,
              scale: 0.1,
            }),
          })
        );
      } else {
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 5,
              fill: new Fill({ color: 'red' }),
              stroke: new Stroke({ color: 'black', width: 1 }),
            }),
          })
        );
      }
      return feature;
    });

    const source = this.pointLayer.getSource();
    if (source) {
      source.addFeatures(features);
    } else {
      console.error('La fuente de pointLayer no está disponible.');
    }
  }
  /**
   * Exports the current map view to a PDF file.
   */
  exportGaiaMapToPdf(): void {
    this.map.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas');
      const size = this.map.getSize()!;
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d')!;

      const canvases = document.querySelectorAll(
        '.ol-layer canvas'
      ) as NodeListOf<HTMLCanvasElement>;
      canvases.forEach((canvas) => {
        if (canvas.width > 0) {
          const opacity = canvas.parentElement?.style.opacity || '1';
          mapContext.globalAlpha = parseFloat(opacity);

          const transform = canvas.style.transform;
          const matrix = transform
            .match(/^matrix\(([^)]+)\)$/)?.[1]
            .split(',')
            .map(Number);

          if (matrix) {
            const domMatrix = new DOMMatrix(matrix);
            mapContext.setTransform(domMatrix);
          } else {
            mapContext.setTransform(1, 0, 0, 1, 0, 0);
          }

          mapContext.drawImage(canvas, 0, 0);
        }
      });

      const dataUrl = mapCanvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', undefined, 'a4');
      pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210);
      pdf.save('map.pdf');
    });

    this.map.renderSync();
  }
}
