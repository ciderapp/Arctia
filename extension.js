// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const WebSocket = require('ws');
const { CiderRemotePanel } = require('./CiderRemotePanel');
const { SidebarProvider } = require('./SidebarProvider');
var socket;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const sideBarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("cider-remote-sidebar", sideBarProvider)
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from Cider Remote!');
		CiderRemotePanel.createOrShow(context.extensionUri);
	}));

	// Register command to start/stop playback
	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.start', function () {
		vscode.window.showInformationMessage('Cider Playback Started!');
		play();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.stop', function () {
		vscode.window.showInformationMessage('Cider Playback Stopped!');
		pause();
	}));

	// Register command to go to next song
	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.nextSong', function () {
		vscode.window.showInformationMessage('Next Song from Cider Remote!');
		next();
	}));

	// Register command to go to previous song
	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.previousSong', function () {
		vscode.window.showInformationMessage('Previous Song from Cider Remote!');
		previous();
	}));

	socket = new WebSocket(`ws://localhost:26369`);
	socket.onopen = (e) => {
		console.log(e);
		console.log('Remote successfully connected to Cider');

		socket.onclose = (e) => {
			console.log(e);
			console.log('Remote disconnected from Cider');
		}

		socket.onerror = (e) => {
			console.log(e);
			console.log('Remote connection error');
		}
	}

}

function play() {
	socket.send(JSON.stringify({
		action: "play"
	}))
}

function pause() {
	socket.send(JSON.stringify({
		action: "pause"
	}))
}

function next() {
	socket.send(JSON.stringify({
		action: "next"
	}))
}

function previous() {
	socket.send(JSON.stringify({
		action: "previous"
	}))
}


// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
