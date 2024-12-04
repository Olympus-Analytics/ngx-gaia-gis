import { MapsDesign } from './MapDesigns';

export interface Option {
  center?: [number, number];
  zoom?: number;
  design?: MapsDesign;
}
