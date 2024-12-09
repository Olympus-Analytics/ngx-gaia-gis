---
title: Gaia Gis Service
description: This is a angular service that it's function is to manage the different functions of the map.
---

## Example Usage

Here is an example of how to use `GaiaGisService` in an Angular application programmatically:

### 1. Add the Service to Your Component

Another way to initialize the map is by using the `GaiaGisService` directly:

```typescript
import { Component, OnInit, inject } from "@angular/core";
import { GaiaGisService } from "ngx-gaia-gis";

@Component({
  selector: "app-map",
  template: '<div id="map" class="map-container"></div>',
  styles: [".map-container { width: 100%; height: 400px; }"],
})
export class MapComponent implements OnInit {
  private gaiaGisService = inject(GaiaGisService);

  ngOnInit(): void {
    this.gaiaGisService.initializeMap("map", {
      center: [-74.006, 40.7128], // New York City
      zoom: 12,
    });
  }
}
```

### 2.Add raster layer

```typescript
addLayer(): void {
  this.gaiaGisService.addRasterLayer('https://example.com/map.tif');
}

```

> **Important!**: The raster have to be a COG(Cloud optimized GeoTiff)

### 3. Add points

```typescript
import { PointGaia } from "ngx-gaia-gis";

this.gaiaGisService.addPoints(
  [
    { coords: [-74.006, 40.7128], info: "NYC" },
    { coords: [-118.2437, 34.0522], info: "LA" },
  ], // NYC & LA
  "https://example.com/icon.png"
);
```

> **Note**: The info property is optional. If omitted, no popup will appear for the point.
