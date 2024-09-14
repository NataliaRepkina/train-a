import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Carriage } from '../../../../features/trips/models/carriage.model';
import { Seat, SeatStatus } from '../../carriage/carriage.component';

@Component({
  selector: 'app-carriage-simple',
  templateUrl: './carriage-simple.component.html',
  styleUrls: ['./carriage-simple.component.scss'],
})
export class CarriageSimpleComponent implements OnChanges {
  @Input({ required: true }) carriage!: Carriage;

  protected seats: Seat[] = [];

  countOfSeats!: number;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['carriage']) {
      this.countOfSeats = this.calcCountTotalNumberOfSeats();
      this.createSeats();
    }
  }

  private createSeats() {
    this.seats = [];

    for (let i = 0; i < this.countOfSeats; i += 1) {
      const seat: Seat = {
        numberInCarriage: i + 1,
        status: SeatStatus.FREE,
      };
      this.seats.push(seat);
    }
  }

  private calcCountTotalNumberOfSeats(): number {
    return (
      this.carriage.rows * this.carriage.leftSeats + this.carriage.rows * this.carriage.rightSeats
    );
  }

  trackBySeat(index: number, seat: Seat): number {
    return seat.numberInCarriage;
  }
}
