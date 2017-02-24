"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require("@angular/core");
let ExpandBtnComponent = class ExpandBtnComponent {
    constructor() {
        this.SVGClass = 'expanded';
    }
    set Expanded(value) {
        this.SVGClass = value ? 'expanded' : 'shrinked';
    }
};
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], ExpandBtnComponent.prototype, "Expanded", null);
ExpandBtnComponent = __decorate([
    core_1.Component({
        selector: 'ui-btn-expand,[ui-btn-expand]',
        templateUrl: $packer.Angular2TemplateURL('ui/expand.btn.component.html'),
        styleUrls: [$packer.Angular2StyleURL('ui/expand.btn.component.min.css')],
        encapsulation: core_1.ViewEncapsulation.Emulated
    })
], ExpandBtnComponent);
exports.ExpandBtnComponent = ExpandBtnComponent;
//# sourceMappingURL=expand.btn.component.js.map