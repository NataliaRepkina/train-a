import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Carriage } from '../../../features/trips/models/carriage.model';
import { selectCarriages } from '../../../core/store/trips/trips.selectors';
import { loadCarriages } from '../../../core/store/trips/trips.actions';

@Component({
  selector: 'app-admin-carriages',
  templateUrl: './admin-carriages.component.html',
  styleUrl: './admin-carriages.component.scss',
})
export class AdminCarriagesComponent implements OnInit, OnDestroy {
  @ViewChild('formElement') formElement!: ElementRef;

  protected carriages$: Observable<Carriage[] | null> = this.store.select(selectCarriages);

  protected updatedCarriage: Carriage | null = null;

  protected isFormOpen: boolean = false;

  protected formType: 'create' | 'update' = 'create';

  protected carriagesCount = 0;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadCarriages());
    this.carriages$.pipe(takeUntil(this.destroy$)).subscribe((carriages) => {
      if (carriages) this.carriagesCount = carriages.length;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSelectedUpdateCarriage(carriage: Carriage) {
    this.isFormOpen = true;
    this.formType = 'update';
    this.updatedCarriage = carriage;
    if (this.isFormOpen) {
      this.scrollToForm();
    }
  }

  toggleOpenForm() {
    if (!this.isFormOpen) {
      this.updatedCarriage = null;
    }
    this.isFormOpen = !this.isFormOpen;
  }

  scrollToForm() {
    this.formElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  trackByCarriage(index: number, carriage: Carriage): string {
    return carriage.code;
  }
}
