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
        case "onInfo": {
          if (!mData.value) { return; }
          vscode.window.showInformationMessage(mData.value);
          break;
        }
        case "onError": {
          if (!mData.value) { return; }
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
      <h1>Project Arctia (Alpha)</h1>
      <br>
      <a id="album-link">
        <img id="album-artwork" width="1000" height="1000" style="border-radius: 2%">
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
        let playButton = document.getElementById("play-button");
        let pauseButton = document.getElementById("pause-button");
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
            if (currentMediaItem.name) {
              nameElement.innerText = currentMediaItem.name;
            }
            if (currentMediaItem.artistName) {
              artistElement.innerText = currentMediaItem.artistName;
            }
            if (currentMediaItem.albumName) {
              albumElement.innerText = currentMediaItem.albumName;
            }
            
            // Album Artwork
            if (currentMediaItem.artwork) {
              artworkElement.src = currentMediaItem.artwork.url.replace('{w}', 600).replace('{h}', 600);
            }
            if (currentMediaItem.url) {
              albumLinkElement.href = currentMediaItem.url.appleMusic;
            }

            // Play/Pause Logic
            if (currentMediaItem.status !== undefined) {
              if (currentMediaItem.status == true) {
                playButton.style.display = "none";
                pauseButton.style.display = "block";
              } else {
                pauseButton.style.display = "none";
                playButton.style.display = "block";
              }
            }

            // Playback Slider
            if (playbackSlider.max == null) {
              playbackSlider.style.display = "none";
            }
            if (currentMediaItem.durationInMillis) {
              if (playbackSlider.style.display == "none") {
                playbackSlider.style.display = "block";
              }
              playbackSlider.max = currentMediaItem.durationInMillis;
            }
            if (currentMediaItem.remainingTime && currentMediaItem.durationInMillis) {
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

