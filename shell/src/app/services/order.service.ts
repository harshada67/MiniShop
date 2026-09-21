import { Injectable } from '@angular/core';
import {
  BehaviorSubject
} from 'rxjs';

import {
  Order
} from '../models/order.model';

import {
  AuthService
} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // ==========================================
  // LOCAL STORAGE
  // ==========================================

  private readonly storageKeyPrefix =
    'minishop_orders_';


  // ==========================================
  // ORDERS STATE
  // ==========================================

  private ordersSubject =
    new BehaviorSubject<Order[]>([]);

  orders$ =
    this.ordersSubject.asObservable();


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private authService: AuthService
  ) {

    console.log(
      '🔥 OrderService CREATED'
    );


    // ==========================================
    // LOAD CURRENT USER ORDERS
    // ==========================================

    this.ordersSubject.next(
      this.loadOrders()
    );


    // ==========================================
    // USER LOGIN / LOGOUT
    // ==========================================

    window.addEventListener(
      'auth-user-changed',
      this.handleUserChanged
    );

  }


  // ==========================================
  // CURRENT USER STORAGE KEY
  // ==========================================

  private getStorageKey(): string | null {

    const currentUserEmail =
      this.authService.getCurrentUserEmail();


    if (!currentUserEmail) {

      return null;

    }


    return (
      this.storageKeyPrefix +
      currentUserEmail
        .trim()
        .toLowerCase()
    );

  }


  // ==========================================
  // USER CHANGED
  // ==========================================

  private handleUserChanged =
    (): void => {

      console.log(
        '🔄 Current user changed. Reloading orders...'
      );


      const userOrders =
        this.loadOrders();


      this.ordersSubject.next(
        userOrders
      );


      console.log(
        '📦 Orders loaded for current user:',
        userOrders
      );

    };


  // ==========================================
  // GET ORDERS
  // ==========================================

  getOrders(): Order[] {

    return [
      ...this.ordersSubject.value
    ];

  }


  // ==========================================
  // ADD ORDER
  // ==========================================

  addOrder(
    order: Order
  ): void {

    // ========================================
    // LOGIN CHECK
    // ========================================

    if (!this.authService.isLoggedIn()) {

      console.warn(
        'Cannot add order. User is not logged in.'
      );

      return;

    }


    const currentOrders =
      this.ordersSubject.value;


    const updatedOrders = [
      order,
      ...currentOrders
    ];


    // Update BehaviorSubject

    this.ordersSubject.next(
      updatedOrders
    );


    // Save for current user

    this.saveOrders(
      updatedOrders
    );


    console.log(
      '📦 Order added for current user:',
      order
    );

  }


  // ==========================================
  // GET ORDER BY ID
  // ==========================================

  getOrderById(
    orderId: string
  ): Order | undefined {

    return this.ordersSubject.value.find(
      order =>
        order.id === orderId
    );

  }


  // ==========================================
  // ORDER COUNT
  // ==========================================

  getOrderCount(): number {

    return this.ordersSubject.value.length;

  }


  // ==========================================
  // SAVE TO LOCAL STORAGE
  // ==========================================

  private saveOrders(
    orders: Order[]
  ): void {

    const storageKey =
      this.getStorageKey();


    // ========================================
    // NO LOGGED-IN USER
    // ========================================

    if (!storageKey) {

      console.warn(
        'Orders were not saved because no user is logged in.'
      );

      return;

    }


    localStorage.setItem(
      storageKey,
      JSON.stringify(orders)
    );


    console.log(
      '💾 Orders saved:',
      storageKey,
      orders
    );

  }


  // ==========================================
  // LOAD FROM LOCAL STORAGE
  // ==========================================

  private loadOrders(): Order[] {

    const storageKey =
      this.getStorageKey();


    // ========================================
    // NO LOGGED-IN USER
    // ========================================

    if (!storageKey) {

      console.log(
        'No logged-in user. Orders are empty.'
      );

      return [];

    }


    const savedOrders =
      localStorage.getItem(
        storageKey
      );


    console.log(
      '📦 LOCAL STORAGE ORDERS:',
      storageKey,
      savedOrders
    );


    // ========================================
    // NO ORDERS
    // ========================================

    if (!savedOrders) {

      console.log(
        'No orders found for current user.'
      );

      return [];

    }


    try {

      const parsedOrders =
        JSON.parse(savedOrders);


      if (!Array.isArray(parsedOrders)) {

        console.error(
          'Stored orders are not an array'
        );

        return [];

      }


      return parsedOrders;

    } catch (error) {

      console.error(
        'Unable to load orders:',
        error
      );

      return [];

    }

  }

}