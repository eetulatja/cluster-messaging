module.exports = function(grunt) {

	var sourceFiles = ['*.js', 'test/*.js'];

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			files: sourceFiles,
			tasks: ['clear', 'jshint', 'mochaTest'],
		},
		jshint: {
			options: {
				node: true,
				mocha: true,
			},
			files: sourceFiles,
		},
		mochaTest: {
			test: {
				options: {
					clearRequireCache: true,
				},
				src: ['test']
			},
		},
	});

	// Load the plugins.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-clear');
};
