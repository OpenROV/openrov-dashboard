module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['gruntfile.js', 'src/lib/*.js', 'src/*plugins/**/*.js'],
      options: {
        //maxlen: 120,
        quotmark: 'single'
      }
    },
    simplemocha: { // server side tests
      options: {
        globals: ['should'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: { src: [
        'src/*plugins/**/tests/**/*.js',
        '!src/*plugins/**/public/tests/*.js',
        'src/tests/**/*.js'
      ]}
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        runnerPort: 9999,
        singleRun: true,
        browsers: ['PhantomJS'],
        logLevel: 'ERROR'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['simplemocha', 'karma']);
  grunt.registerTask('default', ['jshint', 'test' ]);
};