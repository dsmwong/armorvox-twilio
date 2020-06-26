var TwiML = require('twilio/lib/twiml/TwiML');
var VoiceResponse = require('twilio/lib/twiml/VoiceResponse');

VoiceResponse.prototype.sayEx = function sayEx(attributes, words) {
  return new SayEx(this.response.ele('Say', attributes, words));
}

function SayEx(sayEx) {
  this.sayEx = sayEx;
  this._propertyName = 'sayEx'
}

SayEx.prototype = Object.create(TwiML.prototype);
SayEx.prototype.constructor = SayEx;

SayEx.prototype.prosody = function prosody(attributes, words) {
  return new SsmlProsodyEx(this.sayEx.ele('prosody', attributes, words));
};
function SsmlProsodyEx(ssmlProsodyEx) {
  this.ssmlProsodyEx = ssmlProsodyEx;
  this._propertyName = 'ssmlProsodyEx';
}

SsmlProsodyEx.prototype = Object.create(TwiML.prototype);
SsmlProsodyEx.prototype.constructor = SsmlProsodyEx;

SsmlProsodyEx.prototype.sayAs = function sayAs(attributes, words) {
  return new SsmlSayAsEx(this.ssmlProsodyEx.ele('say-as', attributes, words));
};

function SsmlSayAsEx(ssmlSayAsEx) {
  this.ssmlSayAsEx = ssmlSayAsEx;
  this._propertyName = 'ssmlSayAsEx';
}

SsmlSayAsEx.prototype = Object.create(TwiML.prototype);
SsmlSayAsEx.prototype.constructor = SsmlSayAsEx;

module.exports = VoiceResponse;