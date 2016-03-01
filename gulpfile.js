'use strict';

// Constant
var FOLDER = 'bin/';
var PROXY = 'http://localhost:3000';
var BASE_FOLDER = './src/';

// Gulp plugins
var gulp = require('gulp');
var nodemon = require('gulp-nodemon'); // Node Server watch
var argv = require('yargs').argv;
var file = require('gulp-file');
var data = require('gulp-data');
var gulpif = require('gulp-if');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var concat = require('gulp-concat');
var buffer = require('vinyl-buffer');
var disc = require('disc');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var newer = require('gulp-newer');
// HTML Plugins
var jade = require('gulp-jade');
// CSS Plugins
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
// JS Plugins
var browserify = require('browserify');
var browserSync = require('browser-sync');
var sourcemaps = require('gulp-sourcemaps');
var stripDebug = require('gulp-strip-debug');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var babelify = require('babelify')

// Gulp Default
gulp.task('default', ['rebuild'], function () {
});

// Setup Node Monitor server
gulp.task('nodemon', function (cb) {
    var started = false;
    return nodemon({
        script: 'index.js', // entry point app file
        ignore: [BASE_FOLDER, FOLDER]
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true; 
        } 
    });
});

/**
 * Setup HTML Processes
 */

// Template files
gulp.task('templates', function() {
    // make folder
    mkdirp(''+FOLDER+'', function (err) {
        if (err) console.error(err)
        else console.log('site folder created!')
    });

    gulp.src([
        '!src/jade/**/_*/**',
        'src/jade/**/*.jade'
    ])
    	//Import any data json for Jade templates
        /*.pipe(data(function(file) {
            return require('./data/.json');
        }))*/
        .pipe(jade({
            basedir : BASE_FOLDER + 'jade',
            pretty: true
        }))
        .pipe(gulp.dest(''+FOLDER+''))
});

// Rebuild Jade, Scripts & do page reload
gulp.task('rebuild', ['templates', 'bundle', 'minify-js', 'styles'], function () {
    browserSync.reload();
});

/**
 * CSS Proccesses
 */
gulp.task('styles', function() {
    gulp.src(BASE_FOLDER + 'sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(FOLDER + 'css/'));
});
/**
 * Setup Script Processes
 */

// 
// Grab relevent js files
var scripts = fs.readdirSync(BASE_FOLDER + 'js').filter( function(f) {
    return (/\.(js)$/i).test(f); // only allow any files with js extensions in js folder, exclude folders
});
// Set inputs and outputs
var inputs = scripts.map( function(script) {
    return BASE_FOLDER + 'js/' + script;
});
var outputs = scripts.map( function(script) {
    return ''+FOLDER+'js/' + script;
});
var outputsMap = scripts.map( function(script) {
    return ''+FOLDER+'js/' + script + ".map";
});
//
// Lint js scripts
gulp.task('jshint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
});

//
// Bundle up js scripts
gulp.task('bundle', ['jshint'], function() {
    // make folder
    mkdirp(''+FOLDER+'js', function (err) {
        if (err) console.error(err)
        else console.log('js folder created!')
    });

    var b = browserify({
        entries : inputs,
        debug: false

    });
    //b.on('factor.pipeline', function (id, pipeline) {
        //console.log("fb - " ,  (id));
        //pipeline.push(uglify());
        //pipeline.get('wrap').push(function (stream) {
                //stream.pipe(uglify());
        // write content to build directory
                //gulp.dest(FOLDER+'js');
            //})
        
    //});
    b.plugin('factor-bundle', { outputs: outputs });
    //b.plugin('minifyify', {map: 'bundle.js.map', output: './'+FOLDER+ 'bundle.js.map'});
   
    
    return b
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .pipe(source('./'+FOLDER+'js/common.js'))
        .pipe(buffer())

        .pipe( gulpif(argv.production, sourcemaps.init({loadMaps: true})) )
        .pipe(gulpif(argv.production, uglify({
            mangle:true,
            output: {
                
            },
            compress: {
                sequences: true,
                dead_code: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true,
                drop_console: true
            }
            
        })))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'));
});

gulp.task ('minify-js', function () {
     return gulp.src(FOLDER + 'js/*.js')
        .pipe(gulpif(argv.production, uglify()) )
        .pipe(gulp.dest( FOLDER + 'js'));
});

// Watch task
gulp.task('watch', function () {
    gulp.watch([
        BASE_FOLDER + 'js/**/*.js',
        BASE_FOLDER + 'sass/**/*.scss',
        BASE_FOLDER + 'jade/**/*.jade'
    ], ['rebuild']);
});
// Setup BrowserSync
gulp.task('browser-sync',['templates', 'nodemon'], function() {
     browserSync.init(null, {
        proxy: PROXY,
        files: ["bin/**/*.*"],
        browser: "google chrome",
        port: 7000,
    });
});

// Start up server & Serve files
gulp.task('serve', ['rebuild', 'browser-sync', 'watch']);