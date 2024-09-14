import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { PasswordMatchValidator } from '../../shared/validators/password-match.js';
import { EmailFormatValidator } from '../../shared/validators/email-format.js';
import { selectReasonError } from '../../core/store/user/user.selectors.js';
import { clearError, signUp } from '../../core/store/user/user.actions';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss',
})
export class SignupPageComponent implements OnInit {
  public registryForm: FormGroup = new FormGroup({});

  public reason$: Observable<string>;

  public firstContact: boolean = false;

  protected errorMessage$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(
    private readonly FB: FormBuilder,
    private store: Store,
    private readonly router: Router,
  ) {
    this.reason$ = this.store.select(selectReasonError);
  }

  ngOnInit(): void {
    this.registryForm = this.FB.nonNullable.group(
      {
        email: new FormControl('', [Validators.required, EmailFormatValidator()]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        repeatPassword: new FormControl('', [Validators.required]),
      },
      { validators: PasswordMatchValidator.bind(this) },
    );
  }

  public get email(): AbstractControl<string> {
    return this.registryForm.get('email')!;
  }

  public get password(): AbstractControl<string> {
    return this.registryForm.get('password')!;
  }

  public get repeatPassword(): AbstractControl<string> {
    return this.registryForm.get('repeatPassword')!;
  }

  protected updateErrorMessage(str: string) {
    switch (str) {
      case 'email': {
        if (this.registryForm.controls['email'].hasError('required')) {
          this.errorMessage$.next('Required');
        }
        if (this.registryForm.controls['email'].errors?.['EmailError']) {
          this.errorMessage$.next('Incorrect email');
        }
        break;
      }
      case 'password': {
        if (this.registryForm.controls['password'].hasError('required')) {
          this.errorMessage$.next('Required');
        }
        if (!this.registryForm.controls['password'].value.trim().length) {
          this.errorMessage$.next('Password must be at least 8 characters long');
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  public checkPassword(password: AbstractControl) {
    return PasswordMatchValidator(password);
  }

  public onSubmit(): void {
    this.store.dispatch(
      signUp({
        email: this.registryForm.value.email,
        password: this.registryForm.value.password,
      }),
    );
    this.firstContact = true;
  }

  public onClearError() {
    this.store.dispatch(clearError());
  }

  public goSignIn(): void {
    this.router.navigate(['/signin']);
  }
}
