"use strict";
const express = require('express');
const router = express.Router();
const debug = require('debug')('connector:routes:getvoiceprint');
const util = require('util');

require('dotenv').config();

const ArmorVoxClient = require('../lib/armovox');

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

router.get('/', (req, res, next) => {

  if( req.query.AccessKey !== process.env.ACCESS_KEY) {
    res.status(401).send({stataus: 'Unauthorized', message: 'Unauthorized Access'});
    return;
  }

  requestPrint(req);

  let avClient = new ArmorVoxClient(process.env.ARMORVOX_ENDPOINT, process.env.ARMORVOX_GROUP);

  const cleanPhone = req.query.Caller.replace('+','');

  debug(`Checking Voiceprint for ${cleanPhone}`);

  if( req.body.Stub ) {
    res.status(200).send({status: 'ok', message: 'stub'});
    return;
  }
  
  avClient.getVoicePrint(cleanPhone, avClient.VoiceprintType.DIGIT, true).then( (resp) => {
    debug(util.inspect(resp, {depth: null}));
    res.status(resp.status).send(resp.body);
  }).catch((err) => {
    debug(JSON.stringify(err, null, 2));
    res.status(500).send( {
      status: 'error',
      error: err.message,
      detail: err.stack,
      url: err.config.url
    });
  });

})

module.exports = router;