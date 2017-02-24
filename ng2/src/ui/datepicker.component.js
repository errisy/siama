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
let DatePickerComponent = class DatePickerComponent {
    constructor(changeDetectorRef) {
        this.changeDetectorRef = changeDetectorRef;
        this._readonly = false;
        this.Dropped = false;
        this.Months = [];
        this.ComponentClass = true;
        this.datepickerChange = new core_1.EventEmitter(true);
        this.SetToday();
        for (let i = 1; i <= 12; i++)
            this.Months.push(i);
    }
    get readonly() {
        return this._readonly;
    }
    set readonly(value) {
        this._readonly = value;
        if (this._readonly)
            this.Dropped = false;
    }
    get Dates() {
        let dates = [];
        let first = new Date(this.Year, this.Month - 1, 1);
        for (let i = 1; i <= first.getDay(); i++) {
            dates.push(null);
        }
        for (let i = 1; i <= DateUtil.LastDayOfMonth(this.Year, this.Month); i++) {
            dates.push(i);
        }
        return dates;
    }
    SelectYear() {
        this.CenterYear = this.Year;
        this.Mode = 'Year';
    }
    YearScroll($event) {
        this.CenterYear -= $event.wheelDeltaY / 50;
        this.changeDetectorRef.detectChanges();
        $event.stopPropagation();
    }
    get Years() {
        let years = [];
        let begin = this.CenterYear - 7;
        if (begin < 0)
            begin -= 1;
        while (years.length < 15) {
            years.push(begin);
            begin += 1;
            if (begin == 0)
                begin = 1;
        }
        return years;
    }
    DecreaseYear() {
        this.Year = (this.Year == 1) ? -1 : (this.Year - 1);
        this.CheckMaxDate();
    }
    IncreaseYear() {
        this.Year = (this.Year == -1) ? 1 : (this.Year + 1);
        this.CheckMaxDate();
    }
    DecreaseMonth() {
        this.Month = (this.Month <= 1) ? 1 : (this.Month - 1);
        this.CheckMaxDate();
    }
    IncreaseMonth() {
        this.Month = (this.Month >= 12) ? 12 : (this.Month + 1);
        this.CheckMaxDate();
    }
    DecreaseDate() {
        this.Date = (this.Date <= 1) ? 1 : (this.Date - 1);
    }
    IncreaseDate() {
        this.Date = (this.Date >= DateUtil.LastDayOfMonth(this.Year, this.Month)) ? DateUtil.LastDayOfMonth(this.Year, this.Month) : (this.Date + 1);
    }
    CheckMaxDate() {
        if (this.Date >= DateUtil.LastDayOfMonth(this.Year, this.Month))
            this.Date = DateUtil.LastDayOfMonth(this.Year, this.Month);
    }
    SetToday() {
        let day = new Date();
        this.Year = day.getFullYear();
        this.Month = day.getMonth() + 1;
        this.Date = day.getDate();
    }
    Switch() {
        if (this.readonly)
            return;
        this.Dropped = !this.Dropped;
    }
    Cancel() {
        this.Dropped = false;
    }
    Accept() {
        this.Dropped = false;
        this.datepickerChange.emit(`${DateUtil.PadLeft(this.Date.toString(), 2, '0')}\/${DateUtil.PadLeft(this.Month.toString(), 2, '0')}\/${this.Year}`);
    }
    set datepicker(value) {
        if (/(\d{1,2})\/(\d{1,2})\/(\d+)/ig.test(value)) {
            let arr = /(\d{1,2})\/(\d{1,2})\/(\d+)/ig.exec(value);
            this.Year = Number(arr[3]);
            this.Month = Number(arr[2]);
            this.Date = Number(arr[1]);
        }
        else {
            this.SetToday();
        }
    }
};
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], DatePickerComponent.prototype, "readonly", null);
__decorate([
    core_1.HostBinding('class.ui-datepicker'),
    __metadata("design:type", Boolean)
], DatePickerComponent.prototype, "ComponentClass", void 0);
__decorate([
    core_1.Input('ui-datepicker'),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], DatePickerComponent.prototype, "datepicker", null);
__decorate([
    core_1.Output('ui-datepickerChange'),
    __metadata("design:type", core_1.EventEmitter)
], DatePickerComponent.prototype, "datepickerChange", void 0);
DatePickerComponent = __decorate([
    core_1.Component({
        selector: 'ui-datepicker,[ui-datepicker]',
        templateUrl: $packer.Angular2TemplateURL('ui/datepicker.component.html'),
        styleUrls: [$packer.Angular2StyleURL('ui/datepicker.component.min.css')],
        encapsulation: core_1.ViewEncapsulation.Emulated
    }),
    __metadata("design:paramtypes", [core_1.ChangeDetectorRef])
], DatePickerComponent);
exports.DatePickerComponent = DatePickerComponent;
class DateUtil {
    static LastDayOfMonth(year, month) {
        let add = 27;
        let day = Number(new Date(year, month - 1, 1));
        while ((new Date(day + add * DateUtil.DayLength)).getDate() >= 28) {
            add += 1;
        }
        return add;
    }
    static PadLeft(value, length, char) {
        let chars = '';
        while (chars.length < length)
            chars += char;
        chars = chars.substr(0, length);
        return chars.substr(0, length - value.length) + value;
    }
}
DateUtil.DayLength = 86400000;
//# sourceMappingURL=datepicker.component.js.map