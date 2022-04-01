import { Component } from '@angular/core';
import { SharedService } from './shared/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  constructor(private sharedService: SharedService) {
    this.sharedService.getGifs();
  }
  title = 'barber-app';
}
