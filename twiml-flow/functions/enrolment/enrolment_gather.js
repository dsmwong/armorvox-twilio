const twilio_version = require('twilio/package.json').version;

const RETURN_WEBHOOK = 'https://webhooks.twilio.com/v1/Accounts/AC72c69ce8a6745ba82d93ba0b2c94cbfa/Flows/FW26c0e6ad9d690eef1c7a69f2d116663c?FlowEvent=return'
const LANG = 'en-AU'
const VOICE = 'Polly.Russell'
const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const STREAM_WSS_URI = 'wss://dawong.au.ngrok.io/record'

const ET_ALPHANUM = 'Alphanumeric'
const ET_DIGITS = 'Digits'

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

exports.handler = function(context, event, callback) {

  console.log(`Entered ${context.PATH} node version ${process.version} twilio version ${twilio_version}`);

  let twiml = new Twilio.twiml.VoiceResponse();
  let digitArr = [];
  
  // https://cloud.google.com/speech-to-text/docs/class-tokens
  let recHints = (event.enrolType === ET_ALPHANUM) ? '$OOV_CLASS_ALPHANUMERIC_SEQUENCE' : '$OOV_CLASS_DIGIT_SEQUENCE'
  
  for( let i = 0; i < event.maxdigits; i++) {
     if( event.enrolType === ET_ALPHANUM) {
        const randInt = getRandomInt(ALPHANUMERIC.length)
        digitArr.push(ALPHANUMERIC.substring(randInt, randInt + 1));
     } else {
        digitArr.push(Math.floor(Math.random() * Math.floor(9)));
     }
  }
  
  const enrol_code = digitArr.join(' ');
  console.log('Enrol Code ' + enrol_code)
  
  // moved this to before start stream so the speech start is closer to <gather>
  const say = twiml.say({
    voice: VOICE,
    language: LANG
  } ,'Please say ');
  
  const pros = say.prosody({
     rate: '75%',
  }, `${enrol_code}`);
  
  const start = twiml.start(); 
  const stream = start.stream({
      name: 'Enrolment Stream',
      url: STREAM_WSS_URI,
      track: 'inbound_track'
  })
  stream.parameter({
      name: 'enrolCode',
      value: enrol_code
  });
  stream.parameter({
      name: 'caller',
      value: event.Caller
  });
  
  const gather = twiml.gather({
    action: '/enrolment/enrolment_say',
    method: 'GET',
    input: 'speech',
    language: LANG,
    speechModel: 'numbers_and_commands',
    speechTimeout: 'auto',
    hints: recHints
  });
  
  twiml.say('We didn\'t receive any input. Goodbye!');
 
  callback(null, twiml)
};