// Generated by CoffeeScript 1.3.3
(function() {
  var app, express, origAppUse, verb, wrapHandler, _fn, _i, _len, _ref,
    __slice = [].slice;

  module.exports = express = require('express');

  wrapHandler = function(handler, isMiddleware) {
    var makeCallback;
    makeCallback = function(next) {
      return function(err) {
        if (err) {
          return next(err);
        } else if (isMiddleware) {
          return next();
        }
      };
    };
    if (handler.length >= 4) {
      return function(err, req, res, next) {
        return handler(err, req, res, makeCallback(next));
      };
    } else {
      return function(req, res, next) {
        return handler(req, res, makeCallback(next));
      };
    }
  };

  app = express.HTTPServer.prototype;

  origAppUse = app.use;

  app.use = function(middleware) {
    return origAppUse.call(this, wrapHandler(middleware, true));
  };

  _ref = ['all', 'get', 'post', 'put', 'del', 'error'];
  _fn = function(verb) {
    var origAppVerb;
    origAppVerb = app[verb];
    return app[verb] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args[args.length - 1] = wrapHandler(args[args.length - 1]);
      return origAppVerb.apply(this, args);
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    verb = _ref[_i];
    _fn(verb);
  }

}).call(this);
