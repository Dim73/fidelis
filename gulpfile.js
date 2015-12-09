var gulp = require('gulp');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var jade = require('gulp-jade');
var less = require('gulp-less');
var browserify = require('gulp-browserify');
var minifyCss = require('gulp-minify-css');

var SRC_PATH = {
    'js':  './source/js/',
    'css': './source/less/',
    'tmplDesk': './html/desktop/',
    'tmplMob': './html/mobile/',
};

var DIST_PATH =  {
  'css' : './app/assets/css',
  'js' : './app/assets/js',
  'tmplDesk': './app/desktop',
  'tmplMob': './app/mobile'
}

gulp.task('default', ['scripts', 'styles']);


gulp.task('templates', function() {
  var YOUR_LOCALS = {

  };

  gulp.src(SRC_PATH.tmplDesk + '*.jade')
    .pipe(plumber())
    .pipe(jade({
      locals: YOUR_LOCALS,
      pretty: true
    }))
    .pipe(gulp.dest(DIST_PATH.tmplDesk))
});

gulp.task('mobTemplates', function() {
  var YOUR_LOCALS = {

  };

  gulp.src(SRC_PATH.tmplMob + '*.jade')
    .pipe(plumber())
    .pipe(jade({
      locals: YOUR_LOCALS,
      pretty: true
    }))
    .pipe(gulp.dest(DIST_PATH.tmplMob))
});

gulp.task('scripts', function () {
    return gulp.src(SRC_PATH.js+'*.js')
        .pipe(plumber())
        // .pipe(coffee())
        .pipe(browserify(/*{ transform: ['babelify']}*/))
        // .pipe(browserify())
    //    .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest(DIST_PATH.js));
});

gulp.task('styles', function() {
    return gulp.src(SRC_PATH.css + '*.less')
            .pipe(less())
            .pipe(minifyCss({compatibility: 'ie8'}))
            .pipe(gulp.dest(DIST_PATH.css))
            .pipe(browserSync.stream());
});

gulp.task('watch', ['scripts', 'styles'], function() {

    gulp.watch(SRC_PATH.css + '**', ['styles']);
    gulp.watch(SRC_PATH.js + '**', ['scripts']);

    gulp.watch('./html/**/*.jade', ['templates', 'mobTemplates']);
})

var replace = require('gulp-replace');

gulp.task('replace', function(){
    gulp.src(['./html/**/*.jade'])
        // .pipe(replace('<!--#echo var=" img-path"-->', '#{paths.img}'))
        // .pipe(replace('<!--#echo var=" assets-path"-->', '#{paths.tmpimg}'))
        //.pipe(replace(/<!--#include virtual="([^"]*)"-->/g, 'include $1'))
        //.pipe(replace("$includespath", '../includes'))
        .pipe(replace("../includes/_body.html", '../includes/_body'))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
});

var rename = require("gulp-rename");

gulp.task('rename', function(){
gulp.src("./html/**/*.html")
    .pipe(rename(function (path) {
        path.extname = ".jade"
    }))
    .pipe(gulp.dest(function(file) {
        return file.base;
    }));
});

var server = require('gulp-server-livereload');

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(server({
      livereload: true,
      directoryListing: true,
      open: true,
      port: 35280
    }));
});

var browserSync = require('browser-sync').create();

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./",
            directory: true
        }
    });
});