import * as vscode from "vscode";
import { play, pause, next, previous } from "./extension";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (mData) => {
      switch (mData.type) {
        case "onPlay": {
          play();
          break;
        }
        case "onPause": {
          pause();
          break;
        }
        case "onNextSong": {
          next();
          break;
        }
        case "onPreviousSong": {
          previous();
          break;
        }
        case "developerMenuOpened": {
          vscode.window.showWarningMessage("This menu is made for developers only.");
          vscode.window.showWarningMessage("Do not modify anything unless you know what you're doing.");
          break;
        }
        case "developerMenuClosed": {
          vscode.window.showWarningMessage("Developer menu closed.");
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {

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

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; 'unsafe-inline'>
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">
        <link href="${stylesCustomUri}" rel="stylesheet">
			</head>
      <body>
      <h1>Project Arctia (Beta)</h1>
      <br>
      <a class="album-link">
        <img class="album-artwork" width="1000" height="1000">
      </a>
      <h2 class="name"> </h2>
      <h3 class="artist"> </h3>
      <p class="album"> </p>
      <input class="playback-slider" type="range" id="volume" min="0" oninput="seekTo(playbackSlider.value);">
      <div class="playback-buttons">
        <button class="playback-button play" onclick="postMessage('onPlay')">Play</button>
        <button class="playback-button pause" onclick="postMessage('onPause')">Pause</button>
        <button class="playback-button next" onclick="postMessage('onNextSong')">Next Song</button>
        <button class="playback-button previous" onclick="postMessage('onPreviousSong')">Previous Song</button>
      </div>
      <div class="debug">
        <h2 class="debug-header">Developer Options</h2>
        <button class="debug-button" onclick="console.log(currentMediaItem)">Log Playback Info</button>
        <button class="debug-button" onclick="heartHide()">Close Developer Menu</button>
      </div>
      <div class="footer">
        <p class="radio-notice">Playback controls are currently not supported during radio playback.</p>
        <br>
        <footer>Made with <button class="heart" onclick="heartTap()">❤️</button> by <a href="https://github.com/Amaru8/" target="_blank">Amaru#0989</a></footer>
      </div>
      <script src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

