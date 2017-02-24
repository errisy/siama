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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
try{
    if(require.resolve("errisy-task")){
        let ErrisyTask = require("errisy-task");
        __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
            return new (P || (P = ErrisyTask))(function (resolve, reject, t) {
                if(t){
                    function fulfilled(value) { try { if(!t.cancelled) step(generator.next(value)); } catch (e) { reject(e); } }
                    function rejected(value) { try { if(!t.cancelled) step(generator["throw"](value)); } catch (e) { reject(e); } }
                    function step(result) { t.clear(), result.done ? resolve(result.value) : t.append(new P(function (resolve) { resolve(result.value); })).then(fulfilled, rejected); }
                    step((generator = generator.apply(thisArg, _arguments || [])).next()); 
                }
                else{
                    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                    function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                }
            });
        }
    }
}
catch(e){}
const core_1 = require("@angular/core");
const app_client_1 = require("./app.client");
const util = require("errisy-util");
let ReportComponent = class ReportComponent {
    constructor(appService, changeDetectorRef) {
        this.appService = appService;
        this.changeDetectorRef = changeDetectorRef;
        this.readonly = true;
        this.report = {};
    }
    showError(value) {
        if (this.errorTask)
            this.errorTask.cancel();
        this.errorTask = this.showErrorTask(value);
    }
    showErrorTask(value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.error = value;
            yield util.wait(1500);
            this.error = '';
            this.changeDetectorRef.detectChanges();
        });
    }
    ngAfterContentInit() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield this.appService.loadReport('id');
                this.report = result;
            }
            catch (e) {
                this.showError(e.reason);
            }
        });
    }
    onImageChange(ev) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileList = (ev.target).files;
            if (fileList === undefined || fileList.length == 0)
                return;
            let file = fileList.item(0);
            if (file.size > 2 * 1024 * 1024) {
                this.error = 'Image is greater than 2M!';
            }
            else {
                try {
                    this.report.Image = yield this.appService.upload(file);
                    this.changeDetectorRef.detectChanges();
                }
                catch (e) {
                    this.showError(e.reason);
                }
            }
        });
    }
    Clear() {
        this.report = {};
    }
    Delete() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (yield this.appService.deleteReport(this.report.InspectionNumber)) {
                    this.report = {};
                }
            }
            catch (e) {
                this.showError(e.reason);
            }
        });
    }
    checkError() {
        if (!this.report) {
            this.showError('Invalid report!');
            this.report = {};
            return true;
        }
        let report = this.report;
        if (!report.InspectionNumber || !/^\w+$/ig.test(report.InspectionNumber)) {
            this.showError('Invalid Inspection Number!');
            return true;
        }
        if (!report.InspectionDate || !/^\d{2}\/\d{2}\/\d+$/ig.test(report.InspectionDate)) {
            this.showError('Invalid Inspection Date! It must be DD/MM/YYYY format.');
            return true;
        }
        if (!report.StructureNumber || !/^\d+$/ig.test(report.StructureNumber)) {
            this.showError('Invalid Structure Number! It must be digits only.');
            return true;
        }
        return false;
    }
    Submit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.checkError())
                return;
            try {
                yield this.appService.saveReport(this.report);
            }
            catch (e) {
                this.showError(e.reason);
            }
        });
    }
};
ReportComponent = __decorate([
    core_1.Component({
        selector: 'ui-report,[ui-report]',
        templateUrl: $packer.Angular2TemplateURL('app/report.component.html'),
        styleUrls: [$packer.Angular2StyleURL('app/report.component.css')],
        encapsulation: core_1.ViewEncapsulation.Emulated,
        providers: [app_client_1.AppService]
    }),
    __metadata("design:paramtypes", [app_client_1.AppService, core_1.ChangeDetectorRef])
], ReportComponent);
exports.ReportComponent = ReportComponent;
//# sourceMappingURL=report.component.js.map