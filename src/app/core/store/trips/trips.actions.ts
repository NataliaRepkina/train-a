import { createAction, props } from '@ngrx/store';
import { Station } from '../../../features/trips/models/station.model';
import { Carriage } from '../../../features/trips/models/carriage.model';
import { Order } from '../../../features/trips/models/order.model';
import { User } from '../../../features/trips/models/user.model';
import { Ride } from '../../../features/trips/models/ride.model';
import { Route } from '../../../features/trips/models/route.model';
import { SearchResponse } from '../../models/trips.model';

export const setSearchDate = createAction('[Trips] Set Search Date', props<{ date: Date }>());

// Search
export const loadSearch = createAction(
  '[Trips] Load Search',
  props<{
    fromLatitude: number;
    fromLongitude: number;
    toLatitude: number;
    toLongitude: number;
    time?: number;
  }>(),
);
export const searchLoadedSuccess = createAction(
  '[Trips] Search Loaded Success',
  props<{ search: SearchResponse }>(),
);

// Stations
export const loadStations = createAction('[Trips] Load Stations');
export const stationsLoadedSuccess = createAction(
  '[Trips] Stations Loaded Success',
  props<{ stations: Station[] }>(),
);
export const canDelete = createAction(
  '[Trips] Can Delete',
  props<{
    station: Station;
    coordinates: {
      latitude: number;
      longitude: number;
    }[];
  }>(),
);

export const deleteStation = createAction('[Trips] Delete Station', props<{ id: number }>());
export const stationDeleteSuccess = createAction('[Trips] Station Deleted Success');

export const createStation = createAction(
  '[Trips] Create Station',
  props<{ city: string; latitude: number; longitude: number; relations: number[] }>(),
);
export const createStationSuccess = createAction(
  '[Trips] Create Station Success',
  props<{ id: number }>,
);

// Routes
export const loadRoutes = createAction('[Trips] Load Routes');
export const routesLoadedSuccess = createAction(
  '[Trips] Routes Loaded Success',
  props<{ routes: Route[] }>(),
);

export const createRoute = createAction(
  '[Trips] Create Routes',
  props<{ path: number[]; carriages: string[] }>(),
);
export const routeCreatedSuccess = createAction(
  '[Trips] Route Created Success',
  props<{ id: number }>(),
);

export const updateRoute = createAction(
  '[Trips] Update Routes',
  props<{ id: number; path: number[]; carriages: string[] }>(),
);
export const routeUpdatedSuccess = createAction(
  '[Trips] Route Updated Success',
  props<{ id: number }>(),
);

export const deleteRoute = createAction('[Trips] Delete Routes', props<{ id: number }>());
export const routeDeletedSuccess = createAction('[Trips] Route Deleted Success');

export const loadRouteById = createAction('[Trips] Load Route By Id', props<{ id: number }>());
export const routeLoadedByIdSuccess = createAction(
  '[Trips] Route Loaded By Id Success',
  props<{ route: Route }>(),
);

// Carriages
export const loadCarriages = createAction('[Trips] Load Carriages');
export const carriagesLoadedSuccess = createAction(
  '[Trips] Carriages Loaded Success',
  props<{ carriages: Carriage[] }>(),
);

export const createCarriage = createAction(
  '[Trips] Create Carriage',
  props<{ name: string; rows: number; leftSeats: number; rightSeats: number }>(),
);
export const carriagesCreatedSuccess = createAction(
  '[Trips] Carriage Created Success',
  props<{ createCarriage: Carriage }>(),
);

export const updateCarriage = createAction(
  '[Trips] Update Carriages',
  props<{ code: string; name: string; rows: number; leftSeats: number; rightSeats: number }>(),
);
export const carriageUpdatedSuccess = createAction(
  '[Trips] Carriage Updated Success',
  props<{ updatedCarriage: Carriage }>(),
);

// Orders
export const loadOrders = createAction('[Trips] Load Orders', props<{ all?: boolean }>());
export const ordersLoadedSuccess = createAction(
  '[Trips] Orders Loaded Success',
  props<{ orders: Order[] }>(),
);

export const deleteOrder = createAction('[Trips] Delete Order', props<{ orderId: number }>());
export const orderDeletedSuccess = createAction(
  '[Trips] Order Deleted Success',
  props<{ orderId: number }>(),
);

export const createOrder = createAction(
  '[Trips] Create Order',
  props<{
    rideId: number;
    seat: number;
    stationStart: number;
    stationEnd: number;
  }>(),
);
export const createOrderSuccess = createAction(
  '[Trips] Create Order Success',
  props<{ id: string }>(),
);
export const loadDataForOrdersView = createAction(
  '[Trips] Load Data For View Orders',
  props<{ role: 'manager' | 'user' }>(),
);

export const loadDataForRoutesView = createAction('[Trips] Load Data For View Routes');

export const loadDataForOrdersViewSuccess = createAction(
  '[Trips] Load Data For View Orders Success',
  props<{ carriages: Carriage[]; stations: Station[]; orders: Order[]; users?: User[] }>(),
);

// Users
export const loadUsers = createAction('[Trips] Load Users');
export const usersLoadedSuccess = createAction(
  '[Trips] Users Loaded Success',
  props<{ users: User[] }>(),
);

// Rides
export const createRide = createAction(
  '[Trips] Create Ride',
  props<{
    routeId: number;
    segments: {
      time: [string, string];
      price: { [key: string]: number };
    }[];
  }>(),
);
export const createRideSuccess = createAction(
  '[Trips] Create Ride Success',
  props<{ id: number }>(),
);

export const loadRideById = createAction('[Trips] Load Ride By Id', props<{ rideId: number }>());
export const rideLoadedByIdSuccess = createAction(
  '[Trips] Ride Loaded By Id Success',
  props<{ ride: Ride }>(),
);

export const ridesLoadedByRouteSuccess = createAction(
  '[Trips] Rides Loaded By Route Success',
  props<{ rides: Ride[] }>(),
);
export const updateRide = createAction(
  '[Trips] Update Ride',
  props<{
    routeId: number;
    rideId: number;
    segments: {
      time: [string, string];
      price: { [key: string]: number };
    }[];
  }>(),
);
export const updateRideSuccess = createAction(
  '[Trips] Update Ride Success',
  props<{
    rideId: number;
    segments: {
      time: [string, string];
      price: { [key: string]: number };
    }[];
  }>(),
);

export const deleteRideById = createAction(
  '[Trips] Delete Ride',
  props<{ routeId: number; rideId: number }>(),
);
export const deleteRideByIdSuccess = createAction(
  '[Trips] Delete Ride Success',
  props<{ rideId: number }>(),
);

// Fail
export const failureSnackBar = createAction(
  '[Trips] Failure SnackBar',
  props<{ error: { message: string; reason: string } }>(),
);
export const loadingFinished = createAction('[Trips] Load finished');
export const loadingStarted = createAction('[Trips] Load started');
