
var http = require('http'),
    httpProxy = require('http-proxy'),
    fs = require('fs');

var winston = require('winston');

var LOGGER_DEBUG = true;

var proxy = httpProxy.createProxyServer({xfwd: true, changeOrigin: true, ws: false});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
    winston.log('info', 'Proxy Request: ' + req._oriurl + ' --> ' + req.url + ' @ ' + req._target);
    console.log('Proxy Cookies: ' + req.headers.cookie);
    
});

proxy.on('proxyRes', function(proxyRes, req, res, options) {
    winston.info("Proxy Response ["+proxyRes.statusCode+"]:"+req._oriurl+" @ "+req._target);//+
    //		     "\n\tHeaders: "+util.inspect(proxyRes.headers));
    var LOG_COOKIES = false;
    LOG_COOKIES ? console.log('Response Cookies: ' + req.headers.cookie) : null;

    if(proxyRes.statusCode === 302) {
	console.log('this was a redirect');
        //	console.log(req.headers);
        
        // special case
        if(!req._oriurl == '/') {
	    proxyRes.headers['location'] = req._oriurl + proxyRes.headers['location'];
        }
	//	console.log(req._oriurl)
	console.log(proxyRes.headers);	
    }

});

/**
 * table of all possible routes
 */
var ROUTE_FILE = process.env.VCAP_SERVICES ? 'routes.json' : 'routes.json.local';

var routes = JSON.parse(fs.readFileSync('./' + ROUTE_FILE, 'utf8'));

/**
 * This currently only supports two possible keys:
 * '/' is the root key
 * '/<key>/path' where key has zero slashes
 * 
 */
function getMyKey(url) {
    var key;
    
    if(url === '/') {
        return '/';
    } else {
        // don't check leading /
        var index = url.indexOf('/', 1);
        if(index == -1) {
            // this means we just saw /<key> or /<path> (w/ root key)
            key =  url.substring(1);
        } else {
            key = url.substring(1, index);
        }

        return key;
    }
    
}


function processReq(err, req, res) {

    // entire source URL (e.g. http://localhost:3000/blossom/hello)
    var src = req.headers.host + req.url;
    console.log('host:', req.headers.host);
    console.log('source:', src);
    var _url = req.url;
    console.log('_url:', _url);

    // now we get a (potential) key
    var myKey = getMyKey(_url);

    var myNewRoute = routes[myKey];
    if(!myNewRoute) {
        // myKey is actually a path off of root key e.f. '/<path'
        myNewRoute = routes['/'];
    }

    // set new path
    console.log('url of: ' + req.url + ' yields a prefix of ' + myNewRoute.prefix);
    var t = myNewRoute.prefix.length + 1;
    req.url = req.url.substring(t);
    console.log('new path: ' + req.url);

    // save previous values
    req._orihost = req.headers.host; // original host
    req._oriurl = _url; // original url

    // set new host
    req.headers['host'] = myNewRoute.host;
    req.headers['x-proxy-prefix'] = myNewRoute.prefix;
    console.log(myNewRoute);

    req._target = myNewRoute.url;
    // IMPORTANT...
    proxy.web(req, res, {
	target: req._target
    });
}

// This is the HTTP server
var proxyServer = http.createServer(function(req, res){
    processReq(undefined, req, res);
});


var PORT = process.env.PORT || 3003;
proxyServer.listen(PORT);
console.log('listening on port ' + PORT);
