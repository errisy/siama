"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const core_1 = require("@angular/core");
const forms_1 = require("@angular/forms");
const http_1 = require("@angular/http");
const platform_browser_1 = require("@angular/platform-browser");
const app_component_1 = require("./app.component");
const expand_btn_component_1 = require("../ui/expand.btn.component");
const app_routing_1 = require("./app.routing");
const editor_1 = require("../ui/editor");
const datepicker_component_1 = require("../ui/datepicker.component");
const left_btn_component_1 = require("../ui/left.btn.component");
const right_btn_component_1 = require("../ui/right.btn.component");
const accept_btn_component_1 = require("../ui/accept.btn.component");
const cancel_btn_component_1 = require("../ui/cancel.btn.component");
const slide_checkbox_component_1 = require("../ui/slide.checkbox.component");
const tick_checkbox_component_1 = require("../ui/tick.checkbox.component");
const Components = [app_component_1.AppComponent, editor_1.SpanEditor, datepicker_component_1.DatePickerComponent, expand_btn_component_1.ExpandBtnComponent, left_btn_component_1.LeftBtnComponent, right_btn_component_1.RightBtnComponent,
    accept_btn_component_1.AcceptBtnComponent, cancel_btn_component_1.CancelBtnComponent, slide_checkbox_component_1.SlideCheckboxComponent, tick_checkbox_component_1.TickCheckboxComponent];
let AppModule = class AppModule {
};
AppModule = __decorate([
    core_1.NgModule({
        imports: [forms_1.FormsModule, http_1.HttpModule, platform_browser_1.BrowserModule, app_routing_1.AppRoutingModule],
        declarations: [...Components, ...app_routing_1.RoutingComponents],
        bootstrap: [app_component_1.AppComponent]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map