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
let TickCheckboxComponent = class TickCheckboxComponent {
    constructor() {
        this.readonly = false;
        this.checked = false;
        this.ComponentClass = true;
        this.CheckedChange = new core_1.EventEmitter(true);
    }
    onClick() {
        if (this.readonly)
            return;
        this.checked = !this.checked;
        this.CheckedChange.emit(this.checked);
    }
    set Checked(value) {
        this.checked = value;
    }
};
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], TickCheckboxComponent.prototype, "readonly", void 0);
__decorate([
    core_1.HostListener('click'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TickCheckboxComponent.prototype, "onClick", null);
__decorate([
    core_1.HostBinding('class.ui-checkbox-tick'),
    __metadata("design:type", Boolean)
], TickCheckboxComponent.prototype, "ComponentClass", void 0);
__decorate([
    core_1.Input('ui-checkbox-tick'),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], TickCheckboxComponent.prototype, "Checked", null);
__decorate([
    core_1.Output('ui-checkbox-tickChange'),
    __metadata("design:type", core_1.EventEmitter)
], TickCheckboxComponent.prototype, "CheckedChange", void 0);
TickCheckboxComponent = __decorate([
    core_1.Component({
        selector: 'ui-checkbox-tick,[ui-checkbox-tick]',
        templateUrl: $packer.Angular2TemplateURL('ui/tick.checkbox.component.html'),
        styleUrls: [$packer.Angular2StyleURL('ui/tick.checkbox.component.min.css')],
        encapsulation: core_1.ViewEncapsulation.Emulated
    })
], TickCheckboxComponent);
exports.TickCheckboxComponent = TickCheckboxComponent;
//# sourceMappingURL=tick.checkbox.component.js.map