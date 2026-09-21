import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CmsContentService {

  private cmsUrl = 'assets/mock/shell-response.json';

  constructor(private http: HttpClient) {}

  getShellContent(): Observable<any> {
    return this.http.get<any>(this.cmsUrl).pipe(
      catchError(error => {
        console.error('CMS API failed:', error);
        return of(null);
      })
    );
  }
  
  getHomeContent(): Observable<any> {
  return this.http
    .get<any>('assets/mock/home-response.json')
    .pipe(
      catchError(error => {
        console.error('Home CMS API failed:', error);
        return of(null);
      })
    );
}
getCheckoutContent(): Observable<any> {
  return this.http
    .get<any>('assets/mock/checkout-response.json')
    .pipe(
      catchError(error => {
        console.error(
          'Checkout CMS API failed:',
          error
        );

        return of(null);
      })
    );
}
getOrdersContent(): Observable<any> {
  return this.http
    .get<any>('assets/mock/orders-response.json')
    .pipe(
      catchError(error => {
        console.error('Orders CMS API failed:', error);
        return of(null);
      })
    );
}

getProfileContent(): Observable<any> {
  return this.http
    .get<any>('assets/mock/profile-response.json')
    .pipe(
      catchError(error => {
        console.error('Profile CMS API failed:', error);
        return of(null);
      })
    );
}

getLoginContent(): Observable<any> {
  return this.http
    .get<any>('assets/mock/login-response.json')
    .pipe(
      catchError(error => {
        console.error('Login CMS API failed:', error);
        return of(null);
      })
    );
}
}