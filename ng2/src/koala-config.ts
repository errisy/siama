interface IKoalaOption {
    /**the root of sourc files, by default it is __dirname*/
    SourceRoot?: string;
    /**the server root folder, all the files in which will be uploaded to the server*/
    ServerRoot?: string;
    /**the deploy root, normally the github source folder that can sync files to github*/
    TargetRoot?: string;
    /**the remote url where the static content will be deployed*/
    TargetURL?: string;
    /**rules applied to the server files*/
    ServerFiles?: LoaderOption[];
    ServerManual?: LoaderOption[];
    /**rules applied to the static client files, js, css, html*/
    TargetFiles?: LoaderOption[];

    PackFiles?: { file: string, minify: boolean }[];
    PackTarget?: string;
    BundleModule?: string;
    BundleTarget?: string;

    TargetManuals?: LoaderOption[];
    /**Use what mode to deploy*/
    TargetMode: 'none' | 'system';
    /**system js config*/
    SystemJSConfig?: string;
}
interface LoaderOption {
    /**the rule will check this first*/
    Path?: string;
    /**the rule will check this match */
    Regex?: RegExp;

    CheckMin?: boolean; //will check if *.min.* exists, if exists, we will use the *.min.*, rather than minify it.
    Type: 'file' | 'directory' | 'file regex' | 'directory regex';
    Action: 'copy' | 'minify' | 'prepack' | 'none';
}

let koalaconfig: IKoalaOption = {
    SourceRoot: 'C:/HTTP/siama/ng2/src',
    TargetRoot: 'C:/HTTP/siama/siama-deploy',
    ServerRoot: 'C:/HTTP/siama/root',
    TargetURL: 'http://rawgit.com/errisy/siama-static/master/',
    TargetMode: 'system',
    SystemJSConfig: 'systemjs.config.js',
    TargetFiles: [
        {
            Type: 'file regex',
            Action: 'copy',
            Regex: /\.(svg|jpg|jpeg|gif|png)$/
        },
        {
            Type: 'directory',
            Action: 'none',
            Path: '/'
        },
        {
            Type: 'file regex',
            Action: 'prepack',
            Regex:  /\.component\.js$/ig  // /\/(?![\w\.\-\+#@& ]+\.(sys|rpc)\.js)[\w\.\-\+#@& ]+\.js$/ig
        }
    ],
    TargetManuals: [
        {
            Type: 'file',
            Action: 'copy',
            Path: 'index.html'
        },
        {
            Type: 'file',
            Action: 'copy',
            Path: 'manifest.json'
        },
        {
            Type: 'directory',
            Action: 'copy',
            Path: 'img'
        },
        {
            Type: 'directory',
            Action: 'copy',
            Path: 'svg'
        },
        {
            Type: 'file',
            Action: 'minify',
            Path: 'app.css'
        }
    ],
    PackFiles: [
        { file: 'node_modules/errisy-packer/index.js', minify: true },
        { file: 'node_modules/babel-polyfill/dist/polyfill.js', minify: true },
        { file: 'node_modules/core-js/client/shim.js', minify: true },
        { file: 'node_modules/zone.js/dist/zone.js', minify: true },
        { file: 'node_modules/reflect-metadata/Reflect.js', minify: true },
        { file: 'node_modules/systemjs/dist/system.js', minify: false },
        { file: 'systemjs.config.js', minify: true }
    ],
    PackTarget: 'sys.js',
    BundleModule: 'app',
    BundleTarget: 'app.js',
    ServerFiles: [
        {
            Type: 'directory regex',
            Action: 'none',
            Regex: /\/node_modules$/ig
        },
        {
            Type: 'file regex',
            Action: 'copy',
            Regex: /\/[\w\.\-\+#@& ]+\.(sys|rpc|type).js$/ig
        }
    ],
    ServerManual: [
            {
                Type: 'file',
                Action: 'copy',
                Path: 'favicon.ico'
            },
            {
                Type: 'file',
                Action: 'copy',
                Path: 'img/bridges/storybridge.jpg'
            },
            {
                Type: 'file',
                Action: 'copy',
                Path: 'upload/temp/dummy.txt'
            }
    ]
}
 

if (module) module.exports = koalaconfig;