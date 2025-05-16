import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  IFlightInfoRequest,
  IFlightInfoView,
  IFlightScheduleGroup,
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
  ): Observable<IResponse<IFlightScheduleGroup>> {
    return this.http.get(
      `${environment.flight}api/Flight/schedule?flightNumber=${req.flightNumber}&startSearchDate=${req.startSearchDate}&endSearchDate=${req.endSearchDate}&dop=${req.dop}&flightStatus=${req.flightStatus}`,
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
    return this.http.post(`${environment.flight}api/Flight/create`, body, true);
  }

  getSavedOperations(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.flight}api/Flight/saved-operations`
    );
  }

  deleteSavedOperation(transactionNumber: string) {
    return this.http.delete(
      `${environment.flight}api/Flight/saved-operations/${transactionNumber}`
    );
  }

  getSavedOperationById(transactionNumber: string) {
    return this.http.get<any>(
      `${environment.flight}api/Flight/saved-operations/${transactionNumber}`
    );
  }

  updateSavedOperationStatus(transactionNumber: string, status: string) {
    return this.http.patch(
      `${environment.flight}api/Flight/saved-operations/${transactionNumber}/status`,
      { status }
    );
  }

  getReasons(id: number): Observable<any[]> {
    return this.http.get(`${environment.flight}api/Flight/reasons/${id}`, true);
  }

  updateSavedOperation(txn: string, payload: any) {
    return this.http.put(
      `${environment.flight}api/Flight/operations/${txn}`,
      payload
    );
  }
}
