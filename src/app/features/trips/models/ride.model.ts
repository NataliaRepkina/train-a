import { Schedule } from './schedule.model';

export interface Ride {
  rideId: number;
  path: number[];
  carriages: string[];
  schedule: Schedule;
}
