"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.wsMessage = exports.socket = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const SidebarProvider_1 = require("./SidebarProvider");
const ws_1 = require("ws");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const sideBarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("cider-remote-sidebar", sideBarProvider));
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand('cider-remote.helloWorld', function () {
        vscode.window.showInformationMessage('Hello World from Cider Remote!');
        console.log(exports.socket);
    }));
    // Register command to play
    context.subscriptions.push(vscode.commands.registerCommand('cider-remote.play', function () {
        vscode.window.showInformationMessage('Cider Playback Started!');
        play();
    }));
    // Regsiter command to pause
    context.subscriptions.push(vscode.commands.registerCommand('cider-remote.pause', function () {
        vscode.window.showInformationMessage('Cider Playback Stopped!');
        pause();
    }));
    // Register command to go to next song
    context.subscriptions.push(vscode.commands.registerCommand('cider-remote.nextSong', function () {
        vscode.window.showInformationMessage('Next Song from Cider Remote!');
        next();
    }));
    // Register command to go to previous song
    context.subscriptions.push(vscode.commands.registerCommand('cider-remote.previousSong', function () {
        vscode.window.showInformationMessage('Previous Song from Cider Remote!');
        previous();
    }));
    exports.socket = new ws_1.WebSocket(`ws://localhost:26369`);
    exports.socket.onopen = (e) => {
        vscode.window.showInformationMessage('Cider Remote successfully connected to Cider.');
        exports.socket.onclose = (e) => {
            vscode.window.showInformationMessage('Cider Remote disconnected from Cider.');
        };
        exports.socket.onerror = (e) => {
            console.log(e);
            vscode.window.showErrorMessage('Cider Remote connection error.');
        };
    };
}
exports.activate = activate;
function play() {
    exports.socket.send(JSON.stringify({
        action: "play"
    }));
}
function pause() {
    exports.socket.send(JSON.stringify({
        action: "pause"
    }));
}
function next() {
    exports.socket.send(JSON.stringify({
        action: "next"
    }));
}
function previous() {
    exports.socket.send(JSON.stringify({
        action: "previous"
    }));
}
// this method is called when your extension is deactivated
function deactivate() { }
module.exports = {
    activate,
    deactivate
};
