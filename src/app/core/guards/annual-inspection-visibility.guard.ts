import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { APP_FEATURES } from '../config/feature-flags';

export const annualInspectionVisibilityGuard: CanMatchFn = () => {
  if (APP_FEATURES.annualInspection) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};
