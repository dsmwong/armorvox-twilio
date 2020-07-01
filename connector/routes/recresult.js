"use strict";

const express = require('express');
const router = express.Router();
const fs = require('fs');
const debug = require('debug')('connector:routes:recresult');

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

router.post('/', (req, res, next)=>{
  requestPrint(req);

  let i = 0;
  let mode = (req.body.mode === 'enrol') ? 'e' : 'v';

  try {
    // while (fs.existsSync(`media/${recObj.callSid}-${i}.txt`)) {
    //   i++;
    // }

    const metafile = `media/${req.body.CallSid}-${req.body.Count}-${mode}.json`
    if( fs.existsSync(metafile)) {
      debug(`found ${metafile}`)
      let data = JSON.parse(fs.readFileSync(metafile));
      debug(`${JSON.stringify(data, null, 2)}`)
      data.recognitionResult = {}
      data.recognitionResult.caller = req.body.Caller
      data.recognitionResult.callSid = req.body.CallSid
      data.recognitionResult.speechResult = req.body.SpeechResult
      data.recognitionResult.confidence = req.body.Confidence

      debug(`writing back to ${metafile}`);
      debug(`${JSON.stringify(data, null, 2)}`)
      fs.writeFile(metafile, JSON.stringify(data, null, 2), (err) => {
        if(err) {
          debug(`error writing file: ${metafile}: ${err}`);
          res.status(500).send({status: 'error', message: 'Write error: ' + err})

        }
        debug(`Result written into ${metafile}`);
        res.status(200).send({status: 'ok', message: 'Result written to file', streamSid: data.streamSid })
      });
    } else {
      debug(`File ${metafile} could not be found`);
      res.status(200).send({status: 'error', message: 'Metafile not found'})
      return;
    }
  
  } catch (e) {
    console.log('something went wrong', e)
    res.status(500).send({status: 'error', message: 'Error: ' + e})
  }
})

module.exports = router;
