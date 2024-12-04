import { Component, inject, input, OnInit } from '@angular/core';
import { GaiaGisService } from './gaia-gis.service';
import { Option } from '../src/lib/interfaces/options.model';

@Component({
  selector: 'lib-gaia-gis',
  standalone: true,
  imports: [],
  templateUrl: './gaia-gis.component.html',
  styleUrl: './gaia-gis.component.css',
})
export class GaiaGisComponent implements OnInit {
  readonly options = input<Option>();
  GaiaGisService = inject(GaiaGisService);
  ngOnInit(): void {
    this.initilizeMap();
  }
  initilizeMap(): void {
    this.GaiaGisService.initializeMap('map', this.options());
    
  }
}
