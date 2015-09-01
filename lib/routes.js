
var routesBluemix = require('../config/routetable');

module.exports.map = function(source, referer) {
    console.log('finding route for', source);

    var routes = null;
    if(!process.env.VCAP_SERVICES) {
	routes = routesBluemix;
    } else {
	routes = routesBluemix;
    }
    
    var map = findMatch(source, routes);
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

module.exports.map2target = function(map) {

    return map.route.url;
}
