---
title: Getting Started
description: A guide to getting started with GaiaGisService.
---

# Getting Started

## Import GaiaGisService

In your component, import `GaiaGisService`:

```typescript
import { Component, OnInit } from "@angular/core";
import { GaiaGisService } from "path-to-gaia-gis.service";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  constructor(private gaiaGisService: GaiaGisService) {}

  ngOnInit(): void {
    // Initialize the map here
  }
}
```
