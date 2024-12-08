---
title: Methods
description: Different methods that you could find in the gaia-gis-service.
---

### `initializeMap`

Initializes a map with the specified options.

- **Parameters:**
  - `target`: The ID of the HTML element to render the map in.
  - `options (optional)`:
    - `center`: Map center in [longitude, latitude] format.
    - `zoom`: Initial zoom level.
    - `design`: Tile design URL.

### **addRasterLayer**

Adds a raster layer using a GeoTIFF file URL.

- **Parameters:**
  - `url`: The URL of the GeoTIFF (COG).

### **removeRasterLayer**:

Removes a raster layer by its index.

- **Parameters:**
  - `index`: The index of the raster layer to remove.

## **setView**

Sets the map's center and zoom level.

- **Parameters:**
  - `center`: Map center in [longitude, latitude] format.
  - `zoom`: Zoom level.

### **zoomToExtent**

Fits the map to a specified extent.

### **addPoints**

Adds points to the map with optional icons or custom styles.

- **Parameters:**
  - `points`: An array of objects with `coords` and optional `info`.
  - `iconUrl`: (Optional) URL for a custom icon.

### **exportGaiaMapToPdf**

Exports the current map view to a PDF file.
