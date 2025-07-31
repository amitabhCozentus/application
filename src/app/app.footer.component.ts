import {Component} from '@angular/core';
import {AppComponent} from './app.component';

@Component({
    selector: 'app-footer',
    template: `
        <div class="layout-footer" style="height:56px">
            <div class="col-12 md:col-3 bdp-align-left">
                End User License Agreement <a href="src\assets\bdp\images\maintenance.svg" target="">(EULA)</a>
            </div>
            <div class="col-12 md:col-3 bdp-align-center" style="text-align: center;">

                <span style="margin-left: 1rem;" id="time"><h6></h6></span>
            </div>
            <div class="col-12 md:col-6 bdp-align-right" style="display: flex;
            justify-content: flex-end;">
                <!-- Copyright &#169; {{ currentYear }} BDP International, Inc -->
                &#169; {{ currentYear }} PSA International Pte. Ltd. | &#169; {{ currentYear }} BDP International Inc. | All rights reserved
            </div>
        </div>
    `
})
export class AppFooterComponent {
    currentYear: number;
    constructor(public app: AppComponent) {}

    

    ngOnInit() {
        this.currentYear = new Date().getFullYear();
    }
}
