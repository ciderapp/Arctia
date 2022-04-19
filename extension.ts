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

	context.subscriptions.push(vscode.commands.registerCommand('arctia.playpause', function () {
		playPause();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('arctia.nextSong', function () {
		next();
	}));

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
			console.error(e);
			vscode.window.showErrorMessage('Arctia connection error. Details can be found in the console.');
		}
		socket.onmessage = (e) => {
			messageData = e
		}
	}
}

export function play() { socket.send(JSON.stringify({ action: "play" })) }

export function pause() { socket.send(JSON.stringify({ action: "pause" })) }

export function playPause() { socket.send(JSON.stringify({ action: "playpause" })) }

export function next() { socket.send(JSON.stringify({ action: "next" })) }

export function previous() { socket.send(JSON.stringify({ action: "previous" })) }

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
