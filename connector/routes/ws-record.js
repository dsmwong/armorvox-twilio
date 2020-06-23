const express = require('express');
const router = express.Router();
const debug = require('debug')('connector:routes:ws-record');

// Set up the WebSocket for the route
const WebSocket = require('ws')
const wss = new WebSocket.Server({ noServer: true });
router.wss = wss;

wss.on('connection', (ws) => {
  debug(`Connection Received. Number of clients = ${wss.clients.size}`);
  
  ws.on('message', (message) => {
      debug('received: %s', message);
  });

  ws.on('close', () => {
    debug(`Connection Closed. Number of clients = ${wss.clients.size}`);
  });

  ws.send(JSON.stringify('Connection /record Opened'));
})

// normal HTTP route
router.get('/', function(req, res) {

  //let ws = req.ws
  debug('GET called')
  res.status(200).send({ status: 'Ok', message: 'Executed Action'});
});

module.exports = router;
