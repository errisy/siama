"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const core_1 = require("@angular/core");
const router_1 = require("@angular/router");
let AppComponent = class AppComponent {
    constructor(router) {
        this.router = router;
        this.NavigationVisible = true;
        this.SearchText = '';
    }
    ngAfterContentInit() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    get url() {
        return this.router.url;
    }
    navigate(parameters) {
        this.router.navigate(parameters);
    }
};
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app,[my-app]',
        templateUrl: $packer.Angular2TemplateURL('app/app.component.html'),
        styleUrls: [$packer.Angular2StyleURL('app/app.component.css')],
        encapsulation: core_1.ViewEncapsulation.Emulated
    }),
    __metadata("design:paramtypes", [router_1.Router])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map