// Usage (defaults to random port):
// _node example.js [<port>]
//
// Examples:
// - /, /10, /500, etc. - return response after 0, 10, 500, etc. milliseconds
// - /error - return 500 from route error
// - /anything?error=middleware - return 500 from middleware error
//

var crypto = require('crypto');
var express = require('./');
var app = express.createServer();

app.use(express.logger('dev'));
app.use(express.responseTime());

// Middleware example (normal):
app.use(function (req, res, _) {
    setTimeout(_, 10);
    res.header('X-Request-Id', crypto.randomBytes(16).toString('hex'));
});

// Middleware example (error):
app.use(function (req, res, _) {
    if (req.query['error'] === 'middleware') {
        setTimeout(_, 10);
        throw new Error('Middleware error.');
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

app.listen(process.argv[2] || 0, function () {
    console.log(
        'express-alias example server listening at http://localhost:%d/...',
        this.address().port
    );
});
