import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  IFlightInfoRequest,
  IFlightInfoView,
  IIropFlightSchedule,
  ISearchFlightScheduleRequest,
} from '../types/flight.model';
import { IResponse } from '../types/response.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  constructor(private http: HttpService, private https: HttpClient) {}

  getFlightScheduleInfo(
    req: ISearchFlightScheduleRequest
  ): Observable<IIropFlightSchedule[]> {
    return this.http.get(
      `${environment.flight}api/Flight/schedule?flightNumber=${req.flightNumber}&startSearchDate=${req.startSearchDate}&endSearchDate=${req.endSearchDate}`,
      true
    );
  }

  getFlightInfoForSchedule(
    req: IFlightInfoRequest[]
  ): Observable<IFlightInfoView[]> {
    return this.http.post<IFlightInfoRequest[], IFlightInfoView[]>(
      `${environment.flight}api/Flight/getFlightInfoForSchedule`,
      req,
      true
    );
  }

  createOperation(body: any): Observable<any> {
    return this.http.post(
      `${environment.flight}/api/Flight/create`,
      body,
      true
    );
  }
}
