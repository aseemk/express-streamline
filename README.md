[![Travis build status](https://travis-ci.org/aseemk/express-streamline.png?branch=master)](https://travis-ci.org/aseemk/express-streamline)

# Express-Streamline

Patch for [Express](http://expressjs.com/) to add support for
[Streamline](https://github.com/Sage/streamlinejs) syntax in Express apps.

Supports both Express 2 and Express 3.

## Example

```js
var express = require('express-streamline');
var app = express.createServer();

// ...

app.use(function (req, res, _) {
    if (req.session.userId) {
        req.currentUser = User.getById(req.session.userId, _);
    }
});

// ...

app.get('/photos', function (req, res, _) {
    var photos = req.currentUser.getPhotos(_);
    res.render('photos', {
        photos: photos,
    });
});
```

## Installation

```
npm install express-streamline
```

## Usage

You can either `require()` Express normally and then patch it:

```js
var express = require('express');
require('express-streamline');
```

Or just `require()` this module, which returns the patched Express for
convenience:

```js
var express = require('express-streamline');
```

Then, you can write any and all Express handlers in Streamline syntax by just
replacing `next` with `_`.

```js
// middleware handlers:
app.use(function (req, res, _) { ... });
app.param('user', function (req, res, _, user) { ... });

// route handlers:
app.get('/:user', function (req, res, _) { ... });
app.post('/:user', function (req, res, _) { ... });
// ... (all verbs supported)

// error handlers:
app.use(function (err, req, res, _) { ... });
app.error(function (err, req, res, _) { ... }); // Express 2 only
```

By default, Streamlined middleware handlers will continue to the `next`
middleware, while Streamlined route and error handlers won't.
This is generally what you want, but **you can specify whether `next` is
called by explicitly returning `true` or `false`**.

```js
// middleware to blacklist banned IP addresses,
// but allow all other requests to pass through:
app.use(function (req, res, _) {
    var isBanned = dbs.bannedIPs.search(req.ips, _).length > 0;
    if (isBanned) {
        res.send(403);
        return false;   // end the response
    }
});
```

If you run into any issues, [file a bug](https://github.com/aseemk/express-streamline/issues/)!

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. &copy; 2012-2014 Aseem Kishore.

## Credits

[TJ Holowaychuk](https://github.com/visionmedia) for the awesome Express, and
[Bruno Jouhier](https://github.com/bjouhier) for the awesome Streamline.

[Seth Yuan](https://github.com/sethyuan)'s
[`streamline-express`](https://github.com/sethyuan/streamline-express) for the
inspiration and motivation.
`streamline-express` has supported Express 3 for longer than this module, and
it currently also supports more advanced Express 3 features (like passing
multiple Streamlined handlers to the same `app.verb` call).
I believe this module has a cleaner API and more robust implementation,
however, but I'm biased. =) Both modules get the job done just fine!
