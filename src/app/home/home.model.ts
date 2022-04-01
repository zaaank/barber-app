export interface LunchTime {
  startHour: number;
  durationMinutes: number;
}

export interface WorkHour {
  id: number;
  day: number;
  startHour: number;
  endHour: string;
  lunchTime: LunchTime;
}

export interface Barber {
  id: number;
  firstName: string;
  lastName: string;
  workHours: WorkHour[];
}

export interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  price: string;
}

export interface Appointment {
  id: number;
  startDate: number;
  barberId: number;
  serviceId: number;
}

export interface PostAppointment {
  startDate: number;
  barberId: number;
  serviceId: number;
}

export interface ChangingTitles {
  barber: string;
  service: string;
  date: string;
  time: string;
  price: string;
  book: string;
}
