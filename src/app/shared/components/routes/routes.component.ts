import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Station } from '../../../features/trips/models/station.model';
import { Carriage } from '../../../features/trips/models/carriage.model';
import { CityInfo, Route } from '../../../features/trips/models/route.model';
import {
  selectCarriages,
  selectLoading,
  selectRoutes,
  selectStations,
} from '../../../core/store/trips/trips.selectors';
import { deleteRoute, loadDataForRoutesView } from '../../../core/store/trips/trips.actions';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.scss',
})
export class RoutesComponent implements OnInit, OnDestroy {
  @ViewChild('formElement') formElement!: ElementRef;

  public routes$: Observable<Route[]>;

  public stations$: Observable<Station[]>;

  public carriages$: Observable<Carriage[]>;

  public readonly isLoading$: Observable<boolean>;

  public createMode: boolean = false;

  public updateMode: boolean = false;

  public showMode: boolean = false;

  public citiesList: CityInfo[] = [];

  public currentRoute!: Route;

  public NumberPage: number;

  public isOpen: boolean = false;

  public isReverse: boolean = false;

  private readonly destroyRef: DestroyRef;

  public deleteId: number = 0;

  public dialogOpen: boolean = false;

  private snackBar = inject(MatSnackBar);

  private horizontalPosition: MatSnackBarHorizontalPosition = 'start';

  private verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  private subscribe$!: Subscription;

  protected listStations!: Station[];

  constructor(
    private readonly store: Store,
    private router: Router,
  ) {
    this.isLoading$ = this.store.select(selectLoading);
    this.routes$ = this.store.select(selectRoutes);
    this.stations$ = this.store.select(selectStations);
    this.carriages$ = this.store.select(selectCarriages);
    this.destroyRef = inject(DestroyRef);
    this.NumberPage = 1;
  }

  ngOnInit() {
    this.store.dispatch(loadDataForRoutesView());
    this.subscribe$ = this.stations$.subscribe((stations) => {
      this.listStations = stations;
    });
  }

  public getCities(indexes: number[]): string[] {
    const list: string[] = new Array(indexes.length).fill('');
    indexes.forEach((idx: number) => {
      if (idx === 0) {
        list.push('City0(This station has no contacts)');
      }
      const findIndex = this.listStations.find((station) => {
        return +idx === +station.id;
      });
      if (findIndex) {
        list.push(findIndex.city);
      }
    });
    return list.filter((item) => {
      return item !== '';
    });
  }

  protected updateRoute(route: Route): void {
    this.currentRoute = { ...route };
    this.updateMode = true;
    this.scrollToForm();
  }

  public showButtonsGoal() {
    this.showMode = true;
  }

  public hideButtonsGoal() {
    this.showMode = false;
  }

  public changePage(goal: 'plus' | 'minus', count: 1 | 10) {
    if (goal === 'plus') {
      if (count === 1) {
        this.NumberPage += 1;
      } else {
        this.NumberPage += 10;
      }
    }
    if (goal === 'minus') {
      if (count === 1) {
        this.NumberPage -= 1;
      } else {
        this.NumberPage -= 10;
      }
    }
  }

  public changeCreateMode(): void {
    this.createMode = !this.createMode;
  }

  protected onDeleteRoute(id: number) {
    this.store.dispatch(deleteRoute({ id }));
    this.dialogOpen = false;
    this.openSnackBarError(`Route ${id} deleted`);
  }

  private openSnackBarError(message: string) {
    this.snackBar.open(`${message}`, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000,
    });
  }

  openDialog(id: number): void {
    this.deleteId = id;
    this.dialogOpen = true;
  }

  private scrollToForm() {
    this.formElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.subscribe$.unsubscribe();
  }
}
