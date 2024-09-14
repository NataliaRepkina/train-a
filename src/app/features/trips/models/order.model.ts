import { Schedule } from './schedule.model';

export interface Order {
  id: number;
  userId: number;
  routeId: number;
  rideId: number;
  seatId: number;
  path: number[];
  carriages: string[];
  stationStart: number;
  stationEnd: number;
  schedule: Schedule;
  status: 'active' | 'completed' | 'rejected' | 'canceled';
}
