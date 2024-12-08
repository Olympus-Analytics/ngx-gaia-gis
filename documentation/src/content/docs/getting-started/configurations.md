---
title: Configurations
description: A guide to use the configurations.
---

The options input is optional, but if you want to customize the map behavior or style, you can use the Option interface.

### Option Interface

```typescript
export interface Option {
  center?: [number, number];
  zoom?: number;
  design?: MapsDesign;
  maxZoom?: number;
  minZoom?: number;
}
```

- `center`: Specifies the initial center of the map. Format: [longitude, latitude].
- `zoom`: The initial zoom level of the map.
- `design`: Defines the map's visual style using the MapsDesign enum.
- `maxZoom`: Sets the maximum zoom level allowed.
- `minZoom`: Sets the minimum zoom level allowed.

### Example Configuration

Here’s an example of configuring the `settings` object:

```typescript
import { Option, MapsDesign } from "ngx-gaia-gis";

export class AppComponent {
  settings: Option = {
    center: [0, 0],
    zoom: 2,
    design: MapsDesign.CARTOCDN,
  };
}
```
