import { Component, Input, Output, ViewEncapsulation } from '@angular/core';



@Component({
    selector: 'ui-pagenotfound,[ui-pagenotfound]',
    templateUrl: $packer.Angular2TemplateURL('app/pagenotfound.component.html'),
    styleUrls: [$packer.Angular2StyleURL('app/pagenotfound.component.css')],
    encapsulation: ViewEncapsulation.Emulated
})
export class PageNotFoundComponent {

    constructor() {

    }
}