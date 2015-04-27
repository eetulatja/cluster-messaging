"use strict";

var cluster = require('cluster');

var messaging = require('..');


if (cluster.isMaster) {

	var worker = cluster.fork();

	messaging.emit(worker.id, 'test', 3).get('response').then(function(data) {
		process.send(data);
		process.exit();
	});

}
else {

	messaging.on(undefined, 'test', function(message) {
		message.respond({ text: 'this comes from worker', number: message.data });
	});
	
}