var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');

gulp.task('uglify', function() {
    return gulp.src('workspace/*.js')
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('public/javascripts/'));
});

gulp.task('minifyCSS', function() {
    return gulp.src('workspace/style.css')
        .pipe(minifyCSS())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('public/stylesheets/'))
});

gulp.task('copy',function() {
    return gulp.src([
        'jquery/dist/jquery.min.js',
        'jquery/dist/jquery.min.map'
    ], {cwd : 'node_modules' })
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('default', [ 'uglify', 'minifyCSS', 'copy' ]);