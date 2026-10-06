import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authServiceMock: {
    login: jest.Mock;
  };

  let routerMock: {
    navigateByUrl: jest.Mock;
  };

  let activatedRouteMock: any;

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn()
    };

    routerMock = {
      navigateByUrl: jest.fn()
    };

    activatedRouteMock = {
      snapshot: {
        queryParamMap: {
          get: jest.fn().mockReturnValue(null)
        }
      }
    };

    localStorage.clear();

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock
        }
      ]
    })
      .overrideTemplate(LoginComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // =========================================================
  // CREATE COMPONENT
  // =========================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // =========================================================
  // FORM CREATION
  // =========================================================

  it('should create login form', () => {
    expect(component.loginForm).toBeTruthy();

    expect(component.loginForm.contains('email')).toBe(true);
    expect(component.loginForm.contains('password')).toBe(true);
  });

  it('should create signup form', () => {
    expect(component.signupForm).toBeTruthy();

    expect(component.signupForm.contains('fullName')).toBe(true);
    expect(component.signupForm.contains('email')).toBe(true);
    expect(component.signupForm.contains('mobile')).toBe(true);
    expect(component.signupForm.contains('password')).toBe(true);
    expect(component.signupForm.contains('confirmPassword')).toBe(true);
  });

  // =========================================================
  // LOGIN FORM VALIDATION
  // =========================================================

  it('should make login form invalid when empty', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('should make login form valid with correct values', () => {
    component.loginForm.setValue({
      email: 'test@gmail.com',
      password: 'password123'
    });

    expect(component.loginForm.valid).toBe(true);
  });

  it('should validate email', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: 'password123'
    });

    expect(component.loginForm.invalid).toBe(true);
    expect(component.email?.hasError('email')).toBe(true);
  });

  it('should validate password minimum length', () => {
    component.loginForm.patchValue({
      email: 'test@gmail.com',
      password: '123'
    });

    expect(component.loginForm.invalid).toBe(true);
    expect(component.password?.hasError('minlength')).toBe(true);
  });

  // =========================================================
  // ngOnInit
  // =========================================================

  it('should set default returnUrl to /', () => {
    activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue(null);

    component.ngOnInit();

    expect(component.returnUrl).toBe('/');
  });

  it('should get returnUrl from query params', () => {
    activatedRouteMock.snapshot.queryParamMap.get
      .mockReturnValue('/checkout');

    component.ngOnInit();

    expect(component.returnUrl).toBe('/checkout');
  });

  it('should set checkout login content', () => {
    activatedRouteMock.snapshot.queryParamMap.get
      .mockReturnValue('/checkout');

    component.ngOnInit();

    expect(component.loginTitle)
      .toBe('Sign in to complete your purchase');

    expect(component.loginMessage)
      .toBe('Sign in to continue to checkout and place your order.');
  });

  it('should set profile login content', () => {
    activatedRouteMock.snapshot.queryParamMap.get
      .mockReturnValue('/profile');

    component.ngOnInit();

    expect(component.loginTitle)
      .toBe('Welcome back to MiniShop');

    expect(component.loginMessage)
      .toBe(
        'Sign in to access your profile and manage your account.'
      );
  });

  it('should set orders login content', () => {
    activatedRouteMock.snapshot.queryParamMap.get
      .mockReturnValue('/orders');

    component.ngOnInit();

    expect(component.loginTitle)
      .toBe('Sign in to view your orders');

    expect(component.loginMessage)
      .toBe(
        'Sign in to track your orders and view your order history.'
      );
  });

  it('should use default login content for unknown returnUrl', () => {
    activatedRouteMock.snapshot.queryParamMap.get
      .mockReturnValue('/unknown');

    component.ngOnInit();

    expect(component.loginTitle)
      .toBe('Welcome back to MiniShop');

    expect(component.loginMessage)
      .toBe(
        'Sign in for a faster and more personalized shopping experience.'
      );
  });

  // =========================================================
  // SHOW SIGNUP
  // =========================================================

  it('should switch to signup mode', () => {
    component.submitted = true;
    component.signupError = 'Old error';
    component.signupSuccess = 'Old success';

    component.showSignup();

    expect(component.isSignupMode).toBe(true);
    expect(component.signupSubmitted).toBe(false);
    expect(component.signupError).toBe('');
    expect(component.signupSuccess).toBe('');
  });

  // =========================================================
  // SHOW LOGIN
  // =========================================================

  it('should switch back to login mode', () => {
    component.isSignupMode = true;
    component.submitted = true;
    component.signupError = 'Signup error';
    component.signupSuccess = 'Signup success';

    component.showLogin();

    expect(component.isSignupMode).toBe(false);
    expect(component.submitted).toBe(false);
    expect(component.loginError).toBe('');
    expect(component.signupError).toBe('');
    expect(component.signupSuccess).toBe('');
  });

  // =========================================================
  // LOGIN
  // =========================================================

  it('should not login when login form is invalid', () => {
    component.login();

    expect(component.submitted).toBe(true);
    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should show error when credentials are invalid', () => {
    component.loginForm.setValue({
      email: 'TEST@GMAIL.COM',
      password: 'password123'
    });

    authServiceMock.login.mockReturnValue(false);

    component.login();

    expect(authServiceMock.login)
      .toHaveBeenCalledWith(
        'test@gmail.com',
        'password123'
      );

    expect(component.loginError)
      .toBe('Invalid email or password. Please try again.');

    expect(routerMock.navigateByUrl)
      .not.toHaveBeenCalled();
  });

  it('should login successfully and navigate to returnUrl', () => {
    component.returnUrl = '/checkout';

    component.loginForm.setValue({
      email: 'TEST@GMAIL.COM',
      password: 'password123'
    });

    authServiceMock.login.mockReturnValue(true);

    component.login();

    expect(authServiceMock.login)
      .toHaveBeenCalledWith(
        'test@gmail.com',
        'password123'
      );

    expect(routerMock.navigateByUrl)
      .toHaveBeenCalledWith('/checkout');
  });

  it('should trim email before login', () => {
    component.loginForm.setValue({
      email: '  TEST@GMAIL.COM  ',
      password: 'password123'
    });

    authServiceMock.login.mockReturnValue(true);

    component.login();

    expect(authServiceMock.login)
      .toHaveBeenCalledWith(
        'test@gmail.com',
        'password123'
      );
  });

  // =========================================================
  // SIGNUP VALIDATION
  // =========================================================

  it('should make signup form invalid when empty', () => {
    expect(component.signupForm.invalid).toBe(true);
  });

  it('should make signup form valid with correct values', () => {
    component.signupForm.setValue({
      fullName: 'Harshada Darekar',
      email: 'harshada@gmail.com',
      mobile: '9876543210',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });

    expect(component.signupForm.valid).toBe(true);
  });

  it('should validate mobile number', () => {
    component.signupForm.patchValue({
      fullName: 'Harshada Darekar',
      email: 'test@gmail.com',
      mobile: '1234567890',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });

    expect(component.signupForm.invalid).toBe(true);
    expect(component.mobile?.hasError('pattern')).toBe(true);
  });

  it('should validate strong password', () => {
    component.signupForm.patchValue({
      fullName: 'Harshada Darekar',
      email: 'test@gmail.com',
      mobile: '9876543210',
      password: 'password123',
      confirmPassword: 'password123'
    });

    expect(component.signupForm.invalid).toBe(true);
    expect(component.signupPassword?.hasError('pattern')).toBe(true);
  });

  // =========================================================
  // PASSWORD MATCH
  // =========================================================

  it('should return null when passwords match', () => {
    component.signupForm.patchValue({
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });

    expect(component.signupForm.hasError('passwordMismatch'))
      .toBe(false);
  });

  it('should return passwordMismatch when passwords do not match', () => {
    component.signupForm.patchValue({
      password: 'Password@123',
      confirmPassword: 'Password@456'
    });

    expect(component.signupForm.hasError('passwordMismatch'))
      .toBe(true);
  });

  it('should return null when password or confirm password is empty', () => {
    component.signupForm.patchValue({
      password: '',
      confirmPassword: ''
    });

    expect(component.signupForm.hasError('passwordMismatch'))
      .toBe(false);
  });

  // =========================================================
  // SIGNUP
  // =========================================================

  it('should not signup when signup form is invalid', () => {
    component.signup();

    expect(component.signupSubmitted).toBe(true);
    expect(component.signupError).toBe('');
  });

  it('should create a new user successfully', () => {
    jest.useFakeTimers();

    component.signupForm.setValue({
      fullName: 'Harshada Darekar',
      email: 'Harshada@Gmail.com',
      mobile: '9876543210',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });

    component.signup();

    const users = JSON.parse(
      localStorage.getItem('minishop_users') || '[]'
    );

    expect(users).toHaveLength(1);

    expect(users[0]).toEqual({
      name: 'Harshada Darekar',
      email: 'harshada@gmail.com',
      mobile: '9876543210',
      password: 'Password@123'
    });

    expect(component.signupSuccess)
      .toBe('Account created successfully. Please sign in.');

    expect(component.signupForm.value.fullName)
      .toBe(null);

    jest.advanceTimersByTime(1500);

    expect(component.isSignupMode).toBe(false);
    expect(component.loginForm.value.email)
      .toBe('harshada@gmail.com');

    expect(component.signupSuccess).toBe('');
  });

  it('should show duplicate email error', () => {
    localStorage.setItem(
      'minishop_users',
      JSON.stringify([
        {
          name: 'Existing User',
          email: 'test@gmail.com',
          mobile: '9876543210',
          password: 'Password@123'
        }
      ])
    );

    component.signupForm.setValue({
      fullName: 'Harshada Darekar',
      email: 'TEST@GMAIL.COM',
      mobile: '9123456789',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });

    component.signup();

    expect(component.signupError)
      .toBe('An account with this email already exists.');
  });

  it('should read existing users from localStorage', () => {
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
      (component as any).getRegisteredUsers();

    expect(result).toEqual(users);
  });

  it('should return empty array when no users exist', () => {
    const result =
      (component as any).getRegisteredUsers();

    expect(result).toEqual([]);
  });

  it('should return empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem(
      'minishop_users',
      'invalid-json'
    );

    const consoleSpy =
      jest.spyOn(console, 'error').mockImplementation();

    const result =
      (component as any).getRegisteredUsers();

    expect(result).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  // =========================================================
  // GETTERS
  // =========================================================

  it('should return login email control', () => {
    expect(component.email)
      .toBe(component.loginForm.get('email'));
  });

  it('should return login password control', () => {
    expect(component.password)
      .toBe(component.loginForm.get('password'));
  });

  it('should return signup fullName control', () => {
    expect(component.fullName)
      .toBe(component.signupForm.get('fullName'));
  });

  it('should return signup email control', () => {
    expect(component.signupEmail)
      .toBe(component.signupForm.get('email'));
  });

  it('should return signup mobile control', () => {
    expect(component.mobile)
      .toBe(component.signupForm.get('mobile'));
  });

  it('should return signup password control', () => {
    expect(component.signupPassword)
      .toBe(component.signupForm.get('password'));
  });

  it('should return confirm password control', () => {
    expect(component.confirmPassword)
      .toBe(component.signupForm.get('confirmPassword'));
  });
});