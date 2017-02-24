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
const util = require("errisy-util");
let SpanEditor = class SpanEditor {
    constructor(elementRef) {
        this.elementRef = elementRef;
        this.editorChange = new core_1.EventEmitter();
        this.span = this.elementRef.nativeElement;
        this.span.setAttribute('contenteditable', 'true');
        //console.log('construction function: ', this.value);
    }
    get editor() {
        //console.log('try to get editable');
        return this.value;
    }
    set editor(value) {
        //console.log('try to set editable', value);
        if (this.value == value)
            return;
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
    set type(value) {
        if (value) {
            switch (value) {
                case 'l':
                    this.keyFilter = ($event) => {
                        if ($event.key) {
                            if (!/^([a-z0-9]|F\d+|Tab|ArrowLeft|ArrowRight|Backspace|Delete)$/i.test($event.key))
                                $event.preventDefault();
                        }
                        else if ($event.keyCode) {
                            let k = $event.keyCode;
                            if (!((k == 45) || (k > 47 && k < 58) || (k > 65 && k < 91) || (k > 96 && k < 123) || (k == 8)))
                                $event.preventDefault();
                        }
                    };
                    break;
                case 'n':
                    this.keyFilter = ($event) => {
                        if ($event.key) {
                            if (!/^(\d|F\d+|Tab|ArrowLeft|ArrowRight|Backspace|Delete)$/i.test($event.key))
                                $event.preventDefault();
                        }
                        else if ($event.keyCode) {
                            let k = $event.keyCode;
                            if (!((k == 45) || (k > 47 && k < 58) || (k > 65 && k < 91) || (k > 96 && k < 123) || (k == 8)))
                                $event.preventDefault();
                        }
                    };
                    break;
                case 'z':
                    this.keyFilter = ($event) => {
                        if ($event.key) {
                            if (!/^(\d|\-|F\d+|Tab|ArrowLeft|ArrowRight|Backspace|Delete)$/i.test($event.key))
                                $event.preventDefault();
                        }
                        else if ($event.keyCode) {
                            let k = $event.keyCode;
                            if (!((k == 45) || (k > 47 && k < 58) || (k == 8)))
                                $event.preventDefault();
                        }
                    };
                    break;
                case 'r':
                    this.keyFilter = ($event) => {
                        if ($event.key) {
                            if (!/^(\d|\-|\.|F\d+|Tab|ArrowLeft|ArrowRight|Backspace|Delete)$/i.test($event.key))
                                $event.preventDefault();
                        }
                        else if ($event.keyCode) {
                            let k = $event.keyCode;
                            if (!((k == 45) || (k > 47 && k < 58) || (k == 46) || (k == 8)))
                                $event.preventDefault();
                        }
                    };
                    break;
                default:
                    this.keyFilter = undefined;
                    break;
            }
        }
    }
    onKeydown($event) {
        //alert(` ${$event.key} code: ${$event.keyCode}`);
        if (this.keyFilter)
            this.keyFilter($event);
    }
    onKeyup() {
        let value = this.span.innerHTML;
        this.value = util.unescapeHTML(value);
        this.editorChange.emit(this.value);
    }
};
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], SpanEditor.prototype, "editorChange", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [String])
], SpanEditor.prototype, "editor", null);
__decorate([
    core_1.Input(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], SpanEditor.prototype, "type", null);
__decorate([
    core_1.HostListener('keydown', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [KeyboardEvent]),
    __metadata("design:returntype", void 0)
], SpanEditor.prototype, "onKeydown", null);
__decorate([
    core_1.HostListener('keyup'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SpanEditor.prototype, "onKeyup", null);
SpanEditor = __decorate([
    core_1.Directive({
        selector: '[editor]'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], SpanEditor);
exports.SpanEditor = SpanEditor;
//# sourceMappingURL=editor.js.map