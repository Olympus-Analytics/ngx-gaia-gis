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
   npm install ngx-gaia-gis
   npm install ol
   npm install jspdf
   npm install geotiff
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

```typescript
import {
  GaiaGisComponent
} from 'ngx-gaia-gis';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GaiaGisComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
```

And in the html, you should use like this

```html
<gaia-gis [options]="settings"></gaia-gis>
```

options are optionals, but in the case that you want to configure something the way is this

```typescript
import { Option } from "ngx-gaia-gis";
```

Option is a interface that you should use, this is the interface

```typescript
export interface Option {
  center?: [number, number];
  zoom?: number;
  design?: MapsDesign;
  maxZoom?: number;
  minZoom?: number;
}
```
MapsDesign is enum where you can find some maps styles.

So this is a example

```typescript
settings: Option = {
  center: [0, 0],
  zoom: 2,
  design: MapsDesign.CARTOCDN,
};
```

### Example Usage

Here is an example of how to use `GaiaGisService` in an Angular application:

#### 1. Add the Service to Your Component
##### This is another way to initialize the map
```typescript
import { Component, OnInit } from "@angular/core";
import { GaiaGisService } from "ngx-gaia-gis";

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
##### Functions that you could use:
#### 2. Add Raster Layers

```typescript
addLayer(): void {
  this.gaiaGisService.addRasterLayer('https://example.com/map.tif');
}
```

#### 3. Add Points

```typescript
import {PointGaia} from "ngx-gaia-gis";
this.gaiaGisService.addPoints(
  [
    {coords: [-74.006, 40.7128], info: "NYC"},
    {coords: [-118.2437, 34.0522], info: "LA"}
  ], // NYC & LA
  "https://example.com/icon.png"
);
```
if you don't give the info, there's no problem cause is optional, just the popup wont'appear
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
- **Parameters**:
 - `url`: the URL of the GeoTIFF(COG)

#### `removeRasterLayer`

Removes a raster layer by its index.
- **Parameters**:
 - `index`: The index of the raster layer to remove.


#### `setView`

Sets the map's center and zoom level.
- **Parameters**:
 - `center`: Map center in `[longitude, latitude]` format.
 - `zoom`: Zoom level.

#### `zoomToExtent`

Fits the map to a specified extent.

#### `addPoints`

Adds points to the map with optional icons or custom styles.

#### `exportGaiaMapToPdf`

Export the current map view to a PDF file.
