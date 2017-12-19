var gulp = require('gulp');
var rev = require('gulp-rev-hash');
var revReplace = require('gulp-rev-replace');
var useref = require('gulp-useref');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var del = require('del');
var ngAnnotate = require('gulp-ng-annotate');
var ngmin = require('gulp-ngmin');

gulp.task('clean', function () {
    del(['dist', 'index.html']);
});

gulp.task('dist', function() {
    var jsFilter = filter('**/*.js', {restore: true});
    var cssFilter = filter('**/*.css', {restore: true});

    var userefAssets = useref.assets();

    return gulp.src('index_src.html')
        .pipe(rename('index.html'))
        .pipe(userefAssets)  // 解析html中build:{type}块，将里面引用到的文件合并传过来
        .pipe(jsFilter)
        .pipe(ngAnnotate())
        .pipe(ngmin({dynamic: false}))
        .pipe(uglify())             // 压缩Js
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(csso())               // 压缩Css
        .pipe(cssFilter.restore)
        .pipe(userefAssets.restore())
        .pipe(useref())
        .pipe(revReplace())        // 重写文件名到html
        .pipe(gulp.dest('.'));
});

gulp.task('hash', ['dist'], function () {
    return gulp.src('index.html')
        .pipe(rev())
        .pipe(gulp.dest('.'));
});

gulp.task('dev', function () {
    return gulp.src('index_src.html')
        .pipe(rename('index.html'))
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['dev']);
gulp.task('deploy', ['dist', 'hash']);