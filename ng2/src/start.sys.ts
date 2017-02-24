
import * as cluster from 'cluster';
import * as path from 'path';
import * as os from 'os'; 
import * as fs from 'fs';

import { IServerOptions, HttpsServer, HttpServer, DomainMiddleware, HostRedirctMiddleware, FileWhiteListMiddleware, FrontEndRouterMiddleware, FileMiddleware, SessionMiddleware, RPCMiddleware, SYSMiddleware, WrappedMiddleware } from 'errisy-server';

const numberOfProcesses = 1;// os.cpus().length; //get the number of cpus

//load server.json
const day = 86400000;

if (cluster.isMaster) {
 
    let workers: cluster.Worker[] = [];

    for (let i = 0; i < numberOfProcesses; i++) {
        let worker = cluster.fork();
        workers.push(worker);
    }
}
else {
    //const session = new SessionMiddleware(config.session); 
    const http = new HttpServer(80);
    http.Middlewares = [
        new DomainMiddleware([
            {
                regex: /(localhost|127\.0\.0\.1|\w*\.?rickettyrick\.bridge)$/ig,
                root: [__dirname],
                middlewares: [
                    new SYSMiddleware(),
                    new RPCMiddleware(true, false),
                    new FrontEndRouterMiddleware([
                        {
                            file: 'index.html',
                            patterns: [
                                /^\/(|report)$/ig
                            ]
                        }
                    ]),
                    new FileMiddleware()
                    //new FileWhiteListMiddleware([/^\/index\.html$/g, /^\/img\//g, /^\/out\.js/g, /^\/systemjs\.config\.js/g])
                ]
            }
        ])
    ]

    http.start();
}


