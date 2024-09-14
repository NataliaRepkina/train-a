import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from '../../models/user.model';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectAccess = createSelector(selectUserState, (state) => {
  return state.currentAccess;
});

export const selectToken = createSelector(selectUserState, (state) => {
  return state.token;
});

export const selectUser = createSelector(selectUserState, (state) => {
  return { ...state.currentUser };
});

export const selectError = createSelector(selectUserState, (state) => {
  return { ...state.hasError };
});

export const selectReasonError = createSelector(selectError, (hasError) => {
  return hasError.reason;
});
