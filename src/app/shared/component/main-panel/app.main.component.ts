import { Component } from '@angular/core';
import { TopbarComponent } from '../topbar/topbar.component';
import { AppFooterComponent } from '../../../app.footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-component',
  imports: [TopbarComponent, AppFooterComponent, RouterOutlet],
  templateUrl: './app.main.component.html',
  styleUrl: './app.main.component.scss'
})
export class AppMainComponent {

}
