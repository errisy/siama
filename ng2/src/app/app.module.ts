import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';


import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ExpandBtnComponent } from '../ui/expand.btn.component';

import { AppRoutes, AppRoutingModule, RoutingComponents } from './app.routing';
import { SpanEditor } from '../ui/editor';
import { DatePickerComponent } from '../ui/datepicker.component';
import { LeftBtnComponent } from '../ui/left.btn.component';
import { RightBtnComponent } from '../ui/right.btn.component';
import { AcceptBtnComponent } from '../ui/accept.btn.component';
import { CancelBtnComponent } from '../ui/cancel.btn.component';
import { SlideCheckboxComponent } from '../ui/slide.checkbox.component';
import { TickCheckboxComponent } from '../ui/tick.checkbox.component';

const Components = [AppComponent, SpanEditor, DatePickerComponent, ExpandBtnComponent, LeftBtnComponent, RightBtnComponent,
    AcceptBtnComponent, CancelBtnComponent, SlideCheckboxComponent, TickCheckboxComponent]

@NgModule({
    imports: [FormsModule, HttpModule, BrowserModule, AppRoutingModule],
    declarations: [...Components, ...RoutingComponents],
    bootstrap: [AppComponent]
})
export class AppModule { }