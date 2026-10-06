import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../services/auth.service';
import { CartStateService } from '../services/cart-state.service';
import { OrderService } from '../services/order.service';

describe('ProfileComponent', () => {

  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  let authServiceMock: {
    isLoggedIn: jest.Mock;
    getCurrentUserEmail: jest.Mock;
    getCurrentUser: jest.Mock;
    checkPassword: jest.Mock;
    changePassword: jest.Mock;
    logout: jest.Mock;
  };

  let routerMock: {
    navigate: jest.Mock;
  };

  let cartStateServiceMock: {
    cart$: any;
  };

  let orderServiceMock: {
    getOrders: jest.Mock;
  };


  beforeEach(async () => {

    authServiceMock = {
      isLoggedIn: jest.fn(),
      getCurrentUserEmail: jest.fn(),
      getCurrentUser: jest.fn(),
      checkPassword: jest.fn(),
      changePassword: jest.fn(),
      logout: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    cartStateServiceMock = {
      cart$: of([])
    };

    orderServiceMock = {
      getOrders: jest.fn().mockReturnValue([])
    };


    await TestBed.configureTestingModule({
      declarations: [
        ProfileComponent
      ],
      imports: [
        ReactiveFormsModule
      ],
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
          provide: CartStateService,
          useValue: cartStateServiceMock
        },
        {
          provide: OrderService,
          useValue: orderServiceMock
        }
      ]
    })
      .overrideTemplate(ProfileComponent, '')
      .compileComponents();


    fixture =
      TestBed.createComponent(ProfileComponent);

    component =
      fixture.componentInstance;

  });


  afterEach(() => {

    localStorage.clear();
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

  it('should have default profile data', () => {

    expect(component.profile.name)
      .toBe('Harshada Darekar');

    expect(component.profile.email)
      .toBe('harshada@example.com');

  });


  it('should have default address data', () => {

    expect(component.address.type)
      .toBe('Home');

    expect(component.address.details)
      .toBe('Pune, Maharashtra');

  });


  // =========================================================
  // NG ON INIT - NOT LOGGED IN
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
            returnUrl: '/profile'
          }
        }
      );

  });


  // =========================================================
  // NG ON INIT - LOGGED IN
  // =========================================================

  it('should initialize forms and load account data when logged in', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Test User',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    orderServiceMock.getOrders
      .mockReturnValue([
        { id: 'ORD001' },
        { id: 'ORD002' }
      ]);

    cartStateServiceMock.cart$ =
      of([
        {
          product: {
            id: 1
          },
          quantity: 2
        },
        {
          product: {
            id: 2
          },
          quantity: 3
        }
      ]);

    component.ngOnInit();

    expect(component.profileForm)
      .toBeTruthy();

    expect(component.addressForm)
      .toBeTruthy();

    expect(component.passwordForm)
      .toBeTruthy();

    expect(component.totalOrders)
      .toBe(2);

    expect(component.cartItemCount)
      .toBe(5);

  });


  // =========================================================
  // PROFILE FORM
  // =========================================================

  it('should create profile form with required controls', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Test User',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    component.ngOnInit();

    expect(component.profileForm.contains('name'))
      .toBe(true);

    expect(component.profileForm.contains('email'))
      .toBe(true);

    expect(component.profileForm.contains('phone'))
      .toBe(true);

    expect(component.profileForm.contains('location'))
      .toBe(true);

  });


  it('should validate profile form', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Test User',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    component.ngOnInit();

    expect(component.profileForm.invalid)
      .toBe(true);

    component.profileForm.setValue({
      name: 'Harshada Darekar',
      email: 'harshada@gmail.com',
      phone: '9876543210',
      location: 'Pune'
    });

    expect(component.profileForm.valid)
      .toBe(true);

  });


  // =========================================================
  // PASSWORD VALIDATOR
  // =========================================================

  it('should return null when passwords match', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.passwordForm.patchValue({
      newPassword: 'Password@123',
      confirmPassword: 'Password@123'
    });

    expect(
      component.passwordForm.hasError('passwordMismatch')
    ).toBe(false);

  });


  it('should return passwordMismatch when passwords do not match', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.passwordForm.patchValue({
      newPassword: 'Password@123',
      confirmPassword: 'Password@456'
    });

    expect(
      component.passwordForm.hasError('passwordMismatch')
    ).toBe(true);

  });


  // =========================================================
  // PROFILE LOAD
  // =========================================================

  it('should load profile from current user on first login', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('TEST@GMAIL.COM');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'John Doe',
        email: 'john@gmail.com',
        mobile: '9876543210'
      });

    component.ngOnInit();

    expect(component.profile.name)
      .toBe('John Doe');

    expect(component.profile.email)
      .toBe('john@gmail.com');

    expect(component.profile.phone)
      .toBe('+91 9876543210');

  });


  it('should load saved profile from localStorage', () => {

    const savedProfile = {
      name: 'Saved User',
      email: 'saved@gmail.com',
      phone: '+91 9123456789',
      location: 'Mumbai'
    };

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('saved@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Original User',
        email: 'saved@gmail.com',
        mobile: '9123456789'
      });

    localStorage.setItem(
      'minishop_profile_saved@gmail.com',
      JSON.stringify(savedProfile)
    );

    component.ngOnInit();

    expect(component.profile)
      .toEqual(savedProfile);

  });


  it('should handle invalid saved profile JSON', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Test User',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    localStorage.setItem(
      'minishop_profile_test@gmail.com',
      'invalid-json'
    );

    const consoleSpy =
      jest.spyOn(console, 'error').mockImplementation();

    component.ngOnInit();

    expect(consoleSpy)
      .toHaveBeenCalled();

    consoleSpy.mockRestore();

  });


  // =========================================================
  // PROFILE EDIT
  // =========================================================

  it('should open profile edit mode', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Test User',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    component.ngOnInit();

    component.openEditProfile();

    expect(component.isEditingProfile)
      .toBe(true);

    expect(component.profileForm.value.name)
      .toBe(component.profile.name);

  });


  it('should cancel profile editing', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.isEditingProfile = true;

    component.cancelEditProfile();

    expect(component.isEditingProfile)
      .toBe(false);

  });


  it('should save valid profile', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Old Name',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    component.ngOnInit();

    component.profileForm.setValue({
      name: 'New Name',
      email: 'new@gmail.com',
      phone: '9123456789',
      location: 'Mumbai'
    });

    component.isEditingProfile = true;

    component.saveProfile();

    expect(component.profile.name)
      .toBe('New Name');

    expect(component.profile.email)
      .toBe('new@gmail.com');

    expect(component.profile.phone)
      .toBe('+91 9123456789');

    expect(component.profile.location)
      .toBe('Mumbai');

    expect(
      localStorage.getItem(
        'minishop_profile_test@gmail.com'
      )
    ).toBeTruthy();

    expect(component.isEditingProfile)
      .toBe(false);

  });


  it('should not save invalid profile', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.saveProfile();

    expect(component.isEditingProfile)
      .toBe(false);

  });


  // =========================================================
  // ADDRESS
  // =========================================================

  it('should load saved address', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Test User',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    localStorage.setItem(
      'minishop_address_test@gmail.com',
      JSON.stringify({
        type: 'Office',
        details: 'Mumbai Office'
      })
    );

    component.ngOnInit();

    expect(component.address.type)
      .toBe('Office');

    expect(component.address.details)
      .toBe('Mumbai Office');

  });


  it('should handle invalid saved address JSON', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Test',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    localStorage.setItem(
      'minishop_address_test@gmail.com',
      'invalid-json'
    );

    const consoleSpy =
      jest.spyOn(console, 'error').mockImplementation();

    component.ngOnInit();

    expect(consoleSpy)
      .toHaveBeenCalled();

    consoleSpy.mockRestore();

  });


  it('should open address edit mode', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.openManageAddress();

    expect(component.isEditingAddress)
      .toBe(true);

    expect(component.addressForm.value.type)
      .toBe(component.address.type);

  });


  it('should cancel address editing', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.isEditingAddress = true;

    component.cancelManageAddress();

    expect(component.isEditingAddress)
      .toBe(false);

  });


  it('should save valid address', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    component.ngOnInit();

    component.addressForm.setValue({
      type: 'Office',
      details: 'Mumbai Office'
    });

    component.saveAddress();

    expect(component.address.type)
      .toBe('Office');

    expect(component.address.details)
      .toBe('Mumbai Office');

    expect(
      localStorage.getItem(
        'minishop_address_test@gmail.com'
      )
    ).toBeTruthy();

    expect(component.isEditingAddress)
      .toBe(false);

  });


  it('should not save invalid address', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.saveAddress();

    expect(component.address.type)
      .toBe('Home');

  });


  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  it('should open change password mode', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.openChangePassword();

    expect(component.isChangingPassword)
      .toBe(true);

    expect(component.passwordMessage)
      .toBe('');

    expect(component.passwordError)
      .toBe('');

  });


  it('should cancel change password', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.isChangingPassword = true;
    component.passwordMessage = 'Test';
    component.passwordError = 'Error';

    component.cancelChangePassword();

    expect(component.isChangingPassword)
      .toBe(false);

    expect(component.passwordMessage)
      .toBe('');

    expect(component.passwordError)
      .toBe('');

  });


  it('should not change password when form is invalid', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.changePassword();

    expect(
      authServiceMock.checkPassword
    ).not.toHaveBeenCalled();

  });


  it('should show error when current password is incorrect', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.passwordForm.setValue({
      currentPassword: 'OldPassword@123',
      newPassword: 'NewPassword@123',
      confirmPassword: 'NewPassword@123'
    });

    authServiceMock.checkPassword
      .mockReturnValue(false);

    component.changePassword();

    expect(component.passwordError)
      .toBe('Current password is incorrect.');

    expect(authServiceMock.changePassword)
      .not.toHaveBeenCalled();

  });


  it('should show error when new password is same as current password', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.passwordForm.setValue({
      currentPassword: 'Password@123',
      newPassword: 'Password@123',
      confirmPassword: 'Password@123'
    });

    authServiceMock.checkPassword
      .mockReturnValue(true);

    component.changePassword();

    expect(component.passwordError)
      .toBe(
        'New password must be different from current password.'
      );

    expect(authServiceMock.changePassword)
      .not.toHaveBeenCalled();

  });


  it('should change password successfully', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    component.ngOnInit();

    component.passwordForm.setValue({
      currentPassword: 'OldPassword@123',
      newPassword: 'NewPassword@123',
      confirmPassword: 'NewPassword@123'
    });

    authServiceMock.checkPassword
      .mockReturnValue(true);

    component.changePassword();

    expect(
      authServiceMock.checkPassword
    ).toHaveBeenCalledWith(
      'OldPassword@123'
    );

    expect(
      authServiceMock.changePassword
    ).toHaveBeenCalledWith(
      'NewPassword@123'
    );

    expect(component.passwordMessage)
      .toBe('Password updated successfully.');

  });


  // =========================================================
  // ACCOUNT OVERVIEW
  // =========================================================

  it('should calculate total orders and cart item count', () => {

    authServiceMock.isLoggedIn
      .mockReturnValue(true);

    authServiceMock.getCurrentUserEmail
      .mockReturnValue('test@gmail.com');

    authServiceMock.getCurrentUser
      .mockReturnValue({
        name: 'Test',
        email: 'test@gmail.com',
        mobile: '9876543210'
      });

    orderServiceMock.getOrders
      .mockReturnValue([
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ]);

    cartStateServiceMock.cart$ =
      of([
        {
          quantity: 2
        },
        {
          quantity: 4
        }
      ]);

    component.ngOnInit();

    expect(component.totalOrders)
      .toBe(3);

    expect(component.cartItemCount)
      .toBe(6);

  });


  // =========================================================
  // NAVIGATION
  // =========================================================

  it('should navigate to orders', () => {

    component.goToOrders();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/orders']
      );

  });


  it('should navigate to cart', () => {

    component.goToCart();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/cart']
      );

  });


  // =========================================================
  // LOGOUT
  // =========================================================

  it('should logout and navigate to home', () => {

    component.logout();

    expect(authServiceMock.logout)
      .toHaveBeenCalled();

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(
        ['/']
      );

  });

});