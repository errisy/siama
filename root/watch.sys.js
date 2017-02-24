"use strict";
const fs = require("fs");
const child_process = require("child_process");
//load server.json
let config = JSON.parse(fs.readFileSync('server-dev.json').toString());
console.log(config);
class Watcher {
    constructor(config) {
        this.config = config;
    }
    start() {
        this.watch();
        this.executeFile();
    }
    watch() {
        if (!fs.existsSync(config.main))
            console.warn(`Main File "${config.main}" could not be found!`);
        fs.watchFile(config.main, (curr, prev) => {
            this.killChild('Main File Changed');
            if (fs.existsSync(config.main))
                this.executeFile();
        });
        if (Array.isArray(this.config.watches)) {
            this.config.watches.forEach(file => {
                if (!fs.existsSync(file))
                    console.warn(`File "${file}" could not be found!`);
                fs.watchFile(file, (curr, prev) => {
                    this.killChild('Dependency File Changed');
                    if (fs.existsSync(config.main))
                        this.executeFile();
                });
            });
        }
        if (config.key || config.cert) {
            console.log('Key and Cert file settings was found. Make sure you use crontab to schedule letsencrypt new.');
        }
        if (config.key) {
            if (fs.existsSync(config.key)) {
                fs.watchFile(config.key, (curr, prev) => {
                    this.killChild('Key File Changed');
                    if (fs.existsSync(config.main))
                        this.executeFile();
                });
            }
            else {
                console.warn(`${(new Date()).toLocaleString()} - Warning: Key file does not exist!`);
            }
        }
        if (config.cert) {
            if (fs.existsSync(config.cert)) {
                fs.watchFile(config.key, (curr, prev) => {
                    this.killChild('Cert File Changed');
                    if (fs.existsSync(config.main))
                        this.executeFile();
                });
            }
            else {
                console.warn(`${(new Date()).toLocaleString()} - Warning: Cert file does not exist!`);
            }
        }
    }
    killChild(reason) {
        if (this.currentChild) {
            console.log(`${(new Date()).toLocaleString()} - ${reason} => Kill process: `, this.currentChild.pid);
            this.currentChild.send('exit');
            process.kill(this.currentChild.pid);
            this.currentChild = undefined;
        }
    }
    executeFile() {
        console.log(`${(new Date()).toLocaleString()} - Execute file: ${config.main}`);
        this.currentChild = child_process.fork(config.main); //'node ' + 
        //this.currentChild.send(JSON.stringify({ Port: port, CORS: cors }));
        this.currentChild.on('message', (value) => {
            switch (value) {
                case 'restart':
                    console.log('restarting on uncaught error...');
                    this.killChild('Uncaught Error');
                    if (fs.existsSync(config.main))
                        this.executeFile();
                    break;
            }
        });
    }
}
const watcher = new Watcher(config);
watcher.start();
//# sourceMappingURL=watch.sys.js.map