import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaiaGisComponent } from './gaia-gis.component';

describe('GaiaGisComponent', () => {
  let component: GaiaGisComponent;
  let fixture: ComponentFixture<GaiaGisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaiaGisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GaiaGisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
