"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const core_1 = require("@angular/core");
let RightBtnComponent = class RightBtnComponent {
};
RightBtnComponent = __decorate([
    core_1.Component({
        selector: 'ui-btn-right,[ui-btn-right]',
        templateUrl: $packer.Angular2TemplateURL('ui/right.btn.component.html'),
        styleUrls: [$packer.Angular2StyleURL('ui/line.btn.component.min.css')],
        encapsulation: core_1.ViewEncapsulation.Emulated
    })
], RightBtnComponent);
exports.RightBtnComponent = RightBtnComponent;
//# sourceMappingURL=right.btn.component.js.map