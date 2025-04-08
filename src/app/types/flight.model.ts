export interface IFlightScheduleInfoRequest {
  flightNumber: string;
  startDate: string;
  endDate: string;
}

export type IFlightIropActionType =
  | 'REVISED'
  | 'CANCELLED'
  | 'INFORM'
  | 'RESUME';
export type ICreatedBy = 'PLN' | 'OPS';
export type ISourceType = 'OPS' | 'SSM' | 'ASM';
export type IFlightIropStatus = 'CREATED' | 'DRAFT' | 'APPROVED';

export interface ISeason {
  label: string;
  code: string;
}

export interface INoteOption {
  code: string;
  description: string;
}

export interface IScheduleDay {
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

export interface IFlightSchedule {
  flightNumber: string;
  origin: string;
  destination: string;
  effectiveDate: string;
  expirationDate: string;
  message: string;
  days: IScheduleDay[];
}

export interface IFlightIropRequest {
  actionType: IFlightIropActionType;
  season: ISeason;
  createdBy: ICreatedBy;
  sourceType: ISourceType;
  messageCode: string;
  message: string;
  noteOptions: INoteOption[];
  schedule: IFlightSchedule;
}

export interface FlightIropResponse extends IFlightIropRequest {
  id: string;
  status: IFlightIropStatus;
  createdAt: string;
  modifiedAt: string;
}
