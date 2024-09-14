import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { loadRideById } from '../../../../../core/store/trips/trips.actions';
import { selectRides, selectStations } from '../../../../../core/store/trips/trips.selectors';
import { Ride } from '../../../models/ride.model';
import { Segment } from '../../../models/segment.model';
import { Station } from '../../../models/station.model';
import { RideInfo } from '../../../../../core/models/trips.model';
import { TripRouteDialogComponent } from '../trip-route-dialog/trip-route-dialog.component';
import { getTimeDifference } from '../../../../../shared/utilities/getTimeDifference.utility';
import { calculateTotalRidePrice } from '../../../../../shared/utilities/calculateTotalRidePrice.utility';
import { getRideSegments } from '../../../../../shared/utilities/getRideSegments.utility';

@Component({
  selector: 'app-trip-item',
  templateUrl: './trip-item.component.html',
  styleUrl: './trip-item.component.scss',
})
export class TripItemComponent implements OnInit {
  @Input({ required: true }) rideItemInfo!: RideInfo;

  public rides$ = this.store.select(selectRides);

  private stations$ = this.store.select(selectStations);

  private stations!: Station[];

  private ride?: Ride;

  public rideStartDate!: Date;

  public rideEndDate!: Date;

  public rideDuration!: string;

  public rideStartStation!: string;

  public rideEndStation!: string;

  public routeStartStation!: Station;

  public routeEndStation!: Station;

  public prices!: [string, number][];

  constructor(
    private store: Store,
    private destroyRef: DestroyRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadRideById({ rideId: this.rideItemInfo.rideId }));

    const ridesSubscription = this.rides$.subscribe((rides) => {
      this.ride = rides.find((ride) => {
        return ride.rideId === this.rideItemInfo.rideId;
      });

      if (this.ride) {
        const rideSegments = getRideSegments(
          this.ride.schedule.segments,
          this.ride.path,
          this.rideItemInfo.from.stationId,
          this.rideItemInfo.to.stationId,
        );

        this.initViewData(rideSegments);
      }
    });

    const stationsSubscription = this.stations$.subscribe((stations) => {
      this.stations = stations;
    });

    this.destroyRef.onDestroy(() => {
      ridesSubscription.unsubscribe();
      stationsSubscription.unsubscribe();
    });
  }

  public calculateTotalRidePrice(type: string) {
    return calculateTotalRidePrice(
      getRideSegments(
        this.ride!.schedule.segments,
        this.ride!.path,
        this.rideItemInfo.from.stationId,
        this.rideItemInfo.to.stationId,
      ),
      type,
    );
  }

  public openRouteDialog() {
    this.dialog.open(TripRouteDialogComponent, {
      data: {
        rideId: this.ride?.rideId,
        segments: getRideSegments(
          this.ride!.schedule.segments,
          this.ride!.path,
          this.rideItemInfo.from.stationId,
          this.rideItemInfo.to.stationId,
        ),
        path: this.getRidePath(this.ride!),
      },
    });
  }

  private initViewData(rideSegments: Segment[]) {
    const [firstSegment] = rideSegments;
    const lastSegment = rideSegments.at(rideSegments.length - 1)!;

    this.rideStartDate = new Date(firstSegment.time[0]);
    this.rideEndDate = new Date(lastSegment.time[0]);

    this.rideDuration = getTimeDifference(this.rideStartDate, this.rideEndDate);

    this.rideStartStation = this.rideItemInfo.from.city;
    this.rideEndStation = this.rideItemInfo.to.city;

    this.prices = Object.entries(firstSegment.price);
    if (this.stations) {
      this.initRouteStations();
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

  private getRidePath(ride: Ride): number[] {
    const { path } = ride;

    const firstStationId = path.findIndex((station) => {
      return this.rideItemInfo.from.stationId === station;
    });
    const lastStationId = path.findIndex((station) => {
      return this.rideItemInfo.to.stationId === station;
    });

    return path.slice(firstStationId, lastStationId + 1);
  }
}
