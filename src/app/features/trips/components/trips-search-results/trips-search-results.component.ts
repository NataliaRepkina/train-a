import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { selectLastSearchReponse } from '../../../../core/store/trips/trips.selectors';
import { RideInfo } from '../../../../core/models/trips.model';
import { getStringDate } from '../../../../shared/utilities/getISOSDate.utility';

@Component({
  selector: 'app-trips-search-results',
  templateUrl: './trips-search-results.component.html',
  styleUrl: './trips-search-results.component.scss',
})
export class TripsSearchResultsComponent implements OnInit {
  @Input({ required: true }) searchDate!: Date;

  private searchResponse$ = this.store.select(selectLastSearchReponse);

  public selectedGroup$!: Observable<RideInfo[]>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.selectedGroup$ = this.searchResponse$.pipe(
      map((response) => {
        return response[getStringDate(this.searchDate)] ?? Object.entries(response)[0][1];
      }),
    );
  }
}
