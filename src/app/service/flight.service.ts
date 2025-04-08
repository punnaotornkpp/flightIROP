import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IFlightScheduleInfoRequest } from '../types/flight.model';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  constructor(private http: HttpService) {}

  getFlightScheduleInfo(
    queryParams: IFlightScheduleInfoRequest
  ): Observable<any> {
    console.log('queryParams', queryParams);
    return this.http.get(
      `${environment.flight}/api/Flight/schedule?${queryParams}`,
      true
    );
  }
}
