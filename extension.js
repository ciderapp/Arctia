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
exports.previous = exports.next = exports.playPause = exports.pause = exports.play = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const SidebarProvider_1 = require("./SidebarProvider");
const ws_1 = require("ws");
var socket;
var messageData;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const sideBarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("arctia-sidebar", sideBarProvider));
    // Register command to play and pause
    context.subscriptions.push(vscode.commands.registerCommand('arctia.playpause', function () {
        playPause();
    }));
    // Register command to go to next song
    context.subscriptions.push(vscode.commands.registerCommand('arctia.nextSong', function () {
        next();
    }));
    // Register command to go to previous song
    context.subscriptions.push(vscode.commands.registerCommand('arctia.previousSong', function () {
        previous();
    }));
    socket = new ws_1.WebSocket(`ws://localhost:26369`);
    socket.onopen = () => {
        vscode.window.showInformationMessage('Arctia successfully connected to Cider.');
        socket.onclose = () => {
            vscode.window.showInformationMessage('Arctia disconnected from Cider.');
        };
        socket.onerror = (e) => {
            console.log(e);
            vscode.window.showErrorMessage('Arctia connection error.');
        };
        socket.onmessage = (e) => {
            messageData = e;
        };
    };
}
exports.activate = activate;
function play() {
    socket.send(JSON.stringify({
        action: "play"
    }));
}
exports.play = play;
function pause() {
    socket.send(JSON.stringify({
        action: "pause"
    }));
}
exports.pause = pause;
function playPause() {
    socket.send(JSON.stringify({
        action: "playpause"
    }));
}
exports.playPause = playPause;
function next() {
    socket.send(JSON.stringify({
        action: "next"
    }));
}
exports.next = next;
function previous() {
    socket.send(JSON.stringify({
        action: "previous"
    }));
}
exports.previous = previous;
function deactivate() { }
module.exports = {
    activate,
    deactivate
};
