import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Carriage } from '../../../../features/trips/models/carriage.model';

@Component({
  selector: 'app-carriage-card',
  templateUrl: './carriage-card.component.html',
  styleUrl: './carriage-card.component.scss',
})
export class CarriageCardComponent implements OnInit {
  @Input({ required: true }) carriage!: Carriage;

  @Input({ required: true }) isDisabled!: boolean;

  @Output() updatedCarriage = new EventEmitter<Carriage>();

  protected countOfSeats!: number;

  ngOnInit(): void {
    this.countOfSeats = this.calcCountTotalNumberOfSeats();
  }

  onUpdateCarriage(carriage: Carriage) {
    this.updatedCarriage.emit(carriage);
  }

  private calcCountTotalNumberOfSeats(): number {
    return (
      this.carriage.rows * this.carriage.leftSeats + this.carriage.rows * this.carriage.rightSeats
    );
  }
}
