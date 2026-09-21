import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartStateService {

  // ==========================================
  // LOCAL STORAGE
  // ==========================================

  private readonly storageKey =
    'minishop_cart';


  // ==========================================
  // CART STATE
  // ==========================================

  private cartSubject =
    new BehaviorSubject<CartItem[]>(
      this.loadCart()
    );

  cart$ =
    this.cartSubject.asObservable();


  constructor() {

    // Products Remote -> Shell
    window.addEventListener(
      'add-to-cart',
      this.handleAddToCart
    );

    // Cart Remote -> Shell
    window.addEventListener(
      'request-cart',
      this.handleCartRequest
    );

    window.addEventListener(
      'update-cart-quantity',
      this.handleQuantityUpdate
    );

    window.addEventListener(
      'remove-from-cart',
      this.handleRemoveFromCart
    );


    // ==========================================
    // SEND RESTORED CART
    // ==========================================

    /*
     * When Shell starts again after browser refresh,
     * cartSubject is already populated from localStorage.
     *
     * Sending the event here allows Cart Remote
     * to receive the restored cart.
     */

    this.sendCartUpdate();

  }


  // ==========================================
  // LOAD CART FROM LOCAL STORAGE
  // ==========================================

 private loadCart(): CartItem[] {
debugger;
  const savedCart =
    localStorage.getItem(this.storageKey);

  console.log(
    'LOCAL STORAGE CART:',
    savedCart
  );

  if (!savedCart) {

    console.log(
      'No cart found in localStorage'
    );

    return [];

  }

  try {

    const parsedCart =
      JSON.parse(savedCart);

    console.log(
      'PARSED CART:',
      parsedCart
    );

    if (!Array.isArray(parsedCart)) {

      console.error(
        'Stored cart is not an array'
      );

      return [];

    }

    return parsedCart;

  } catch (error) {

    console.error(
      'Cart JSON parse failed:',
      error
    );

    return [];

  }
}


  // ==========================================
  // SAVE CART TO LOCAL STORAGE
  // ==========================================

 private saveCart(
  cart: CartItem[]
): void {

  console.log(
    'SAVING CART:',
    cart
  );

  localStorage.setItem(
    this.storageKey,
    JSON.stringify(cart)
  );

  console.log(
    'SAVED CART:',
    localStorage.getItem(
      this.storageKey
    )
  );
}


  // ==========================================
  // ADD TO CART
  // ==========================================

  private handleAddToCart = (
    event: Event
  ): void => {

    const customEvent =
      event as CustomEvent<Product>;

    const product =
      customEvent.detail;


    if (!product) {

      return;

    }


    const currentCart =
      [...this.cartSubject.value];


    const existingItem =
      currentCart.find(
        item =>
          item.product.id ===
          product.id
      );


    if (existingItem) {

      // Same product -> increase quantity

      const updatedCart =
        currentCart.map(item => {

          if (
            item.product.id ===
            product.id
          ) {

            return {
              ...item,
              quantity:
                item.quantity + 1
            };

          }

          return item;

        });


      this.updateCart(
        updatedCart
      );

    } else {

      // New product

      const updatedCart = [
        ...currentCart,
        {
          product: product,
          quantity: 1
        }
      ];


      this.updateCart(
        updatedCart
      );

    }

  };


  // ==========================================
  // CART REQUEST
  // ==========================================

  private handleCartRequest = (): void => {

    this.sendCartUpdate();

  };


  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  private handleQuantityUpdate = (
    event: Event
  ): void => {

    const customEvent =
      event as CustomEvent<{
        productId: number;
        quantity: number;
      }>;


    const detail =
      customEvent.detail;


    if (!detail) {

      return;

    }


    const productId =
      detail.productId;

    const quantity =
      detail.quantity;


    // If quantity becomes 0,
    // remove product

    if (quantity <= 0) {

      this.removeProduct(
        productId
      );

      return;

    }


    const updatedCart =
      this.cartSubject.value.map(item => {

        if (
          item.product.id ===
          productId
        ) {

          return {
            ...item,
            quantity: quantity
          };

        }

        return item;

      });


    this.updateCart(
      updatedCart
    );

  };


  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  private handleRemoveFromCart = (
    event: Event
  ): void => {

    const customEvent =
      event as CustomEvent<number>;


    const productId =
      customEvent.detail;


    if (
      productId === undefined ||
      productId === null
    ) {

      return;

    }


    this.removeProduct(
      productId
    );

  };


  private removeProduct(
    productId: number
  ): void {

    const updatedCart =
      this.cartSubject.value.filter(
        item =>
          item.product.id !==
          productId
      );


    this.updateCart(
      updatedCart
    );

  }


  // ==========================================
  // UPDATE CART
  // ==========================================

  private updateCart(
    cart: CartItem[]
  ): void {

    // 1. Update Angular state
    this.cartSubject.next(
      cart
    );


    // 2. Persist cart
    this.saveCart(
      cart
    );


    console.log(
      'Updated Cart:',
      cart
    );


    // 3. Notify Cart Remote
    this.sendCartUpdate();

  }


  // ==========================================
  // SEND CART TO CART REMOTE
  // ==========================================

  private sendCartUpdate(): void {

    window.dispatchEvent(
      new CustomEvent<CartItem[]>(
        'cart-updated',
        {
          detail: [
            ...this.cartSubject.value
          ]
        }
      )
    );

  }


  // ==========================================
  // GET CART
  // ==========================================

  getCart(): CartItem[] {

    return this.cartSubject.value;

  }


  // ==========================================
  // CART COUNT
  // ==========================================

  getCartCount(): number {

    return this.cartSubject.value.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  }


  // ==========================================
  // CART TOTAL
  // ==========================================

  getCartTotal(): number {

    return this.cartSubject.value.reduce(
      (total, item) =>
        total +
        (
          item.product.price *
          item.quantity
        ),
      0
    );

  }

}