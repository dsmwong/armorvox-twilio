const twilio_version = require('twilio/package.json').version;

const RETURN_WEBHOOK = 'https://webhooks.twilio.com/v1/Accounts/AC72c69ce8a6745ba82d93ba0b2c94cbfa/Flows/FW26c0e6ad9d690eef1c7a69f2d116663c?FlowEvent=return'
const LANG = 'en-AU'
const VOICE = 'Polly.Russell'

exports.handler = function(context, event, callback) {

  console.log(`Entered ${context.PATH} node version ${process.version} twilio version ${twilio_version}`);
  console.log('Context ' + JSON.stringify(context));
  console.log('Event ' + JSON.stringify(event));
  
  let twiml = new Twilio.twiml.VoiceResponse();
  const result = event.SpeechResult.split('').join(' ');
  
  
  const stop = twiml.stop();
  stop.stream({
      name: 'Enrolment Stream'
  })
  
  console.log('Result ' + result);
  const say = twiml.say({
    voice: VOICE,
    language: LANG
  } ,'You said, ');
  
  say.prosody({
    rate: '65%'
  }, result);
  
  twiml.redirect(encodeURI(RETURN_WEBHOOK +'&SpeechResult=' + result))
  
  callback(null, twiml)
}