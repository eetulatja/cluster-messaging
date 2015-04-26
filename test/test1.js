"use strict";

var cluster = require('cluster');

var messaging = require('..');


if (cluster.isMaster) {

	var worker = cluster.fork();

	messaging.emit(worker.id, 'test', 3).then(function(response) {
		process.send(response);
		process.exit();
	});

}
else {

	messaging.on(undefined, 'test', function(data, respond) {
		respond("this comes from worker");
	});
	
}