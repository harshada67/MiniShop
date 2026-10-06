import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { OrderDetailsComponent } from './order-details.component';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';

describe('OrderDetailsComponent', () => {
  let component: OrderDetailsComponent;
  let fixture: ComponentFixture<OrderDetailsComponent>;

  let authServiceMock: {
    isLoggedIn: jest.Mock;
  };

  let orderServiceMock: {
    getOrderById: jest.Mock;
  };

  let routerMock: {
    navigate: jest.Mock;
  };

  let activatedRouteMock: any;

  beforeEach(async () => {

    authServiceMock = {
      isLoggedIn: jest.fn()
    };

    orderServiceMock = {
      getOrderById: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn()
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [
        OrderDetailsComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        },
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
        }
      ]
    })
      .overrideTemplate(OrderDetailsComponent, '')
      .compileComponents();

    fixture =
      TestBed.createComponent(OrderDetailsComponent);

    component =
      fixture.componentInstance;

  });


  // =========================================================
  // CREATE COMPONENT
  // =========================================================

  it('should create', () => {

    expect(component).toBeTruthy();

  });


  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  it('should redirect to login with order URL when user is not logged in and order id exists', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(false);

    activatedRouteMock.snapshot.paramMap.get
      .mockReturnValue('ORD123');

    component.ngOnInit();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/login'],
        {
          queryParams: {
            returnUrl: '/orders/ORD123'
          }
        }
      );

    expect(orderServiceMock.getOrderById)
      .not.toHaveBeenCalled();

  });


  it('should redirect to login with /orders when user is not logged in and order id does not exist', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(false);

    activatedRouteMock.snapshot.paramMap.get
      .mockReturnValue(null);

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

    expect(orderServiceMock.getOrderById)
      .not.toHaveBeenCalled();

  });


  // =========================================================
  // LOGGED IN - NO ORDER ID
  // =========================================================

  it('should navigate to orders when logged in but order id is missing', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    activatedRouteMock.snapshot.paramMap.get
      .mockReturnValue(null);

    component.ngOnInit();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/orders']);

    expect(orderServiceMock.getOrderById)
      .not.toHaveBeenCalled();

  });


  // =========================================================
  // ORDER FOUND
  // =========================================================

  it('should load order when logged in and order id exists', () => {

    const mockOrder: any = {
      id: 'ORD123',
      status: 'Placed',
      items: [],
      total: 100
    };

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    activatedRouteMock.snapshot.paramMap.get
      .mockReturnValue('ORD123');

    orderServiceMock.getOrderById
      .mockReturnValue(mockOrder);

    component.ngOnInit();

    expect(orderServiceMock.getOrderById)
      .toHaveBeenCalledWith('ORD123');

    expect(component.order)
      .toEqual(mockOrder);

    expect(routerMock.navigate)
      .not.toHaveBeenCalled();

  });


  // =========================================================
  // ORDER NOT FOUND
  // =========================================================

  it('should navigate to orders when order is not found', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    activatedRouteMock.snapshot.paramMap.get
      .mockReturnValue('ORD999');

    orderServiceMock.getOrderById
      .mockReturnValue(undefined);

    component.ngOnInit();

    expect(orderServiceMock.getOrderById)
      .toHaveBeenCalledWith('ORD999');

    expect(component.order)
      .toBeUndefined();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/orders']);

  });


  // =========================================================
  // GO TO ORDERS
  // =========================================================

  it('should navigate to orders', () => {

    component.goToOrders();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/orders']);

  });


  // =========================================================
  // CONTINUE SHOPPING
  // =========================================================

  it('should navigate to products when continueShopping is called', () => {

    component.continueShopping();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/productsNew']);

  });

});