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

  private readonly storageKeyPrefix =
    'minishop_cart_';


  // ==========================================
  // CART STATE
  // ==========================================

  private cartSubject =
    new BehaviorSubject<CartItem[]>([]);

  cart$ =
    this.cartSubject.asObservable();


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor() {

    // ==========================================
    // PRODUCTS REMOTE -> CART REMOTE
    // ==========================================

    window.addEventListener(
      'add-to-cart',
      this.handleAddToCart
    );


    // ==========================================
    // SHELL -> CART REMOTE
    // ==========================================

    window.addEventListener(
      'cart-updated',
      this.handleCartUpdated
    );


    // ==========================================
    // CART REQUEST
    // ==========================================

    window.addEventListener(
      'request-cart',
      this.handleCartRequest
    );


    // ==========================================
    // QUANTITY UPDATE
    // ==========================================

    window.addEventListener(
      'update-cart-quantity',
      this.handleQuantityUpdate
    );


    // ==========================================
    // REMOVE PRODUCT
    // ==========================================

    window.addEventListener(
      'remove-from-cart',
      this.handleRemoveFromCart
    );


    // ==========================================
    // USER LOGIN / LOGOUT
    // ==========================================

    window.addEventListener(
      'auth-user-changed',
      this.handleUserChanged
    );


    // ==========================================
    // LOAD CURRENT USER CART
    // ==========================================

    this.cartSubject.next(
      this.loadCart()
    );

  }


  // ==========================================
  // GET CURRENT USER STORAGE KEY
  // ==========================================

  private getStorageKey(): string | null {

    const currentUserEmail =
      localStorage.getItem(
        'minishop_current_user'
      );


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
  // LOAD CART
  // ==========================================

  private loadCart(): CartItem[] {

    const storageKey =
      this.getStorageKey();


    // No logged-in user

    if (!storageKey) {

      console.log(
        'No logged-in user. Cart Remote is empty.'
      );

      return [];

    }


    const savedCart =
      localStorage.getItem(
        storageKey
      );


    console.log(
      'Cart Remote loading:',
      storageKey,
      savedCart
    );


    if (!savedCart) {

      return [];

    }


    try {

      const parsedCart =
        JSON.parse(savedCart);


      if (!Array.isArray(parsedCart)) {

        return [];

      }


      return parsedCart;

    } catch (error) {

      console.error(
        'Cart Remote cart JSON parse failed:',
        error
      );

      return [];

    }

  }


  // ==========================================
  // SAVE CART
  // ==========================================

  private saveCart(
    cart: CartItem[]
  ): void {

    const storageKey =
      this.getStorageKey();


    if (!storageKey) {

      console.warn(
        'Cart Remote: no logged-in user.'
      );

      return;

    }


    localStorage.setItem(
      storageKey,
      JSON.stringify(cart)
    );

  }


  // ==========================================
  // USER CHANGED
  // ==========================================

  private handleUserChanged =
    (): void => {

      console.log(
        '🔄 Cart Remote: user changed.'
      );


      const userCart =
        this.loadCart();


      this.cartSubject.next(
        userCart
      );

    };


  // ==========================================
  // SHELL CART UPDATED
  // ==========================================

  private handleCartUpdated =
    (event: Event): void => {

      const customEvent =
        event as CustomEvent<CartItem[]>;


      const cart =
        customEvent.detail;


      if (!cart) {

        return;

      }


      console.log(
        'Cart Remote received cart from Shell:',
        cart
      );


      this.cartSubject.next(
        [
          ...cart
        ]
      );

    };


  // ==========================================
  // ADD TO CART
  // ==========================================

  private handleAddToCart =
    (event: Event): void => {

      const customEvent =
        event as CustomEvent<Product>;


      const product =
        customEvent.detail;


      if (!product) {

        return;

      }


      const currentCart =
        [
          ...this.cartSubject.value
        ];


      const existingItem =
        currentCart.find(
          item =>
            item.product.id ===
            product.id
        );


      let updatedCart: CartItem[];


      if (existingItem) {

        updatedCart =
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

      } else {

        updatedCart = [
          ...currentCart,
          {
            product: product,
            quantity: 1
          }
        ];

      }


      this.updateCart(
        updatedCart
      );

    };


  // ==========================================
  // CART REQUEST
  // ==========================================

  private handleCartRequest =
    (): void => {

      this.cartSubject.next(
        this.loadCart()
      );

    };


  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  private handleQuantityUpdate =
    (event: Event): void => {

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


      if (quantity <= 0) {

        this.removeProduct(
          productId
        );

        return;

      }


      const updatedCart =
        this.cartSubject.value.map(
          item => {

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

          }
        );


      this.updateCart(
        updatedCart
      );

    };


  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  private handleRemoveFromCart =
    (event: Event): void => {

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

    this.cartSubject.next(
      [
        ...cart
      ]
    );


    this.saveCart(
      cart
    );


    console.log(
      'Updated Cart:',
      cart
    );


    // Notify Shell

    window.dispatchEvent(
      new CustomEvent<CartItem[]>(
        'cart-local-update',
        {
          detail: [
            ...cart
          ]
        }
      )
    );

  }


  // ==========================================
  // GET CART
  // ==========================================

  getCart(): CartItem[] {

    return [
      ...this.cartSubject.value
    ];

  }


  // ==========================================
  // CART COUNT
  // ==========================================

  getCartCount(): number {

    return this.cartSubject.value.reduce(
      (
        total,
        item
      ) =>
        total + item.quantity,
      0
    );

  }


  // ==========================================
  // CART TOTAL
  // ==========================================

  getCartTotal(): number {

    return this.cartSubject.value.reduce(
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

}