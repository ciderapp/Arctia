const vscode = require('vscode');
const SidebarProvider = require('./sidebar');
const WebSocket = require('ws');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const sidebarWebview = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("arctia-sidebar", sidebarWebview)
	);

	commandsSocket = new WebSocket(`ws://localhost:26369`);
	commandsSocket.onopen = () => {
		vscode.window.showInformationMessage('Arctia successfully connected to Cider.');
		commandsSocket.onclose = () => {
			vscode.window.showInformationMessage('Arctia disconnected from Cider.');
		}
		commandsSocket.onerror = (e) => {
			console.error(e);
			vscode.window.showErrorMessage('Arctia connection error. Details can be found in the console.');
		}
		commandsSocket.onmessage = (e) => {
			messageData = e
		}
	}

	context.subscriptions.push(vscode.commands.registerCommand('arctia.playpause', function () {
		playPause();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('arctia.nextSong', function () {
		next();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('arctia.previousSong', function () {
		previous();
	}));	
}

function deactivate() {}

function playPause() { commandsSocket.send(JSON.stringify({ action: "playpause" })) }

function next() { commandsSocket.send(JSON.stringify({ action: "next" })) }

function previous() { commandsSocket.send(JSON.stringify({ action: "previous" })) }

module.exports = {
	activate,
	deactivate
}
