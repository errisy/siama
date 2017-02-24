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
let SlideCheckboxComponent = class SlideCheckboxComponent {
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
], SlideCheckboxComponent.prototype, "readonly", void 0);
__decorate([
    core_1.HostListener('click'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlideCheckboxComponent.prototype, "onClick", null);
__decorate([
    core_1.HostBinding('class.ui-checkbox-slide'),
    __metadata("design:type", Boolean)
], SlideCheckboxComponent.prototype, "ComponentClass", void 0);
__decorate([
    core_1.Input('ui-checkbox-slide'),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], SlideCheckboxComponent.prototype, "Checked", null);
__decorate([
    core_1.Output('ui-checkbox-slideChange'),
    __metadata("design:type", core_1.EventEmitter)
], SlideCheckboxComponent.prototype, "CheckedChange", void 0);
SlideCheckboxComponent = __decorate([
    core_1.Component({
        selector: 'ui-checkbox-slide,[ui-checkbox-slide]',
        templateUrl: $packer.Angular2TemplateURL('ui/slide.checkbox.component.html'),
        styleUrls: [$packer.Angular2StyleURL('ui/slide.checkbox.component.min.css')],
        encapsulation: core_1.ViewEncapsulation.Emulated
    })
], SlideCheckboxComponent);
exports.SlideCheckboxComponent = SlideCheckboxComponent;
//# sourceMappingURL=slide.checkbox.component.js.map