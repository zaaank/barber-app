import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Appointment,
  Barber,
  ChangingTitles,
  PostAppointment,
  Service,
} from './home.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  apiUrl: string = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  getBarbers() {
    return this.http.get<Barber[]>(this.apiUrl + '/barbers');
  }

  getServices() {
    return this.http.get<Service[]>(this.apiUrl + '/services');
  }

  getAppointments() {
    return this.http.get<Appointment[]>(this.apiUrl + '/appointments');
  }

  postAppointment(startDate: number, barberId: number, serviceId: number) {
    const body: PostAppointment = {
      startDate: startDate,
      barberId: barberId,
      serviceId: serviceId,
    };
    return this.http.post<any>(this.apiUrl + '/appointments', body);
  }

  getTitlesForBigScreen(): ChangingTitles {
    return {
      barber: 'Select Barber',
      service: 'Select Service',
      date: 'Select Date',
      time: 'Select Time',
      price: 'Select any service',
      book: 'BOOK APPOINTMENT',
    } as ChangingTitles;
  }

  getTitlesForSmallScreen(): ChangingTitles {
    return {
      barber: 'Barber',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      price: 'Price',
      book: 'BOOK',
    } as ChangingTitles;
  }
}
