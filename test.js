const { WebSocket } = require('ws');

var socket;

socket = new WebSocket(`ws://localhost:26369`);
	socket.onopen = (e) => {
		console.log(e);
		console.log('Cider Remote successfully connected to Cider.');

		socket.onclose = (e) => {
			console.log(e);
			console.log('Cider Remote disconnected from Cider.');
		}

		socket.onerror = (e) => {
			console.log(e);
			console.log('Cider Remote connection error.');
		}

		socket.onmessage = (e) => {
			console.log('Cider Remote received message from Cider.');
            console.log(e);
            
		}
    }
