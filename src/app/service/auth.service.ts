import { Injectable } from '@angular/core';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export type UserRole =
  // | 'PLANNING'
  // | 'APPROVED'
  // | 'ASSIGN'
  | 'OPERATION_MANAGER'
  | 'OPERATION_OFFICER'
  | 'PLANNING_MANAGER'
  | 'PLANNING_OFFICER';

export interface UserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  role: UserRole;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // OPERATION_OFFICER
  // OPERATION_MANAGER
  // PLANNING_OFFICER
  // PLANNING_MANAGER

  private mockUsers: UserInfo[] = [
    {
      userId: 'u001',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      jobTitle: 'Planning Officer',
      department: 'Flight Planning',
      role: 'PLANNING_OFFICER',
      token: 'mock-token-123',
    },
    {
      userId: 'u002',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      jobTitle: 'Planning Manager',
      department: 'Flight Planning',
      role: 'PLANNING_MANAGER',
      token: 'mock-token-456',
    },
    {
      userId: 'u003',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      jobTitle: 'Operation Manager',
      department: 'Operations',
      role: 'OPERATION_MANAGER',
      token: 'mock-token-789',
    },
  ];

  constructor() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  setUser(user: UserInfo): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  clearUser(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.getCurrentUser()?.token || null;
  }

  validateToken(token: string): Observable<UserInfo | null> {
    return of(this.mockUsers).pipe(
      delay(500),
      map((users) => users.find((user) => user.token === token) || null)
    );
  }
}
