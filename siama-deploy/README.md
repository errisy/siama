# SIAMA Full Stack Test

## Front End Tech
Angular 2, SystemJS, errisy-task/errisy-tsc (for cancelling UI tasks)

## Server Tech
errisy-server (A full stack Remote Procedure Call server for REST APIs)
REST APIs (Written in app/app.rpc.ts)
errisy-server loads the app.rpc.js at runtime and execute the APIs defined in it. app.client.ts is automatically generated for client side async/await style API calls. Error message can be sent from server to client when exception is wrapped with RPCError class.

## Folders
**siama/ng2/** is the source file for the whole project.
**siama/siama-deploy/** is the folder for static client-side files (i.g. *.js, *.css, images, etc). which is synchronized to github for file hosting.
**siama/root/** is the root folder for the server side files. where the app entry index.html and server files (app/app.rpc.js) are located.
**siama/siama-server/** contains the errisy-server instance.
**siama/e2e/** is the selenium e2e/unit test.

## How to start the server?
First, please make sure your 80 port is available.
(For windows) **siama/siama-server/start.cmd**
(For other OS) in folder **siama/siama-server**, execute command: **node start.sys**
Cluster is not used in the server because in production, pm2 will be used to manage cluster.

## Packing & Bundling
**siama/ng2/src/koala-min.ts** is the packing and bundling scripts. It uses clean-css, html-minifier, babel, babili and systemjs builder to pack or build bundles.
All independent js files are packed into sys.js
All app module and dependencies are bundled as app.js

## Front End Design Rule
To avoid styles of one component affects another, :host selector styles with ViewEncapsulation.Emulated are used for each component's layout.
Front End UI components are designed as independent components, which can be included in any project without adding/changing dependencies.

## Mobile Features
**Compatible in mobile browsers** @media query is applied to handle screen sizes with mobile first. The header and input fields layouts will response to browser width changes.
**mobile app supports** manifest.json and apple app supports are enabled in the index.html.

## How to run e2e test.
**siama/e2e/test/bin/Debug/test.exe**
This is a WPF application using selenium webdriver. You may not be able to run it on other OS.
Click **View Report** and **Edit Report** to start each of the tests.

