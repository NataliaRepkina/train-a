import { Carriage } from '../../features/trips/models/carriage.model';
import { Order } from '../../features/trips/models/order.model';
import { Ride } from '../../features/trips/models/ride.model';
import { Route } from '../../features/trips/models/route.model';
import { Segment } from '../../features/trips/models/segment.model';
import { Station } from '../../features/trips/models/station.model';
import { StationRequestInfo } from '../../features/trips/models/stationRequestInfo.model';
import { User } from '../../features/trips/models/user.model';

export interface TripsState {
  stations: Station[];
  routes: Route[];
  carriages: Carriage[];
  orders: Order[];
  rides: Ride[];
  users: User[];
  searchResponses: SearchResponse[];
  searchDate?: Date;
  loading: boolean;
}

export interface SearchResponse {
  [date: string]: RideInfo[];
}

export interface RideInfo {
  rideId: number;
  from: StationRequestInfo;
  to: StationRequestInfo;
  segments: Segment[];
}
