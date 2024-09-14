import { Segment } from './segment.model';

export interface Schedule {
  rideId: number;
  segments: Segment[];
}
