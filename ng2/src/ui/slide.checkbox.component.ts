import { Component, Input, Output, ViewEncapsulation, AfterContentInit, EventEmitter, HostListener, HostBinding } from '@angular/core';

@Component({
    selector: 'ui-checkbox-slide,[ui-checkbox-slide]',
    templateUrl: $packer.Angular2TemplateURL('ui/slide.checkbox.component.html'),
    styleUrls: [$packer.Angular2StyleURL('ui/slide.checkbox.component.min.css')],
    encapsulation: ViewEncapsulation.Emulated
})
export class SlideCheckboxComponent {
    @Input() public readonly: boolean = false;
    @HostListener('click') onClick() {
        if (this.readonly) return;
        this.checked = !this.checked;
        this.CheckedChange.emit(this.checked);
    }
    private checked: boolean = false; 
    @HostBinding('class.ui-checkbox-slide') ComponentClass:boolean = true;
    @Input('ui-checkbox-slide') set Checked(value: boolean) {
        this.checked = value;
    }
    @Output('ui-checkbox-slideChange') CheckedChange: EventEmitter<boolean> = new EventEmitter<boolean>(true);
}