
process.env.TESTING = true;

var match = require('../lib/routes').findRouteMatch;

var map = {
    "defaults": {
	"target": {
	    url: "http://localhost:3030"
	}
    },
    "locations": {
	"/": {
	    "url": "http://localhost:3000"
	},
	"/aaa": {
	    "url": "http://localhost:3001"
	},
	"/bbb": {
	    "url": "http://localhost:3002"
	},
	"/aaa/ccc": {
	    "url": "http://localhost:3003"
	},
	"/aaa/bbb": {
	    "url": "http://localhost:3004"
	}
	
    }
}



exports.findRouteMatch = function(test) {

    var x;


    x = match("/aaa/bbb/ccc", map);
    test.equal(x.route.url, "http://localhost:3004");
    test.equal(x.path, "/ccc");

    x = match("/aaa/ddd", map);
    test.equal(x.route.url, "http://localhost:3001");
    test.equal(x.path, '/ddd');

    x = match("/aaa/zzz/yyy/xxx", map);
    test.equal(x.route.url, "http://localhost:3001");
    test.equal(x.path, '/zzz/yyy/xxx');
    
    x = match("/", map);
    test.equal(x.route.url, "http://localhost:3000");

    x = match("/aaa", map);
    test.equal(x.route.url, "http://localhost:3001");

    x = match("/bbb", map);
    test.equal(x.route.url, "http://localhost:3002");


    x = match("/aaa/ccc", map);
    test.equal(x.route.url, "http://localhost:3003");

    x = match("/aaa/bbb", map);
    test.equal(x.route.url, "http://localhost:3004");
    
    x = match("/xxx/yyy", map);
    console.log(x);
    test.equal(x.route.url, "http://localhost:3030");


    test.done();
    return;



    
};
