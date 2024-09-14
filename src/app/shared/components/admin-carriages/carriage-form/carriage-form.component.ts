import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Carriage } from '../../../../features/trips/models/carriage.model';
import { createCarriage, updateCarriage } from '../../../../core/store/trips/trips.actions';

@Component({
  selector: 'app-carriage-form',
  templateUrl: './carriage-form.component.html',
  styleUrl: './carriage-form.component.scss',
})
export class CarriageFormComponent implements OnInit, OnDestroy {
  @Input() carriage?: Carriage | null;

  @Input({ required: true }) countCarriages!: number;

  @Output() formSubmitted = new EventEmitter<void>();

  @Output() formClosed = new EventEmitter<void>();

  protected carriageForm!: FormGroup;

  protected prototypeCarriage!: Carriage;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.carriageForm = this.fb.group({
      rowCount: [
        this.carriage?.rows || '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(22),
          Validators.pattern('^[1-9][0-9]*$'),
        ],
      ],
      leftSeats: [
        this.carriage?.leftSeats || '',

        [
          Validators.required,
          Validators.min(1),
          Validators.max(10),
          Validators.pattern('^[1-9][0-9]*$'),
        ],
      ],
      rightSeats: [
        this.carriage?.rightSeats || '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(10),
          Validators.pattern('^[1-9][0-9]*$'),
        ],
      ],
    });

    this.prototypeCarriage = {
      code: this.carriage?.code || '',
      name: this.carriage?.name || this.generateName(),
      rows: this.carriage?.rows || 0,
      leftSeats: this.carriage?.leftSeats || 0,
      rightSeats: this.carriage?.rightSeats || 0,
    };

    this.carriageForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((formValues) => {
      if (formValues.rowCount && formValues.leftSeats && formValues.rightSeats) {
        this.prototypeCarriage = {
          ...this.prototypeCarriage,
          rows: formValues.rowCount,
          leftSeats: formValues.leftSeats,
          rightSeats: formValues.rightSeats,
        };
      }
    });
  }

  onSubmit(): void {
    if (this.carriageForm.valid) {
      if (this.carriage) {
        this.store.dispatch(updateCarriage(this.prototypeCarriage));
      } else {
        this.store.dispatch(
          createCarriage({
            name: this.prototypeCarriage.name,
            rows: this.prototypeCarriage.rows,
            leftSeats: this.prototypeCarriage.leftSeats,
            rightSeats: this.prototypeCarriage.rightSeats,
          }),
        );
      }
    }
    this.formSubmitted.emit();
    this.resetForm();
  }

  closeForm() {
    this.formClosed.emit();
    this.resetForm();
  }

  resetForm() {
    this.carriageForm.reset();
    this.carriageForm.markAsPristine();
    this.carriageForm.markAsUntouched();
    this.carriageForm.updateValueAndValidity();
  }

  generateName(): string {
    return `carriage${this.countCarriages + 1}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
