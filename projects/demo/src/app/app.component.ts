import { Component, inject, OnInit } from '@angular/core';
import { GaiaGisService } from '../../../gaia-gis/src/lib/gaia-gis.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  gaiaService = inject(GaiaGisService);

  ngOnInit() {
    this.gaiaService.initializeMap('map');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const url = URL.createObjectURL(file);
      this.gaiaService.addRasterLayer(url);
    }
  }
}
