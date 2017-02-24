import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportComponent } from './report.component';
import { PageNotFoundComponent } from './pagenotfound.component';


export const AppRoutes: Routes = [
    { path: 'report', component: ReportComponent },
    { path: '**', component: PageNotFoundComponent }
]

export const RoutingComponents = [ReportComponent, PageNotFoundComponent];

@NgModule({
    imports: [RouterModule.forRoot(AppRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }