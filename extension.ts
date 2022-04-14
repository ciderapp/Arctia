// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { WebSocket } from 'ws';
export var socket: WebSocket;
export var wsMessage: any;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
	const sideBarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("cider-remote-sidebar", sideBarProvider)
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from Cider Remote!');
		console.log(socket)
	}));

	// Register command to play
	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.play', function () {
		vscode.window.showInformationMessage('Cider Playback Started!');
		play();
	}));

	// Regsiter command to pause
	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.pause', function () {
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
		vscode.window.showInformationMessage('Cider Remote successfully connected to Cider.');

		socket.onclose = (e) => {
			console.log(e);
			vscode.window.showInformationMessage('Cider Remote disconnected from Cider.');
		}

		socket.onerror = (e) => {
			console.log(e);
			vscode.window.showErrorMessage('Cider Remote connection error.');
		}

		socket.onmessage = (e) => {
			wsMessage = e
			console.log('Cider Remote received message from Cider.');
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
