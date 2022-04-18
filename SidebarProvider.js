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
const extension_1 = require("./extension");
class SidebarProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((mData) => __awaiter(this, void 0, void 0, function* () {
            switch (mData.type) {
                case "onPlay": {
                    (0, extension_1.play)();
                    break;
                }
                case "onPause": {
                    (0, extension_1.pause)();
                    break;
                }
                case "onNextSong": {
                    (0, extension_1.next)();
                    break;
                }
                case "onPreviousSong": {
                    (0, extension_1.previous)();
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
      <h1>Project Arctia (Alpha)</h1>
      <br>
      <a id="album-link">
        <img alt="Album Artwork" id="album-artwork" width="1000" height="1000" style="border-radius: 2%">
      </a>
      <h2 id="name"> </h2>
      <h3 id="artist"> </h3>
      <p id="album"> </p>
      <br>
      <input id="playback-slider" type="range" id="volume" min="0" oninput="updatePlaybackSlider()">
      <button id="play-button" onclick="
          tsvscode.postMessage({
            type: 'onPlay',
            value: ''
          });
      " style="display: none;">Play</button>
      <button id="pause-button" onclick="
          tsvscode.postMessage({
            type: 'onPause',
            value: ''
          });
      " style="display: none;">Pause</button>
      <button id="next-button" onclick="
          tsvscode.postMessage({
            type: 'onNextSong',
            value: ''
          });
      ">Next Song</button>
      <button id="previous-button" onclick="
          tsvscode.postMessage({
            type: 'onPreviousSong',
            value: ''
          });
      ">Previous Song</button>

      <script>
        let nameElement = document.getElementById("name");
        let artistElement = document.getElementById("artist");
        let albumElement = document.getElementById("album");
        let playbackSlider = document.getElementById("playback-slider");
        let artworkElement = document.getElementById("album-artwork");
        let albumLinkElement = document.getElementById("album-link");
        let currentMediaItem = {};

        function updatePlaybackSlider() {
          seekTo(playbackSlider.value);
          console.log(playbackSlider.value);
        }

        function seekTo(time, adjust = true) {
          if (adjust) {
              time = parseInt(time / 1000)
          }
          socket.send(JSON.stringify({
              action: "seek",
              time: time
          }));
        }
        
        socket = new WebSocket("ws://localhost:26369");
        socket.onopen = (e) => {
          socket.onmessage = (e) => {
            console.log('Arctia received message from Cider.');
            currentMediaItem = JSON.parse(e.data).data;
            // Playback Info
            if (currentMediaItem.name !== undefined) {
              nameElement.innerText = currentMediaItem.name;
            }
            if (currentMediaItem.artistName !== undefined) {
              artistElement.innerText = currentMediaItem.artistName;
            }
            if (currentMediaItem.albumName !== undefined) {
              albumElement.innerText = currentMediaItem.albumName;
            }
            
            // Album Artwork
            if (currentMediaItem.artwork !== undefined) {
              artworkElement.src = currentMediaItem.artwork.url.replace('{w}', 600).replace('{h}', 600);
            }

            // Play/Pause Logic
            if (currentMediaItem.status !== undefined) {
              if (currentMediaItem.status == true) {
                document.getElementById("play-button").style.display = "none";
                document.getElementById("pause-button").style.display = "block";
              } else {
                document.getElementById("pause-button").style.display = "none";
                document.getElementById("play-button").style.display = "block";
              }
            }

            // Playback Slider
            if (playbackSlider.max == null) {
              playbackSlider.style.display = "none";
            }
            if (currentMediaItem.durationInMillis !== undefined) {
              if (playbackSlider.style.display == "none") {
                playbackSlider.style.display = "block";
              }
              playbackSlider.max = currentMediaItem.durationInMillis;
            }
            if (currentMediaItem.remainingTime !== undefined && currentMediaItem.durationInMillis !== undefined) {
              if (playbackSlider.style.display == "none") {
                playbackSlider.style.display = "block";
              }
              playbackSlider.value = currentMediaItem.durationInMillis - currentMediaItem.remainingTime;
            }
          }
        }

      </script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
