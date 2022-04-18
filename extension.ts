import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { WebSocket } from 'ws';
var socket: WebSocket;
var messageData: any;

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
	const sideBarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("arctia-sidebar", sideBarProvider)
	);

	// Commented out due to status not always being available
	// Register command to play and pause
	/*context.subscriptions.push(vscode.commands.registerCommand('arctia.playpause', function () {
		if (JSON.parse(messageData.data).data.status == true) {
			pause();
		} else {
			play();
		}
	}));
	*/

	// TEMP FIX
	// Register command to play
	context.subscriptions.push(vscode.commands.registerCommand('arctia.play', function () {
		play();
	}));

	// Register command to pause
	context.subscriptions.push(vscode.commands.registerCommand('arctia.pause', function () {
		pause();
	}));
	// TEMP FIX END

	// Register command to go to next song
	context.subscriptions.push(vscode.commands.registerCommand('arctia.nextSong', function () {
		next();
	}));

	// Register command to go to previous song
	context.subscriptions.push(vscode.commands.registerCommand('arctia.previousSong', function () {
		previous();
	}));

	socket = new WebSocket(`ws://localhost:26369`);
	socket.onopen = () => {
		vscode.window.showInformationMessage('Arctia successfully connected to Cider.');
		socket.onclose = () => {
			vscode.window.showInformationMessage('Arctia disconnected from Cider.');
		}
		socket.onerror = (e) => {
			console.log(e);
			vscode.window.showErrorMessage('Arctia connection error.');
		}
		socket.onmessage = (e) => {
			messageData = e
		}
	}
}

export function play() {
	socket.send(JSON.stringify({
		action: "play"
	}))
}

export function pause() {
	socket.send(JSON.stringify({
		action: "pause"
	}))
}

export function next() {
	socket.send(JSON.stringify({
		action: "next"
	}))
}

export function previous() {
	socket.send(JSON.stringify({
		action: "previous"
	}))
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
