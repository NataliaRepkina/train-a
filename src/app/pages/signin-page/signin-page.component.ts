import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import * as userActions from '../../core/store/user/user.actions';
import { EmailFormatValidator } from '../../shared/validators/email-format';
import { PasswordTrimValidator } from '../../shared/validators/password-match';
import { selectReasonError } from '../../core/store/user/user.selectors';

@Component({
  selector: 'app-signin-page',
  templateUrl: './signin-page.component.html',
  styleUrl: './signin-page.component.scss',
})
export class SigninPageComponent implements OnInit {
  public loginForm: FormGroup = new FormGroup({});

  public firstContact: boolean = false;

  public error$: Observable<string>;

  protected errorMessage$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(
    private readonly FB: FormBuilder,
    private store: Store,
    private readonly router: Router,
  ) {
    this.error$ = this.store.select(selectReasonError);
  }

  ngOnInit(): void {
    this.loginForm = this.FB.nonNullable.group({
      email: new FormControl('', [Validators.required, EmailFormatValidator()]),
      password: new FormControl('', [Validators.required, PasswordTrimValidator()]),
    });
  }

  public get email(): AbstractControl<string> {
    return this.loginForm.get('email')!;
  }

  public get password(): AbstractControl<string> {
    return this.loginForm.get('password')!;
  }

  protected updateErrorMessage(str: string) {
    switch (str) {
      case 'email': {
        if (this.loginForm.controls['email'].hasError('required')) {
          this.errorMessage$.next('Required');
        }
        if (this.loginForm.controls['email'].errors?.['EmailError']) {
          this.errorMessage$.next('Incorrect email');
        }
        break;
      }
      case 'password': {
        if (this.loginForm.controls['password'].hasError('required')) {
          this.errorMessage$.next('Required');
        }
        if (!this.loginForm.controls['password'].value.trim().length) {
          this.errorMessage$.next('Password must be at least 8 characters long');
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  public onSubmit(): void {
    if (this.loginForm.valid) {
      this.store.dispatch(
        userActions.signIn({
          email: this.loginForm.value.email,
          password: this.loginForm.value.password,
        }),
      );
      this.firstContact = true;
    }
  }

  public goSignUp(): void {
    this.router.navigate(['/signup']);
  }

  public onClearError() {
    this.store.dispatch(userActions.clearError());
  }
}
