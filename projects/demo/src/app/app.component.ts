import { Component } from '@angular/core';
import { GaiaGisComponent, MapsDesign, Option } from 'ngx-gaia-gis';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GaiaGisComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // Optional configuration for the map
  settings: Option = {
    center: [0, 0],
    zoom: 2,
    design: MapsDesign.CARTOCDN,
  };
}
