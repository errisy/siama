import { Component, Input, Output, ViewEncapsulation, AfterContentInit, HostListener, ChangeDetectorRef, EventEmitter, HostBinding } from '@angular/core';

@Component({
    selector: 'ui-datepicker,[ui-datepicker]',
    templateUrl: $packer.Angular2TemplateURL('ui/datepicker.component.html'),
    styleUrls: [$packer.Angular2StyleURL('ui/datepicker.component.min.css')],
    encapsulation: ViewEncapsulation.Emulated
})
export class DatePickerComponent {
    private _readonly: boolean = false;
    public get readonly(): boolean {
        return this._readonly;
    }
    @Input() public set readonly(value: boolean) {
        this._readonly = value;
        if (this._readonly) this.Dropped = false;
    }
    public Dropped: boolean = false;
    public Year: number;
    public Date: number;
    public Month: number;

    public Months: number[] = [];
    constructor(private changeDetectorRef: ChangeDetectorRef) {
        this.SetToday();
        for (let i = 1; i <= 12; i++) this.Months.push(i);
    }
    @HostBinding('class.ui-datepicker') ComponentClass: boolean = true;

    public Mode: 'Year' | 'Month' | 'Date';
    public get Dates() {
        let dates:(null|number)[] = [];
        let first = new Date(this.Year, this.Month - 1, 1);
        for (let i = 1; i <= first.getDay(); i++) {
            dates.push(null);
        }
        for (let i = 1; i <= DateUtil.LastDayOfMonth(this.Year, this.Month); i++) {
            dates.push(i);
        }
        return dates;
    }
    public SelectYear() {
        this.CenterYear = this.Year;
        this.Mode = 'Year';
    }
    public CenterYear: number;
    YearScroll($event: MouseWheelEvent) {
        this.CenterYear -= $event.wheelDeltaY / 50;
        this.changeDetectorRef.detectChanges();
        $event.stopPropagation();
    }
    public get Years() {
        let years: number[] = [];
        let begin = this.CenterYear - 7;
        if (begin < 0) begin -= 1;
        while (years.length < 15) {
            years.push(begin);
            begin += 1;
            if (begin == 0) begin = 1;
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
        if (this.Date >= DateUtil.LastDayOfMonth(this.Year, this.Month)) this.Date = DateUtil.LastDayOfMonth(this.Year, this.Month);
    }
    SetToday() {
        let day = new Date();
        this.Year = day.getFullYear();
        this.Month = day.getMonth() + 1;
        this.Date = day.getDate();
    }
    Switch() {
        if (this.readonly) return;
        this.Dropped = !this.Dropped;
    }
    Cancel() {
        this.Dropped = false;
    }
    Accept() {
        this.Dropped = false;
        this.datepickerChange.emit(`${DateUtil.PadLeft(this.Date.toString(), 2, '0')}\/${DateUtil.PadLeft( this.Month.toString(), 2, '0')}\/${this.Year}`);
    }
    @Input('ui-datepicker') set datepicker(value: string) {
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
    @Output('ui-datepickerChange') datepickerChange: EventEmitter<string> = new EventEmitter<string>(true);
}

class DateUtil {
    static DayLength = 86400000;
    static LastDayOfMonth(year: number, month: number): number {
        let add = 27;
        let day = Number(new Date(year, month - 1, 1));
        while ((new Date(day + add * DateUtil.DayLength)).getDate() >= 28) {
            add += 1;
        }
        return add;
    }
    static PadLeft(value: string, length: number, char: string) {
        let chars = '';
        while (chars.length < length) chars += char;
        chars = chars.substr(0, length);
        return chars.substr(0, length - value.length) + value;
    }
}