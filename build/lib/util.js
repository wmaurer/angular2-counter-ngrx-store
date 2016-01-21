var es = require('event-stream');
var debounce = require('debounce');
var rimraf = require('rimraf');

var NoCancellationToken = {
    isCancellationRequested: function () {
        return false;
    }
};

exports.incremental = function (streamProvider, initial, supportsCancellation) {
    var state = 'idle';
    var input = es.through();
    var output = es.through();
    var buffer = Object.create(null);

    var token = !supportsCancellation ? null : {
        isCancellationRequested: function () {
            return Object.keys(buffer).length > 0;
        }
    };

    var run = function (input, isCancellable) {
        state = 'running';

        var stream = !supportsCancellation ? streamProvider() : streamProvider(isCancellable ? token : NoCancellationToken);

        input
            .pipe(stream)
            .pipe(es.through(null, function () {
                state = 'idle';
                eventuallyRun();
            }))
            .pipe(output);
    };

    if (initial) {
        run(initial, false);
    }

    var eventuallyRun = debounce(function () {
        var paths = Object.keys(buffer);

        if (paths.length === 0) {
            return;
        }

        var data = paths.map(function (path) {
            return buffer[path];
        });

        buffer = Object.create(null);
        run(es.readArray(data), true);
    }, 500);

    input.on('data', function (f) {
        buffer[f.path] = f;

        if (state === 'idle') {
            eventuallyRun();
        }
    });

    return es.duplex(input, output);
};

exports.rimraf = function(dir) {
    return function (cb) {
        rimraf(dir, cb);
    };
};
