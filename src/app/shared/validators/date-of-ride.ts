import { FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';

export function ArrivalDateValidator(index: number, segments: FormArray): ValidatorFn {
  return (): ValidationErrors | null => {
    const currentSegment = segments.at(index);
    const nextSegment = segments.at(index + 1);
    if (!currentSegment) {
      return null;
    }
    const departure = currentSegment.get('time.departure')?.value;
    const arrival = currentSegment.get('time.arrival')?.value;
    const nextDeparture = nextSegment ? nextSegment.get('time.departure')?.value : null;

    if (arrival <= departure) {
      return { invalidArrival: 'Youre value must be higher then previous' };
    }

    if (nextDeparture && arrival >= nextDeparture) {
      return { invalidArrival: 'Youre value must be lower then next' };
    }

    return null;
  };
}

export function departureDateValidator(index: number, segments: FormArray): ValidatorFn {
  return (): ValidationErrors | null => {
    const currentSegment = segments.at(index);
    const previousSegment = segments.at(index - 1);
    if (!currentSegment) {
      return null;
    }
    const departure = currentSegment.get('time.departure')?.value;
    const arrival = currentSegment.get('time.arrival')?.value;
    const previousArrival = previousSegment ? previousSegment.get('time.arrival')?.value : null;

    if (previousArrival && departure <= previousArrival) {
      return { invalidDeparture: 'Youre value must be higher then previous' };
    }

    if (arrival && departure >= arrival) {
      return { invalidDeparture: 'Youre value must be lower then next' };
    }

    return null;
  };
}
