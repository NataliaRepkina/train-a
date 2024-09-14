import { Route } from './route.model';
import { StationRequestInfo } from './stationRequestInfo.model';

export interface SearchResponseDTO {
  from: StationRequestInfo;
  to: StationRequestInfo;
  routes: Route[];
}
