export type IropActionType = 'REVISED' | 'CANCELLED' | 'INFORM' | 'RESUME';
export type CreatedByRole = 'PLN' | 'OPS';
export type SourceType = 'OPS' | 'SSM' | 'ASM';
export type IropStatus = 'CREATED' | 'DRAFT' | 'APPROVED';

// export enum IropStatus {
//   CREATED = 'CREATED',
//   DRAFT = 'DRAFT',
//   APPROVED = 'APPROVED',
// }

export interface ISeason {
  label: string;
  code: string; // e.g. 'S25'
}

export interface INoteOption {
  code: string; // e.g. 'TC'
  description: string; // e.g. 'Time Change'
}

export interface IScheduleDayDetail {
  frequency: string; // '1' - '7'
  estimatedDeparture: string;
  estimatedArrival: string;
  actualDeparture: string;
  actualArrival: string;
  revisedDeparture?: string | null;
  revisedArrival?: string | null;
  aircraft?: string;
  message?: string; // for INFORM / RESUME
  duration: string;
  timeAdjustor: number;
  stops: number;
  status: boolean; // true = apply, false = skip (or cancelled)
}

export interface IIropFlightSchedule {
  flightNumber: string;
  origin: string;
  destination: string;
  effectiveDate: string;
  expirationDate: string;
  message: string; // optional
  schedule: IScheduleDayDetail[];
}

export interface IropSection {
  title: string; // e.g. "AAA: The following flights..."
  actionType: IropActionType;
  schedule: IIropFlightSchedule[];
}

export interface IropTransaction {
  transactionNo: string; // OPS-S25-001
  status: IropStatus;
  createdBy: CreatedByRole;
  sourceType: SourceType;
  season: ISeason;
  createDate: string;
  modifyDate: string;
  messageCode: string;
  message: string;
  noteOptions: INoteOption[];
  sections: IropSection[];
}

export interface ISearchFlightScheduleRequest {
  flightNumber: string;
  startDate: string;
  endDate: string;
  singleDate?: boolean;
}

export interface ISearchFlightScheduleResponse {
  flightNumber: string;
  origin: string;
  destination: string;
  effectiveDate: string;
  expirationDate: string;
  schedule: ISearchScheduleItem[];
}
export interface ISearchScheduleItem {
  estimatedDeparture: string;
  estimatedArrival: string;
  actualDeparture: string;
  actualArrival: string;
  frequency: string;
  duration: string;
  timeAdjustor: number;
  stops: number;
}

export interface IFlightIropRequest {
  createdBy: CreatedByRole;
  sourceType: SourceType;
  season: string; // ใช้ code จาก ISeason
  messageCode?: string;
  message: string;
  noteOptions: string[]; // แค่รหัส เช่น ['TC', 'AC']
  sections: IropSection[]; // แต่ละ section มี actionType ในตัวอยู่แล้ว
}
