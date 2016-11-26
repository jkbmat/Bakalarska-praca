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

var cssSource = 'app/styles/**/*.scss';
var htmlSource = 'app/html/**/*.html';
var imgSource = 'app/img/**/*.*';
var jsSource = 'app/js/**/*.js';
var jsLibSource = 'app/lib/**/*.js';
var translationsSource = 'app/translations/*.js';

gulp.task('default', ['img', 'sass', 'js-lib', 'js', 'html', 'browserSync'], function () {
  gulp.watch(cssSource, ['sass']);
  gulp.watch(htmlSource, ['html']);
  gulp.watch(jsSource, ['js']);
  gulp.watch(translationsSource, ['js']);
  gulp.watch(jsLibSource, ['js-lib']);
  gulp.watch(imgSource, ['img']);
});

gulp.task('img', function () {
  return gulp.src(imgSource)
    .pipe(gulp.dest('dist/img'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('sass', function () {
  return gulp.src(cssSource)
    .pipe(sass())
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('js-lib', function () {
  return gulp.src(jsLibSource)
    .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(uglify())
    .pipe(concat('lib.js'))
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
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
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('html', function () {
  return gulp.src(htmlSource)
    .pipe(gulp.dest('dist'));
});

gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: './dist'
    },
  });
});