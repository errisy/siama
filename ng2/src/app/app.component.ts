import {
    Component, ElementRef, ViewChild, ContentChild, QueryList, ContentChildren, OnInit, ComponentFactoryResolver, AfterContentInit, ViewEncapsulation, 
    AfterViewInit, HostListener, EventEmitter, NgZone, ChangeDetectorRef, ApplicationRef, ChangeDetectionStrategy, ViewContainerRef
} from '@angular/core';
import { Router } from '@angular/router';

import { CompleterModule, CompleterService, CompleterCmp } from 'errisy-completer';
 
 

import * as clipboardjs from 'errisy-copy';

import { obs } from 'errisy-bindable';

import * as util from 'errisy-util';

@Component({
    selector: 'my-app,[my-app]',
    templateUrl: $packer.Angular2TemplateURL('app/app.component.html'),
    styleUrls: [$packer.Angular2StyleURL('app/app.component.css')],
    encapsulation: ViewEncapsulation.Emulated
})
export class AppComponent implements AfterContentInit {
 
    public NavigationVisible: boolean = true;
    public SearchText: string = '';

    constructor(private router: Router) {

    }
    async ngAfterContentInit() {
    }
    get url() {
        return this.router.url;
    }
    navigate(parameters: any[]) {
        this.router.navigate(parameters);
    }
}