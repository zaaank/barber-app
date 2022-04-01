import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Appointment,
  Barber,
  ChangingTitles,
  Service,
  WorkHour,
} from './home.model';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit, OnDestroy {
  barberImage: string = 'assets/images/image.jpg';
  form!: FormGroup;
  barbers!: Barber[];
  services!: Service[];
  appointments!: Appointment[];

  formConfirmed: boolean = false;

  availableTimes: string[] = [];

  changingTitles!: ChangingTitles;

  constructor(private homeService: HomeService, private router: Router) {}
  ngOnDestroy(): void {
    console.log('home is destroyed');
  }

  ngOnInit(): void {
    this.setTitlesBasedOnScreenWidth();
    this.initializeForm();
    this.fillDropdownItemsFromApi();
    this.form.get('service')?.valueChanges.subscribe((value) => {
      this.services.forEach((service) => {
        if (service.id === value) {
          this.form.patchValue({ price: service.price });
        }
      });
    });

    this.form.get('barber')?.valueChanges.subscribe(() => {
      this.recalculateAvailableTimes();
    });
    this.form.get('date')?.valueChanges.subscribe(() => {
      this.recalculateAvailableTimes();
    });
  }

  initializeForm() {
    this.form = new FormGroup({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null),
      email: new FormControl(null, [Validators.email, Validators.required]),
      contactNumber: new FormControl(null, Validators.required),
      barber: new FormControl(null, Validators.required),
      service: new FormControl(null, Validators.required),
      date: new FormControl(null, Validators.required),
      time: new FormControl(null, Validators.required),
      price: new FormControl(null),
    });
  }

  fillDropdownItemsFromApi() {
    this.getAppointments();
    this.homeService.getBarbers().subscribe(
      (barbers) => {
        this.barbers = barbers;
      },
      (err) => console.log(err)
    );

    this.homeService.getServices().subscribe(
      (services) => {
        this.services = services;
      },
      (err) => console.log(err)
    );
  }

  getAppointments() {
    this.homeService.getAppointments().subscribe(
      (appointments) => {
        this.appointments = appointments;
      },
      (err) => console.log(err)
    );
  }

  recalculateAvailableTimes() {
    if (this.form.get('barber')?.value && this.form.get('date')?.value) {
      let interval = 10; //30 minutes of interval bewtween hours in timepicker, maybe if times will be more complex interval will have to be calculated in a function
      let currentBarber: Barber = this.getCurrentBarber();
      let currentDate: Date = this.form.get('date')?.value;
      let dayInWeek: number = currentDate.getDay();
      let workHoursForDayInWeek: WorkHour =
        this.getWorkHoursForSpecificDayInWeekAndBarber(
          dayInWeek,
          currentBarber
        );
      this.fillAvailableTimes(
        workHoursForDayInWeek.startHour,
        workHoursForDayInWeek.endHour,
        interval,
        workHoursForDayInWeek.lunchTime.startHour,
        workHoursForDayInWeek.lunchTime.durationMinutes,
        currentBarber.id
      );
    }
  }
  fillAvailableTimes(
    startHour: number,
    endHour: string,
    interval: number,
    lunchHour: number,
    lunchDuration: number,
    barberId: number
  ) {
    let availableTimes_: string[] = [];
    let calculatedStringForDataSource: string = '';
    for (let i = startHour; i < +endHour; i++) {
      for (let j = 0; j < 60; j += interval) {
        if ((i === lunchHour && !(j <= lunchDuration)) || i !== lunchHour) {
          /* refactor this function if you want different lunch timing  */
          calculatedStringForDataSource = i.toString() + ':';
          j > 0
            ? (calculatedStringForDataSource += j.toString())
            : (calculatedStringForDataSource += '00');
          availableTimes_.push(calculatedStringForDataSource);
        }
      }
    }
    availableTimes_.push(endHour + ':00');
    availableTimes_ = this.removeAppointmentsFromAvailableTime(
      availableTimes_,
      barberId,
      interval
    );
    this.availableTimes = availableTimes_;
  }

  removeAppointmentsFromAvailableTime(
    availableTime: string[],
    barberId: number,
    interval: number
  ) {
    this.appointments.forEach((appointment) => {
      if (appointment.barberId === barberId) {
        let appointmentDate = new Date(appointment.startDate * 1000);
        let selectedDate: Date = this.form.get('date')?.value;
        /* selectedDate does not include time, so if you are checking for the time of an appointment use appointmentDate */
        if (
          appointmentDate.getDate() === selectedDate.getDate() &&
          appointmentDate.getMonth() === selectedDate.getMonth() &&
          appointmentDate.getFullYear() === selectedDate.getFullYear()
        ) {
          let appointmentHour = appointmentDate.getHours();
          let appointmentMinutes = appointmentDate.getMinutes();
          let appointmentLength = this.getAppointmentLength(appointment);
          let canceledIntervals: string[] = [];

          for (let i = 0; i < appointmentLength; i += interval) {
            if (i > 60) {
              appointmentHour++;
            }
            let hoursAndMinutesString = this.hoursAndMinutesToString(
              appointmentHour,
              i
            );
            canceledIntervals.push(hoursAndMinutesString);
          }
          console.log('appointement', appointment);
          console.log('appointmentLength', appointmentLength);
          console.log('CanceledInterval', canceledIntervals);
          canceledIntervals.forEach((timeInString) => {
            availableTime.forEach((time, idx) => {
              if (time === timeInString) {
                availableTime.splice(idx, 1);
              }
            });
          });
          /* availableTime = availableTime.filter((time) => {
            return time !== hoursAndMinutesString;
          }); */
        }
      }
    });
    return availableTime;
  }

  getAppointmentLength(appointment: Appointment) {
    let length!: number;
    this.services.forEach((service) => {
      if (service.id === appointment.serviceId) {
        length = service.durationMinutes;
      }
    });
    return length;
  }

  hoursAndMinutesToString(hours: number, minutes: number) {
    let stringMinutes: string;
    if (minutes < 10) {
      stringMinutes = '0' + minutes.toString();
    } else stringMinutes = minutes.toString();
    return hours.toString() + ':' + stringMinutes;
  }

  getCurrentBarber() {
    let currentBarber!: Barber;
    this.barbers.forEach((barber) => {
      if (barber.id === this.form.get('barber')?.value) {
        currentBarber = barber;
      }
    });
    return currentBarber;
  }

  getWorkHoursForSpecificDayInWeekAndBarber(dayInWeek: number, barber: Barber) {
    let workHoursForDayInWeek!: WorkHour;
    barber.workHours.forEach((res) => {
      if (res.day === dayInWeek) {
        workHoursForDayInWeek = res;
      }
    });
    return workHoursForDayInWeek;
  }

  disableDates(args: any) {
    const dayOfWeek = args.date.getDay();
    // const month = args.date.getMonth();
    const isWeekend =
      args.view === 'month' && (dayOfWeek === 0 || dayOfWeek === 6);
    // const isMarch = (args.view === "year" || args.view === "month") && month === 2;

    return isWeekend;
  }

  startBooking() {
    this.formConfirmed = true;
    if (this.form.valid) {
      let date: Date = this.form.get('date')?.value;
      let time: string = this.form.get('time')?.value;
      let timeToNumber = time.split(':');
      let miliSeconds =
        date.getTime() +
        +timeToNumber[0] * 3600 * 1000 +
        +timeToNumber[1] * 60 * 1000;
      //let startDate = new Date(miliSeconds);
      let startDate = miliSeconds / 1000;
      this.homeService
        .postAppointment(
          startDate,
          this.form.get('barber')?.value,
          this.form.get('service')?.value
        )
        .subscribe((res) => {
          this.form.reset();
          this.getAppointments();
          this.router.navigate(['/booked']);
        });
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setTitlesBasedOnScreenWidth();
  }

  setTitlesBasedOnScreenWidth() {
    if (window.innerWidth <= 1000) {
      this.changingTitles = this.homeService.getTitlesForSmallScreen();
    } else {
      this.changingTitles = this.homeService.getTitlesForBigScreen();
    }
  }
}
