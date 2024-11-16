# GaiaGisService

GaiaGisService is an Angular service that simplifies map creation and interaction using the powerful OpenLayers library. It enables developers to quickly integrate maps, raster layers, and custom points into their applications.

## Features

- **Easy Map Initialization**: Create maps with customizable center, zoom, and design.
- **Raster Layer Management**: Add, remove, and manage raster layers using GeoTIFF files.
- **Point Management**: Add points with custom icons or styles.
- **Flexible View Controls**: Change map center, zoom, or fit to extents dynamically.

## Installation

1. Install the library dependencies:

   ```bash
   npm install ol
   ```

2. Add the OpenLayers CSS to your application:

   ```json
   // angular.json
   "styles": [
     "src/styles.css",
   ]
   ```

3. Copy the `GaiaGisService` class to your project and ensure the necessary imports are configured.

## Getting Started

### Example Usage

Here is an example of how to use `GaiaGisService` in an Angular application:

#### 1. Add the Service to Your Component

```typescript
import { Component, OnInit } from "@angular/core";
import { GaiaGisService } from "./gaia-gis.service";

@Component({
  selector: "app-map",
  template: '<div id="map" class="map-container"></div>',
  styles: [".map-container { width: 100%; height: 400px; }"],
})
export class MapComponent implements OnInit {
  constructor(private gaiaGisService: GaiaGisService) {}

  ngOnInit(): void {
    this.gaiaGisService.initializeMap("map", {
      center: [-74.006, 40.7128], // New York City
      zoom: 12,
    });
  }
}
```

#### 2. Add Raster Layers

```typescript
addLayer(): void {
  this.gaiaGisService.addRasterLayer('https://example.com/map.tif');
}
```

#### 3. Add Points

```typescript
this.gaiaGisService.addPoints(
  [
    [-74.006, 40.7128],
    [-118.2437, 34.0522],
  ], // NYC & LA
  "https://example.com/icon.png"
);
```

## API Documentation

### Methods

#### `initializeMap`

Initializes a map with the specified options.

- **Parameters**:
  - `target`: The ID of the HTML element to render the map in.
  - `options` (optional):
    - `center`: Map center in `[longitude, latitude]` format.
    - `zoom`: Initial zoom level.
    - `design`: Tile design URL.

#### `addRasterLayer`

Adds a raster layer using a GeoTIFF file URL.

#### `removeRasterLayer`

Removes a raster layer by its index.

#### `setView`

Sets the map's center and zoom level.

#### `zoomToExtent`

Fits the map to a specified extent.

#### `addPoints`

Adds points to the map with optional icons or custom styles.


