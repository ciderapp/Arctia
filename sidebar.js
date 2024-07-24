const vscode = require('vscode')
const { io } = require("socket.io-client");
const { default: fetch } = require('node-fetch');

let CurrentMediaItem;
setInitialData();

async function comRPC(method, request) {
    console.debug("[DEBUG] Sending request to Cider REST:", request)
    return fetch('http://localhost:10767/' + request, {
        method: method
    })
        .then(response => response.json())
        .then(json => {
            return json;
        })
        .catch(error => console.warn("[WARNING] An error occurred while processing the request:", error));
}

async function setInitialData() {
    console.log("[INFO] Fetching initial data from Cider REST.");
    let initialData = await comRPC("GET", "api/v1/playback/now-playing");
    CurrentMediaItem = initialData["info"];
}

const socket = io("http://localhost:10767", {
    transports: ["websocket"]
});

socket.on("connect", async () => {
    console.log("[INFO] Connected to Cider with Socket.IO.");
});

socket.on("disconnect", () => {
    console.log("[INFO] Disconnected from Cider with Socket.IO.");
});

socket.on("error", (error) => {
    console.warn("[WARNING] An error occurred while processing the request to Socket.IO for Cider:", error);
});

socket.on("API:Playback", (message) => {
    switch (message.type) {
        case "playbackStatus.playbackTimeDidChange":
            CurrentMediaItem["isPlaying"] = true;
            break;
        case "playbackStatus.nowPlayingItemDidChange":
            CurrentMediaItem = message.data;
            break;

        case "playbackStatus.playbackStateDidChange":
            CurrentMediaItem = message.data["attributes"];
            CurrentMediaItem["state"] = message.data["state"];
            switch (message.data["state"]) {
                case "playing":
                    CurrentMediaItem["isPlaying"] = true;
                    break;

                case "paused":
                    CurrentMediaItem["isPlaying"] = false;
                    break;
            }

        default:
            break;
    }
});

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
        webviewView.webview.onDidReceiveMessage(async (mData) => {
            switch (mData.type) {
                case "dataSocketError": {
                    vscode.window.showErrorMessage("Arctia connection error, details logged to console.");
                }
                case "debugMenuOpened": {
                    vscode.window.showWarningMessage("Hello World! You've opened the debug menu.");
                    vscode.commands.executeCommand('workbench.action.toggleDevTools');
                    break;
                }
                case "debugMenuClosed": {
                    vscode.window.showInformationMessage("Debug menu closed.");
                    break;
                }
                case "controlPlayback": {
                    switch (mData.value) {
                        case "play":
                            comRPC("POST", "api/v1/playback/play");
                            break;
                        case "pause":
                            comRPC("POST", "api/v1/playback/pause");
                            break;
                        case "next":
                            comRPC("POST", "api/v1/playback/next");
                            break;
                        case "previous":
                            comRPC("POST", "api/v1/playback/previous");
                            break;
                        default:
                            console.error("Invalid playback control command, please report this to the developer.");
                            break;
                    }
                    break;
                }
                case "fetchPlaybackInfo": {
                    const playbackInfo = CurrentMediaItem;
                    webviewView.webview.postMessage({
                        type: "playbackInfo",
                        value: playbackInfo
                    });
                    break;
                }
            }
        });
    }

    revive(panel) {
        this._view = panel;
    }

    _getHtmlForWebview(webview) {

        const stylesResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "styles", "reset.css")
        );
        const stylesMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "styles", "vscode.css")
        );
        const stylesCustomUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "styles", "custom.css")
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "script.js")
        );

        return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="img-src https: data:; 'unsafe-inline'">
                <meta name=" viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesResetUri}" rel="stylesheet">
                <link href="${stylesMainUri}" rel="stylesheet">
                <link href="${stylesCustomUri}" rel="stylesheet">
            </head>
            <body>
                <img class="album-artwork" width="600" height="600">
                <h2 class="name"> </h2>
                <h3 class="artist"> </h3>
                <p class="album"> </p>
                <div class="playback-buttons">
                    <button class="playback-button play" onclick="play()">Play</button>
                    <button class="playback-button pause" onclick="pause()">Pause</button>
                    <button class="playback-button next" onclick="next()">Next Song</button>
                    <button class="playback-button previous" onclick="previous()">Previous Song</button>
                </div>
                <div class="debug">
                    <h2 class="debug-header">Debug Options</h2>
                    <button class="debug-button" onclick="console.log(currentMediaItem)">Log Playback Info</button>
                    <button class="debug-button" onclick="pause()">Force Pause</button>
                    <button class="debug-button" onclick="play()">Force Play</button>
                    <button class="debug-button" onclick="heartHide()">Close Debug Menu</button>
                </div>
                <div class="footer">
                    <p class="radio-notice">Playback controls are currently not supported during radio playback.</p>
                    <br>
                    <footer>Made with <button class="heart" onclick="heartTap()">❤️</button> by <a href="https://cider.sh/" target="_blank">Cider Collective</a></footer>
                </div>
                <script src="${scriptUri}"></script>
            </body>
        </html>
        `;
    }
}

module.exports = SidebarProvider;
