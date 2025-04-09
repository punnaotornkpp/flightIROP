import { Injectable } from '@angular/core';
import { IUserRole, IUserInfo } from '../types/auth.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private currentUser: IUserInfo | null = null;

  setUser(user: IUserInfo): void {
    this.currentUser = user;
  }

  getUser(): IUserInfo | null {
    return this.currentUser;
  }

  hasRole(...roles: IUserRole[]): boolean {
    return this.currentUser
      ? roles.includes(this.currentUser.role as IUserRole)
      : false;
  }

  canCreate(): boolean {
    const allowedRoles = [
      'OPERATION_OFFICER',
      'OPERATION_MANAGER',
      'PLANNING_OFFICER',
      'PLANNING_MANAGER',
      'ROOT',
    ];

    return this.currentUser
      ? allowedRoles.includes(this.currentUser.role)
      : false;
  }

  //   isManager(): boolean {
  //     return this.hasRole('OPERATION_MANAGER', 'PLANNING_MANAGER', 'ROOT');
  //   }

  //   canApprove(): boolean {
  //     return this.hasRole('APPROVE', 'ROOT');
  //   }

  //   canAssign(): boolean {
  //     return this.hasRole('ASSIGNE_OFFICER', 'ROOT');
  //   }

  //   canEditRecord(recordCreatedBy: 'PLN' | 'OPS'): boolean {
  //     if (!this.currentUser) return false;
  //     if (this.currentUser.role === 'ROOT') return true;

  //     const isPlanningEditor =
  //       recordCreatedBy === 'PLN' &&
  //       this.hasRole('PLANNING_OFFICER', 'PLANNING_MANAGER');
  //     const isOperationEditor =
  //       recordCreatedBy === 'OPS' &&
  //       this.hasRole('OPERATION_OFFICER', 'OPERATION_MANAGER');

  //     return isPlanningEditor || isOperationEditor;
  //   }
}
