import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  createOrder,
  loadCarriages,
  loadRideById,
  loadStations,
} from '../../../../core/store/trips/trips.actions';
import { getTimeDifference } from '../../../../shared/utilities/getTimeDifference.utility';
import { Segment } from '../../models/segment.model';
import { TripRouteDialogComponent } from '../trips-search-results/trip-route-dialog/trip-route-dialog.component';
import {
  selectCarriages,
  selectRides,
  selectStations,
} from '../../../../core/store/trips/trips.selectors';
import { Ride } from '../../models/ride.model';
import { Station } from '../../models/station.model';
import { getRidePath } from '../../../../shared/utilities/getRidePath.utility';
import { Carriage } from '../../models/carriage.model';
import { CarriageSelectedSeats } from '../../../../shared/components/carriage/carriage.component';
import { getRideSegments } from '../../../../shared/utilities/getRideSegments.utility';
import { calculateTotalRidePrice } from '../../../../shared/utilities/calculateTotalRidePrice.utility';
import { selectAccess } from '../../../../core/store/user/user.selectors';
import { Access } from '../../../../core/models/user.model';

export interface SelectedSeat {
  carriageNumber: number;
  seatNumber: number;
}

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.scss',
})
export class TripDetailComponent implements OnInit {
  public rides$ = this.store.select(selectRides);

  public rideStartDate!: Date;

  public rideEndDate!: Date;

  public rideDuration!: string;

  public rideStartCity!: string;

  public rideEndCity!: string;

  public routeStartStation!: Station;

  public routeEndStation!: Station;

  public prices: [string, number][] = [];

  public carriages: Carriage[] = [];

  public rideSegments!: Segment[];

  public occupiedSeats!: SelectedSeat[];

  public isSeatsSelected: boolean = false;

  public access!: Access;

  public stations$ = this.store.select(selectStations);

  private access$ = this.store.select(selectAccess);

  private carriages$ = this.store.select(selectCarriages);

  private stations!: Station[];

  private ride?: Ride;

  private rideId!: number;

  private fromId!: number;

  private toId!: number;

  private selectedSeats?: CarriageSelectedSeats;

  constructor(
    private store: Store,
    private destroyRef: DestroyRef,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const routeSubscribe = this.route.queryParams.subscribe((params) => {
      this.rideId = +params['rideId'];
      this.fromId = +params['fromId'];
      this.toId = +params['toId'];
    });

    this.store.dispatch(loadRideById({ rideId: this.rideId }));

    const ridesSubscription = this.rides$.subscribe((rides) => {
      this.ride = rides.find((ride) => {
        return ride.rideId === this.rideId;
      });
    });

    this.store.dispatch(loadStations());

    const stationsSubscription = this.stations$.subscribe((stations) => {
      this.stations = stations;

      if (this.ride && this.stations.length > 0) {
        this.rideSegments = getRideSegments(
          this.ride.schedule.segments,
          this.ride.path,
          this.fromId,
          this.toId,
        );

        this.initViewData(this.rideSegments);

        this.occupiedSeats = this.rideSegments
          .reduce((prev: number[], currentSegment) => {
            return [...prev, ...currentSegment.occupiedSeats];
          }, [])
          .map(this.getSeatNumberInCarriage.bind(this));

        this.store.dispatch(loadCarriages());
      }
    });

    const carriagesSubscription = this.carriages$.subscribe((carriages) => {
      this.carriages = this.prices
        .map((price) => {
          return carriages.find((carriage) => {
            return carriage.name === price[0];
          });
        })
        .filter((value) => {
          return !!value;
        });
    });

    const accessSubscription = this.access$.subscribe((access) => {
      this.access = access;
    });

    this.destroyRef.onDestroy(() => {
      accessSubscription.unsubscribe();
      carriagesSubscription.unsubscribe();
      ridesSubscription.unsubscribe();
      stationsSubscription.unsubscribe();
      routeSubscribe.unsubscribe();
    });
  }

  public onSeatsSelect(seats: CarriageSelectedSeats) {
    this.isSeatsSelected = seats.selectedSeats.length > 0;

    this.selectedSeats = seats;
  }

  public onSeatsBook() {
    const { carriageNumber } = this.selectedSeats!;
    const seatNumber = this.selectedSeats!.selectedSeats[0].numberInCarriage!;

    if (this.access === 'guest') {
      this.router.navigateByUrl('/signin');

      return;
    }

    this.store.dispatch(
      createOrder({
        rideId: this.rideId,
        seat: this.getSeatNumberInTrain(seatNumber, carriageNumber),
        stationEnd: this.toId,
        stationStart: this.fromId,
      }),
    );
  }

  public getSeatNumberInTrain(numberInCarriage: number, carriageNumber: number) {
    let sumOfPrevCarriages = 0;
    this.carriages.forEach((carriage, index) => {
      if (index + 1 < carriageNumber) {
        sumOfPrevCarriages += (carriage.leftSeats + carriage.rightSeats) * carriage.rows;
      }
    });

    return sumOfPrevCarriages + numberInCarriage;
  }

  public getSeatNumberInCarriage(numberInTrain: number): SelectedSeat {
    let seatNumber = numberInTrain;
    let carriageNumber = 1;

    this.carriages.forEach((carriage) => {
      const carriageSeatAmount = (carriage.leftSeats + carriage.rightSeats) * carriage.rows;
      const seatDifference = seatNumber - carriageSeatAmount;

      if (seatDifference > 0) {
        seatNumber -= carriageSeatAmount;
        carriageNumber += 1;
      }
    });

    return {
      carriageNumber,
      seatNumber,
    };
  }

  public getCarriageOccupiedSeats(selectedSeats: SelectedSeat[], carriageNumber: number): number[] {
    if (selectedSeats) {
      return selectedSeats
        .filter((seat) => {
          return seat.carriageNumber === carriageNumber;
        })
        .map((seat) => {
          return seat.seatNumber;
        });
    }

    return [];
  }

  public openRouteDialog() {
    this.dialog.open(TripRouteDialogComponent, {
      data: {
        rideId: this.ride?.rideId,
        segments: this.rideSegments,
        path: getRidePath(this.ride!, this.fromId, this.toId),
      },
    });
  }

  public calculateTotalRidePrice(type: string) {
    return calculateTotalRidePrice(
      getRideSegments(this.ride!.schedule.segments, this.ride!.path, this.fromId, this.toId),
      type,
    );
  }

  private initViewData(rideSegments: Segment[]) {
    const [firstSegment] = rideSegments;
    const lastSegment = rideSegments.at(rideSegments.length - 1)!;

    this.rideStartDate = new Date(firstSegment.time[0]);
    this.rideEndDate = new Date(lastSegment.time[1]);

    this.rideDuration = getTimeDifference(this.rideStartDate, this.rideEndDate);

    this.prices = Object.entries(firstSegment.price);

    if (this.stations) {
      this.initRouteStations();
      this.initRideStations();
    }
  }

  private initRouteStations() {
    if (this.ride) {
      const { path } = this.ride;

      this.routeStartStation = this.stations.find((station) => {
        return station.id === this.ride?.path.at(0);
      })!;
      this.routeEndStation = this.stations.find((station) => {
        return station.id === this.ride?.path.at(path.length - 1);
      })!;
    }
  }

  private initRideStations() {
    this.rideStartCity = this.stations.find((station) => {
      return station.id === this.fromId;
    })!.city;
    this.rideEndCity = this.stations.find((station) => {
      return station.id === this.toId;
    })!.city;
  }
}
