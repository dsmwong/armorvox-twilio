## Set up

### Twilio Studio Flow Definition
The Flow Definition is stored under `studio/` directory. Please use [twilio studio api](https://www.twilio.com/docs/studio/rest-api/v2/flow) to upload definition

Currently flow's connector endpoint is pointing to my localhost hosted connector. Please repoint this if you're using in your own environment. Replace `dawong.au.ngrok.io` with your server. This is your `CONNECTOR_SERVER`

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

### Storing Studio Flows

Install Prerequisite: [jq](https://stedolan.github.io/jq/)

```
$ twilio api:studio:v2:flows:fetch -o=json --sid=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx | jq '.[0].definition' > enrolment-flow-definition-template.json
$ twilio api:studio:v2:flows:fetch -o=json --sid=FWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx | jq '.[0].definition' > verify-flow-definition-template.json
```
