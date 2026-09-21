import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Order
} from '../models/order.model';

import {
  OrderService
} from '../services/order.service';

import {
  AuthService
} from '../services/auth.service';


@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent
  implements OnInit {

  order: Order | undefined;


  constructor(
    private activatedRoute: ActivatedRoute,

    private orderService: OrderService,

    private authService: AuthService,

    private router: Router
  ) {}


  ngOnInit(): void {

    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!this.authService.isLoggedIn()) {

      console.log(
        'User is not logged in. Redirecting to Login...'
      );


      // Keep the exact order-details URL
      // so after login user comes back here

      const orderId =
        this.activatedRoute.snapshot
          .paramMap
          .get('id');


      if (orderId) {

        this.router.navigate(
          ['/login'],
          {
            queryParams: {
              returnUrl:
                `/orders/${orderId}`
            }
          }
        );

      } else {

        this.router.navigate(
          ['/login'],
          {
            queryParams: {
              returnUrl: '/orders'
            }
          }
        );

      }


      return;
    }


    // ==========================================
    // GET ORDER ID
    // ==========================================

    const orderId =
      this.activatedRoute.snapshot
        .paramMap
        .get('id');


    if (!orderId) {

      console.log(
        'Order ID not found'
      );

      this.router.navigate(
        ['/orders']
      );

      return;
    }


    // ==========================================
    // LOAD ORDER
    // ==========================================

    this.order =
      this.orderService.getOrderById(
        orderId
      );


    console.log(
      'Selected Order:',
      this.order
    );


    // ==========================================
    // ORDER NOT FOUND
    // ==========================================

    if (!this.order) {

      console.log(
        'Order not found'
      );

      this.router.navigate(
        ['/orders']
      );

    }

  }


  // ==========================================
  // BACK TO ORDERS
  // ==========================================

  goToOrders(): void {

    this.router.navigate(
      ['/orders']
    );

  }


  // ==========================================
  // CONTINUE SHOPPING
  // ==========================================

  continueShopping(): void {

    this.router.navigate(
      ['/productsNew']
    );

  }

}