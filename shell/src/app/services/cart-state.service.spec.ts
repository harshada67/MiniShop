import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  CartItem,
  Product,
  CartStateService
} from './cart-state.service';

describe('CartStateService', () => {

  let service: CartStateService;

  let authServiceMock: {
    getCurrentUserEmail: jest.Mock;
    isLoggedIn: jest.Mock;
  };


  const product1: Product = {
    id: 1,
    title: 'Laptop',
    price: 1000,
    description: 'Test laptop',
    category: 'electronics',
    image: 'laptop.jpg',
    rating: 4.5
  };


  const product2: Product = {
    id: 2,
    title: 'Phone',
    price: 500,
    description: 'Test phone',
    category: 'electronics',
    image: 'phone.jpg',
    rating: 4
  };


  beforeEach(() => {

    localStorage.clear();

    authServiceMock = {
      getCurrentUserEmail: jest.fn()
        .mockReturnValue('test@gmail.com'),

      isLoggedIn: jest.fn()
        .mockReturnValue(true)
    };


    TestBed.configureTestingModule({
      providers: [
        CartStateService,
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    });


    service =
      TestBed.inject(CartStateService);

  });


  afterEach(() => {

    localStorage.clear();

    jest.clearAllMocks();

  });


  // =========================================================
  // CREATE
  // =========================================================

  it('should create', () => {

    expect(service).toBeTruthy();

  });


  // =========================================================
  // INITIAL CART
  // =========================================================

  it('should initialize with empty cart when no saved cart exists', () => {

    expect(service.getCart())
      .toEqual([]);

  });


  it('should load cart from localStorage', () => {

    const cart: CartItem[] = [
      {
        product: product1,
        quantity: 2
      }
    ];

    localStorage.setItem(
      'minishop_cart_test@gmail.com',
      JSON.stringify(cart)
    );


    // Create a new service after putting data in storage
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        CartStateService,
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    });

    service =
      TestBed.inject(CartStateService);


    expect(service.getCart())
      .toEqual(cart);

  });


  it('should return empty cart when user is not logged in', () => {

    authServiceMock.getCurrentUserEmail
      .mockReturnValue(null);


    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        CartStateService,
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    });

    service =
      TestBed.inject(CartStateService);


    expect(service.getCart())
      .toEqual([]);

  });


  it('should return empty cart when saved cart does not exist', () => {

    expect(service.getCart())
      .toEqual([]);

    expect(
      localStorage.getItem(
        'minishop_cart_test@gmail.com'
      )
    ).toBeNull();

  });


  // =========================================================
  // INVALID LOCAL STORAGE
  // =========================================================

  it('should return empty cart when stored cart JSON is invalid', () => {

    localStorage.setItem(
      'minishop_cart_test@gmail.com',
      'invalid-json'
    );


    const consoleSpy =
      jest.spyOn(console, 'error')
        .mockImplementation();


    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        CartStateService,
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    });

    service =
      TestBed.inject(CartStateService);


    expect(service.getCart())
      .toEqual([]);

    expect(consoleSpy)
      .toHaveBeenCalled();


    consoleSpy.mockRestore();

  });


  it('should return empty cart when stored value is not an array', () => {

    localStorage.setItem(
      'minishop_cart_test@gmail.com',
      JSON.stringify({
        product: product1
      })
    );


    const consoleSpy =
      jest.spyOn(console, 'error')
        .mockImplementation();


    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        CartStateService,
        {
          provide: AuthService,
          useValue: authServiceMock
        }
      ]
    });

    service =
      TestBed.inject(CartStateService);


    expect(service.getCart())
      .toEqual([]);

    expect(consoleSpy)
      .toHaveBeenCalled();


    consoleSpy.mockRestore();

  });


  // =========================================================
  // GET CART
  // =========================================================

  it('should return a copy of cart', () => {

    const cart: CartItem[] = [
      {
        product: product1,
        quantity: 2
      }
    ];


    (service as any).cartSubject.next(cart);


    const result =
      service.getCart();


    expect(result)
      .toEqual(cart);

    expect(result)
      .not.toBe(cart);

  });


  // =========================================================
  // CART COUNT
  // =========================================================

  it('should calculate cart count', () => {

    (service as any).cartSubject.next([
      {
        product: product1,
        quantity: 2
      },
      {
        product: product2,
        quantity: 3
      }
    ]);


    expect(
      service.getCartCount()
    ).toBe(5);

  });


  it('should return zero cart count for empty cart', () => {

    expect(
      service.getCartCount()
    ).toBe(0);

  });


  // =========================================================
  // CART TOTAL
  // =========================================================

  it('should calculate cart total', () => {

    (service as any).cartSubject.next([
      {
        product: product1,
        quantity: 2
      },
      {
        product: product2,
        quantity: 3
      }
    ]);


    // 1000 * 2 + 500 * 3 = 3500

    expect(
      service.getCartTotal()
    ).toBe(3500);

  });


  it('should return zero cart total for empty cart', () => {

    expect(
      service.getCartTotal()
    ).toBe(0);

  });


  // =========================================================
  // ADD TO CART - NOT LOGGED IN
  // =========================================================

  it('should not add product when user is not logged in', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(false);


    const event =
      new CustomEvent<Product>(
        'add-to-cart',
        {
          detail: product1
        }
      );


    const consoleSpy =
      jest.spyOn(console, 'warn')
        .mockImplementation();


    window.dispatchEvent(event);


    expect(service.getCart())
      .toEqual([]);

    expect(consoleSpy)
      .toHaveBeenCalled();


    consoleSpy.mockRestore();

  });


  // =========================================================
  // ADD NEW PRODUCT
  // =========================================================

  it('should add new product to cart', () => {

    const event =
      new CustomEvent<Product>(
        'add-to-cart',
        {
          detail: product1
        }
      );


    window.dispatchEvent(event);


    expect(service.getCart())
      .toEqual([
        {
          product: product1,
          quantity: 1
        }
      ]);


    expect(
      localStorage.getItem(
        'minishop_cart_test@gmail.com'
      )
    ).toBeTruthy();

  });


  // =========================================================
  // ADD EXISTING PRODUCT
  // =========================================================

  it('should increase quantity when same product is added again', () => {

    const event =
      new CustomEvent<Product>(
        'add-to-cart',
        {
          detail: product1
        }
      );


    window.dispatchEvent(event);
    window.dispatchEvent(event);


    expect(service.getCart()[0].quantity)
      .toBe(2);

  });


  // =========================================================
  // ADD EVENT WITHOUT PRODUCT
  // =========================================================

  it('should ignore add-to-cart event without product', () => {

    const event =
      new CustomEvent<Product>(
        'add-to-cart',
        {
          detail: undefined as any
        }
      );


    window.dispatchEvent(event);


    expect(service.getCart())
      .toEqual([]);

  });


  // =========================================================
  // CART REQUEST
  // =========================================================

  it('should send cart update when cart is requested', () => {

    const dispatchSpy =
      jest.spyOn(window, 'dispatchEvent');


    const event =
      new Event('request-cart');


    window.dispatchEvent(event);


    expect(
      dispatchSpy
    ).toHaveBeenCalled();


    const cartUpdateCall =
      dispatchSpy.mock.calls.find(
        call =>
          call[0] instanceof CustomEvent &&
          (call[0] as CustomEvent).type ===
            'cart-updated'
      );


    expect(cartUpdateCall)
      .toBeDefined();


    dispatchSpy.mockRestore();

  });


  // =========================================================
  // LOCAL CART UPDATE
  // =========================================================

  it('should ignore cart-local-update when user is not logged in', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(false);


    const event =
      new CustomEvent<CartItem[]>(
        'cart-local-update',
        {
          detail: [
            {
              product: product1,
              quantity: 2
            }
          ]
        }
      );


    const consoleSpy =
      jest.spyOn(console, 'warn')
        .mockImplementation();


    window.dispatchEvent(event);


    expect(service.getCart())
      .toEqual([]);

    expect(consoleSpy)
      .toHaveBeenCalled();


    consoleSpy.mockRestore();

  });


  it('should update cart from cart-local-update event', () => {

    const updatedCart: CartItem[] = [
      {
        product: product1,
        quantity: 4
      }
    ];


    const event =
      new CustomEvent<CartItem[]>(
        'cart-local-update',
        {
          detail: updatedCart
        }
      );


    window.dispatchEvent(event);


    expect(service.getCart())
      .toEqual(updatedCart);


    expect(
      localStorage.getItem(
        'minishop_cart_test@gmail.com'
      )
    ).toBeTruthy();

  });


  it('should ignore cart-local-update without cart detail', () => {

    const event =
      new CustomEvent<CartItem[]>(
        'cart-local-update',
        {
          detail: undefined as any
        }
      );


    window.dispatchEvent(event);


    expect(service.getCart())
      .toEqual([]);

  });


  // =========================================================
  // USER CHANGED
  // =========================================================

  it('should reload cart when auth-user-changed event is fired', () => {

    const savedCart: CartItem[] = [
      {
        product: product2,
        quantity: 5
      }
    ];


    localStorage.setItem(
      'minishop_cart_test@gmail.com',
      JSON.stringify(savedCart)
    );


    const dispatchSpy =
      jest.spyOn(window, 'dispatchEvent');


    window.dispatchEvent(
      new Event('auth-user-changed')
    );


    expect(service.getCart())
      .toEqual(savedCart);


    expect(
      dispatchSpy
    ).toHaveBeenCalled();


    dispatchSpy.mockRestore();

  });


  // =========================================================
  // CART$
  // =========================================================

  it('should emit cart changes through cart$', () => {

    const emittedValues: CartItem[][] = [];


    const subscription =
      service.cart$.subscribe(
        cart => emittedValues.push(cart)
      );


    const event =
      new CustomEvent<Product>(
        'add-to-cart',
        {
          detail: product1
        }
      );


    window.dispatchEvent(event);


    expect(
      emittedValues[emittedValues.length - 1]
    ).toEqual([
      {
        product: product1,
        quantity: 1
      }
    ]);


    subscription.unsubscribe();

  });


  // =========================================================
  // CLEAR CART
  // =========================================================

  it('should clear cart', () => {

    const event =
      new CustomEvent<Product>(
        'add-to-cart',
        {
          detail: product1
        }
      );


    window.dispatchEvent(event);


    expect(service.getCart())
      .toHaveLength(1);


    service.clearCart();


    expect(service.getCart())
      .toEqual([]);

  });


  it('should remove saved cart when clearing cart', () => {

    const event =
      new CustomEvent<Product>(
        'add-to-cart',
        {
          detail: product1
        }
      );


    window.dispatchEvent(event);


    expect(
      localStorage.getItem(
        'minishop_cart_test@gmail.com'
      )
    ).not.toBeNull();


    service.clearCart();


    expect(
      localStorage.getItem(
        'minishop_cart_test@gmail.com'
      )
    ).toBeNull();

  });


  it('should clear cart without logged-in user', () => {

    authServiceMock.getCurrentUserEmail
      .mockReturnValue(null);


    service.clearCart();


    expect(service.getCart())
      .toEqual([]);

  });

});