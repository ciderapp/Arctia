const vscode = require('vscode');
const SidebarProvider = require('./sidebar');
const { default: fetch } = require('node-fetch');

/**
* @param {vscode.ExtensionContext} context
*/
function activate(context) {
    const sidebarWebview = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider("arctia-sidebar", sidebarWebview, {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        })
    );

    // commandsSocket = new WebSocket(`ws://localhost:10769`);
    // commandsSocket.onopen = () => {
    // 	vscode.window.showInformationMessage('Arctia successfully connected to Cider 2.');
    // 	commandsSocket.onclose = () => {
    // 		vscode.window.showInformationMessage('Arctia disconnected from Cider 2.');
    // 	}
    // 	commandsSocket.onerror = (e) => {
    // 		console.error(e);
    // 		vscode.window.showErrorMessage('Arctia connection error. Details can be found in the console.');
    // 	}
    // 	commandsSocket.onmessage = (e) => {
    // 		messageData = e
    // 	}
    // }

    context.subscriptions.push(vscode.commands.registerCommand('cider-arctia.playpause', function () {
        playPause();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('cider-arctia.nextSong', function () {
        next();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('cider-arctia.previousSong', function () {
        previous();
    }));
}

function deactivate() { }

function playPause() {
    comRPC("POST", "api/v1/playback/playpause")
}

function next() {
    comRPC("POST", "api/v1/playback/next")
}

function previous() {
    comRPC("POST", "api/v1/playback/previous")
}

async function comRPC(method, request) {
    return fetch('http://localhost:10767/' + request, {
        method: method
    })
        .then(response => response.json())
        .then(json => {
            return json;
        })
        .catch(error => console.warn("[WARNING] An error occurred while processing the request:", error));
}

module.exports = {
    activate,
    deactivate
}
