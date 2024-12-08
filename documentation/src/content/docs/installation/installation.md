---
title: Installation
description: How to install GaiaGisService in your Angular project.
---


To use GaiaGisService in your Angular application, follow these steps:
## 1. Install the library
```bash
npm install ngx-gaia-gis
```
## 2. Install Dependencies

Install the necessary packages using npm:

```bash
npm install ol jspdf geotiff
```

## 3. Include OpenLayers CSS
In your angular.json file, include the OpenLayers CSS in the styles array:
```CSS
"styles": [
  "node_modules/ol/ol.css",
  "src/styles.css"
]
```