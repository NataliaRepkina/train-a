export interface Segment {
  time: [string, string];
  price: Price;
  occupiedSeats: number[];
}

export type Price = { [key: string]: number };
