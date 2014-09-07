// example.js
// Either run directly, or require() for testing.
//
// Run directly (defaults to random port):
//  node example.js [<port>]
//
// Require for testing:
//  var app = require('./example');
//  app.listen(port, function () { ... });
//
// Examples:
// - GET / - basic async hello world
// - GET /delay/5, /delay/50, etc. - return response after 5, 50, etc. ms
// - GET /error - return 500 from route error
// - GET /anything?middleware=error - return 500 from middleware error
// - GET /anything?middleware=stop - return 200 from middleware
// - GET /anything?global=foo - set Streamline global `value` from middleware
// - GET /next - return 200 from fall-through routes
// - GET /error/param - return 500 from param error
// - GET /global - return Streamline global context
// - PATCH /resource - return 200 from PATCH handler
//

var crypto = require('crypto');
var express = require('./');
var app = express();
var streamlineGlobal = require('streamline/lib/globals');

app.use(express.logger('dev'));
app.use(express.responseTime());

// Middleware example (normal):
app.use(function (req, res, _) {
    res.header('X-Request-Id', crypto.randomBytes(16, _).toString('hex'));
});

// Middleware example (error, or don't continue):
app.use(function (req, res, _) {
    setTimeout(_, 1);
    switch (req.query['middleware']) {
        case 'error':
            throw new Error('Middleware error.');
        case 'stop':
            res.send('Middleware stopped.');
            return false;
        default:
            return;
    }
});

// Example of middleware setting Streamline's global context:
app.use(function (req, res, _) {
    var queryValue = req.query['global'];
    if (queryValue) {
        streamlineGlobal.context.value = queryValue;
    }
});

// Route example (normal):
app.get('/', function (req, res, _) {
    setTimeout(_, 1);
    res.send('Hello world!');
});

// Param example (normal):
app.param('ms', function (req, res, _, ms) {
    if (ms.match(/\d+/)) {
        setTimeout(_, 1);
        req.ms = parseInt(ms, 10);
    }
});

app.get('/delay/:ms', function (req, res, _) {
    setTimeout(_, req.ms);
    res.send('Hello world after ' + req.ms + 'ms!');
});

// Route example (error):
app.get('/error', function (req, res, _) {
    setTimeout(_, 1);
    throw new Error('Route error.');
});

// Route example (fall-through):
app.get('/next', function (req, res, _) {
    setTimeout(_, 1);
    return true;
});

// Issue #15 (should be able to fall through w/ `all` too):
app.all('/next', function (req, res, _) {
    setTimeout(_, 1);
    return true;
});

app.get('/next', function (req, res, _) {
    setTimeout(_, 1);
    res.send('Fell through to another matching route.');
});

// Param example (error):
app.param('err', function (req, res, _, err) {
    if (err === 'param') {
        setTimeout(_, 1);
        throw new Error('Param error.');
    }
});

app.get('/error/:err', function (req, res, _) {
    throw new Error('This should never get hit.');
});

// Example of retrieving streamline global context
app.get('/global', function (req, res, _) {
    setTimeout(_, 1);
    res.send(streamlineGlobal.context);
});

// Example of method (verb) coverage:
app.patch('/resource', function (req, res, _) {
    setTimeout(_, 1);
    res.send('Resource patched.');
});

// Example of error handler:
app.use(function (err, req, res, _) {
    setTimeout(_, 1);
    res.send(500, err.message);
});

module.exports = app;

if (module === require.main) {
    app.listen(process.argv[2] || 0, function () {
        console.log(
            'express-streamline example server listening at http://localhost:%d/...',
            this.address().port
        );
    });
}
