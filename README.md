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
app.use(function (req, res, _) { ... });
app.get(function (req, res, _) { ... });
app.post(function (req, res, _) { ... });
app.error(function (err, req, res, _) { ... });
```

By default, Streamlined middleware handlers will continue to the `next`
middleware, while Streamlined route and error handlers won't.
This is generally what you want, but you can specify what you want by
explicitly `return`'ing `true` or `false`.

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

## License

MIT. &copy; 2012-2014 Aseem Kishore.

## Credits

[TJ Holowaychuk](https://github.com/visionmedia) for the awesome Express, and
[Bruno Jouhier](https://github.com/bjouhier) for the awesome Streamline.
