const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const WebSocket = require('ws');

const app = express();
const path = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

//------------------------
// SSE1
//------------------------

app.listen(80, "0.0.0.0", () => {
  console.log("Express server on 80, 0.0.0.0");
});

let eventsArr = [{ body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }];

app.get('/events', (req, res) => {
  res.header('Content-Type', 'text/event-stream');
  res.header('Cache-Control', 'no-cache');
  res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
  res.cookie('cookie2', 'i\'m-a-good-little-cookie')

  let id = 0;

  setInterval(() => {
    if (eventsArr.length > id) {
      res.write('event: my-custom-event\n');
      res.write('id: ' + id + '\n');
      res.write('data :' + JSON.stringify(eventsArr[id]) + '\n\n');
      id++;
    }
  }, 25)

  // setInterval(function() {
  //     res.write('event: my-custom-event\n');
  //     res.write('id: ' + id++ + '\n');
  //     res.write(`data: Your headers: ${JSON.stringify(req.headers)}\n`);
  //     res.write('\n\n')
  // }, 2000);
});

app.post('/events', (req, res) => {
  console.log('headers', req.headers);
  console.log("body", req.body);
  res.header('Cache-Control', 'no-cache');
  res.cookie('posted', 'you-sent-a-cookie-after-posting!')

  eventsArr.push(req.body);
  res.end('Body Received: ' + JSON.stringify(req.body));

  // let id=0;
  // setInterval(function() {
  //     res.write('event: my-custom-event\n');
  //     res.write('id: ' + id++ + '\n');
  //     res.write(`data: Your headers: ${JSON.stringify(req.headers)}\n`);
  //     res.write(`data: Your body: ${JSON.stringify(req.body)}\n`);
  //     res.write('\n\n')
  // }, 2500);
});


//------------------------
// WEBSOCKET
//------------------------

const wss = new WebSocket.Server({
  port: 5000,
});

function heartbeat() { //used for ping-pong
  this.isAlive = true;
}

// broadcast to all clients including itself
wss.on('connection', (wsClient) => {
  wsClient.send('You are connected to WS.');
  wsClient.isAlive = true;
  wsClient.on('pong', heartbeat); //Pong messages are automatically sent in response to ping messages as required by the spec

  wsClient.on('message', (message) => {
    console.log('received message');

    wss.clients.forEach(client => {
      // if (client !== wsClient && client.readyState === WebSocket.OPEN) {//to all clients excluding self (exclusive)
      if (client.readyState === WebSocket.OPEN) { //to all clients including self (inclusive)
        client.send('Echo: ' + message);
      }
    })
  })
});

// generic broadcast formula
// wss.on('connection', function connection(ws) {
//   ws.on('message', function incoming(data) {
//     wss.clients.forEach(function each(client) {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(data)
//       }
//     })
//   })
// })

//broadcast constantly
// setInterval(() => {
//     wss.clients.forEach(client => {
//         client.send("Hi from server.");
//     })
// }, 2000)

// How to detect and close broken connections?
// Sometimes the link between the server and the client can be
// interrupted in a way that keeps both the server and the client
// unaware of the broken state of the connection (e.g. when pulling the cord)
// In these cases ping messages can be used as
// a means to verify that the remote endpoint is still responsive
//ping
setInterval(() => {
  wss.clients.forEach(client => {
    if (client.isAlive === false) { //checks if a client is inactive
      return client.terminate(); //closes connection if so
    }
    client.isAlive = false; //sets client to inactive
    client.ping(() => { }); //pings the client (if they're still connected => it will reset client.isAlive to true || if the client is inactive, on the next pass of this function will terminate the connection)
  }) //^Pong messages are automatically sent in response to ping messages as required by the spec => on.('pong', heartbeat) is what resets client.isAlive
}, 10000) //10 seconds
// Use WebSocket#terminate(), which immediately destroys the connection,
// instead of WebSocket#close(), which waits for the close timer.

//------------------------
// HTTP 2 (SSE2)
//------------------------

const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync(path.join(__dirname, './', './localhost-privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, './', './localhost-cert.pem'))
});
server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`);
  }

  let id = 0;

  let receivedData = "";

  stream.respond({
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    // 'set-cookie' : '1P_JAR=2018-12-02-21; expires=Tue, 01-Jan-2019 21:47:55 GMT; path=/; domain=.google.com',
    ':status': 200,
  });

  let interval = setInterval(() => {
    stream.write('event: my-custom-event\n');
    stream.write('id: ' + id++ + '\n');
    stream.write('data : Your headers... ' + JSON.stringify(headers) + '\n');
    stream.write('data : Your body... ' + receivedData + '\n\n');
  }, 2000)


  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    console.log('chunk', chunk);
    receivedData += chunk;
  })

  stream.on('error', err => {
    console.warn(err);
    stream.close();
    clearInterval(interval);
  })
});

server.listen(8443, () => {
  console.log('listening on 8443');
});


module.exports = app;
