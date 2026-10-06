import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CheckoutComponent } from './checkout.component';
import { CartStateService, CartItem } from '../services/cart-state.service';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { CmsContentService } from '../services/cms-content/cms-content.service';
import { CHECKOUT_FALLBACK } from '../constants/checkout.constant';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;

  let cartStateServiceMock: {
    getCart: jest.Mock;
    clearCart: jest.Mock;
  };

  let authServiceMock: {
    isLoggedIn: jest.Mock;
  };

  let routerMock: {
    navigate: jest.Mock;
  };

  let orderServiceMock: {
    addOrder: jest.Mock;
  };

  let cmsContentServiceMock: {
    getCheckoutContent: jest.Mock;
  };

  const cartItem: CartItem = {
    product: {
      id: 1,
      title: 'Test Product',
      price: 100,
      image: 'test.jpg'
    },
    quantity: 2
  } as CartItem;

  beforeEach(async () => {
    cartStateServiceMock = {
      getCart: jest.fn().mockReturnValue([]),
      clearCart: jest.fn()
    };

    authServiceMock = {
      isLoggedIn: jest.fn().mockReturnValue(true)
    };

    routerMock = {
      navigate: jest.fn()
    };

    orderServiceMock = {
      addOrder: jest.fn()
    };

    cmsContentServiceMock = {
      getCheckoutContent: jest.fn().mockReturnValue(
        of({
          content: [
            {
              screenContent: []
            }
          ]
        })
      )
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule
      ],
      declarations: [
        CheckoutComponent
      ],
      providers: [
        {
          provide: CartStateService,
          useValue: cartStateServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: OrderService,
          useValue: orderServiceMock
        },
        {
          provide: CmsContentService,
          useValue: cmsContentServiceMock
        }
      ]
    })
      .overrideTemplate(CheckoutComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(
      CheckoutComponent
    );

    component = fixture.componentInstance;

    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  // =========================================================
  // CREATE
  // =========================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // =========================================================
  // FORM
  // =========================================================

  it('should create checkout form', () => {
    expect(component.checkoutForm).toBeTruthy();

    expect(
      component.checkoutForm.contains('fullName')
    ).toBe(true);

    expect(
      component.checkoutForm.contains('mobile')
    ).toBe(true);

    expect(
      component.checkoutForm.contains('address')
    ).toBe(true);

    expect(
      component.checkoutForm.contains('city')
    ).toBe(true);

    expect(
      component.checkoutForm.contains('state')
    ).toBe(true);

    expect(
      component.checkoutForm.contains('pincode')
    ).toBe(true);

    expect(
      component.checkoutForm.contains('paymentMethod')
    ).toBe(true);
  });

  it('should make required fields invalid when empty', () => {
    expect(component.checkoutForm.invalid).toBe(true);

    expect(component.fullName?.hasError('required')).toBe(true);
    expect(component.mobile?.hasError('required')).toBe(true);
    expect(component.address?.hasError('required')).toBe(true);
    expect(component.city?.hasError('required')).toBe(true);
    expect(component.state?.hasError('required')).toBe(true);
    expect(component.pincode?.hasError('required')).toBe(true);
    expect(component.paymentMethod?.hasError('required')).toBe(true);
  });

  // =========================================================
  // NG ON INIT
  // =========================================================

  it('should load normal cart when buy now item does not exist', () => {
    cartStateServiceMock.getCart.mockReturnValue([
      cartItem
    ]);

    component.ngOnInit();

    expect(
      cartStateServiceMock.getCart
    ).toHaveBeenCalled();

    expect(component.cartItems).toEqual([
      cartItem
    ]);

    expect(
      cmsContentServiceMock.getCheckoutContent
    ).toHaveBeenCalled();
  });

  it('should load Buy Now item from session storage', () => {
    sessionStorage.setItem(
      'minishop_buy_now_item',
      JSON.stringify(cartItem)
    );

    component.ngOnInit();

    expect(component.cartItems).toEqual([
      cartItem
    ]);

    expect(
      cartStateServiceMock.getCart
    ).not.toHaveBeenCalled();
  });

  it('should fallback to cart when Buy Now session data is invalid', () => {
    sessionStorage.setItem(
      'minishop_buy_now_item',
      'invalid-json'
    );

    cartStateServiceMock.getCart.mockReturnValue([
      cartItem
    ]);

    component.ngOnInit();

    expect(
      cartStateServiceMock.getCart
    ).toHaveBeenCalled();

    expect(component.cartItems).toEqual([
      cartItem
    ]);
  });

  // =========================================================
  // CMS SUCCESS
  // =========================================================

  it('should process CMS content successfully', () => {
    const cmsContent = {
      content: [
        {
          screenContent: [
            {
              key: 'title',
              value: 'Checkout'
            }
          ]
        }
      ]
    };

    cmsContentServiceMock.getCheckoutContent
      .mockReturnValue(of(cmsContent));

    const initializeSpy = jest.spyOn(
      component as any,
      'initializeCheckout'
    );

    component.ngOnInit();

    expect(
      component.checkoutContent
    ).toEqual(cmsContent);

    expect(component.finalContent).toBeTruthy();

    expect(
      initializeSpy
    ).toHaveBeenCalled();
  });

  // =========================================================
  // CMS ERROR
  // =========================================================

  it('should use fallback when CMS content fails', () => {
    cmsContentServiceMock.getCheckoutContent
      .mockReturnValue(
        throwError(() => new Error('CMS error'))
      );

    const initializeSpy = jest.spyOn(
      component as any,
      'initializeCheckout'
    );

    component.ngOnInit();

    expect(component.checkoutContent).toBeNull();

    expect(component.finalContent).toEqual(
      CHECKOUT_FALLBACK
    );

    expect(
      initializeSpy
    ).toHaveBeenCalled();
  });

  // =========================================================
  // REVAMP FALLBACK
  // =========================================================

  it('should return fallback when CMS screenContent is invalid', () => {
    component.checkoutContent = {
      content: [
        {
          screenContent: null
        }
      ]
    };

    const result = (component as any)
      .revampFallback();

    expect(result).toEqual(
      CHECKOUT_FALLBACK
    );
  });

  it('should merge CMS screen content with fallback', () => {
    component.checkoutContent = {
      content: [
        {
          screenContent: [
            {
              key: 'title',
              value: 'CMS Checkout'
            },
            {
              key: 'payment',
              value: 'UPI'
            },
            {
              value: 'ignored'
            }
          ]
        }
      ]
    };

    const result = (component as any)
      .revampFallback();

    expect(result).toBeTruthy();

    expect(result.title).toBeDefined();
  });

  // =========================================================
  // MERGE FALLBACK
  // =========================================================

  it('should clone fallback when CMS data is null', () => {
    const fallback = {
      title: 'Fallback'
    };

    const result = (component as any)
      .mergeFallback(
        null,
        fallback
      );

    expect(result).toEqual(fallback);
    expect(result).not.toBe(fallback);
  });

  it('should return CMS primitive value', () => {
    const result = (component as any)
      .mergeFallback(
        'CMS Value',
        'Fallback Value'
      );

    expect(result).toBe('CMS Value');
  });

  it('should return fallback for empty CMS primitive', () => {
    const result = (component as any)
      .mergeFallback(
        '',
        'Fallback Value'
      );

    expect(result).toBe('Fallback Value');
  });

  it('should return fallback for empty CMS array', () => {
    const result = (component as any)
      .mergeFallback(
        [],
        ['A', 'B']
      );

    expect(result).toEqual([
      'A',
      'B'
    ]);
  });

  it('should return CMS array when fallback is not an array', () => {
    const cmsData = ['A', 'B'];

    const result = (component as any)
      .mergeFallback(
        cmsData,
        {}
      );

    expect(result).toEqual(cmsData);
  });

  it('should recursively merge arrays', () => {
    const result = (component as any)
      .mergeFallback(
        [
          {
            name: 'CMS'
          }
        ],
        [
          {
            name: 'Fallback',
            description: 'Description'
          }
        ]
      );

    expect(result).toEqual([
      {
        name: 'CMS',
        description: 'Description'
      }
    ]);
  });

  it('should use fallback when CMS object property is missing', () => {
    const result = (component as any)
      .mergeFallback(
        {
          title: 'CMS'
        },
        {
          title: 'Fallback',
          description: 'Default description'
        }
      );

    expect(result).toEqual({
      title: 'CMS',
      description: 'Default description'
    });
  });

  it('should use fallback when CMS property is null', () => {
    const result = (component as any)
      .mergeFallback(
        {
          title: null
        },
        {
          title: 'Fallback'
        }
      );

    expect(result).toEqual({
      title: 'Fallback'
    });
  });

  it('should merge nested objects', () => {
    const result = (component as any)
      .mergeFallback(
        {
          customer: {
            name: 'John'
          }
        },
        {
          customer: {
            name: 'Default',
            city: 'Pune'
          }
        }
      );

    expect(result).toEqual({
      customer: {
        name: 'John',
        city: 'Pune'
      }
    });
  });

  it('should preserve CMS-only properties', () => {
    const result = (component as any)
      .mergeFallback(
        {
          title: 'CMS',
          extra: 'Extra'
        },
        {
          title: 'Fallback'
        }
      );

    expect(result).toEqual({
      title: 'CMS',
      extra: 'Extra'
    });
  });

  // =========================================================
  // CLONE FALLBACK
  // =========================================================

  it('should clone fallback value', () => {
    const original = {
      title: 'Test',
      nested: {
        value: 10
      }
    };

    const result = (component as any)
      .cloneFallbackValue(original);

    expect(result).toEqual(original);
    expect(result).not.toBe(original);
    expect(result.nested).not.toBe(
      original.nested
    );
  });

  it('should clone fallback array', () => {
    const original = [
      {
        name: 'Product'
      }
    ];

    const result = (component as any)
      .cloneFallbackValue(original);

    expect(result).toEqual(original);
    expect(result).not.toBe(original);
  });

  it('should return primitive fallback value', () => {
    expect(
      (component as any)
        .cloneFallbackValue('Test')
    ).toBe('Test');

    expect(
      (component as any)
        .cloneFallbackValue(null)
    ).toBeNull();
  });

  // =========================================================
  // PAYMENT METHOD
  // =========================================================

  it('should apply UPI validators', () => {
    component.checkoutForm
      .get('paymentMethod')
      ?.setValue('upi');

    component.onPaymentMethodChange();

    const upiControl =
      component.checkoutForm.get('upiId');

    expect(
      upiControl?.hasError('required')
    ).toBe(true);

    upiControl?.setValue('test@example.com');

    expect(
      upiControl?.valid
    ).toBe(true);
  });

  it('should reject invalid UPI ID', () => {
    component.checkoutForm
      .get('paymentMethod')
      ?.setValue('upi');

    component.onPaymentMethodChange();

    const upiControl =
      component.checkoutForm.get('upiId');

    upiControl?.setValue('invalid');

    expect(
      upiControl?.hasError('pattern')
    ).toBe(true);
  });

  it('should apply card validators', () => {
    component.checkoutForm
      .get('paymentMethod')
      ?.setValue('card');

    component.onPaymentMethodChange();

    expect(
      component.cardHolderName?.hasError('required')
    ).toBe(true);

    expect(
      component.cardNumber?.hasError('required')
    ).toBe(true);

    expect(
      component.expiryDate?.hasError('required')
    ).toBe(true);

    expect(
      component.cvv?.hasError('required')
    ).toBe(true);
  });

  it('should accept valid card details', () => {
    component.checkoutForm.patchValue({
      paymentMethod: 'card',
      cardHolderName: 'John Doe',
      cardNumber: '1234567890123456',
      expiryDate: '12/30',
      cvv: '123'
    });

    component.onPaymentMethodChange();

    expect(
      component.cardHolderName?.valid
    ).toBe(true);

    expect(
      component.cardNumber?.valid
    ).toBe(true);

    expect(
      component.expiryDate?.valid
    ).toBe(true);

    expect(
      component.cvv?.valid
    ).toBe(true);
  });

  // =========================================================
  // PLACE ORDER - INVALID FORM
  // =========================================================

  it('should not place order when form is invalid', () => {
    component.placeOrder();

    expect(component.submitted).toBe(true);

    expect(
      orderServiceMock.addOrder
    ).not.toHaveBeenCalled();

    expect(
      routerMock.navigate
    ).not.toHaveBeenCalled();
  });

  // =========================================================
  // PLACE ORDER - NOT LOGGED IN
  // =========================================================

  it('should save checkout and navigate to login when user is not logged in', () => {
    authServiceMock.isLoggedIn
      .mockReturnValue(false);

    component.checkoutForm.patchValue({
      fullName: 'John Doe',
      mobile: '9876543210',
      address: '123 Main Street Pune',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      paymentMethod: 'upi',
      upiId: 'john@test.com'
    });

    component.onPaymentMethodChange();

    component.placeOrder();

    expect(
      sessionStorage.getItem(
        'minishop_checkout_data'
      )
    ).toBeTruthy();

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith(
      ['/login'],
      {
        queryParams: {
          returnUrl: '/checkout'
        }
      }
    );

    expect(
      orderServiceMock.addOrder
    ).not.toHaveBeenCalled();
  });

  // =========================================================
  // PLACE ORDER - SUCCESS
  // =========================================================

  it('should place order successfully', () => {
    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.cartItems = [
      cartItem
    ];

    component.checkoutForm.patchValue({
      fullName: 'John Doe',
      mobile: '9876543210',
      address: '123 Main Street Pune',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      paymentMethod: 'upi',
      upiId: 'john@test.com'
    });

    component.onPaymentMethodChange();

    jest
      .spyOn(Math, 'random')
      .mockReturnValue(0.5);

    component.placeOrder();

    expect(
      component.orderPlaced
    ).toBe(true);

    expect(
      component.orderId
    ).toMatch(/^ORD-\d{6}$/);

    expect(
      orderServiceMock.addOrder
    ).toHaveBeenCalled();

    expect(
      cartStateServiceMock.clearCart
    ).toHaveBeenCalled();
  });

  // =========================================================
  // BUY NOW ORDER
  // =========================================================

  it('should remove only Buy Now item after successful order', () => {
    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    const anotherItem = {
      product: {
        id: 2,
        title: 'Another Product',
        price: 200,
        image: 'another.jpg'
      },
      quantity: 1
    } as CartItem;

    component.cartItems = [
      cartItem
    ];

    sessionStorage.setItem(
      'minishop_buy_now_item',
      JSON.stringify(cartItem)
    );

    cartStateServiceMock.getCart
      .mockReturnValue([
        cartItem,
        anotherItem
      ]);

    component.checkoutForm.patchValue({
      fullName: 'John Doe',
      mobile: '9876543210',
      address: '123 Main Street Pune',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      paymentMethod: 'upi',
      upiId: 'john@test.com'
    });

    component.onPaymentMethodChange();

    const eventSpy =
      jest.spyOn(
        window,
        'dispatchEvent'
      );

    component.placeOrder();

    expect(
      eventSpy
    ).toHaveBeenCalled();

    expect(
      sessionStorage.getItem(
        'minishop_buy_now_item'
      )
    ).toBeNull();

    expect(
      cartStateServiceMock.clearCart
    ).not.toHaveBeenCalled();
  });

  // =========================================================
  // SAVE / RESTORE CHECKOUT
  // =========================================================

  it('should restore checkout data from session storage', () => {
    const savedData = {
      fullName: 'John Doe',
      mobile: '9876543210',
      city: 'Pune'
    };

    sessionStorage.setItem(
      'minishop_checkout_data',
      JSON.stringify(savedData)
    );

    (component as any).restoreCheckoutData();

    expect(
      component.checkoutForm.value.fullName
    ).toBe('John Doe');

    expect(
      component.checkoutForm.value.mobile
    ).toBe('9876543210');

    expect(
      component.checkoutForm.value.city
    ).toBe('Pune');
  });

  it('should do nothing when checkout data is not saved', () => {
    (component as any).restoreCheckoutData();

    expect(
      component.checkoutForm.value.fullName
    ).toBe('');
  });

  it('should handle invalid saved checkout data', () => {
    sessionStorage.setItem(
      'minishop_checkout_data',
      'invalid-json'
    );

    expect(() => {
      (component as any).restoreCheckoutData();
    }).not.toThrow();
  });

  // =========================================================
  // GETTERS
  // =========================================================

  it('should return form controls through getters', () => {
    expect(component.fullName)
      .toBe(component.checkoutForm.get('fullName'));

    expect(component.mobile)
      .toBe(component.checkoutForm.get('mobile'));

    expect(component.address)
      .toBe(component.checkoutForm.get('address'));

    expect(component.city)
      .toBe(component.checkoutForm.get('city'));

    expect(component.state)
      .toBe(component.checkoutForm.get('state'));

    expect(component.pincode)
      .toBe(component.checkoutForm.get('pincode'));

    expect(component.paymentMethod)
      .toBe(component.checkoutForm.get('paymentMethod'));

    expect(component.upiId)
      .toBe(component.checkoutForm.get('upiId'));

    expect(component.cardHolderName)
      .toBe(component.checkoutForm.get('cardHolderName'));

    expect(component.cardNumber)
      .toBe(component.checkoutForm.get('cardNumber'));

    expect(component.expiryDate)
      .toBe(component.checkoutForm.get('expiryDate'));

    expect(component.cvv)
      .toBe(component.checkoutForm.get('cvv'));
  });

  // =========================================================
  // CALCULATIONS
  // =========================================================

  it('should calculate item total', () => {
    expect(
      component.getItemTotal(cartItem)
    ).toBe(200);
  });

  it('should calculate cart count', () => {
    component.cartItems = [
      cartItem,
      {
        product: {
          id: 2,
          title: 'Product 2',
          price: 50,
          image: 'two.jpg'
        },
        quantity: 3
      } as CartItem
    ];

    expect(
      component.getCartCount()
    ).toBe(5);
  });

  it('should calculate subtotal', () => {
    component.cartItems = [
      cartItem,
      {
        product: {
          id: 2,
          title: 'Product 2',
          price: 50,
          image: 'two.jpg'
        },
        quantity: 3
      } as CartItem
    ];

    expect(
      component.getSubtotal()
    ).toBe(350);
  });

  it('should return zero shipping', () => {
    expect(
      component.getShipping()
    ).toBe(0);
  });

  it('should calculate final total', () => {
    component.cartItems = [
      cartItem
    ];

    expect(
      component.getTotal()
    ).toBe(200);
  });
});