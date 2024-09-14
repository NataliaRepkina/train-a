import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { deleteRideById } from '../../../core/store/trips/trips.actions';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { routeId: number; rideId: number },
    private store: Store,
  ) {}

  onDelete() {
    this.store.dispatch(deleteRideById({ routeId: this.data.routeId, rideId: this.data.rideId }));
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
