export interface Station {
  id: number;
  city: string;
  latitude: number;
  longitude: number;
  connectedTo: { id: number; distance: number }[];
}
