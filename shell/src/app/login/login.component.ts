import {
  Component,
  OnInit
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // ==========================================
  // LOGIN FORM
  // ==========================================

  loginForm: FormGroup;


  // ==========================================
  // SIGNUP FORM
  // ==========================================

  signupForm: FormGroup;


  // ==========================================
  // UI STATE
  // ==========================================

  isSignupMode = false;

  submitted = false;

  signupSubmitted = false;


  // ==========================================
  // ERROR / SUCCESS MESSAGES
  // ==========================================

  loginError = '';

  signupError = '';

  signupSuccess = '';


  // ==========================================
  // RETURN URL
  // ==========================================

  returnUrl = '/';


  // ==========================================
  // LOGIN PAGE CONTENT
  // ==========================================

  loginTitle =
    'Welcome back to MiniShop';

  loginMessage =
    'Sign in for a faster and more personalized shopping experience.';


  constructor(
    private fb: FormBuilder,

    private authService: AuthService,

    private router: Router,

    private activatedRoute: ActivatedRoute
  ) {

    // ========================================
    // LOGIN FORM
    // ========================================

    this.loginForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]

    });


    // ========================================
    // SIGNUP FORM
    // ========================================

    this.signupForm = this.fb.group({

      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(
            /^[a-zA-Z]+(?:\s+[a-zA-Z]+)*$/
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

      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[6-9][0-9]{9}$/
          )
        ]
      ],

      password: [
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
        [
          Validators.required
        ]
      ]

    }, {
      validators: this.passwordMatchValidator
    });

  }


  // ==========================================
  // ON INIT
  // ==========================================

  ngOnInit(): void {

    // Get page from which user came

    this.returnUrl =
      this.activatedRoute.snapshot
        .queryParamMap
        .get('returnUrl') || '/';


    this.setLoginContent();

  }


  // ==========================================
  // SET LOGIN PAGE CONTENT
  // ==========================================

  private setLoginContent(): void {

    switch (this.returnUrl) {

      case '/checkout':

        this.loginTitle =
          'Sign in to complete your purchase';

        this.loginMessage =
          'Sign in to continue to checkout and place your order.';

        break;


      case '/profile':

        this.loginTitle =
          'Welcome back to MiniShop';

        this.loginMessage =
          'Sign in to access your profile and manage your account.';

        break;


      case '/orders':

        this.loginTitle =
          'Sign in to view your orders';

        this.loginMessage =
          'Sign in to track your orders and view your order history.';

        break;


      default:

        this.loginTitle =
          'Welcome back to MiniShop';

        this.loginMessage =
          'Sign in for a faster and more personalized shopping experience.';

        break;

    }

  }


  // ==========================================
  // SHOW SIGNUP
  // ==========================================

  showSignup(): void {

    this.isSignupMode = true;

    this.signupSubmitted = false;

    this.signupError = '';

    this.signupSuccess = '';

    this.signupForm.reset();

  }


  // ==========================================
  // SHOW LOGIN
  // ==========================================

  showLogin(): void {

    this.isSignupMode = false;

    this.submitted = false;

    this.loginError = '';

    this.signupError = '';

    this.signupSuccess = '';

    this.signupForm.reset();

  }


  // ==========================================
  // LOGIN
  // ==========================================

  login(): void {

    this.submitted = true;

    this.loginError = '';


    // Validate login form

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;

    }


    const email =
      this.loginForm.value.email
        .trim()
        .toLowerCase();

    const password =
      this.loginForm.value.password;


    // ========================================
    // AUTH SERVICE LOGIN
    // ========================================

    const isLoggedIn =
      this.authService.login(
        email,
        password
      );


    if (!isLoggedIn) {

      this.loginError =
        'Invalid email or password. Please try again.';

      return;

    }


    console.log(
      'Login successful'
    );

    console.log(
      'Redirecting to:',
      this.returnUrl
    );


    // ========================================
    // RETURN TO ORIGINAL PAGE
    // ========================================

    this.router.navigateByUrl(
      this.returnUrl
    );

  }


  // ==========================================
  // SIGNUP / CREATE ACCOUNT
  // ==========================================

  signup(): void {

    this.signupSubmitted = true;

    this.signupError = '';

    this.signupSuccess = '';


    // ========================================
    // VALIDATE FORM
    // ========================================

    if (this.signupForm.invalid) {

      this.signupForm.markAllAsTouched();

      return;

    }


    const formValue =
      this.signupForm.getRawValue();


    const name =
      formValue.fullName
        .trim();

    const email =
      formValue.email
        .trim()
        .toLowerCase();

    const mobile =
      formValue.mobile
        .trim();

    const password =
      formValue.password;


    // ========================================
    // GET EXISTING USERS
    // ========================================

    const users =
      this.getRegisteredUsers();


    // ========================================
    // CHECK DUPLICATE EMAIL
    // ========================================

    const existingUser =
      users.find(
        user =>
          user.email.toLowerCase() === email
      );


    if (existingUser) {

      this.signupError =
        'An account with this email already exists.';

      return;

    }


    // ========================================
    // CREATE NEW USER
    // ========================================

    const newUser = {

      name: name,

      email: email,

      mobile: mobile,

      password: password

    };


    users.push(newUser);


    // ========================================
    // SAVE USER
    // ========================================

    localStorage.setItem(
      'minishop_users',
      JSON.stringify(users)
    );


    // ========================================
    // SUCCESS
    // ========================================

    this.signupSuccess =
      'Account created successfully. Please sign in.';


    console.log(
      'New user created:',
      {
        name,
        email,
        mobile
      }
    );


    // ========================================
    // CLEAR SIGNUP FORM
    // ========================================

    this.signupForm.reset();

    this.signupSubmitted = false;


    // ========================================
    // GO BACK TO LOGIN
    // ========================================

    setTimeout(() => {

      this.isSignupMode = false;

      this.loginForm.patchValue({
        email: email
      });

      this.signupSuccess = '';

    }, 1500);

  }


  // ==========================================
  // GET REGISTERED USERS
  // ==========================================

  private getRegisteredUsers(): any[] {

    const users =
      localStorage.getItem(
        'minishop_users'
      );


    if (!users) {

      return [];

    }


    try {

      return JSON.parse(users);

    } catch (error) {

      console.error(
        'Unable to read registered users',
        error
      );

      return [];

    }

  }


  // ==========================================
  // PASSWORD MATCH VALIDATOR
  // ==========================================

  passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {

    const password =
      control.get('password')?.value;

    const confirmPassword =
      control.get('confirmPassword')?.value;


    if (
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {

      return {
        passwordMismatch: true
      };

    }


    return null;

  }


  // ==========================================
  // LOGIN FORM GETTERS
  // ==========================================

  get email() {

    return this.loginForm.get('email');

  }


  get password() {

    return this.loginForm.get('password');

  }


  // ==========================================
  // SIGNUP FORM GETTERS
  // ==========================================

  get fullName() {

    return this.signupForm.get('fullName');

  }


  get signupEmail() {

    return this.signupForm.get('email');

  }


  get mobile() {

    return this.signupForm.get('mobile');

  }


  get signupPassword() {

    return this.signupForm.get('password');

  }


  get confirmPassword() {

    return this.signupForm.get('confirmPassword');

  }

}