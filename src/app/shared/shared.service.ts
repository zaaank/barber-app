import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  listOfGifts: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  constructor(private http: HttpClient) {}

  getGifs() {
    this.http
      .get<{ data: any[]; meta: any; pagination: any }>(
        'http://api.giphy.com/v1/gifs/search?api_key=KeTn0RgXZQF8EDkUGgQmSaJYuWPEz5mI&q=barber'
      )
      .subscribe((res) => {
        this.listOfGifts.next(res.data);
        /* console.log(res); */
      });
  }
}
