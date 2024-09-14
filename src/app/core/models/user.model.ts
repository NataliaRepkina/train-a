import { FormControl } from '@angular/forms';

export interface UserState {
  currentAccess: Access;
  currentUser: CurrentUser;
  token: string;
  hasError: UserError;
}

export type Access = 'guest' | 'user' | 'manager';
export interface CurrentUser {
  email: string;
  name: string;
  password: string;
}

export interface UserError {
  message: string;
  reason: string;
}

export interface AuthBody {
  email: string;
  password: string;
}

export interface User {
  name: string;
  email: string;
  role: Access;
}

export interface Token {
  token: string;
}

export interface SighUpForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  repeatPassword: FormControl<string | null>;
}
