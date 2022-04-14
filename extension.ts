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
		vscode.window.registerWebviewViewProvider("arctia-sidebar", sideBarProvider)
	);

	// Register command to play
	context.subscriptions.push(vscode.commands.registerCommand('arctia.play', function () {
		play();
	}));

	// Register command to pause
	context.subscriptions.push(vscode.commands.registerCommand('arctia.pause', function () {
		pause();
	}));

	// Register command to go to next song
	context.subscriptions.push(vscode.commands.registerCommand('arctia.nextSong', function () {
		next();
	}));

	// Register command to go to previous song
	context.subscriptions.push(vscode.commands.registerCommand('arctia.previousSong', function () {
		previous();
	}));

	socket = new WebSocket(`ws://localhost:26369`);
	socket.onopen = (e) => {
		vscode.window.showInformationMessage('Project Arctia successfully connected to Cider.');

		socket.onclose = (e) => {
			vscode.window.showInformationMessage('Project Arctia disconnected from Cider.');
		}

		socket.onerror = (e) => {
			console.log(e);
			vscode.window.showErrorMessage('Project Arctia connection error.');
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
