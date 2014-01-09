var assert = require('assert');
var app = require('./example');
var req = require('supertest');

exports['express-streamline'] = {

    'should generally work': function (next) {
        req(app)
            .get('/')
            .expect(200)
            .expect('x-request-id', /[a-z0-9]+/)
            .end(next)
    },

    'should properly handle async calls': function (next) {
        var ms = 200;
        req(app)
            .get('/' + ms)
            .expect(200)
            .end(function (err, res) {
                assert.ifError(err);

                var respTime = parseInt(res.header['x-response-time']);
                assert(respTime > ms);      // at least this much time...
                assert(respTime < 2 * ms);  // ...but not *too* much more.

                next();
            })
    },

    'should properly handle route errors': function (next) {
        req(app)
            .get('/error')
            .expect(500)
            .expect(/route error/i)
            .end(next)
    },

    'should properly handle middleware errors': function (next) {
        req(app)
            .get('/foo/bar/baz?error=middleware')
            .expect(500)
            .expect(/middleware error/i)
            .end(next)
    }

};
