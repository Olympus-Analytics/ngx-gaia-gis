# ngx-gaia-gis

[![npm version](https://badge.fury.io/js/ngx-gaia-gis.svg)](https://badge.fury.io/js/ngx-gaia-gis)
[![Angular](https://img.shields.io/badge/Angular-20-red.svg)](https://angular.io/)

GaiaGisService is an Angular library that simplifies the integration of interactive maps using OpenLayers. It allows for visualizing raster maps, adding custom points, and adjusting views easily, making it ideal for developers who need to implement geospatial features in their web applications.

## Features

- **Easy Map Initialization**: Create maps with customizable center, zoom, and design.
- **Raster Layer Management**: Add, remove, and manage raster layers using GeoTIFF files.
- **Point Management**: Add points with custom icons or styles.
- **Flexible View Controls**: Change map center, zoom, or fit to extents dynamically.

## Requirements

- Angular 20+
- TypeScript 5.8+

## Installation

Install the library and its dependencies:

```bash
npm install ngx-gaia-gis ol geotiff jspdf
```

Add the OpenLayers CSS to your `angular.json`:

```json
"styles": [
  "src/styles.css",
  "node_modules/ol/ol.css"
]
```

## Getting Started

### Quick Setup

Import the component in your Angular application:

```typescript
import { Component } from '@angular/core';
import { GaiaGisComponent, Option, MapsDesign } from 'ngx-gaia-gis';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GaiaGisComponent],
  template: '<gaia-gis [options]="settings"></gaia-gis>',
  styleUrl: './app.component.css',
})
export class AppComponent {
  settings: Option = {
    center: [0, 0],
    zoom: 2,
    design: MapsDesign.CARTOCDN,
  };
}
```

### Advanced Usage with Service

For more control, inject the service directly:

```typescript
import { Component, OnInit } from "@angular/core";
import { GaiaGisService, PointGaia } from "ngx-gaia-gis";

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

  addLayer(): void {
    this.gaiaGisService.addRasterLayer('https://example.com/map.tif');
  }

  addPoints(): void {
    const points: PointGaia[] = [
      { coords: [-74.006, 40.7128], info: "New York City" },
      { coords: [-118.2437, 34.0522], info: "Los Angeles" }
    ];
    this.gaiaGisService.addPoints(points, "https://example.com/icon.png");
  }
}
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

#### `exportGaiaMapToPdf`

Export the current map view to a PDF file.

## Changelog

### v1.0.6
- ✅ Angular 20 support
- ✅ TypeScript 5.8 compatibility
- ✅ Updated peer dependencies
- ✅ Improved build configuration

## Contributing

Please read [CONTRIBUTE.md](CONTRIBUTE.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the AGPL-3.0-only License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Links

- [Homepage](https://gaia-gis.olympus-analytics.dev/)
- [npm Package](https://www.npmjs.com/package/ngx-gaia-gis)
- [GitHub Repository](https://github.com/Olympus-Analytics/ngx-gaia-gis)
- [Issues](https://github.com/Olympus-Analytics/ngx-gaia-gis/issues)


