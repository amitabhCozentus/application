import { AppMainComponent } from './shared/component/main-panel/app.main.component';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, SimpleChanges, DoCheck } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgHttpLoaderComponent } from 'ng-http-loader';
import { TopbarComponent } from './shared/component/topbar/topbar.component';
//import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    imports:[RouterOutlet, NgHttpLoaderComponent, AppMainComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {

    checkCount = 0;
    topbarTheme = 'dark';

    menuTheme = 'dark';

    layoutMode = 'light';

    menuMode = 'horizontal';

    isRTL = false;

    inputStyle = 'outlined';

    ripple: boolean = true;
    isRefresh: boolean; //For US 8229


    constructor(
    ) {
    }


    ngOnInit() {
    }
    ngAfterViewInit() {
}
}
