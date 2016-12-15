var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var cssSource = 'app/styles/styles.scss';
var allCssSource = 'app/styles/**/**.scss';
var htmlSource = 'app/html/**/*.html';
var imgSource = 'app/img/**/*.*';
var jsSource = 'app/js/**/*.js';
var jsLibSource = 'app/lib/**/*.js';
var translationsSource = 'app/translations/*.js';

var dist = "./dist";
var dist_deploy = "../dist";

gulp.task('default', ['img', 'sass', 'js-lib', 'js', 'html', 'browserSync'], function () {
  gulp.watch(allCssSource, ['sass']);
  gulp.watch(htmlSource, ['html']);
  gulp.watch(jsSource, ['js']);
  gulp.watch(translationsSource, ['js']);
  gulp.watch(imgSource, ['img']);
});

gulp.task('deploy', ['img-deploy', 'sass-deploy', 'js-lib-deploy', 'js-deploy', 'html-deploy'], function () {});
gulp.task('deploy-no-lib', ['img-deploy', 'sass-deploy', 'js-deploy', 'html-deploy'], function () {});


gulp.task('img', function () {
  return gulp.src(imgSource)
    .pipe(gulp.dest(dist + '/img'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('img-deploy', function () {
  return gulp.src(imgSource)
    .pipe(gulp.dest(dist_deploy + '/img'));
});


gulp.task('sass', function () {
  return gulp.src(cssSource)
    .pipe(sass())
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(dist + '/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('sass-deploy', function () {
  return gulp.src(cssSource)
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest(dist_deploy + '/css'));
});


gulp.task('js-lib', function () {
  return gulp.src(jsLibSource)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('lib.js'))
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist + '/js'))
});

gulp.task('js-lib-deploy', function () {
  return gulp.src(jsLibSource)
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(concat('lib.js'))
    .on('error', gutil.log)
    .pipe(gulp.dest(dist_deploy + '/js'));
});


gulp.task('js', function () {
  var b = browserify({
    entries: './app/js/entry.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist + '/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('js-deploy', function () {
  var b = browserify({
    entries: './app/js/entry.js',
    debug: false
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(gulp.dest(dist_deploy + '/js'));
});


gulp.task('html', function () {
  return gulp.src(htmlSource)
    .pipe(gulp.dest(dist));
});

gulp.task('html-deploy', function () {
  return gulp.src(htmlSource)
    .pipe(gulp.dest(dist_deploy));
});


gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: dist
    },
  });
});

//7f17680f-a964-4aa1-8af8-8130b54e41fe