# EventstoreInterconnect

The project give a hand on interconnecting 2 different versions of 2 eventstores. These versions are : v5.0.1 and
v21.2.0 (also working with 2 eventstores with same version)

[A usecase](apps/example/README.md) has been prepared in order to test the different possibilities : Given a specific configuration, the system should automaticcally detect the version of the
  source and dest eventstore, and connect to it.

## Connection
It will automatically create/connect to subscriptions into the source, and write events into the
destination one, after checking that the events are allowed and valid.

You just have to give the correct env variables, and the version is automattically detected. So no need for redeploy
when you want to upgrade your eventStore, or the one you want to write on.

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
```

So the only thing to do when an upgrade is needed : change these env variables, and restart the project. The detect will be auto (if http conf is provided, then the legacy eventstore will be used.)


## Safety strategy
Sometimes it can happen the destination eventstore is down. In order not to miss events, an aggressive timeout is used. That means that after a custom duration, by default 5 seconds (but you can give your using the `EVENTSTORE_INTERCO_EVENT_WRITER_TIMEOUT_IN_MS` env variable), the process will exit brutally by default. This is called the Safety net. This basic behavior can be extended, very easily by using another provider, like this :

```typescript
import { SAFETY_NET } from '@eventstore-interconnect';

//...
{
  provide: SAFETY_NET, 
  useClass: MyCustomBehavior
}
//...
```
You have an example showing that [in the usecase of this project](apps/example/README.md). That is why it doesn't exit the process while running the example. 

**Note** that your class needs to implement the interface `SafetyNet`.
