# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7] - 2025-01-XX

### Added
- **Polygon Drawing Tool**: Interactive polygon drawing functionality with coordinate output using Angular 20 signals
- **PolygonGaia Interface**: New interface for polygon data structure
- **Event Emission**: `polygonDrawn` event for handling completed polygons
- **Drawing Controls**: Public methods for starting, canceling, and clearing polygon drawing
- **Keyboard Support**: Enter key to complete, Escape key to cancel drawing
- **Visual Feedback**: Cursor changes, polygon styling during drawing, and animated starting point highlighting
- **Comprehensive Documentation**: Updated README with polygon drawing examples and usage instructions

### Technical Details
- Added OpenLayers Draw interaction for polygon creation
- Implemented coordinate conversion from EPSG:3857 to EPSG:4326
- Added polygon layer management with custom styling
- Integrated keyboard event handling for better UX
- Added cleanup mechanisms for drawing interactions
- Implemented starting point highlighting with pulsing animation
- Added dedicated highlight layer for better visual feedback
- Modernized with Angular 20 signals for reactive state management
- Added computed signals for dynamic UI updates
- Implemented effects for automatic state handling and logging

## [1.0.6] - 2025-07-11

### Added
- Angular 20 support
- TypeScript 5.8 compatibility
- Automated deployment script (`deploy.sh`)
- Comprehensive documentation updates

### Changed
- Updated all Angular dependencies to version 20.1.0
- Updated TypeScript to version 5.8.3
- Updated peer dependencies to require Angular 20+
- Improved build configuration for better compatibility
- Enhanced README with installation and usage examples

### Fixed
- Fixed TypeScript path mappings for library resolution
- Resolved build issues with Angular 20
- Fixed package.json export conditions
- Cleaned up dependency management

### Technical Details
- `@angular/core`: ^19.2.14 → ^20.1.0
- `@angular/common`: ^19.2.14 → ^20.1.0
- `@angular/compiler`: ^19.2.14 → ^20.1.0
- `@angular-devkit/build-angular`: ^19.2.15 → ^20.1.0
- `typescript`: ~5.5.4 → ~5.8.3
- `ng-packagr`: ^20.1.0

## [1.0.5] - Previous Release

### Features
- GIS mapping with OpenLayers integration
- Raster layer support with GeoTIFF files
- Point management with custom icons
- PDF export functionality
- Flexible map view controls
- Support for various map designs

### Components
- `GaiaGisComponent`: Main map component
- `GaiaGisService`: Core service for map operations

### Interfaces
- `Option`: Configuration interface for map initialization
- `PointGaia`: Interface for point data structure
- `MapsDesign`: Enum for predefined map styles

### Dependencies
- OpenLayers (ol) for map rendering
- GeoTIFF for raster data handling
- jsPDF for PDF export functionality
- Angular framework support

## Development Notes

### Building the Library
```bash
ng build Gaia-GIS --configuration production
```

### Publishing to npm
```bash
cd dist/gaia-gis
npm publish --access public
```

### Using the Deploy Script
```bash
./deploy.sh
```

The deploy script automates:
- Version bumping (patch/minor/major)
- Library building
- npm publishing
- Git tagging

### Peer Dependencies
The library requires these peer dependencies to be installed in the consuming application:
- `@angular/common`: >=20.0.0
- `@angular/core`: >=20.0.0
- `geotiff`: ^2.1.3
- `jspdf`: ^2.5.2
- `ol`: ^10.3.0
- `ol-hashed`: ^2.1.0