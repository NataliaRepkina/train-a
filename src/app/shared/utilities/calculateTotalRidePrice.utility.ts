import { Segment } from '../../features/trips/models/segment.model';

export function calculateTotalRidePrice(rideSegments: Segment[], type: string): string {
  let totalPrice = 0;
  rideSegments.forEach((segment) => {
    totalPrice += segment.price[type];
  });
  return (totalPrice / 100).toFixed(2);
}
