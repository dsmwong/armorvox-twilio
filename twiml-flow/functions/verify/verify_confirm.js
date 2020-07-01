const twilio_version = require('twilio/package.json').version;

const LANG = 'en-AU'
const VOICE = 'Polly.Russell'

exports.handler = function(context, event, callback) {

  console.log(`Entered ${context.PATH} node version ${process.version} twilio version ${twilio_version}`);

  if( event.DEBUG ) {
    console.log('Context ' + JSON.stringify(context));
    console.log('Event ' + JSON.stringify(event));
  }
  let twiml = new Twilio.twiml.VoiceResponse();
  
  const return_url = `https://webhooks.twilio.com/v1/Accounts/${event.AccountSid}/Flows/${event.FlowSid}?FlowEvent=return`

  const stop = twiml.stop();
  stop.stream({
      name: 'Verify Stream'
  })
  
  console.log('Result ' + event.SpeechResult + '(' + event.Confidence + ')');
  
  const say = twiml.say({
    voice: VOICE,
    language: LANG
  } ,'You said, ');
  
  const prosody = say.prosody({
    rate: '65%'
  }, '');

  const sayAs = prosody.addChild('say-as', {
    'interpret-as': 'spell-out'
  });

  sayAs.addText(event.SpeechResult);
  
  twiml.redirect(encodeURI(return_url +'&SpeechResult=' + event.SpeechResult + '&Confidence=' + event.Confidence));
  
  callback(null, twiml)
}