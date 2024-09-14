import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { Station } from '../../../features/trips/models/station.model';
import {
  selectCarriages,
  selectRoutes,
  selectStations,
} from '../../../core/store/trips/trips.selectors';
import { Carriage } from '../../../features/trips/models/carriage.model';
import { Route } from '../../../features/trips/models/route.model';
import { loadDataForRoutesView } from '../../../core/store/trips/trips.actions';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private stations$: Observable<Station[]> = this.store.select(selectStations);

  private carriages$: Observable<Carriage[]> = this.store.select(selectCarriages);

  private routes$: Observable<Route[]> = this.store.select(selectRoutes);

  totalStations!: number;

  totalRoutes!: number;

  totalCarriages!: number;

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(loadDataForRoutesView());
    combineLatest([this.stations$, this.carriages$, this.routes$]).subscribe(
      ([stations, carriages, routes]) => {
        this.totalStations = stations.length;
        this.totalRoutes = carriages.length;
        this.totalCarriages = routes.length;
      },
    );
  }
}
