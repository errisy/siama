import * as rpc from 'errisy-rpc';
import { Report } from './report.type';
import * as fs from 'fs';


/**
 * In nodeJS, since we are very likely to use cluster to do process load balancing,
 * it basically makes no sense to store anything in the http server instance, as they won't be shared between processes.
 * this is just for full stack demo purpose.
 */
let report = new Report();

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
@rpc.service
export class AppService extends rpc.RPCService {
    /**
     * File upload
     * @param file
     */
    @rpc.member
    public async upload(file: rpc.Polyfill.File): Promise<string> {
        let path: string = '/img/bridges/';
        if (file.size > 2 * 1024 * 1024) {
            fs.unlinkSync(file.path);
            throw new rpc.RPCError('file size is greater than 2M!');
        }
        else {
            let type = /(jpg|jpeg|png|gif)/ig.exec(file.type);
            if (!type || !type[1]) throw new rpc.RPCError('Invalid File Type!');
            let name = file.name;
            let filename = file.path.substr(file.path.lastIndexOf('\/') + 1);
            fs.renameSync(file.path, `${this.$rootDir}${path}${filename}.${type[1]}`);
            return `${path}${filename}.${type[1]}`;
        }
    }
    /**
     * load report by id
     * @param file
     */
    @rpc.member
    public async loadReport(id: string): Promise<Report> {
        //shall do database query here in real production.
        return report;
    }
    /**
     * save report
     * @param report
     */
    @rpc.member
    public async saveReport(value: Report): Promise<boolean> {
        //shall do datebase update here in real production.
        report = value;
        return true;
    }
    /**
     * delete the report.
     * @param InspectionNumber
     */
    @rpc.member
    public async deleteReport(InspectionNumber: string): Promise<boolean> {
        //shall do database delete/update in real production.
        if (report.InspectionNumber == InspectionNumber) {
            report = <any>{};
            return true;
        }
        else {
            throw new rpc.RPCError(`Inspection Number ${InspectionNumber} is not found in database!`);
        }
    }
}

if (module) module.exports = exports;