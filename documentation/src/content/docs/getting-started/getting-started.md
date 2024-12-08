---
title: Getting Started
description: A guide to getting started with GaiaGisService.
---

after installing all the dependencies

## Basic Usage

### 1. Import the Component

Add the GaiaGisComponent to the module or component where you want to use it:

```typescript
import { Component } from "@angular/core";
import { GaiaGisComponent } from "ngx-gaia-gis";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [GaiaGisComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  // Optional configuration for the map
  settings = {
    center: [0, 0],
    zoom: 2,
    design: MapsDesign.CARTOCDN,
  };
}
```

### 2. Use in HTML

In the HTML file, include the <gaia-gis> component and bind the settings options:

```html
<gaia-gis [options]="settings"></gaia-gis>
```

