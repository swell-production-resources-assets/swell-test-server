const WebSocket = require('ws');

/*
WEB SOCKET
*/

const wss = new WebSocket.Server({
  port: 5000,
});

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (wsClient) => {
  wsClient.send('You are connected to WS.');
  wsClient.isAlive = true;
  wsClient.on('pong', heartbeat);

  wsClient.on('message', (message) => {
    console.log('received message');

    wss.clients.forEach(client => {
      client.send('Echo: ' + message);
    })
  })
});

// broadcast constantly
// setInterval(() => {
//   wss.clients.forEach(client => {
//     client.send("Hi from server.");
//   })
// }, 2000)

//ping
setInterval(() => {
  wss.clients.forEach(client => {
    if (client.isAlive === false) {
      return client.terminate();
    }

    client.isAlive = false;
    client.ping(() => { });
  })
}, 10000)
