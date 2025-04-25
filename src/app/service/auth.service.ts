import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IUserInfo } from '../types/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<IUserInfo | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = sessionStorage.getItem('userInfo');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  setUser(user: IUserInfo): void {
    sessionStorage.setItem('userInfo', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getUser(): IUserInfo | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): IUserInfo | null {
    return this.getUser();
  }

  logout() {
    sessionStorage.removeItem('bearerToken');
    sessionStorage.removeItem('userInfo');
    this.currentUserSubject.next(null);
  }

  validateToken(token: string): Observable<IUserInfo | null> {
    return of({
      userId: '93834fe2-c75b-4276-a7d7-6a1d9ba2e29c',
      email: 'Punnatorn.Yim@nokair.co.th',
      firstName: 'Punnatorn',
      lastName: 'Yimpong',
      jobTitle: 'Front-End Development',
      department: 'HQ',
      createdAt: '2025-03-25T17:19:11.0289776',
      modifiedAt: '2025-03-25T17:19:11.0290533',
      active: true,
      role: 'OPERATION_MANAGER',
    });
  }
}
