import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function EmailFormatValidator(): ValidatorFn {
  const regexp = /^[\w\d_]+@[\w\d_]+.\w{2,7}$/i;
  return (control: AbstractControl): ValidationErrors | null => {
    return regexp.test(control.value) ? null : { EmailError: 'Incorrect email' };
  };
}
