import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

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

  constructor(
    private authService: AuthService
  ) {

    console.log(
      '🔥 CartStateService CREATED'
    );


    // ==========================================
    // LOAD CURRENT USER CART
    // ==========================================

    /*
     * AuthService is required to identify the
     * currently logged-in user.
     *
     * Therefore the cart is loaded inside the
     * constructor instead of field initialization.
     */

    this.cartSubject.next(
      this.loadCart()
    );


    // Products Remote → Shell
    window.addEventListener(
      'add-to-cart',
      this.handleAddToCart
    );


    // Cart Remote → Shell
    window.addEventListener(
      'request-cart',
      this.handleCartRequest
    );


    // Cart Remote → Shell
    // Receives complete updated cart
    window.addEventListener(
      'cart-local-update',
      this.handleLocalCartUpdate
    );


    // ==========================================
    // SEND INITIAL CART
    // ==========================================

    /*
     * Cart Remote can receive the currently
     * logged-in user's restored cart.
     */

    this.sendCartUpdate();

  }


  // ==========================================
  // GET CURRENT USER STORAGE KEY
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
  // LOAD CART FROM LOCAL STORAGE
  // ==========================================

  private loadCart(): CartItem[] {

    console.log(
      '🔥 Loading cart from localStorage...'
    );


    const storageKey =
      this.getStorageKey();


    // ==========================================
    // NO LOGGED-IN USER
    // ==========================================

    if (!storageKey) {

      console.log(
        'No logged-in user. Cart is empty.'
      );

      return [];

    }


    const savedCart =
      localStorage.getItem(
        storageKey
      );


    console.log(
      'LOCAL STORAGE CART:',
      storageKey,
      savedCart
    );


    // Nothing saved
    if (!savedCart) {

      console.log(
        'No cart found for current user'
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
      '💾 Saving cart to localStorage:',
      cart
    );


    const storageKey =
      this.getStorageKey();


    /*
     * Do not save a shared cart when there is
     * no logged-in user.
     */

    if (!storageKey) {

      console.warn(
        'Cart was not saved because no user is logged in.'
      );

      return;

    }


    localStorage.setItem(
      storageKey,
      JSON.stringify(cart)
    );


    console.log(
      '💾 Saved cart:',
      localStorage.getItem(
        storageKey
      )
    );

  }


  // ==========================================
  // ADD PRODUCT TO CART
  // ==========================================

  private handleAddToCart =
    (event: Event): void => {

      // ========================================
      // LOGIN CHECK
      // ========================================

      if (!this.authService.isLoggedIn()) {

        console.warn(
          'Cannot add product. User is not logged in.'
        );

        return;

      }


      const customEvent =
        event as CustomEvent<Product>;


      const product =
        customEvent.detail;


      if (!product) {
        return;
      }


      console.log(
        '🔥 ADD TO CART EVENT RECEIVED:',
        product
      );


      const currentCart =
        this.cartSubject.value;


      const existingItem =
        currentCart.find(
          item =>
            item.product.id === product.id
        );


      let updatedCart: CartItem[];


      // Product already exists
      if (existingItem) {

        updatedCart =
          currentCart.map(item => {

            if (
              item.product.id === product.id
            ) {

              return {
                ...item,
                quantity:
                  item.quantity + 1
              };

            }

            return item;

          });

      }

      // New product
      else {

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

      console.log(
        'Cart Remote requested cart'
      );


      this.sendCartUpdate();

    };


  // ==========================================
  // CART REMOTE UPDATED CART
  // ==========================================

  private handleLocalCartUpdate =
    (event: Event): void => {

      // ========================================
      // LOGIN CHECK
      // ========================================

      if (!this.authService.isLoggedIn()) {

        console.warn(
          'Ignoring cart update because no user is logged in.'
        );

        return;

      }


      const customEvent =
        event as CustomEvent<CartItem[]>;


      const updatedCart =
        customEvent.detail;


      if (!updatedCart) {
        return;
      }


      console.log(
        'Shell received updated cart:',
        updatedCart
      );


      this.updateCart(
        [...updatedCart]
      );

    };


  // ==========================================
  // UPDATE CART
  // ==========================================

  private updateCart(
    cart: CartItem[]
  ): void {

    // Update BehaviorSubject
    this.cartSubject.next(
      [...cart]
    );


    console.log(
      'Current Cart:',
      this.cartSubject.value
    );


    // Save cart for current user
    this.saveCart(
      this.cartSubject.value
    );


    // Notify Cart Remote
    this.sendCartUpdate();

  };


  // ==========================================
  // SEND CART TO CART REMOTE
  // ==========================================

  private sendCartUpdate(): void {

    const cart =
      [...this.cartSubject.value];


    window.dispatchEvent(
      new CustomEvent<CartItem[]>(
        'cart-updated',
        {
          detail: cart
        }
      )
    );

  };


  // ==========================================
  // GET CART
  // ==========================================

  getCart(): CartItem[] {

    return [
      ...this.cartSubject.value
    ];

  };


  // ==========================================
  // GET CART COUNT
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

  };


  // ==========================================
  // GET CART TOTAL
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

  };


  // ==========================================
  // CLEAR CART
  // ==========================================

  clearCart(): void {

    // Clear BehaviorSubject
    this.cartSubject.next([]);


    // ==========================================
    // CLEAR CURRENT USER CART ONLY
    // ==========================================

    const storageKey =
      this.getStorageKey();


    if (storageKey) {

      localStorage.removeItem(
        storageKey
      );

    }


    // Notify Cart Remote
    this.sendCartUpdate();


    console.log(
      '🗑️ Current user cart cleared'
    );

  }

}
