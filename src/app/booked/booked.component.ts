import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-booked',
  templateUrl: './booked.component.html',
  styleUrls: ['./booked.component.sass'],
})
export class BookedComponent implements OnInit, OnDestroy {
  constructor(private sharedService: SharedService) {}
  gifs: any[] = [];
  ngOnInit(): void {
    this.sharedService.listOfGifts.subscribe((res) => {
      this.gifs = res;
      console.log(res);
    });
  }

  ngOnDestroy(): void {
    console.log('booked is destroyed');
  }
}
