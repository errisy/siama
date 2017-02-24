"use strict";
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
const fs = require("fs");
const path = require("path");
const vm = require("vm");
var SystemBuilder = require('systemjs-builder');
//let babili: Babili = require('babili-standalone');
let cleanCSS = require('clean-css');
let clean = new cleanCSS();
let html = require('html-minifier');
let babel = require('babel-core');
if (!process.argv[0])
    process.exit();
let filename = process.argv[2];
console.log('config file name: ', filename);
let packerRegex = /\.\s*templateUrl\s*=\s*ngstd\s*\.\s*AngluarJSTemplateUrlPacker\s*\(\s*['"]([\\\/\w\.]+)['"]\s*\)/ig;
var IO;
(function (IO) {
    class File {
        constructor(Fullname) {
            this.Fullname = Fullname;
            this.Fullname = path.normalize(Fullname).replace(/\\/ig, '/');
        }
        get Exists() {
            return fs.existsSync(this.Fullname) && fs.statSync(this.Fullname).isFile();
        }
        static ExistsStatic(Filename) {
            return fs.existsSync(Filename) && fs.statSync(Filename).isFile();
        }
        static ReadAllTextStatic(filename) {
            return fs.readFileSync(filename).toString();
        }
        static WriteAllTextStatic(filename, value) {
            fs.writeFileSync(filename, value, { encoding: 'utf8' });
        }
        /**
         * read all text from the file
         */
        ReadAllText() {
            if (!this.Exists)
                return;
            return fs.readFileSync(this.Fullname).toString();
        }
        WriteAllText(value) {
            fs.writeFileSync(this.Fullname, value, { encoding: 'utf8' });
        }
        MinifyJS(Config) {
            let code;
            let minified;
            let i = this.Fullname.lastIndexOf('.');
            let minfilename = `${this.Fullname.substr(0, i)}.min.${this.Fullname.substr(i + 1)}`;
            if (File.ExistsStatic(minfilename)) {
                code = File.ReadAllTextStatic(minfilename);
                minified = true;
            }
            else {
                code = this.ReadAllText();
            }
            if (!code)
                console.log('Error: code is empty!');
            //replace require('../some');
            //do not minify for server side code;
            if (Config.Mode == 'local') {
                return code;
            }
            //remove comments first
            code = babel.transform(code, {
                comments: false,
                presets: ["es2015"],
                env: {
                    "production": {
                        "presets": ["babili"]
                    }
                }
            }).code;
            if (Config.Mode == 'remote') {
                if (!Config.JSFiles.some(item => item == this.Fullname)) {
                    Config.JSFiles.push(this.Fullname);
                }
                //only change require path when it is remote mode for deploy
                code = code.replace(/require\s*\(\s*['"`](\.{1,2}\/[\w\/\+\-\.\#\%]+)['"`]\)/g, (substring, ...args) => {
                    let $modulepath = args[0];
                    //console.log('Module Path:', $modulepath, substring);
                    let $normpath = path.normalize(path.join(path.dirname(this.Fullname), args[0])).replace(/\\/ig, '/');
                    //console.log('Normalized Path: ', $normpath , this.Fullname);
                    //we then need to work out which module it is in:
                    let found = Config.Modules.find(item => $normpath.indexOf(path.join(Config.SourceRoot, item.value).replace(/\\/ig, '/')) == 0);
                    if (!found)
                        console.log(`Unresolved Module: ${substring} in ${this.Fullname}.`, $normpath);
                    let $jspath = /\.js$/ig.test($normpath) ? $normpath : ($normpath + '.js');
                    if (!Config.RequiredJSFiles.some(item => item == $jspath))
                        Config.RequiredJSFiles.push($jspath);
                    let $targetpath = `${found.key}${$normpath.substr(path.join(Config.SourceRoot, found.value).replace(/\\/ig, '/').length)}`;
                    //console.log($targetpath);
                    //let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                    //console.log(minified);
                    return `require("${$targetpath}")`;
                });
            }
            //to replace the code with Angular2Template
            code = code.replace(/templateUrl\s*:\s*\$packer\.Angular2TemplateURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/g, (substring, ...args) => {
                let temp = IO.File.ReadAllTextStatic(path.join(Config.SourceRoot, args[0]));
                let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                //console.log(minified);
                return `template: ${JSON.stringify(minified)}`;
            });
            code = code.replace(/styleUrls\s*:\s*\[\s*(\$packer\.Angular2StyleURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)\s*,?\s*)+\]/g, (substring, ...args) => {
                let regex = /\$packer\.Angular2StyleURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/g;
                let result;
                let styles = [];
                while (result = regex.exec(substring)) {
                    let css = IO.File.ReadAllTextStatic(path.join(Config.SourceRoot, result[1]));
                    styles.push(JSON.stringify(clean.minify(css).styles));
                }
                return `styles: [${styles.join(',')}]`;
            });
            code = code.replace(/\$packer\.Angular2RemoteTemplate\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/ig, (substring, ...args) => {
                //let temp = HTMLParser.Loader.LoadTemplate(path.join(SourceRoot, args[0]).normalize());
                let temp = HTMLParser.Loader.LoadTemplate(path.join(Config.SourceRoot, args[0]).normalize());
                let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                return `{Value: ${JSON.stringify(minified)}}`;
            });
            if (minified)
                return code;
            return babel.transform(code, {
                comments: false,
                presets: ["babili"] //,
            }).code;
        }
        BabiliOnly() {
            let code = this.ReadAllText();
            return babel.transform(code, {
                comments: false,
                presets: ["babili"] //,
            }).code;
        }
        MinifyHTML() {
            let i = this.Fullname.lastIndexOf('.');
            let minfilename = `${this.Fullname.substr(0, i)}.min.${this.Fullname.substr(i + 1)}`;
            if (File.ExistsStatic(minfilename)) {
                return File.ReadAllTextStatic(minfilename);
            }
            let code = this.ReadAllText();
            return html.minify(code, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
        }
        ReplacePacker(Config) {
            let code = this.ReadAllText();
            code = code.replace(/templateUrl\s*:\s*\$packer\.Angular2TemplateURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/g, (substring, ...args) => {
                let temp = IO.File.ReadAllTextStatic(path.join(Config.SourceRoot, args[0]));
                let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                //console.log(minified);
                return `template: ${JSON.stringify(minified)}`;
            });
            code = code.replace(/styleUrls\s*:\s*\[\s*(\$packer\.Angular2StyleURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)\s*,?\s*)+\]/g, (substring, ...args) => {
                let regex = /\$packer\.Angular2StyleURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/g;
                let result;
                let styles = [];
                while (result = regex.exec(substring)) {
                    let css = IO.File.ReadAllTextStatic(path.join(Config.SourceRoot, result[1]));
                    styles.push(JSON.stringify(clean.minify(css).styles));
                }
                return `styles: [${styles.join(',')}]`;
            });
            code = code.replace(/\$packer\.Angular2RemoteTemplate\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/ig, (substring, ...args) => {
                //let temp = HTMLParser.Loader.LoadTemplate(path.join(SourceRoot, args[0]).normalize());
                let temp = HTMLParser.Loader.LoadTemplate(path.join(Config.SourceRoot, args[0]).normalize());
                let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                return `{Value: ${JSON.stringify(minified)}}`;
            });
            this.WriteAllText(code);
            return code;
        }
        MinifyCSS() {
            let i = this.Fullname.lastIndexOf('.');
            let minfilename = `${this.Fullname.substr(0, i)}.min.${this.Fullname.substr(i + 1)}`;
            if (File.ExistsStatic(minfilename)) {
                return File.ReadAllTextStatic(minfilename);
            }
            let code = this.ReadAllText();
            return clean.minify(code).styles;
        }
        MinifyTo(SourceRoot, TargetRoot, Config) {
            let sRoot = path.normalize(SourceRoot).replace(/\\/ig, '/');
            let tRoot = path.normalize(TargetRoot).replace(/\\/ig, '/');
            if (this.Fullname.indexOf(sRoot) == 0) {
                let section = this.Fullname.substr(sRoot.length);
                let target = path.join(TargetRoot, section).normalize().replace(/\\/ig, '/');
                Directory.MakePathStatic(path.dirname(target));
                let minified = '';
                if (/\.js$/ig.test(this.Fullname)) {
                    minified = this.MinifyJS(Config);
                }
                else if (/\.html$/ig.test(this.Fullname)) {
                    minified = this.MinifyHTML();
                }
                else if (/\.css$/ig.test(this.Fullname)) {
                    minified = this.MinifyCSS();
                }
                fs.writeFileSync(target, minified);
            }
            else {
                console.log(`*Error @MinifyTo ${this.Fullname}:\n\tFile is not in Source Root ${SourceRoot}`);
                return false;
            }
        }
        TranspileSystemConfigTo(SourceRoot, TargetRoot, TargetURL) {
            let sRoot = path.normalize(SourceRoot).replace(/\\/ig, '/');
            let tRoot = path.normalize(TargetRoot).replace(/\\/ig, '/');
            if (this.Fullname.indexOf(sRoot) == 0) {
                let section = this.Fullname.substr(sRoot.length);
                let target = path.join(TargetRoot, section).normalize().replace(/\\/ig, '/');
                Directory.MakePathStatic(path.dirname(target));
                let transpiled = this.TranspileSystemConfig(TargetURL);
                //fs.writeFileSync(target, transpiled.Transpiled);
                return transpiled.Modules;
            }
            else {
                console.log(`*Error @TranspileSystemConfigTo ${this.Fullname}:\n\tFile is not in Source Root ${SourceRoot}`);
                return [];
            }
        }
        /**
         * Read system js config file and transpile it into deployed file;
         * @param DeployTarget
         */
        TranspileSystemConfig(TargetURL) {
            let context = vm.createContext({
                System: SystemConfig
            });
            let script = vm.createScript(this.ReadAllText());
            script.runInContext(context);
            let DeployedMap = [];
            let DeployedPaths = [];
            let paths = [];
            for (let key in SystemConfig.Configuration.paths) {
                let pair = { key: key, value: SystemConfig.Configuration.paths[key] };
                paths.push(pair);
                if (/^https?:\/\//ig.test(pair.value)) {
                    //it is a remote path, should not replace
                    DeployedPaths.push({ key: pair.key, value: pair.value });
                }
                else {
                    //it is a local path, should be replaced by deployed path
                    DeployedPaths.push({ key: pair.key, value: TargetURL + pair.value.replace(/\\/ig, '/') });
                }
            }
            let map = [];
            let Modules = [];
            for (let key in SystemConfig.Configuration.map) {
                let pair = { key: key, value: SystemConfig.Configuration.map[key] };
                let found = paths.find(item => pair.value.indexOf(item.key) == 0);
                let pkg = SystemConfig.Configuration.packages[key];
                if (!found) {
                    if (/^https?:\/\//ig.test(pair.value)) {
                        //it is a remote path, should not replace
                        DeployedMap.push({ key: pair.key, value: pair.value });
                    }
                    else {
                        //it is a local path, should be replaced by deployed path
                        DeployedMap.push({ key: pair.key, value: TargetURL + pair.value.replace(/\\/ig, '/') });
                        Modules.push({ key: pair.key, value: pair.value, manual: (pkg && pkg['manual']) ? true : false });
                    }
                }
                else {
                    let deployedFound = DeployedPaths.find(item => item.key == found.key);
                    DeployedMap.push({ key: pair.key, value: deployedFound.value + pair.value.substr(found.key.length) });
                    //will minify and copy to deploy if it is not remote file
                    if (!/^https?:\/\//ig.test(found.value))
                        Modules.push({ key: pair.key, value: path.join(found.value, pair.value.substr(found.key.length)).normalize().replace(/\\/ig, '/'), manual: (pkg && pkg['manual']) ? true : false });
                }
            }
            let PathObject = {};
            DeployedPaths.forEach(item => {
                PathObject[item.key] = item.value;
            });
            let MapObject = {};
            DeployedMap.forEach(item => {
                MapObject[item.key] = item.value;
            });
            let TranspiledCode = `
(function (global) {
    System.config({
        paths: ${JSON.stringify(PathObject)},
        map: ${JSON.stringify(MapObject)},
        packages: ${JSON.stringify(SystemConfig.Configuration.packages)}
    });
})(this);
`;
            return {
                Transpiled: TranspiledCode,
                Modules: Modules
            };
        }
        CopyTo(SourceRoot, TargetRoot, CheckMin) {
            return __awaiter(this, void 0, void 0, function* () {
                let sRoot = path.normalize(SourceRoot).replace(/\\/ig, '/');
                let tRoot = path.normalize(TargetRoot).replace(/\\/ig, '/');
                if (this.Fullname.indexOf(sRoot) == 0) {
                    let section = this.Fullname.substr(sRoot.length);
                    let target = path.join(TargetRoot, section).normalize().replace(/\\/ig, '/');
                    Directory.MakePathStatic(path.dirname(target));
                    return new Promise((resolve, reject) => {
                        let writeStream = fs.createWriteStream(target);
                        let readStream = fs.createReadStream(this.Fullname);
                        readStream.pipe(writeStream);
                        writeStream.on('finish', () => {
                            readStream.close();
                            writeStream.close();
                            resolve(true);
                        });
                    });
                }
                else {
                    console.log(`*Error @CopyTo ${this.Fullname}:\n\tFile is not in Source Root ${SourceRoot}`);
                    return false;
                }
            });
        }
        /**
         * Load a file as module
         */
        Load() {
            let code = `(function loader() {
    let exports = {};
    let module = {};
    try {
    ${this.ReadAllText()}
    }
    catch (ex) {
        console.error(\`Failed to load module \`);
        return {}
    }
    return module.exports;
})`;
            let script = vm.createScript(code);
            let exported = script.runInThisContext()();
            return exported;
        }
    }
    IO.File = File;
    class Directory {
        constructor(Fullname) {
            this.Fullname = Fullname;
            this.Fullname = path.normalize(Fullname).replace(/\\/ig, '/');
        }
        get Exists() {
            return fs.existsSync(this.Fullname) && fs.statSync(this.Fullname).isDirectory();
        }
        static ExistsStatic(DirectoryName) {
            return fs.existsSync(DirectoryName) && fs.statSync(DirectoryName).isDirectory();
        }
        /**
         * read all files in the directory
         */
        get Files() {
            if (!this.Exists)
                return [];
            return fs.readdirSync(this.Fullname).filter(item => fs.statSync(path.join(this.Fullname, item)).isFile()).map(item => new File(path.join(this.Fullname, item).normalize()));
        }
        get Directories() {
            if (!this.Exists)
                return [];
            return fs.readdirSync(this.Fullname).filter(item => fs.statSync(path.join(this.Fullname, item)).isDirectory()).map(item => new Directory(path.join(this.Fullname, item).normalize()));
        }
        static MakePathStatic(fullpath) {
            let sections = path.normalize(fullpath).replace(/\\/ig, '/').split(/\//);
            let start = 0;
            for (let i = sections.length; i > 0; i--) {
                let currentPath = path.join(...sections.slice(0, i)).normalize().replace(/\\/ig, '/');
                if (IO.Directory.ExistsStatic(currentPath)) {
                    start = i;
                    break;
                }
            }
            for (let i = start + 1; i <= sections.length; i++) {
                let currentPath = path.join(...sections.slice(0, i));
                fs.mkdirSync(currentPath);
            }
            return true;
        }
    }
    IO.Directory = Directory;
    class SystemConfig {
        static config(value) {
            SystemConfig.Configuration = value;
        }
    }
})(IO || (IO = {}));
class KoalaTask {
    constructor() {
        this.WatchList = [];
        this.ConfigWatchListener = (curr, prev) => {
            if (!this.Load(this.configfile)) {
                console.log('Failed to load config file. Quit.');
                return;
            }
            console.log('filed changed:', this);
            task.Compile();
        };
    }
    Start(configFilename) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('start: ', configFilename);
            let cfgFile = new IO.File(configFilename);
            if (!cfgFile.Exists) {
                console.log('Error @Start; Config File does not Exist!');
                return;
            }
            let config = cfgFile.Load();
            if (!(config.SourceRoot && IO.Directory.ExistsStatic(config.SourceRoot))) {
                config.SourceRoot = __dirname;
            }
            let sourceDir = new IO.Directory(config.SourceRoot);
            console.log('Log @Start: Deploy Client');
            //if(false)
            switch (config.TargetMode) {
                case 'system':
                    console.log(sourceDir, config.SystemJSConfig);
                    config.Mode = 'remote';
                    config.JSFiles = [];
                    config.RequiredJSFiles = [];
                    let SystemConfig = new IO.File(path.join(sourceDir.Fullname, config.SystemJSConfig));
                    let modules = SystemConfig.TranspileSystemConfigTo(config.SourceRoot, config.TargetRoot, config.TargetURL);
                    config.Modules = modules;
                    //add manual modules:
                    for (let tar of config.TargetManuals) {
                        switch (tar.Type) {
                            case 'file':
                                {
                                    let $tarpath = path.join(config.SourceRoot, tar.Path);
                                    if (IO.File.ExistsStatic($tarpath)) {
                                        config.Modules.push({
                                            key: tar.Path,
                                            value: path.normalize($tarpath).replace(/\\/ig, '/')
                                        });
                                    }
                                }
                                break;
                            case 'directory':
                                //{
                                //    let $tarpath = path.join(config.SourceRoot, tar.Path);
                                //    await this.IterateDir([
                                //        {
                                //            Action: tar.Action,
                                //            Regex: /[\w\W]*/,
                                //            Type: 'file regex'
                                //        }
                                //    ], new IO.Directory($tarpath), config.TargetRoot, config);
                                //}
                                break;
                        }
                    }
                    console.log('modules: ', modules);
                    //if (modules) return;
                    for (let item of modules) {
                        let itemPath = path.join(config.SourceRoot, item.value);
                        console.log('item path: ', itemPath, IO.Directory.ExistsStatic(itemPath));
                        if (item.manual)
                            continue;
                        if (IO.Directory.ExistsStatic(itemPath)) {
                            yield this.IterateDir(config.TargetFiles, new IO.Directory(itemPath), config.TargetRoot, config);
                        }
                        else if (IO.File.ExistsStatic(itemPath)) {
                            yield this.ProcessFile(config.TargetFiles, new IO.File(itemPath), config.TargetRoot, config);
                        }
                    }
                    if (config.BundleTarget) {
                        let builder = new SystemBuilder('', config.SystemJSConfig);
                        console.log('@SystemJS Builder Start');
                        try {
                            builder.buildStatic(`${config.BundleModule}/main.js`, path.join(config.TargetRoot, config.BundleTarget), { minify: false, mangle: false })
                                .then(function () {
                                console.log(`@SystemJS Bundle Success! ${config.BundleTarget}`);
                                console.log(`@Try to Minify with Babili`);
                                let target = new IO.File(path.join(config.TargetRoot, config.BundleTarget));
                                target.WriteAllText(target.BabiliOnly());
                                console.log(`@Minification Done with Babili`);
                            });
                        }
                        catch (e) {
                            console.log('@SystemJS Bundle Error: ', e);
                        }
                    }
                    //pack files
                    if (Array.isArray(config.PackFiles)) {
                        let builder = [];
                        config.PackFiles.forEach(filepack => {
                            if (IO.File.ExistsStatic(path.join(config.SourceRoot, filepack.file))) {
                                let file = new IO.File(path.join(config.SourceRoot, filepack.file));
                                if (filepack.minify) {
                                    let minified = file.BabiliOnly();
                                    builder.push(minified);
                                }
                                else {
                                    builder.push(file.ReadAllText());
                                }
                            }
                        });
                        IO.File.WriteAllTextStatic(path.join(config.TargetRoot, config.PackTarget), builder.join('\n'));
                    }
                    if (config.TargetManuals) {
                        for (let tar of config.TargetManuals) {
                            switch (tar.Type) {
                                case 'file':
                                    this.ProcessFile([{
                                            Action: tar.Action,
                                            Regex: /[\w\W]*/,
                                            Type: 'file regex'
                                        }], new IO.File(path.join(config.SourceRoot, tar.Path)), config.TargetRoot, config);
                                    break;
                                case 'directory':
                                    this.IterateDir([{
                                            Action: tar.Action,
                                            Regex: /[\w\W]*/,
                                            Type: 'file regex'
                                        }], new IO.Directory(path.join(config.SourceRoot, tar.Path)), config.TargetRoot, config);
                                    break;
                            }
                        }
                    }
                    let unresolved;
                    unresolved = config.RequiredJSFiles.filter(r => !config.JSFiles.some(js => js == r));
                    while (unresolved.length > 0) {
                        config.RequiredJSFiles = [];
                        console.log(`resolving ${unresolved.length} dependencies:`);
                        for (let js of unresolved) {
                            this.ProcessFile([
                                {
                                    Type: 'file',
                                    Action: 'minify',
                                    Path: js
                                }
                            ], new IO.File(js), config.TargetRoot, config);
                        }
                        unresolved = config.RequiredJSFiles.filter(r => !config.JSFiles.some(js => js == r));
                    }
                    console.log('dependency files: ', config.RequiredJSFiles.filter(r => !config.JSFiles.some(js => js == r)));
                    break;
                default:
                    yield this.IterateDir(config.TargetFiles, sourceDir, config.TargetRoot, config);
                    break;
            }
            config.Mode = 'local';
            console.log('Log @Start: Deploy Server');
            yield this.IterateDir(config.ServerFiles, sourceDir, config.ServerRoot, config);
            if (config.ServerManual) {
                for (let tar of config.ServerManual) {
                    switch (tar.Type) {
                        case 'file':
                            this.ProcessFile([{
                                    Action: tar.Action,
                                    Regex: /[\w\W]*/,
                                    Type: 'file regex'
                                }], new IO.File(path.join(config.SourceRoot, tar.Path)), config.ServerRoot, config);
                            break;
                        case 'directory':
                            this.IterateDir([{
                                    Action: tar.Action,
                                    Regex: /[\w\W]*/,
                                    Type: 'file regex'
                                }], new IO.Directory(path.join(config.SourceRoot, tar.Path)), config.ServerRoot, config);
                            break;
                    }
                }
            }
        });
    }
    ProcessFile(options, file, Destination, config) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let option of options) {
                switch (option.Type) {
                    case 'file':
                        if (path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/') == file.Fullname) {
                            yield this.ExecuteFile(option.Action, file, config, Destination);
                            return;
                        }
                        break;
                    case 'file regex':
                        option.Regex.lastIndex = undefined;
                        if (option.Regex.test(file.Fullname)) {
                            yield this.ExecuteFile(option.Action, file, config, Destination);
                            return;
                        }
                        break;
                }
            }
        });
    }
    IterateDir(options, directory, Destination, config) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let option of options) {
                switch (option.Type) {
                    case 'directory':
                        console.log(path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/'), directory.Fullname);
                        if (path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/') == directory.Fullname) {
                            yield this.ExecuteDirectory(option.Action, directory, config, Destination);
                            return;
                        }
                        break;
                    case 'directory regex':
                        option.Regex.lastIndex = undefined;
                        if (option.Regex.test(directory.Fullname)) {
                            yield this.ExecuteDirectory(option.Action, directory, config, Destination);
                            return;
                        }
                        break;
                }
            }
            //console.log(`Log @IterateDir: ${directory.Fullname}\n`, options);
            for (let file of directory.Files) {
                for (let option of options) {
                    let found;
                    switch (option.Type) {
                        case 'file':
                            if (path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/') == file.Fullname) {
                                yield this.ExecuteFile(option.Action, file, config, Destination);
                                found = true;
                            }
                            break;
                        case 'file regex':
                            option.Regex.lastIndex = undefined;
                            if (option.Regex.test(file.Fullname)) {
                                yield this.ExecuteFile(option.Action, file, config, Destination);
                                found = true;
                            }
                            break;
                    }
                    if (found)
                        break;
                }
            }
            for (let dir of directory.Directories) {
                for (let option of options) {
                    let found;
                    switch (option.Type) {
                        case 'directory':
                            console.log(path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/'), dir.Fullname);
                            if (path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/') == dir.Fullname) {
                                yield this.ExecuteDirectory(option.Action, dir, config, Destination);
                                found = true;
                            }
                            break;
                        case 'directory regex':
                            option.Regex.lastIndex = undefined;
                            if (option.Regex.test(dir.Fullname)) {
                                yield this.ExecuteDirectory(option.Action, dir, config, Destination);
                                found = true;
                            }
                            break;
                        default:
                            yield this.IterateDir(options, dir, Destination, config);
                            break;
                    }
                    if (found)
                        break;
                }
            }
        });
    }
    ExecuteFile(action, file, config, targetDir) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Log @ExecuteFile: Action: ${action} ${file.Fullname}`);
            switch (action) {
                case 'copy':
                    yield file.CopyTo(config.SourceRoot, targetDir, true);
                    break;
                case 'minify':
                    file.MinifyTo(config.SourceRoot, targetDir, config);
                    break;
                case 'prepack':
                    file.ReplacePacker(config); //replace the $packer with html and css
                    break;
                case 'none':
                    break;
            }
        });
    }
    ExecuteDirectory(action, directory, config, targetDir) {
        return __awaiter(this, void 0, void 0, function* () {
            //apply to every desendants except none
            switch (action) {
                case 'copy':
                case 'minify':
                    for (let file of directory.Files) {
                        yield this.ExecuteFile(action, file, config, targetDir);
                    }
                    for (let dir of directory.Directories) {
                        yield this.ExecuteDirectory(action, dir, config, targetDir);
                    }
                    break;
                case 'none':
                    break;
            }
        });
    }
    Load(configFilename) {
        try {
            console.log('file exists:', fs.existsSync(configFilename));
            if (fs.existsSync(configFilename) && fs.statSync(configFilename).isFile()) {
                //try load
                this.option = JSON.parse(fs.readFileSync(configFilename).toString());
            }
            this.configfile = configFilename;
            return true;
        }
        catch (ex) {
            console.error('failed in loading config file: ', ex);
            return false;
        }
    }
    WatchConfig() {
        fs.watch(this.configfile, this.ConfigWatchListener);
    }
    FileWatchListener(curr, prev) {
        console.log('file change detected. start compiling...');
        task.Compile();
    }
    ReplaceAngular1TemplateUrl(code) {
        packerRegex.lastIndex = undefined;
        return code.replace(packerRegex, (substring, ...args) => {
            let filename = __dirname + args[0];
            //load the html file from disk
            if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {
                console.log('file:', filename, 'ng2-template', fs.existsSync(filename));
                if (this.WatchList.indexOf(filename) < 0)
                    this.WatchList.push(filename);
                let template = JSON.stringify(html.minify(fs.readFileSync(filename).toString(), { caseSensitive: true, collapseWhitespace: true, conservativeCollapse: true, removeComments: true }));
                //console.log('replacing with file ', template);
                return '.template = ' + template;
            }
            else {
                return substring;
            }
        });
    }
    Compile() {
        let jsBuilder = [];
        let cssBuilder = [];
        console.log('Start Compile: ' + (new Date(Date.now()).toString()));
        console.log('End Compile: ' + (new Date(Date.now()).toString()));
    }
    Watch() {
        if (this.watchers) {
            this.watchers.forEach(file => fs.unwatchFile(file));
        }
        this.watchers = [];
        this.WatchList.forEach(filename => {
            if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {
                this.watchers.push(filename);
                fs.watchFile(filename, this.FileWatchListener);
            }
        });
    }
}
/**
 * HTML Parser for the loader system
 */
var HTMLParser;
(function (HTMLParser_1) {
    class Loader {
        static LoadTemplate(url) {
            if (typeof url == 'object' && url['Value']) {
                return url['Value'];
            }
            else {
                let idIndex = url.indexOf('#');
                let id;
                if (idIndex > -1) {
                    id = url.substr(idIndex + 1);
                    url = url.substr(0, idIndex);
                }
                //let result = await jQuery.ajax(url, { method: 'get' });
                let result = IO.File.ReadAllTextStatic(url);
                if (id) {
                    result = Loader.findID(result, id);
                }
                return result;
            }
        }
        static findID(source, id) {
            let parsed = HTMLParser.parse(source);
            //console.log('parsed:', parsed);
            let found = parsed.findById(id);
            //console.log('found: ', found);
            let code = parsed.html.substring(found.start, found.end);
            let att = found.attributes.find(attr => attr.key == 'id' && attr.value == id);
            return code.substring(0, att.start - found.start) + code.substring(att.end - found.start);
        }
    }
    HTMLParser_1.Loader = Loader;
    class ParsedHTML {
        constructor() {
            this.nodes = [];
        }
        findById(id) {
            let test = (attributes) => Array.isArray(attributes) && attributes.some(attr => attr.key == 'id' && attr.value == id);
            let search = (nodes) => {
                if (!Array.isArray(nodes))
                    return undefined;
                for (let j = 0; j < nodes.length; j++) {
                    let node = nodes[j];
                    if (test(node.attributes))
                        return node;
                    if (node.nodes && Array.isArray(node.nodes)) {
                        for (let i = 0; i < node.nodes.length; i++) {
                            let result = search(node.nodes);
                            if (result)
                                return result;
                        }
                    }
                }
                return undefined;
            };
            return search(this.nodes);
        }
    }
    HTMLParser_1.ParsedHTML = ParsedHTML;
    class RegexSearcher {
        constructor(regex) {
            this.regex = regex;
        }
        search(value, pos) {
            this.regex.lastIndex = pos;
            this.result = this.regex.exec(value);
            if (!this.result)
                this.regex.lastIndex = undefined;
        }
        searchAll(value) {
            this.regex.lastIndex = undefined;
            let arr;
            let results = [];
            while (arr = this.regex.exec(value)) {
                results.push(arr);
            }
            this.results = results;
        }
    }
    HTMLParser_1.RegexSearcher = RegexSearcher;
    class HTMLParser {
        static parse(html) {
            html = HTMLParser.removePairs(html, /<\!--/ig, /-->/ig);
            html = HTMLParser.removePairs(html, /<script/ig, /<\/script>/ig);
            let result = new ParsedHTML();
            result.html = html;
            HTMLParser.parseNodes(result.html, result.nodes);
            return result;
        }
        static parseNodes(html, SearchStack, pos, current) {
            //if (typeof pos != 'number') pos = 0;
            //[1]: tag [2]: attributes
            let tagBegin = new RegexSearcher(/<([\w\:]+)((\s+([\w\[\]\(\)\*\.\-]+)((="[^"]+")|))*)\s*>/ig);
            //[1]: tag [2]: attributes
            let tagSelfClose = new RegexSearcher(/<([\w\:]+)((\s+([\w\[\]\(\)\*\.\-]+)((="[^"]+")|))*)\s*\/>/ig);
            let tagEnd = new RegexSearcher(/<\/([\w\:]+)>/ig);
            let tryFindNext = () => {
                //console.log('next position: ', pos);
                tagBegin.search(html, pos);
                tagEnd.search(html, pos);
                tagSelfClose.search(html, pos);
                let tags = [tagBegin, tagEnd, tagSelfClose]
                    .filter(tag => typeof tag.regex.lastIndex == 'number' && tag.regex.lastIndex > -1)
                    .sort((a, b) => Math.sign(a.regex.lastIndex - b.regex.lastIndex));
                if (tags.length > 0)
                    return tags[0];
                return undefined; //nothing found
            };
            let count = 0;
            if (current) {
                //uncompleted tag: search for new tag or tag close
                //while until we reach the end tag;
                let next;
                while (next = tryFindNext()) {
                    //count += 1;
                    //if (count > 10) break;
                    //console.log(next.result);
                    //if (!next.result) console.log('empty result:', next.regex.lastIndex, pos);
                    if (next == tagSelfClose) {
                        //console.log('tagSelfClose');
                        current.nodes.push({
                            tag: next.result[1],
                            start: next.result.index,
                            end: next.result.index + next.result[0].length,
                            attributes: HTMLParser.parseAttributes(next.result[0], next.result.index),
                            nodes: []
                        });
                        pos = next.regex.lastIndex;
                    }
                    if (next == tagBegin) {
                        //console.log('tagBegin');
                        //begin a new tag
                        let inner = {
                            tag: next.result[1],
                            start: next.result.index,
                            end: next.result.index + next.result[0].length,
                            attributes: HTMLParser.parseAttributes(next.result[0], next.result.index),
                            nodes: []
                        };
                        current.nodes.push(inner);
                        pos = next.regex.lastIndex;
                        pos = HTMLParser.parseNodes(html, SearchStack, pos, inner);
                    }
                    if (next == tagEnd) {
                        //console.log('tagEnd');
                        //end this tag;
                        if (next.result[1] == current.tag) {
                            current.end = next.result.index + next.result[0].length;
                            pos = next.regex.lastIndex;
                            break;
                        }
                        else {
                            throw `Unmatched End of Tag: Start: ${current.tag} End: ${next.result[0]}`;
                        }
                    }
                }
            }
            else {
                //search for new tag
                let next;
                while (next = tryFindNext()) {
                    //count += 1;
                    //if (count > 10) break;
                    //console.log(next.result);
                    if (!next.result)
                        console.log('empty result:', next.regex.lastIndex, pos);
                    if (next == tagSelfClose) {
                        //console.log('tagSelfClose');
                        SearchStack.push({
                            tag: next.result[1],
                            start: next.result.index,
                            end: next.result.index + next.result[0].length,
                            attributes: HTMLParser.parseAttributes(next.result[0], next.result.index),
                            nodes: []
                        });
                        pos = next.regex.lastIndex;
                    }
                    if (next == tagBegin) {
                        //console.log('tagBegin');
                        //begin a new tag
                        let inner = {
                            tag: next.result[1],
                            start: next.result.index,
                            end: next.result.index + next.result[0].length,
                            attributes: HTMLParser.parseAttributes(next.result[0], next.result.index),
                            nodes: []
                        };
                        SearchStack.push(inner);
                        pos = next.regex.lastIndex;
                        pos = HTMLParser.parseNodes(html, SearchStack, pos, inner);
                    }
                    if (next == tagEnd) {
                        //console.log('tagEnd');
                        //end this tag;
                        throw `Unexpected End of Tag ${next.result[0]}`;
                    }
                }
            }
            return pos;
        }
        static parseAttributes(value, start) {
            //[1]: key [4]: value;
            let attribute = new RegexSearcher(/\s+([\w\[\]\(\)\*\.\-]+)((="([^"]+)")|)/ig);
            attribute.searchAll(value);
            return attribute.results.map((r) => {
                return {
                    start: start + r.index,
                    end: start + r.index + r[0].length,
                    key: r[1],
                    value: r[4]
                };
            });
        }
        static removePairs(value, s, e) {
            let regions = [];
            let match;
            while (match = s.exec(value)) {
                if (e.test(value)) {
                    regions.push({ start: s.lastIndex - match[0].length, end: e.lastIndex });
                }
            }
            let begin = 0;
            let results = [];
            for (let i = 0; i < regions.length; i++) {
                results.push(value.substring(begin, regions[i].start));
                begin = regions[i].end;
            }
            if (begin < value.length) {
                results.push(value.substring(begin, value.length));
            }
            return results.join('');
        }
    }
    HTMLParser_1.HTMLParser = HTMLParser;
})(HTMLParser || (HTMLParser = {}));
let task = new KoalaTask();
task.Start(filename);
//# sourceMappingURL=koala-min.js.map