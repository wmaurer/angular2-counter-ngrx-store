require('events').EventEmitter.defaultMaxListeners = 100;

var _ = require('lodash');
var es = require('event-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var reporter = require('./build/lib/reporter')();
var tsb = require('gulp-tsb');
var util = require('./build/lib/util');
var watch = require('./build/lib/watch');

var tsOptions = {
    target: 'es5',
    module: 'commonjs',
    sourceMap: true,
    removeComments: false,
    experimentalDecorators: true,
    emitDecoratorMetadata: true
};

function createCompile(prod) {
    const opts = _.clone(tsOptions);
    var ts = tsb.create(opts, null, null, function (err) { reporter(err.toString()); });

    return function(token) {
        var input = es.through();
        var output = input
            .pipe(ts(token))
            .pipe(reporter());

        return es.duplex(input, output);
    }
}

function compileTask(out, prod) {
    var compile = createCompile(prod);

    return function () {
        var src = gulp.src('src/**/*.ts', { base: 'src' });

        return src
            .pipe(compile())
            .pipe(gulp.dest(out));
    };
}

function watchTask(out, build) {
    var compile = createCompile(build);

    return function () {
        var src = gulp.src('src/**/*.ts', { base: 'src' });
        var watchSrc = watch('src/**/*.ts', { base: 'src' });

        return watchSrc
            .pipe(util.incremental(compile, src, true))
            .pipe(gulp.dest(out));
    };
}

function watchCopyTask(out) {
    return function () {
        var watchSrc = watch('src/**/*.ts', { base: 'src' });

        return watchSrc.pipe(gulp.dest(out));
    };
}

gulp.task('clean', util.rimraf('out'));
gulp.task('build', ['clean'], compileTask('out', false));
gulp.task('watch', ['clean'], watchTask('out', false));
