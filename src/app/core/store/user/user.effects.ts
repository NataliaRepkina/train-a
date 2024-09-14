import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, Observable, of, switchMap, take, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from '../../../features/user/services/user.service';
import * as userActions from './user.actions';
import { CurrentUser, UserError } from '../../models/user.model';
import { selectUser } from './user.selectors';

@Injectable()
export class UserEffects {
  private user$: Observable<CurrentUser>;

  constructor(
    private readonly store: Store,
    private actions$: Actions,
    private userService: UserService,
    private readonly router: Router,
  ) {
    this.user$ = this.store.select(selectUser);
  }

  createUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userActions.signUp),
      exhaustMap(() => {
        return this.user$.pipe(
          take(1),
          switchMap(({ email, password }) => {
            return this.userService.signUp(email, password).pipe(
              tap(() => {
                localStorage.clear();
              }),
              mergeMap(() => {
                this.router.navigate(['/signin']);
                return of(userActions.successfulUpdate(), userActions.clearError());
              }),
              catchError(({ error }) => {
                return of(userActions.getError({ error }));
              }),
            );
          }),
        );
      }),
    );
  });

  signInUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userActions.signIn),
      exhaustMap(() => {
        return this.user$.pipe(
          take(1),
          switchMap((user) => {
            return this.userService.signIn(user.email, user.password).pipe(
              tap(({ token }) => {
                localStorage.clear();
                localStorage.setItem('token', token);
              }),
              switchMap(() => {
                this.router.navigate(['/']);
                return of(userActions.getUser(), userActions.clearError());
              }),
              catchError((error: UserError) => {
                return of(userActions.getError({ error }));
              }),
            );
          }),
        );
      }),
    );
  });

  updateName$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userActions.updateUserName),
      exhaustMap(() => {
        return this.user$.pipe(
          take(1),
          switchMap(({ email, name }) => {
            return this.userService.updateCurrentUserName(email, name).pipe(
              switchMap(() => {
                return of(userActions.successfulUpdate());
              }),
              catchError((error: UserError) => {
                return of(userActions.getError({ error }));
              }),
            );
          }),
        );
      }),
    );
  });

  updatePassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userActions.updateUserPassword),
      exhaustMap(() => {
        return this.user$.pipe(
          take(1),
          switchMap(({ password }) => {
            return this.userService.updateCurrentUserPassword(password).pipe(
              map(() => {
                return userActions.successfulUpdate();
              }),
              catchError((error: UserError) => {
                return of(userActions.getError({ error }));
              }),
            );
          }),
        );
      }),
    );
  });

  getUserData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userActions.getUser),
      exhaustMap(() => {
        return this.userService.getCurrentUser().pipe(
          take(1),
          switchMap((user) => {
            const token = localStorage.getItem('token');
            localStorage.setItem('role', user.role);
            return of(
              userActions.saveUser({
                name: user.name ?? '',
                email: user.email,
                role: user.role,
              }),
              userActions.getToken({ token: token || '' }),
            );
          }),
          catchError((error: UserError) => {
            return of(userActions.getError({ error }));
          }),
        );
      }),
    );
  });

  signOut$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userActions.signOut),
      exhaustMap(() => {
        return this.userService.signOutCurrentUser().pipe(
          take(1),
          map(() => {
            localStorage.clear();
            this.router.navigate(['/']);
            return userActions.successfulExit();
          }),
          catchError((error: UserError) => {
            return of(userActions.getError({ error }));
          }),
        );
      }),
    );
  });
}
