# Swell-test-server

{change package.json script to "server": "nodemon test-server/server.js"}
To test WS -> WS localhost:5000
To test SSE1 -> HTTP http://localhost:80/events
To test SSE2 -> HTTPS https://localhost:8443

------------

{change package.json script to "server": "nodemon test-server/index.js"}
To test index.js SSE3 -> HTTP http://localhost:8888/events