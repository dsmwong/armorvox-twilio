const express = require('express');
const router = express.Router();
const fs = require('fs');
const debug = require('debug')('connector:routes:recresult');

const ArmorVoxClient = require('../lib/armovox');

const MEDIA_BASE = 'media/'

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

function getCallMetadata(callsid) {
  
  let file_array = fs.readdirSync(MEDIA_BASE).filter(file => file.match(new RegExp(`${callsid}-.*\.json`, 'ig')));
  let jsonArray = []

  debug('Files Found: ', file_array)
  
  file_array.forEach( (file) => {
    jsonArray.push(JSON.parse(fs.readFileSync(`${MEDIA_BASE}${file}`)));
  });

  return jsonArray;
}

function digitsToPhrase(enrol_code) {
  const word_array = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  let phrase = [];

  let split = enrol_code.split(' ');
  split.forEach( digit => {
    phrase.push(word_array[parseInt(digit)])
  })
  return phrase.join(' ');
}

router.post('/', (req, res, next) => {

  requestPrint(req)

  let callMetadata = getCallMetadata(req.body.CallSid);
  debug(callMetadata);

  let utterances = []
  callMetadata.forEach( (rec) => {
    let utterance = {}

    utterance.content = fs.readFileSync(MEDIA_BASE + rec.wavfile, {encoding: 'base64'});
    utterance.phrase = digitsToPhrase(rec.customParameters.enrolCode);
    utterance.vocab = 'en_digits';
    utterance.feature_vector = null;
    utterance.check_quality = true;
    utterance.recognition = true;

    utterances.push(utterance)
  });

  debug(utterances);

  let avClient = new ArmorVoxClient('https://armorvox.aurayasystems.com/evaluation/v8', 'twilio');

  const cleanPhone = callMetadata[0].customParameters.caller.replace('+','');
  avClient.enrol(cleanPhone, 'digit', utterances, 'voice', null).then( (resp) => {
    debug(resp);
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

  // avClient.detectGender(utterances, null).then( (resp) => {
  //   debug(resp);
  //   res.status(resp.status).send(resp.body);
  // }).catch((err) => {
  //   debug(JSON.stringify(err, null, 2));
  //   res.status(500).send( {
  //     status: 'error',
  //     error: err.message,
  //     detail: err.stack,
  //     url: err.config.url
  //   });
  // });

  
  // avClient.checkHealth().then( (resp) => {
  //   debug(resp);
  //   res.status(200).send(resp.body);
  // }).catch((err) => {
  //   debug(JSON.stringify(err, null, 2));
  //   res.status(500).send( {
  //     status: 'error',
  //     error: err.message,
  //     detail: err.stack,
  //     url: err.config.url
  //   });
  // });

  // avClient.getPhrase('en_digit').then( (resp) => {
  //   debug(resp);
  //   res.status(200).send(resp.body);
  // })
  // .catch((err) => {
  //   debug(JSON.stringify(err, null, 2));
  //   res.status(500).send( {
  //     status: 'error',
  //     error: err.message,
  //     detail: err.stack,
  //     url: err.config.url
  //   });
  // });

})

module.exports = router;