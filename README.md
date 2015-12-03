# reverseproxy

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
curl localhost:3000/hello
```

#### Routes visible in [routes.json](./routes.json)
```javascript
```

