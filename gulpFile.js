/**
 * Created by M6600 on 6/15/2016.
 */
'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var compass = require('gulp-compass');


gulp.task('default', ['browser-sync'], function () {
});

gulp.task('browser-sync', ['nodemon'], function() {
	browserSync.init(null, {
		proxy: "http://localhost:23198",
		files: ["public/**/*.*"],
		browser: "google chrome",
		port: 23199
	});
});

gulp.task('nodemon', function (cb) {

	var started = false;

	return nodemon({
		script: 'EcommerceServer.js'
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		if (!started) {
			cb();
			started = true;
		}
	});
});

// run compass
//gulp.task('sass', function () {
//	console.log('styling...');
//	return gulp.src('sass/**/*.scss')
//		.pipe(compass({config_file:'./config.rb',css:'css',sass:'sass'}))
//		.on('error', messageLog)
//		.pipe(gulp.dest('www/css'))
//		.pipe(browserSync.stream({match:'**/*.css'}));
//});