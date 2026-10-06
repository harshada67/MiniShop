import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { CmsContentService } from './cms-content.service';

describe('CmsContentService', () => {

  let service: CmsContentService;
  let httpMock: HttpTestingController;


  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CmsContentService
      ]
    });

    service = TestBed.inject(CmsContentService);
    httpMock = TestBed.inject(HttpTestingController);

  });


  afterEach(() => {

    httpMock.verify();

  });


  // =====================================================
  // SERVICE CREATION
  // =====================================================

  it('should create the service', () => {

    expect(service).toBeTruthy();

  });


  // =====================================================
  // getShellContent()
  // =====================================================

  describe('getShellContent', () => {

    it('should call English shell CMS URL by default', () => {

      const mockResponse = {
        content: 'English Shell Content'
      };

      service.getShellContent().subscribe(response => {

        expect(response).toEqual(mockResponse);

      });

      const req = httpMock.expectOne(
        'assets/mock/shell-response.json'
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);

    });


    it('should call Hindi shell CMS URL when language is hi', () => {

      const mockResponse = {
        content: 'Hindi Shell Content'
      };

      service.getShellContent('hi').subscribe(response => {

        expect(response).toEqual(mockResponse);

      });

      const req = httpMock.expectOne(
        'assets/mock/shell-response-hi.json'
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);

    });


    it('should return null when shell CMS API fails', () => {

      const consoleErrorSpy =
        jest.spyOn(console, 'error')
          .mockImplementation(() => {});

      service.getShellContent().subscribe(response => {

        expect(response).toBeNull();

      });

      const req = httpMock.expectOne(
        'assets/mock/shell-response.json'
      );

      req.flush(
        'CMS error',
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'CMS API failed:',
        expect.anything()
      );

      consoleErrorSpy.mockRestore();

    });

  });


  // =====================================================
  // getHomeContent()
  // =====================================================

  describe('getHomeContent', () => {

    it('should call English home CMS URL by default', () => {

      const mockResponse = {
        content: 'English Home Content'
      };

      service.getHomeContent().subscribe(response => {

        expect(response).toEqual(mockResponse);

      });

      const req = httpMock.expectOne(
        'assets/mock/home-response.json'
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);

    });


    it('should call Hindi home CMS URL when language is hi', () => {

      const mockResponse = {
        content: 'Hindi Home Content'
      };

      service.getHomeContent('hi').subscribe(response => {

        expect(response).toEqual(mockResponse);

      });

      const req = httpMock.expectOne(
        'assets/mock/home-response-hi.json'
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);

    });


    it('should return null when home CMS API fails', () => {

      const consoleErrorSpy =
        jest.spyOn(console, 'error')
          .mockImplementation(() => {});

      service.getHomeContent().subscribe(response => {

        expect(response).toBeNull();

      });

      const req = httpMock.expectOne(
        'assets/mock/home-response.json'
      );

      req.flush(
        'Home CMS error',
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Home CMS API failed:',
        expect.anything()
      );

      consoleErrorSpy.mockRestore();

    });

  });


  // =====================================================
  // getCheckoutContent()
  // =====================================================

  describe('getCheckoutContent', () => {

    it('should call checkout CMS URL', () => {

      const mockResponse = {
        content: 'Checkout Content'
      };

      service.getCheckoutContent().subscribe(response => {

        expect(response).toEqual(mockResponse);

      });

      const req = httpMock.expectOne(
        'assets/mock/checkout-response.json'
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);

    });


    it('should return null when checkout CMS API fails', () => {

      const consoleErrorSpy =
        jest.spyOn(console, 'error')
          .mockImplementation(() => {});

      service.getCheckoutContent().subscribe(response => {

        expect(response).toBeNull();

      });

      const req = httpMock.expectOne(
        'assets/mock/checkout-response.json'
      );

      req.flush(
        'Checkout error',
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Checkout CMS API failed:',
        expect.anything()
      );

      consoleErrorSpy.mockRestore();

    });

  });


  // =====================================================
  // getOrdersContent()
  // =====================================================

  describe('getOrdersContent', () => {

    it('should call orders CMS URL', () => {

      const mockResponse = {
        content: 'Orders Content'
      };

      service.getOrdersContent().subscribe(response => {

        expect(response).toEqual(mockResponse);

      });

      const req = httpMock.expectOne(
        'assets/mock/orders-response.json'
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);

    });


    it('should return null when orders CMS API fails', () => {

      const consoleErrorSpy =
        jest.spyOn(console, 'error')
          .mockImplementation(() => {});

      service.getOrdersContent().subscribe(response => {

        expect(response).toBeNull();

      });

      const req = httpMock.expectOne(
        'assets/mock/orders-response.json'
      );

      req.flush(
        'Orders error',
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Orders CMS API failed:',
        expect.anything()
      );

      consoleErrorSpy.mockRestore();

    });

  });


  // =====================================================
  // getProfileContent()
  // =====================================================

  describe('getProfileContent', () => {

    it('should call profile CMS URL', () => {

      const mockResponse = {
        content: 'Profile Content'
      };

      service.getProfileContent().subscribe(response => {

        expect(response).toEqual(mockResponse);

      });

      const req = httpMock.expectOne(
        'assets/mock/profile-response.json'
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);

    });


    it('should return null when profile CMS API fails', () => {

      const consoleErrorSpy =
        jest.spyOn(console, 'error')
          .mockImplementation(() => {});

      service.getProfileContent().subscribe(response => {

        expect(response).toBeNull();

      });

      const req = httpMock.expectOne(
        'assets/mock/profile-response.json'
      );

      req.flush(
        'Profile error',
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Profile CMS API failed:',
        expect.anything()
      );

      consoleErrorSpy.mockRestore();

    });

  });


  // =====================================================
  // getLoginContent()
  // =====================================================

  describe('getLoginContent', () => {

    it('should call login CMS URL', () => {

      const mockResponse = {
        content: 'Login Content'
      };

      service.getLoginContent().subscribe(response => {

        expect(response).toEqual(mockResponse);

      });

      const req = httpMock.expectOne(
        'assets/mock/login-response.json'
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);

    });


    it('should return null when login CMS API fails', () => {

      const consoleErrorSpy =
        jest.spyOn(console, 'error')
          .mockImplementation(() => {});

      service.getLoginContent().subscribe(response => {

        expect(response).toBeNull();

      });

      const req = httpMock.expectOne(
        'assets/mock/login-response.json'
      );

      req.flush(
        'Login error',
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Login CMS API failed:',
        expect.anything()
      );

      consoleErrorSpy.mockRestore();

    });

  });

});