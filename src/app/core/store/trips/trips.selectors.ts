import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TripsState } from '../../models/trips.model';

const selectTripsState = createFeatureSelector<TripsState>('trips');

export const selectSearchDate = createSelector(selectTripsState, (state: TripsState) => {
  return state.searchDate;
});

export const selectStations = createSelector(selectTripsState, (state: TripsState) => {
  return state.stations;
});

export const selectRoutes = createSelector(selectTripsState, (state: TripsState) => {
  return state.routes;
});

export const selectCarriages = createSelector(selectTripsState, (state: TripsState) => {
  return state.carriages;
});

export const selectOrders = createSelector(selectTripsState, (state: TripsState) => {
  return state.orders;
});

export const selectRides = createSelector(selectTripsState, (state: TripsState) => {
  return state.rides;
});

export const selectUsers = createSelector(selectTripsState, (state: TripsState) => {
  return state.users;
});

export const selectSearchResponses = createSelector(selectTripsState, (state: TripsState) => {
  return state.searchResponses;
});

export const selectLastSearchReponse = createSelector(selectTripsState, (state: TripsState) => {
  return state.searchResponses.at(state.searchResponses.length - 1)!;
});

export const selectLoading = createSelector(selectTripsState, (state: TripsState) => {
  return state.loading;
});
