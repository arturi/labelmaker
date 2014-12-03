var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');

function logError(err) {
  console.log(err);
}

gulp.task('concat-js', function() {
  return gulp.src(['./src/labelmaker.js'])
    .pipe(concat('jquery.labelmaker.js'))
    .pipe(gulp.dest('./dist/'))
    .on('error', logError);
});

gulp.task('compress-js', ['concat-js'], function() {
  return gulp.src('./dist/jquery.labelmaker.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
    .on('error', logError);
});

gulp.task('autoprefix-css', function() {
  return gulp.src('./src/*.css')
      .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
      }))
      .pipe(gulp.dest('./dist/'))
      .on('error', logError);
});

gulp.task('minify-css', ['autoprefix-css'], function() {
  return gulp.src('./dist/labelmaker.css')
    .pipe(minifyCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist/'))
    .on('error', logError);
});

gulp.task('watch', function() {
  gulp.watch('./src/*.js', ['concat-js', 'compress-js']);
  gulp.watch('./src/*.css', ['autoprefix-css', 'minify-css']);
});

gulp.task('default', ['concat-js', 'compress-js', 'autoprefix-css', 'minify-css', 'watch']);
