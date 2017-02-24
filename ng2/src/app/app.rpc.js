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
const rpc = require("errisy-rpc");
const report_type_1 = require("./report.type");
const fs = require("fs");
/**
 * In nodeJS, since we are very likely to use cluster to do process load balancing,
 * it basically makes no sense to store anything in the http server instance, as they won't be shared between processes.
 * this is just for full stack demo purpose.
 */
let report = new report_type_1.Report();
report.DeckType = 'Concrete';
report.HighwayBridge = true;
report.MaintenanceRequest = true;
report.InspectionDate = '20\/02\/2015';
report.StructureNumber = '123456';
report.InspectionNumber = '12345C';
report.Image = 'img/bridges/storybridge.jpg';
/**
 * the RPC service example.
 */
let AppService = class AppService extends rpc.RPCService {
    /**
     * File upload
     * @param file
     */
    upload(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '/img/bridges/';
            if (file.size > 2 * 1024 * 1024) {
                fs.unlinkSync(file.path);
                throw new rpc.RPCError('file size is greater than 2M!');
            }
            else {
                let type = /(jpg|jpeg|png|gif)/ig.exec(file.type);
                if (!type || !type[1])
                    throw new rpc.RPCError('Invalid File Type!');
                let name = file.name;
                let filename = file.path.substr(file.path.lastIndexOf('\/') + 1);
                fs.renameSync(file.path, `${this.$rootDir}${path}${filename}.${type[1]}`);
                return `${path}${filename}.${type[1]}`;
            }
        });
    }
    /**
     * load report by id
     * @param file
     */
    loadReport(id) {
        return __awaiter(this, void 0, void 0, function* () {
            //shall do database query here in real production.
            return report;
        });
    }
    /**
     * save report
     * @param report
     */
    saveReport(value) {
        return __awaiter(this, void 0, void 0, function* () {
            //shall do datebase update here in real production.
            report = value;
            return true;
        });
    }
    /**
     * delete the report.
     * @param InspectionNumber
     */
    deleteReport(InspectionNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            //shall do database delete/update in real production.
            if (report.InspectionNumber == InspectionNumber) {
                report = {};
                return true;
            }
            else {
                throw new rpc.RPCError(`Inspection Number ${InspectionNumber} is not found in database!`);
            }
        });
    }
};
__decorate([
    rpc.member,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [rpc.Polyfill.File]),
    __metadata("design:returntype", Promise)
], AppService.prototype, "upload", null);
__decorate([
    rpc.member,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppService.prototype, "loadReport", null);
__decorate([
    rpc.member,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_type_1.Report]),
    __metadata("design:returntype", Promise)
], AppService.prototype, "saveReport", null);
__decorate([
    rpc.member,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppService.prototype, "deleteReport", null);
AppService = __decorate([
    rpc.service
], AppService);
exports.AppService = AppService;
if (module)
    module.exports = exports;
//# sourceMappingURL=app.rpc.js.map