var gulp = require('gulp')
var babel = require('gulp-babel')
var del = require('del')
var eslint = require('gulp-eslint')

gulp.task('bin', function (cb) {
  return gulp.src('./src/**/*.js')
    .pipe(babel({ presets: ['latest'], plugins: ['lodash'] }))
    .pipe(gulp.dest('./bin'))
    cb()
})

gulp.task('inst', function (cb) {
  return gulp.src('./src/**/*.js')
    .pipe(babel({ presets: ['latest'], plugins: ['lodash'], env: { test: { plugins: ['istanbul'] } } }))
    .pipe(gulp.dest('./bin'))
    cb()
})

gulp.task('delete', function (cb) {
  return del([
    'bin/**/*',
    'bin',
    'coverage/**/*',
    'coverage',
    '.nyc_output/*',
    '.nyc_output',
    'test/output/*',
    'test/output',
    'lcov.info'
  ])
  cb()
})

gulp.task('lint', function (cb) {
  return gulp.src(['**/**/*.js', '!node_modules/**/*.*', '!bin/**/*.js'])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
  cb()
})

gulp.task('clean', gulp.series('delete', 'bin'))

gulp.task('default', gulp.series('clean'))

gulp.task('all', gulp.series('clean', 'lint'))
