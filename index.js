"use strict";

var cluster = require('cluster');

var q = require('q');


var messageId = 0;


module.exports = {

	emit: function(workerId, type, data) {
		var deferred = q.defer();

		// Generate ID for this message.
		var id = ++messageId;

		function _emit(processToMessage) {
			var handler = function(ipcMessage) {
				if (ipcMessage.id === id) {
					processToMessage.removeListener('message', handler);
					deferred.resolve(ipcMessage.data);
				}
			};

			processToMessage.on('message', handler);

			processToMessage.send({
				type: type,
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

		return deferred.promise;
	},

	on: function(workerId, type, callback) {

		function _on(processToListen) {
			processToListen.on('message', function(ipcMessage) {

				var sendResponse = function(data) {
					processToListen.send({
						id: ipcMessage.id,
						data: data,
					});
				};

				callback(ipcMessage.data, sendResponse);
			});
		}

		if (cluster.isMaster) {
			_on(cluster.workers[workerId]);
		}
		else {
			_on(process);
		}
	},

};
