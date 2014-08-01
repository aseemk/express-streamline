module.exports = express = require('express');

// support streamline global context
var streamlineGlobal = null;
try {
    streamlineGlobal = require('streamline/lib/globals');
} catch (err) {
     // no action required if we cannot find the lib
}

//
// Helper function to wrap the given Streamline-style handler (req, res, _)
// to the style Express requires (req, res, next).
//
// Returns the wrapped (req, res, next) handler for Express.
//
// Supports other types of handlers too, e.g. with different signatures, via
// the `verb` param. Non-route verbs include `use` and `param`.
//
// Middleware handlers (`use`) have the same signature as route handlers, but
// unlike route handlers, `next()` is called by default.
//
// Param handlers also call `next()` by default, but their signature is
// (req, res, _, param, key).
//
// Both route handlers and middleware handlers can be error handlers, with
// the signature (err, req, res, _). This is detected by the handler arity.
//
// (Express 2 had an explicit `error` verb. That works too.)
//
// All handlers can override the default next() behavior by explicitly
// returning true to call next() or false to not call next().
//
function wrap(handler, verb) {
    var isErrorHandler = (verb === 'error') ||
        (verb !== 'param' && handler.length >= 4);

    // unify express 2 and 3 to imaginary 'error' verb:
    if (isErrorHandler) {
        verb = 'error';
    }

    var maxArgs = verb === 'param' ? 5 : 4;
    if (handler.length > maxArgs) {
        var handlerStr = handler.toString().replace(/(^|\n)/g, '$1| ');
        console.warn(
            'Warning: Express app.%s() handler registered with >%d args. ' +
            'Express-streamline doesn’t know how to handle these; ' +
            'truncating to %d args.\n\n%s\n',
            verb, maxArgs, maxArgs, handlerStr
        );
    }

    function callback(next) {
        return function (err, result) {
            if (err) return next(err);

            var callNext = null;

            // handlers can explicitly return true or false to specify:
            if (typeof result === 'boolean') {
                callNext = result;
            }

            // otherwise, the default is true for middleware and param
            // handlers, false for route and error handlers:
            if (typeof callNext !== 'boolean') {
                callNext = (verb === 'use') || (verb === 'param');
            }

            if (callNext) {
                return next();
            }
        };
    }

    switch (verb) {
        case 'param':
            return function (req, res, next, param, key) {
                return handler.call(this, req, res, callback(next), param, key);
            }
        case 'error':
            return function (err, req, res, next) {
                return handler.call(this, err, req, res, callback(next));
            }
        default:
            return function (req, res, next) {
                return handler.call(this, req, res, callback(next));
            }
    }
}

// Express's prototype, with back-compat for Express 2.
// TODO This only patches HTTP servers in Express 2, not HTTPS ones.
var proto = express.application || express.HTTPServer.prototype;

//
// Helper function to patch proto[verb], to wrap passed-in Streamline-style
// handlers (req, res, _) to the style Express needs (req, res, next).
//
function patch(verb) {
    var origProtoVerb = proto[verb];

    // minor: don't patch verbs that aren't implemented by Express:
    if (typeof origProtoVerb !== 'function') {
        return;
    }

    proto[verb] = function () {
        // if a handler function is given, it'll be the last argument:
        var last = arguments.length - 1;
        var lastArg = arguments[last];

        // if there is one, wrap it:
        if (typeof lastArg === 'function') {
            arguments[last] = wrap(lastArg, verb);
        }

        // finally, call the original method now with the updated args:
        return origProtoVerb.apply(this, arguments);
    };
}

// Patch all proto methods, e.g. proto.get(), proto.post(), etc.
require('methods').concat('all', 'del', 'error', 'use', 'param')
    .forEach(function (verb) {
        patch(verb);
    });

// Patch app.handle to reset global context before handling request.
// Patch in proto.init() b/c that is when the original connect app is merged
// with express'
if (streamlineGlobal) {
    var oldProtoInit = proto.init;

    proto.init = function() {
        var oldAppHandle = this.handle;

        this.handle = function() {
            streamlineGlobal.context = {} // reset the global streamline
            return oldAppHandle.apply(this, arguments);
        };

        return oldProtoInit.apply(this, arguments)
    };
}
