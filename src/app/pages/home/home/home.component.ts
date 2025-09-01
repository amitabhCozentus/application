import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  kpiCards = [
    { title: 'Not Started Shipments', image: 'assets/card1.jpg' },
    { title: 'Arrived Shipments', image: 'assets/card2.jpg' },
    { title: 'In Transit Shipment', image: 'assets/card3.jpg' }
  ];

}
