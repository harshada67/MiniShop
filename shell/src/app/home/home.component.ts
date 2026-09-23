import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  CmsContentService
} from '../services/cms-content/cms-content.service';

import {
  HOME_CONSTANTS_MAP
} from '../constants/home.constants';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent
  implements OnInit, OnDestroy {

  homeContent: any = null;

  finalContent: any = null;

  categories: any[] = [];


  // ================================
  // LANGUAGE
  // ================================

  selectedLanguage = 'en';


  // ================================
  // CONSTRUCTOR
  // ================================

  constructor(
    private cmsContentService: CmsContentService,

    private router: Router
  ) {}


  // ================================
  // INIT
  // ================================

  ngOnInit(): void {

    // Get saved language
    const savedLanguage =
      localStorage.getItem(
        'minishop_language'
      );


    if (
      savedLanguage === 'en' ||
      savedLanguage === 'hi'
    ) {

      this.selectedLanguage =
        savedLanguage;

    }


    // Load Home CMS
    this.loadHomeContent();


    // Listen for language change
    window.addEventListener(
      'language-changed',
      this.handleLanguageChange
    );

  }


  // ================================
  // HANDLE LANGUAGE CHANGE
  // ================================

  private handleLanguageChange = (
    event: Event
  ): void => {

    const customEvent =
      event as CustomEvent<string>;

    const language =
      customEvent.detail;


    if (
      language !== 'en' &&
      language !== 'hi'
    ) {

      return;

    }


    this.selectedLanguage =
      language;


    console.log(
      'Home language changed:',
      this.selectedLanguage
    );


    // Reload Home CMS
    this.loadHomeContent();

  };


  // ================================
  // LOAD HOME CONTENT
  // ================================

  private loadHomeContent(): void {

    this.cmsContentService
      .getHomeContent(
        this.selectedLanguage
      )
      .subscribe(response => {

        this.homeContent =
          response;


        console.log(
          'Home CMS Response:',
          this.homeContent
        );


        // ==================================
        // REVAMP + FALLBACK
        // ==================================

        this.finalContent =
          this.revampFallback();


        console.log(
          'Home Final Content:',
          this.finalContent
        );


        // ==================================
        // CATEGORIES
        // ==================================

        this.categories =
          this.finalContent
            ?.categories
            ?.items ||
          [];

      });

  }


  // ================================
  // REVAMP FALLBACK
  // ================================

  revampFallback(): any {

    // ==================================
    // LANGUAGE FALLBACK
    // ==================================

    const languageFallback =
      HOME_CONSTANTS_MAP[
        this.selectedLanguage
      ] ||
      HOME_CONSTANTS_MAP['en'];


    // ==================================
    // CMS RESPONSE NOT AVAILABLE
    // ==================================

    if (
      this.homeContent === null ||
      this.homeContent === undefined
    ) {

      return this.cloneFallback(
        languageFallback
      );

    }


    // ==================================
    // EXTRACT SCREEN CONTENT
    // ==================================

    const screenContent =
      this.homeContent
        ?.content?.[0]
        ?.screenContent;


    // ==================================
    // SCREEN CONTENT NOT AVAILABLE
    // ==================================

    if (
      !Array.isArray(screenContent) ||
      screenContent.length === 0
    ) {

      return this.cloneFallback(
        languageFallback
      );

    }


    // ==================================
    // CONVERT KEY-BASED CMS
    // INTO OBJECT
    // ==================================

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


    // ==================================
    // MERGE CMS + LANGUAGE FALLBACK
    // ==================================

    return this.mergeFallback(
      cmsData,
      languageFallback
    );

  }


  // ================================
  // RECURSIVE FALLBACK MERGE
  // ================================

  private mergeFallback(
    cmsData: any,
    fallbackData: any
  ): any {

    // ==================================
    // CMS COMPLETELY UNAVAILABLE
    // ==================================

    if (
      cmsData === null ||
      cmsData === undefined
    ) {

      return this.cloneFallback(
        fallbackData
      );

    }


    // ==================================
    // PRIMITIVE VALUE
    // ==================================

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


    // ==================================
    // ARRAY
    // ==================================

    if (Array.isArray(fallbackData)) {

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


    // ==================================
    // OBJECT
    // ==================================

    const result: any = {};


    Object.keys(fallbackData)
      .forEach(key => {

        const cmsValue =
          cmsData?.[key];

        const fallbackValue =
          fallbackData[key];


        // ==================================
        // MISSING / NULL / EMPTY CMS VALUE
        // ==================================

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


        // ==================================
        // NESTED OBJECT
        // ==================================

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


        // ==================================
        // CMS VALUE AVAILABLE
        // ==================================

        result[key] =
          cmsValue;

      });


    return result;

  }


  // ================================
  // CLONE FALLBACK
  // ================================

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


  // ================================
  // GO TO PRODUCTS
  // ================================

  goToProducts(): void {

    this.router.navigate(
      ['/productsNew']
    );

  }


  // ================================
  // GO TO CATEGORY
  // ================================

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


  // ================================
  // DESTROY
  // ================================

  ngOnDestroy(): void {

    window.removeEventListener(
      'language-changed',
      this.handleLanguageChange
    );

  }

}