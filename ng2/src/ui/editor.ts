import { Directive, HostListener, ElementRef, Input, Output,  EventEmitter } from '@angular/core';
import * as util from 'errisy-util';

@Directive({
    selector: '[editor]'
})
export class SpanEditor {

    @Output() editorChange = new EventEmitter();
    @Input() get editor() {
        //console.log('try to get editable');
        return this.value;
    }
    set editor(value: string) {
        //console.log('try to set editable', value);
        if (this.value == value) return;
        this.value = value;
        if (this.value == null || this.value == undefined) {
            this.value = '';
        }
        else if (typeof this.value != 'string') {
            this.value = String(this.value);
        }
        this.span.innerHTML = util.escapeHTML(this.value);
        let b = document;
    }
    private keyFilter: ($event: KeyboardEvent) => any;
    @Input() set type(value: undefined | null | 'l' | 'n' | 'z' | 'r') {
        if (value) {
            switch (value) {
                case 'l':
                    this.keyFilter = ($event: KeyboardEvent) => {
                        if ($event.key) {
                            if (!/^([a-z0-9]|F\d+|Tab|ArrowLeft|ArrowRight|Backspace|Delete)$/i.test($event.key)) $event.preventDefault();
                        }
                        else if ($event.keyCode) {
                            let k = $event.keyCode;
                            if (!((k == 45) || (k > 47 && k < 58) || (k > 65 && k < 91) || (k > 96 && k < 123) || (k == 8))) $event.preventDefault();
                        }
                    }
                    break;
                case 'n':
                    this.keyFilter = ($event: KeyboardEvent) => {
                        if ($event.key) {
                            if (!/^(\d|F\d+|Tab|ArrowLeft|ArrowRight|Backspace|Delete)$/i.test($event.key)) $event.preventDefault();
                        }
                        else if ($event.keyCode) {
                            let k = $event.keyCode;
                            if (!((k == 45) || (k > 47 && k < 58) || (k > 65 && k < 91) || (k > 96 && k < 123) || (k == 8))) $event.preventDefault();
                        }
                    }
                    break;
                case 'z':
                    this.keyFilter = ($event: KeyboardEvent) => {
                        if ($event.key) {
                            if (!/^(\d|\-|F\d+|Tab|ArrowLeft|ArrowRight|Backspace|Delete)$/i.test($event.key)) $event.preventDefault();
                        }
                        else if ($event.keyCode) {
                            let k = $event.keyCode;
                            if (!((k == 45) || (k > 47 && k < 58) || (k == 8))) $event.preventDefault();
                        }
                    }
                    break;
                case 'r':
                    this.keyFilter = ($event: KeyboardEvent) => {
                        if ($event.key) {
                            if (!/^(\d|\-|\.|F\d+|Tab|ArrowLeft|ArrowRight|Backspace|Delete)$/i.test($event.key)) $event.preventDefault();
                        }
                        else if ($event.keyCode) {
                            let k = $event.keyCode;
                            if (!((k == 45) || (k > 47 && k < 58) || (k == 46) || (k == 8))) $event.preventDefault();
                        }
                    }
                    break;
                default:
                    this.keyFilter = undefined;
                    break;
            }
        }
    }
    private value: string;
    private span: HTMLSpanElement;
    constructor(private elementRef: ElementRef) {
        this.span = this.elementRef.nativeElement;
        this.span.setAttribute('contenteditable', 'true');
        //console.log('construction function: ', this.value);
    }
    @HostListener('keydown', ['$event'])
    onKeydown($event: KeyboardEvent) {
        //alert(` ${$event.key} code: ${$event.keyCode}`);
        if (this.keyFilter) this.keyFilter($event);
    }
    @HostListener('keyup')
    onKeyup() {
        let value = this.span.innerHTML;
        this.value = util.unescapeHTML(value);
        this.editorChange.emit(this.value);
    }
}