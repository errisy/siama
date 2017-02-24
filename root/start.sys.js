"use strict";
const cluster = require("cluster");
const errisy_server_1 = require("errisy-server");
const numberOfProcesses = 1; // os.cpus().length; //get the number of cpus
//load server.json
const day = 86400000;
if (cluster.isMaster) {
    let workers = [];
    for (let i = 0; i < numberOfProcesses; i++) {
        let worker = cluster.fork();
        workers.push(worker);
    }
}
else {
    //const session = new SessionMiddleware(config.session); 
    const http = new errisy_server_1.HttpServer(80);
    http.Middlewares = [
        new errisy_server_1.DomainMiddleware([
            {
                regex: /(localhost|127\.0\.0\.1|\w*\.?rickettyrick\.bridge)$/ig,
                root: [__dirname],
                middlewares: [
                    new errisy_server_1.SYSMiddleware(),
                    new errisy_server_1.RPCMiddleware(true, false),
                    new errisy_server_1.FrontEndRouterMiddleware([
                        {
                            file: 'index.html',
                            patterns: [
                                /^\/(|report)$/ig
                            ]
                        }
                    ]),
                    new errisy_server_1.FileMiddleware()
                ]
            }
        ])
    ];
    http.start();
}
//# sourceMappingURL=start.sys.js.map