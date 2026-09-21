import {
  Component,
  OnInit
} from '@angular/core';

import {
  Order
} from '../models/order.model';

import {
  OrderService
} from '../services/order.service';

import {
  AuthService
} from '../services/auth.service';

import {
  Router
} from '@angular/router';

import {
  CmsContentService
} from '../services/cms-content/cms-content.service';

import {
  ORDERS_FALLBACK
} from '../constants/orders.constant';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent
  implements OnInit {

  orders: Order[] = [];

  // ==========================================
  // CMS CONTENT
  // ==========================================

  ordersContent: any = null;

  finalContent: any = null;


  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private cmsContentService: CmsContentService
  ) {}


  ngOnInit(): void {

    // ==========================================
    // CHECK LOGIN
    // ==========================================

    if (!this.authService.isLoggedIn()) {

      console.log(
        'User is not logged in. Redirecting to Login...'
      );

      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl: '/orders'
          }
        }
      );

      return;
    }


    // ==========================================
    // LOAD ORDERS
    // ==========================================

    this.orderService.orders$
      .subscribe(orders => {

        this.orders = orders;

        console.log(
          'Orders:',
          this.orders
        );

      });


    // ==========================================
    // LOAD CMS CONTENT
    // ==========================================

    this.loadOrdersContent();

  }


  // ==========================================
  // LOAD ORDERS CMS CONTENT
  // ==========================================

  private loadOrdersContent(): void {

    this.cmsContentService
      .getOrdersContent()
      .subscribe({

        next: (content) => {

          // ======================================
          // STORE CMS CONTENT
          // ======================================

          this.ordersContent = content;


          // ======================================
          // CMS FIRST + FALLBACK SECOND
          // ======================================

          this.finalContent =
            this.revampFallback();


          console.log(
            'Orders CMS Content:',
            this.ordersContent
          );

          console.log(
            'Orders Final Content:',
            this.finalContent
          );

        },


        error: (error) => {

          console.error(
            'Orders CMS content failed:',
            error
          );

          this.ordersContent = null;

          this.finalContent =
            this.cloneFallback();

        }

      });

  }


  // ==========================================
  // REVAMP FALLBACK
  // ==========================================

  private revampFallback(): any {

    // ==========================================
    // GET CMS SCREEN CONTENT
    // ==========================================

    const screenContent =
      this.ordersContent
        ?.['content']
        ?.[0]
        ?.['screenContent'];


    // ==========================================
    // NO CMS CONTENT
    // ==========================================

    if (!Array.isArray(screenContent)) {

      return this.cloneFallback();

    }


    // ==========================================
    // CONVERT CMS ARRAY INTO KEY OBJECT
    // ==========================================

    const cmsData: any = {};


    screenContent.forEach(
      (section: any) => {

        const key =
          section?.['key'];

        if (
          key === undefined ||
          key === null ||
          key === ''
        ) {

          return;

        }


        const sectionData = {
          ...section
        };

        delete sectionData.key;


        cmsData[key] =
          sectionData;

      }
    );


    // ==========================================
    // MERGE CMS WITH FALLBACK
    // CMS HAS FIRST PRIORITY
    // ==========================================

    return this.mergeFallback(
      cmsData,
      ORDERS_FALLBACK
    );

  }


  // ==========================================
  // RECURSIVE FALLBACK MERGE
  // ==========================================

  private mergeFallback(
    cmsData: any,
    fallbackData: any
  ): any {

    // ==========================================
    // CMS VALUE MISSING
    // ==========================================

    if (
      cmsData === null ||
      cmsData === undefined
    ) {

      return this.cloneFallbackValue(
        fallbackData
      );

    }


    // ==========================================
    // PRIMITIVE VALUE
    // ==========================================

    if (
      typeof cmsData !== 'object'
    ) {

      if (
        cmsData === ''
      ) {

        return fallbackData;

      }

      return cmsData;

    }


    // ==========================================
    // CMS ARRAY
    // ==========================================

    if (
      Array.isArray(cmsData)
    ) {

      if (
        cmsData.length === 0
      ) {

        return this.cloneFallbackValue(
          fallbackData
        );

      }

      if (
        !Array.isArray(fallbackData)
      ) {

        return cmsData;

      }

      return cmsData.map(
        (
          cmsItem: any,
          index: number
        ) =>
          this.mergeFallback(
            cmsItem,
            fallbackData[index]
          )
      );

    }


    // ==========================================
    // CMS OBJECT
    // ==========================================

    const result: any = {};

    const fallbackObject =
      (
        fallbackData !== null &&
        typeof fallbackData === 'object' &&
        !Array.isArray(fallbackData)
      )
        ? fallbackData
        : {};


    // ==========================================
    // ITERATE FALLBACK KEYS
    // ==========================================

    Object.keys(fallbackObject).forEach(
      (key: string) => {

        const cmsValue =
          cmsData[key];

        const fallbackValue =
          fallbackObject[key];


        // ======================================
        // CMS KEY MISSING
        // ======================================

        if (
          cmsValue === undefined ||
          cmsValue === null ||
          cmsValue === ''
        ) {

          result[key] =
            this.cloneFallbackValue(
              fallbackValue
            );

          return;

        }


        // ======================================
        // NESTED OBJECT
        // ======================================

        if (
          cmsValue &&
          typeof cmsValue === 'object' &&
          !Array.isArray(cmsValue)
        ) {

          result[key] =
            this.mergeFallback(
              cmsValue,
              fallbackValue
            );

          return;

        }


        // ======================================
        // ARRAY
        // ======================================

        if (
          Array.isArray(cmsValue)
        ) {

          result[key] =
            this.mergeFallback(
              cmsValue,
              fallbackValue
            );

          return;

        }


        // ======================================
        // VALID CMS VALUE
        // ======================================

        result[key] =
          cmsValue;

      }
    );


    // ==========================================
    // KEEP CMS-ONLY KEYS
    // ==========================================

    Object.keys(cmsData).forEach(
      (key: string) => {

        if (
          result[key] === undefined
        ) {

          result[key] =
            this.cloneFallbackValue(
              cmsData[key]
            );

        }

      }
    );


    return result;

  }


  // ==========================================
  // CLONE FALLBACK VALUE
  // ==========================================

  private cloneFallbackValue(
    value: any
  ): any {

    if (
      Array.isArray(value)
    ) {

      return value.map(
        (item: any) =>
          this.cloneFallbackValue(item)
      );

    }


    if (
      value !== null &&
      typeof value === 'object'
    ) {

      const result: any = {};

      Object.keys(value).forEach(
        (key: string) => {

          result[key] =
            this.cloneFallbackValue(
              value[key]
            );

        }
      );

      return result;

    }


    return value;

  }


  // ==========================================
  // CLONE ORDERS FALLBACK
  // ==========================================

  private cloneFallback(): any {

    return this.cloneFallbackValue(
      ORDERS_FALLBACK
    );

  }


  // ==========================================
  // VIEW ORDER DETAILS
  // ==========================================

  viewOrder(
    orderId: string
  ): void {

    this.router.navigate(
      ['/orders', orderId]
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
