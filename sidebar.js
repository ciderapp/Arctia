const vscode = require('vscode')
const { default: fetch } = require('node-fetch');

// RPC Function for Key Events
async function comRPC(method, request) {
	return fetch('http://[::1]:10769/' + request, {
			method: method,
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(response => response.json())
		.then(json => {
			return json;
		})
		.catch(error => console.debug("[DEBUG] [ERROR] An error occurred while processing the request:", error));
}

async function grabPlaybackInfo() {
	return fetch('http://[::1]:10769/currentPlayingSong', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(response => response.json())
		.then(json => {
			return json;
		})
		.catch(error => console.debug("[DEBUG] [ERROR] An error occurred while processing the request:", error));
}

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
				case "developerMenuOpened": {
					vscode.window.showErrorMessage("CLOSE THE DEVELOPMENT MENU, unless you know what are you doing, as it is made for developers only.");
					vscode.commands.executeCommand('workbench.action.toggleDevTools');
					break;
				}
				case "developerMenuClosed": {
					vscode.window.showInformationMessage("Developer menu closed.");
					break;
				}
				case "controlPlayback": {
					if (mData.value == "play" || mData.value == "pause" || mData.value == "next" || mData.value == "previous") {
						comRPC("GET", mData.value);
					}
					break;
				}
				case "fetchPlaybackInfo": {
					const playbackInfo = await grabPlaybackInfo();
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
        	<h1>Arctia</h1>
        	<br>
        	<a class="album-link">
        		<img class="album-artwork" width="600" height="600">
        	</a>
        	<h2 class="name"> </h2>
        	<h3 class="artist"> </h3>
        	<p class="album"> </p>
            <div class="playback-slider-container">
        	    <!-- <input class="playback-slider" type="range" id="playbackProgress" min="0" oninput="seekTo(playbackSlider.value);"> -->
                <progress class="playback-slider" id="playbackProgress" min="0"></progress>
            </div>
        	<div class="playback-buttons">
        		<button class="playback-button play" onclick="play()">Play</button>
        		<button class="playback-button pause" onclick="pause()">Pause</button>
        		<button class="playback-button next" onclick="next()">Next Song</button>
        		<button class="playback-button previous" onclick="previous()">Previous Song</button>
        	</div>
        	<div class="debug">
        		<h2 class="debug-header">Developer Options</h2>
        		<button class="debug-button" onclick="console.log(currentMediaItem)">Log Playback Info</button>
        		<button class="debug-button" onclick="pause()">force pause</button>
        		<button class="debug-button" onclick="play()">force play</button>
        		<button class="debug-button" onclick="next()">force next</button>
        		<button class="debug-button" onclick="previous()">force previous</button>
        		<button class="debug-button" onclick="heartHide()">Close Developer Menu</button>
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
