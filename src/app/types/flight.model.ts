export interface ISearchFlightScheduleRequest {
  flightNumber: string;
  startDate: string;
  endDate: string;
  singleDate?: boolean;
}

export type IropActionType = 'REVISED' | 'CANCELLED' | 'INFORM' | 'RESUME';
export type CreatedByRole = 'PLN' | 'OPS';
export type SourceType = 'OPS' | 'SSM' | 'ASM';
export type IropStatus = 'CREATED' | 'DRAFT' | 'APPROVED';

export interface ISeason {
  label: string;
  code: string;
}

export interface INoteOption {
  code: string;
  description: string;
}

export interface IScheduleDayDetail {
  dayOfWeek: number;
  estimatedDeparture: string;
  estimatedArrival: string;
  actualDeparture: string;
  actualArrival: string;
  revisedDeparture: string | null;
  revisedArrival: string | null;
  duration: string;
  timeAdjustor: number;
  isActive: boolean;
  stops: number;
}

export interface IIropFlightSchedule {
  flightNumber: string;
  origin: string;
  destination: string;
  effectiveDate: string;
  expirationDate: string;
  message: string;
  days: IScheduleDayDetail[];
}

export interface ICreateIropRequest {
  actionType: IropActionType;
  season: ISeason;
  createdBy: CreatedByRole;
  sourceType: SourceType;
  messageCode: string;
  message: string;
  noteOptions: INoteOption[];
  schedule: IIropFlightSchedule;
}

export interface IIropDetailResponse extends ICreateIropRequest {
  id: string;
  status: IropStatus;
  createdAt: string;
  modifiedAt: string;
}
