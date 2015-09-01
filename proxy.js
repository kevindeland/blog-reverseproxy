var http = require('http'),
    httpProxy = require('http-proxy');

var LOGGER_DEBUG = true;

var routes = require('./lib/routes');

var proxy = httpProxy.createProxy();

proxy.on('proxyReq', function(proxyReq, req, res, options) {
    console.log('Proxy Request: ' + req._oriurl + ' --> ' + req.url + ' @ ' + req._target);
    console.log('Proxy Cookies: ' + req.headers.cookie);
//    console.log('req', JSON.stringify(Object.keys(req)));
});


var conservedCookies = [
    'JSESSIONID',
    '__VCAP_ID__'
];

proxy.on('proxyRes', function(proxyRes, req, res, options) {
    console.log("Proxy Response ["+proxyRes.statusCode+"]:"+req._oriurl+" @ "+req._target);//+
    //		     "\n\tHeaders: "+util.inspect(proxyRes.headers));
    console.log('Response Cookies: ' + req.headers.cookie);

    /**
     * CONSERVE COOKIES
     */
    if (proxyRes.headers["set-cookie"] || proxyRes.headers["Set-Cookie"]) {
	var sets = proxyRes.headers['set-cookie'] || proxyRes.headers["Set-Cookie"];
	console.log('Found set-cookie', sets);
	var a;
	for (var i = 0; i < sets.length; i++) {
	    var cookie = sets[i];
	    if (cookie.indexOf('JSESSIONID=') === 0) {
		LOGGER_DEBUG ? console.log('Renaming Cookie:', cookie) : null;
		a = cookie.split('JSESSIONID='); // get rid of old name
		a[0] = 'Proxy_JSESSIONID='; // rename cookie name
		cookie = a.join(''); // rejoin
		sets[i] = cookie; // replace
	    } else if (cookie.indexOf('__VCAP_ID__=') === 0) {
		LOGGER_DEBUG ? console.log('Renaming Cookie:', cookie) : null;
		a = cookie.split('__VCAP_ID__='); // get rid of old name
		a[0] = 'Proxy___VCAP_ID__='; // rename cookie name
		cookie = a.join(''); // rejoin
		sets[i] = cookie; // replace
	    }
	}
    }
});

// how to handle incoming requests
var proxyServer = http.createServer(function(req, res) {

    // entire source URL (localhost:3000/blossom/hello)
    var src = req.headers.host + req.url;
    console.log('source:', src);
    var target = req.url;
    console.log('target:', target);
    console.log('referer:', req.headers.referer);

    // now we get where to map to...
    var map = routes.map(req.url, req.headers.referer);
    
    req._orihost = req.headers.host; // original host
    req._oriurl = req.url; // original url
    req._target = routes.map2target(map); // convert map into a target

    req.url = map.path;
    console.log('deleting host:', req.headers.host);
    delete req.headers.host;


    
    /**
     * Step 2: RESTORE COOKIES
     */
    var cookies = req.headers.cookie;
    var ca; // cookies array
    var cookie;
    var RESTORE_JSESSIONID = false;
    if(RESTORE_JSESSIONID && cookies) {
	var deletedDups = false;
	ca = cookies.split('; ');
	console.log('found', ca.length, 'cookies');
	for (var i = 0; i < ca.length; i++) {
	    cookie = ca[i];
	    if(cookie.indexOf('Proxy_') === 0) {
		// CONTINUE
		LOGGER_DEBUG ? console.log('Restoring Cookie', cookie) : null;
		cookie = cookie.substr('Proxy_'.length);
		var cookieNamePEq = cookie.substring(0, cookie.indexOf("=") + 1);

		for(var j = 0; j < ca.length; j++) {
		    if (ca[j] && ca[j].indexOf(cookieNamePEq) === 0) {
			LOGGER_DEBUG ? console.log('Deleting cookie same name: ' + cookieNamePEq) : null;
			delete ca[j];
			deletedDups = true;
		    }
		}
		ca[i] = cookie;
	    }
	    if (deletedDups) {
		ca = ca.filter(function(cookie) {
		    return !!cookie;
		});
	    }

	    req.headers.cookie = ca.join('; ');
	}
    }
    
    console.log('new target:', req._target);
    // IMPORTANT...
    proxy.web(req, res, {
	target: req._target
    });
});


var PORT = process.env.PORT || 3002;
proxyServer.listen(PORT);

return;

var SERVER_PORT = 3060;
var PORT2 = 3070;
var PROXY_PORT = 8000;

//var proxy = httpProxy.createProxyServer({ target: 'http://localhost:' + SERVER_PORT }).listen(PROXY_PORT);


http.createServer(function(req, res) {
    res.setHeader('X-Special-Proxy-Header', 'foobar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
}).listen(SERVER_PORT);
