import { map, take } from 'rxjs';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAccess } from '../store/user/user.selectors';

export const adminUserGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAccess).pipe(
    take(1),
    map((currentAccess) => {
      if (currentAccess === 'manager' || currentAccess === 'user') {
        return true;
      }
      router.navigate(['/signin']);
      return false;
    }),
  );
};