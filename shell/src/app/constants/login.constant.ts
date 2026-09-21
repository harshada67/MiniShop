export const LOGIN_FALLBACK: Record<string, any> = {
  brand: {
    icon: '🛍️',
    name: 'MiniShop'
  },

  login: {
    defaultTitle: 'Welcome back to MiniShop',
    defaultMessage: 'Sign in for a faster and more personalized shopping experience.',
    checkoutTitle: 'Sign in to complete your purchase',
    checkoutMessage: 'Sign in to continue to checkout and place your order.',
    profileTitle: 'Welcome back to MiniShop',
    profileMessage: 'Sign in to access your profile and manage your account.',
    ordersTitle: 'Sign in to view your orders',
    ordersMessage: 'Sign in to track your orders and view your order history.'
  },

  fields: {
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    mobileLabel: 'Mobile Number',
    mobilePlaceholder: 'Enter 10 digit mobile number',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password'
  },

  validation: {
    emailRequired: 'Email is required.',
    emailInvalid: 'Please enter a valid email address.',
    loginPasswordRequired: 'Password is required.',
    loginPasswordMinLength: 'Password must contain at least 6 characters.',
    fullNameRequired: 'Full name is required.',
    fullNameMinLength: 'Full name must contain at least 3 characters.',
    fullNameMaxLength: 'Full name cannot exceed 50 characters.',
    validName: 'Please enter a valid name.',
    mobileRequired: 'Mobile number is required.',
    mobileInvalid: 'Please enter a valid 10 digit mobile number.',
    signupPasswordRequired: 'Password is required.',
    signupPasswordMinLength: 'Password must contain at least 8 characters.',
    signupPasswordPattern: 'Password must contain uppercase, lowercase, number and special character.',
    confirmPasswordRequired: 'Please confirm your password.',
    passwordMismatch: 'Passwords do not match.'
  },

  actions: {
    loginButton: 'Sign In & Continue',
    signupPrompt: "Don't have an account?",
    createAccountButton: 'Create Account',
    signupTitle: 'Create your account',
    signupMessage: 'Join MiniShop for a faster and more personalized shopping experience.',
    alreadyAccountPrompt: 'Already have an account?',
    signInButton: 'Sign In'
  },

  messages: {
    loginErrorIcon: '⚠',
    signupErrorIcon: '⚠',
    signupSuccessIcon: '✓'
  },

  benefits: {
    trackOrdersIcon: '📦',
    trackOrdersText: 'Track your orders',
    fasterCheckoutIcon: '🛒',
    fasterCheckoutText: 'Faster checkout',
    manageAccountIcon: '👤',
    manageAccountText: 'Manage your account'
  },

  footer: {
    secureText: 'Secure shopping experience',
    separator: '•',
    copyright: '© MiniShop'
  }
};
