import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';

declare class SystemJSBuilder {
    constructor(basePath: string, systemconfig: string)
    public bundle(pathModule: string, pathOut: string, options?: { minify?: boolean, mangle?: boolean }): Promise<void>
    public buildStatic(pathModule: string, pathOut: string, options?: { minify?: boolean, mangle?: boolean }): Promise<void>
}
var SystemBuilder: typeof SystemJSBuilder = require('systemjs-builder');
//import * as babel from 'babel-core';

// interfaces
// npm install clean-css
declare class CleanCss {
    public minify(source: string): CleanCssResult;
}
declare interface CleanCssResult {
    styles: string;
}

//babel

interface Babel {
    transform(code: string, options: {
        comments: boolean,
        presets: string[],
        env?: Object
    }): { code: string };
}

// html minifier
// npm install html-minifier
interface IHtmlMinifyOptions {
    /**Don't leave any spaces between display:inline; elements when collapsing. Must be used in conjunction with collapseWhitespace=true*/
    collapseInlineTagWhitespace?: boolean;
    /**Collapse white space that contributes to text nodes in a document tree*/
    collapseWhitespace?: boolean;
    /**Always collapse to 1 space (never remove it entirely). Must be used in conjunction with collapseWhitespace=true*/
    conservativeCollapse?: boolean;
    removeAttributeQuotes?: boolean;
    minifyCSS?: boolean;
    minifyJS?: boolean;
    html5?: boolean;
    decodeEntities?: boolean;
    caseSensitive?: boolean;
    removeComments?: boolean;
}
declare module HtmlMinify {
    export function minify(code: string, options?: IHtmlMinifyOptions): string;
}

//let babili: Babili = require('babili-standalone');
let cleanCSS: typeof CleanCss = require('clean-css');
let clean = new cleanCSS();
let html: typeof HtmlMinify = require('html-minifier');
let babel: Babel = require('babel-core');


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
    TargetManuals?: LoaderOption[];

    PackFiles?: { file: string, minify: boolean }[];
    PackTarget?: string;
    BundleModule?: string;
    BundleTarget?: string;
    /**Use what mode to deploy*/
    TargetMode: 'none' | 'system';
    /**system js config*/
    SystemJSConfig?: string;
    /**Maps*/
    Modules: { key: string, value: string, manual?:boolean }[];
    /***/
    Mode: 'remote' | 'local';
    /**keep a full list of all files, to work out unresolved files*/
    JSFiles: string[];
    /**keep a list of unresolved files*/
    RequiredJSFiles: string[];
}
interface LoaderOption {
    /**the rule will check this first*/
    Path?: string;
    /**the rule will check this match */
    Regex?: RegExp;
    CheckMin?: boolean; //will check if *.min.* exists, if exists, we will use the *.min.*, rather than minify it.
    Type: 'file' | 'directory' | 'file regex' | 'directory regex';
    Action: 'copy' | 'minify' | 'none';
}

/** here the config file is actually a ts file, which makes it easier to write.*/
interface IConfig {
    read: () => IKoalaOption;
}

if (!process.argv[0]) process.exit();
let filename: string = process.argv[2];

console.log('config file name: ', filename);


let packerRegex = /\.\s*templateUrl\s*=\s*ngstd\s*\.\s*AngluarJSTemplateUrlPacker\s*\(\s*['"]([\\\/\w\.]+)['"]\s*\)/ig;


module IO {
    export class File{
        constructor(public Fullname: string) {
            this.Fullname = path.normalize(Fullname).replace(/\\/ig, '/');
        }
        public get Exists(): boolean {
            return fs.existsSync(this.Fullname) && fs.statSync(this.Fullname).isFile();
        }
        static ExistsStatic(Filename: string): boolean {
            return fs.existsSync(Filename) && fs.statSync(Filename).isFile();
        }
        static ReadAllTextStatic(filename: string): string {
            return fs.readFileSync(filename).toString();
        }
        static WriteAllTextStatic(filename: string, value: string): void {
            fs.writeFileSync(filename, value, { encoding: 'utf8' });
        }
        /**
         * read all text from the file
         */
        public ReadAllText(): string {
            if (!this.Exists) return;
            return fs.readFileSync(this.Fullname).toString();
        }
        public WriteAllText(value: string): void {
            fs.writeFileSync(this.Fullname, value, { encoding: 'utf8' });
        }
        public MinifyJS(Config: IKoalaOption): string {

            let code: string;
            let minified: boolean;
            let i = this.Fullname.lastIndexOf('.');
            let minfilename = `${this.Fullname.substr(0, i)}.min.${this.Fullname.substr(i + 1)}`;
            if (File.ExistsStatic(minfilename)) {
                code = File.ReadAllTextStatic(minfilename);
                minified = true;
            }
            else {
                code = this.ReadAllText();
            }

            if (!code) console.log('Error: code is empty!');
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
                code = code.replace(/require\s*\(\s*['"`](\.{1,2}\/[\w\/\+\-\.\#\%]+)['"`]\)/g, (substring: string, ...args: string[]): string => {
                    let $modulepath = args[0];
                    //console.log('Module Path:', $modulepath, substring);

                    let $normpath = path.normalize(path.join(path.dirname(this.Fullname), args[0])).replace(/\\/ig, '/');
                    //console.log('Normalized Path: ', $normpath , this.Fullname);
                    //we then need to work out which module it is in:


                    let found = Config.Modules.find(item => $normpath.indexOf(path.join(Config.SourceRoot, item.value).replace(/\\/ig, '/')) == 0);

                    if (!found) console.log(`Unresolved Module: ${substring} in ${this.Fullname}.`, $normpath);

                    let $jspath = /\.js$/ig.test($normpath) ? $normpath : ($normpath + '.js');

                    if (!Config.RequiredJSFiles.some(item => item == $jspath)) Config.RequiredJSFiles.push($jspath);

                    let $targetpath = `${found.key}${$normpath.substr(path.join(Config.SourceRoot, found.value).replace(/\\/ig, '/').length)}`;


                    //console.log($targetpath);
                    //let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                    //console.log(minified);
                    return `require("${$targetpath}")`;
                });
            }


            
            //to replace the code with Angular2Template

            code = code.replace(/templateUrl\s*:\s*\$packer\.Angular2TemplateURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/g, (substring: string, ...args: string[]): string => {
                let temp = IO.File.ReadAllTextStatic(path.join(Config.SourceRoot, args[0]));
                let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                //console.log(minified);
                return `template: ${JSON.stringify(minified)}`;
            });

            code = code.replace(/styleUrls\s*:\s*\[\s*(\$packer\.Angular2StyleURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)\s*,?\s*)+\]/g, (substring: string, ...args: string[]): string => {
                let regex = /\$packer\.Angular2StyleURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/g;
                let result: RegExpExecArray;
                let styles: string[] = [];
                while (result = regex.exec(substring)) {
                    let css = IO.File.ReadAllTextStatic(path.join(Config.SourceRoot, result[1]));
                    styles.push(JSON.stringify(clean.minify(css).styles));
                }
                return `styles: [${styles.join(',')}]`;
            });

            code = code.replace(/\$packer\.Angular2RemoteTemplate\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/ig, (substring: string, ...args: string[]):string => {
 
                //let temp = HTMLParser.Loader.LoadTemplate(path.join(SourceRoot, args[0]).normalize());
                let temp = HTMLParser.Loader.LoadTemplate(path.join(Config.SourceRoot, args[0]).normalize());
                let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                return `{Value: ${JSON.stringify(minified)}}`;
            });

            if (minified) return code;
            return babel.transform(code, {
                comments: false,
                presets: ["babili"]//,
            }).code;
        }

        public BabiliOnly() {
            let code = this.ReadAllText();
            return babel.transform(code, {
                comments: false,
                presets: ["babili"]//,
            }).code;
        }

        public MinifyHTML(): string {
            let i = this.Fullname.lastIndexOf('.');
            let minfilename = `${this.Fullname.substr(0, i)}.min.${this.Fullname.substr(i + 1)}`;
            if (File.ExistsStatic(minfilename)) {
                return File.ReadAllTextStatic(minfilename);
            }
            let code = this.ReadAllText();
            return html.minify(code, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
        }

        public ReplacePacker(Config: IKoalaOption): string {

            let code = this.ReadAllText();

            code = code.replace(/templateUrl\s*:\s*\$packer\.Angular2TemplateURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/g, (substring: string, ...args: string[]): string => {
                let temp = IO.File.ReadAllTextStatic(path.join(Config.SourceRoot, args[0]));
                let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                //console.log(minified);
                return `template: ${JSON.stringify(minified)}`;
            });

            code = code.replace(/styleUrls\s*:\s*\[\s*(\$packer\.Angular2StyleURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)\s*,?\s*)+\]/g, (substring: string, ...args: string[]): string => {
                let regex = /\$packer\.Angular2StyleURL\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/g;
                let result: RegExpExecArray;
                let styles: string[] = [];
                while (result = regex.exec(substring)) {
                    let css = IO.File.ReadAllTextStatic(path.join(Config.SourceRoot, result[1]));
                    styles.push(JSON.stringify(clean.minify(css).styles));
                }
                return `styles: [${styles.join(',')}]`;
            });

            code = code.replace(/\$packer\.Angular2RemoteTemplate\s*\(\s*['"`]([\w#&~\-\.\/ ]+)['"`]\s*\)/ig, (substring: string, ...args: string[]): string => {

                //let temp = HTMLParser.Loader.LoadTemplate(path.join(SourceRoot, args[0]).normalize());
                let temp = HTMLParser.Loader.LoadTemplate(path.join(Config.SourceRoot, args[0]).normalize());
                let minified = html.minify(temp, { collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true });
                return `{Value: ${JSON.stringify(minified)}}`;
            });

            this.WriteAllText(code);
            return code;
        }
        public MinifyCSS(): string {
            let i = this.Fullname.lastIndexOf('.');
            let minfilename = `${this.Fullname.substr(0, i)}.min.${this.Fullname.substr(i + 1)}`;
            if (File.ExistsStatic(minfilename)) {
                return File.ReadAllTextStatic(minfilename);
            }
            let code = this.ReadAllText();
            return clean.minify(code).styles;
        }
        public MinifyTo(SourceRoot: string, TargetRoot: string, Config: IKoalaOption): boolean {
            let sRoot = path.normalize(SourceRoot).replace(/\\/ig, '/');
            let tRoot = path.normalize(TargetRoot).replace(/\\/ig, '/');

            if (this.Fullname.indexOf(sRoot) == 0) {
                let section = this.Fullname.substr(sRoot.length);
                let target = path.join(TargetRoot, section).normalize().replace(/\\/ig, '/');
                Directory.MakePathStatic(path.dirname(target));
                let minified: string = ''
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

        public TranspileSystemConfigTo(SourceRoot: string, TargetRoot: string, TargetURL: string): { key: string, value: string, manual?:boolean }[]  {
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
        public TranspileSystemConfig(TargetURL: string): { Transpiled: string, Modules: { key: string, value: string, manual?:boolean }[] } {
            let context = vm.createContext({
                System: SystemConfig
            });
            let script = vm.createScript(this.ReadAllText());
            script.runInContext(context);

            let DeployedMap: { key: string, value: string }[] = [];
            let DeployedPaths: { key: string, value: string }[] = [];

            let paths: { key: string, value: string }[] = [];

            for (let key in SystemConfig.Configuration.paths) {
                let pair = { key: key, value: SystemConfig.Configuration.paths[key] }
                paths.push(pair);
                if (/^https?:\/\//ig.test(pair.value)) {
                    //it is a remote path, should not replace
                    DeployedPaths.push({ key: pair.key, value: pair.value })
                }
                else {
                    //it is a local path, should be replaced by deployed path
                    DeployedPaths.push({ key: pair.key, value: TargetURL + pair.value.replace(/\\/ig, '/') })
                }
            }

            let map: { key: string, value: string }[] = [];

            let Modules: { key: string, value: string, manual?: boolean}[] = [];

            for (let key in SystemConfig.Configuration.map) {
                let pair = { key: key, value: SystemConfig.Configuration.map[key] };
                let found = paths.find(item => pair.value.indexOf(item.key) == 0);
                let pkg = SystemConfig.Configuration.packages[key];
                if (!found) {
                    if (/^https?:\/\//ig.test(pair.value)) {
                        //it is a remote path, should not replace
                        DeployedMap.push({ key: pair.key, value: pair.value});
                    }
                    else {
                        //it is a local path, should be replaced by deployed path
                        DeployedMap.push({ key: pair.key, value: TargetURL +  pair.value.replace(/\\/ig, '/') });
                        Modules.push({ key: pair.key, value: pair.value, manual: (pkg && pkg['manual'])?true:false });
                    }
                }
                else {
                    let deployedFound = DeployedPaths.find(item => item.key == found.key);
                    DeployedMap.push({ key: pair.key, value: deployedFound.value + pair.value.substr(found.key.length) });
                    //will minify and copy to deploy if it is not remote file
                    if (!/^https?:\/\//ig.test(found.value)) Modules.push({ key: pair.key, value: path.join(found.value, pair.value.substr(found.key.length)).normalize().replace(/\\/ig, '/'), manual: (pkg && pkg['manual']) ? true : false });
                }
            }

            let PathObject : { [key: string]: string } = {};
            DeployedPaths.forEach(item => {
                PathObject[item.key] = item.value;
            });
            let MapObject: { [key: string]: string } = {};
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

        public async CopyTo(SourceRoot: string, TargetRoot: string, CheckMin?: boolean): Promise<boolean> {
            let sRoot = path.normalize(SourceRoot).replace(/\\/ig, '/');
            let tRoot = path.normalize(TargetRoot).replace(/\\/ig, '/');
            if (this.Fullname.indexOf(sRoot) == 0) {
                let section = this.Fullname.substr(sRoot.length);
                let target = path.join(TargetRoot, section).normalize().replace(/\\/ig, '/');
                Directory.MakePathStatic(path.dirname(target));
                return new Promise<boolean>((resolve, reject) => {
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
        }
        /**
         * Load a file as module
         */
        public Load() {
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

            let exported = (<() => any>script.runInThisContext())();
            return exported;
        }
    }
    export class Directory{
        constructor(public Fullname: string) {
            this.Fullname = path.normalize(Fullname).replace(/\\/ig, '/');
        }
        public get Exists(): boolean {
            return fs.existsSync(this.Fullname) && fs.statSync(this.Fullname).isDirectory();
        }
        static ExistsStatic(DirectoryName: string): boolean {
            return fs.existsSync(DirectoryName) && fs.statSync(DirectoryName).isDirectory();
        }
        /**
         * read all files in the directory
         */
        public get Files(): File[] {
            if (!this.Exists) return [];
            return fs.readdirSync(this.Fullname).filter(item => fs.statSync(path.join(this.Fullname, item)).isFile()).map(item => new File(path.join(this.Fullname, item).normalize()));
        }
        public get Directories(): Directory[]{
            if(!this.Exists) return [];
            return fs.readdirSync(this.Fullname).filter(item => fs.statSync(path.join(this.Fullname, item)).isDirectory()).map(item => new Directory(path.join(this.Fullname, item).normalize()));
        }
        static MakePathStatic(fullpath: string): boolean {
            let sections: string[] = path.normalize(fullpath).replace(/\\/ig, '/').split(/\//);
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

    interface ISystemConfig {
        paths: { [key: string]: string };
        map: { [key: string]: string };
        packages: { [key: string]: { main: string, defaultExtension: string } };
    }
    class SystemConfig {
        static Configuration: ISystemConfig;
        static config(value: ISystemConfig) {
            SystemConfig.Configuration = value;
        }
    }
}


class KoalaTask {

    constructor() {

    }

    private configfile: string;
    private option: IKoalaOption;
    public async Start(configFilename: string) {
        console.log('start: ', configFilename);

 

        let cfgFile = new IO.File(configFilename);
        if (!cfgFile.Exists) {
            console.log('Error @Start; Config File does not Exist!')
            return;
        }

        let config : IKoalaOption = cfgFile.Load();

        

        if ( ! (config.SourceRoot && IO.Directory.ExistsStatic(config.SourceRoot))) {
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
                    if (item.manual) continue;
                    if (IO.Directory.ExistsStatic(itemPath)) {
                        await this.IterateDir(config.TargetFiles, new IO.Directory(itemPath), config.TargetRoot, config);
                    }
                    else if (IO.File.ExistsStatic(itemPath)) {
                        await this.ProcessFile(config.TargetFiles, new IO.File(itemPath), config.TargetRoot, config);
                    }
                }

                if (config.BundleTarget) {
                    let builder = new SystemBuilder('', config.SystemJSConfig);
                    console.log('@SystemJS Builder Start');
                    try {
                        builder.buildStatic(`${config.BundleModule}/main.js`, path.join(config.TargetRoot, config.BundleTarget), { minify: false, mangle: false })
                        .then(
                            function () {
                                console.log(`@SystemJS Bundle Success! ${config.BundleTarget}`);
                                console.log(`@Try to Minify with Babili`);
                                let target = new IO.File(path.join(config.TargetRoot, config.BundleTarget));
                                target.WriteAllText(target.BabiliOnly());
                                console.log(`@Minification Done with Babili`);
                            }
                        )
                        
                    }
                    catch (e) {
                        console.log('@SystemJS Bundle Error: ', e);
                    }
                }


                //pack files
                if (Array.isArray(config.PackFiles)) {
                    let builder: string[] = [];
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

                if (config.TargetManuals) {//all files and dirs
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
                let unresolved: string[];

                unresolved = config.RequiredJSFiles.filter(r => !config.JSFiles.some(js => js == r));

                while (unresolved.length > 0) {
                    config.RequiredJSFiles = [];
                    console.log(`resolving ${unresolved.length} dependencies:`)
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
                await this.IterateDir(config.TargetFiles, sourceDir, config.TargetRoot, config);
                break;
        }


        config.Mode = 'local';
        console.log('Log @Start: Deploy Server');
        await this.IterateDir(config.ServerFiles, sourceDir, config.ServerRoot, config);



        if (config.ServerManual) {//all files and dirs
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
    }
    public async ProcessFile(options: LoaderOption[], file: IO.File, Destination: string, config: IKoalaOption) {
        for (let option of options) {
            switch (option.Type) {
                case 'file':
                    if (path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/') == file.Fullname) {
                        await this.ExecuteFile(option.Action, file, config, Destination);
                        return;
                    }
                    break;
                case 'file regex':
                    option.Regex.lastIndex = undefined;
                    if (option.Regex.test(file.Fullname)) {

                        await this.ExecuteFile(option.Action, file, config, Destination);
                        return;
                    }
                    break;
            }
        }
    }
    public async IterateDir(options: LoaderOption[], directory: IO.Directory, Destination: string, config: IKoalaOption) {

        for (let option of options) {
            switch (option.Type) {
                case 'directory':
                    console.log(path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/'), directory.Fullname);
                    if (path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/') == directory.Fullname) {
                        await this.ExecuteDirectory(option.Action, directory, config, Destination);
                        return;
                    }
                    break;
                case 'directory regex':
                    option.Regex.lastIndex = undefined;
                    if (option.Regex.test(directory.Fullname)) {
                        await this.ExecuteDirectory(option.Action, directory, config, Destination);
                        return;
                    }
                    break;
            }
        }

        //console.log(`Log @IterateDir: ${directory.Fullname}\n`, options);
        for (let file of directory.Files) {
            for (let option of options) {
                let found: boolean;
                switch (option.Type) {
                    case 'file':
                        if (path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/') == file.Fullname) {
                            await this.ExecuteFile(option.Action, file, config, Destination);
                            found = true;
                        }
                        break;
                    case 'file regex':
                        option.Regex.lastIndex = undefined;
                        if (option.Regex.test(file.Fullname)) {
                            await this.ExecuteFile(option.Action, file, config, Destination);
                            found = true;
                        }
                        break;
                }
                if (found) break;
            }
        }
        for (let dir of directory.Directories) {
            for (let option of options) {
                let found: boolean;
                switch (option.Type) {
                    case 'directory':
                        console.log(path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/'), dir.Fullname);
                        if (path.join(config.SourceRoot, option.Path).normalize().replace(/\\/ig, '/') == dir.Fullname) {
                            await this.ExecuteDirectory(option.Action, dir, config, Destination);
                            found = true;
                        }
                        break;
                    case 'directory regex':
                        option.Regex.lastIndex = undefined;
                        if (option.Regex.test(dir.Fullname)) {
                            await this.ExecuteDirectory(option.Action, dir, config, Destination);
                            found = true;
                        }
                        break;
                    default:
                        await this.IterateDir(options, dir, Destination, config);
                        break;
                }
                if (found) break;
            }
        }
    }
    public async ExecuteFile(action: 'copy' | 'minify' | 'prepack' | 'none', file: IO.File, config: IKoalaOption, targetDir: string) {
        console.log(`Log @ExecuteFile: Action: ${action} ${file.Fullname}`);
        switch(action){
            case 'copy':
                await file.CopyTo(config.SourceRoot, targetDir, true);
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
    }
    public async ExecuteDirectory(action: 'copy' | 'minify' | 'none', directory: IO.Directory, config: IKoalaOption, targetDir: string) {
        //apply to every desendants except none
        switch (action) {
            case 'copy':
            case 'minify':
                for (let file of directory.Files) {
                    await this.ExecuteFile(action, file, config, targetDir);
                }
                for (let dir of directory.Directories) {
                    await this.ExecuteDirectory(action, dir, config, targetDir);
                }
                break;
            case 'none':
                break;
        }
    }

    public WatchList: string[] = [];
    public Load(configFilename: string) {
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
    private ConfigWatchListener = (curr: fs.Stats, prev: fs.Stats) => {
        if (!this.Load(this.configfile)) {
            console.log('Failed to load config file. Quit.');
            return;
        }
        console.log('filed changed:', this);
        task.Compile();
    }
    private WatchConfig() {
        fs.watch(this.configfile, this.ConfigWatchListener);
    }
    public FileWatchListener(curr: fs.Stats, prev: fs.Stats) {
        console.log('file change detected. start compiling...');
        task.Compile();
    }
    public ReplaceAngular1TemplateUrl(code: string): string {
        packerRegex.lastIndex = undefined;
        return code.replace(packerRegex, (substring: string, ...args: any[]) => {
            let filename: string = __dirname + args[0];
            //load the html file from disk
            if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {
                console.log('file:', filename, 'ng2-template', fs.existsSync(filename));
                if (this.WatchList.indexOf(filename) < 0) this.WatchList.push(filename);
                let template = JSON.stringify(html.minify(fs.readFileSync(filename).toString(), { caseSensitive: true, collapseWhitespace: true, conservativeCollapse: true, removeComments: true }));
                //console.log('replacing with file ', template);
                return '.template = ' + template;
            }
            else {
                return substring;
            }
        });
    }
    public Compile() {
        let jsBuilder: string[] = [];
        let cssBuilder: string[] = [];
        console.log('Start Compile: ' + (new Date(Date.now()).toString()));

       
        console.log('End Compile: ' + (new Date(Date.now()).toString()));
    }
    private watchers: string[];
    public Watch() {
        if (this.watchers) {
            this.watchers.forEach(file => fs.unwatchFile(file));
        }
        this.watchers = [];
        this.WatchList.forEach(filename => {
            if (fs.existsSync(filename) && fs.statSync(filename).isFile()) {
                this.watchers.push(filename);
                fs.watchFile(filename, this.FileWatchListener);
            }
        })
    }
}






/**
 * HTML Parser for the loader system
 */
module HTMLParser {
    export class Loader {
        public static LoadTemplate(url: string): string {
            if (typeof url == 'object' && url['Value']) {
                return url['Value'];
            }
            else {
                let idIndex = url.indexOf('#');
                let id: string;
                if (idIndex > -1) {
                    id = url.substr(idIndex + 1);
                    url = url.substr(0, idIndex);
                }
                //let result = await jQuery.ajax(url, { method: 'get' });

                let result = IO.File.ReadAllTextStatic(url);

                if (id) {
                    result = Loader.findID(result, id);
                    //console.log('found id removed', result);
                }
                return result;
            }
        }
         
        public static findID(source: string, id: string) {
            let parsed = HTMLParser.parse(source);
            //console.log('parsed:', parsed);
            let found = parsed.findById(id);

            //console.log('found: ', found);
            let code = parsed.html.substring(found.start, found.end);
            let att = found.attributes.find(attr => attr.key == 'id' && attr.value == id);
            return code.substring(0, att.start - found.start) + code.substring(att.end - found.start);
        }
    }

    export class ParsedHTML {
        html: string;
        nodes: IHTMLNode[] = [];
        findById(id: string): IHTMLNode {
            let test = (attributes: IHTMLAttribute[]) => Array.isArray(attributes) && attributes.some(attr => attr.key == 'id' && attr.value == id);
            let search = (nodes: IHTMLNode[]): IHTMLNode => {
                if (!Array.isArray(nodes)) return undefined;
                for (let j = 0; j < nodes.length; j++) {
                    let node = nodes[j];
                    if (test(node.attributes)) return node;
                    if (node.nodes && Array.isArray(node.nodes)) {
                        for (let i = 0; i < node.nodes.length; i++) {
                            let result = search(node.nodes);
                            if (result) return result;
                        }
                    }
                }
                return undefined;
            }
            return search(this.nodes);
        }
    }
    export interface IHTMLNode {
        start: number;
        end: number;
        tag: string;
        attributes: IHTMLAttribute[];
        nodes: IHTMLNode[];
    }
    export interface IHTMLAttribute {
        start: number;
        end: number;
        key: string;
        value: string;
    }
    export class RegexSearcher {
        constructor(public regex: RegExp) {
        }
        search(value: string, pos?: number) {
            this.regex.lastIndex = pos;
            this.result = this.regex.exec(value);
            if (!this.result) this.regex.lastIndex = undefined;
        }
        public result: RegExpExecArray;
        searchAll(value: string) {
            this.regex.lastIndex = undefined;
            let arr: RegExpExecArray;
            let results: RegExpExecArray[] = [];
            while (arr = this.regex.exec(value)) {
                results.push(arr);
            }
            this.results = results;
        }
        public results: RegExpExecArray[];

    }
    export class HTMLParser {
        static parse(html: string): ParsedHTML {
            html = HTMLParser.removePairs(html, /<\!--/ig, /-->/ig);
            html = HTMLParser.removePairs(html, /<script/ig, /<\/script>/ig);
            let result = new ParsedHTML();
            result.html = html;
            HTMLParser.parseNodes(result.html, result.nodes);
            return result;
        }

        static parseNodes(html: string, SearchStack: IHTMLNode[], pos?: number, current?: IHTMLNode): number {
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
                if (tags.length > 0) return tags[0];
                return undefined; //nothing found
            }

            let count = 0;
            if (current) {
                //uncompleted tag: search for new tag or tag close

                //while until we reach the end tag;
                let next: RegexSearcher;

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
                        })
                        pos = next.regex.lastIndex;
                    }
                    if (next == tagBegin) {
                        //console.log('tagBegin');
                        //begin a new tag
                        let inner: IHTMLNode = {
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
                let next: RegexSearcher;
                while (next = tryFindNext()) {
                    //count += 1;
                    //if (count > 10) break;
                    //console.log(next.result);
                    if (!next.result) console.log('empty result:', next.regex.lastIndex, pos);
                    if (next == tagSelfClose) {
                        //console.log('tagSelfClose');
                        SearchStack.push({
                            tag: next.result[1],
                            start: next.result.index,
                            end: next.result.index + next.result[0].length,
                            attributes: HTMLParser.parseAttributes(next.result[0], next.result.index),
                            nodes: []
                        })
                        pos = next.regex.lastIndex;
                    }
                    if (next == tagBegin) {
                        //console.log('tagBegin');
                        //begin a new tag
                        let inner: IHTMLNode = {
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
        static parseAttributes(value: string, start: number): IHTMLAttribute[] {
            //[1]: key [4]: value;
            let attribute = new RegexSearcher(/\s+([\w\[\]\(\)\*\.\-]+)((="([^"]+)")|)/ig);
            attribute.searchAll(value);
            return attribute.results.map((r): IHTMLAttribute => {
                return {
                    start: start + r.index,
                    end: start + r.index + r[0].length,
                    key: r[1],
                    value: r[4]
                }
            });
        }
        static removePairs(value: string, s: RegExp, e: RegExp): string {
            let regions: { start: number, end: number }[] = [];
            let match: RegExpExecArray;
            while (match = s.exec(value)) {
                if (e.test(value)) {
                    regions.push({ start: s.lastIndex - match[0].length, end: e.lastIndex });
                }
            }
            let begin = 0;
            let results: string[] = [];
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


}
let task = new KoalaTask();
task.Start(filename);