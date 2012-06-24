# Express-Streamline

Monkey-patches [Express](http://expressjs.com/) to add support for
[Streamline](https://github.com/Sage/streamlinejs) syntax in routes.

See the example and details below.

## Installation

```
npm install express-streamline
```

## Usage

You can either `require()` Express normally and then monkey-patch it:

```js
var express = require('express');
require('express-streamline');
```

Or just `require()` this module, which returns the monkey-patched Express for
convenience:

```js
var express = require('express-streamline');
```

## Example

```js
var express = require('express-streamline');
var app = express.createServer();

// ...

app.get('/user/:id', function (req, res, _) {
    var user = User.getByUsername(req.params.id, _);
    var favs = user.getFavorites(_);
    
    res.render('user', {
        user: user,
        favs: favs,
    });
});
```

## Details

Express routes can be asynchronous, and so they take a `next()` callback. But
this `next()` callback isn't quite like typical Node async callbacks — it
can't be called to signal successful completion *without triggering the next
matching route or middleware*.

This doesn't work well with tools like Streamline, which are built for typical
Node async callbacks. So this plugin simply monkey-patches Express to support
calling the `next()` callback without error *without triggering the next
matching route or middleware*.

**Note that this means multiple routes can no longer handle a single URL.**
In other words, route handlers become the final handlers for any given URL.
But that's the typical style of writing MVC apps anyway, so this trade-off
might not be a trade-off to you at all (it isn't in any app I've written).

If you have any questions or comments, don't hesitate to reach out. =)

## TODO

This only patches HTTP servers; patch HTTPS ones too. Is there a way to do
that in a generic way?

Investigate support for Express 3 / Connect 2.

## License

MIT. &copy; 2012 Aseem Kishore.

## Credits

[TJ Holowaychuk](https://github.com/visionmedia) for the awesome Express, and
[Bruno Jouhier](https://github.com/bjouhier) for the awesome Streamline.
