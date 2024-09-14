import { Segment } from '../../features/trips/models/segment.model';

export function getRideSegments(
  segments: Segment[],
  path: number[],
  fromId: number,
  toId: number,
): Segment[] {
  const firstStationId = path.findIndex((station) => {
    return fromId === station;
  });
  const lastStationId = path.findIndex((station) => {
    return toId === station;
  });

  return segments.slice(firstStationId, lastStationId + 1);
}
