import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  CartItem,
  CartStateService
} from '../services/cart-state.service';

import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';

import { CmsContentService } from '../services/cms-content/cms-content.service';
import { CHECKOUT_FALLBACK } from '../constants/checkout.constant';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  // ==========================================
  // CART
  // ==========================================

  cartItems: CartItem[] = [];


  // ==========================================
  // ORDER
  // ==========================================

  orderPlaced = false;

  orderId = '';


  // ==========================================
  // CHECKOUT FORM
  // ==========================================

  checkoutForm: FormGroup;

  submitted = false;


  // ==========================================
  // CMS CONTENT
  // ==========================================

  checkoutContent: any = null;

  finalContent: any = null;


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private fb: FormBuilder,
    private cartStateService: CartStateService,
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService,
    private cmsContentService: CmsContentService
  ) {

    // ==========================================
    // CREATE CHECKOUT FORM
    // ==========================================

    this.checkoutForm = this.fb.group({

      // ==========================================
      // DELIVERY DETAILS
      // ==========================================

      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z ]+$/)
        ]
      ],

      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[6-9][0-9]{9}$/)
        ]
      ],

      address: [
        '',
        [
          Validators.required,
          Validators.minLength(10)
        ]
      ],

      city: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z ]+$/)
        ]
      ],

      state: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z ]+$/)
        ]
      ],

      pincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{6}$/)
        ]
      ],


      // ==========================================
      // PAYMENT METHOD
      // ==========================================

      paymentMethod: [
        '',
        Validators.required
      ],


      // ==========================================
      // UPI
      // ==========================================

      upiId: [''],


      // ==========================================
      // CARD
      // ==========================================

      cardHolderName: [''],

      cardNumber: [''],

      expiryDate: [''],

      cvv: ['']

    });

  }


  // ==========================================
  // NG ON INIT
  // ==========================================

 ngOnInit(): void {

  const buyNowItem = sessionStorage.getItem(
    'minishop_buy_now_item'
  );

  if (buyNowItem) {

    try {

      const selectedItem: CartItem =
        JSON.parse(buyNowItem);

      // Checkout only the selected product
      this.cartItems = [selectedItem];

      console.log(
        '🛒 Buy Now Checkout Item:',
        selectedItem
      );

    } catch (error) {

      console.error(
        'Unable to read Buy Now item:',
        error
      );

      // Fallback to normal cart checkout
      this.cartItems =
        this.cartStateService.getCart();
    }

  } else {

    // Normal Checkout All
    this.cartItems =
      this.cartStateService.getCart();

    console.log(
      '🛒 Checkout All Cart:',
      this.cartItems
    );
  }

  this.loadCheckoutContent();
}


  // ==========================================
  // LOAD CHECKOUT CMS CONTENT
  // ==========================================

  private loadCheckoutContent(): void {

    this.cmsContentService
      .getCheckoutContent()
      .subscribe({

        next: (content) => {

          // ======================================
          // STORE CMS CONTENT
          // ======================================

          this.checkoutContent = content;


          // ======================================
          // REVAMP FALLBACK
          // ======================================

          this.finalContent =
            this.revampFallback();


          console.log(
            'Checkout CMS Content:',
            this.checkoutContent
          );

          console.log(
            'Checkout Final Content:',
            this.finalContent
          );


          // ======================================
          // AFTER CMS IS READY
          // ======================================

          this.initializeCheckout();

        },


        error: (error) => {

          console.error(
            'Checkout CMS content failed:',
            error
          );


          // ======================================
          // USE FALLBACK
          // ======================================

          this.checkoutContent = null;

          this.finalContent =
            this.cloneFallback();


          // ======================================
          // INITIALIZE WITH FALLBACK
          // ======================================

          this.initializeCheckout();

        }

      });

  }


  // ==========================================
  // INITIALIZE CHECKOUT
  // ==========================================

  private initializeCheckout(): void {

    // ==========================================
    // RESTORE CHECKOUT DATA
    // ==========================================

    this.restoreCheckoutData();


    // ==========================================
    // APPLY PAYMENT VALIDATORS
    // ==========================================

    this.onPaymentMethodChange();

  }


  // ==========================================
  // REVAMP FALLBACK
  // ==========================================

  private revampFallback(): any {

    const screenContent =
      this.checkoutContent?.['content']?.[0]?.['screenContent'];

    if (!Array.isArray(screenContent)) {
      return this.cloneFallback();
    }

    const cmsData: any = {};

    screenContent.forEach((section: any) => {
      const key = section?.['key'];

      if (key === undefined || key === null || key === '') {
        return;
      }

      const sectionData = { ...section };
      delete sectionData.key;
      cmsData[key] = sectionData;
    });

    // CMS JSON has first priority. Missing CMS values use fallback.
    return this.mergeFallback(cmsData, CHECKOUT_FALLBACK);
  }

  // ==========================================
  // RECURSIVE FALLBACK MERGE
  // ==========================================

  private mergeFallback(cmsData: any, fallbackData: any): any {

    if (cmsData === null || cmsData === undefined) {
      return this.cloneFallbackValue(fallbackData);
    }

    if (typeof cmsData !== 'object') {
      return cmsData === '' ? fallbackData : cmsData;
    }

    if (Array.isArray(cmsData)) {
      if (cmsData.length === 0) {
        return this.cloneFallbackValue(fallbackData);
      }

      if (!Array.isArray(fallbackData)) {
        return cmsData;
      }

      return cmsData.map((cmsItem: any, index: number) =>
        this.mergeFallback(cmsItem, fallbackData[index])
      );
    }

    const result: any = {};
    const fallbackObject =
      fallbackData !== null &&
      typeof fallbackData === 'object' &&
      !Array.isArray(fallbackData)
        ? fallbackData
        : {};

    Object.keys(fallbackObject).forEach((key: string) => {
      const cmsValue = cmsData[key];
      const fallbackValue = fallbackObject[key];

      if (cmsValue === undefined || cmsValue === null || cmsValue === '') {
        result[key] = this.cloneFallbackValue(fallbackValue);
        return;
      }

      if (cmsValue && typeof cmsValue === 'object' && !Array.isArray(cmsValue)) {
        result[key] = this.mergeFallback(cmsValue, fallbackValue);
        return;
      }

      if (Array.isArray(cmsValue)) {
        result[key] = this.mergeFallback(cmsValue, fallbackValue);
        return;
      }

      result[key] = cmsValue;
    });

    // Keep any valid CMS-only keys as well.
    Object.keys(cmsData).forEach((key: string) => {
      if (result[key] === undefined) {
        result[key] = this.cloneFallbackValue(cmsData[key]);
      }
    });

    return result;
  }

  // ==========================================
  // CLONE FALLBACK VALUE
  // ==========================================

  private cloneFallbackValue(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item: any) => this.cloneFallbackValue(item));
    }

    if (value !== null && typeof value === 'object') {
      const result: any = {};
      Object.keys(value).forEach((key: string) => {
        result[key] = this.cloneFallbackValue(value[key]);
      });
      return result;
    }

    return value;
  }

  // ==========================================
  // CLONE CHECKOUT FALLBACK
  // ==========================================

  private cloneFallback(): any {
    return this.cloneFallbackValue(CHECKOUT_FALLBACK);
  }


  // ==========================================
  // PAYMENT METHOD CHANGE
  // ==========================================

  onPaymentMethodChange(): void {

    const paymentMethod =
      this.checkoutForm
        .get('paymentMethod')
        ?.value;


    const upiId =
      this.checkoutForm.get('upiId');


    const cardHolderName =
      this.checkoutForm
        .get('cardHolderName');


    const cardNumber =
      this.checkoutForm
        .get('cardNumber');


    const expiryDate =
      this.checkoutForm
        .get('expiryDate');


    const cvv =
      this.checkoutForm.get('cvv');


    // ==========================================
    // CLEAR ALL PAYMENT VALIDATORS
    // ==========================================

    upiId?.clearValidators();

    cardHolderName?.clearValidators();

    cardNumber?.clearValidators();

    expiryDate?.clearValidators();

    cvv?.clearValidators();


    // ==========================================
    // UPI
    // ==========================================

    if (
      paymentMethod === 'upi'
    ) {

      upiId?.setValidators([

        Validators.required,

        Validators.pattern(
          /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/
        )

      ]);

    }


    // ==========================================
    // CARD
    // ==========================================

    if (
      paymentMethod === 'card'
    ) {

      cardHolderName?.setValidators([

        Validators.required,

        Validators.minLength(3),

        Validators.maxLength(50),

        Validators.pattern(
          /^[a-zA-Z ]+$/
        )

      ]);


      cardNumber?.setValidators([

        Validators.required,

        Validators.pattern(
          /^[0-9]{16}$/
        )

      ]);


      expiryDate?.setValidators([

        Validators.required,

        Validators.pattern(
          /^(0[1-9]|1[0-2])\/([0-9]{2})$/
        )

      ]);


      cvv?.setValidators([

        Validators.required,

        Validators.pattern(
          /^[0-9]{3}$/
        )

      ]);

    }


    // ==========================================
    // UPDATE VALIDITY
    // ==========================================

    upiId?.updateValueAndValidity();

    cardHolderName?.updateValueAndValidity();

    cardNumber?.updateValueAndValidity();

    expiryDate?.updateValueAndValidity();

    cvv?.updateValueAndValidity();

  }


  // ==========================================
  // PLACE ORDER
  // ==========================================

  placeOrder(): void {

    this.submitted = true;


    // ==========================================
    // VALIDATE FORM
    // ==========================================

    if (
      this.checkoutForm.invalid
    ) {

      console.log(
        'Checkout form is invalid'
      );

      this.checkoutForm.markAllAsTouched();

      return;

    }


    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (
      !this.authService.isLoggedIn()
    ) {

      console.log(
        'User is not logged in. Redirecting to Login...'
      );


      this.saveCheckoutData();


      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl: '/checkout'
          }
        }
      );


      return;

    }


    // ==========================================
    // GENERATE ORDER ID
    // ==========================================

    this.orderId =
      'ORD-' +
      Math.floor(
        100000 +
        Math.random() * 900000
      );


    // ==========================================
    // CREATE ORDER
    // ==========================================

    const order = {

      id: this.orderId,

      date:
        new Date().toISOString(),

      status: 'Placed',


      // ========================================
      // ORDER ITEMS
      // ========================================

      items:
        this.cartItems.map(
          item => ({

            productId:
              item.product.id,

            title:
              item.product.title,

            price:
              item.product.price,

            quantity:
              item.quantity,

            image:
              item.product.image

          })
        ),


      // ========================================
      // CUSTOMER DETAILS
      // ========================================

      customer: {

        fullName:
          this.checkoutForm.value.fullName,

        mobile:
          this.checkoutForm.value.mobile,

        address:
          this.checkoutForm.value.address,

        city:
          this.checkoutForm.value.city,

        state:
          this.checkoutForm.value.state,

        pincode:
          this.checkoutForm.value.pincode

      },


      // ========================================
      // PAYMENT METHOD
      // ========================================

      paymentMethod:
        this.checkoutForm
          .value
          .paymentMethod,


      // ========================================
      // TOTALS
      // ========================================

      subtotal:
        this.getSubtotal(),

      shipping:
        this.getShipping(),

      total:
        this.getTotal()

    };


    // ==========================================
    // SAVE ORDER
    // ==========================================

this.orderService.addOrder(order);

this.orderPlaced = true;

sessionStorage.removeItem(
  'minishop_checkout_data'
);

// Check whether this was Buy Now or Checkout All
const buyNowItem = sessionStorage.getItem(
  'minishop_buy_now_item'
);

if (buyNowItem) {

  try {

    const selectedItem: CartItem =
      JSON.parse(buyNowItem);

    console.log(
      '🛒 Removing only Buy Now item from cart:',
      selectedItem
    );

    // Get current complete cart
    const currentCart =
      this.cartStateService.getCart();

    // Remove only the selected product
    const updatedCart =
      currentCart.filter(
        item =>
          item.product.id !== selectedItem.product.id
      );

    console.log(
      '🛒 Remaining cart after Buy Now:',
      updatedCart
    );

    // Update Shell CartStateService
    window.dispatchEvent(
      new CustomEvent(
        'cart-local-update',
        {
          detail: updatedCart
        }
      )
    );

    // Clear Buy Now selection
    sessionStorage.removeItem(
      'minishop_buy_now_item'
    );

  } catch (error) {

    console.error(
      'Unable to process Buy Now cart update:',
      error
    );

    // Fallback
    sessionStorage.removeItem(
      'minishop_buy_now_item'
    );
  }

} else {

  // Normal Checkout All
  this.cartStateService.clearCart();
}
    console.log(
      'Order placed successfully:',
      order
    );

  }


  // ==========================================
  // SAVE CHECKOUT DATA
  // ==========================================

  private saveCheckoutData(): void {

    /*
     * Demo purpose only.
     *
     * In a real application, payment
     * details should NOT be stored
     * in sessionStorage.
     */

    sessionStorage.setItem(
      'minishop_checkout_data',

      JSON.stringify(
        this.checkoutForm.value
      )
    );

  }


  // ==========================================
  // RESTORE CHECKOUT DATA
  // ==========================================

  private restoreCheckoutData(): void {

    const savedData =
      sessionStorage.getItem(
        'minishop_checkout_data'
      );


    if (!savedData) {

      return;

    }


    try {

      const checkoutData =
        JSON.parse(
          savedData
        );


      this.checkoutForm.patchValue(
        checkoutData
      );


      console.log(
        'Checkout data restored:',
        checkoutData
      );

    }

    catch (error) {

      console.error(
        'Unable to restore checkout data',
        error
      );

    }

  }


  // ==========================================
  // FORM GETTERS
  // ==========================================

  get fullName() {

    return this.checkoutForm
      .get('fullName');

  }


  get mobile() {

    return this.checkoutForm
      .get('mobile');

  }


  get address() {

    return this.checkoutForm
      .get('address');

  }


  get city() {

    return this.checkoutForm
      .get('city');

  }


  get state() {

    return this.checkoutForm
      .get('state');

  }


  get pincode() {

    return this.checkoutForm
      .get('pincode');

  }


  get paymentMethod() {

    return this.checkoutForm
      .get('paymentMethod');

  }


  get upiId() {

    return this.checkoutForm
      .get('upiId');

  }


  get cardHolderName() {

    return this.checkoutForm
      .get('cardHolderName');

  }


  get cardNumber() {

    return this.checkoutForm
      .get('cardNumber');

  }


  get expiryDate() {

    return this.checkoutForm
      .get('expiryDate');

  }


  get cvv() {

    return this.checkoutForm
      .get('cvv');

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

      (
        total,
        item
      ) =>
        total +
        item.quantity,

      0

    );

  }


  // ==========================================
  // SUBTOTAL
  // ==========================================

  getSubtotal(): number {

    return this.cartItems.reduce(

      (
        total,
        item
      ) =>
        total +
        (
          item.product.price *
          item.quantity
        ),

      0

    );

  }


  // ==========================================
  // SHIPPING
  // ==========================================

  getShipping(): number {

    return 0;

  }


  // ==========================================
  // FINAL TOTAL
  // ==========================================

  getTotal(): number {

    return (
      this.getSubtotal() +
      this.getShipping()
    );

  }

}