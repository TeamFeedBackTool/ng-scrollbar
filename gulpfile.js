const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const del = require('del');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const jshint = require('gulp-jshint');
const less = require('gulp-less');
const docs = require('gulp-ngdocs');
const plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const uglifyCss = require('gulp-uglifycss');
const watch = require('gulp-watch');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const connect = require('gulp-connect');
const pkg = require('./package.json');

gulp.task('build-docs', () => {
  return gulp.src(['./build/**/*.js', '!./build/vendor/**/*.js'])
    .pipe(docs.process())
    .pipe(gulp.dest('./docs'));
});

gulp.task('build-scripts', () => {
  return gulp.src('./src/**/*.js')
    .pipe(jshint({
      esversion: 6
    }))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload());
});

gulp.task('build-less', () => {
  return gulp.src('./src/' + pkg.name + '.less')
    .pipe(less())
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload());
});

gulp.task('build-index', () => {
  return gulp.src('./src/index.html')
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload());
});

gulp.task('compile-scripts', function() {
  return gulp.src('./build/' + pkg.name + '.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat(pkg.name + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('compile-less', function() {
  return gulp.src('./build/' + pkg.name + '.css')
    .pipe(uglifyCss())
    .pipe(rename('./' + pkg.name + '.min.css'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('clean-build', () => {
  del.sync(['./build']);
});

gulp.task('clean-dist', () => {
  del.sync(['./dist']);
});

gulp.task('build-vendor', () => {
  return gulp.src(['./vendor/angular/angular.js'], {base: '.'})
    .pipe(gulp.dest('./build'));
});

gulp.task('listen', () => {
  connect.server({
    root: 'build',
    port: 8001,
    livereload: true
  });

  function unlink(file) {
    file = path.resolve('./build/', path.relative(path.resolve('src/'), file));

    return del(file, {force: true}).then(paths => {
      messenger.info('\nDeleted:\t' + paths.join('\n') + '\n');
    });
  }

  watch('./src/index.html', () => {
    gulp.start(['build-index']);
  });

  watch('./src/**/*.js', () => {
    runSequence('build-scripts', 'build-index');
  }).on('unlink', file => {
    unlink(file);
  });

  watch('./src/**/*.less', () => {
    runSequence('build-less', 'build-index');
  }).on('unlink', file => {
    unlink(file);
  });
});

gulp.task('build', cb => {
  runSequence(
    'clean-build',
    [
      'build-scripts',
      'build-less',
      'build-vendor'
    ],
    'build-docs',
    'build-index',
    cb
  );
});

gulp.task('default', [
  'build'
]);

gulp.task('watch', cb => {
  runSequence(
    'default',
    'listen',
    cb
  );
});

gulp.task('compile', cb => {
  runSequence(
    'clean-dist',
    [
      'compile-scripts',
      'compile-less'
    ],
    cb
  );
});

gulp.task('dist', cb => {
  runSequence(
    'build',
    'compile',
    cb
  );
});