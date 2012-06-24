module.exports = express = require 'express'

# wraps the streamline-style handler (req, res, _) to the style express
# requires (req, res, next). we have different methods for middleware vs.
# route/resource handlers to account for the different completion semantics.
# update: account for error handlers which have the form (err, req, res, _)!
wrapHandler = (handler, isMiddleware) ->
    makeCallback = (next) ->
        (err) ->
            if err
                next(err)
            else if isMiddleware
                next()
    if handler.length >= 4
        (err, req, res, next) ->
            handler err, req, res, makeCallback next
    else
        (req, res, next) ->
            handler req, res, makeCallback next

# we wrap the Express server's instance methods via its prototype:
app = express.HTTPServer.prototype

# we monkey-patch the middleware method here:
origAppUse = app.use
app.use = (middleware) ->
    origAppUse.call @, wrapHandler middleware, true

# and we monkey-patch the route and error methods here:
for verb in ['all', 'get', 'post', 'put', 'del', 'error']
    do (verb) ->
        origAppVerb = app[verb]
        app[verb] = (args...) ->
            # wrap the handler function, which is the last argument:
            args[args.length - 1] = wrapHandler args[args.length - 1]
            # then call the original method with this wrapped handler:
            origAppVerb.apply @, args
