# blog-reverseproxy

### Running locally
#### start local app
```bash
node local-app.js &
```

#### curl it
```bash
curl localhost:3060/hello
```

#### Now hide it behind a reverse proxy
```bash
node proxy.js &
```

#### Now curl the proxy
```bash
curl localhost:3000/blossom/hello
```

#### Routes visible in config/routetable ( not show here )
```javascript
module.exports = {
    "defaults": {
	"target": "blossom"
    },
    "services": {
	"blossom": {
	    url: "http://localhost:3060",
	},
	"bubbles": {
	    url: "http://localhost:3070",
	},
	"buttercup": {
	    url: "http://localhost:3080"
	}
    }
}
```
