module.exports = express = require('express');

// wraps the streamline-style handler (req, res, _) to the style express
// requires (req, res, next). note that error handlers have an extra argument,
// and express examines the route function's length to determine this!
function wrap(handler) {
    function callback(next) {
        return function (err) {
            if (err) return next(err);
            // otherwise, if successful, don't call next
        };
    }

    if (handler.length >= 4) {
        return function (err, req, res, next) {
            return handler(err, req, res, callback(next));
        }
    } else {
        return function (req, res, next) {
            return handler(req, res, callback(next));
        }
    }
}

// we monkey-patch the route and error methods via Express's prototype:
var app = express.HTTPServer.prototype;
var verbs = ['all', 'get', 'post', 'put', 'del', 'error'];

function patch(verb) {
    var origAppVerb = app[verb];
    app[verb] = function () {
        // if a handler function is given, it'll be the last argument:
        var last = arguments.length - 1;
        var lastArg = arguments[last];

        // if there is one, wrap it:
        if (typeof lastArg === 'function') {
            arguments[last] = wrap(lastArg);
        }

        // finally, call the original method now with the updated args:
        return origAppVerb.apply(this, arguments);
    };
}

for (var i = 0; i < verbs.length; i++) {
    patch(verbs[i]);
}
