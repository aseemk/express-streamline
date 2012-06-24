module.exports = express = require('express');

// wraps the streamline-style handler (req, res, _) to the style express
// requires (req, res, next). note that error handlers have an extra argument,
// and express examines the route function's length to determine this!
function wrapHandler(handler) {
    function makeCallback(next) {
        return function (err) {
            if (err) return next(err);
            // otherwise, if successful, don't call next
        };
    }

    if (handler.length >= 4) {
        return function (err, req, res, next) {
            handler(err, req, res, makeCallback(next));
        }
    } else {
        return function (req, res, next) {
            handler(req, res, makeCallback(next));
        }
    }
}

// we monkey-patch the route and error methods via Express's prototype:
var app = express.HTTPServer.prototype;
var verbs = ['all', 'get', 'post', 'put', 'del', 'error'];

function patch(verb) {
    var origAppVerb = app[verb];
    app[verb] = function () {
        // wrap the handler function, which is the last argument:
        var last = arguments.length - 1;
        arguments[last] = wrapHandler(arguments[last]);
        // then call the original verb with this wrapped handler:
        origAppVerb.apply(this, arguments);
    };
}

for (var i = 0; i < verbs.length; i++) {
    patch(verbs[i]);
}
