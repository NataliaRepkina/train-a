import { Ride } from '../../features/trips/models/ride.model';

export function getRidePath(ride: Ride, fromId: number, toId: number): number[] {
  const { path } = ride;

  const firstStationId = path.findIndex((station) => {
    return fromId === station;
  });
  const lastStationId = path.findIndex((station) => {
    return toId === station;
  });

  return path.slice(firstStationId, lastStationId + 1);
}
