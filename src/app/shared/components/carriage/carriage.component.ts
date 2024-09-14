/*
** How to use in parents component **

In the parent component, you can get data for user-selected seats form CarriageComponent:
Method for example:

onSelectedSeatsChange(seatsData: CarriageSelectedSeats) {
    console.log('Selected seats:', seatsData.selectedSeats);
  }

In HTML template:
 <app-carriage
    [rows]="carriage.rows"
    [leftSeats]="carriage.leftSeats"
    [rightSeats]="carriage.rightSeats"
    [carriageNumber]="carriageNumber"
    [occupiedSeat]="occupiedSeat"
    (selectedSeatsChange)="onSelectedSeatsChange($event)"
  ></app-carriage>
*/

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export enum SeatStatus {
  FREE = 'free',
  OCCUPIED = 'occupied',
  BOOKED = 'booked',
}
export interface Seat {
  numberInCarriage: number;
  status: SeatStatus.FREE | SeatStatus.OCCUPIED | SeatStatus.BOOKED;
}

export interface CarriageSelectedSeats {
  carriageNumber: number;
  selectedSeats: Seat[];
}

@Component({
  selector: 'app-carriage',
  templateUrl: './carriage.component.html',
  styleUrl: './carriage.component.scss',
})
export class CarriageComponent implements OnInit {
  // rows - number of rows
  @Input({ required: true }) rows!: number;

  // leftSeats - the number of seats to the left of the aisle in a row (2 in example below)
  @Input({ required: true }) leftSeats!: number;

  // rightSeats - the number of seats to the right of the aisle in a row (3 in example below)
  @Input({ required: true }) rightSeats!: number;

  // should be calculated by the index of the carriage in the train+1
  @Input({ required: true }) carriageNumber!: number;

  // should be calculated by the indicator of occupied seats in the train, based on the number and order of wagons and the number of seats in each of them
  @Input({ required: true }) occupiedSeat!: number[];

  // passing data on selected places to the parent component for order placement
  @Output() selectedSeatsChange = new EventEmitter<CarriageSelectedSeats>();

  private countOfSeats!: number;

  protected countOfFreeSeats!: number;

  protected seats: Seat[] = [];

  public selectedSeats: Seat[] = [];

  public seatStatus = SeatStatus;

  ngOnInit(): void {
    this.countOfSeats = this.calcCountTotalNumberOfSeats();
    this.countOfFreeSeats = this.calcCountFreeOfSeats();
    this.createSeats();
  }

  private calcCountTotalNumberOfSeats(): number {
    return this.rows * this.leftSeats + this.rows * this.rightSeats;
  }

  private calcCountFreeOfSeats(): number {
    return this.countOfSeats - this.occupiedSeat.length;
  }

  private createSeats() {
    for (let i = 0; i < this.countOfSeats; i += 1) {
      const seat: Seat = {
        numberInCarriage: i + 1,
        status: this.occupiedSeat.some((item) => {
          return item === i + 1;
        })
          ? SeatStatus.OCCUPIED
          : SeatStatus.FREE,
      };
      this.seats.push(seat);
    }
  }

  public onSeatSelectionChange(seat: Seat, event: Event) {
    const currentSeat = seat;
    const { checked } = event.target as HTMLInputElement;
    if (checked && this.selectedSeats.length === 0) {
      currentSeat.status = SeatStatus.BOOKED;
      this.selectedSeats.push(seat);
    } else {
      currentSeat.status = SeatStatus.FREE;
      this.selectedSeats = this.selectedSeats.filter((item) => {
        return item.numberInCarriage !== seat.numberInCarriage;
      });
    }

    // saving the location data for ordering
    // maybe some of them will turn out to be unnecessary in the future.
    const selectedSeatData: CarriageSelectedSeats = {
      carriageNumber: this.carriageNumber,
      selectedSeats: this.selectedSeats,
    };

    this.selectedSeatsChange.emit(selectedSeatData);
  }

  trackBySeat(index: number, seat: Seat): number {
    return seat.numberInCarriage;
  }
}
