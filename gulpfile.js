var gulp = require('gulp');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var jade = require('gulp-jade');
var less = require('gulp-less');
var browserify = require('gulp-browserify');

var SRC_PATH = {
    'js':  './source/js/',
    'css': './source/less/',
    'tmplDesk': './html/desktop/'
};

var DIST_PATH =  {
  'css' : 'assets/css',
  'js' : './assets/js',
  'tmplDesk': 'app/desktop'
}

gulp.task('default', ['scripts', 'styles']);


gulp.task('templates', function() {
  var YOUR_LOCALS = {

  };

  gulp.src(SRC_PATH.tmplDesk + 'basket.jade')
    .pipe(plumber())
    .pipe(jade({
      locals: YOUR_LOCALS,
      pretty: true
    }))
    .pipe(gulp.dest(DIST_PATH.tmplDesk))
});

gulp.task('scripts', function () {
    return gulp.src(SRC_PATH.js+'*.js')
        .pipe(plumber())
        // .pipe(coffee())
        .pipe(browserify(/*{ transform: ['coffeeify'], extensions: ['.coffee'] }*/))
        // .pipe(browserify())
    //    .pipe(concat('app.js'))
        .pipe(gulp.dest(DIST_PATH.js));
});

gulp.task('styles', function() {
    return gulp.src(SRC_PATH.css + '*.less')
            .pipe(less())
            .pipe(gulp.dest(DIST_PATH.css))
});

gulp.task('watch', ['scripts', 'styles'], function() {

    gulp.watch(SRC_PATH.css + '**', ['styles']);
    gulp.watch(SRC_PATH.js + '**', ['scripts']);

    gulp.watch('./html/**/*.jade', ['templates']);
})

var replace = require('gulp-replace');

gulp.task('replace', function(){
    gulp.src(['./html/**/*.jade'])
        //.pipe(replace('<!--#echo var="img-path"-->', '#{paths.img}'))
        //.pipe(replace('<!--#echo var="assets-path"-->', '#{paths.tmpimg}'))
      //  .pipe(replace(/<!--#include virtual="([^"]*)" -->/g, 'include $1'))
        .pipe(replace("$includespath", '../includes'))

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
