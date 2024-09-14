import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, inject, OnInit } from '@angular/core';
import { Segment } from '../../../models/segment.model';
import { selectStations } from '../../../../../core/store/trips/trips.selectors';
import { Station } from '../../../models/station.model';
import { getTimeDifference } from '../../../../../shared/utilities/getTimeDifference.utility';

export interface RouteDialogData {
  rideId: number;
  segments: Segment[];
  path: number[];
}

@Component({
  selector: 'app-trip-route-dialog',
  templateUrl: './trip-route-dialog.component.html',
  styleUrl: './trip-route-dialog.component.scss',
})
export class TripRouteDialogComponent implements OnInit {
  public stations$ = this.store.select(selectStations);

  public routeStationsCities: Station[] = [];

  public data = inject<RouteDialogData>(MAT_DIALOG_DATA);

  public getTimeDifference = getTimeDifference;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.stations$.pipe(take(1)).subscribe((stations) => {
      this.routeStationsCities = this.data.path.map((cityId) => {
        const searchResult = stations.find((station) => {
          return station.id === cityId;
        })!;
        return searchResult;
      });
    });
  }
}
