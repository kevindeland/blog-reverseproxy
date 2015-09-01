/**
 * Runs 3 apps on different ports
 */

var express = require('express');
//var cookieParser = require('cookie-parser');

var cookieware = function(name) {
    return function(req, res, next) {

	if(req.headers && req.headers.cookie) {
	    var cookies = req.headers.cookie;
	    console.log(name, 'has cookies', cookies);
	}
	res.cookie('JSESSIONID', 'xxx-xxx-xxx');
	next();
    };
};

// app 1
var blossom  = express();
blossom.use(cookieware('Blossom'));
blossom.get('/hello', function(req, res) {
    res.send('hi from Blossom\n');
});

blossom.get('/foo', function(req, res) {
    res.cookie('bar', 'baz');
    res.send('OK');
});
blossom.get('/bar', function(req, res) {
    res.send(req.headers.cookie);
});

var PORT = process.env.PORT || 3060;

blossom.listen(PORT);
console.log('listening on port ' + PORT);

// app 2
var bubbles = express();
bubbles.use(cookieware('Bubbles'));
bubbles.get('/hello', function(req, res) {
    res.send('hi from Bubbles\n');
});
bubbles.listen(3070);
console.log('listening on port', 3070);

// app 3
var buttercup = express();
bubbles.use(cookieware('Buttercup'));
buttercup.get('/hello', function(req, res) {
    res.send('hi from Buttercup\n');
});
buttercup.listen(3080);
console.log('listening on port', 3080);
