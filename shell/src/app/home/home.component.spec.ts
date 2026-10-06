import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { expect, jest } from '@jest/globals';
import { HomeComponent } from './home.component';
import { CmsContentService } from '../services/cms-content/cms-content.service';
import { HOME_CONSTANTS_MAP } from '../constants/home.constants';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let cmsContentServiceMock: {
    getHomeContent: jest.Mock;
  };

  let routerMock: {
    navigate: jest.Mock;
  };

  beforeEach(async () => {
    cmsContentServiceMock = {
      getHomeContent: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [
        {
          provide: CmsContentService,
          useValue: cmsContentServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    })
      // We are testing the TypeScript component logic,
      // so keep the template empty for these unit tests.
      .overrideTemplate(HomeComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  // =========================================================
  // CREATE
  // =========================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // =========================================================
  // ngOnInit - DEFAULT LANGUAGE
  // =========================================================

  it('should use English when no saved language exists', () => {
    cmsContentServiceMock.getHomeContent.mockReturnValue(
      of({
        content: [
          {
            screenContent: []
          }
        ]
      })
    );

    component.ngOnInit();

    expect(component.selectedLanguage).toBe('en');

    expect(
      cmsContentServiceMock.getHomeContent
    ).toHaveBeenCalledWith('en');
  });

  // =========================================================
  // ngOnInit - SAVED ENGLISH
  // =========================================================

  it('should use saved English language', () => {
    localStorage.setItem('minishop_language', 'en');

    cmsContentServiceMock.getHomeContent.mockReturnValue(
      of({
        content: [
          {
            screenContent: []
          }
        ]
      })
    );

    component.ngOnInit();

    expect(component.selectedLanguage).toBe('en');

    expect(
      cmsContentServiceMock.getHomeContent
    ).toHaveBeenCalledWith('en');
  });

  // =========================================================
  // ngOnInit - SAVED HINDI
  // =========================================================

  it('should use saved Hindi language', () => {
    localStorage.setItem('minishop_language', 'hi');

    cmsContentServiceMock.getHomeContent.mockReturnValue(
      of({
        content: [
          {
            screenContent: []
          }
        ]
      })
    );

    component.ngOnInit();

    expect(component.selectedLanguage).toBe('hi');

    expect(
      cmsContentServiceMock.getHomeContent
    ).toHaveBeenCalledWith('hi');
  });

  // =========================================================
  // ngOnInit - INVALID SAVED LANGUAGE
  // =========================================================

  it('should keep English when saved language is invalid', () => {
    localStorage.setItem('minishop_language', 'fr');

    cmsContentServiceMock.getHomeContent.mockReturnValue(
      of({
        content: [
          {
            screenContent: []
          }
        ]
      })
    );

    component.ngOnInit();

    expect(component.selectedLanguage).toBe('en');

    expect(
      cmsContentServiceMock.getHomeContent
    ).toHaveBeenCalledWith('en');
  });

  // =========================================================
  // LOAD HOME CONTENT
  // =========================================================

  it('should load home content and populate categories', () => {
    const response = {
      content: [
        {
          screenContent: [
            {
              key: 'categories',
              items: [
                {
                  id: 1,
                  name: 'Electronics'
                },
                {
                  id: 2,
                  name: 'Clothing'
                }
              ]
            }
          ]
        }
      ]
    };

    cmsContentServiceMock.getHomeContent.mockReturnValue(
      of(response)
    );

    component.ngOnInit();

    expect(component.homeContent).toEqual(response);

    expect(component.finalContent).toBeTruthy();

    expect(component.categories).toEqual([
      {
        id: 1,
        name: 'Electronics'
      },
      {
        id: 2,
        name: 'Clothing'
      }
    ]);
  });

  // =========================================================
  // LOAD HOME CONTENT - NO CATEGORIES
  // =========================================================

  it('should set categories to empty array when categories are unavailable', () => {
    const response = {
      content: [
        {
          screenContent: [
            {
              key: 'banner',
              title: 'Welcome'
            }
          ]
        }
      ]
    };

    cmsContentServiceMock.getHomeContent.mockReturnValue(
      of(response)
    );

    component.ngOnInit();

    expect(component.categories).toEqual([]);
  });

  // =========================================================
  // LANGUAGE CHANGE - VALID ENGLISH
  // =========================================================

  it('should reload content when language changes to English', () => {
    cmsContentServiceMock.getHomeContent
      .mockReturnValue(
        of({
          content: [
            {
              screenContent: []
            }
          ]
        })
      );

    component.ngOnInit();

    cmsContentServiceMock.getHomeContent.mockClear();

    const event = new CustomEvent<string>(
      'language-changed',
      {
        detail: 'en'
      }
    );

    window.dispatchEvent(event);

    expect(component.selectedLanguage).toBe('en');

    expect(
      cmsContentServiceMock.getHomeContent
    ).toHaveBeenCalledWith('en');
  });

  // =========================================================
  // LANGUAGE CHANGE - VALID HINDI
  // =========================================================

  it('should reload content when language changes to Hindi', () => {
    cmsContentServiceMock.getHomeContent
      .mockReturnValue(
        of({
          content: [
            {
              screenContent: []
            }
          ]
        })
      );

    component.ngOnInit();

    cmsContentServiceMock.getHomeContent.mockClear();

    const event = new CustomEvent<string>(
      'language-changed',
      {
        detail: 'hi'
      }
    );

    window.dispatchEvent(event);

    expect(component.selectedLanguage).toBe('hi');

    expect(
      cmsContentServiceMock.getHomeContent
    ).toHaveBeenCalledWith('hi');
  });

  // =========================================================
  // LANGUAGE CHANGE - INVALID
  // =========================================================

  it('should ignore unsupported language', () => {
    cmsContentServiceMock.getHomeContent.mockReturnValue(
      of({
        content: [
          {
            screenContent: []
          }
        ]
      })
    );

    component.ngOnInit();

    cmsContentServiceMock.getHomeContent.mockClear();

    const previousLanguage =
      component.selectedLanguage;

    const event = new CustomEvent<string>(
      'language-changed',
      {
        detail: 'fr'
      }
    );

    window.dispatchEvent(event);

    expect(component.selectedLanguage)
      .toBe(previousLanguage);

    expect(
      cmsContentServiceMock.getHomeContent
    ).not.toHaveBeenCalled();
  });

  // =========================================================
  // REVAMP FALLBACK - NULL CMS
  // =========================================================

  it('should return English fallback when CMS content is null', () => {
    component.selectedLanguage = 'en';
    component.homeContent = null;

    const result =
      component.revampFallback();

    expect(result).toEqual(
      HOME_CONSTANTS_MAP['en']
    );

    expect(result).not.toBe(
      HOME_CONSTANTS_MAP['en']
    );
  });

  // =========================================================
  // REVAMP FALLBACK - INVALID SCREEN CONTENT
  // =========================================================

  it('should return fallback when screenContent is missing', () => {
    component.selectedLanguage = 'en';

    component.homeContent = {
      content: [
        {}
      ]
    };

    const result =
      component.revampFallback();

    expect(result).toEqual(
      HOME_CONSTANTS_MAP['en']
    );
  });

  // =========================================================
  // REVAMP FALLBACK - EMPTY SCREEN CONTENT
  // =========================================================

  it('should return fallback when screenContent is empty', () => {
    component.selectedLanguage = 'en';

    component.homeContent = {
      content: [
        {
          screenContent: []
        }
      ]
    };

    const result =
      component.revampFallback();

    expect(result).toEqual(
      HOME_CONSTANTS_MAP['en']
    );
  });

  // =========================================================
  // REVAMP FALLBACK - CMS DATA
  // =========================================================

  it('should merge CMS sections with fallback content', () => {
    component.selectedLanguage = 'en';

    component.homeContent = {
      content: [
        {
          screenContent: [
            {
              key: 'categories',
              items: [
                {
                  id: 10,
                  name: 'Test Category'
                }
              ]
            },
            {
              key: 'banner',
              title: 'Test Banner'
            },
            {
              title: 'section without key'
            }
          ]
        }
      ]
    };

    const result =
      component.revampFallback();

    expect(result.categories).toBeDefined();

    expect(result.categories.items).toEqual([
      {
        id: 10,
        name: 'Test Category'
      }
    ]);
  });

  // =========================================================
  // REVAMP FALLBACK - INVALID LANGUAGE
  // =========================================================

  it('should use English fallback for unsupported selected language', () => {
    component.selectedLanguage = 'fr';
    component.homeContent = null;

    const result =
      component.revampFallback();

    expect(result).toEqual(
      HOME_CONSTANTS_MAP['en']
    );
  });

  // =========================================================
  // MERGE FALLBACK - NULL CMS
  // =========================================================

  it('should clone fallback when CMS data is null', () => {
    const fallback = {
      title: 'Hello',
      description: 'Welcome'
    };

    const result =
      (component as any).mergeFallback(
        null,
        fallback
      );

    expect(result).toEqual(fallback);

    expect(result).not.toBe(fallback);
  });

  // =========================================================
  // MERGE FALLBACK - UNDEFINED CMS
  // =========================================================

  it('should clone fallback when CMS data is undefined', () => {
    const fallback = {
      title: 'Hello'
    };

    const result =
      (component as any).mergeFallback(
        undefined,
        fallback
      );

    expect(result).toEqual(fallback);
  });

  // =========================================================
  // MERGE FALLBACK - PRIMITIVE
  // =========================================================

  it('should return fallback primitive when CMS value is missing', () => {
    const result =
      (component as any).mergeFallback(
        undefined,
        'Fallback'
      );

    expect(result).toBe('Fallback');
  });

  // =========================================================
  // MERGE FALLBACK - PRIMITIVE CMS VALUE
  // =========================================================

  it('should return CMS primitive when CMS value exists', () => {
    const result =
      (component as any).mergeFallback(
        'CMS Value',
        'Fallback Value'
      );

    expect(result).toBe('CMS Value');
  });

  // =========================================================
  // MERGE FALLBACK - NULL CMS PRIMITIVE
  // =========================================================

  it('should return fallback when CMS primitive is null', () => {
    const result =
      (component as any).mergeFallback(
        null,
        'Fallback'
      );

    expect(result).toBe('Fallback');
  });

  // =========================================================
  // MERGE FALLBACK - EMPTY CMS STRING
  // =========================================================

  it('should return fallback when CMS primitive is empty', () => {
    const result =
      (component as any).mergeFallback(
        '',
        'Fallback'
      );

    expect(result).toBe('Fallback');
  });

  // =========================================================
  // MERGE FALLBACK - ARRAY
  // =========================================================

  it('should return fallback array when CMS array is empty', () => {
    const fallback = [
      'A',
      'B'
    ];

    const result =
      (component as any).mergeFallback(
        [],
        fallback
      );

    expect(result).toEqual([
      'A',
      'B'
    ]);

    expect(result).not.toBe(fallback);
  });

  // =========================================================
  // MERGE FALLBACK - CMS ARRAY
  // =========================================================

  it('should return CMS array when CMS array has values', () => {
    const cmsData = [
      'CMS A',
      'CMS B'
    ];

    const fallback = [
      'Fallback A'
    ];

    const result =
      (component as any).mergeFallback(
        cmsData,
        fallback
      );

    expect(result).toEqual(cmsData);

    expect(result).not.toBe(cmsData);
  });

  // =========================================================
  // MERGE FALLBACK - CMS NOT ARRAY
  // =========================================================

  it('should return fallback array when CMS value is not an array', () => {
    const fallback = [
      'A',
      'B'
    ];

    const result =
      (component as any).mergeFallback(
        {},
        fallback
      );

    expect(result).toEqual(fallback);
  });

  // =========================================================
  // MERGE FALLBACK - OBJECT
  // =========================================================

  it('should merge object values from CMS and fallback', () => {
    const cmsData = {
      title: 'CMS Title',
      description: 'CMS Description'
    };

    const fallbackData = {
      title: 'Fallback Title',
      description: 'Fallback Description'
    };

    const result =
      (component as any).mergeFallback(
        cmsData,
        fallbackData
      );

    expect(result).toEqual({
      title: 'CMS Title',
      description: 'CMS Description'
    });
  });

  // =========================================================
  // MERGE FALLBACK - MISSING VALUE
  // =========================================================

  it('should use fallback when CMS property is undefined', () => {
    const cmsData = {
      title: 'CMS Title'
    };

    const fallbackData = {
      title: 'Fallback Title',
      description: 'Fallback Description'
    };

    const result =
      (component as any).mergeFallback(
        cmsData,
        fallbackData
      );

    expect(result).toEqual({
      title: 'CMS Title',
      description: 'Fallback Description'
    });
  });

  // =========================================================
  // MERGE FALLBACK - NULL VALUE
  // =========================================================

  it('should use fallback when CMS property is null', () => {
    const cmsData = {
      title: null
    };

    const fallbackData = {
      title: 'Fallback Title'
    };

    const result =
      (component as any).mergeFallback(
        cmsData,
        fallbackData
      );

    expect(result).toEqual({
      title: 'Fallback Title'
    });
  });

  // =========================================================
  // MERGE FALLBACK - EMPTY VALUE
  // =========================================================

  it('should use fallback when CMS property is empty', () => {
    const cmsData = {
      title: ''
    };

    const fallbackData = {
      title: 'Fallback Title'
    };

    const result =
      (component as any).mergeFallback(
        cmsData,
        fallbackData
      );

    expect(result).toEqual({
      title: 'Fallback Title'
    });
  });

  // =========================================================
  // MERGE FALLBACK - NESTED OBJECT
  // =========================================================

  it('should recursively merge nested objects', () => {
    const cmsData = {
      content: {
        title: 'CMS Title'
      }
    };

    const fallbackData = {
      content: {
        title: 'Fallback Title',
        description: 'Fallback Description'
      }
    };

    const result =
      (component as any).mergeFallback(
        cmsData,
        fallbackData
      );

    expect(result).toEqual({
      content: {
        title: 'CMS Title',
        description: 'Fallback Description'
      }
    });
  });

  // =========================================================
  // CLONE FALLBACK - NULL
  // =========================================================

  it('should return null when cloneFallback receives null', () => {
    const result =
      (component as any).cloneFallback(null);

    expect(result).toBeNull();
  });

  // =========================================================
  // CLONE FALLBACK - UNDEFINED
  // =========================================================

  it('should return undefined when cloneFallback receives undefined', () => {
    const result =
      (component as any).cloneFallback(undefined);

    expect(result).toBeUndefined();
  });

  // =========================================================
  // CLONE FALLBACK - PRIMITIVE
  // =========================================================

  it('should return primitive value directly', () => {
    const result =
      (component as any).cloneFallback('Test');

    expect(result).toBe('Test');
  });

  // =========================================================
  // CLONE FALLBACK - OBJECT
  // =========================================================

  it('should create a deep clone of an object', () => {
    const original = {
      title: 'Test',
      nested: {
        value: 100
      }
    };

    const result =
      (component as any).cloneFallback(original);

    expect(result).toEqual(original);

    expect(result).not.toBe(original);

    expect(result.nested).not.toBe(
      original.nested
    );
  });

  // =========================================================
  // GO TO PRODUCTS
  // =========================================================

  it('should navigate to products', () => {
    component.goToProducts();

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/productsNew'
    ]);
  });

  // =========================================================
  // GO TO CATEGORY
  // =========================================================

  it('should navigate to products with category', () => {
    component.goToCategory('electronics');

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith(
      ['/productsNew'],
      {
        queryParams: {
          category: 'electronics'
        }
      }
    );
  });

  // =========================================================
  // ngOnDestroy
  // =========================================================

  it('should remove language change listener on destroy', () => {
    const removeEventListenerSpy =
      jest.spyOn(
        window,
        'removeEventListener'
      );

    component.ngOnDestroy();

    expect(
      removeEventListenerSpy
    ).toHaveBeenCalledWith(
      'language-changed',
      expect.any(Function)
    );
  });

  // =========================================================
  // ngOnInit EVENT LISTENER
  // =========================================================

  it('should register language change listener on init', () => {
    const addEventListenerSpy =
      jest.spyOn(
        window,
        'addEventListener'
      );

    cmsContentServiceMock.getHomeContent.mockReturnValue(
      of({
        content: [
          {
            screenContent: []
          }
        ]
      })
    );

    component.ngOnInit();

    expect(
      addEventListenerSpy
    ).toHaveBeenCalledWith(
      'language-changed',
      expect.any(Function)
    );
  });
});