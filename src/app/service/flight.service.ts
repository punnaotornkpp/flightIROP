import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ISearchFlightScheduleRequest } from '../types/flight.model';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  constructor(private http: HttpService) {}

  getFlightScheduleInfo(
    flightNo: string,
    start: string,
    end: string
  ): Observable<any> {
    return this.http.get(
      `${environment.flight}api/Flight/schedule?flightNo=${flightNo}&startDate=${start}&endDate=${end}`,
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
