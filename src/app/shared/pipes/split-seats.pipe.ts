import { Pipe, PipeTransform } from '@angular/core';
import { Seat } from '../components/carriage/carriage.component';

// Helper function to split seats into columns
const splitIntoColumns = (seats: Seat[], seatsPerColumn: number): Seat[][] => {
  const columns: Seat[][] = [];
  for (let i = 0; i < seats.length; i += seatsPerColumn) {
    columns.push(seats.slice(i, i + seatsPerColumn));
  }
  return columns;
};
@Pipe({
  name: 'splitSeats',
})
export class SplitSeatsPipe implements PipeTransform {
  transform(seats: Seat[], left: number, right: number): Seat[][][] {
    // Split seats into left and right parts
    const leftSeats: Seat[] = [];
    const rightSeats: Seat[] = [];
    const totalSeatsInColumn = left + right;

    seats.forEach((seat, index) => {
      const seatInColumnIndex = index % totalSeatsInColumn;

      if (seatInColumnIndex < left) {
        leftSeats.push(seat);
      } else {
        rightSeats.push(seat);
      }
    });

    // Split left and right seats into columns
    const leftColumns = splitIntoColumns(leftSeats, left);
    const rightColumns = splitIntoColumns(rightSeats, right);

    // Return as a combined array of columns
    return [rightColumns, leftColumns];
  }
}
