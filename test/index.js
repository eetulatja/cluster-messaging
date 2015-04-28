"use strict";

var fork = require('child_process').fork;

var expect = require('expect.js');


describe('Cluster', function() {

	it('Should be able to send message from master to worker and receive a response', function(done) {

		var masterToWorkerTest = fork('test/master-to-worker');

		masterToWorkerTest.on('message', function(result) {
			expect(result).eql({ text: 'this comes from worker', number: 3 });
			done();
		});

	});

	it('Should be able to send message from worker to master and receive a response', function(done) {

		var workerToMasterTest = fork('test/worker-to-master');

		workerToMasterTest.on('message', function(result) {
			expect(result).eql({ text: 'this comes from master', number: 5 });
			done();
		});
	});

	it('Should be able to do a broadcast from master to workers and receive responses', function(done) {

		var broadcastTest = fork('test/broadcast');

		broadcastTest.on('message', function(result) {
			expect(result).eql([
				{ text: 'this comes from worker', number: 3 },
				{ text: 'this comes from worker', number: 3 },
			]);
			done();
		});

	});

});