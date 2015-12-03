

var proxy = require('express-http-proxy');
var app = require('express')();

app.use(function(req, res, next) {
    console.log('Time: %d; Route: %s', Date.now(), req.url);
    next();
});

var bluemix, local;
var routeTable = process.env.VCAP_SERVICES ? bluemix = {
    '/acorns': 'https://db4t-acorns.mybluemix.net',
    '/conway': 'https://steam315.mybluemix.net'
    
} : local = {
    '/blossom': 'localhost:3060',
    '/acorns': 'localhost:3030'
}

var routes = Object.keys(routeTable);
routes.forEach(function(route) {
    app.use(route, proxy(routeTable[route], {
	forwardPath: function(req, res) {
	    return require('url').parse(req.url).path;
	}
    }));
});

var PORT = process.env.PORT || 3011
app.listen(PORT);
console.log('listening on port', PORT);
