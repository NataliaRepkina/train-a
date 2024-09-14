import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Route } from '../../../features/trips/models/route.model';
import { loadRouteById, loadStations, updateRide } from '../../../core/store/trips/trips.actions';
import {
  selectRides,
  selectRoutes,
  selectStations,
} from '../../../core/store/trips/trips.selectors';
import { Station } from '../../../features/trips/models/station.model';
import { Ride } from '../../../features/trips/models/ride.model';
import { DialogComponent } from '../dialog/dialog.component';
import { CreateRideDialogComponent } from '../create-ride-dialog/create-ride-dialog.component';
import { timetableValidator } from '../../validators/timetable';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  protected route$!: Observable<Route[]>;

  protected stations$: Observable<Station[]>;

  protected isEnable?: [number, number];

  protected isEnablePrice?: [number, number];

  protected rides$!: Observable<Ride[]>;

  protected timetableForm = this.formBuilder.nonNullable.group({
    departure: new FormControl(''),
    arrival: new FormControl(''),
  });

  protected priceForm: FormGroup;

  selectedId!: number;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
  ) {
    this.store.dispatch(loadStations());
    this.stations$ = this.store.select(selectStations);
    this.priceForm = this.formBuilder.nonNullable.group({});
  }

  ngOnInit() {
    this.selectedId = Number(this.route.snapshot.paramMap.get('id'));
    this.store.dispatch(loadRouteById({ id: this.selectedId }));
    this.route$ = this.store.select(selectRoutes);
    this.rides$ = this.store.select(selectRides);
  }

  protected findStationNameById(id: number, stations: Station[]): string {
    const foundStation = stations.find((station) => {
      return station.id === id;
    });
    return foundStation ? foundStation.city : 'Station not found';
  }

  protected getKeys(obj: { [key: string]: number }): string[] {
    return Object.keys(obj);
  }

  protected addPriceControl(key: string, value: number) {
    this.priceForm.addControl(
      key,
      new FormControl(value, [Validators.required, Validators.min(0)]),
    );
  }

  get priceControls() {
    return Object.keys(this.priceForm.controls);
  }

  protected openDialog(rideId: number) {
    this.dialog.open(DialogComponent, {
      data: {
        routeId: this.selectedId,
        rideId,
      },
    });
  }

  protected createRideDialog(route: Route, stations: Station[]) {
    this.dialog.open(CreateRideDialogComponent, {
      data: {
        route,
        stations,
      },
    });
  }

  protected updateTimetable(ride: Ride, cell: number) {
    const updatedRide = JSON.parse(JSON.stringify(ride));
    if (this.timetableForm.controls.departure.valid) {
      const departureDate = new Date(this.timetableForm.controls.departure.value ?? '');
      updatedRide.schedule.segments[cell].time[0] = departureDate.toISOString();
    }
    if (this.timetableForm.controls.arrival.valid && cell > 0) {
      const arrivalDate = new Date(this.timetableForm.controls.arrival.value ?? '');
      updatedRide.schedule.segments[cell - 1].time[1] = arrivalDate.toISOString();
    }
    this.store.dispatch(
      updateRide({
        routeId: this.selectedId,
        rideId: ride.rideId,
        segments: updatedRide.schedule.segments,
      }),
    );
    this.isEnable = undefined;
  }

  protected editTimetable(
    rideId: number,
    cell: number,
    departure: string,
    arrival: string,
    previousArrival: string,
    nextDeparture: string,
  ) {
    this.isEnable = [rideId, cell];
    this.isEnablePrice = undefined;

    if (arrival) {
      const formattedArrival = this.datePipe.transform(arrival, 'yyyy-MM-dd HH:mm');
      this.timetableForm.controls.arrival.setValue(formattedArrival);
    }
    if (departure) {
      const formattedDeparture = this.datePipe.transform(departure, 'yyyy-MM-dd HH:mm');
      this.timetableForm.controls.departure.setValue(formattedDeparture);
    }
    this.timetableForm.addValidators(timetableValidator(cell, previousArrival, nextDeparture));
  }

  protected editPrice(rideId: number, cell: number, price: { [key: string]: number }) {
    this.priceForm = this.formBuilder.nonNullable.group({});
    this.isEnablePrice = [rideId, cell];
    this.isEnable = undefined;

    Object.entries(price).forEach(([key, value]) => {
      this.addPriceControl(key, value / 100);
    });
  }

  protected updatePrice(ride: Ride, cell: number) {
    const updatedRide = JSON.parse(JSON.stringify(ride));
    if (this.priceForm.valid) {
      const prices = this.priceForm.value;
      Object.entries(prices).forEach(([key, value]) => {
        if (typeof value === 'number') {
          updatedRide.schedule.segments[cell].price[key] = value * 100;
        }
      });
    }
    this.store.dispatch(
      updateRide({
        routeId: this.selectedId,
        rideId: ride.rideId,
        segments: updatedRide.schedule.segments,
      }),
    );
    this.isEnablePrice = undefined;
  }
}
