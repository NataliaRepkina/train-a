import { Component, OnInit, output } from '@angular/core';
import { map, Observable, Subject, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators } from '@angular/forms';
import { Station } from '../../models/station.model';
import { SearchResponseDTO } from '../../models/searchResponseDTO.model';
import {
  loadSearch,
  loadStations,
  setSearchDate,
} from '../../../../core/store/trips/trips.actions';
import { selectStations } from '../../../../core/store/trips/trips.selectors';

@Component({
  selector: 'app-trips-search',
  templateUrl: './trips-search.component.html',
  styleUrl: './trips-search.component.scss',
})
export class TripsSearchComponent implements OnInit {
  public onSearchResponse = output<Subject<SearchResponseDTO>>();

  public stations$ = this.store.select(selectStations);

  public stations!: Station[];

  public filteredFromStations$!: Observable<Station[]>;

  public filteredToStations$!: Observable<Station[]>;

  public minDate = new Date();

  public searchForm = this.formBuilder.group({
    startCity: ['', Validators.required],
    endCity: ['', Validators.required],
    date: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.stations$.subscribe((stations) => {
      this.stations = stations;
    });

    this.store.dispatch(loadStations());

    this.filteredFromStations$ = this.searchForm.controls.startCity.valueChanges.pipe(
      switchMap((value) => {
        return this.autocompleteFilter(value || '');
      }),
    );

    this.filteredToStations$ = this.searchForm.controls.endCity.valueChanges.pipe(
      switchMap((value) => {
        return this.autocompleteFilter(value || '');
      }),
    );
  }

  public onSubmit() {
    const { startCity, endCity, date } = this.searchForm.controls;

    const fromLatitude = this.stations.find((station) => {
      return station.city === startCity.value;
    })?.latitude;
    const fromLongitude = this.stations.find((station) => {
      return station.city === startCity.value;
    })?.longitude;

    const toLatitude = this.stations.find((station) => {
      return station.city === endCity.value;
    })?.latitude;
    const toLongitude = this.stations.find((station) => {
      return station.city === endCity.value;
    })?.longitude;

    if (date.value) {
      this.store.dispatch(setSearchDate({ date: new Date(date.value) }));
    }

    if (fromLatitude && fromLongitude && toLatitude && toLongitude) {
      this.store.dispatch(loadSearch({ fromLatitude, fromLongitude, toLatitude, toLongitude }));
    } else {
      this.snackBar.open("City doesn't exist", 'Close', {
        duration: 5000,
      });
    }
  }

  private autocompleteFilter(value: string): Observable<Station[]> {
    const filterValue = value.toLowerCase();
    return this.stations$.pipe(
      map((stations) => {
        return stations.filter(({ city }) => {
          return city.toLocaleLowerCase().includes(filterValue);
        });
      }),
    );
  }
}
