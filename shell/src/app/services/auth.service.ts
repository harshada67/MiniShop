import { Injectable } from '@angular/core';

interface MiniShopUser {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ==========================================
  // DEMO ACCOUNT
  // ==========================================

  private readonly validEmail =
    'user@minishop.com';

  private readonly passwordKey =
    'minishop_password';

  private readonly usersKey =
    'minishop_users';

  private readonly loginKey =
    'minishop_logged_in';


  constructor() {

    // ========================================
    // SET DEMO PASSWORD ONLY FIRST TIME
    // ========================================

    if (!localStorage.getItem(this.passwordKey)) {

      localStorage.setItem(
        this.passwordKey,
        'MiniShop@123'
      );

    }

  }


  // ==========================================
  // LOGIN
  // ==========================================

  login(
    email: string,
    password: string
  ): boolean {

    const normalizedEmail =
      email.trim().toLowerCase();


    // ========================================
    // 1. CHECK DEFAULT DEMO ACCOUNT
    // ========================================

    const savedPassword =
      localStorage.getItem(
        this.passwordKey
      );


    if (
      normalizedEmail ===
        this.validEmail &&
      password === savedPassword
    ) {

      localStorage.setItem(
        this.loginKey,
        'true'
      );

      // Store logged-in user's email
      localStorage.setItem(
        'minishop_current_user',
        normalizedEmail
      );

      // Notify Cart and Order services
      // that the current user has changed.
      window.dispatchEvent(
        new Event('auth-user-changed')
      );

      return true;
    }


    // ========================================
    // 2. CHECK REGISTERED USERS
    // ========================================

    const users =
      this.getRegisteredUsers();


    const user =
      users.find(
        registeredUser =>
          registeredUser.email
            .toLowerCase() ===
          normalizedEmail
      );


    // ========================================
    // 3. VALIDATE NEW USER
    // ========================================

    if (
      user &&
      user.password === password
    ) {

      localStorage.setItem(
        this.loginKey,
        'true'
      );

      // Store logged-in user's email
      localStorage.setItem(
        'minishop_current_user',
        normalizedEmail
      );

      // Notify Cart and Order services
      // that the current user has changed.
      window.dispatchEvent(
        new Event('auth-user-changed')
      );

      console.log(
        'Registered user login successful'
      );

      return true;
    }


    // ========================================
    // INVALID LOGIN
    // ========================================

    return false;
  }


  // ==========================================
  // GET REGISTERED USERS
  // ==========================================

  private getRegisteredUsers():
    MiniShopUser[] {

    const users =
      localStorage.getItem(
        this.usersKey
      );


    if (!users) {

      return [];

    }


    try {

      return JSON.parse(
        users
      ) as MiniShopUser[];

    } catch (error) {

      console.error(
        'Unable to read registered users',
        error
      );

      return [];

    }

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    localStorage.removeItem(
      this.loginKey
    );

    localStorage.removeItem(
      'minishop_current_user'
    );

    // Notify Cart and Order services
    // that the current user has changed.
    window.dispatchEvent(
      new Event('auth-user-changed')
    );

  }


  // ==========================================
  // CHECK LOGIN STATUS
  // ==========================================

  isLoggedIn(): boolean {

    return (
      localStorage.getItem(
        this.loginKey
      ) === 'true'
    );

  }


  // ==========================================
  // CHECK CURRENT PASSWORD
  // ==========================================

  checkPassword(
    password: string
  ): boolean {

    const currentUserEmail =
      localStorage.getItem(
        'minishop_current_user'
      );


    // ========================================
    // DEFAULT DEMO USER
    // ========================================

    if (
      !currentUserEmail ||
      currentUserEmail === this.validEmail
    ) {

      const savedPassword =
        localStorage.getItem(
          this.passwordKey
        );

      return password === savedPassword;
    }


    // ========================================
    // REGISTERED USER
    // ========================================

    const users =
      this.getRegisteredUsers();


    const user =
      users.find(
        registeredUser =>
          registeredUser.email
            .toLowerCase() ===
          currentUserEmail.toLowerCase()
      );


    return !!(
      user &&
      user.password === password
    );

  }


  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  changePassword(
    newPassword: string
  ): void {

    const currentUserEmail =
      localStorage.getItem(
        'minishop_current_user'
      );


    // ========================================
    // DEFAULT DEMO USER
    // ========================================

    if (
      !currentUserEmail ||
      currentUserEmail === this.validEmail
    ) {

      localStorage.setItem(
        this.passwordKey,
        newPassword
      );

      return;
    }


    // ========================================
    // REGISTERED USER
    // ========================================

    const users =
      this.getRegisteredUsers();


    const userIndex =
      users.findIndex(
        registeredUser =>
          registeredUser.email
            .toLowerCase() ===
          currentUserEmail.toLowerCase()
      );


    if (userIndex !== -1) {

      users[userIndex].password =
        newPassword;


      localStorage.setItem(
        this.usersKey,
        JSON.stringify(users)
      );

    }

  }


  // ==========================================
  // GET CURRENT USER EMAIL
  // ==========================================

  getCurrentUserEmail(): string | null {

    return localStorage.getItem(
      'minishop_current_user'
    );

  }


  // ==========================================
  // GET CURRENT USER
  // ==========================================

  getCurrentUser(): MiniShopUser | null {

    const currentUserEmail =
      this.getCurrentUserEmail();


    if (!currentUserEmail) {
      return null;
    }


    // ========================================
    // DEFAULT DEMO ACCOUNT
    // ========================================

    if (
      currentUserEmail ===
      this.validEmail
    ) {

      const password =
        localStorage.getItem(
          this.passwordKey
        ) || 'MiniShop@123';


      return {

        name: 'MiniShop User',

        email: this.validEmail,

        mobile: '',

        password

      };

    }


    // ========================================
    // REGISTERED USER
    // ========================================

    const users =
      this.getRegisteredUsers();


    return (
      users.find(
        user =>
          user.email.toLowerCase() ===
          currentUserEmail.toLowerCase()
      ) || null
    );

  }

}
