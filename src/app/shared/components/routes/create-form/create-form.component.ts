import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Station } from '../../../../features/trips/models/station.model';
import { Carriage } from '../../../../features/trips/models/carriage.model';
import { selectCarriages, selectStations } from '../../../../core/store/trips/trips.selectors';
import { createRoute, loadDataForRoutesView } from '../../../../core/store/trips/trips.actions';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.scss',
})
export class CreateFormComponent implements OnInit, OnDestroy {
  @Output() changeOpen = new EventEmitter<boolean>();

  protected createForm = this.FB.nonNullable.group({
    stations: this.FB.nonNullable.array([this.FB.control('')]),
    carriages: this.FB.nonNullable.array([this.FB.control('')]),
  });

  public stations$: Observable<Station[]>;

  public carriages$: Observable<Carriage[]>;

  private subscribeStations$!: Subscription;

  private subscribeCarriages$!: Subscription;

  private snackBar = inject(MatSnackBar);

  public currentStations!: Station[];

  public carriagesList!: Carriage[];

  private horizontalPosition: MatSnackBarHorizontalPosition = 'start';

  private verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(
    private readonly store: Store,
    private FB: FormBuilder,
  ) {
    this.stations$ = this.store.select(selectStations);
    this.carriages$ = this.store.select(selectCarriages);
  }

  ngOnInit(): void {
    this.subscribeStations$ = this.stations$.subscribe((stations) => {
      this.currentStations = stations;
    });
    this.subscribeCarriages$ = this.carriages$.subscribe((carriages) => {
      this.carriagesList = carriages;
    });
  }

  public get carriages(): FormArray {
    return this.createForm.get('carriages') as FormArray;
  }

  public get stations(): FormArray {
    return this.createForm.get('stations') as FormArray;
  }

  private getConnectedList(index: number): { id: number; distance: number }[] {
    const value: number = index;
    const indexStation = this.currentStations.find((station: Station) => {
      return station.id === +value;
    });
    return indexStation ? indexStation.connectedTo : [{ id: 0, distance: 0 }];
  }

  public getConnectedCities(index: number): Station[] {
    const list: Station[] = [];
    const connectedList = this.getConnectedList(index);
    connectedList.forEach(({ id }) => {
      const queryStation = this.currentStations.find((station: Station) => {
        return +station.id === +id;
      });
      if (queryStation) {
        list.push(queryStation);
      } else {
        list.push({
          id: 0,
          city: `This station doesn't have connect`,
          latitude: 0,
          longitude: 0,
          connectedTo: [{ id: 0, distance: 0 }],
        });
      }
    });
    return list;
  }

  public addItem(goal: 'station' | 'carriage'): void {
    if (goal === 'station') this.stations.push(this.FB.control(''));
    if (goal === 'carriage') this.carriages.push(this.FB.control(''));
  }

  public changeStation(index: number): void {
    if (index === this.stations.length - 1) {
      this.addItem('station');
    } else {
      while (this.stations.length > index + 2) {
        this.stations.removeAt(-1);
      }
    }
  }

  private reset() {
    while (this.carriages.length > 1) {
      this.carriages.removeAt(1);
    }
    while (this.stations.length > 1) {
      this.stations.removeAt(1);
    }
    this.createForm.reset();
  }

  public onSubmit() {
    if (
      this.createForm.value.carriages!.every((carriage) => {
        return typeof carriage === 'string';
      })
    ) {
      const pathes: number[] = [];
      this.createForm.value
        .stations!.filter((item) => {
          return item !== '';
        })
        .forEach((path) => {
          if (typeof path === 'string') pathes.push(+path);
        });
      this.store.dispatch(
        createRoute({
          path: pathes,
          carriages: this.createForm.value.carriages!.filter((item) => {
            return item !== '';
          }),
        }),
      );
    }

    this.reset();

    this.openSnackBarError('New route was create');

    this.store.dispatch(loadDataForRoutesView());

    this.changeOpen.emit(false);
  }

  private openSnackBarError(message: string) {
    this.snackBar.open(`${message}`, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000,
    });
  }

  ngOnDestroy() {
    this.subscribeStations$.unsubscribe();
    this.subscribeCarriages$.unsubscribe();
  }
}
