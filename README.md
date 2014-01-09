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

One thing to note: by default, **middleware handlers will *always* continue to
the next middleware, while route and error handlers *never* will**. This is
generally what you want, but **if you want to override this default behavior,
just `return false`** in your handler.

```js
// middleware to short-circuit OPTIONS requests,
// but allows all others to continue:
app.use(function (req, res, _) {
    if (req.method === 'OPTIONS') {
        res.header('Allow', 'HEAD,GET,POST');
        return false;
    }
});
```

If you run into any issues, [file a bug](https://github.com/aseemk/express-streamline/issues/)!

## License

MIT. &copy; 2012-2014 Aseem Kishore.

## Credits

[TJ Holowaychuk](https://github.com/visionmedia) for the awesome Express, and
[Bruno Jouhier](https://github.com/bjouhier) for the awesome Streamline.
