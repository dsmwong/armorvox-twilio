# ArmorVox Twilio Connector
The Connector is to provide access to Armorvox API and also to act as an intermediate utternace store before sending off for Enrol and Verification

For the demo, this is hosted on Heroku

### Environment Variables

| Config Value | Description |
| :--| :-- |
| ARMORVOX_ENDPOINT   | ArmorVox API Endpoint|
| ARMORVOX_GROUP    | ArmorVox Group ID for attributing to the ArmorVox Group|
| ACCESS_KEY | A Generated Access Key the Studio Flow must match in order to submit Enrolment and Verification Calls|

### Special Note

This is being subtree pushed separately to https://github.com/dsmwong/armorvox-twilio-connector so Heroku can deploy from that repo

```
$ git remote add armorvox-twilio-connector https://github.com/dsmwong/armorvox-twilio-connector.git
$ git subtree push --prefix=connector armorvox-twilio-connector master
```

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/dsmwong/armorvox-twilio-connector.git)
