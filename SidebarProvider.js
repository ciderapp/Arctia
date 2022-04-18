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
        <img alt="Album Artwork" id="album-artwork" width="1000" height="1000">
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
      <button id="reload-button" style="display: none;" onclick="
        /*No need for this.
        document.location.reload()
        document.location = document.location
        */
      ">Retry Connection</button>

      <script>
        let nameElement = document.getElementById("name");
        let artistElement = document.getElementById("artist");
        let albumElement = document.getElementById("album");
        let playbackSlider = document.getElementById("playback-slider");
        let artworkElement = document.getElementById("album-artwork");
        let albumLinkElement = document.getElementById("album-link")

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
            // Playback Info
            if (JSON.parse(e.data).data.name !== undefined) {
              nameElement.innerText = JSON.parse(e.data).data.name;
            }
            if (JSON.parse(e.data).data.artistName !== undefined) {
              artistElement.innerText = JSON.parse(e.data).data.artistName;
            }
            if (JSON.parse(e.data).data.albumName !== undefined) {
              albumElement.innerText = JSON.parse(e.data).data.albumName;
            }
            
            // Album Artwork
            if (JSON.parse(e.data).data.artwork[url] !== undefined) {
              artworkElement.src = JSON.parse(e.data).data.artwork[url]
            }
            if (JSON.parse(e.data).data.url[appleMusic] !== undefined) {
              albumLinkElement.href = JSON.parse(e.data).data.url[appleMusic]
            }

            // Play/Pause Logic
            if (JSON.parse(e.data).data.status !== undefined) {
              if (JSON.parse(e.data).data.status == true) {
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
            if (JSON.parse(e.data).data.durationInMillis !== undefined) {
              if (playbackSlider.style.display == "none") {
                playbackSlider.style.display = "block";
              }
              playbackSlider.max = JSON.parse(e.data).data.durationInMillis;
            }
            if (JSON.parse(e.data).data.remainingTime !== undefined && JSON.parse(e.data).data.durationInMillis !== undefined) {
              if (playbackSlider.style.display == "none") {
                playbackSlider.style.display = "block";
              }
              playbackSlider.value = JSON.parse(e.data).data.durationInMillis - JSON.parse(e.data).data.remainingTime;
            }
          }
        }

      </script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
