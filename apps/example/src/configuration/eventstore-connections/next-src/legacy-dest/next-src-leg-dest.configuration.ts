import { InterconnectionConfiguration } from '@eventstore-interconnect';
import {
  LEGACY_EVENTSTORE_HTTP_HOST_DEST,
  LEGACY_EVENTSTORE_HTTP_PORT_DEST,
  LEGACY_EVENTSTORE_PASSWORD_DEST,
  LEGACY_EVENTSTORE_TCP_HOST_DEST,
  LEGACY_EVENTSTORE_TCP_PORT_DEST,
  LEGACY_EVENTSTORE_USERNAME_DEST,
  NEXT_EVENTSTORE_CONNECTION_STRING_SOURCE,
  NEXT_EVENTSTORE_PASSWORD_SRC,
  NEXT_EVENTSTORE_USERNAME_SRC,
} from '../../general.constants';
import { nextSubscriptions } from '../next-subscription';

export const nextSrcLegDestConfiguration: InterconnectionConfiguration = {
  source: {
    credentials: {
      username: NEXT_EVENTSTORE_USERNAME_SRC,
      password: NEXT_EVENTSTORE_PASSWORD_SRC,
    },
    connectionString: NEXT_EVENTSTORE_CONNECTION_STRING_SOURCE,
  },
  destination: {
    credentials: {
      username: LEGACY_EVENTSTORE_USERNAME_DEST,
      password: LEGACY_EVENTSTORE_PASSWORD_DEST,
    },
    tcp: {
      host: LEGACY_EVENTSTORE_TCP_HOST_DEST,
      port: LEGACY_EVENTSTORE_TCP_PORT_DEST,
    },
    http: {
      host: LEGACY_EVENTSTORE_HTTP_HOST_DEST,
      port: LEGACY_EVENTSTORE_HTTP_PORT_DEST,
    },
  },
  eventStoreSubsystems: {
    subscriptions: { persistent: nextSubscriptions },
  },
};
