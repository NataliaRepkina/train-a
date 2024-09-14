import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '../dialog/dialog.component';
import { Route } from '../../../features/trips/models/route.model';
import { Station } from '../../../features/trips/models/station.model';
import { createRide } from '../../../core/store/trips/trips.actions';
import { ArrivalDateValidator, departureDateValidator } from '../../validators/date-of-ride';

@Component({
  selector: 'app-create-ride-dialog',
  templateUrl: './create-ride-dialog.component.html',
  styleUrl: './create-ride-dialog.component.scss',
})
export class CreateRideDialogComponent {
  protected createRide = this.formBuilder.nonNullable.group({
    segments: this.formBuilder.array([]),
  });

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { route: Route; stations: Station[] },
    private store: Store,
    private formBuilder: FormBuilder,
  ) {
    const carriages = [...new Set(this.data.route.carriages)];
    const segmentsArray = this.createRide.get('segments') as FormArray;

    for (let i = 0; i < this.data.route.path.length - 1; i += 1) {
      const timeGroup = new FormGroup({
        departure: new FormControl('', [
          Validators.required,
          departureDateValidator(i, segmentsArray),
        ]),
        arrival: new FormControl('', [Validators.required, ArrivalDateValidator(i, segmentsArray)]),
      });

      const priceGroup = new FormGroup({});
      carriages.forEach((carriage) => {
        priceGroup.addControl(carriage.toString(), new FormControl('', Validators.required));
      });

      const segmentGroup = new FormGroup({
        time: timeGroup,
        price: priceGroup,
      });

      segmentsArray.push(segmentGroup);
    }
  }

  protected getUniqueCarriages(): string[] {
    return [...new Set(this.data.route.carriages)];
  }

  protected findStationNameById(id: number): string {
    const foundStation = this.data.stations.find((station) => {
      return station.id === id;
    });
    return foundStation ? foundStation.city : 'Station not found';
  }

  protected getFormData(): { time: [string, string]; price: { [key: string]: number } }[] {
    const segmentsArray = this.createRide.get('segments') as FormArray;
    return segmentsArray.controls.map((segment) => {
      const timeGroup = segment.get('time') as FormGroup;
      const priceGroup = segment.get('price') as FormGroup;
      const departureDate = new Date(timeGroup.get('departure')?.value ?? '');
      const arrivalDate = new Date(timeGroup.get('arrival')?.value ?? '');
      return {
        time: [departureDate.toISOString(), arrivalDate.toISOString()],
        price: Object.keys(priceGroup.controls).reduce(
          (acc, key) => {
            acc[key] = priceGroup.controls[key].value * 100;
            return acc;
          },
          {} as { [key: string]: number },
        ),
      };
    });
  }

  protected onCreateRide() {
    const segments = this.getFormData();
    this.store.dispatch(createRide({ routeId: this.data.route.id, segments }));
  }
}
