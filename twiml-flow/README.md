## Set up

### Environment Variables

| Config Value | Description |
| :--| :-- |
| ACCOUNT_SID   | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console)|
| AUTH_TOKEN    | Used to authenticate - [just like the above, you'll find this here](https://www.twilio.com/console)|
| FLOW_SID | SID of the Studio Enrolment Flow|
| CONNECTOR_SERVER    | Server hosting the armorvox connector e.g. armovox.ngrok.io |

## TO-DO / Considerations

- It may be worthwhile to consider moving the entire flow into Twiml flow rather than using part Studio. It would definitely be cleaner. 
- Studio Limitations: As the Studio Twiml Redirect Widget does not allow variable to be pased, parameters leading into enrolment flow is hard coded.