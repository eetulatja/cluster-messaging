"use strict";

var cluster = require('cluster');

var messaging = require('..');


if (cluster.isMaster) {

	for (var i = 0; i < 2; i++) {
		cluster.fork();
	}

	messaging.broadcast('test', 3).then(function(data) {
		process.send(data);
		process.exit();
	});

}
else {

	messaging.on(undefined, 'test', function(message) {
		message.respond({ text: 'this comes from worker', number: message.data });
	});
	
}