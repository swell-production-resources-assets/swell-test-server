const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


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


let eventsArr = [{ body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }, { body: 'test' }];

app.get('/', (req, res) => res.send('Successully deployed. Visit /events for SSE'));

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

// If deployed to Heroku, choose port for listening dynamically
const port = process.env.PORT || 1234;
app.listen(port, "0.0.0.0", () => {
  console.log(`Express server on ${port}, 0.0.0.0`);
});

module.exports = app;
