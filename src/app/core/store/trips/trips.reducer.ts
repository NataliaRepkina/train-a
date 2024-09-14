import { createReducer, on } from '@ngrx/store';
import { TripsState } from '../../models/trips.model';
import {
  carriagesCreatedSuccess,
  carriagesLoadedSuccess,
  deleteRideByIdSuccess,
  loadingFinished,
  loadingStarted,
  carriageUpdatedSuccess,
  loadDataForOrdersViewSuccess,
  loadDataForRoutesView,
  orderDeletedSuccess,
  ordersLoadedSuccess,
  rideLoadedByIdSuccess,
  ridesLoadedByRouteSuccess,
  routeLoadedByIdSuccess,
  routesLoadedSuccess,
  searchLoadedSuccess,
  setSearchDate,
  stationsLoadedSuccess,
  updateRideSuccess,
  usersLoadedSuccess,
  failureSnackBar,
} from './trips.actions';

const inititalTripState: TripsState = {
  stations: [],
  routes: [],
  carriages: [],
  orders: [],
  rides: [],
  users: [],
  searchResponses: [],
  loading: false,
};

export const tripsReducer = createReducer(
  inititalTripState,
  on(setSearchDate, (state, { date }): TripsState => {
    return { ...state, searchDate: date };
  }),
  on(searchLoadedSuccess, (state, { search }): TripsState => {
    return { ...state, searchResponses: [...state.searchResponses, search] };
  }),
  on(stationsLoadedSuccess, (state, { stations }): TripsState => {
    return { ...state, stations, loading: false };
  }),
  on(routesLoadedSuccess, (state, { routes }): TripsState => {
    return { ...state, routes };
  }),
  on(carriagesLoadedSuccess, (state, { carriages }): TripsState => {
    return { ...state, carriages };
  }),
  on(ordersLoadedSuccess, (state, { orders }): TripsState => {
    return { ...state, orders };
  }),
  on(usersLoadedSuccess, (state, { users }): TripsState => {
    return { ...state, users };
  }),
  on(routeLoadedByIdSuccess, (state, { route }): TripsState => {
    return { ...state, routes: [...state.routes, route] };
  }),
  on(rideLoadedByIdSuccess, (state, { ride }): TripsState => {
    const updatedRides = state.rides.map((r) => {
      return r.rideId === ride.rideId ? ride : r;
    });
    const rideExists = state.rides.some((r) => {
      return r.rideId === ride.rideId;
    });
    return {
      ...state,
      rides: rideExists ? updatedRides : [...state.rides, ride],
    };
  }),
  on(ridesLoadedByRouteSuccess, (state, { rides }): TripsState => {
    return { ...state, rides };
  }),
  on(updateRideSuccess, (state, { rideId, segments }): TripsState => {
    return {
      ...state,
      rides: state.rides.map((ride) => {
        return ride.rideId === rideId ? { ...ride, segments } : ride;
      }),
    };
  }),
  on(deleteRideByIdSuccess, (state, { rideId }): TripsState => {
    return {
      ...state,
      rides: state.rides.filter((ride) => {
        return ride.rideId !== rideId;
      }),
    };
  }),
  on(rideLoadedByIdSuccess, (state, { ride }): TripsState => {
    return { ...state, rides: [...state.rides, ride] };
  }),
  on(loadingStarted, (state): TripsState => {
    return { ...state, loading: true };
  }),
  on(loadingFinished, (state): TripsState => {
    return { ...state, loading: false };
  }),
  on(failureSnackBar, (state): TripsState => {
    return { ...state, loading: false };
  }),
  on(loadDataForOrdersViewSuccess, (state, { carriages, stations, orders }): TripsState => {
    return {
      ...state,
      carriages,
      stations,
      orders,
    };
  }),
  on(loadDataForRoutesView, (state): TripsState => {
    return { ...state };
  }),
  on(orderDeletedSuccess, (state, { orderId }): TripsState => {
    return {
      ...state,
      orders: state.orders.map((order) => {
        return order.id === orderId ? { ...order, status: 'canceled' } : order;
      }),
    };
  }),

  on(carriageUpdatedSuccess, (state, { updatedCarriage }): TripsState => {
    return {
      ...state,
      carriages: state.carriages.map((carriage) => {
        return carriage.code === updatedCarriage.code ? { ...updatedCarriage } : carriage;
      }),
    };
  }),
  on(carriagesCreatedSuccess, (state, { createCarriage }): TripsState => {
    return {
      ...state,
      carriages: [...state.carriages, createCarriage],
    };
  }),
);
