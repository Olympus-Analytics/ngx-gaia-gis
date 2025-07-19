import { Component, inject, OnInit, computed, effect } from '@angular/core';
import {
  GaiaGisComponent,
  Option,
  MapsDesign,
  GaiaGisService,
  PolygonGaia,
} from '../../../gaia-gis/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GaiaGisComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // 🔥 Inject service with signals
  private readonly gaiaGisService = inject(GaiaGisService);
  
  // 🔥 Expose service signals for template usage
  public readonly isDrawingPolygon = this.gaiaGisService.isDrawingPolygon;
  public readonly drawingStatus = this.gaiaGisService.drawingStatus;
  public readonly polygonCount = this.gaiaGisService.polygonCount;
  public readonly completedPolygons = this.gaiaGisService.completedPolygons;
  public readonly currentPolygon = this.gaiaGisService.currentPolygon;
  public readonly drawingState = this.gaiaGisService.drawingState;
  
  // 🔥 Computed signals for UI logic
  public readonly canStartDrawing = computed(() => 
    !this.isDrawingPolygon() && this.drawingState() !== 'completing'
  );
  
  public readonly showCancelButton = computed(() => 
    this.isDrawingPolygon() && this.drawingState() === 'drawing'
  );
  
  public readonly hasPolygons = computed(() => this.polygonCount() > 0);
  
  public readonly statusClass = computed(() => {
    const state = this.drawingState();
    switch (state) {
      case 'drawing': return 'status-drawing';
      case 'completing': return 'status-success';
      case 'cancelled': return 'status-warning';
      default: return 'status-idle';
    }
  });
  
  // Optional configuration for the map
  settings: Option = {
    center: [0, 0],
    zoom: 2,
    design: MapsDesign.CARTOCDN,
  };
  
  constructor() {
    // 🔥 Effect to react to polygon completion
    effect(() => {
      const polygon = this.currentPolygon();
      const state = this.drawingState();
      
      if (polygon && state === 'completing') {
        console.log('🎉 New polygon completed via signals!', polygon);
        console.log('📍 Coordinates:', polygon.coordinates);
        console.log('📊 Properties:', polygon.properties);
        
        // Show a notification (you could integrate with a toast service)
        this.showNotification(`Polygon completed! Total: ${this.polygonCount()}`);
      }
    });
    
    // 🔥 Effect to log drawing state changes
    effect(() => {
      const state = this.drawingState();
      const isDrawing = this.isDrawingPolygon();
      
      console.log(`🔄 Drawing state: ${state}, Active: ${isDrawing}`);
    });
    
    // 🔥 Effect to log polygon count changes
    effect(() => {
      const count = this.polygonCount();
      if (count > 0) {
        console.log(`📈 Total polygons: ${count}`);
      }
    });
  }
  
  ngOnInit(): void {
    this.gaiaGisService.addPoints(
      [
        { coords: [-74.006, 40.7128], info: 'NYC' },
        { coords: [-118.2437, 34.0522], info: 'LA' },
      ] // NYC & LA
    );
  }
  
  /**
   * 🔥 Handles polygon drawing completion (for backward compatibility)
   * @param polygon - The completed polygon data
   */
  onPolygonComplete(polygon: PolygonGaia): void {
    console.log('📡 Polygon received via output event:', polygon);
    // This method is called by the output event for backward compatibility
    // The actual reactive logic is handled by effects above
  }
  
  /**
   * 🔥 Starts polygon drawing mode using signals
   */
  startDrawing(): void {
    this.gaiaGisService.startPolygonDraw();
  }
  
  /**
   * 🔥 Cancels polygon drawing using signals
   */
  cancelDrawing(): void {
    this.gaiaGisService.cancelPolygonDraw();
  }
  
  /**
   * 🔥 Clears all drawn polygons using signals
   */
  clearPolygons(): void {
    this.gaiaGisService.clearPolygons();
  }
  
  /**
   * 🔥 Removes a specific polygon by ID using signals
   */
  removePolygon(id: number): void {
    this.gaiaGisService.removePolygonById(id);
  }
  
  /**
   * 🔥 Gets the latest polygon using signals
   */
  getLatestPolygon(): PolygonGaia | null {
    return this.gaiaGisService.getLatestPolygon();
  }
  
  /**
   * 🔥 Gets status icon based on drawing state
   */
  public getStatusIcon(): string {
    const state = this.drawingState();
    switch (state) {
      case 'drawing': return '✏️';
      case 'completing': return '✅';
      case 'cancelled': return '❌';
      default: return '⭕';
    }
  }
  
  /**
   * 🔥 Formats date for display
   */
  public formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleTimeString();
  }

  /**
   * Simple notification system (you could replace with a proper toast library)
   */
  private showNotification(message: string): void {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}
