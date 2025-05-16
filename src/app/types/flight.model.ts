export type IropActionType = 'REVISED' | 'CANCELLED' | 'INFORM' | 'RESUME';
export type CreatedByRole = 'PLN' | 'OPS';
export type SourceType = 'OPS' | 'SSM' | 'ASM';
export type IropStatus = 'CREATED' | 'DRAFT' | 'APPROVED';

export interface ISeason {
  label: string;
  code: string; // e.g. 'S25'
}

export interface INoteOption {
  code: string; // e.g. 'TC'
  description: string; // e.g. 'Time Change'
}

export interface ISearchFlightScheduleRequest {
  flightNumber: string;
  startSearchDate: string;
  endSearchDate: string;
  flightStatus: string;
  dop: string;
}

export interface IFlightIropRequest {
  messageType: string;
  createdTeam: string;
  season: string;
  actionCode: string;
  customNotifyMessage: string;
  remark: string;
  flightIropItems: IFlightIropItem[];
}

export interface IFlightIropItem {
  reason: string | null;
  flightNumber: string;
  newFlightNumber: string;
  origin: string;
  destination: string;
  originalDepartureTime: string;
  originalArrivalTime: string;
  revisedDepartureTime: Date | string | null;
  revisedArrivalTime: Date | string | null;
  originalOperatingAircraft: string;
  revisedOperatingAircraft: string | null;
  originalFlightStatus: string;
  revisedFlightStatus: string | null;
  day: string;
  frequency: number;
  remark: string | null;
}

export interface IIropFlightSchedule {
  flightNumber: string;
  origin: string;
  destination: string;
  effectiveDate: string;
  expirationDate: string;
  schedule: IScheduleDayDetailExtended[];
}
export interface IScheduleDayDetail {
  frequency: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  duration: string;
  timeAdjustor: number;
  stops: number;
}

export interface IScheduleDayDetailExtended extends IScheduleDayDetail {
  scheduleDate: string; // actual calendar date
  status: boolean; // true = active, false = deselected
  dayLabel: string;
}

export interface IFlightInfoRequest {
  // flightNumber: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
}

export interface IFlightInfoView {
  flightNumber: string;
  aircraftType: string;
  origin: string;
  destination: string;
  scheduledDeparture: string; // Format: YYYY-MM-DDTHH:mm:ss
  scheduledArrival: string; // Format: YYYY-MM-DDTHH:mm:ss
  flightStatus: 'OPEN' | 'CLOSED' | 'CANCELLED';
  frequency: number;
  day: string;
}

///
export interface IFlightScheduleGroup {
  flightNumber: string;
  origin: string;
  destination: string;
  effectiveFrom: string;
  effectiveTo: string;
  dop: string;
  aircraftType: string;
  flightScheduleDetails: IFlightScheduleDetail[];
  flightScheduleNotFounds: IFlightScheduleNotFound[];
}

export interface IFlightScheduleDetail {
  origin: string;
  destination: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  duration: string;
  frequency: number;
  day: string;
  flightStatus: string;
}

export interface IFlightScheduleNotFound {
  frequency: number;
  expectedDeparture: string;
  day: string;
  message: string;
}
