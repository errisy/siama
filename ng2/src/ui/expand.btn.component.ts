import { Component, Input, Output, ViewEncapsulation, AfterContentInit } from '@angular/core';

@Component({
    selector: 'ui-btn-expand,[ui-btn-expand]',
    templateUrl: $packer.Angular2TemplateURL('ui/expand.btn.component.html'),
    styleUrls: [$packer.Angular2StyleURL('ui/expand.btn.component.min.css')],
    encapsulation: ViewEncapsulation.Emulated
})
export class ExpandBtnComponent {

    @Input() public set Expanded(value: boolean) {
        this.SVGClass = value ? 'expanded' : 'shrinked';
    }
    public SVGClass: string = 'expanded';
}