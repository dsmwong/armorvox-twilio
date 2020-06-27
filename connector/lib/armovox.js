"use strict";
const axios = require('axios');
const debug = require('debug')('connector:armorvox');

function ArmorVoxClient(server, group) {
  this.server = server
  this.group = group
}

ArmorVoxClient.prototype.constructor = ArmorVoxClient

ArmorVoxClient.prototype.enrol = function (id, printName, utterances, channel, overrides) {
  debug(`enrol: id(${id}) printName(${printName}) channel(${channel})`);

  let enrolment = {};
  enrolment.utterances = utterances;
  enrolment.channel = channel;
  enrolment.override = overrides;

  return this.sendAndReceive(`/voiceprint/${id}/${printName}`, 'POST', enrolment);
}

ArmorVoxClient.prototype.verify = function (id, printName, utterance, channel, overrides) {
  debug(`verification: id(${id}) printName(${printName}) channel(${channel})`);

  let verification = {};
  verification.utterance = utterance;
  verification.channel = channel;
  verification.override = overrides;

  return this.sendAndReceive(`/voiceprint/${id}/${printName}`, 'PUT', verification);
}

ArmorVoxClient.prototype.delete = function (id, printName) {
  debug(`delete: id(${id}) printName(${printName})`)
  return this.sendAndReceive(`/voiceprint/${id}/${printName}`, 'DELETE', null);
}

ArmorVoxClient.prototype.getVoicePrint = function (id, printName, noPayload) {
  debug(`delete: id(${id}) printName(${printName}) noPayload(${noPayload})`)
  return this.sendAndReceive(`/voiceprint/${id}/${printName}?no_payload=${noPayload}`, 'GET', null);
}

ArmorVoxClient.prototype.getPhrase = function (vocab) {
  debug(`getPhrase: vocab(${vocab})`)
  return this.sendAndReceive(`/phrase/${vocab}`, 'GET', null);
}

ArmorVoxClient.prototype.checkHealth = function () {
  debug(`checkHealth`)
  return this.sendAndReceive(`/health`, 'GET', null);
}

ArmorVoxClient.prototype.checkQuality = function (printName, utterance, mode, channel, overrides) {
  debug(`checkQuality printName(${printName}) mode(${mode}) channel(${channel})`)

  let quality = {};
  quality.utterance = utterance;
  quality.channel = channel;
  quality.override = overrides;
  quality.mode = mode;

  return this.sendAndReceive(`/analysis/quality/${printName}`, 'POST', quality);
}

ArmorVoxClient.prototype.crossMatch = function (ids, printName, utterance, channel, overrides) {
  debug(`crossMatch ids(${ids} printName(${printName}) mode(${mode}) channel(${channel})`)

  let crossMatch = {};
  crossMatch.ids = ids
  crossMatch.utterance = utterance;
  crossMatch.channel = channel;
  crossMatch.override = overrides;

  return this.sendAndReceive(`/voiceprint/${printName}`, 'PUT', crossMatch);
}

ArmorVoxClient.prototype.detectGender = function (utterances, overrides) {
  debug(`detectGender`)
  let gender = {}
  gender.utterances = utterances;
  gender.override = overrides;
  return this.sendAndReceive(`/analysis/gender`, 'POST', gender);
}

ArmorVoxClient.prototype.similarity = function (utterances, overrides) {
  debug(`similarity`);

  let similarity = {};
  similarity.utterances = utterances;
  similarity.override = overrides;

  return this.sendAndReceive(`/analysis/similarity`, 'POST', similarity);
}

ArmorVoxClient.prototype.modelRank = function (utterances, ubmNames, overrides) {
  debug(`modelRank`);

  let modelRank = {};  
  modelRank.utterances = utterances;
  modelRank.ubm_names = ubmNames;
  modelRank.override = overrides;

  return this.sendAndReceive(`/analysis/model_rank`, 'POST', modelRank);
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
    validateStatus: null
  }

  // debug(`Making request ${JSON.stringify(config, null, 2)}`)

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