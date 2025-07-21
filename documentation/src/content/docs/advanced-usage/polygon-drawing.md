---
title: Polygon Drawing Tool
description: Interactive polygon drawing tool with coordinate output and event emission.
---

The ngx-gaia-gis library includes an interactive polygon drawing tool that allows users to draw polygons directly on the map and receive coordinate data through events.

## Basic Usage

### Component Approach

Add the GaiaGisComponent to your module or component:

```typescript
import { Component } from '@angular/core';
import { GaiaGisComponent, Option, MapsDesign, PolygonGaia } from 'ngx-gaia-gis';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GaiaGisComponent],
  template: `
    <gaia-gis 
      [options]="mapOptions" 
      (polygonDrawn)="handlePolygonComplete($event)">
    </gaia-gis>
  `,
})
export class MapComponent {
  mapOptions: Option = {
    center: [-74.006, 40.7128],
    zoom: 12,
    design: MapsDesign.CARTOCDN,
  };

  handlePolygonComplete(polygon: PolygonGaia): void {
    console.log('Polygon completed:', polygon);
  }
}
```

### Service Approach

Use the GaiaGisService with Angular signals for reactive state management:

```typescript
import { Component, OnInit, computed } from '@angular/core';
import { GaiaGisService, PolygonGaia } from 'ngx-gaia-gis';

@Component({
  selector: 'app-map',
  template: `
    <div id="map" class="map-container"></div>
    <div class="controls">
      <p>Status: {{ gaiaGisService.drawingStatus() }}</p>
      <p>Polygons: {{ gaiaGisService.polygonCount() }}</p>
      <button (click)="startDrawing()" [disabled]="!canStartDrawing()">
        Start Drawing
      </button>
      <button (click)="cancelDrawing()" [disabled]="!canCancel()">
        Cancel
      </button>
      <button (click)="clearAllPolygons()">Clear All</button>
      
      @if (gaiaGisService.currentPolygon() && gaiaGisService.drawingState() === 'completing') {
        <div class="polygon-completed">
          <p>Polygon completed! ID: {{ gaiaGisService.currentPolygon()?.properties?.['id'] }}</p>
        </div>
      }
    </div>
  `,
})
export class MapComponent implements OnInit {
  // Expose service signals for template usage
  public readonly canStartDrawing = computed(() => 
    !this.gaiaGisService.isDrawingPolygon() && 
    this.gaiaGisService.drawingState() !== 'completing'
  );
  
  public readonly canCancel = computed(() => 
    this.gaiaGisService.isDrawingPolygon()
  );

  constructor(public gaiaGisService: GaiaGisService) {}

  ngOnInit(): void {
    this.gaiaGisService.initializeMap('map', {
      center: [-74.006, 40.7128],
      zoom: 12,
    });
  }

  startDrawing(): void {
    this.gaiaGisService.startPolygonDraw();
  }

  cancelDrawing(): void {
    this.gaiaGisService.cancelPolygonDraw();
  }

  clearAllPolygons(): void {
    this.gaiaGisService.clearPolygons();
  }
}
```

## Methods

### `startPolygonDraw`

Activates polygon drawing mode on the map.

- **Behavior:**
  - Changes cursor to crosshair
  - Enables click-to-add-vertex functionality
  - Adds keyboard event listeners
  - Creates visual feedback with pulsing green starting point

### `cancelPolygonDraw`

Cancels the current polygon drawing operation.

- **Behavior:**
  - Removes drawing interaction
  - Clears incomplete polygon
  - Restores normal cursor
  - Removes keyboard listeners

### `clearPolygons`

Removes all drawn polygons from the map.

- **Behavior:**
  - Clears the polygon layer source
  - Removes all polygon features from the map
  - Resets polygon signals

### `removePolygonById`

Removes a specific polygon by its ID.

- **Parameters:**
  - `id`: The unique ID of the polygon to remove

### `getLatestPolygon`

Returns the most recently completed polygon.

- **Returns:** `PolygonGaia | null` - The latest polygon or null if none exist

## Modern Signal-Based Approach

The ngx-gaia-gis library now uses Angular signals instead of RxJS observables for better performance and simpler reactivity patterns.

### Key Benefits

- **No subscriptions to manage**: Signals handle reactivity automatically
- **Better performance**: Signals are more efficient than observables for state management
- **Template-friendly**: Direct signal access in templates with automatic change detection
- **Built-in reactivity**: Changes propagate automatically through computed signals

### Basic Pattern

```typescript
import { Component } from '@angular/core';
import { GaiaGisService } from 'ngx-gaia-gis';

@Component({
  selector: 'app-polygon-map',
  template: `
    <div id="map" class="map-container"></div>
    <div class="status">
      <p>{{ gaiaGisService.drawingStatus() }}</p>
      <p>Polygons: {{ gaiaGisService.polygonCount() }}</p>
      
      @if (gaiaGisService.currentPolygon()) {
        <div class="current-polygon">
          <h4>Current Polygon:</h4>
          <p>ID: {{ gaiaGisService.currentPolygon()?.properties?.['id'] }}</p>
          <p>Vertices: {{ gaiaGisService.currentPolygon()?.coordinates.length }}</p>
        </div>
      }
    </div>
  `
})
export class PolygonMapComponent {
  constructor(public gaiaGisService: GaiaGisService) {}
}
```

## Angular 20 Signals

The service uses Angular 20's modern reactive signals with `linkedSignal()` for efficient state management:

### `isDrawingPolygon`

Signal indicating if polygon drawing is currently active.

- **Type:** `Signal<boolean>`
- **Usage:** `this.gaiaGisService.isDrawingPolygon()`

### `currentPolygon`

Signal containing the current polygon being drawn.

- **Type:** `Signal<PolygonGaia | null>`
- **Usage:** `this.gaiaGisService.currentPolygon()`

### `completedPolygons`

Signal containing all completed polygons.

- **Type:** `Signal<PolygonGaia[]>`
- **Usage:** `this.gaiaGisService.completedPolygons()`

### `drawingState`

Signal tracking the current drawing state.

- **Type:** `Signal<'idle' | 'drawing' | 'completing' | 'cancelled'>`
- **Usage:** `this.gaiaGisService.drawingState()`

### `drawingStatus`

Computed signal providing human-readable drawing status.

- **Type:** `Signal<string>`
- **Usage:** `this.gaiaGisService.drawingStatus()`

### `polygonCount`

Computed signal for the total number of completed polygons.

- **Type:** `Signal<number>`
- **Usage:** `this.gaiaGisService.polygonCount()`

### Using Signals in Templates

```typescript
@Component({
  template: `
    <div>
      <p>Drawing: {{ gaiaGisService.isDrawingPolygon() }}</p>
      <p>Status: {{ gaiaGisService.drawingStatus() }}</p>
      <p>Polygons: {{ gaiaGisService.polygonCount() }}</p>
      
      @if (gaiaGisService.completedPolygons().length > 0) {
        <ul>
          @for (polygon of gaiaGisService.completedPolygons(); track polygon.properties.id) {
            <li>Polygon {{ polygon.properties.id }}</li>
          }
        </ul>
      }
    </div>
  `
})
```

### Performance Benefits of Linked Signals

The service uses `linkedSignal()` instead of `effect()` for better performance:

- **Automatic dependency tracking**: More efficient than manual effects
- **Lazy evaluation**: Only computes when dependencies change
- **Better tree-shaking**: Unused signals don't impact bundle size
- **Cleaner code**: No manual effect cleanup required

Example of internal linked signal usage:

```typescript
// Auto-reset drawing state after completion
private readonly autoResetState = linkedSignal(() => {
  const state = this.drawingState();
  if (state === 'completing' || state === 'cancelled') {
    setTimeout(() => this.drawingState.set('idle'), 2000);
  }
  return state;
});
```

## Events and Signals

### Component Output Event

The `polygonDrawn` output event is still available for backward compatibility when using the component approach:

**Event Data:**
```typescript
interface PolygonGaia {
  coordinates: [number, number][]; // Array of [longitude, latitude] pairs
  properties?: Record<string, any>; // Optional metadata including id and createdAt
}
```

### Signal-based Reactivity

For more advanced scenarios, access the service signals directly in your template or computed signals:

```typescript
@Component({
  template: `
    <div class="polygon-info">
      @if (gaiaGisService.currentPolygon() && gaiaGisService.drawingState() === 'completing') {
        <div class="alert alert-success">
          <h4>Polygon Completed!</h4>
          <p>ID: {{ gaiaGisService.currentPolygon()?.properties?.['id'] }}</p>
          <p>Coordinates: {{ gaiaGisService.currentPolygon()?.coordinates.length }} vertices</p>
          <button (click)="processLatestPolygon()">Process Polygon</button>
        </div>
      }
    </div>
  `
})
export class PolygonComponent {
  constructor(public gaiaGisService: GaiaGisService) {}
  
  processLatestPolygon(): void {
    const polygon = this.gaiaGisService.getLatestPolygon();
    if (polygon) {
      console.log('Processing polygon:', polygon);
      // Handle the polygon data
    }
  }
}
```

## Drawing Instructions

### Step-by-Step Process

1. **Activate Drawing Mode**
   ```typescript
   this.gaiaGisService.startPolygonDraw();
   ```

2. **Add Vertices**
   - Click on the map to add polygon vertices
   - Each click creates a new vertex
   - Visual feedback shows the polygon being built
   - The starting point is highlighted with a pulsing green circle

3. **Complete the Polygon**
   - **Option 1**: Click the highlighted starting point (green pulsing circle)
   - **Option 2**: Press the Enter key
   - The polygon will automatically close and emit the event

4. **Cancel Drawing** (if needed)
   - Press the Escape key, OR
   - Call `cancelPolygonDraw()`

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Complete polygon drawing |
| `Escape` | Cancel polygon drawing |

## Data Format

### Coordinate System

- **Input**: OpenLayers internal coordinates (EPSG:3857)
- **Output**: Geographic coordinates (EPSG:4326) in `[longitude, latitude]` format
- **Conversion**: Automatic conversion from map projection to geographic coordinates

### Polygon Structure

```typescript
interface PolygonGaia {
  coordinates: [number, number][]; // Array of coordinate pairs
  properties: {
    id: number;           // Unique timestamp-based ID
    createdAt: string;    // ISO timestamp
    [key: string]: any;   // Additional custom properties
  };
}
```

### Example Output

```typescript
{
  coordinates: [
    [-74.006, 40.7128],  // First vertex
    [-74.006, 40.7228],  // Second vertex
    [-73.996, 40.7228],  // Third vertex
    [-73.996, 40.7128],  // Fourth vertex
    [-74.006, 40.7128]   // Closing vertex (same as first)
  ],
  properties: {
    id: 1703123456789,
    createdAt: "2025-01-XXTXX:XX:XX.XXXZ"
  }
}
```

## Styling

### Default Polygon Style

- **Stroke**: Red (#ff0000) with 2px width
- **Fill**: Semi-transparent red (rgba(255, 0, 0, 0.1))
- **Drawing Cursor**: Crosshair
- **Starting Point**: Pulsing green circle

### Customization

To customize polygon styling, modify the style in the service:

```typescript
// In gaia-gis.service.ts
this.polygonLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: '#your-color',
      width: your-width,
    }),
    fill: new Fill({
      color: 'rgba(your-r, your-g, your-b, your-alpha)',
    }),
  }),
});
```

## Use Cases

### Area Selection

```typescript
@Component({
  template: `
    <div class="area-selection">
      @if (selectedArea()) {
        <div class="selected-area-info">
          <h4>Selected Area</h4>
          <p>Area: {{ selectedArea()?.area }} sq km</p>
          <p>Vertices: {{ selectedArea()?.vertices }}</p>
        </div>
      }
    </div>
  `
})
export class AreaSelectionComponent {
  // Computed signal that processes polygon when it's completed
  selectedArea = computed(() => {
    const polygon = this.gaiaGisService.currentPolygon();
    const state = this.gaiaGisService.drawingState();
    
    if (polygon && state === 'completing') {
      return {
        area: this.calculateArea(polygon.coordinates),
        vertices: polygon.coordinates.length,
        data: this.filterByPolygon(polygon.coordinates)
      };
    }
    return null;
  });

  constructor(public gaiaGisService: GaiaGisService) {}
}
```

### Geographic Forms

```typescript
@Component({
  template: `
    <form [formGroup]="locationForm">
      <div class="form-group">
        <label>Boundary</label>
        <textarea 
          formControlName="boundary" 
          readonly
          class="form-control">
        </textarea>
      </div>
      
      @if (gaiaGisService.currentPolygon() && gaiaGisService.drawingState() === 'completing') {
        <button type="button" (click)="saveBoundary()" class="btn btn-primary">
          Save Boundary
        </button>
      }
    </form>
  `
})
export class GeographicFormComponent {
  locationForm = this.fb.group({
    boundary: [''],
    areaId: ['']
  });

  constructor(
    public gaiaGisService: GaiaGisService,
    private fb: FormBuilder
  ) {}

  saveBoundary(): void {
    const polygon = this.gaiaGisService.currentPolygon();
    if (polygon) {
      this.locationForm.patchValue({
        boundary: JSON.stringify(polygon.coordinates),
        areaId: polygon.properties?.['id']?.toString()
      });
    }
  }
}
```

### Spatial Analysis

```typescript
@Component({
  template: `
    <div class="spatial-analysis">
      @if (analysisResult()) {
        <div class="analysis-results">
          <h4>Spatial Analysis Results</h4>
          <p>Features found: {{ analysisResult()?.count }}</p>
        </div>
      }
    </div>
  `
})
export class SpatialAnalysisComponent {
  // Computed signal that triggers analysis when polygon is completed
  analysisResult = computed(() => {
    const polygon = this.gaiaGisService.currentPolygon();
    const state = this.gaiaGisService.drawingState();
    
    if (polygon && state === 'completing') {
      // Trigger spatial query (this could be async, but we'll show sync for simplicity)
      return this.performSpatialAnalysis(polygon.coordinates);
    }
    return null;
  });

  constructor(public gaiaGisService: GaiaGisService) {}

  private performSpatialAnalysis(coordinates: [number, number][]) {
    // Perform your spatial analysis here
    return { count: Math.floor(Math.random() * 100) };
  }
}
```

## Best Practices

### Error Handling

```typescript
@Component({
  template: `
    <div class="polygon-handler">
      @if (polygonError()) {
        <div class="alert alert-danger">
          Error: {{ polygonError() }}
        </div>
      }
      
      @if (validPolygon()) {
        <div class="alert alert-success">
          Valid polygon created!
        </div>
      }
    </div>
  `
})
export class PolygonHandlerComponent {
  polygonError = computed(() => {
    const polygon = this.gaiaGisService.currentPolygon();
    const state = this.gaiaGisService.drawingState();
    
    if (polygon && state === 'completing') {
      try {
        this.validatePolygon(polygon);
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : 'Unknown error';
      }
    }
    return null;
  });

  validPolygon = computed(() => {
    const polygon = this.gaiaGisService.currentPolygon();
    const state = this.gaiaGisService.drawingState();
    
    return polygon && state === 'completing' && !this.polygonError();
  });

  constructor(public gaiaGisService: GaiaGisService) {}

  private validatePolygon(polygon: PolygonGaia): void {
    if (polygon.coordinates.length < 4) {
      throw new Error('Polygon must have at least 3 vertices');
    }
  }
}
```

### Memory Management

```typescript
ngOnDestroy(): void {
  // Angular effects automatically clean up when component is destroyed
  // No manual cleanup needed for signals
  
  // Clear any active drawing
  this.gaiaGisService.cancelPolygonDraw();
}
```

### Validation

```typescript
@Component({
  template: `
    <div class="polygon-validation">
      @if (validationResult()) {
        <div [class]="validationResult()?.isValid ? 'alert alert-success' : 'alert alert-warning'">
          {{ validationResult()?.message }}
        </div>
      }
    </div>
  `
})
export class PolygonValidationComponent {
  validationResult = computed(() => {
    const polygon = this.gaiaGisService.currentPolygon();
    const state = this.gaiaGisService.drawingState();
    
    if (polygon && state === 'completing') {
      const validation = this.validatePolygon(polygon);
      if (validation.isValid) {
        this.processValidPolygon(polygon);
      }
      return validation;
    }
    return null;
  });

  constructor(public gaiaGisService: GaiaGisService) {}

  private validatePolygon(polygon: PolygonGaia): { isValid: boolean; message: string } {
    const coords = polygon.coordinates;
    
    // Check minimum vertices (triangle)
    if (coords.length < 4) {
      return { isValid: false, message: 'Polygon must have at least 3 vertices' };
    }
    
    // Check if polygon is closed
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      return { isValid: false, message: 'Polygon is not closed' };
    }
    
    return { isValid: true, message: 'Valid polygon created!' };
  }

  private processValidPolygon(polygon: PolygonGaia): void {
    console.log('Processing valid polygon:', polygon);
  }
}
```

## Troubleshooting

### Common Issues

1. **Polygon not completing**
   - Ensure you're clicking the first vertex or pressing Enter
   - Check that the map is properly initialized

2. **Coordinates in wrong format**
   - The service automatically converts to lat/lng format
   - Verify you're using the correct coordinate order (longitude, latitude)

3. **Drawing interaction not working**
   - Ensure the map is fully loaded before starting drawing
   - Check that no other interactions are interfering

4. **Memory leaks**
   - Effects automatically clean up when component is destroyed
   - Cancel drawing when component is destroyed

### Debug Mode

```typescript
@Component({
  template: `
    <div class="debug-info">
      <h4>Debug Information</h4>
      <p>Drawing State: {{ gaiaGisService.drawingState() }}</p>
      <p>Is Drawing: {{ gaiaGisService.isDrawingPolygon() }}</p>
      <p>Total Polygons: {{ gaiaGisService.polygonCount() }}</p>
      
      @if (gaiaGisService.currentPolygon()) {
        <div class="current-polygon-debug">
          <h5>Current Polygon:</h5>
          <p>ID: {{ gaiaGisService.currentPolygon()?.properties?.['id'] }}</p>
          <p>Coordinates: {{ gaiaGisService.currentPolygon()?.coordinates.length }} vertices</p>
          <pre>{{ gaiaGisService.currentPolygon() | json }}</pre>
        </div>
      }
    </div>
  `
})
export class DebugPolygonComponent {
  constructor(public gaiaGisService: GaiaGisService) {}
}
``` 
