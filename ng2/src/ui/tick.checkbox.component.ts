import { Component, Input, Output, ViewEncapsulation, AfterContentInit, EventEmitter, HostListener, HostBinding } from '@angular/core';

@Component({
    selector: 'ui-checkbox-tick,[ui-checkbox-tick]',
    templateUrl: $packer.Angular2TemplateURL('ui/tick.checkbox.component.html'),
    styleUrls: [$packer.Angular2StyleURL('ui/tick.checkbox.component.min.css')],
    encapsulation: ViewEncapsulation.Emulated
})
export class TickCheckboxComponent {
    @Input() public readonly: boolean = false;
    @HostListener('click') onClick() {
        if (this.readonly) return;
        this.checked = !this.checked;
        this.CheckedChange.emit(this.checked);
    }
    private checked: boolean = false;
    @HostBinding('class.ui-checkbox-tick') ComponentClass: boolean = true;
    @Input('ui-checkbox-tick') set Checked(value: boolean) {
        this.checked = value;
    }
    @Output('ui-checkbox-tickChange') CheckedChange: EventEmitter<boolean> = new EventEmitter<boolean>(true);
}