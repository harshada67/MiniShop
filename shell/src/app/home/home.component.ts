import {
  Component,
  OnInit
} from '@angular/core';

import {
  CmsContentService
} from '../services/cms-content/cms-content.service';

import {
  HOME_FALLBACK
} from '../constants/home.constant';

import {
  Router
} from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // ==========================================
  // CMS CONTENT
  // ==========================================

  homeContent: any = null;

  finalContent: any = null;


  // ==========================================
  // CATEGORIES
  // ==========================================

  categories: any[] = [];


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private router: Router,

    private cmsContentService:
      CmsContentService
  ) {}


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.loadHomeContent();

  }


  // ==========================================
  // LOAD HOME CONTENT
  // ==========================================

  private loadHomeContent(): void {

    this.cmsContentService
      .getHomeContent()
      .subscribe(response => {

        // Store raw CMS response
        this.homeContent =
          response;


        // Build final CMS + fallback content
        this.finalContent =
          this.revampFallback();


        // Categories used by *ngFor
        this.categories =
          this.finalContent?.[
            'categories'
          ]?.[
            'items'
          ] || [];


        console.log(
          'Home CMS Response:',
          this.homeContent
        );


        console.log(
          'Home Final Content:',
          this.finalContent
        );

      });

  }


  // ==========================================
  // REVAMP FALLBACK
  // ==========================================

  revampFallback(): any {

    // ========================================
    // CMS RESPONSE NOT AVAILABLE
    // ========================================

    if (
      this.homeContent === null ||
      this.homeContent === undefined
    ) {

      return this.cloneFallback(
        HOME_FALLBACK
      );

    }


    // ========================================
    // EXTRACT SCREEN CONTENT
    // ========================================

    const screenContent =
      this.homeContent
        ?.content?.[0]
        ?.screenContent;


    // ========================================
    // SCREEN CONTENT NOT AVAILABLE
    // ========================================

    if (
      !Array.isArray(screenContent) ||
      screenContent.length === 0
    ) {

      return this.cloneFallback(
        HOME_FALLBACK
      );

    }


    // ========================================
    // CONVERT KEY-BASED CMS
    // INTO OBJECT
    // ========================================

    const cmsData: any = {};


    screenContent.forEach(
      (section: any) => {

        if (
          section &&
          section.key
        ) {

          const {
            key,
            ...sectionData
          } = section;


          cmsData[key] =
            sectionData;

        }

      }
    );


    // ========================================
    // MERGE CMS + FALLBACK
    // ========================================

    return this.mergeFallback(
      cmsData,
      HOME_FALLBACK
    );

  }


  // ==========================================
  // RECURSIVE FALLBACK MERGE
  // ==========================================

  private mergeFallback(
    cmsData: any,
    fallbackData: any
  ): any {

    // ========================================
    // CMS COMPLETELY UNAVAILABLE
    // ========================================

    if (
      cmsData === null ||
      cmsData === undefined
    ) {

      return this.cloneFallback(
        fallbackData
      );

    }


    // ========================================
    // PRIMITIVE VALUE
    // ========================================

    if (
      typeof fallbackData !== 'object' ||
      fallbackData === null
    ) {

      if (
        cmsData === undefined ||
        cmsData === null ||
        cmsData === ''
      ) {

        return fallbackData;

      }

      return cmsData;

    }


    // ========================================
    // ARRAY
    // ========================================

    if (
      Array.isArray(fallbackData)
    ) {

      if (
        !Array.isArray(cmsData) ||
        cmsData.length === 0
      ) {

        return [
          ...fallbackData
        ];

      }

      return [
        ...cmsData
      ];

    }


    // ========================================
    // OBJECT
    // ========================================

    const result: any = {};


    Object.keys(fallbackData)
      .forEach(key => {

        const cmsValue =
          cmsData?.[key];

        const fallbackValue =
          fallbackData[key];


        // ======================================
        // MISSING / NULL / EMPTY CMS VALUE
        // ======================================

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


        // ======================================
        // NESTED OBJECT
        // ======================================

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


        // ======================================
        // CMS VALUE AVAILABLE
        // ======================================

        result[key] =
          cmsValue;

      });


    return result;

  }


  // ==========================================
  // CLONE FALLBACK
  // ==========================================

  private cloneFallback(
    data: any
  ): any {

    if (
      data === null ||
      data === undefined
    ) {

      return data;

    }


    if (
      typeof data !== 'object'
    ) {

      return data;

    }


    return JSON.parse(
      JSON.stringify(data)
    );

  }


  // ==========================================
  // GO TO PRODUCTS
  // ==========================================

  goToProducts(): void {

    this.router.navigate([
      '/productsNew'
    ]);

  }


  // ==========================================
  // GO TO CATEGORY
  // ==========================================

  goToCategory(
    category: string
  ): void {

    this.router.navigate(
      ['/productsNew'],
      {
        queryParams: {
          category: category
        }
      }
    );

  }

}