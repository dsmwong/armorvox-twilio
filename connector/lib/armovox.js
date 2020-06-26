const https = require('https');
const axios = require('axios');
const debug = require('debug')('connector:armorvox');

function ArmorVoxClient(server, group) {
  this.server = server
  this.group = group
}

ArmorVoxClient.prototype.constructor = ArmorVoxClient

ArmorVoxClient.prototype.enrol = function (id, printName, utterances, channel, override) {
  debug(`enrol: id(${id}) printName(${printName}) channel(${channel})`);

  let enrolment = {};
  enrolment.utterances = utterances;
  enrolment.channel = channel;
  enrolment.override = override;

  return this.sendAndReceive(`/voiceprint/${id}/${printName}`, 'POST', enrolment);
}

ArmorVoxClient.prototype.getPhrase = function (vocab) {
  debug(`getPhrase: vocab(${vocab})`)
  return this.sendAndReceive(`/phrase/${vocab}`, 'GET', null);
}

ArmorVoxClient.prototype.checkHealth = function () {
  debug(`checkHealth`)
  return this.sendAndReceive(`/health`, 'GET', null);
}

ArmorVoxClient.prototype.detectGender = function (utterances, override) {
  debug(`detectGender`)
  let gender = {}
  gender.utterances = utterances;
  gender.override = override;
  return this.sendAndReceive(`/analysis/gender`, 'POST', gender);
}

ArmorVoxClient.prototype.sendAndReceive = function (requestPath, method, body) {
  debug(`Sending ${method} ${requestPath} ${body}`);
  let path = this.server + requestPath;

  const config = {
    baseURL: this.server,
    method: method,
    url: requestPath,
    data: body,
    responseType: 'json',
    headers: {
      Authorization: this.group,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    validateStatus: function (status) {
      return true
    }
  }

  // debug(`Making request ${JSON.stringify(config, null, 2)}`)

  axios.interceptors.response.use((response) => {
    return response;
}, function (error) {
    // Do something with response error
    debug(JSON.stringify(error, null, 2))
    return Promise.reject(error);
});
  const request = axios.request(config)

  return request.then( (response) => {
    debug(response);
    let result = {}
    result.status = response.status;
    result.statusText = response.statusText
    result.body = response.data
    return result;
  })
  .catch((err) => {
    debug(JSON.stringify(err))
    throw err
  });
}

module.exports = ArmorVoxClient