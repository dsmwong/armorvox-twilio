"use strict";
const express = require('express');
const router = express.Router();
const debug = require('debug')('connector:routes:ping');

function requestPrint(req) {
  debug('---------------------------------------------------------------------');
  debug('req._startTime       ' + JSON.stringify(req._startTime       , null, 2));
  debug('req.body             ' + JSON.stringify(req.body             , null, 2));
  debug('req.cookies          ' + JSON.stringify(req.cookies          , null, 2));
  debug('req.files            ' + JSON.stringify(req.files            , null, 2));
  debug('req.headers          ' + JSON.stringify(req.headers          , null, 2));
  debug('req.httpVersion      ' + JSON.stringify(req.httpVersion      , null, 2));
  debug('req.httpVersionMajor ' + JSON.stringify(req.httpVersionMajor , null, 2));
  debug('req.httpVersionMinor ' + JSON.stringify(req.httpVersionMinor , null, 2));
  debug('req.protocol         ' + JSON.stringify(req.protocol         , null, 2));
  debug('req.method           ' + JSON.stringify(req.method           , null, 2));
  debug('req.baseUrl          ' + JSON.stringify(req.baseUrl          , null, 2));
  debug('req.originalUrl      ' + JSON.stringify(req.originalUrl      , null, 2));
  debug('req.path             ' + JSON.stringify(req.path             , null, 2));
  debug('req.hostname         ' + JSON.stringify(req.hostname         , null, 2));
  debug('req.subdomain        ' + JSON.stringify(req.subdomain        , null, 2));
  debug('req.ip               ' + JSON.stringify(req.ip               , null, 2));
  debug('req.params           ' + JSON.stringify(req.params           , null, 2));
  debug('req.query            ' + JSON.stringify(req.query            , null, 2));
  debug('req.readable         ' + JSON.stringify(req.readable         , null, 2));
  debug('req.signedCookies    ' + JSON.stringify(req.signedCookies    , null, 2));
  debug('req.url              ' + JSON.stringify(req.url              , null, 2));
  debug('---------------------------------------------------------------------');
}

router.get('/', (req, res, next)=>{

  requestPrint(req);

  res.status(200).send({ status: 'ok', message: 'pong'})
})

module.exports = router;