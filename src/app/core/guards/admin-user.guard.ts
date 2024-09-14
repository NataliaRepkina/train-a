import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminUserGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('role');

  if (token) {
    return true;
  }

  router.navigate(['/signin']);
  return false;
};
