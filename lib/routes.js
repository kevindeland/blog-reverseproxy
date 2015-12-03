
var routesBluemix = require('../config/routetable');

module.exports.map = function(source, referer) {
    console.log('finding route for', source);

    var routes = null;
    if(!process.env.VCAP_SERVICES) {
	routes = routesBluemix;
    } else {
	routes = routesBluemix;
    }
    
    var map = findRouteMatch(source, routes);
    return map;
    
}

function findMatch(source, table) {
    console.log('finding match for source', source);
    // quick hack, idk best practices
    var serviceName = source.split('/')[1];
    var path = source.substring(serviceName.length + 1);
    var route = table.services[serviceName];
    if(!route) {
	route = table.services[table.defaults.target];
    }
    return {
	route: route,
	path: path
    };
}

/**
 * finds the longest path in the table that matches the source....
 * see test case routeMapper.js for more details
 */
function findRouteMatch(source, table) {
    //    console.log('finding match for source', source);
    var retVal = {
	route: null,
	path: null
    };
    
    // avoid some annoying substring problems
    if(source === '/' && table.locations['/']) {
	return {
	    route : table.locations['/'],
	    path : '/',
	    prefix: '/'
	}
    }

    // source == prefix + '/' + suffix;
    var prefix, suffix, index;
    prefix = source;
    suffix = '';
    index = 0;

    while(index > -1) {
	//  console.log('checking', prefix);
	if(table.locations[prefix]) {
	    return {
		route: table.locations[prefix],
		path: suffix,
		prefix: prefix + '/'
	    };
	}
	
	index = prefix.lastIndexOf('/');
	//	console.log('last index of "/" in', source, 'at', index);
	suffix = prefix.substring(index) + suffix;
	prefix = prefix.substr(0, index);
    }
    console.log('not found, using default');
    
    console.log(table.defaults.target);
    return {route: {url: table.defaults.target.url}, prefix: table.defaults.target.prefix};
    
}

/**
 * rules for extracting target URL out of the route mapping object
 */
module.exports.map2target = function(map) {

    return map.route.url;
}

module.exports.map2context = function(map) {
    return map.prefix;
}
