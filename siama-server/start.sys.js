"use strict";
const path = require("path");
const errisy_server_1 = require("errisy-server");
const numberOfProcesses = 1; // os.cpus().length; //get the number of cpus
//load server.json
//let config: IServerOptions = JSON.parse(fs.readFileSync('server-dev.json').toString());
const day = 86400000;
const http = new errisy_server_1.HttpServer(80);
http.Middlewares = [
    new errisy_server_1.DomainMiddleware([
        {
            regex: /(localhost|127\.0\.0\.1|\w*\.?rickettyrick\.bridge)$/ig,
            root: [path.join(__dirname, '..', 'root')],
            middlewares: [
                new errisy_server_1.SYSMiddleware(),
                new errisy_server_1.RPCMiddleware(false, false),
                new errisy_server_1.FrontEndRouterMiddleware([
                    {
                        file: 'index.html',
                        patterns: [
                            /^\/(|report)$/ig
                        ]
                    }
                ]),
                new errisy_server_1.FileWhiteListMiddleware([/^\/index\.html$/g, /^\/img\//g])
            ]
        }
    ])
];
http.start();
//# sourceMappingURL=start.sys.js.map