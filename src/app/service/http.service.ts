import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionStorage } from '../shared/core/helper/session.helper';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private header = new HttpHeaders().append('Content-Type', 'application/json');
  private token: any;

  constructor(private http: HttpClient, private session: SessionStorage) {}

  private getHeaders(includeAuth: boolean = true): HttpHeaders {
    let headers = this.header;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      this.token = this.session.parseSessionData('token');
    }
    if (includeAuth && this.token) {
      headers = headers.append('Authorization', `${this.token.token}`);
    }
    return headers;
  }

  get<T>(url: string, includeAuth: boolean = true): Observable<T> {
    return this.http.get<T>(url, { headers: this.getHeaders(includeAuth) });
  }

  post<T, B>(url: string, data: T, includeAuth: boolean = true): Observable<B> {
    return this.http.post<B>(url, JSON.stringify(data), {
      headers: this.getHeaders(includeAuth),
    });
  }

  patch<T, B>(
    url: string,
    data: T,
    includeAuth: boolean = true
  ): Observable<B> {
    return this.http.patch<B>(url, JSON.stringify(data), {
      headers: this.getHeaders(includeAuth),
    });
  }

  put<T, B>(url: string, data: T, includeAuth: boolean = true): Observable<B> {
    return this.http.put<B>(url, JSON.stringify(data), {
      headers: this.getHeaders(includeAuth),
    });
  }

  delete<T>(url: string, includeAuth: boolean = true): Observable<T> {
    return this.http.delete<T>(url, { headers: this.getHeaders(includeAuth) });
  }
}
