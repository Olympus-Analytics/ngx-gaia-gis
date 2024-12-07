import { Component, inject, Input, input, OnInit } from '@angular/core';
import { GaiaGisService } from './gaia-gis.service';
import { Option } from '../interfaces/OptionsGaia.model';

@Component({
  selector: 'gaia-gis',
  standalone: true,
  imports: [],
  templateUrl: './gaia-gis.component.html',
  styleUrl: './gaia-gis.component.css',
})
export class GaiaGisComponent implements OnInit {
  @Input() options?: Option;
  GaiaGisService = inject(GaiaGisService);
  ngOnInit(): void {
    this.initilizeMap();
  }
  initilizeMap(): void {
    if (this.options) {
      this.GaiaGisService.initializeMap('map', this.options);
    } else {
      this.GaiaGisService.initializeMap('map');
    }
  }
}
