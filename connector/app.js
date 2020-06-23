var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//require('dotenv').config()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var recordRouter = require('./routes/ws-record');

var app = express();

// var port = normalizePort(process.env.PORT || '3000');
// app.set('port', port);

// var http = require('http');
// const server = http.createServer(app)
// const WebSocket = require('ws');
// const ws = new WebSocket.Server({server});

// app.use(function (req, res, next) {
//   console.log('adding ws')
//   req.ws = ws;
//   return next();
// });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/record', recordRouter); 

//server.listen(port);

// const ws = require("ws");

// /* GET users listing. */
// const broadcast = (clients, message) => {

//   clients.forEach((client) => {

//       if (client.readyState === WebSocket.OPEN) {

//           client.send(message);
//       }
//   });
// };

// app.use("/dog", (req, res) => {

//   console.log('Called')
//   broadcast(req.app.locals.clients, "Bark!");

//   return res.sendStatus(200);
// });

// function normalizePort(val) {
//   var port = parseInt(val, 10);

//   if (isNaN(port)) {
//     // named pipe
//     return val;
//   }

//   if (port >= 0) {
//     // port number
//     return port;
//   }

//   return false;
// }

module.exports = app;
