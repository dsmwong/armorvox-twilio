const twilio_version = require('twilio/package.json').version;

const SYNC_SERVICE = 'ArmorVox';
const SYNC_SID = 'IS82c1d62d94cc20cd60c206c7e1b13633';

exports.handler = async function(context, event, callback) {

  console.log(`Entered ${context.PATH} node version ${process.version} twilio version ${twilio_version}`);

  const client = context.getTwilioClient();

  try {
    
    // let services = await client.sync.services.list({properties: 'sid,uniqueName,friendlyName'});

    // let service = {};

    // let i = 0;
    // for(i = 0; i < services.length; i++) {
    //   console.log(services[i]);
    //   if( services[i].friendlyName === SYNC_SERVICE ) {
    //     service = services[i];    
    //   }
    // }

    service = await client.sync.services(SYNC_SID).fetch();

    callback(null, {status:'ok', message:'ok', service: service});
  } catch (e) {
    callback(null, {status:'error', error: e});
  //
  }

  // Start Code Here

};