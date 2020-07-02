const twilio_version = require('twilio/package.json').version;

exports.handler = function(context, event, callback) {

  console.log(`Entered ${context.PATH} node version ${process.version} twilio version ${twilio_version}`);

  // const twiml = new Twilio.twiml.VoiceResponse();
  // const client = context.getTwilioClient();

  callback(null, { status: 'ok', connector_server: context.CONNECTOR_SERVER, connector_key: context.CONNECTOR_KEY, functions_host: context.DOMAIN_NAME });
};