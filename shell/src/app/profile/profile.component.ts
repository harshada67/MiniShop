import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { CartStateService } from '../services/cart-state.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  /* =====================================================
     PROFILE
     ===================================================== */

  profile = {
    name: 'Harshada Darekar',
    email: 'harshada@example.com',
    phone: '+91 98765 43210',
    location: 'Pune, Maharashtra'
  };

  profileForm!: FormGroup;
  isEditingProfile = false;


  /* =====================================================
     ADDRESS
     ===================================================== */

  address = {
    type: 'Home',
    details: 'Pune, Maharashtra'
  };

  addressForm!: FormGroup;
  isEditingAddress = false;


  /* =====================================================
     PASSWORD
     ===================================================== */

  passwordForm!: FormGroup;

  isChangingPassword = false;

  passwordMessage = '';
  passwordError = '';


  /* =====================================================
     ACCOUNT OVERVIEW
     ===================================================== */

  totalOrders = 0;
  cartItemCount = 0;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cartStateService: CartStateService,
    private orderService: OrderService
  ) {}


  ngOnInit(): void {
    /* ===================================================
       LOGIN CHECK
       =================================================== */

    if (!this.authService.isLoggedIn()) {

      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/profile'
        }
      });

      return;
    }


    /* ===================================================
       CREATE FORMS
       =================================================== */

    this.createProfileForm();
    this.createAddressForm();
    this.createPasswordForm();


    /* ===================================================
       LOAD DATA
       =================================================== */

    this.loadProfile();
    this.loadAddress();
    this.loadAccountOverview();

  }


  /* =====================================================
     PROFILE FORM
     ===================================================== */

  private createProfileForm(): void {

    this.profileForm = this.fb.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(
            /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/
          )
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/)
        ]
      ],

      location: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100)
        ]
      ]

    });

  }


  /* =====================================================
     ADDRESS FORM
     ===================================================== */

  private createAddressForm(): void {

    this.addressForm = this.fb.group({

      type: [
        '',
        Validators.required
      ],

      details: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(150)
        ]
      ]

    });

  }


  /* =====================================================
     PASSWORD FORM
     ===================================================== */

  private createPasswordForm(): void {

    this.passwordForm = this.fb.group(

      {

        currentPassword: [
          '',
          Validators.required
        ],

        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/
            )
          ]
        ],

        confirmPassword: [
          '',
          Validators.required
        ]

      },

      {
        validators: this.passwordMatchValidator
      }

    );

  }


  /* =====================================================
     PASSWORD MATCH VALIDATOR
     ===================================================== */

  passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const newPassword =
      control.get('newPassword')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;


    if (
      newPassword &&
      confirmPassword &&
      newPassword !== confirmPassword
    ) {

      return {
        passwordMismatch: true
      };

    }

    return null;

  }

  

  /* =====================================================
     USER-SPECIFIC STORAGE KEYS
     ===================================================== */

  private getCurrentUserKey(): string | null {

    const email =
      this.authService.getCurrentUserEmail();

    if (!email) {
      return null;
    }

    return email.trim().toLowerCase();

  }


  private getProfileStorageKey(): string | null {

    const userKey =
      this.getCurrentUserKey();

    if (!userKey) {
      return null;
    }

    return `minishop_profile_${userKey}`;

  }


  private getAddressStorageKey(): string | null {

    const userKey =
      this.getCurrentUserKey();

    if (!userKey) {
      return null;
    }

    return `minishop_address_${userKey}`;

  }


  /* =====================================================
     LOAD PROFILE
     ===================================================== */

  private loadProfile(): void {

    const currentUser =
      this.authService.getCurrentUser();

    const profileKey =
      this.getProfileStorageKey();


    if (!currentUser || !profileKey) {
      return;
    }


    const savedProfile =
      localStorage.getItem(profileKey);


    /* =================================================
       FIRST LOGIN FOR THIS USER
       USE DATA FROM AUTH SERVICE
       ================================================= */

    if (!savedProfile) {

      this.profile = {
        ...this.profile,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.mobile
          ? '+91 ' + currentUser.mobile
          : '',
        location: this.profile.location
      };

      return;
    }


    /* =================================================
       EXISTING USER PROFILE
       ================================================= */

    try {

      this.profile = {
        ...this.profile,
        ...JSON.parse(savedProfile)
      };

    } catch (error) {

      console.error(
        'Failed to load profile:',
        error
      );

    }

  }


  /* =====================================================
     EDIT PROFILE
     ===================================================== */

  openEditProfile(): void {

    this.isEditingProfile = true;


    this.profileForm.patchValue({

      name: this.profile.name,

      email: this.profile.email,

      phone: this.profile.phone
        .replace('+91', '')
        .trim(),

      location: this.profile.location

    });


    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();

  }


  cancelEditProfile(): void {

    this.isEditingProfile = false;

    this.profileForm.reset();

  }


  saveProfile(): void {

    this.profileForm.markAllAsTouched();


    if (this.profileForm.invalid) {
      return;
    }


    const formValue =
      this.profileForm.getRawValue();


    this.profile = {

      name: formValue.name.trim(),

      email: formValue.email.trim(),

      phone: '+91 ' + formValue.phone.trim(),

      location: formValue.location.trim()

    };


    const profileKey =
      this.getProfileStorageKey();


    if (!profileKey) {
      return;
    }


    localStorage.setItem(
      profileKey,
      JSON.stringify(this.profile)
    );


    this.isEditingProfile = false;

    this.profileForm.reset();

  }


  /* =====================================================
     LOAD ADDRESS
     ===================================================== */

  private loadAddress(): void {

    const addressKey =
      this.getAddressStorageKey();


    if (!addressKey) {
      return;
    }


    const savedAddress =
      localStorage.getItem(addressKey);


    if (!savedAddress) {
      return;
    }


    try {

      this.address = {
        ...this.address,
        ...JSON.parse(savedAddress)
      };

    } catch (error) {

      console.error(
        'Failed to load address:',
        error
      );

    }

  }


  /* =====================================================
     EDIT ADDRESS
     ===================================================== */

  openManageAddress(): void {

    this.isEditingAddress = true;


    this.addressForm.patchValue({

      type: this.address.type,

      details: this.address.details

    });


    this.addressForm.markAsPristine();
    this.addressForm.markAsUntouched();

  }


  cancelManageAddress(): void {

    this.isEditingAddress = false;

    this.addressForm.reset();

  }


  saveAddress(): void {

    this.addressForm.markAllAsTouched();


    if (this.addressForm.invalid) {
      return;
    }


    const formValue =
      this.addressForm.getRawValue();


    this.address = {

      type: formValue.type,

      details: formValue.details.trim()

    };


    const addressKey =
      this.getAddressStorageKey();


    if (!addressKey) {
      return;
    }


    localStorage.setItem(
      addressKey,
      JSON.stringify(this.address)
    );


    this.isEditingAddress = false;

    this.addressForm.reset();

  }


  /* =====================================================
     CHANGE PASSWORD
     ===================================================== */

  openChangePassword(): void {

    this.isChangingPassword = true;

    this.passwordMessage = '';
    this.passwordError = '';

    this.passwordForm.reset();

    this.passwordForm.markAsPristine();
    this.passwordForm.markAsUntouched();

  }


  cancelChangePassword(): void {

    this.isChangingPassword = false;

    this.passwordMessage = '';
    this.passwordError = '';

    this.passwordForm.reset();

  }


  changePassword(): void {

    this.passwordMessage = '';
    this.passwordError = '';


    /* Mark all fields as touched */

    this.passwordForm.markAllAsTouched();


    /* Stop if validation fails */

    if (this.passwordForm.invalid) {
      return;
    }


    const formValue =
      this.passwordForm.getRawValue();


    /* =================================================
       CHECK CURRENT PASSWORD
       ================================================= */

    const currentPasswordValid =
      this.authService.checkPassword(
        formValue.currentPassword
      );


    if (!currentPasswordValid) {

      this.passwordError =
        'Current password is incorrect.';

      return;
    }


    /* =================================================
       CHECK NEW PASSWORD
       ================================================= */

    if (
      formValue.currentPassword ===
      formValue.newPassword
    ) {

      this.passwordError =
        'New password must be different from current password.';

      return;
    }


    /* =================================================
       CHANGE PASSWORD

       AuthService.changePassword() returns void,
       so we do not check it using if (!changed).
       ================================================= */

    this.authService.changePassword(
      formValue.newPassword
    );


    /* =================================================
       SUCCESS
       ================================================= */

    this.passwordMessage =
      'Password updated successfully.';

    this.passwordForm.reset();

  }


  /* =====================================================
     ACCOUNT OVERVIEW
     ===================================================== */

  private loadAccountOverview(): void {

    /*
     * Your OrderService.getOrders()
     * returns Order[] directly.
     *
     * Therefore do NOT use .subscribe().
     */

    const orders =
      this.orderService.getOrders();


    this.totalOrders =
      orders.length;


    /*
     * CartStateService.cart$ is an Observable,
     * so subscribe() is correct here.
     */

    this.cartStateService.cart$
      .subscribe(cart => {

        this.cartItemCount =
          cart.reduce(
            (total, item) =>
              total + item.quantity,
            0
          );

      });

  }


  /* =====================================================
     NAVIGATION
     ===================================================== */

  goToOrders(): void {

    this.router.navigate(['/orders']);

  }


  goToCart(): void {

    this.router.navigate(['/cart']);

  }


  /* =====================================================
     LOGOUT
     ===================================================== */

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/']);

  }

}