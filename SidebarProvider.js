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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class SidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((mData) => __awaiter(this, void 0, void 0, function* () {
            switch (mData.type) {
                case "onPlay": {
                    vscode.commands.executeCommand("cider-remote.play");
                    break;
                }
                case "onPause": {
                    vscode.commands.executeCommand("cider-remote.pause");
                    break;
                }
                case "onNextSong": {
                    vscode.commands.executeCommand("cider-remote.nextSong");
                    break;
                }
                case "onPreviousSong": {
                    vscode.commands.executeCommand("cider-remote.previousSong");
                    break;
                }
                case "onInfo": {
                    if (!mData.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(mData.value);
                    break;
                }
                case "onError": {
                    if (!mData.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(mData.value);
                    break;
                }
            }
        }));
    }
    revive(panel) {
        this._view = panel;
    }
    _getHtmlForWebview(webview) {
        const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "styles", "reset.css"));
        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "styles", "vscode.css"));
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; 'unsafe-inline'>
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">
        <script>
          const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
      <h1>Cider Remote</h1>
      <h3 id="songTitle">Song Title</h3>
      <button onclick="
          tsvscode.postMessage({
            type: 'onPlay',
            value: ''
          });
      ">Play</button>
      <button onclick="
          tsvscode.postMessage({
            type: 'onPause',
            value: ''
          });
      ">Pause</button>
      <button onclick="
          tsvscode.postMessage({
            type: 'onNextSong',
            value: ''
          });
      ">Next Song</button>
      <button onclick="
          tsvscode.postMessage({
            type: 'onPreviousSong',
            value: ''
          });
      ">Previous Song</button>

      <script>
        let songTitleElement = document.getElementById("songTitle");
        
        socket = new WebSocket("ws://localhost:26369");
        socket.onopen = (e) => {
          socket.onmessage = (e) => {
            console.log('Arctia received message from Cider.');
            if (JSON.parse(e.data).data.artistName !== undefined) {
              songTitleElement.innerText = JSON.parse(e.data).data.artistName;
            }
          }
        }

        if (JSON.parse(e.data).data.artistName !== undefined) {
          console.log(JSON.parse(e.data).data.artistName);
        }
      </script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
