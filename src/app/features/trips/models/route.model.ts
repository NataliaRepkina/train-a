import { Schedule } from './schedule.model';

export interface Route {
  id: number;
  path: number[];
  carriages: string[];
  schedule: Schedule[];
}

export interface CityInfo {
  id: number;
  name: string;
}
