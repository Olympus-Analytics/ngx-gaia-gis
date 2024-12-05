import { MapsDesign } from './MapDesignsGaia.model';

export interface Option {
  center?: [number, number];
  zoom?: number;
  design?: MapsDesign;
}
