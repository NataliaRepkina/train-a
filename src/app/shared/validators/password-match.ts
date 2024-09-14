import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PasswordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value.trim();
  const repeatPassword = control.get('repeatPassword')?.value.trim();
  return password === repeatPassword && password.length && repeatPassword.length
    ? null
    : { MatchError: 'Passwords do not match' };
};

export function PasswordTrimValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value.trim().length ? null : { SpaceError: true };
  };
}
