import { Component, DestroyRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectLastSearchReponse,
  selectSearchDate,
} from '../../../../core/store/trips/trips.selectors';
import { getStringDate } from '../../../../shared/utilities/getISOSDate.utility';
import { setSearchDate } from '../../../../core/store/trips/trips.actions';

@Component({
  selector: 'app-trips-filter',
  templateUrl: './trips-filter.component.html',
  styleUrl: './trips-filter.component.scss',
})
export class TripsFilterComponent implements OnInit {
  public searchResponse$ = this.store.select(selectLastSearchReponse);

  public searchDate$ = this.store.select(selectSearchDate);

  public searchDates!: Date[];

  constructor(
    private store: Store,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    const searchSubscribe = this.searchResponse$.subscribe((searchResponse) => {
      this.searchDates = Object.keys(searchResponse)
        .map((date) => {
          return new Date(date);
        })
        .sort((a, b) => {
          return a.getTime() - b.getTime();
        });
    });

    const searchDateSubscribe = this.searchDate$.subscribe((searchDate) => {
      if (!searchDate) {
        this.setSearchDateByIndex(0);
      }
    });

    this.destroyRef.onDestroy(() => {
      searchSubscribe.unsubscribe();
      searchDateSubscribe.unsubscribe();
    });
  }

  public getTabIndexAccordingDate(date: Date): number {
    const index = this.searchDates.findIndex((value) => {
      return getStringDate(value) === getStringDate(date);
    });
    return index;
  }

  public setSearchDateByIndex(index: number) {
    this.store.dispatch(setSearchDate({ date: this.searchDates[index]! }));
  }
}
