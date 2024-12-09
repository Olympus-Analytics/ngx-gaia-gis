import { Component, inject, OnInit } from '@angular/core';
import {
  GaiaGisComponent,
  Option,
  MapsDesign,
  GaiaGisService,
} from 'ngx-gaia-gis';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GaiaGisComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  gaiaGisService = inject(GaiaGisService);
  // Optional configuration for the map
  settings: Option = {
    center: [0, 0],
    zoom: 2,
    design: MapsDesign.CARTOCDN,
  };
  ngOnInit(): void {
    this.gaiaGisService.addPoints(
      [
        { coords: [-74.006, 40.7128], info: 'NYC' },
        { coords: [-118.2437, 34.0522], info: 'LA' },
      ] // NYC & LA
    );
  }
}
