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
// - GET /, /10, /500, etc. - return response after 0, 10, 500, etc. ms
// - GET /error - return 500 from route error
// - GET /anything?middleware=error - return 500 from middleware error
// - GET /anything?middleware=stop - return 200 from middleware
// - GET /next - return 200 from fall-through routes
// - PATCH /resource - return 200 from PATCH handler
//

var crypto = require('crypto');
var express = require('./');
var app = express();

app.use(express.logger('dev'));
app.use(express.responseTime());

// Middleware example (normal):
app.use(function (req, res, _) {
    setTimeout(_, 5);
    res.header('X-Request-Id', crypto.randomBytes(16).toString('hex'));
});

// Middleware example (error, or don't continue):
app.use(function (req, res, _) {
    setTimeout(_, 5);
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

// Route example (normal):
app.get('/:ms(\\d+)?', function (req, res, _) {
    var ms = req.params['ms'] || 0;
    setTimeout(_, ms);
    res.send('Hello world after ' + ms + 'ms!');
});

// Route example (error):
app.get('/error', function (req, res, _) {
    setTimeout(_, 10);
    throw new Error('Route error.');
});

// Route example (fall-through):
app.get('/next', function (req, res, _) {
    setTimeout(_, 5);
    return false;
});

app.get('/next', function (req, res, _) {
    setTimeout(_, 5);
    res.send('Fell through to another matching route.');
});

// Example of method (verb) coverage:
app.patch('/resource', function (req, res, _) {
    setTimeout(_, 5);
    res.send('Resource patched.');
});

// Example of error handler:
app.use(function (err, req, res, _) {
    setTimeout(_, 5);
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
