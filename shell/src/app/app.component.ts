import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  CartStateService
} from './services/cart-state.service';

import {
  CmsContentService
} from './services/cms-content/cms-content.service';

import {
  SHELL_FALLBACK
} from './constants/shell.constant';

import {
  OrderService
} from './services/order.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  searchText = '';

  cartCount = 0;

  orderCount = 0;

  cmsContent: any = null;

  finalContent: any = null;


  constructor(
    private router: Router,

    private cartStateService: CartStateService,

    private cmsContentService: CmsContentService,

    private orderService: OrderService
  ) {

    // ================================
    // CART COUNT
    // ================================

    this.cartStateService.cart$
      .subscribe(cart => {

        this.cartCount =
          cart.reduce(
            (total, item) =>
              total + item.quantity,
            0
          );

        console.log(
          'Navbar Cart Count:',
          this.cartCount
        );

      });


    // ================================
    // ORDER COUNT
    // ================================

    this.orderService.orders$
      .subscribe(orders => {

        this.orderCount =
          orders.length;

        console.log(
          'Navbar Order Count:',
          this.orderCount
        );

      });

  }


  ngOnInit(): void {

    this.loadCmsContent();

  }


  // ================================
  // LOAD CMS CONTENT
  // ================================

  private loadCmsContent(): void {

    this.cmsContentService
      .getShellContent()
      .subscribe(response => {

        this.cmsContent = response;

        console.log(
          'Shell CMS Response:',
          this.cmsContent
        );


        this.finalContent =
          this.revampFallback();


        console.log(
          'Shell Final Content:',
          this.finalContent
        );

      });

  }


  // ================================
  // REVAMP FALLBACK
  // ================================

  revampFallback(): any {

    // ==================================
    // CMS RESPONSE NOT AVAILABLE
    // ==================================

    if (
      this.cmsContent === null ||
      this.cmsContent === undefined
    ) {

      return this.cloneFallback(
        SHELL_FALLBACK
      );

    }


    // ==================================
    // EXTRACT SCREEN CONTENT
    // ==================================

    const screenContent =
      this.cmsContent
        ?.content?.[0]
        ?.screenContent;


    // ==================================
    // SCREEN CONTENT NOT AVAILABLE
    // ==================================

    if (
      !Array.isArray(screenContent) ||
      screenContent.length === 0
    ) {

      return this.cloneFallback(
        SHELL_FALLBACK
      );

    }


    // ==================================
    // CONVERT KEY-BASED CMS
    // INTO OBJECT
    // ==================================

    const cmsData: any = {};


    screenContent.forEach(
      (section: any) => {

        if (
          section &&
          section.key
        ) {

          const {
            key,
            ...sectionData
          } = section;


          cmsData[key] =
            sectionData;

        }

      }
    );


    // ==================================
    // MERGE CMS + FALLBACK
    // ==================================

    return this.mergeFallback(
      cmsData,
      SHELL_FALLBACK
    );

  }


  // ================================
  // RECURSIVE FALLBACK MERGE
  // ================================

  private mergeFallback(
    cmsData: any,
    fallbackData: any
  ): any {

    // ==================================
    // CMS COMPLETELY UNAVAILABLE
    // ==================================

    if (
      cmsData === null ||
      cmsData === undefined
    ) {

      return this.cloneFallback(
        fallbackData
      );

    }


    // ==================================
    // PRIMITIVE VALUE
    // ==================================

    if (
      typeof fallbackData !== 'object' ||
      fallbackData === null
    ) {

      if (
        cmsData === undefined ||
        cmsData === null ||
        cmsData === ''
      ) {

        return fallbackData;

      }

      return cmsData;

    }


    // ==================================
    // ARRAY
    // ==================================

    if (Array.isArray(fallbackData)) {

      if (
        !Array.isArray(cmsData) ||
        cmsData.length === 0
      ) {

        return [
          ...fallbackData
        ];

      }

      return [
        ...cmsData
      ];

    }


    // ==================================
    // OBJECT
    // ==================================

    const result: any = {};


    Object.keys(fallbackData)
      .forEach(key => {

        const cmsValue =
          cmsData?.[key];

        const fallbackValue =
          fallbackData[key];


        // ==================================
        // MISSING / NULL / EMPTY CMS VALUE
        // ==================================

        if (
          cmsValue === undefined ||
          cmsValue === null ||
          cmsValue === ''
        ) {

          result[key] =
            this.cloneFallback(
              fallbackValue
            );

          return;

        }


        // ==================================
        // NESTED OBJECT
        // ==================================

        if (
          typeof fallbackValue === 'object' &&
          fallbackValue !== null &&
          !Array.isArray(fallbackValue)
        ) {

          result[key] =
            this.mergeFallback(
              cmsValue,
              fallbackValue
            );

          return;

        }


        // ==================================
        // CMS VALUE AVAILABLE
        // ==================================

        result[key] =
          cmsValue;

      });


    return result;

  }


  // ================================
  // CLONE FALLBACK
  // ================================

  private cloneFallback(
    data: any
  ): any {

    if (
      data === null ||
      data === undefined
    ) {

      return data;

    }


    if (
      typeof data !== 'object'
    ) {

      return data;

    }


    return JSON.parse(
      JSON.stringify(data)
    );

  }


  // ================================
  // PRODUCT SEARCH
  // ================================

  searchProducts(): void {

    const search =
      this.searchText.trim();


    if (!search) {

      this.router.navigate(
        ['/productsNew']
      );

      return;

    }


    this.router.navigate(
      ['/productsNew'],
      {
        queryParams: {
          search: search
        }
      }
    );

  }

}