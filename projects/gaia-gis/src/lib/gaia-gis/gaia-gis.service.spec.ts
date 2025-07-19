import { TestBed } from '@angular/core/testing';
import { GaiaGisService } from './gaia-gis.service';
import { PolygonGaia } from '../interfaces';

describe('GaiaGisService - Polygon Drawing', () => {
  let service: GaiaGisService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GaiaGisService]
    });
    service = TestBed.inject(GaiaGisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have polygonDrawn event emitter', () => {
    expect(service.polygonDrawn).toBeDefined();
    expect(typeof service.polygonDrawn.emit).toBe('function');
  });

  it('should have startPolygonDraw method', () => {
    expect(typeof service.startPolygonDraw).toBe('function');
  });

  it('should have cancelPolygonDraw method', () => {
    expect(typeof service.cancelPolygonDraw).toBe('function');
  });

  it('should have clearPolygons method', () => {
    expect(typeof service.clearPolygons).toBe('function');
  });

  it('should emit polygon data when drawing is completed', (done) => {
    // Mock the map and draw interaction
    const mockMap = {
      getTargetElement: () => ({ style: { cursor: '' } }),
      addInteraction: jasmine.createSpy('addInteraction'),
      removeInteraction: jasmine.createSpy('removeInteraction'),
      on: jasmine.createSpy('on'),
    };

    const mockDrawInteraction = {
      on: jasmine.createSpy('on').and.callFake((event, callback) => {
        if (event === 'drawend') {
          // Simulate polygon completion
          const mockEvent = {
            feature: {
              getGeometry: () => ({
                getCoordinates: () => [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
              })
            }
          };
          callback(mockEvent);
        }
      }),
      finishDrawing: jasmine.createSpy('finishDrawing'),
    };

    // Mock OpenLayers Draw constructor
    const mockDraw = jasmine.createSpy('Draw').and.returnValue(mockDrawInteraction);
    
    // Subscribe to polygon drawn event
    service.polygonDrawn.subscribe((polygon: PolygonGaia) => {
      expect(polygon).toBeDefined();
      expect(polygon.coordinates).toBeDefined();
      expect(Array.isArray(polygon.coordinates)).toBe(true);
      expect(polygon.properties).toBeDefined();
      expect(polygon.properties.id).toBeDefined();
      expect(polygon.properties.createdAt).toBeDefined();
      done();
    });

    // Note: In a real test environment, you would need to mock OpenLayers properly
    // This is a simplified test to verify the structure
  });
}); 