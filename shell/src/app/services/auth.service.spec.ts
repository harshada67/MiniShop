import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {

  let service: AuthService;

  beforeEach(() => {

    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService
      ]
    });

    service = TestBed.inject(AuthService);

  });


  afterEach(() => {

    localStorage.clear();
    jest.clearAllMocks();

  });


  // =========================================================
  // CREATE SERVICE
  // =========================================================

  it('should create', () => {

    expect(service).toBeTruthy();

  });


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  it('should create default password on first initialization', () => {

    expect(
      localStorage.getItem('minishop_password')
    ).toBe('MiniShop@123');

  });


  it('should not overwrite existing password', () => {

    localStorage.setItem(
      'minishop_password',
      'Existing@123'
    );

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthService
      ]
    });

    const newService =
      TestBed.inject(AuthService);

    expect(
      localStorage.getItem('minishop_password')
    ).toBe('Existing@123');

    expect(newService).toBeTruthy();

  });


  // =========================================================
  // DEMO ACCOUNT LOGIN
  // =========================================================

  it('should login successfully with demo account', () => {

    const result =
      service.login(
        'user@minishop.com',
        'MiniShop@123'
      );

    expect(result).toBe(true);

    expect(
      localStorage.getItem('minishop_logged_in')
    ).toBe('true');

    expect(
      localStorage.getItem('minishop_current_user')
    ).toBe('user@minishop.com');

  });


  it('should login demo account with uppercase email', () => {

    const result =
      service.login(
        'USER@MINISHOP.COM',
        'MiniShop@123'
      );

    expect(result).toBe(true);

    expect(
      localStorage.getItem('minishop_current_user')
    ).toBe('user@minishop.com');

  });


  it('should trim email before login', () => {

    const result =
      service.login(
        '  user@minishop.com  ',
        'MiniShop@123'
      );

    expect(result).toBe(true);

  });


  it('should reject demo account with incorrect password', () => {

    const result =
      service.login(
        'user@minishop.com',
        'WrongPassword'
      );

    expect(result).toBe(false);

  });


  // =========================================================
  // REGISTERED USER LOGIN
  // =========================================================

  it('should login successfully with registered user', () => {

    const users = [
      {
        name: 'Harshada Darekar',
        email: 'harshada@gmail.com',
        mobile: '9876543210',
        password: 'Password@123'
      }
    ];

    localStorage.setItem(
      'minishop_users',
      JSON.stringify(users)
    );

    const result =
      service.login(
        'harshada@gmail.com',
        'Password@123'
      );

    expect(result).toBe(true);

    expect(
      localStorage.getItem('minishop_logged_in')
    ).toBe('true');

    expect(
      localStorage.getItem('minishop_current_user')
    ).toBe('harshada@gmail.com');

  });


  it('should login registered user with uppercase email', () => {

    const users = [
      {
        name: 'Harshada Darekar',
        email: 'Harshada@Gmail.com',
        mobile: '9876543210',
        password: 'Password@123'
      }
    ];

    localStorage.setItem(
      'minishop_users',
      JSON.stringify(users)
    );

    const result =
      service.login(
        'HARSHADA@GMAIL.COM',
        'Password@123'
      );

    expect(result).toBe(true);

  });


  it('should reject registered user with incorrect password', () => {

    const users = [
      {
        name: 'Test User',
        email: 'test@gmail.com',
        mobile: '9876543210',
        password: 'Password@123'
      }
    ];

    localStorage.setItem(
      'minishop_users',
      JSON.stringify(users)
    );

    const result =
      service.login(
        'test@gmail.com',
        'WrongPassword'
      );

    expect(result).toBe(false);

  });


  it('should return false when user does not exist', () => {

    const result =
      service.login(
        'unknown@gmail.com',
        'Password@123'
      );

    expect(result).toBe(false);

  });


  // =========================================================
  // INVALID USERS JSON
  // =========================================================

  it('should return false when registered users JSON is invalid', () => {

    localStorage.setItem(
      'minishop_users',
      'invalid-json'
    );

    const consoleSpy =
      jest.spyOn(console, 'error').mockImplementation();

    const result =
      service.login(
        'test@gmail.com',
        'Password@123'
      );

    expect(result).toBe(false);

    expect(consoleSpy)
      .toHaveBeenCalled();

    consoleSpy.mockRestore();

  });


  // =========================================================
  // LOGIN EVENT
  // =========================================================

  it('should dispatch auth-user-changed event after successful demo login', () => {

    const dispatchSpy =
      jest.spyOn(window, 'dispatchEvent');

    service.login(
      'user@minishop.com',
      'MiniShop@123'
    );

    expect(dispatchSpy)
      .toHaveBeenCalled();

    expect(
      dispatchSpy.mock.calls[0][0]
    ).toBeInstanceOf(Event);

    dispatchSpy.mockRestore();

  });


  it('should dispatch auth-user-changed event after successful registered user login', () => {

    localStorage.setItem(
      'minishop_users',
      JSON.stringify([
        {
          name: 'Test User',
          email: 'test@gmail.com',
          mobile: '9876543210',
          password: 'Password@123'
        }
      ])
    );

    const dispatchSpy =
      jest.spyOn(window, 'dispatchEvent');

    service.login(
      'test@gmail.com',
      'Password@123'
    );

    expect(dispatchSpy)
      .toHaveBeenCalled();

    dispatchSpy.mockRestore();

  });


  // =========================================================
  // LOGOUT
  // =========================================================

  it('should logout current user', () => {

    localStorage.setItem(
      'minishop_logged_in',
      'true'
    );

    localStorage.setItem(
      'minishop_current_user',
      'test@gmail.com'
    );

    service.logout();

    expect(
      localStorage.getItem('minishop_logged_in')
    ).toBeNull();

    expect(
      localStorage.getItem('minishop_current_user')
    ).toBeNull();

  });


  it('should dispatch event after logout', () => {

    const dispatchSpy =
      jest.spyOn(window, 'dispatchEvent');

    service.logout();

    expect(dispatchSpy)
      .toHaveBeenCalled();

    dispatchSpy.mockRestore();

  });


  // =========================================================
  // IS LOGGED IN
  // =========================================================

  it('should return true when user is logged in', () => {

    localStorage.setItem(
      'minishop_logged_in',
      'true'
    );

    expect(
      service.isLoggedIn()
    ).toBe(true);

  });


  it('should return false when user is not logged in', () => {

    expect(
      service.isLoggedIn()
    ).toBe(false);

  });


  it('should return false when login value is not true', () => {

    localStorage.setItem(
      'minishop_logged_in',
      'false'
    );

    expect(
      service.isLoggedIn()
    ).toBe(false);

  });


  // =========================================================
  // CHECK PASSWORD - DEMO USER
  // =========================================================

  it('should validate demo user password', () => {

    localStorage.setItem(
      'minishop_current_user',
      'user@minishop.com'
    );

    expect(
      service.checkPassword('MiniShop@123')
    ).toBe(true);

  });


  it('should reject incorrect demo user password', () => {

    localStorage.setItem(
      'minishop_current_user',
      'user@minishop.com'
    );

    expect(
      service.checkPassword('WrongPassword')
    ).toBe(false);

  });


  it('should check default password when current user is not set', () => {

    localStorage.removeItem(
      'minishop_current_user'
    );

    expect(
      service.checkPassword('MiniShop@123')
    ).toBe(true);

  });


  // =========================================================
  // CHECK PASSWORD - REGISTERED USER
  // =========================================================

  it('should validate registered user password', () => {

    localStorage.setItem(
      'minishop_current_user',
      'test@gmail.com'
    );

    localStorage.setItem(
      'minishop_users',
      JSON.stringify([
        {
          name: 'Test User',
          email: 'test@gmail.com',
          mobile: '9876543210',
          password: 'Password@123'
        }
      ])
    );

    expect(
      service.checkPassword('Password@123')
    ).toBe(true);

  });


  it('should reject incorrect registered user password', () => {

    localStorage.setItem(
      'minishop_current_user',
      'test@gmail.com'
    );

    localStorage.setItem(
      'minishop_users',
      JSON.stringify([
        {
          name: 'Test User',
          email: 'test@gmail.com',
          mobile: '9876543210',
          password: 'Password@123'
        }
      ])
    );

    expect(
      service.checkPassword('WrongPassword')
    ).toBe(false);

  });


  it('should return false when registered current user does not exist', () => {

    localStorage.setItem(
      'minishop_current_user',
      'unknown@gmail.com'
    );

    localStorage.setItem(
      'minishop_users',
      JSON.stringify([])
    );

    expect(
      service.checkPassword('Password@123')
    ).toBe(false);

  });


  // =========================================================
  // CHANGE PASSWORD - DEMO USER
  // =========================================================

  it('should change password for demo user', () => {

    localStorage.setItem(
      'minishop_current_user',
      'user@minishop.com'
    );

    service.changePassword(
      'NewPassword@123'
    );

    expect(
      localStorage.getItem('minishop_password')
    ).toBe('NewPassword@123');

  });


  it('should change password for demo user when no current user exists', () => {

    localStorage.removeItem(
      'minishop_current_user'
    );

    service.changePassword(
      'NewPassword@123'
    );

    expect(
      localStorage.getItem('minishop_password')
    ).toBe('NewPassword@123');

  });


  // =========================================================
  // CHANGE PASSWORD - REGISTERED USER
  // =========================================================

  it('should change password for registered user', () => {

    const users = [
      {
        name: 'Test User',
        email: 'test@gmail.com',
        mobile: '9876543210',
        password: 'OldPassword@123'
      }
    ];

    localStorage.setItem(
      'minishop_current_user',
      'test@gmail.com'
    );

    localStorage.setItem(
      'minishop_users',
      JSON.stringify(users)
    );

    service.changePassword(
      'NewPassword@123'
    );

    const updatedUsers =
      JSON.parse(
        localStorage.getItem('minishop_users') || '[]'
      );

    expect(
      updatedUsers[0].password
    ).toBe('NewPassword@123');

  });


  it('should not change password when registered user is not found', () => {

    localStorage.setItem(
      'minishop_current_user',
      'unknown@gmail.com'
    );

    localStorage.setItem(
      'minishop_users',
      JSON.stringify([])
    );

    service.changePassword(
      'NewPassword@123'
    );

    expect(
      localStorage.getItem('minishop_users')
    ).toEqual(
      JSON.stringify([])
    );

  });


  // =========================================================
  // GET CURRENT USER EMAIL
  // =========================================================

  it('should return current user email', () => {

    localStorage.setItem(
      'minishop_current_user',
      'test@gmail.com'
    );

    expect(
      service.getCurrentUserEmail()
    ).toBe('test@gmail.com');

  });


  it('should return null when current user email does not exist', () => {

    expect(
      service.getCurrentUserEmail()
    ).toBeNull();

  });


  // =========================================================
  // GET CURRENT USER - NO USER
  // =========================================================

  it('should return null when no current user exists', () => {

    expect(
      service.getCurrentUser()
    ).toBeNull();

  });


  // =========================================================
  // GET CURRENT USER - DEMO USER
  // =========================================================

  it('should return demo user details', () => {

    localStorage.setItem(
      'minishop_current_user',
      'user@minishop.com'
    );

    const user =
      service.getCurrentUser();

    expect(user)
      .toEqual({
        name: 'MiniShop User',
        email: 'user@minishop.com',
        mobile: '',
        password: 'MiniShop@123'
      });

  });


  it('should return demo user with fallback password', () => {

    localStorage.setItem(
      'minishop_current_user',
      'user@minishop.com'
    );

    localStorage.removeItem(
      'minishop_password'
    );

    const user =
      service.getCurrentUser();

    expect(user?.password)
      .toBe('MiniShop@123');

  });


  // =========================================================
  // GET CURRENT USER - REGISTERED USER
  // =========================================================

  it('should return registered user details', () => {

    const user = {
      name: 'Harshada Darekar',
      email: 'harshada@gmail.com',
      mobile: '9876543210',
      password: 'Password@123'
    };

    localStorage.setItem(
      'minishop_current_user',
      'harshada@gmail.com'
    );

    localStorage.setItem(
      'minishop_users',
      JSON.stringify([user])
    );

    expect(
      service.getCurrentUser()
    ).toEqual(user);

  });


  it('should return null when registered current user is not found', () => {

    localStorage.setItem(
      'minishop_current_user',
      'unknown@gmail.com'
    );

    localStorage.setItem(
      'minishop_users',
      JSON.stringify([])
    );

    expect(
      service.getCurrentUser()
    ).toBeNull();

  });

});