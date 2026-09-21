import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Product } from '../models/product.model';
import { CmsContentService } from '../services/cms-content/cms-content.service';
import { PRODUCTS_FALLBACK } from '../constants/products.constant';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  // Products displayed in UI
  products: Product[] = [];

  // Complete product list
  allProducts: Product[] = [];

  // Raw CMS response
  productsContent: any = null;

  // Final CMS + fallback content
  finalContent: any = null;

  // Search text coming from Shell
  searchText = '';

  // Cart success message
  cartMessage = '';

  constructor(
    private cmsContentService: CmsContentService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadProductsContent();
  }

  // ==========================================
  // LOAD PRODUCTS FROM CMS
  // ==========================================

  private loadProductsContent(): void {

    this.cmsContentService
      .getProductsContent()
      .subscribe(response => {

        console.log(
          'Products CMS Response:',
          response
        );

        // Store raw CMS response
        this.productsContent = response;

        // Build final CMS + fallback content
        this.finalContent =
          this.revampFallback();

        console.log(
          'Products Final Content:',
          this.finalContent
        );

        // Get products from final content
        this.allProducts =
          this.finalContent?.['products']?.['items'] || [];

        // Display all products initially
        this.products = [
          ...this.allProducts
        ];

        console.log(
          'Products loaded:',
          this.allProducts
        );

        // Listen to Shell search
        this.listenToSearch();
      });
  }

  // ==========================================
  // READ SEARCH FROM SHELL
  // ==========================================

  private listenToSearch(): void {

    this.activatedRoute.queryParamMap
      .subscribe(params => {

        this.searchText =
          (
            params.get('search') || ''
          ).trim();

        console.log(
          'Search text from Shell:',
          this.searchText
        );

        this.filterProducts();
      });
  }

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  private filterProducts(): void {

    // No search text
    // Show all products

    if (!this.searchText) {

      this.products = [
        ...this.allProducts
      ];

      return;
    }

    const search =
      this.searchText.toLowerCase();

    // Search by product title

    this.products =
      this.allProducts.filter(product =>

        product.title
          .toLowerCase()
          .includes(search)

      );

    console.log(
      'Filtered products:',
      this.products
    );
  }

  // ==========================================
  // CMS + FALLBACK
  // ==========================================

  revampFallback(): any {

    /*
     * Step 1:
     * Extract screenContent from CMS response.
     *
     * Expected CMS structure:
     *
     * response
     *   → content[]
     *      → screenContent[]
     */

    const screenContent =
      this.productsContent?.['content']?.[0]?.['screenContent'];

    /*
     * Step 2:
     * If CMS response/content/screenContent
     * is missing or invalid, use complete fallback.
     */

    if (!Array.isArray(screenContent)) {

      console.log(
        'CMS screenContent missing → Using complete fallback'
      );

      return PRODUCTS_FALLBACK;
    }

    /*
     * Step 3:
     * Convert key-based CMS content into
     * an object matching PRODUCTS_FALLBACK.
     *
     * Example:
     *
     * [
     *   {
     *     key: 'header',
     *     title: 'Products'
     *   }
     * ]
     *
     * becomes:
     *
     * {
     *   header: {
     *     title: 'Products'
     *   }
     * }
     */

    const cmsData: any = {};

    screenContent.forEach((section: any) => {

      const key =
        section?.['key'];

      // Ignore invalid section
      if (
        key === null ||
        key === undefined ||
        key === ''
      ) {
        return;
      }

      const sectionData: any = {
        ...section
      };

      // Remove key because fallback
      // structure doesn't contain it
      delete sectionData.key;

      cmsData[key] = sectionData;
    });

    console.log(
      'CMS Key-Based Content:',
      cmsData
    );

    /*
     * Step 4:
     * Recursively merge CMS data
     * with fallback data.
     */

    return this.mergeFallback(
      cmsData,
      PRODUCTS_FALLBACK
    );
  }

  // ==========================================
  // RECURSIVE FALLBACK
  // ==========================================

  private mergeFallback(
    cmsData: any,
    fallbackData: any
  ): any {

    // ------------------------------------------
    // CMS completely missing
    // ------------------------------------------

    if (
      cmsData === null ||
      cmsData === undefined
    ) {

      return this.cloneFallback(
        fallbackData
      );
    }

    // ------------------------------------------
    // Primitive fallback value
    // ------------------------------------------

    if (
      typeof fallbackData !== 'object' ||
      fallbackData === null
    ) {

      /*
       * CMS invalid values:
       *
       * undefined
       * null
       * empty string
       *
       * → fallback
       */

      if (
        cmsData === undefined ||
        cmsData === null ||
        cmsData === ''
      ) {

        return fallbackData;
      }

      // Valid CMS value
      return cmsData;
    }

    // ------------------------------------------
    // Array fallback
    // ------------------------------------------

    if (Array.isArray(fallbackData)) {

      /*
       * If CMS value is not an array
       * or array is empty,
       * use fallback array.
       */

      if (
        !Array.isArray(cmsData) ||
        cmsData.length === 0
      ) {

        return [
          ...fallbackData
        ];
      }

      /*
       * For product arrays:
       *
       * CMS product exists
       * → merge each product with
       * corresponding fallback product.
       */

      return cmsData.map(
        (cmsItem: any, index: number) => {

          const fallbackItem =
            fallbackData[index];

          // No fallback item available
          if (
            fallbackItem === undefined
          ) {

            return cmsItem;
          }

          return this.mergeFallback(
            cmsItem,
            fallbackItem
          );
        }
      );
    }

    // ------------------------------------------
    // Object fallback
    // ------------------------------------------

    const result: any = {};

    Object.keys(fallbackData)
      .forEach(key => {

        const cmsValue =
          cmsData?.[key];

        const fallbackValue =
          fallbackData[key];

        // --------------------------------------
        // Missing / null / undefined / empty
        // --------------------------------------

        if (
          cmsValue === undefined ||
          cmsValue === null ||
          cmsValue === ''
        ) {

          result[key] =
            this.cloneFallback(
              fallbackValue
            );

          return;
        }

        // --------------------------------------
        // Nested object
        // --------------------------------------

        if (
          typeof fallbackValue === 'object' &&
          fallbackValue !== null &&
          !Array.isArray(fallbackValue)
        ) {

          result[key] =
            this.mergeFallback(
              cmsValue,
              fallbackValue
            );

          return;
        }

        // --------------------------------------
        // Array
        // --------------------------------------

        if (
          Array.isArray(fallbackValue)
        ) {

          result[key] =
            this.mergeFallback(
              cmsValue,
              fallbackValue
            );

          return;
        }

        // --------------------------------------
        // Valid CMS primitive
        // --------------------------------------

        result[key] =
          cmsValue;
      });

    return result;
  }

  // ==========================================
  // CLONE FALLBACK
  // ==========================================

  private cloneFallback(
    value: any
  ): any {

    if (
      Array.isArray(value)
    ) {

      return [
        ...value
      ];
    }

    if (
      value &&
      typeof value === 'object'
    ) {

      return {
        ...value
      };
    }

    return value;
  }

  // ==========================================
  // ADD TO CART
  // ==========================================

  addToCart(product: Product): void {

    window.dispatchEvent(
      new CustomEvent<Product>(
        'add-to-cart',
        {
          detail: product
        }
      )
    );

    this.cartMessage =
      `${product.title} added to cart`;

    setTimeout(() => {

      this.cartMessage = '';

    }, 2500);
  }

}