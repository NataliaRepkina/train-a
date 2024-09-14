import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, catchError, throwError } from 'rxjs';
import { Station } from '../models/station.model';
import { Carriage } from '../models/carriage.model';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import { Ride } from '../models/ride.model';
import { SearchResponseDTO } from '../models/searchResponseDTO.model';
import { Route } from '../models/route.model';
import { SearchResponse } from '../../../core/models/trips.model';

@Injectable({
  providedIn: 'root',
})
export class TripsService {
  public searchResponse$ = new Subject<SearchResponseDTO>();

  constructor(private http: HttpClient) {}

  public getSearchResponse() {
    return this.searchResponse$.asObservable();
  }

  public setSearchResponse(res: SearchResponseDTO) {
    this.searchResponse$.next(res);
  }

  public search(
    fromLatitude: number,
    fromLongitude: number,
    toLatitude: number,
    toLongitude: number,
    time?: number,
  ) {
    const params: {
      fromLatitude: number;
      fromLongitude: number;
      toLatitude: number;
      toLongitude: number;
      time?: number;
    } = { fromLatitude, fromLongitude, toLatitude, toLongitude };
    if (time) {
      params.time = time;
    }
    return this.http.get<SearchResponseDTO>(`/api/search`, { params });
  }

  public searchStation(fromLatitude: number, fromLongitude: number) {
    const params: {
      fromLatitude: number;
      fromLongitude: number;
    } = { fromLatitude, fromLongitude };

    return this.http.get<SearchResponse>(`/api/search`, { params });
  }

  public getStationList() {
    return this.http.get<Station[]>('/api/station');
  }

  public createStation(city: string, latitude: number, longitude: number, relations: number[]) {
    return this.http.post<{ id: number }>('/api/station', {
      city,
      latitude,
      longitude,
      relations,
    });
  }

  public deleteStation(id: number) {
    return this.http.delete(`/api/station/${id}`);
  }

  public getRouteList() {
    return this.http.get<Route[]>('/api/route');
  }

  public createRoute(path: number[], carriages: string[]) {
    return this.http.post<{ id: number }>('/api/route', { path, carriages });
  }

  public updateRoute(id: number, path: number[], carriages: string[]) {
    return this.http.put<{ id: number }>(`/api/route/${id}`, {
      path,
      carriages,
    });
  }

  public deleteRoute(id: number) {
    return this.http.delete<{ id: number }>(`/api/route/${id}`);
  }

  public getCarriageList() {
    return this.http.get<Carriage[]>('/api/carriage');
  }

  public createCarriageType(name: string, rows: number, leftSeats: number, rightSeats: number) {
    return this.http.post<{ code: string }>('/api/carriage', {
      name,
      rows,
      leftSeats,
      rightSeats,
    });
  }

  public updateCarriageType(
    code: string,
    name: string,
    rows: number,
    leftSeats: number,
    rightSeats: number,
  ) {
    return this.http.put<{ code: string }>(`/api/carriage/${code}`, {
      name,
      rows,
      leftSeats,
      rightSeats,
    });
  }

  public getOrderList(all?: boolean) {
    const params: { all?: boolean } = {};
    if (all) {
      params.all = all;
    }
    return this.http.get<Order[]>('/api/order', { params });
  }

  public createOrder(rideId: number, seat: number, stationStart: number, stationEnd: number) {
    return this.http.post<{ id: string }>('/api/order', {
      rideId,
      seat,
      stationStart,
      stationEnd,
    });
  }

  public deleteOrder(orderId: number) {
    return this.http.delete<void>(`/api/order/${orderId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
          return throwError(() => {
            return {
              message: error.error?.message || 'Unknown error',
              reason: error.error?.reason || 'unknownError',
            };
          });
        }
        return throwError(() => {
          return error;
        });
      }),
    );
  }

  public getUsersList() {
    return this.http.get<User[]>('/api/users');
  }

  public getRouteById(id: number) {
    return this.http.get<Route>(`/api/route/${id}`);
  }

  public getRideById(rideId: number) {
    return this.http.get<Ride>(`/api/search/${rideId}`);
  }

  public createRide(
    routeId: number,
    segments: {
      time: [string, string];
      price: { [key: string]: number };
    }[],
  ) {
    return this.http.post<{ id: number }>(`/api/route/${routeId}/ride`, { segments });
  }

  public updateRide(
    routeId: number,
    rideId: number,
    segments: {
      time: [string, string];
      price: { [key: string]: number };
    }[],
  ) {
    return this.http.put(`/api/route/${routeId}/ride/${rideId}`, { segments });
  }

  public deleteRide(routeId: number, rideId: number) {
    return this.http.delete<void>(`/api/route/${routeId}/ride/${rideId}`);
  }
}
