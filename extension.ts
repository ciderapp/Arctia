import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { WebSocket } from 'ws';
export var socket: WebSocket;
export var wsMessage: any;


/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
	const sideBarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("cider-remote-sidebar", sideBarProvider)
	);

	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from Cider Remote!');
		console.log(socket)
	}));

	// Register command to play
	context.subscriptions.push(vscode.commands.registerCommand('cider-remote.play', function () {
		vscode.window.showInformationMessage('Cider Playback Started!');
		play();
	}));

	// Register command to pause
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
		vscode.window.showInformationMessage('Cider Remote successfully connected to Cider.');

		socket.onclose = (e) => {
			vscode.window.showInformationMessage('Cider Remote disconnected from Cider.');
		}

		socket.onerror = (e) => {
			console.log(e);
			vscode.window.showErrorMessage('Cider Remote connection error.');
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

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
