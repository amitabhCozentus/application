import { Routes } from "@angular/router";
import {UserControlComponent} from "./pages/user-managment/user-control/user-control/user-control.component"
import {UserConfigurationComponent} from "./pages/user-managment/user-configuration/user-configuration/user-configuration.component"
export const routes:Routes =[
    {
        path:'',
        component:UserControlComponent,
        pathMatch:'full'
    } ,
    {
        path:'user-configuration',
        component:UserConfigurationComponent
    }

];