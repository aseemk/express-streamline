module.exports = express = require('express');

//
// Helper funciton to wraps the given Streamline-style handler (req, res, _)
// to the style Express requires (req, res, next).
// Returns the wrapped (req, res, next) handler for Express.
//
// If isMiddleware is true, the default action will be to continue (i.e. call
// next) after the handler, unless the handler explicitly returns false.
// Otherwise, the default action is to *not* continue, unless the handler
// explicitly returns false.
//
// Note that error handlers have an extra argument, and Express examines the
// handler function's length to determine this!
//
function wrap(handler, isMiddleware) {
    function callback(next) {
        return function (err, result) {
            if (err) return next(err);
            if (isMiddleware) {
                // middleware: default to continuing, unless false returned.
                if (result !== false) return next();
            } else {
                // routes: default to *not* continuing, unless false returned.
                if (result === false) return next();
            }
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

// TODO Patch HTTPS servers too.
var app = express.HTTPServer.prototype;

//
// Helper function to patch app[verb], to wrap passed-in Streamline-style
// handlers (req, res, _) to the style Express needs (req, res, next).
//
function patch(verb, isMiddleware) {
    var origAppVerb = app[verb];
    app[verb] = function () {
        // if a handler function is given, it'll be the last argument:
        var last = arguments.length - 1;
        var lastArg = arguments[last];

        // if there is one, wrap it:
        if (typeof lastArg === 'function') {
            arguments[last] = wrap(lastArg, isMiddleware);
        }

        // finally, call the original method now with the updated args:
        return origAppVerb.apply(this, arguments);
    };
}

// Patch all route methods, e.g. app.get(), app.post(), etc.
// HACK Is there a better way of covering all methods than to reach into
// Express's implementation to get these methods?
require('express/lib/router/methods')
    .concat('all', 'del', 'error')
    .forEach(function (verb) { patch(verb); });

// also patch middleware functions:
patch('use', true);
