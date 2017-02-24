import { Component, Input, Output, ViewEncapsulation, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import * as rpc from 'errisy-rpc';
import { AppService } from './app.client';
import { Report } from './report.type';
import * as util from 'errisy-util'; 

@Component({
    selector: 'ui-report,[ui-report]',
    templateUrl: $packer.Angular2TemplateURL('app/report.component.html'),
    styleUrls: [$packer.Angular2StyleURL('app/report.component.css')],
    encapsulation: ViewEncapsulation.Emulated,
    providers: [AppService]
})
export class ReportComponent implements AfterContentInit  {

    constructor(private appService: AppService, private changeDetectorRef: ChangeDetectorRef) {

    }
    public readonly: boolean = true;

    public report: Report = <any>{};
    public error: string;
    private errorTask: rpc.Task<any>;
    public showError(value: string) {
        if (this.errorTask) this.errorTask.cancel();
        this.errorTask = this.showErrorTask(value);
    }
    async showErrorTask(value: string) {
        this.error = value;
        await util.wait(1500);
        this.error = '';
        this.changeDetectorRef.detectChanges();
    }
    async ngAfterContentInit() {
        try {
            let result = await this.appService.loadReport('id');
            this.report = result;
        }
        catch (e) {
            this.showError((<rpc.RPCError>e).reason);
        }
    }

    async onImageChange(ev: Event) {
        let fileList = (<HTMLInputElement>(ev.target)).files;
        if (fileList === undefined || fileList.length == 0) return;
        let file = fileList.item(0);
        if (file.size > 2 * 1024 * 1024) {
            this.error = 'Image is greater than 2M!'
        }
        else {
            try {
                this.report.Image = await this.appService.upload(file);
                this.changeDetectorRef.detectChanges();
            }
            catch (e) {
                this.showError((<rpc.RPCError>e).reason);
            }
        }
    }

    Clear() {
        this.report = <any>{};
    }
    async Delete() {
        try {
            if (await this.appService.deleteReport(this.report.InspectionNumber)) {
                this.report = <any>{};
            }
        }
        catch (e) {
            this.showError((<rpc.RPCError>e).reason);
        }
    }
    checkError(): boolean {
        if (!this.report) {
            this.showError('Invalid report!');
            this.report = <any>{};
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
    async Submit() {
        if (this.checkError()) return;
        try {
            await this.appService.saveReport(this.report);
        }
        catch (e) {
            this.showError((<rpc.RPCError>e).reason);
        }
    }
}