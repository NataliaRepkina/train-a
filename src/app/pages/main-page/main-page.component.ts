import { Component, DestroyRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectSearchResponses } from '../../core/store/trips/trips.selectors';
import { SearchResponse } from '../../core/models/trips.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent implements OnInit {
  public searchResponses$ = this.store.select(selectSearchResponses);

  public searchResponses!: SearchResponse[];

  ngOnInit(): void {
    const searchSubscribe = this.searchResponses$.subscribe((responses) => {
      this.searchResponses = responses;
    });

    this.destroyRef.onDestroy(() => {
      searchSubscribe.unsubscribe();
    });
  }

  constructor(
    private store: Store,
    private destroyRef: DestroyRef,
  ) {}
}
