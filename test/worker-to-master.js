"use strict";

var cluster = require('cluster');

var messaging = require('..');


if (cluster.isMaster) {

	var worker = cluster.fork();

	messaging.on(worker.id, 'test', function(message) {
		message.respond({ text: 'this comes from master', number: message.data });
	});

	messaging.on(worker.id, 'test.successful', function(message) {
		process.send(message.data);
		process.exit();
	});

}
else {

	messaging.emit(undefined, 'test', 5).get('response').then(function(data) {
		messaging.emit(undefined, 'test.successful', data);
	});
	
}