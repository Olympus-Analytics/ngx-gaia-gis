import { Injectable, signal, computed, linkedSignal } from '@angular/core';
import TileLayer from 'ol/layer/Tile';
import { XYZ } from 'ol/source';
import { transformExtent, fromLonLat, toLonLat } from 'ol/proj';
import { Feature, Map, View } from 'ol';
import { Style, Icon, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { Point, Polygon } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { FitOptions } from 'ol/View';
import 'ol/ol.css';
import VectorSource from 'ol/source/Vector';
import { MapsDesign, Option, PolygonGaia } from '../interfaces';
import OSM from 'ol/source/OSM';
import { jsPDF } from 'jspdf';
import Overlay from 'ol/Overlay';
import { PointGaia } from '../interfaces/PointGaia.model';
import Draw from 'ol/interaction/Draw';
import { unByKey } from 'ol/Observable';

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
  
  // Polygon drawing properties
  private polygonLayer: VectorLayer<VectorSource>;
  private drawInteraction: Draw | null = null;
  private keyListener: any = null;
  
  // Highlight layer for the starting point
  private highlightLayer: VectorLayer<VectorSource>;
  private startPointFeature: Feature | null = null;
  
  // 🔥 Angular 20 Signals for reactive state management
  
  /**
   * Signal to track if polygon drawing is active
   */
  public readonly isDrawingPolygon = signal<boolean>(false);
  
  /**
   * Signal to store the current polygon being drawn
   */
  public readonly currentPolygon = signal<PolygonGaia | null>(null);
  
  /**
   * Signal to store all completed polygons
   */
  public readonly completedPolygons = signal<PolygonGaia[]>([]);
  
  /**
   * Signal to track drawing mode state
   */
  public readonly drawingState = signal<'idle' | 'drawing' | 'completing' | 'cancelled'>('idle');
  
  /**
   * Computed signal for drawing status message
   */
  public readonly drawingStatus = computed(() => {
    const state = this.drawingState();
    const isDrawing = this.isDrawingPolygon();
    
    switch (state) {
      case 'idle':
        return 'Ready to draw';
      case 'drawing':
        return 'Click to add vertices. Press Enter or click start point to complete.';
      case 'completing':
        return 'Polygon completed!';
      case 'cancelled':
        return 'Drawing cancelled';
      default:
        return 'Ready to draw';
    }
  });
  
  /**
   * Computed signal for polygon count
   */
  public readonly polygonCount = computed(() => this.completedPolygons().length);

  // 🔥 Linked signal to handle auto-reset of drawing state
  private readonly autoResetState = linkedSignal(() => {
    const state = this.drawingState();
    
    if (state === 'completing' || state === 'cancelled') {
      console.log(`Drawing state changed: ${state}, auto-resetting in 2s`);
      setTimeout(() => {
        this.drawingState.set('idle');
      }, 2000);
    }
    
    return state;
  });

  // 🔥 Linked signal to track polygon count changes
  private readonly polygonLogger = linkedSignal(() => {
    const polygons = this.completedPolygons();
    const count = polygons.length;
    
    if (count > 0) {
      console.log(`Total polygons: ${count}`);
      console.log('Latest polygon:', polygons[count - 1]);
    }
    
    return count;
  });

  // 🔥 Public computed signals that activate the linkedSignals by consuming them
  public readonly stateStatus = computed(() => {
    // This computed consumes the autoResetState linkedSignal, keeping it active
    const state = this.autoResetState();
    return `Current state: ${state}`;
  });

  public readonly polygonLogger$ = computed(() => {
    // This computed consumes the polygonLogger linkedSignal, keeping it active
    return this.polygonLogger();
  });

  constructor() {
    this.pointLayer = new VectorLayer({
      source: new VectorSource(),
    });
    
    // 🔥 LinkedSignals will be activated when accessed by computeds
    
    this.polygonLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: '#ff0000',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)',
        }),
      }),
    });

    // Layer for highlighting the starting point
    this.highlightLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: 'rgba(0, 255, 0, 0.8)', // Bright green
          }),
          stroke: new Stroke({
            color: '#00ff00',
            width: 3,
          }),
        }),
      }),
      zIndex: 1000, // Ensure it's on top
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
          crossOrigin: 'anonymous',
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
        crossOrigin: 'anonymous',
      }),
    });

    this.map = new Map({
      target: target,
      layers: [
        baseLayer,
        this.pointLayer,
        this.polygonLayer,
        this.highlightLayer, // Add highlight layer on top
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

        if (!isPopupVisible) {
          container.classList.remove('hide');
          container.classList.add('show');
          isPopupVisible = true;
        }
      } else {
        if (isPopupVisible) {
          container.classList.remove('show');
          container.classList.add('hide');
          isPopupVisible = false;
        }
        setTimeout(() => {
          this.popup.setPosition(undefined);
        }, 300);
      }
    });

    this.map.on('pointermove', (event) => {
      this.map.getTargetElement().style.cursor = this.map.hasFeatureAtPixel(
        event.pixel
      )
        ? 'pointer'
        : '';
    });
  }

  /**
   * Highlights the starting point of the polygon being drawn
   * @param {[number, number]} coordinate - The coordinate to highlight
   */
  private highlightStartPoint(coordinate: [number, number]): void {
    this.clearStartPointHighlight();
    
    this.startPointFeature = new Feature({
      geometry: new Point(coordinate),
    });
    
    // Add pulsing animation effect
    const style = new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({
          color: 'rgba(0, 255, 0, 0.8)',
        }),
        stroke: new Stroke({
          color: '#00ff00',
          width: 3,
        }),
      }),
    });
    
    this.startPointFeature.setStyle(style);
    this.highlightLayer.getSource()!.addFeature(this.startPointFeature);
    
    // Add pulsing effect with CSS-like animation
    this.animateStartPoint();
  }

  /**
   * Animates the starting point with a pulsing effect
   */
  private animateStartPoint(): void {
    if (!this.startPointFeature || !this.isDrawingPolygon()) {
      return;
    }

    let radius = 8;
    let growing = true;
    const animate = () => {
      if (!this.startPointFeature || !this.isDrawingPolygon()) {
        return;
      }

      if (growing) {
        radius += 0.5;
        if (radius >= 12) growing = false;
      } else {
        radius -= 0.5;
        if (radius <= 8) growing = true;
      }

      const style = new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({
            color: 'rgba(0, 255, 0, 0.6)',
          }),
          stroke: new Stroke({
            color: '#00ff00',
            width: 3,
          }),
        }),
      });

      this.startPointFeature.setStyle(style);
      
      if (this.isDrawingPolygon()) {
        setTimeout(animate, 100);
      }
    };

    animate();
  }

  /**
   * Clears the starting point highlight
   */
  private clearStartPointHighlight(): void {
    const source = this.highlightLayer.getSource();
    if (source) {
      source.clear();
    }
    this.startPointFeature = null;
  }

  /**
   * 🔥 Starts polygon drawing mode using signals for state management.
   * Users can click to add vertices and complete the polygon by clicking the first point again or pressing Enter.
   */
  startPolygonDraw(): void {
    if (this.isDrawingPolygon()) {
      this.cancelPolygonDraw();
    }

    // 🔥 Update signals
    this.isDrawingPolygon.set(true);
    this.drawingState.set('drawing');
    this.currentPolygon.set(null);

    this.map.getTargetElement().style.cursor = 'crosshair';

    // Create draw interaction for polygons
    this.drawInteraction = new Draw({
      source: this.polygonLayer.getSource()!,
      type: 'Polygon',
      style: new Style({
        stroke: new Stroke({
          color: '#ff0000',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)',
        }),
      }),
    });

    // Handle drawing start to highlight the first point
    this.drawInteraction.on('drawstart', (event) => {
      // Listen for the first coordinate
      const geometry = event.feature.getGeometry() as Polygon;
      
      // Use a small delay to ensure the coordinate is set
      setTimeout(() => {
        const coordinates = geometry.getCoordinates()[0];
        if (coordinates && coordinates.length > 0) {
          const firstCoord = coordinates[0] as [number, number];
          this.highlightStartPoint(firstCoord);
        }
      }, 50);
    });

    // Handle polygon completion
    this.drawInteraction.on('drawend', (event) => {
      const feature = event.feature;
      const geometry = feature.getGeometry() as Polygon;
      const coordinates = geometry.getCoordinates()[0]; // Get outer ring coordinates
      
      // Convert coordinates from EPSG:3857 to EPSG:4326 (lat/lng)
      const latLngCoordinates: [number, number][] = coordinates.map(coord => 
        toLonLat(coord) as [number, number]
      );

      // Create polygon data with unique ID
      const polygonId = Date.now();
      const polygonData: PolygonGaia = {
        coordinates: latLngCoordinates,
        properties: {
          id: polygonId,
          createdAt: new Date().toISOString(),
        }
      };

      // 🔥 Associate the feature with the polygon ID for later removal
      feature.set('polygonId', polygonId);
      feature.set('polygonData', polygonData);

      // 🔥 Update signals
      this.currentPolygon.set(polygonData);
      this.completedPolygons.update(polygons => [...polygons, polygonData]);
      this.drawingState.set('completing');

      // Clean up
      this.stopPolygonDraw();
    });

    // Add the draw interaction to the map
    this.map.addInteraction(this.drawInteraction);

    // Add keyboard listener for Enter key to complete polygon
    this.keyListener = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && this.isDrawingPolygon()) {
        this.drawInteraction?.finishDrawing();
      } else if (event.key === 'Escape' && this.isDrawingPolygon()) {
        this.cancelPolygonDraw();
      }
    };

    document.addEventListener('keydown', this.keyListener);
  }

  /**
   * 🔥 Cancels the current polygon drawing operation using signals.
   */
  cancelPolygonDraw(): void {
    if (!this.isDrawingPolygon()) {
      return;
    }

    // 🔥 Update signals
    this.drawingState.set('cancelled');
    this.currentPolygon.set(null);

    this.stopPolygonDraw();
    
    // Clear any incomplete drawing
    const source = this.polygonLayer.getSource();
    if (source) {
      source.clear();
    }
  }

  /**
   * Stops polygon drawing mode and cleans up resources.
   */
  private stopPolygonDraw(): void {
    // 🔥 Update signal
    this.isDrawingPolygon.set(false);
    
    this.map.getTargetElement().style.cursor = '';

    if (this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }

    if (this.keyListener) {
      document.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
    }

    // Clear the starting point highlight
    this.clearStartPointHighlight();
  }

  /**
   * 🔥 Clears all drawn polygons from the map using signals.
   */
  clearPolygons(): void {
    console.log(`🗑️ Clearing all polygons...`);
    
    const source = this.polygonLayer.getSource();
    if (source) {
      const featureCount = source.getFeatures().length;
      source.clear();
      console.log(`🗑️ Cleared ${featureCount} features from map`);
    }
    
    // 🔥 Reset signals
    const polygonCount = this.completedPolygons().length;
    this.completedPolygons.set([]);
    this.currentPolygon.set(null);
    console.log(`📊 Cleared ${polygonCount} polygons from signals`);
    
    // Also clear any highlights
    this.clearStartPointHighlight();
  }

  /**
   * 🔥 Get the latest completed polygon using signals
   */
  getLatestPolygon(): PolygonGaia | null {
    const polygons = this.completedPolygons();
    return polygons.length > 0 ? polygons[polygons.length - 1] : null;
  }

  /**
   * 🔥 Remove a specific polygon by ID using signals
   */
  removePolygonById(id: number): void {
    console.log(`🗑️ Removing polygon with ID: ${id}`);
    
    // First remove from the map layer
    const source = this.polygonLayer.getSource();
    if (source) {
      const features = source.getFeatures();
      console.log(`📋 Total features on map: ${features.length}`);
      
      const featureToRemove = features.find(feature => {
        const featureId = feature.get('polygonId');
        console.log(`🔍 Checking feature with ID: ${featureId}`);
        return featureId === id;
      });
      
      if (featureToRemove) {
        console.log(`✅ Found feature to remove with ID: ${id}`);
        source.removeFeature(featureToRemove);
        console.log(`🗑️ Feature removed from map`);
      } else {
        console.warn(`❌ Feature with ID ${id} not found on map`);
        
        // If we can't find by polygonId, try alternative approach
        const polygonToRemove = this.completedPolygons().find(p => p.properties?.['id'] === id);
        if (polygonToRemove) {
          // Remove all features and re-add the remaining ones
          console.log(`🔄 Rebuilding map features...`);
          source.clear();
          
          const remainingPolygons = this.completedPolygons().filter(p => p.properties?.['id'] !== id);
          this.rebuildMapFeatures(remainingPolygons);
        }
      }
    }
    
    // Then update the signals
    this.completedPolygons.update(polygons => {
      const filtered = polygons.filter(polygon => polygon.properties?.['id'] !== id);
      console.log(`📊 Polygons after removal: ${filtered.length}`);
      return filtered;
    });
  }

  /**
   * 🔥 Rebuilds map features from polygon data
   */
  private rebuildMapFeatures(polygons: PolygonGaia[]): void {
    const source = this.polygonLayer.getSource();
    if (!source) return;

    polygons.forEach(polygonData => {
      // Convert lat/lng coordinates back to map coordinates
      const mapCoordinates = polygonData.coordinates.map(coord => 
        fromLonLat(coord)
      );
      
      // Close the polygon if not already closed
      const lastCoord = mapCoordinates[mapCoordinates.length - 1];
      const firstCoord = mapCoordinates[0];
      if (lastCoord[0] !== firstCoord[0] || lastCoord[1] !== firstCoord[1]) {
        mapCoordinates.push(firstCoord);
      }

      // Create the feature
      const feature = new Feature({
        geometry: new Polygon([mapCoordinates]),
      });

      // Set the polygon ID and data for future removal
      feature.set('polygonId', polygonData.properties?.['id']);
      feature.set('polygonData', polygonData);

      // Add to the map
      source.addFeature(feature);
    });

    console.log(`✅ Rebuilt ${polygons.length} features on map`);
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
        layers.removeAt(2);
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
