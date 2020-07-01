"use strict";

const express = require('express');
const router = express.Router();
const debug = require('debug')('connector:routes:ws-record');

const fs = require('fs');
const header = require('../lib/waveheader');

// Set up the WebSocket for the route
const WebSocket = require('ws')
const wss = new WebSocket.Server({
  noServer: true
});
router.wss = wss;

wss.on('connection', (ws) => {
  log('Media WS: Connection accepted');
  new MediaStreamHandler(ws);
})

// normal HTTP route
router.get('/', function (req, res) {
  //let ws = req.ws
  debug('GET called')
  res.status(200).send({
    status: 'Ok',
    message: 'Executed Action'
  });
});

function log(message, ...args) {
  debug(new Date(), message, ...args);
}

class MediaStreamHandler {
  constructor(ws) {
    this.metaData = null;
    this.trackHandlers = {};
    ws.on('message', this.processMessage.bind(this));
    ws.on('close', this.close.bind(this));
    this.writeStream = null;
  }

  parseFormat(audioEncoding) {

    switch (audioEncoding) {
      case "audio/x-alaw":
      case "audio/x-alaw":
        return 6;
      case "audio/x-mulaw":
        return 7;
      default:
        return 1;
    }
  }

  processMessage(message) {


    const data = JSON.parse(message);

    if(data.event === "connected") {
      log('Stream connected');
      log('received: ' + message);
      return;
    }

    if(data.event === "stop") {
      log('Stream stopped');
      log('received: ' + message);
      return;
    }

    if (data.event === "start") {
      log('Stream starting');
      log('received: ' + message);

      this.metaData = data.start;

      let i = this.metaData.sequence;
      let mode = (this.metaData.mode === 'enrol') ? 'e' : 'v';

      // try {
      //   while (fs.existsSync(`media/${this.metaData.callSid}-${i}.json`)) {
      //     i++;
      //   }
      // } catch (e) {
      //   console.log('something went wrong', e)
      // }

      this.metaData.wavfile = `${this.metaData.callSid}-${i}-${mode}.wav`

      // write meta data
      fs.writeFile(`media/${this.metaData.callSid}-${i}-${mode}.json`, JSON.stringify(this.metaData, null, 2), (err) => {
        if (err) console.log(err);
      });

      // for Saving to wav file
      this.writeStream = fs.createWriteStream(`media/${this.metaData.wavfile}`, {
        encoding: 'base64',
        flags: 'w'
      });
      this.writeStream.write(header(null, {
        format: this.parseFormat(this.metaData.mediaFormat.encoding),
        sampleRate: this.metaData.mediaFormat.sampleRate,
        bitDepth: 16,
        channels: this.metaData.mediaFormat.channels
      }));

    } else if (data.event === "media") {
      const track = data.media.track;
      log(`[${data.sequenceNumber}] ${data.media.timestamp} ${data.media.track}(${data.media.chunk})`)

      // ****************************
      // Saving payload into WAVE file
      //console.log(`(${track}) writing payload`);
      const payload = data.media.payload;
      this.writeStream.write(payload);
      // ****************************  
    }


  }

  close() {
    log('Media WS: closed');
    //return;

    for (let track of Object.keys(this.trackHandlers)) {
      log(`Closing ${track} handler`);
      this.trackHandlers[track].close();
    }
    // complete the write stream
    this.writeStream.end();
  }

  printTranscription(track, transcription) {
    log(`Transcription (${track}): ${transcription}`);
  }
}

module.exports = router;
