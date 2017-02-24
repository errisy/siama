import { Component, Input, Output, ViewEncapsulation, AfterContentInit } from '@angular/core';

@Component({
    selector: 'ui-btn-cancel,[ui-btn-cancel]',
    templateUrl: $packer.Angular2TemplateURL('ui/cancel.btn.component.html'),
    styleUrls: [$packer.Angular2StyleURL('ui/line.btn.component.min.css')],
    encapsulation: ViewEncapsulation.Emulated
})
export class CancelBtnComponent {
}