import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';

export interface OrderForView {
  id: number;
  user: string;
  startStation: string;
  startTime: string;
  endStation: string;
  endTime: string;
  durationTrip: string;
  typeCarriage: string;
  numberCarriage: number;
  numberSeat: number;
  price: string;
  status: string;
}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
})
export class OrderComponent implements OnInit {
  constructor(private store: Store) {}

  @Input({ required: true }) order!: OrderForView;

  @Output() delete = new EventEmitter<number>();

  startStation!: string;

  startTime!: string;

  endStation!: string;

  endTime!: string;

  durationTrip!: string;

  typeCarriage!: string;

  numberCarriage!: number;

  numberSeat!: number;

  price!: string;

  status!: string;

  ngOnInit(): void {
    this.startStation = this.order.startStation;

    this.startTime = this.order.startTime;

    this.endStation = this.order.endStation;

    this.endTime = this.order.endTime;

    this.durationTrip = this.order.durationTrip;

    this.typeCarriage = this.order.typeCarriage;

    this.numberCarriage = this.order.numberCarriage;

    this.numberSeat = this.order.numberSeat;

    this.price = this.order.price;

    this.status = this.order.status;
  }

  deleteOrder() {
    this.delete.emit(this.order.id);
  }
}
