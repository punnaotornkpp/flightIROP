export type IUserRole =
  | 'OPERATION_OFFICER'
  | 'OPERATION_MANAGER'
  | 'PLANNING_OFFICER'
  | 'PLANNING_MANAGER'
  | 'ROOT'
  | 'CONTACT'
  | 'APPROVE'
  | 'ASSIGNE_OFFICER';

export interface IUserInfo {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  createdAt: string;
  modifiedAt: string;
  active: boolean;
  role: IUserRole;
}
