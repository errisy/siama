
import * as cluster from 'cluster';
import * as path from 'path';
import * as os from 'os'; 
import * as fs from 'fs';
import * as path from 'path';

import { IServerOptions, HttpsServer, HttpServer, DomainMiddleware, HostRedirctMiddleware, FileWhiteListMiddleware, FrontEndRouterMiddleware, FileMiddleware, SessionMiddleware, RPCMiddleware, SYSMiddleware, WrappedMiddleware } from 'errisy-server';





const numberOfProcesses = 1;// os.cpus().length; //get the number of cpus

//load server.json
//let config: IServerOptions = JSON.parse(fs.readFileSync('server-dev.json').toString());
const day = 86400000;


const http = new HttpServer(80);
http.Middlewares = [
    new DomainMiddleware([
        {
            regex: /(localhost|127\.0\.0\.1|\w*\.?rickettyrick\.bridge)$/ig,
            root: [path.join(__dirname, '..', 'root')],
            middlewares: [
                new SYSMiddleware(),
                new RPCMiddleware(false, false),
                new FrontEndRouterMiddleware([
                    {
                        file: 'index.html',
                        patterns: [
                            /^\/(|report)$/ig
                        ]
                    }
                ]),
                new FileWhiteListMiddleware([/^\/index\.html$/g, /^\/img\//g])
            ]
        }
    ])
]

http.start();
 