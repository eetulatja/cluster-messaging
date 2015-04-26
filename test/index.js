"use strict";

var fork = require('child_process').fork;

var expect = require('expect.js');


describe('Cluster', function() {

	it('Should be able to send message from cluster to worker and receive a response', function(done) {

		var test1 = fork('test/test1');

		test1.on('message', function(result) {
			expect(result).to.be("this comes from worker");
			done();
		});

	});

});