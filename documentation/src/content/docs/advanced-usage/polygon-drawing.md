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

Use the GaiaGisService for programmatic control:

```typescript
import { Component, OnInit } from '@angular/core';
import { GaiaGisService, PolygonGaia } from 'ngx-gaia-gis';

@Component({
  selector: 'app-map',
  template: '<div id="map" class="map-container"></div>',
})
export class MapComponent implements OnInit {
  constructor(private gaiaGisService: GaiaGisService) {}

  ngOnInit(): void {
    this.gaiaGisService.initializeMap('map', {
      center: [-74.006, 40.7128],
      zoom: 12,
    });

    // Subscribe to polygon events
    this.gaiaGisService.polygonDrawn.subscribe((polygon: PolygonGaia) => {
      this.processPolygon(polygon);
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

## Events

### `polygonDrawn`

Emitted when a polygon drawing is completed.

**Event Data:**
```typescript
interface PolygonGaia {
  coordinates: [number, number][]; // Array of [longitude, latitude] pairs
  properties?: Record<string, any>; // Optional metadata including id and createdAt
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
onPolygonComplete(polygon: PolygonGaia): void {
  // Calculate area of interest
  const area = this.calculateArea(polygon.coordinates);
  
  // Filter data within the polygon
  const filteredData = this.filterByPolygon(polygon.coordinates);
}
```

### Geographic Forms

```typescript
onPolygonComplete(polygon: PolygonGaia): void {
  // Store polygon data in form
  this.form.patchValue({
    boundary: polygon.coordinates,
    areaId: polygon.properties.id
  });
}
```

### Spatial Analysis

```typescript
onPolygonComplete(polygon: PolygonGaia): void {
  // Perform spatial queries
  this.performSpatialQuery(polygon.coordinates).subscribe(results => {
    this.displayResults(results);
  });
}
```

## Best Practices

### Error Handling

```typescript
this.gaiaGisService.polygonDrawn.subscribe({
  next: (polygon: PolygonGaia) => {
    try {
      this.processPolygon(polygon);
    } catch (error) {
      console.error('Error processing polygon:', error);
    }
  },
  error: (error) => {
    console.error('Polygon drawing error:', error);
  }
});
```

### Memory Management

```typescript
ngOnDestroy(): void {
  // Clean up subscriptions
  this.polygonSubscription?.unsubscribe();
  
  // Clear any active drawing
  this.gaiaGisService.cancelPolygonDraw();
}
```

### Validation

```typescript
validatePolygon(polygon: PolygonGaia): boolean {
  const coords = polygon.coordinates;
  
  // Check minimum vertices (triangle)
  if (coords.length < 4) {
    console.warn('Polygon must have at least 3 vertices');
    return false;
  }
  
  // Check if polygon is closed
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    console.warn('Polygon is not closed');
    return false;
  }
  
  return true;
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
   - Always unsubscribe from events in ngOnDestroy
   - Cancel drawing when component is destroyed

### Debug Mode

```typescript
// Enable debug logging
this.gaiaGisService.polygonDrawn.subscribe((polygon) => {
  console.log('Polygon drawn:', polygon);
  console.log('Coordinate count:', polygon.coordinates.length);
  console.log('Properties:', polygon.properties);
});
``` 