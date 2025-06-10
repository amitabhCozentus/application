import { APP_INITIALIZER, ErrorHandler, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpBackend, HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppCommonModule, PrimengModule } from "./modules";
import { AppComponent } from "./app.component";
import { initializeAppFactory } from './app.config';
import { MyPreset } from "../style";


@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        AppCommonModule,
        PrimengModule,

    ],
    declarations: [
        AppComponent,
    ],
    providers: [   
        
        { provide: LocationStrategy, useClass: HashLocationStrategy }
        , ErrorHandler, {
        provide: APP_INITIALIZER,
        useFactory: initializeAppFactory,
        deps: [HttpBackend],
        multi: true,
    },],
    bootstrap: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA],
    exports: [FormsModule],
})
export class AppModule {
}

