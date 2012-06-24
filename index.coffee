module.exports = express = require 'express'

# wraps the streamline-style handler (req, res, _) to the style express
# requires (req, res, next). note that error handlers have an extra parameter,
# and express examines the route function's length to determine this!
wrapHandler = (handler) ->
    makeCallback = (next) ->
        (err) ->
            return next err if err
    if handler.length >= 4
        (err, req, res, next) ->
            handler err, req, res, makeCallback next
    else
        (req, res, next) ->
            handler req, res, makeCallback next

# we monkey-patch the route and error methods via Express's prototype::
app = express.HTTPServer.prototype
for verb in ['all', 'get', 'post', 'put', 'del', 'error']
    do (verb) ->
        origAppVerb = app[verb]
        app[verb] = (args...) ->
            # wrap the handler function, which is the last argument:
            args[args.length - 1] = wrapHandler args[args.length - 1]
            # then call the original method with this wrapped handler:
            origAppVerb.apply @, args
