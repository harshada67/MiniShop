import { OrderService } from './order.service';
import { AuthService } from './auth.service';
import { Order } from '../models/order.model';

describe('OrderService', () => {

  let service: OrderService;

  let authServiceMock: {
    getCurrentUserEmail: jest.Mock;
    isLoggedIn: jest.Mock;
  };

 const mockOrder: Order = {
  id: 'ORD001',
  date: '2026-09-29',
  items: [],
  total: 1000,
  status: 'Placed',
  customer: {} as any,
  paymentMethod: 'UPI',
  subtotal: 900,
  shipping: 100
};

const mockOrder2: Order = {
  id: 'ORD002',
  date: '2026-09-28',
  items: [],
  total: 2000,
  status: 'Delivered',
  customer: {} as any,
  paymentMethod: 'Card',
  subtotal: 1900,
  shipping: 100
};

  beforeEach(() => {

    localStorage.clear();

    jest.clearAllMocks();

    authServiceMock = {
      getCurrentUserEmail: jest.fn(),
      isLoggedIn: jest.fn()
    };

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@example.com');

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    service = new OrderService(
      authServiceMock as unknown as AuthService
    );

  });


  afterEach(() => {

    localStorage.clear();

  });


  // =====================================================
  // SERVICE CREATION
  // =====================================================

  it('should create the service', () => {

    expect(service).toBeTruthy();

  });


  // =====================================================
  // INITIAL ORDERS
  // =====================================================

  it('should return empty orders when no orders are stored', () => {

    expect(service.getOrders()).toEqual([]);

  });


  // =====================================================
  // LOAD ORDERS FROM LOCAL STORAGE
  // =====================================================

  it('should load orders from localStorage', () => {

    const orders = [
      mockOrder,
      mockOrder2
    ];

    localStorage.setItem(
      'minishop_orders_test@example.com',
      JSON.stringify(orders)
    );

    service = new OrderService(
      authServiceMock as unknown as AuthService
    );

    expect(service.getOrders()).toEqual(orders);

  });


  // =====================================================
  // STORAGE KEY - TRIM + LOWERCASE
  // =====================================================

  it('should use trimmed and lowercase email for storage key', () => {

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('  TEST@EXAMPLE.COM  ');

    localStorage.setItem(
      'minishop_orders_test@example.com',
      JSON.stringify([mockOrder])
    );

    service = new OrderService(
      authServiceMock as unknown as AuthService
    );

    expect(service.getOrders()).toEqual([
      mockOrder
    ]);

  });


  // =====================================================
  // NO USER
  // =====================================================

  it('should return empty orders when there is no logged-in user', () => {

    authServiceMock.getCurrentUserEmail
      .mockReturnValue(null);

    service = new OrderService(
      authServiceMock as unknown as AuthService
    );

    expect(service.getOrders()).toEqual([]);

  });


  // =====================================================
  // ADD ORDER
  // =====================================================

  it('should add an order when user is logged in', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    service.addOrder(mockOrder);

    expect(service.getOrders()).toEqual([
      mockOrder
    ]);

  });


  // =====================================================
  // ADD MULTIPLE ORDERS
  // =====================================================

  it('should add the latest order at the beginning', () => {

    service.addOrder(mockOrder);

    service.addOrder(mockOrder2);

    expect(service.getOrders()).toEqual([
      mockOrder2,
      mockOrder
    ]);

  });


  // =====================================================
  // ADD ORDER - NOT LOGGED IN
  // =====================================================

  it('should not add order when user is not logged in', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(false);

    const consoleWarnSpy =
      jest.spyOn(console, 'warn')
        .mockImplementation(() => {});

    service.addOrder(mockOrder);

    expect(service.getOrders()).toEqual([]);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Cannot add order. User is not logged in.'
    );

    consoleWarnSpy.mockRestore();

  });


  // =====================================================
  // SAVE ORDER
  // =====================================================

  it('should save orders to localStorage', () => {

    service.addOrder(mockOrder);

    const savedOrders =
      localStorage.getItem(
        'minishop_orders_test@example.com'
      );

    expect(savedOrders).toBe(
      JSON.stringify([mockOrder])
    );

  });


  // =====================================================
  // SAVE WITHOUT USER
  // =====================================================

  it('should not save orders when user email is unavailable', () => {

    authServiceMock.getCurrentUserEmail
      .mockReturnValue(null);

    service = new OrderService(
      authServiceMock as unknown as AuthService
    );

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    const consoleWarnSpy =
      jest.spyOn(console, 'warn')
        .mockImplementation(() => {});

    service.addOrder(mockOrder);

    expect(service.getOrders()).toEqual([
      mockOrder
    ]);

    expect(localStorage.length).toBe(0);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Orders were not saved because no user is logged in.'
    );

    consoleWarnSpy.mockRestore();

  });


  // =====================================================
  // GET ORDERS
  // =====================================================

  it('should return a copy of orders', () => {

    service.addOrder(mockOrder);

    const orders = service.getOrders();

    orders.push(mockOrder2);

    expect(service.getOrders()).toEqual([
      mockOrder
    ]);

  });


  // =====================================================
  // GET ORDER BY ID
  // =====================================================

  it('should return order by id', () => {

    service.addOrder(mockOrder);

    const result =
      service.getOrderById('ORD001');

    expect(result).toEqual(mockOrder);

  });


  // =====================================================
  // GET ORDER BY INVALID ID
  // =====================================================

  it('should return undefined when order is not found', () => {

    service.addOrder(mockOrder);

    const result =
      service.getOrderById('INVALID');

    expect(result).toBeUndefined();

  });


  // =====================================================
  // ORDER COUNT
  // =====================================================

  it('should return correct order count', () => {

    expect(service.getOrderCount()).toBe(0);

    service.addOrder(mockOrder);

    expect(service.getOrderCount()).toBe(1);

    service.addOrder(mockOrder2);

    expect(service.getOrderCount()).toBe(2);

  });


  // =====================================================
  // ORDERS OBSERVABLE
  // =====================================================

  it('should emit orders through orders$', () => {

    const emittedOrders: Order[][] = [];

    const subscription =
      service.orders$.subscribe(orders => {

        emittedOrders.push(orders);

      });

    service.addOrder(mockOrder);

    expect(emittedOrders).toEqual([
      [],
      [mockOrder]
    ]);

    subscription.unsubscribe();

  });


  // =====================================================
  // AUTH USER CHANGED
  // =====================================================

  it('should reload orders when auth-user-changed event occurs', () => {

    const orders = [
      mockOrder,
      mockOrder2
    ];

    localStorage.setItem(
      'minishop_orders_test@example.com',
      JSON.stringify(orders)
    );

    window.dispatchEvent(
      new Event('auth-user-changed')
    );

    expect(service.getOrders()).toEqual(orders);

  });


  // =====================================================
  // INVALID JSON
  // =====================================================

  it('should return empty orders when stored JSON is invalid', () => {

    localStorage.setItem(
      'minishop_orders_test@example.com',
      'invalid-json'
    );

    const consoleErrorSpy =
      jest.spyOn(console, 'error')
        .mockImplementation(() => {});

    service = new OrderService(
      authServiceMock as unknown as AuthService
    );

    expect(service.getOrders()).toEqual([]);

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();

  });


  // =====================================================
  // STORED DATA IS NOT ARRAY
  // =====================================================

  it('should return empty orders when stored data is not an array', () => {

    localStorage.setItem(
      'minishop_orders_test@example.com',
      JSON.stringify({
        id: 'ORD001'
      })
    );

    const consoleErrorSpy =
      jest.spyOn(console, 'error')
        .mockImplementation(() => {});

    service = new OrderService(
      authServiceMock as unknown as AuthService
    );

    expect(service.getOrders()).toEqual([]);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Stored orders are not an array'
    );

    consoleErrorSpy.mockRestore();

  });


  // =====================================================
  // EMPTY STORAGE VALUE
  // =====================================================

  it('should return empty orders when stored value is empty', () => {

    localStorage.setItem(
      'minishop_orders_test@example.com',
      ''
    );

    service = new OrderService(
      authServiceMock as unknown as AuthService
    );

    expect(service.getOrders()).toEqual([]);

  });

});