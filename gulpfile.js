var gulp          = require('gulp');
var sass          = require('gulp-sass');
var autoprefixer  = require('gulp-autoprefixer');
var notify        = require('gulp-notify');
var browserSync   = require('browser-sync').create();

/*================================================================
 # HELPER
 ================================================================*/

function handleError(err) {
  var msg = 'Error: ' + err.message;

  console.error('Error', err.message);
  browserSync.notify('Error: ' + err.message);

  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);

  // keep gulp from hanging on this task
  if (typeof this.emit === 'function') this.emit('end')
}

/*================================================================
 # TASK
 ================================================================*/

gulp.task('sass', function() {
  return gulp.src('./sass/style.scss')
    .pipe(sass({
      "opt": {
        "sourceComments": false,
        "outputStyle": "expanded"
      }
    })).on('error', handleError)
    .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream({ 'once': true }));
});

gulp.task('serve', function() {
  browserSync.init({
    'server': './',
    'open': true
  });

  gulp.watch('./index.html', { interval: 500 }).on('change', browserSync.reload);
  // gulp.watch('./css/style.css', { interval: 500 }).on('change', browserSync.reload);
  gulp.watch('./sass/style.scss', ['sass']);
  gulp.watch('./js/main.js', { interval: 500 }).on('change', browserSync.reload);
});

gulp.task('default', ['sass', 'serve']);
