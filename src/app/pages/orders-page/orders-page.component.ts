import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { formatDate } from '@angular/common';
import {
  selectCarriages,
  selectLoading,
  selectOrders,
  selectStations,
  selectUsers,
} from '../../core/store/trips/trips.selectors';
import {
  deleteOrder,
  loadDataForOrdersView,
  loadOrders,
  loadUsers,
} from '../../core/store/trips/trips.actions';
import { Order } from '../../features/trips/models/order.model';
import { selectAccess } from '../../core/store/user/user.selectors';
import { Access } from '../../core/models/user.model';
import { Carriage } from '../../features/trips/models/carriage.model';
import { Station } from '../../features/trips/models/station.model';
import { OrderForView } from './order/order.component';
import { User } from '../../features/trips/models/user.model';
import { calculateTotalRidePrice } from '../../shared/utilities/calculateTotalRidePrice.utility';
import { getRideSegments } from '../../shared/utilities/getRideSegments.utility';

interface CarriageData {
  number: number;
  type: string;
  seat: number;
}

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.scss'],
})
export class OrdersPageComponent implements OnInit, OnDestroy {
  private orders$: Observable<Order[] | null> = this.store.select(selectOrders);

  private stations$: Observable<Station[] | null> = this.store.select(selectStations);

  private carriages$: Observable<Carriage[] | null> = this.store.select(selectCarriages);

  private users$: Observable<User[] | null> = this.store.select(selectUsers);

  protected role$!: Observable<Access>;

  protected ordersForView!: OrderForView[];

  protected warningOrderId: number | null = null;

  private destroy$ = new Subject<void>();

  public readonly isLoading$: Observable<boolean> = this.store.select(selectLoading);

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.role$ = this.store.select(selectAccess);

    this.role$
      .pipe(
        switchMap((role) => {
          if (role !== 'guest') {
            this.store.dispatch(loadDataForOrdersView({ role }));
          }
          if (role === 'manager') {
            this.store.dispatch(loadUsers());
          }
          return combineLatest([this.orders$, this.stations$, this.carriages$, this.users$]);
        }),
        map(([orders, stations, carriages, users]) => {
          return this.TransformOrders(orders, stations, carriages, users);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((result) => {
        this.ordersForView = result;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private TransformOrders(
    orders: Order[] | null,
    stations: Station[] | null,
    carriages: Carriage[] | null,
    users: User[] | null,
  ): OrderForView[] {
    if (!orders || !stations || !carriages || !users) {
      return [];
    }

    return orders.map((order) => {
      const carriageData = this.getCarriageData(order, carriages);
      const rideSegments = getRideSegments(
        order.schedule.segments,
        order.path,
        order.stationStart,
        order.stationEnd,
      );
      return {
        id: order.id,
        user: this.getUserName(order.userId, users),
        startStation: this.getStationName(order.stationStart, stations),
        startTime: this.getStartData(order),
        endStation: this.getStationName(order.stationEnd, stations),
        endTime: this.getEndData(order),
        durationTrip: this.calculateDuration(order),
        numberCarriage: carriageData.number,
        typeCarriage: carriageData.type,
        numberSeat: carriageData.seat,
        price: calculateTotalRidePrice(rideSegments, carriageData.type),
        status: order.status,
      };
    });
  }

  private getStationName(number: number, stations: Station[]): string {
    const currentStation = stations.find((station) => {
      return station.id === number;
    });
    return currentStation ? currentStation.city : 'Unknown Station';
  }

  private calculateDuration(order: Order): string {
    const startStationIndex = order.path.indexOf(order.stationStart);
    const startTime = order.schedule.segments[startStationIndex].time[0];
    const startDate = new Date(startTime);

    const endStationIndex = order.path.indexOf(order.stationEnd) - 1;
    const endTime = order.schedule.segments[endStationIndex].time[0];
    const endDate = new Date(endTime);

    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  }

  private getCarriageData(order: Order, carriages: Carriage[] | null): CarriageData {
    let seat = order.seatId;
    let number = 1;
    let type = '';

    if (!carriages) {
      return { number: 0, type: '', seat: 0 };
    }

    order.carriages.forEach((carriage) => {
      const carriageType = carriages.find((item) => {
        return item.code === carriage;
      });
      if (carriageType) {
        type = carriageType.name;
        const countSeats =
          carriageType.rows * carriageType.rightSeats + carriageType.rows * carriageType.leftSeats;

        if (seat > countSeats) {
          number += 1;
          seat -= countSeats;
        }
      }
    });

    return { number, type, seat };
  }

  private getUserName(userId: number, users: User[] | null): string {
    if (users) {
      const user = users.find((item) => {
        return item.id === userId;
      });
      if (user) {
        return user.name !== null ? user.name : `id#${userId.toString(10)}`;
      }
    }
    return '';
  }

  private getStartData(order: Order): string {
    const startStationIndex = order.path.indexOf(order.stationStart);
    const startTime = order.schedule.segments[startStationIndex].time[0];
    return formatDate(new Date(startTime), 'MMMM dd hh:mm', 'en-US');
  }

  private getEndData(order: Order): string {
    const endStationIndex =
      order.path.indexOf(order.stationEnd) >= order.schedule.segments.length
        ? order.path.indexOf(order.stationEnd) - 1
        : order.path.indexOf(order.stationEnd);
    const endTime = order.schedule.segments[endStationIndex].time[0];
    return formatDate(new Date(endTime), 'MMMM dd hh:mm', 'en-US');
  }

  protected trackByOrderId(index: number, order: OrderForView): number {
    return order.id;
  }

  protected onDeleteOrder(orderId: number): void {
    this.warningOrderId = orderId;
  }

  protected closeWarning(): void {
    this.warningOrderId = null;
  }

  protected deleteOrder(orderId: number): void {
    this.warningOrderId = null;
    this.store.dispatch(deleteOrder({ orderId }));
    this.role$
      .pipe(
        take(1),
        switchMap((role) => {
          if (role === 'manager') {
            this.store.dispatch(loadOrders({ all: true }));
          } else if (role === 'user') {
            this.store.dispatch(loadOrders({}));
          }
          return [];
        }),
      )
      .subscribe();
  }
}
