import { Injectable } from '@angular/core';

import {
  catchError,
  delay,
  endWith,
  exhaustMap,
  forkJoin,
  map,
  mergeMap,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TripsService } from '../../../features/trips/services/trips.service';
import * as tripActions from './trips.actions';

import { Ride } from '../../../features/trips/models/ride.model';
import { RideInfo, SearchResponse } from '../../models/trips.model';
import { Carriage } from '../../../features/trips/models/carriage.model';

@Injectable()
export class TripsEffects {
  loadSearch$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadSearch),
      exhaustMap((action) => {
        return this.tripsService
          .search(
            action.fromLatitude,
            action.fromLongitude,
            action.toLatitude,
            action.toLongitude,
            action.time,
          )
          .pipe(
            map((search) => {
              const searchResponse: SearchResponse = {};
              const { from, routes, to } = search;

              routes.forEach((route) => {
                const fromStationIndex = route.path.indexOf(from.stationId);
                const toStationIndex = route.path.indexOf(to.stationId);

                route.schedule.forEach((schedule) => {
                  const rideSegments = schedule.segments.slice(fromStationIndex, toStationIndex);
                  const groupDate = rideSegments[0].time[0].split('T')[0];

                  const rideInfoList = searchResponse[groupDate];
                  const rideInfo: RideInfo = {
                    from,
                    to,
                    rideId: schedule.rideId,
                    segments: rideSegments,
                  };

                  if (rideInfoList) {
                    rideInfoList.push(rideInfo);
                  } else {
                    searchResponse[groupDate] = [rideInfo];
                  }
                });
              });

              return tripActions.searchLoadedSuccess({ search: searchResponse });
            }),
            catchError((error) => {
              return of(tripActions.failureSnackBar(error));
            }),
          );
      }),
    );
  });

  canDelete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.canDelete),
      exhaustMap((action) => {
        if (action.coordinates.length === 0) {
          return of(tripActions.deleteStation(action.station));
        }
        const searchRequests = action.coordinates.map((coordinate) => {
          const now = Date.now();
          return this.tripsService
            .search(
              coordinate.latitude,
              coordinate.longitude,
              action.station.latitude,
              action.station.longitude,
              now,
            )
            .pipe(
              map((route) => {
                return route.routes.length > 0;
              }),
            );
        });

        return forkJoin(searchRequests).pipe(
          delay(1000),
          switchMap((results) => {
            const canDelete = !results.some((hasRoutes) => {
              return hasRoutes;
            });
            if (canDelete) {
              return of(tripActions.deleteStation(action.station));
            }
            return of(
              tripActions.failureSnackBar({
                error: {
                  message: 'Cannot delete station with active rides',
                  reason: 'Cannot delete station with active rides',
                },
              }),
            );
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
          startWith(tripActions.loadingStarted()),
        );
      }),
    );
  });

  loadStations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadStations),
      exhaustMap(() => {
        return this.tripsService.getStationList().pipe(
          map((stations) => {
            return tripActions.stationsLoadedSuccess({ stations });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
          startWith(tripActions.loadingStarted()),
          endWith(tripActions.loadingFinished()),
        );
      }),
    );
  });

  deleteStation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.deleteStation),
      exhaustMap((action) => {
        return this.tripsService.deleteStation(action.id).pipe(
          map(() => {
            return tripActions.stationDeleteSuccess();
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
          startWith(tripActions.loadingStarted()),
        );
      }),
    );
  });

  loadStationsAfterDelete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.stationDeleteSuccess),
      map(() => {
        return tripActions.loadStations();
      }),
    );
  });

  loadRoutes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadRoutes),
      exhaustMap(() => {
        return this.tripsService.getRouteList().pipe(
          map((routes) => {
            return tripActions.routesLoadedSuccess({ routes });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  createRoute$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.createRoute),
      exhaustMap((action) => {
        return this.tripsService.createRoute(action.path, action.carriages).pipe(
          map((id) => {
            return tripActions.routeCreatedSuccess(id);
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  updateRoute$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.updateRoute),
      exhaustMap((action) => {
        return this.tripsService.updateRoute(action.id, action.path, action.carriages).pipe(
          map((id) => {
            return tripActions.routeUpdatedSuccess(id);
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  deleteRoute$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.deleteRoute),
      exhaustMap((action) => {
        return this.tripsService.deleteRoute(action.id).pipe(
          map(() => {
            return tripActions.routeDeletedSuccess();
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  loadCarriage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadCarriages),
      exhaustMap(() => {
        return this.tripsService.getCarriageList().pipe(
          map((carriages) => {
            return tripActions.carriagesLoadedSuccess({ carriages });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  createCarriage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.createCarriage),
      exhaustMap((action) => {
        return this.tripsService
          .createCarriageType(action.name, action.rows, action.leftSeats, action.rightSeats)
          .pipe(
            map((code) => {
              const createCarriageData: Carriage = {
                code: code.code,
                name: action.name,
                rows: action.rows,
                leftSeats: action.leftSeats,
                rightSeats: action.rightSeats,
              };
              return tripActions.carriagesCreatedSuccess({ createCarriage: createCarriageData });
            }),
            catchError((error) => {
              return of(tripActions.failureSnackBar(error));
            }),
          );
      }),
    );
  });

  updateCarriage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.updateCarriage),
      exhaustMap((action) => {
        return this.tripsService
          .updateCarriageType(
            action.code,
            action.name,
            action.rows,
            action.leftSeats,
            action.rightSeats,
          )
          .pipe(
            map(() => {
              const updatedCarriageData: Carriage = {
                code: action.code,
                name: action.name,
                rows: action.rows,
                leftSeats: action.leftSeats,
                rightSeats: action.rightSeats,
              };
              return tripActions.carriageUpdatedSuccess({ updatedCarriage: updatedCarriageData });
            }),
            catchError((error) => {
              return of(tripActions.failureSnackBar({ error }));
            }),
          );
      }),
    );
  });

  loadOrder$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadOrders),
      exhaustMap((action) => {
        return this.tripsService.getOrderList(action.all).pipe(
          map((orders) => {
            return tripActions.ordersLoadedSuccess({ orders });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  createOrder$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.createOrder),
      exhaustMap((action) => {
        return this.tripsService
          .createOrder(action.rideId, action.seat, action.stationStart, action.stationEnd)
          .pipe(
            map((response) => {
              this.snackBar.open('Order created successfully!', 'Close', {
                duration: 159000,
                panelClass: ['snackbar-success', 'snackbar-custom'],
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              return tripActions.createOrderSuccess(response);
            }),
            catchError((error) => {
              return of(tripActions.failureSnackBar(error));
            }),
          );
      }),
    );
  });

  deleteOrder$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.deleteOrder),
      exhaustMap((action) => {
        return this.tripsService.deleteOrder(action.orderId).pipe(
          map(() => {
            this.snackBar.open('Order deleted successfully!', 'Close', {
              duration: 159000,
              panelClass: ['snackbar-success', 'snackbar-custom'],
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            return tripActions.orderDeletedSuccess({ orderId: action.orderId });
          }),
          catchError((error) => {
            const errorMessage = error.message || 'Failed to delete order';
            return of(
              tripActions.failureSnackBar({
                error: { message: errorMessage, reason: error.reason },
              }),
            );
          }),
        );
      }),
    );
  });

  loadUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadUsers),
      exhaustMap(() => {
        return this.tripsService.getUsersList().pipe(
          map((users) => {
            return tripActions.usersLoadedSuccess({ users });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  loadRouteById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadRouteById),
      exhaustMap((action) => {
        return this.tripsService.getRouteById(action.id).pipe(
          map((route) => {
            return tripActions.routeLoadedByIdSuccess({ route });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar({ error }));
          }),
        );
      }),
    );
  });

  loadRidesForRoutes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.routeLoadedByIdSuccess),
      mergeMap((action) => {
        const schedule = action.route.schedule || [];
        return forkJoin(
          schedule.map((item) => {
            return this.tripsService.getRideById(item.rideId).pipe(
              map((ride) => {
                return { ride };
              }),
              catchError((error) => {
                return of({ error, rideId: item.rideId });
              }),
            );
          }),
        ).pipe(
          map((results) => {
            const successfulRides = results.filter((result): result is { ride: Ride } => {
              return 'ride' in result;
            });
            return tripActions.ridesLoadedByRouteSuccess({
              rides: successfulRides.map((result) => {
                return result.ride;
              }),
            });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar({ error }));
          }),
        );
      }),
    );
  });

  createStation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.createStation),
      exhaustMap((action) => {
        return this.tripsService
          .createStation(action.city, action.latitude, action.longitude, action.relations)
          .pipe(
            map(() => {
              return tripActions.createStationSuccess();
            }),
            catchError((error) => {
              return of(tripActions.failureSnackBar(error));
            }),
            startWith(tripActions.loadingStarted()),
          );
      }),
    );
  });

  loadStationsAfterCreate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.createStationSuccess),
      map(() => {
        return tripActions.loadStations();
      }),
    );
  });

  loadRideById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadRideById),
      mergeMap((action) => {
        return this.tripsService.getRideById(action.rideId).pipe(
          map((ride) => {
            return tripActions.rideLoadedByIdSuccess({ ride });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  createRide$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.createRide),
      exhaustMap((action) => {
        return this.tripsService.createRide(action.routeId, action.segments).pipe(
          map((id) => {
            return tripActions.loadRideById({ rideId: id.id });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  updateRide$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.updateRide),
      exhaustMap((action) => {
        return this.tripsService.updateRide(action.routeId, action.rideId, action.segments).pipe(
          map(() => {
            return tripActions.loadRideById({
              rideId: action.rideId,
            });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  deleteRide$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.deleteRideById),
      exhaustMap((action) => {
        return this.tripsService.deleteRide(action.routeId, action.rideId).pipe(
          map(() => {
            return tripActions.deleteRideByIdSuccess({ rideId: action.rideId });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar(error));
          }),
        );
      }),
    );
  });

  displayErrorSnackBar = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(tripActions.failureSnackBar),
        tap((error) => {
          this.snackBar.open(error.error.message, 'Close', {
            duration: 195000,
            panelClass: ['snackbar-error', 'snackbar-custom'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          tripActions.loadingFinished();
        }),
      );
    },
    { functional: true, dispatch: false },
  );

  loadDataForRoutesView$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        tripActions.loadDataForRoutesView,
        tripActions.routeCreatedSuccess,
        tripActions.routeDeletedSuccess,
        tripActions.routeUpdatedSuccess,
      ),
      switchMap(() => {
        return of(
          tripActions.loadStations(),
          tripActions.loadRoutes(),
          tripActions.loadCarriages(),
        );
      }),
      catchError((error) => {
        return of(tripActions.failureSnackBar({ error }));
      }),
    );
  });

  loadDataForOrdersView$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tripActions.loadDataForOrdersView),
      switchMap((action) => {
        const loadOrdersAction =
          action.role === 'manager'
            ? this.tripsService.getOrderList(true)
            : this.tripsService.getOrderList();

        return forkJoin({
          carriages: this.tripsService.getCarriageList(),
          stations: this.tripsService.getStationList(),
          orders: loadOrdersAction,
        }).pipe(
          map(({ carriages, stations, orders }) => {
            return tripActions.loadDataForOrdersViewSuccess({ carriages, stations, orders });
          }),
          catchError((error) => {
            return of(tripActions.failureSnackBar({ error }));
          }),
          startWith(tripActions.loadingStarted()),
          endWith(tripActions.loadingFinished()),
        );
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private tripsService: TripsService,
    private snackBar: MatSnackBar,
  ) {}
}
