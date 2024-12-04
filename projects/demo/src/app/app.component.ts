import { Component, inject, OnInit } from '@angular/core';
import { GaiaGisService } from '../../../gaia-gis/src/lib/gaia-gis.service';
import { MapsDesign } from '../../../gaia-gis/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  gaiaService = inject(GaiaGisService);
  samplePoints: [number, number][] = [
    [-0.1276, 51.5074], // London
    [2.3522, 48.8566], // Paris
    [13.405, 52.52], // Berlin
    [-74.006, 40.7128], // New York
  ];
  ngOnInit() {
    this.gaiaService.initializeMap('map', {
      design: MapsDesign.CARTOCDN,
    });

    this.gaiaService.addRasterLayer(
      'http://oin-hotosm.s3.amazonaws.com/56f9b5a963ebf4bc00074e70/0/56f9c2d42b67227a79b4faec.tif'
    );
    this.gaiaService.addPoints(this.samplePoints);
  }

  addSamplePoints(): void {
    this.gaiaService.setView(this.samplePoints[0], 8);
  }
}
