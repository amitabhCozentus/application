import { RouterModule } from "@angular/router";
import { NgModule, Component } from "@angular/core";
import { AppRoutes } from "../app/shared/lib/api-constant";

@NgModule({
    imports: [
        RouterModule.forRoot([

            {
                path: '',
                redirectTo: AppRoutes.User.ROOT,
                pathMatch: 'full',


            },
        { path: '**', redirectTo: AppRoutes.AuthAbstract.NOT_FOUND },

            // { path: '**', redirectTo: '/notfound' },
        ], {
            // onSameUrlNavigation: 'reload',  // Added for bug 6530 to reload on same URL navigation. 
            scrollPositionRestoration: 'enabled'
        })
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
