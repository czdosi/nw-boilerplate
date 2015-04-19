'use strict';

var Q = require('q');
var nw = require('nw');
var childProcess = require('child_process');
var utils = require('./utils');

var runBuild = function () {
    var deferred = Q.defer();

    var build = childProcess.spawn('./node_modules/.bin/gulp', [
        'build',
        '--target=' + utils.getBuildTarget(),
        '--color'
    ]);

    build.stdout.pipe(process.stdout);
    build.stderr.pipe(process.stderr);

    build.on('close', function (code) {
        deferred.resolve();
    });

    return deferred.promise;
};

var runGulpWatch = function () {
    var watch = childProcess.spawn('./node_modules/.bin/gulp', [
        'watch',
        '--target=' + utils.getBuildTarget(),
        '--color'
    ]);

    watch.stdout.pipe(process.stdout);
    watch.stderr.pipe(process.stderr);

    watch.on('close', function (code) {
        // Gulp watch exits when error occured during build.
        // Just respawn it then.
        runGulpWatch();
    });
};

var runApp = function () {
    var app = childProcess.spawn(nw.findpath(), ['./build']);

    app.stdout.pipe(process.stdout);
    app.stderr.pipe(process.stderr);

    app.on('close', function (code) {
        // User closed the app. Kill the host process.
        process.exit();
    });
};

runBuild()
.then(function () {
    runGulpWatch();
    runApp();
});
