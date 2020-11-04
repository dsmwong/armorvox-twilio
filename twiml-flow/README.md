## Set up

### Twilio Studio Flow Definition
The Flow Definition is stored under `studio/` directory. Please use [twilio studio api](https://www.twilio.com/docs/studio/rest-api/v2/flow) to upload definition

~~Currently flow's connector endpoint is pointing to my localhost hosted connector. Please repoint this if you're using in your own environment. Replace `dawong.au.ngrok.io` with your server. This is your `CONNECTOR_SERVER`~~

### Gather Options
| Parameters | Description |
| :--| :-- |
| FlowSid    | (Required) FlowSID passed from Studio. This is required to be explicitly passed |
| Count      | (Required) Sequence Count of the Question as part of the enrolment |
| maxdigits  | (Optional) Maximum Length of string for enrolment. (default: 8)|
| enrolType | (Optional) Enrolment Question Type, if not defined it will take `EnrolTypeOrder` defined in [enrolment_gather.js](./functions/enrolment/enrolment_gather.js) Refer to table below for valid Enrol Type|
| NoRepeat | (Optional) Boolean value defining if Repeated Digits are allowed. |
| NoZeros | (Optional) Boolean value defining if Zero (0) is allowed. |

The following Enrolment Type will take into account `maxdigits`, `NoRepeat`, `NoZeros`

| Enrol Type | Description |
| :-- | :-- |
| `Alphanumeric`| Alphanumeric String `[0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ]` |
| `Digits`| Numeric String `[0123456789]` |
| `Caller`| Caller's Phone Number as defined in `Caller` field from Twilio |
| `CountUp`| Counting Up from 1 to 9 |
| `CountDown`| Counting Down from 9 to 1 |
| `FourTwo`| Repeating 4 Digit String for example `9657 9657`|


### Environment Variables

| Config Value | Description |
| :--| :-- |
| ACCOUNT_SID   | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console)|
| AUTH_TOKEN    | Used to authenticate - [just like the above, you'll find this here](https://www.twilio.com/console)|
| CONNECTOR_SERVER    | Server hosting the armorvox connector e.g. armovox.ngrok.io |
| CONNECTOR_KEY    | Connector Access Key - this should match that in connector |
| ENROLMENT_STRATEGY    | Array containing enrolment type, valid value as described above. Default: `["Caller", "CountUp", "Caller", "CountDown", "Caller"]` |
| ENROLMENT_LOOP    | Number of questions to ask in Enrolment Loop. Default: `5`|

### Source Control of Studio Flows

Install Prerequisite: [jq](https://stedolan.github.io/jq/)

```
$ twilio api:studio:v2:flows:fetch -o=json --sid=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx | jq '.[0].definition' > enrolment-flow-definition-template.json
$ twilio api:studio:v2:flows:fetch -o=json --sid=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx | jq '.[0].definition' > verify-flow-definition-template.json
```


## Deployment Steps

Setup
- Ensure above environment variables are set

Functions
```
# Deploy
$ twilio serverless:deploy
of 
$ npm run deploy

Deploying functions & assets to the Twilio Runtime

Account         ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Token           xxxx****************************
Service Name    twiml-flow
Environment     dev
Root Directory  /Users/dawong/dev/source/gitlab/armorvox-twilio/twiml-flow
Dependencies    twilio
Env Variables   CONNECTOR_SERVER, CONNECTOR_KEY, ENROLMENT_STRATEGY, ENROLMENT_LOOP

✔ Serverless project successfully deployed

Deployment Details
Domain: twiml-flow-xxxx-dev.twil.io                   <<-- Remember this serverless domain for steps below
Service:
   twiml-flow (ZSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)    <<-- Remember this Service SID for steps below
Environment:
   dev (ZExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)           <<-- Remember this Environment SID for steps below
Build SID:
   ZBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
View Live Logs:
   https://www.twilio.com/console/assets/api/ZSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/environment/ZExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Functions:
   [protected] https://twiml-flow-xxxx-dev.twil.io/getConfig
   https://twiml-flow-xxxx-dev.twil.io/enrolment/enrolment_gather
   https://twiml-flow-xxxx-dev.twil.io/enrolment/enrolment_say
   https://twiml-flow-xxxx-dev.twil.io/verify/verify_confirm
   https://twiml-flow-xxxx-dev.twil.io/verify/verify_gather
Assets:


# Validate
$ twilio api:serverless:v1:services:functions:list --service-sid=ZSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

SID                                 Friendly Name                Date Created                 
ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  /verify/verify_confirm       Jul 07 2020 19:11:58 GMT+1000
ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  /getConfig                   Jul 07 2020 19:11:58 GMT+1000     <<-- Remember this SID for steps below
ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  /verify/verify_gather        Jul 07 2020 19:11:58 GMT+1000
ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  /test/sync                   Jul 07 2020 19:11:58 GMT+1000
ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  /enrolment/enrolment_say     Jul 07 2020 19:11:58 GMT+1000
ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  /test/createdoc              Jul 07 2020 19:11:58 GMT+1000
ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  /enrolment/enrolment_gather  Jul 07 2020 19:11:58 GMT+1000
```

(If Required) Deletion of Serverless deployment
```
# Delete Serverless Service
$ twilio api:serverless:v1:services:remove --sid=twiml-flow
$ rm .twilio-functions
```

Studio Flows (CLI)
- Update flow definition templates. Find the following code block in `studio/enrolment-flow-definition-template.json` and `studio/verify-flow-definition-template.json`
```
"type": "run-function",
      "name": "get_config",
      "properties": {
        "url": "https://${serverless-domain}/getConfig",              // Replace ${serverless-domain} with output from deploy step 
        "function_sid": "ZHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",         // Replace with /getConfig function SID from validate step should start with ZH
        "service_sid": "ZSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",          // Replace with Service SID from deploy step
        "environment_sid": "ZExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",      // Replace with Environment SID from deployment step
```
  
```
# Deploy Enrolment Flow
$ twilio api:studio:v2:flows:create --commit-message "Enrolment Flow" --friendly-name "EnrolmentFlow" --status draft --definition "`cat studio/enrolment-flow-definition-template.json`"

# Deploy Verify Flow
$ twilio api:studio:v2:flows:create --commit-message "Verify Flow" --friendly-name "VerifyFlow" --status draft --definition "`cat studio/verify-flow-definition-template.json`"

# Update Enrolment Flow
$ twilio api:studio:v2:flows:update --commit-message "Enrolment Flow" --sid FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx --status draft --definition "`cat studio/enrolment-flow-definition-template.json`"

# Update Verify Flow
$ twilio api:studio:v2:flows:update --commit-message "Verify Flow" --sid FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx --status draft --definition "`cat studio/verify-flow-definition-template.json`"
```

Studio in Console Validation and Publish steps
- Validate Enrolment Flow and Verify Flow in Studio Section of Twilio Console
- Publish Flow after validating get_config block has picked up the changes

Numbers in Console
- 