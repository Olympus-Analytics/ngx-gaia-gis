import { Component, inject, OnInit } from '@angular/core';
import { GaiaGisService } from '../../../gaia-gis/src/lib/gaia-gis/gaia-gis.service';
import {
  GaiaGisComponent,
  MapsDesign,
  Option,
} from '../../../gaia-gis/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GaiaGisComponent],
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
  settings: Option = {
    center: [0, 0],
    zoom: 2,
    design: MapsDesign.CARTOCDN,
  };
  ngOnInit(): void {
    this.gaiaService.addPoints([
      { coords: [-0.1276, 51.5074], info: 'London' },
      { coords: [2.3522, 48.8566], info: 'Paris' },
      { coords: [13.405, 52.52] },
      { coords: [-74.006, 40.7128], info: 'New York' },
    ]);
  }

  addSamplePoints(): void {
    this.gaiaService.setView(this.samplePoints[0], 8);
  }
}
