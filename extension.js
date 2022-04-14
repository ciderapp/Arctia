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
const vscode = __importStar(require("vscode"));
const SidebarProvider_1 = require("./SidebarProvider");
const ws_1 = require("ws");
var messageData;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const sideBarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("arctia-sidebar", sideBarProvider));
    // Register command to play
    context.subscriptions.push(vscode.commands.registerCommand('arctia.playpause', function () {
        if (JSON.parse(messageData.data).data.status == true) {
            pause();
        }
        else {
            play();
        }
    }));
    // Register command to go to next song
    context.subscriptions.push(vscode.commands.registerCommand('arctia.nextSong', function () {
        next();
    }));
    // Register command to go to previous song
    context.subscriptions.push(vscode.commands.registerCommand('arctia.previousSong', function () {
        previous();
    }));
    exports.socket = new ws_1.WebSocket(`ws://localhost:26369`);
    exports.socket.onopen = (e) => {
        vscode.window.showInformationMessage('Project Arctia successfully connected to Cider.');
        exports.socket.onclose = (e) => {
            vscode.window.showInformationMessage('Project Arctia disconnected from Cider.');
        };
        exports.socket.onerror = (e) => {
            console.log(e);
            vscode.window.showErrorMessage('Project Arctia connection error.');
        };
        exports.socket.onmessage = (e) => {
            messageData = e;
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
function deactivate() { }
module.exports = {
    activate,
    deactivate
};
