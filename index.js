"use strict";

var assert = require('assert');
var cluster = require('cluster');

var q = require('q');


var messageId = 0;

var handlers = {};


function addHandler(workerId, name, handler) {
	if (workerId === undefined) {
		handlers[name] = handler;
	}
	else {
		handlers[workerId][name] = handler;
	}
}

// TODO when a worker dies, remove all listeners and handlers
// associated with it

function messageListener(processToListen) {
	var processHandlers;

	if (cluster.isMaster) {
		if (handlers[processToListen.id]) {
			// There is already a listener for this worker.
			return;
		}

		processHandlers = handlers[processToListen.id] = {};
	}
	else {
		processToListen = process;
		processHandlers = handlers;
	}

	processToListen.on('message', function(ipcMessage) {

		// TODO better routing
		if (processHandlers[ipcMessage.name]) {

			var message = {
				data: ipcMessage.data,
				respond: function(data) {
					processToListen.send({
						id: ipcMessage.id,
						type: 'response',
						data: data,
					});
				},
				progress: function() {
					// TODO progress signaling
				},
			};

			processToListen.send({
				id: ipcMessage.id,
				type: 'received',
			});

			processHandlers[ipcMessage.name](message);
		}
		else {
			// TODO send error: no registered handler
		}
		
	});
}


if (cluster.isWorker) {
	// Workers only need to listen to one process: master.
	// Handle all IPC messages from master,
	// then route them to handlers.
	messageListener();
}


module.exports = {

	// TODO no workerId when called from worker
	emit: function(workerId, name, data) {
		// var receivedDeferred = q.defer();
		var responseDeferred = q.defer();
		var receivedDeferred = q.defer();

		// Generate ID for this message.
		var id = ++messageId;

		function _emit(processToMessage) {

			var handler = function(ipcMessage) {

				if (ipcMessage.id === id && ipcMessage.type === 'received') {

					var received = {
						data: ipcMessage.data,
						// response: responseDeferred.promise,
					};

					receivedDeferred.resolve(received);
				}
				if (ipcMessage.id === id && ipcMessage.type === 'response') {
					responseDeferred.resolve(ipcMessage.data);
					processToMessage.removeListener('message', handler);
				}
			};

			processToMessage.on('message', handler);

			processToMessage.send({
				name: name,
				type: 'request',
				id: id,
				data: data,
			});
		}

		if (cluster.isMaster) {
			_emit(cluster.workers[workerId]);
		}
		else {
			_emit(process);
		}

		responseDeferred.promise.received = receivedDeferred.promise;

		return responseDeferred.promise;
	},

	// TODO no workerId when called from worker
	on: function(workerId, name, callback) {

		if (cluster.isMaster) {
			assert(cluster.workers[workerId]);
			messageListener(cluster.workers[workerId]);
		}

		addHandler(workerId, name, callback);
	},

	broadcast: function(name, data) {
		if (!cluster.isMaster) {
			throw Error('Only master process can call broadcast().');
		}

		var emitPromises = [];

		for (var workerId in cluster.workers) {
			emitPromises.push(module.exports.emit(workerId, name, data));
		}

		return q.all(emitPromises);
	},

};
