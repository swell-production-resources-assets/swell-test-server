// /* HTTP 2 */

// const http2 = require('http2');
// const fs = require('fs');

// const server = http2.createSecureServer({
//   key: fs.readFileSync(path.join(__dirname, './', './localhost-privkey.pem')),
//   cert: fs.readFileSync(path.join(__dirname, './', './localhost-cert.pem'))
// });
// server.on('error', (err) => console.error(err));

// server.on('stream', (stream, headers) => {
//   for (const name in headers) {
//     console.log(`${name}: ${headers[name]}`);
//   }

//   let id = 0;

//   let receivedData = "";

//   stream.respond({
//     'content-type': 'text/event-stream',
//     'cache-control': 'no-cache',
//     // 'set-cookie' : '1P_JAR=2018-12-02-21; expires=Tue, 01-Jan-2019 21:47:55 GMT; path=/; domain=.google.com',
//     ':status': 200,
//   });

//   let interval = setInterval(() => {
//     stream.write('event: my-custom-event\n');
//     stream.write('id: ' + id++ + '\n');
//     stream.write('data : Your headers... ' + JSON.stringify(headers) + '\n');
//     stream.write('data : Your body... ' + receivedData + '\n\n');
//   }, 2000)


//   stream.setEncoding('utf8')
//   stream.on('data', (chunk) => {
//     console.log('chunk', chunk);
//     receivedData += chunk;
//   })

//   stream.on('error', err => {
//     console.warn(err);
//     stream.close();
//     clearInterval(interval);
//   })
// });

// server.listen(8443, () => {
//   console.log('listening on 8443');
// });
