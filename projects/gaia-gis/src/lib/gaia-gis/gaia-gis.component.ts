import { Component, inject, Input, OnInit, output, computed, effect } from '@angular/core';
import { GaiaGisService } from './gaia-gis.service';
import { Option, PolygonGaia } from '../interfaces';

@Component({
  selector: 'gaia-gis',
  standalone: true,
  imports: [],
  templateUrl: './gaia-gis.component.html',
  styleUrl: './gaia-gis.component.css',
})
export class GaiaGisComponent implements OnInit {
  @Input() options?: Option;
  
  // 🔥 Output event for polygon drawing (for backward compatibility)
  polygonDrawn = output<PolygonGaia>();
  
  // 🔥 Inject the service with signals
  private readonly gaiaGisService = inject(GaiaGisService);
  
  // 🔥 Expose service signals for template usage
  public readonly isDrawingPolygon = this.gaiaGisService.isDrawingPolygon;
  public readonly drawingStatus = this.gaiaGisService.drawingStatus;
  public readonly polygonCount = this.gaiaGisService.polygonCount;
  public readonly completedPolygons = this.gaiaGisService.completedPolygons;
  public readonly currentPolygon = this.gaiaGisService.currentPolygon;
  public readonly drawingState = this.gaiaGisService.drawingState;
  
  // 🔥 Computed signal for UI state
  public readonly canStartDrawing = computed(() => 
    !this.isDrawingPolygon() && this.drawingState() !== 'completing'
  );
  
  public readonly showCancelButton = computed(() => 
    this.isDrawingPolygon() && this.drawingState() === 'drawing'
  );
  
  constructor() {
    // 🔥 Effect to emit events for backward compatibility
    effect(() => {
      const currentPolygon = this.currentPolygon();
      if (currentPolygon && this.drawingState() === 'completing') {
        this.polygonDrawn.emit(currentPolygon);
      }
    });
  }
  
  ngOnInit(): void {
    this.initializeMap();
  }
  
  initializeMap(): void {
    if (this.options) {
      this.gaiaGisService.initializeMap('map', this.options);
    } else {
      this.gaiaGisService.initializeMap('map');
    }
  }
  
  /**
   * 🔥 Starts polygon drawing mode using the service signals.
   */
  startPolygonDraw(): void {
    this.gaiaGisService.startPolygonDraw();
  }
  
  /**
   * 🔥 Cancels polygon drawing using the service signals.
   */
  cancelPolygonDraw(): void {
    this.gaiaGisService.cancelPolygonDraw();
  }
  
  /**
   * 🔥 Clears all drawn polygons using the service signals.
   */
  clearPolygons(): void {
    this.gaiaGisService.clearPolygons();
  }
  
  /**
   * 🔥 Gets the latest polygon using signals
   */
  getLatestPolygon(): PolygonGaia | null {
    return this.gaiaGisService.getLatestPolygon();
  }
  
  /**
   * 🔥 Removes a polygon by ID using signals
   */
  removePolygonById(id: number): void {
    this.gaiaGisService.removePolygonById(id);
  }
}

