const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const debug = require('debug')('connector:app');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const recordRouter = require('./routes/ws-record');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/record', recordRouter); 

// Specific route handling for setting up websocket connection
app.handleUpgrade = function(pathname, request, socket, head) {
  if (pathname.replace(/\/$/, '') === '/record') {
    debug('Upgrading socket for path ' + pathname);
    recordRouter.wss.handleUpgrade(request, socket, head, (ws) => {
      debug('Emitting connection for paht ' + pathname)
      recordRouter.wss.emit('connection', ws, request);
    });
  } else {
    debug('unhandlled path: ' + pathname);
    socket.destroy();
  }
}

module.exports = app;
