import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CmsContentService {

private cmsUrl = 'http://localhost:4203/assets/mock/products-response.json';

  constructor(private http: HttpClient) {}

  getProductsContent(): Observable<any> {
    return this.http.get<any>(this.cmsUrl).pipe(
      catchError(error => {
        console.error('Products CMS API failed:', error);
        return of(null);
      })
    );
  }
}