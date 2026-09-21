import { PRODUCTS } from '../models/products.data';

export const PRODUCTS_FALLBACK: Record<string, any> = {

  'header': {
    eyebrow: 'EXPLORE OUR COLLECTION',
    title: 'Products',
    description: 'Discover useful products for your everyday needs',
    searchPlaceholder: 'Search products...'
  },

  'cart': {
    message: 'added to cart'
  },

  'productsMeta': {
    productLabel: 'Products',
    collectionText: 'Discover our latest collection'
  },

  'noProducts': {
    title: 'No products found',
    message: 'No products match'
  },

  'products': {
    currency: '₹',
    addToCart: 'Add to Cart',
    items: PRODUCTS
  },
  'icons': {
    success: '✓',
    search: '🔍',
    cart: '🛒',
    rating: '★'
  }

};