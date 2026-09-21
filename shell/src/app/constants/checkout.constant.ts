export const CHECKOUT_FALLBACK: Record<string, any> = {

  'header': {
    title: 'Checkout  --const',
    description: 'Review your order and enter your delivery details.'
  },

  'delivery': {

    sectionTitle: '1. Delivery Address const',

    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter full name',

    mobileLabel: 'Mobile Number',
    mobilePlaceholder: 'Enter 10 digit mobile number',

    addressLabel: 'Address',
    addressPlaceholder: 'Enter your complete address',

    cityLabel: 'City',
    cityPlaceholder: 'City',

    stateLabel: 'State',
    statePlaceholder: 'State',

    pincodeLabel: 'Pincode',
    pincodePlaceholder: '6 digit pincode'
  },

  'payment': {

    sectionTitle: '2. Payment Method',

    cod: {
      title: 'Cash on Delivery',
      description: 'Pay when your order arrives.'
    },

    upi: {
      title: 'UPI',
      description: 'Pay using your UPI app.',
      upiIdLabel: 'UPI ID',
      upiIdPlaceholder: 'Enter your UPI ID',
      example: 'Example: name@upi'
    },

    card: {
      title: 'Credit / Debit Card',
      description: 'Pay securely using your card.',
      cardHolderNameLabel: 'Card Holder Name',
      cardHolderNamePlaceholder: 'Enter card holder name',
      cardNumberLabel: 'Card Number',
      cardNumberPlaceholder: 'Enter 16 digit card number',
      expiryDateLabel: 'Expiry Date',
      expiryDatePlaceholder: 'MM/YY',
      cvvLabel: 'CVV',
      cvvPlaceholder: '3 digit CVV'
    },

    requiredMessage: 'Please select a payment method.'
  },

  'summary': {

    sectionTitle: '3. Order Summary',

    currency: '₹',

    itemsLabel: 'Items',
    subtotalLabel: 'Subtotal',
    shippingLabel: 'Shipping',
    shippingValue: 'FREE',
    totalLabel: 'Total',

    placeOrderButton: 'Place Order →',
    backToCartButton: '← Back to Cart'
  },

  'emptyCart': {

    icon: '🛒',

    title: 'Your cart is empty',

    description:
      'Please add products before proceeding to checkout.',

    continueShoppingButton:
      'Continue Shopping →'
  },

  'validation': {

    fullNameRequired:
      'Full name is required.',

    fullNameMinLength:
      'Full name must be at least 3 characters.',

    fullNamePattern:
      'Please enter a valid name.',

    mobileRequired:
      'Mobile number is required.',

    mobilePattern:
      'Please enter a valid 10 digit mobile number.',

    addressRequired:
      'Address is required.',

    addressMinLength:
      'Please enter a complete address.',

    cityRequired:
      'City is required.',

    stateRequired:
      'State is required.',

    pincodeRequired:
      'Pincode is required.',

    pincodePattern:
      'Please enter a valid 6 digit pincode.',

    upiRequired:
      'UPI ID is required.',

    upiPattern:
      'Please enter a valid UPI ID.',

    cardHolderRequired:
      'Card holder name is required.',

    cardHolderMinLength:
      'Card holder name must be at least 3 characters.',

    cardHolderPattern:
      'Please enter a valid card holder name.',

    cardNumberRequired:
      'Card number is required.',

    cardNumberPattern:
      'Please enter a valid 16 digit card number.',

    expiryRequired:
      'Expiry date is required.',

    expiryPattern:
      'Enter expiry date in MM/YY format.',

    cvvRequired:
      'CVV is required.',

    cvvPattern:
      'Please enter a valid 3 digit CVV.'
  },

  'success': {

    icon: '🎉',

    title:
      'Order Placed Successfully!',

    description:
      'Thank you for shopping with MiniShop.',

    orderIdLabel:
      'Order ID',

    orderTotalLabel:
      'Order Total',

    confirmationMessage:
      '✓ Your order has been successfully placed.',

    continueShoppingButton:
      'Continue Shopping →'
  },

  'common': {

    requiredIcon: '*',

    multiplyIcon: '×'
  }

};