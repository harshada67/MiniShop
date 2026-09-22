import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';

import { CartComponent } from './cart.component';
import { CmsContentService } from '../services/cms-content/cms-content.service';
import { CART_FALLBACK } from '../constants/cart.constant';
import { CartItem } from '../models/cart-item.model';


describe('CartComponent', () => {

  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  let router: Router;

  let cmsContentService: {
    getCartContent: jest.Mock;
  };


  // =========================================================
  // TEST DATA
  // =========================================================

  const product1: any = {
    id: 1,
    title: 'Laptop',
    category: 'Electronics',
    price: 50000,
    image: 'laptop.jpg'
  };

  const product2: any = {
    id: 2,
    title: 'Mobile',
    category: 'Electronics',
    price: 20000,
    image: 'mobile.jpg'
  };

  const item1: CartItem = {
    product: product1,
    quantity: 2
  };

  const item2: CartItem = {
    product: product2,
    quantity: 1
  };


  // =========================================================
  // BEFORE EACH
  // =========================================================

  beforeEach(async () => {

    cmsContentService = {
      getCartContent: jest.fn().mockReturnValue(
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
        CommonModule,
        RouterTestingModule
      ],

      declarations: [
        CartComponent
      ],

      providers: [
        {
          provide: CmsContentService,
          useValue: cmsContentService
        }
      ]

    }).compileComponents();


    fixture = TestBed.createComponent(CartComponent);

    component = fixture.componentInstance;

    router = TestBed.inject(Router);

    jest
      .spyOn(router, 'navigate')
      .mockResolvedValue(true);
  });


  // =========================================================
  // BASIC
  // =========================================================

  it('should create', () => {

    expect(component).toBeTruthy();

  });


  // =========================================================
  // INIT
  // =========================================================

  it('should initialize component', () => {

    const addEventListenerSpy =
      jest.spyOn(window, 'addEventListener');

    const dispatchEventSpy =
      jest.spyOn(window, 'dispatchEvent');

    component.ngOnInit();

    expect(addEventListenerSpy)
      .toHaveBeenCalledWith(
        'cart-updated',
        component.handleCartUpdated
      );

    expect(cmsContentService.getCartContent)
      .toHaveBeenCalled();

    expect(dispatchEventSpy)
      .toHaveBeenCalled();

    expect(component.finalContent)
      .toBeTruthy();

  });


  // =========================================================
  // CMS CONTENT
  // =========================================================

  it('should load CMS content and build final content', () => {

    const cmsResponse = {
      content: [
        {
          screenContent: [
            {
              key: 'header',
              title: 'My Cart'
            }
          ]
        }
      ]
    };

    cmsContentService.getCartContent
      .mockReturnValue(of(cmsResponse));

    component.ngOnInit();

    expect(component.cartContent)
      .toEqual(cmsResponse);

    expect(component.finalContent)
      .toBeTruthy();

    expect(component.finalContent.header.title)
      .toBe('My Cart');

  });


  // =========================================================
  // FALLBACK - NO CMS SCREEN CONTENT
  // =========================================================

  it('should use complete fallback when CMS screenContent is missing', () => {

    component.cartContent = {};

    const result =
      component.revampFallback();

    expect(result)
      .toEqual(CART_FALLBACK);

    expect(result)
      .not.toBe(CART_FALLBACK);

  });


  it('should use fallback when screenContent is not an array', () => {

    component.cartContent = {
      content: [
        {
          screenContent: {}
        }
      ]
    };

    const result =
      component.revampFallback();

    expect(result)
      .toEqual(CART_FALLBACK);

  });


  // =========================================================
  // FALLBACK - CMS KEY CONVERSION
  // =========================================================

  it('should convert CMS key-based content into an object', () => {

    component.cartContent = {
      content: [
        {
          screenContent: [
            {
              key: 'header',
              title: 'Cart From CMS'
            }
          ]
        }
      ]
    };

    const result =
      component.revampFallback();

    expect(result.header.title)
      .toBe('Cart From CMS');

    expect(result.header.key)
      .toBeUndefined();

  });


  it('should ignore CMS sections with invalid keys', () => {

    component.cartContent = {
      content: [
        {
          screenContent: [
            {
              key: '',
              title: 'Invalid'
            },
            {
              key: null,
              title: 'Invalid'
            },
            {
              title: 'No Key'
            },
            {
              key: 'header',
              title: 'Valid'
            }
          ]
        }
      ]
    };

    const result =
      component.revampFallback();

    expect(result.header.title)
      .toBe('Valid');

  });


  // =========================================================
  // FALLBACK - MERGE LOGIC
  // =========================================================

  it('should return fallback when CMS data is null', () => {

    const result =
      (component as any).mergeFallback(
        null,
        {
          title: 'Fallback'
        }
      );

    expect(result)
      .toEqual({
        title: 'Fallback'
      });

  });


  it('should return fallback when CMS data is undefined', () => {

    const result =
      (component as any).mergeFallback(
        undefined,
        {
          title: 'Fallback'
        }
      );

    expect(result)
      .toEqual({
        title: 'Fallback'
      });

  });


  it('should use fallback for null primitive CMS value', () => {

    const result =
      (component as any).mergeFallback(
        null,
        'Fallback'
      );

    expect(result)
      .toBe('Fallback');

  });


  it('should use fallback for undefined primitive CMS value', () => {

    const result =
      (component as any).mergeFallback(
        undefined,
        'Fallback'
      );

    expect(result)
      .toBe('Fallback');

  });


  it('should use fallback for empty CMS string', () => {

    const result =
      (component as any).mergeFallback(
        '',
        'Fallback'
      );

    expect(result)
      .toBe('Fallback');

  });


  it('should return valid CMS primitive value', () => {

    const result =
      (component as any).mergeFallback(
        'CMS Value',
        'Fallback'
      );

    expect(result)
      .toBe('CMS Value');

  });


  // =========================================================
  // ARRAY FALLBACK
  // =========================================================

  it('should return fallback array when CMS array is missing', () => {

    const fallback = [
      'A',
      'B'
    ];

    const result =
      (component as any).mergeFallback(
        null,
        fallback
      );

    expect(result)
      .toEqual(fallback);

    expect(result)
      .not.toBe(fallback);

  });


  it('should return fallback array when CMS array is empty', () => {

    const fallback = [
      'A',
      'B'
    ];

    const result =
      (component as any).mergeFallback(
        [],
        fallback
      );

    expect(result)
      .toEqual(fallback);

  });


  it('should merge CMS array with fallback array', () => {

    const result =
      (component as any).mergeFallback(
        [
          'CMS A',
          'CMS B'
        ],
        [
          'Fallback A',
          'Fallback B'
        ]
      );

    expect(result)
      .toEqual([
        'CMS A',
        'CMS B'
      ]);

  });


  it('should keep CMS array item when fallback item does not exist', () => {

    const result =
      (component as any).mergeFallback(
        [
          'CMS A',
          'CMS B',
          'CMS C'
        ],
        [
          'Fallback A'
        ]
      );

    expect(result[0])
      .toBe('CMS A');

    expect(result[1])
      .toBe('CMS B');

    expect(result[2])
      .toBe('CMS C');

  });


  // =========================================================
  // CLONE FALLBACK
  // =========================================================

  it('should clone fallback array', () => {

    const original = [
      'A',
      'B'
    ];

    const result =
      (component as any).cloneFallback(original);

    expect(result)
      .toEqual(original);

    expect(result)
      .not.toBe(original);

  });


  it('should clone fallback object', () => {

    const original = {
      title: 'Cart',
      count: 2
    };

    const result =
      (component as any).cloneFallback(original);

    expect(result)
      .toEqual(original);

    expect(result)
      .not.toBe(original);

  });


  it('should return primitive value from cloneFallback', () => {

    const result =
      (component as any).cloneFallback('Test');

    expect(result)
      .toBe('Test');

  });


  // =========================================================
  // CART UPDATED EVENT
  // =========================================================

  it('should update cart items when cart-updated event is received', () => {

    component.ngOnInit();

    const event =
      new CustomEvent<CartItem[]>(
        'cart-updated',
        {
          detail: [
            item1,
            item2
          ]
        }
      );

    component.handleCartUpdated(event);

    expect(component.cartItems)
      .toEqual([
        item1,
        item2
      ]);

  });


  it('should ignore cart-updated event when detail is missing', () => {

    component.cartItems = [
      item1
    ];

    const event =
      new CustomEvent(
        'cart-updated'
      );

    component.handleCartUpdated(event);

    expect(component.cartItems)
      .toEqual([
        item1
      ]);

  });


  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  it('should increase item quantity', () => {

    component.cartItems = [
      item1,
      item2
    ];

    const dispatchEventSpy =
      jest.spyOn(window, 'dispatchEvent');

    component.increaseQuantity(item1);

    expect(component.cartItems[0].quantity)
      .toBe(3);

    expect(dispatchEventSpy)
      .toHaveBeenCalled();

    const event =
      dispatchEventSpy.mock.calls[0][0] as CustomEvent;

    expect(event.type)
      .toBe('cart-local-update');

    expect(event.detail[0].quantity)
      .toBe(3);

  });


  it('should do nothing when increasing unknown item', () => {

    component.cartItems = [
      item1
    ];

    const unknownItem: any = {
      product: {
        id: 999,
        title: 'Unknown',
        price: 100
      },
      quantity: 1
    };

    const dispatchEventSpy =
      jest.spyOn(window, 'dispatchEvent');

    component.increaseQuantity(unknownItem);

    expect(component.cartItems)
      .toEqual([
        item1
      ]);

    expect(dispatchEventSpy)
      .not.toHaveBeenCalled();

  });


  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  it('should decrease item quantity', () => {

    component.cartItems = [
      {
        ...item1,
        quantity: 3
      }
    ];

    const dispatchEventSpy =
      jest.spyOn(window, 'dispatchEvent');

    component.decreaseQuantity(
      component.cartItems[0]
    );

    expect(component.cartItems[0].quantity)
      .toBe(2);

    expect(dispatchEventSpy)
      .toHaveBeenCalled();

  });


  it('should remove item when decreasing quantity from one to zero', () => {

    component.cartItems = [
      item1,
      item2
    ];

    const removeSpy =
      jest.spyOn(component, 'removeItem');

    component.decreaseQuantity(item2);

    expect(removeSpy)
      .toHaveBeenCalledWith(
        item2.product.id
      );

  });


  it('should do nothing when decreasing unknown item', () => {

    component.cartItems = [
      item1
    ];

    const unknownItem: any = {
      product: {
        id: 999,
        title: 'Unknown',
        price: 100
      },
      quantity: 1
    };

    const dispatchEventSpy =
      jest.spyOn(window, 'dispatchEvent');

    component.decreaseQuantity(unknownItem);

    expect(component.cartItems)
      .toEqual([
        item1
      ]);

    expect(dispatchEventSpy)
      .not.toHaveBeenCalled();

  });


  // =========================================================
  // REMOVE ITEM
  // =========================================================

  it('should remove item from cart', () => {

    component.cartItems = [
      item1,
      item2
    ];

    const dispatchEventSpy =
      jest.spyOn(window, 'dispatchEvent');

    component.removeItem(item1.product.id);

    expect(component.cartItems)
      .toEqual([
        item2
      ]);

    expect(dispatchEventSpy)
      .toHaveBeenCalled();

    const event =
      dispatchEventSpy.mock.calls[0][0] as CustomEvent;

    expect(event.type)
      .toBe('cart-local-update');

    expect(event.detail)
      .toEqual([
        item2
      ]);

  });


  // =========================================================
  // ITEM TOTAL
  // =========================================================

  it('should calculate item total', () => {

    const result =
      component.getItemTotal(item1);

    expect(result)
      .toBe(100000);

  });


  // =========================================================
  // CART COUNT
  // =========================================================

  it('should calculate total cart quantity', () => {

    component.cartItems = [
      item1,
      item2
    ];

    expect(component.getCartCount())
      .toBe(3);

  });


  it('should return zero cart count for empty cart', () => {

    component.cartItems = [];

    expect(component.getCartCount())
      .toBe(0);

  });


  // =========================================================
  // CART TOTAL
  // =========================================================

  it('should calculate cart total', () => {

    component.cartItems = [
      item1,
      item2
    ];

    expect(component.getTotal())
      .toBe(120000);

  });


  it('should return zero total for empty cart', () => {

    component.cartItems = [];

    expect(component.getTotal())
      .toBe(0);

  });


  // =========================================================
  // BUY NOW
  // =========================================================

  it('should store selected item and navigate to checkout on Buy Now', () => {

    const sessionStorageSpy =
      jest.spyOn(
        Storage.prototype,
        'setItem'
      );

    component.buyNow(item1);

    expect(sessionStorageSpy)
      .toHaveBeenCalledWith(
        'minishop_buy_now_item',
        JSON.stringify(item1)
      );

    expect(router.navigate)
      .toHaveBeenCalledWith([
        '/checkout'
      ]);

  });


  // =========================================================
  // CHECKOUT
  // =========================================================

  it('should remove Buy Now item and navigate to checkout', () => {

    sessionStorage.setItem(
      'minishop_buy_now_item',
      JSON.stringify(item1)
    );

    const removeItemSpy =
      jest.spyOn(
        Storage.prototype,
        'removeItem'
      );

    component.goToCheckout();

    expect(removeItemSpy)
      .toHaveBeenCalledWith(
        'minishop_buy_now_item'
      );

    expect(
      sessionStorage.getItem(
        'minishop_buy_now_item'
      )
    )
      .toBeNull();

    expect(router.navigate)
      .toHaveBeenCalledWith([
        '/checkout'
      ]);

  });


  // =========================================================
  // DESTROY
  // =========================================================

  it('should remove cart-updated event listener on destroy', () => {

    const removeEventListenerSpy =
      jest.spyOn(
        window,
        'removeEventListener'
      );

    component.ngOnInit();

    component.ngOnDestroy();

    expect(removeEventListenerSpy)
      .toHaveBeenCalledWith(
        'cart-updated',
        component.handleCartUpdated
      );

  });

});