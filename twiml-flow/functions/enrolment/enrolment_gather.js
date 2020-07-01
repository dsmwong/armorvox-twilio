// const { Say } = require('twilio/lib/twiml/VoiceResponse');

// const VoiceResponseEx = require('./VoiceResponseEx');

const twilio_version = require('twilio/package.json').version;

const RETURN_WEBHOOK = 'https://webhooks.twilio.com/v1/Accounts/AC72c69ce8a6745ba82d93ba0b2c94cbfa/Flows/FW26c0e6ad9d690eef1c7a69f2d116663c?FlowEvent=return'
const LANG = 'en-AU'
const VOICE = 'Polly.Russell'
const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const ET_ALPHANUM = 'Alphanumeric' // Use Alpha Numeric String of x Length
const ET_DIGITS = 'Digits'         // Use Random Digits of x Length
const ET_CALLER = 'Caller'         // Use Caller Phone Number
const ET_COUNTUP = 'CountUp'       // Count up from 'one to nine'
const ET_COUNTDOWN = 'CountDown'   // Count down from 'nine to one'
const ET_FOURTWO = 'FourTwo'       // Repeated 4 Digit String

const EnrolTypeOrder = [
  ET_CALLER, 
  ET_CALLER, 
  ET_COUNTUP, 
  ET_COUNTDOWN,
  ET_FOURTWO
];

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getPhrase(opts) {

  let digitArr = [];

  if(opts.enrolType === ET_CALLER )    { return { phrase: 'Please say the phone number you are calling from', literal: opts.caller.replace(/\+/, '').replace(/^61/, '0')}};
  if(opts.enrolType === ET_COUNTUP )   { return { phrase: 'Please count up from one to nine', literal: '123456789'}};
  if(opts.enrolType === ET_COUNTDOWN ) { return { phrase: 'Please count down from nine to one', literal: '987654321'}};

  let selectionString = ALPHANUMERIC;
  let phraseLength = (opts.enrolType === ET_FOURTWO) ? 4 : ((opts.maxdigits) ? opts.maxdigits : 8);
  if( opts.enrolType === ET_DIGITS || opts.enrolType === ET_FOURTWO ) selectionString = ALPHANUMERIC.replace(/[A-Z]*/g, '');
  if( opts.noZeros ) selectionString = selectionString.replace(/0/g, '');

  console.log(`Selection from ${selectionString}`);

  for( let i = 0; i < phraseLength; i++) {

    const randInt = getRandomInt(selectionString.length);
    const selected = selectionString.substring(randInt, randInt + 1)
    digitArr.push(selected);
    if( opts.noRepeat ) {
      selectionString = selectionString.replace(selected, '');
      console.log(`Selection from ${selectionString}`);
    }
  } 

  if(opts.enrolType === ET_FOURTWO) { digitArr = digitArr.concat(digitArr) }
  
 return { phrase: digitArr.join(''), literal: digitArr.join('') };

}

function buildSay(sayElem, opts) {

  switch( opts.enrolType ) {
    case ET_CALLER:
    case ET_COUNTUP:
    case ET_COUNTDOWN:
      sayElem.addText(opts.phrase);
      break;
    default:
      sayElem.addText('Please Say');
      sayElem.prosody({
        rate: '75%',
      }, '').addChild('say-as', {
        'interpret-as': 'spell-out'
      }).addText(opts.phrase);
  }
  return sayElem;
}

exports.handler = function(context, event, callback) {

  console.log(`Entered ${context.PATH} node version ${process.version} twilio version ${twilio_version}`);
  if( event.DEBUG ) {
    console.log('Context ' + JSON.stringify(context));
    console.log('Event ' + JSON.stringify(event));
  }
  let twiml = new Twilio.twiml.VoiceResponse();
  
  // https://cloud.google.com/speech-to-text/docs/class-tokens
  let recHints = (event.enrolType === ET_ALPHANUM) ? '$OOV_CLASS_ALPHANUMERIC_SEQUENCE' : '$OOV_CLASS_DIGIT_SEQUENCE'

  const connector_uri = `wss://${context.CONNECTOR_SERVER}/record`
  
  // moved this to before start stream so the speech start is closer to <gather>
  const say = twiml.say({
    voice: VOICE,
    language: LANG
  })
  const enrolType = (event.enrolType) ? event.enrolType : EnrolTypeOrder[event.Count];

  const { phrase, literal } = getPhrase({
    enrolType: enrolType,
    maxdigits: event.maxdigits,
    caller: event.Caller,
    noRepeat: (event.NoRepeat === 'true') ? true : false,
    noZeros: (event.NoZeros === 'true') ? true : false
  });

  console.log('Literal will be ' + literal.split('').join(' '))

  buildSay(say, { 
    enrolType: enrolType, 
    phrase: phrase
  });
  
  const start = twiml.start(); 
  const stream = start.stream({
      name: 'Enrolment Stream',
      url: connector_uri,
      track: 'inbound_track'
  })
  // to be deprecated
  stream.parameter({
      name: 'enrolCode',
      value: literal
  });
  stream.parameter({
      name: 'caller',
      value: event.Caller
  });

  stream.parameter({
      name: 'literal',
      value: literal
  });
  stream.parameter({
      name: 'sequence',
      value: event.Count
  });
  stream.parameter({
      name: 'type',
      value: enrolType
  });
  stream.parameter({
      name: 'mode',
      value: 'enrol'
  });
  
  const gather = twiml.gather({
    action: `/enrolment/enrolment_say?FlowSid=${event.FlowSid}`,
    method: 'GET',
    input: 'speech',
    language: LANG,
    speechModel: 'numbers_and_commands',
    speechTimeout: 'auto',
    hints: recHints
  });
  
  twiml.say('We didn\'t receive any input. Goodbye!');
  console.log(twiml.toString());
 
  callback(null, twiml)
};