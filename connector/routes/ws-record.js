var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/', async function(req, res, next) {
//   console.log('routed');
//   req.app.ws.once('connection', (wss) => {
//     wss.on('message', function incoming(message) {
//         console.log('received: %s', message);
//     });

//     wss.send(JSON.stringify('it works! Yeeee! :))' ));
//   });
// });

router.use('/', function(req, res) {

  //let ws = req.ws
  console.log('called ws')
  let wss = req.app.wss
  wss.on('connection', (ws) => {
    console.log(`Connection Received. Number of clients = ${wss.clients.size}`);
    ws.on('message', (message) => {
        console.log('received: %s', message);
    });

    ws.on('close', () => {
      console.log(`Connection Closed. Number of clients = ${wss.clients.size}`);
    });

    ws.send(JSON.stringify('Connection Opened'));
  });
  res.send('Socket connected');
});

module.exports = router;
