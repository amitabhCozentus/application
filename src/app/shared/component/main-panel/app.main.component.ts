import { Component } from '@angular/core';
import { TopbarComponent } from '../topbar/topbar.component';
import { RouterOutlet } from '@angular/router';
import { AppFooterComponent } from '../footer/app.footer.component';

@Component({
  selector: 'app-main-component',
  imports: [TopbarComponent, AppFooterComponent, RouterOutlet],
  templateUrl: './app.main.component.html',
  styleUrl: './app.main.component.scss'
})
export class AppMainComponent {

}
