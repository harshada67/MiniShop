import {
  Component,
  NgZone,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CartItem } from '../models/cart-item.model';
import { Router } from '@angular/router';
import { CmsContentService } from '../services/cms-content/cms-content.service';
import { CART_FALLBACK } from '../constants/cart.constant';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {

  cartItems: CartItem[] = [];

  // Raw CMS response
  cartContent: any = null;

  // Final CMS + fallback content
  finalContent: any = null;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private cmsContentService: CmsContentService
  ) {}

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    window.addEventListener(
      'cart-updated',
      this.handleCartUpdated
    );

    this.loadCartContent();

    // Ask Shell for current cart
    window.dispatchEvent(
      new CustomEvent('request-cart')
    );
  }

  // ==========================================
  // LOAD CART CMS
  // ==========================================

  private loadCartContent(): void {

    this.cmsContentService
      .getCartContent()
      .subscribe(response => {

        console.log(
          'Cart CMS Response:',
          response
        );

        // Store raw CMS response
        this.cartContent = response;

        // Build final CMS + fallback content
        this.finalContent =
          this.revampFallback();

        console.log(
          'Cart Final Content:',
          this.finalContent
        );

      });
  }

  // ==========================================
  // CMS + FALLBACK
  // ==========================================

  revampFallback(): any {

    /*
     * Expected CMS structure:
     *
     * response
     *   ↓
     * content[]
     *   ↓
     * screenContent[]
     *   ↓
     * key
     */

    const screenContent =
      this.cartContent
        ?.['content']
        ?.[0]
        ?.['screenContent'];

    // ------------------------------------------
    // CMS content missing
    // ------------------------------------------

    if (!Array.isArray(screenContent)) {

      console.log(
        'Cart CMS screenContent missing → Using complete fallback'
      );

      return this.cloneFallback(
        CART_FALLBACK
      );
    }

    // ------------------------------------------
    // Convert key-based CMS content
    // into normal object
    // ------------------------------------------

    const cmsData: any = {};

    screenContent.forEach(
      (section: any) => {

        const key =
          section?.['key'];

        // Ignore invalid key
        if (
          key === undefined ||
          key === null ||
          key === ''
        ) {
          return;
        }

        const sectionData: any = {
          ...section
        };

        // key is only used for identification
        // and should not exist in final content
        delete sectionData.key;

        cmsData[key] =
          sectionData;
      }
    );

    console.log(
      'Cart Key-Based CMS Content:',
      cmsData
    );

    // ------------------------------------------
    // Recursive CMS + fallback merge
    // ------------------------------------------

    return this.mergeFallback(
      cmsData,
      CART_FALLBACK
    );
  }

  // ==========================================
  // RECURSIVE FALLBACK
  // ==========================================

  private mergeFallback(
    cmsData: any,
    fallbackData: any
  ): any {

    // ------------------------------------------
    // CMS completely missing
    // ------------------------------------------

    if (
      cmsData === null ||
      cmsData === undefined
    ) {

      return this.cloneFallback(
        fallbackData
      );
    }

    // ------------------------------------------
    // Primitive value
    // ------------------------------------------

    if (
      typeof fallbackData !== 'object' ||
      fallbackData === null
    ) {

      /*
       * These CMS values are treated as invalid:
       *
       * null
       * undefined
       * empty string
       *
       * Therefore fallback is used.
       */

      if (
        cmsData === null ||
        cmsData === undefined ||
        cmsData === ''
      ) {

        return fallbackData;
      }

      // Valid CMS primitive
      return cmsData;
    }

    // ------------------------------------------
    // Array
    // ------------------------------------------

    if (
      Array.isArray(fallbackData)
    ) {

      /*
       * Cart currently does not have
       * CMS arrays, but keeping this logic
       * makes the fallback utility reusable.
       */

      if (
        !Array.isArray(cmsData) ||
        cmsData.length === 0
      ) {

        return [
          ...fallbackData
        ];
      }

      return cmsData.map(
        (
          cmsItem: any,
          index: number
        ) => {

          const fallbackItem =
            fallbackData[index];

          if (
            fallbackItem === undefined
          ) {

            return cmsItem;
          }

          return this.mergeFallback(
            cmsItem,
            fallbackItem
          );
        }
      );
    }

    // ------------------------------------------
    // Object
    // ------------------------------------------

    const result: any = {};

    /*
     * IMPORTANT:
     *
     * Iterate over FALLBACK keys.
     *
     * This guarantees that if a CMS key
     * is removed, the fallback key still
     * exists in finalContent.
     */

    Object.keys(fallbackData)
      .forEach(key => {

        const cmsValue =
          cmsData?.[key];

        const fallbackValue =
          fallbackData[key];

        // --------------------------------------
        // Missing / null / undefined / empty
        // --------------------------------------

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

        // --------------------------------------
        // Nested object
        // --------------------------------------

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

        // --------------------------------------
        // Array
        // --------------------------------------

        if (
          Array.isArray(fallbackValue)
        ) {

          result[key] =
            this.mergeFallback(
              cmsValue,
              fallbackValue
            );

          return;
        }

        // --------------------------------------
        // Valid CMS value
        // --------------------------------------

        result[key] =
          cmsValue;
      });

    return result;
  }

  // ==========================================
  // CLONE FALLBACK
  // ==========================================

  private cloneFallback(
    value: any
  ): any {

    if (
      Array.isArray(value)
    ) {

      return [
        ...value
      ];
    }

    if (
      value &&
      typeof value === 'object'
    ) {

      return {
        ...value
      };
    }

    return value;
  }

  // ==========================================
  // RECEIVE CART
  // ==========================================

  handleCartUpdated = (
    event: Event
  ): void => {

    const customEvent =
      event as CustomEvent<CartItem[]>;

    const items =
      customEvent.detail;

    if (!items) {
      return;
    }

    this.ngZone.run(() => {

      this.cartItems =
        [...items];

      console.log(
        'Cart updated:',
        this.cartItems
      );

    });
  };

  // ==========================================
  // PLUS
  // ==========================================

  increaseQuantity(
    item: CartItem
  ): void {

    const index =
      this.cartItems.findIndex(
        cartItem =>
          cartItem.product.id ===
          item.product.id
      );

    if (index === -1) {
      return;
    }

    const updatedItems =
      [...this.cartItems];

    updatedItems[index] = {
      ...updatedItems[index],
      quantity:
        updatedItems[index].quantity + 1
    };

    // Update UI immediately
    this.cartItems =
      updatedItems;

    // Send updated cart to Shell
    window.dispatchEvent(
      new CustomEvent<CartItem[]>(
        'cart-local-update',
        {
          detail: updatedItems
        }
      )
    );
  }

  // ==========================================
  // MINUS
  // ==========================================

  decreaseQuantity(
    item: CartItem
  ): void {

    const index =
      this.cartItems.findIndex(
        cartItem =>
          cartItem.product.id ===
          item.product.id
      );

    if (index === -1) {
      return;
    }

    const currentQuantity =
      this.cartItems[index].quantity;

    // Quantity 1 -> remove product
    if (currentQuantity <= 1) {

      this.removeItem(
        item.product.id
      );

      return;
    }

    const updatedItems =
      [...this.cartItems];

    updatedItems[index] = {
      ...updatedItems[index],
      quantity:
        currentQuantity - 1
    };

    // Update UI immediately
    this.cartItems =
      updatedItems;

    // Send updated cart to Shell
    window.dispatchEvent(
      new CustomEvent<CartItem[]>(
        'cart-local-update',
        {
          detail: updatedItems
        }
      )
    );
  }

  // ==========================================
  // REMOVE
  // ==========================================

  removeItem(
    productId: number
  ): void {

    const updatedItems =
      this.cartItems.filter(
        item =>
          item.product.id !==
          productId
      );

    // Update UI immediately
    this.cartItems =
      updatedItems;

    // Send updated cart to Shell
    window.dispatchEvent(
      new CustomEvent<CartItem[]>(
        'cart-local-update',
        {
          detail: updatedItems
        }
      )
    );
  }

  // ==========================================
  // ITEM TOTAL
  // ==========================================

  getItemTotal(
    item: CartItem
  ): number {

    return (
      item.product.price *
      item.quantity
    );
  }

  // ==========================================
  // CART COUNT
  // ==========================================

  getCartCount(): number {

    return this.cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }

  // ==========================================
  // ORDER TOTAL
  // ==========================================

  getTotal(): number {

    return this.cartItems.reduce(
      (total, item) =>
        total +
        (
          item.product.price *
          item.quantity
        ),
      0
    );
  }

  // ==========================================
  // CHECKOUT
  // ==========================================

  goToCheckout(): void {

    this.router.navigate([
      '/checkout'
    ]);
  }

  // ==========================================
  // DESTROY
  // ==========================================

  ngOnDestroy(): void {

    window.removeEventListener(
      'cart-updated',
      this.handleCartUpdated
    );
  }

}