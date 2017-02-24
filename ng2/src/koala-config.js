let koalaconfig = {
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
            Regex: /\.component\.js$/ig // /\/(?![\w\.\-\+#@& ]+\.(sys|rpc)\.js)[\w\.\-\+#@& ]+\.js$/ig
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
};
if (module)
    module.exports = koalaconfig;
//# sourceMappingURL=koala-config.js.map