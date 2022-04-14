import * as vscode from "vscode";
import { wsMessage } from "./extension";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (mData) => {
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
      <br>
      <h2 id="name"> </h2>
      <h3 id="artist"> </h3>
      <p id="album"> </p>
      <br>
      <input id="playback-slider" type="range" id="volume" min="0">
      <button id="play-button" onclick="
          tsvscode.postMessage({
            type: 'onPlay',
            value: ''
          });
      ">Play</button>
      <button id="pause-button" onclick="
          tsvscode.postMessage({
            type: 'onPause',
            value: ''
          });
      ">Pause</button>
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
            if (JSON.parse(e.data).data.durationInMillis !== undefined) {
              playbackSlider.max = JSON.parse(e.data).data.durationInMillis;
            }
            if (JSON.parse(e.data).data.remainingTime !== undefined && JSON.parse(e.data).data.durationInMillis !== undefined) {
              playbackSlider.value = JSON.parse(e.data).data.durationInMillis - JSON.parse(e.data).data.remainingTime;
            }
          }
        }

        
      </script>
			</body>
			</html>`;
  }
}

