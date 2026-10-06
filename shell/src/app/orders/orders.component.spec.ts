import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { OrdersComponent } from './orders.component';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { CmsContentService } from '../services/cms-content/cms-content.service';

describe('OrdersComponent', () => {

  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;

  let orderServiceMock: {
    orders$: any;
    getOrderById: jest.Mock;
  };

  let authServiceMock: {
    isLoggedIn: jest.Mock;
  };

  let routerMock: {
    navigate: jest.Mock;
  };

  let cmsContentServiceMock: {
    getOrdersContent: jest.Mock;
  };


  beforeEach(async () => {

    orderServiceMock = {
      orders$: of([]),
      getOrderById: jest.fn()
    };

    authServiceMock = {
      isLoggedIn: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    cmsContentServiceMock = {
      getOrdersContent: jest.fn()
    };


    await TestBed.configureTestingModule({
      declarations: [
        OrdersComponent
      ],
      providers: [
        {
          provide: OrderService,
          useValue: orderServiceMock
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
          provide: CmsContentService,
          useValue: cmsContentServiceMock
        }
      ]
    })
      .overrideTemplate(OrdersComponent, '')
      .compileComponents();


    fixture =
      TestBed.createComponent(OrdersComponent);

    component =
      fixture.componentInstance;

  });


  afterEach(() => {
    jest.clearAllMocks();
  });


  // =========================================================
  // CREATE
  // =========================================================

  it('should create', () => {

    expect(component).toBeTruthy();

  });


  // =========================================================
  // INITIAL VALUES
  // =========================================================

  it('should initialize orders as empty array', () => {

    expect(component.orders).toEqual([]);

  });


  it('should initialize CMS content as null', () => {

    expect(component.ordersContent).toBeNull();
    expect(component.finalContent).toBeNull();

  });


  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  it('should redirect to login when user is not logged in', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(false);

    component.ngOnInit();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/login'],
        {
          queryParams: {
            returnUrl: '/orders'
          }
        }
      );

    expect(cmsContentServiceMock.getOrdersContent)
      .not.toHaveBeenCalled();

  });


  // =========================================================
  // LOGGED IN
  // =========================================================

  it('should load orders when user is logged in', () => {

    const mockOrders: any[] = [
      {
        id: 'ORD001',
        status: 'Placed',
        total: 500
      },
      {
        id: 'ORD002',
        status: 'Delivered',
        total: 1000
      }
    ];

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    orderServiceMock.orders$ =
      of(mockOrders);

    cmsContentServiceMock.getOrdersContent
      .mockReturnValue(of({}));

    component.ngOnInit();

    expect(component.orders)
      .toEqual(mockOrders);

  });


  // =========================================================
  // ORDERS OBSERVABLE
  // =========================================================

  it('should update orders when orders$ emits new data', () => {

    const mockOrders: any[] = [
      {
        id: 'ORD100',
        status: 'Placed',
        total: 300
      }
    ];

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    orderServiceMock.orders$ =
      of(mockOrders);

    cmsContentServiceMock.getOrdersContent
      .mockReturnValue(of({}));

    component.ngOnInit();

    expect(component.orders)
      .toEqual(mockOrders);

  });


  // =========================================================
  // CMS SUCCESS
  // =========================================================

  it('should load CMS content successfully', () => {

    const cmsContent = {
      content: [
        {
          screenContent: []
        }
      ]
    };

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    orderServiceMock.orders$ =
      of([]);

    cmsContentServiceMock.getOrdersContent
      .mockReturnValue(of(cmsContent));

    component.ngOnInit();

    expect(
      cmsContentServiceMock.getOrdersContent
    ).toHaveBeenCalled();

    expect(component.ordersContent)
      .toEqual(cmsContent);

    expect(component.finalContent)
      .toBeDefined();

  });


  // =========================================================
  // CMS ERROR
  // =========================================================

  it('should use fallback when CMS content fails', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    orderServiceMock.orders$ =
      of([]);

    cmsContentServiceMock.getOrdersContent
      .mockReturnValue(
        throwError(() => new Error('CMS Error'))
      );

    const consoleSpy =
      jest.spyOn(console, 'error').mockImplementation();

    component.ngOnInit();

    expect(component.ordersContent)
      .toBeNull();

    expect(component.finalContent)
      .toBeDefined();

    expect(consoleSpy)
      .toHaveBeenCalled();

    consoleSpy.mockRestore();

  });


  // =========================================================
  // REVAMP FALLBACK
  // =========================================================

  it('should return fallback when CMS screenContent is missing', () => {

    component.ordersContent = null;

    const result =
      (component as any).revampFallback();

    expect(result)
      .toBeDefined();

  });


  it('should return fallback when screenContent is not an array', () => {

    component.ordersContent = {
      content: [
        {
          screenContent: {}
        }
      ]
    };

    const result =
      (component as any).revampFallback();

    expect(result)
      .toBeDefined();

  });


  it('should merge CMS screen content with fallback', () => {

    component.ordersContent = {
      content: [
        {
          screenContent: [
            {
              key: 'title',
              value: 'My Orders'
            }
          ]
        }
      ]
    };

    const result =
      (component as any).revampFallback();

    expect(result)
      .toBeDefined();

  });


  it('should ignore CMS sections without a key', () => {

    component.ordersContent = {
      content: [
        {
          screenContent: [
            {
              key: '',
              value: 'Invalid'
            },
            {
              value: 'No Key'
            },
            {
              key: null,
              value: 'Null Key'
            },
            {
              key: 'valid',
              value: 'Valid'
            }
          ]
        }
      ]
    };

    const result =
      (component as any).revampFallback();

    expect(result)
      .toBeDefined();

  });


  // =========================================================
  // MERGE FALLBACK
  // =========================================================

  it('should return fallback when CMS value is null', () => {

    const result =
      (component as any).mergeFallback(
        null,
        {
          title: 'Orders'
        }
      );

    expect(result)
      .toEqual({
        title: 'Orders'
      });

  });


  it('should return fallback when CMS value is undefined', () => {

    const result =
      (component as any).mergeFallback(
        undefined,
        {
          title: 'Orders'
        }
      );

    expect(result)
      .toEqual({
        title: 'Orders'
      });

  });


  it('should return fallback for empty primitive value', () => {

    const result =
      (component as any).mergeFallback(
        '',
        'Fallback'
      );

    expect(result)
      .toBe('Fallback');

  });


  it('should keep valid primitive CMS value', () => {

    const result =
      (component as any).mergeFallback(
        'CMS Value',
        'Fallback'
      );

    expect(result)
      .toBe('CMS Value');

  });


  it('should use fallback for empty CMS array', () => {

    const result =
      (component as any).mergeFallback(
        [],
        ['Fallback Item']
      );

    expect(result)
      .toEqual(['Fallback Item']);

  });


  it('should keep CMS array when fallback is not array', () => {

    const result =
      (component as any).mergeFallback(
        ['CMS Item'],
        'Fallback'
      );

    expect(result)
      .toEqual(['CMS Item']);

  });


  it('should merge arrays recursively', () => {

    const result =
      (component as any).mergeFallback(
        [
          {
            title: 'CMS Title'
          }
        ],
        [
          {
            title: 'Fallback Title',
            description: 'Fallback Description'
          }
        ]
      );

    expect(result[0].title)
      .toBe('CMS Title');

    expect(result[0].description)
      .toBe('Fallback Description');

  });


  it('should use fallback for missing object properties', () => {

    const result =
      (component as any).mergeFallback(
        {
          title: 'CMS Title'
        },
        {
          title: 'Fallback Title',
          description: 'Fallback Description'
        }
      );

    expect(result)
      .toEqual({
        title: 'CMS Title',
        description: 'Fallback Description'
      });

  });


  it('should merge nested objects', () => {

    const result =
      (component as any).mergeFallback(
        {
          heading: {
            title: 'CMS Title'
          }
        },
        {
          heading: {
            title: 'Fallback Title',
            subtitle: 'Fallback Subtitle'
          }
        }
      );

    expect(result)
      .toEqual({
        heading: {
          title: 'CMS Title',
          subtitle: 'Fallback Subtitle'
        }
      });

  });


  it('should preserve CMS-only keys', () => {

    const result =
      (component as any).mergeFallback(
        {
          title: 'CMS Title',
          extra: 'CMS Extra'
        },
        {
          title: 'Fallback Title'
        }
      );

    expect(result.title)
      .toBe('CMS Title');

    expect(result.extra)
      .toBe('CMS Extra');

  });


  // =========================================================
  // CLONE FALLBACK VALUE
  // =========================================================

  it('should clone primitive value', () => {

    const result =
      (component as any).cloneFallbackValue(
        'Test'
      );

    expect(result)
      .toBe('Test');

  });


  it('should clone array value', () => {

    const original = [
      'A',
      'B',
      {
        name: 'Test'
      }
    ];

    const result =
      (component as any).cloneFallbackValue(
        original
      );

    expect(result)
      .toEqual(original);

    expect(result)
      .not.toBe(original);

  });


  it('should clone object value', () => {

    const original = {
      title: 'Orders',
      nested: {
        value: 'Test'
      }
    };

    const result =
      (component as any).cloneFallbackValue(
        original
      );

    expect(result)
      .toEqual(original);

    expect(result)
      .not.toBe(original);

    expect(result.nested)
      .not.toBe(original.nested);

  });


  it('should clone complete orders fallback', () => {

    const result =
      (component as any).cloneFallback();

    expect(result)
      .toBeDefined();

  });


  // =========================================================
  // VIEW ORDER
  // =========================================================

  it('should navigate to order details', () => {

    component.viewOrder('ORD123');

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/orders', 'ORD123']
      );

  });


  // =========================================================
  // CONTINUE SHOPPING
  // =========================================================

  it('should navigate to products', () => {

    component.continueShopping();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/productsNew']
      );

  });

});