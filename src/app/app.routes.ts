import { Routes } from "@angular/router";
import {UserControlComponent} from "./pages/user-managment/user-control/user-control/user-control.component"
export const routes:Routes =[
    {
        path:'',
        component:UserControlComponent,
        pathMatch:'full'
    }
];