> Disclaimer: this package is no longer maintained. Use it at your own risk.

# EventstoreInterconnect

The main purpose of the lib is to copy/paste an event from an eventstore to another one. The versions allowed are : v5.0.1 and v21.2.0 (also working with 2 eventstores with same version)

[A usecase](apps/example/README.md) has been prepared in order to test the different possibilities : Given a specific configuration, the system should automatically detect the version of the
  source and dest Eventstore, and connect to it.

## Connection
It will automatically upsert the persistent subscriptions into the source, and write events into the destination one, after
checking that the events are allowed and valid.

You just have to give the correct env variables, and the version is automatically detected. So no need for redeploy when
you want to upgrade your eventStore, or the one you want to write on.

Here is the list of the global env variable you might want to provide :

```bash
# For the source one, you can provide these one : 

EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_SRC
EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_SRC

EVENTSTORE_INTERCO_TCP_ENDPOINT_SRC
EVENTSTORE_INTERCO_TCP_PORT_SRC

EVENTSTORE_INTERCO_HTTP_ENDPOINT_SRC
EVENTSTORE_INTERCO_HTTP_PORT_SRC

EVENTSTORE_INTERCO_CONNECTION_STRING_SRC


# For the destination one, you can provide these one : 

EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_DST
EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_DST

EVENTSTORE_INTERCO_TCP_ENDPOINT_DST
EVENTSTORE_INTERCO_TCP_PORT_DST

EVENTSTORE_INTERCO_HTTP_ENDPOINT_DST
EVENTSTORE_INTERCO_HTTP_PORT_DST

EVENTSTORE_INTERCO_CONNECTION_STRING_DST


# This one is the duration of the timeout. By default it's 5000ms.
EVENTSTORE_INTERCO_EVENT_WRITER_TIMEOUT_IN_MS

# The interval both destination and source eventstore connection are tested. Default is 10_000ms
CONNECTION_LINK_CHECK_INTERVAL_IN_MS
```

So the only thing to do when an upgrade is needed : change these env variables, and restart the project. Defining what
to run (tcp connection on legacy eventstore or grpc connection on new event store) is automatic (if http conf is
provided, then the legacy eventstore will be used.)

## Events

You have to provide an object containing the different events allowed to be copied. Note that you can add a validation
on them, using the libs class-validator and class transformer. You have an example of event with no validation
[with Example2Event](apps/example/src/events/example2.event.ts) and an example of an event that can be validated
event [with Example1Event](apps/example/src/events/example1.event.ts)

## Safety strategy

Some issues can append during the workflow. Sometimes it can happen the destination eventstore is down. Sometimes, the event won't be valid. 

When an event is not writable during the timeout, the process is killed by an agressive timeout.
That means that after a custom duration, by default 5 seconds (but you can give your using
the `EVENTSTORE_INTERCO_EVENT_WRITER_TIMEOUT_IN_MS` env variable), the process will exit with code 1 by default.

When the event is invalid, it wont do anything by default, but you can override that behavior in a custom implementation.

This is called the Safety net. This basic behavior can be extended very easily when importing EventstoreInterconnectModule : 

```typescript
@Module({
  imports: [
    EventstoreInterconnectModule.connectToSrcAndDest(
      configuration,
      allowedEvents,
      CustomSafetyNet, // Here is the optionnal custom safty strategy you can provide
    ),
  ],
})
export class UsecaseModule {}
```
The custom strategy must implement the interface [`SafetyNet`](libs/eventstore-interconnect/src/safety-net/safety-net.service.interface.ts) In can see in the example app [a custom implementation of it](apps/example/src/custom-safety-net/custom-safety-net.ts)

## Auto kill

Every 10 seconds by default, the lib will check the connection to source and dest is ok. If the connection does not respond in this time lapse, process will exit with 1 (the timeout here is the same as the one for writting an event (`EVENTSTORE_INTERCO_EVENT_WRITER_TIMEOUT_IN_MS`)).
You can change the value of 10 seconds by changing the env variable `CONNECTION_LINK_CHECK_INTERVAL_IN_MS`


## Debug logs

You can switch debug logs by passing the boolean showDebugLogs in the configuration
