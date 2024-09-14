import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export function timetableValidator(
  idx: number,
  previousSegmentArrival: string,
  nextSegmentDeparture: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const departure = formGroup.get('departure')?.value;
    const arrival = idx > 0 ? formGroup.get('arrival')?.value : null;
    const isoStringDeparture = departure ? new Date(departure.replace(' ', 'T')).toISOString() : '';
    const isoStringArrival = arrival ? new Date(arrival.replace(' ', 'T')).toISOString() : '';

    if (idx === 0) {
      if (isoStringDeparture >= nextSegmentDeparture) {
        return { invalidDeparture: 'Departure time must be before arrival time' };
      }
    } else if (!nextSegmentDeparture) {
      if (isoStringArrival <= previousSegmentArrival) {
        return {
          invalidArrival: 'Arrival time must be before next segment departure time',
        };
      }
    } else {
      if (isoStringArrival <= previousSegmentArrival) {
        return { invalidDeparture: 'Departure time must be after previous segment arrival time' };
      }
      if (isoStringDeparture <= isoStringArrival) {
        return { invalidDeparture: 'Departure time must be before arrival time' };
      }

      if (isoStringDeparture >= nextSegmentDeparture) {
        return { invalidArrival: 'Arrival time must be before next segment departure time' };
      }
    }
    return null;
  };
}
