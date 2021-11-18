import { InterconnectionConfiguration } from '@eventstore-interconnect';
import {
  LEGACY_EVENTSTORE_HTTP_HOST_SOURCE,
  LEGACY_EVENTSTORE_HTTP_PORT_SOURCE,
  LEGACY_EVENTSTORE_PASSWORD_SRC,
  LEGACY_EVENTSTORE_TCP_HOST_SOURCE,
  LEGACY_EVENTSTORE_TCP_PORT_SOURCE,
  LEGACY_EVENTSTORE_USERNAME_SRC,
  NEXT_EVENTSTORE_CONNECTION_STRING_DEST,
  NEXT_EVENTSTORE_PASSWORD_DEST,
  NEXT_EVENTSTORE_USERNAME_DEST,
} from '../../general.constants';
import { legacySubscriptions } from '../legacy-subscriptions';

export const legSrcNextDestConfiguration: InterconnectionConfiguration = {
  source: {
    credentials: {
      username: LEGACY_EVENTSTORE_USERNAME_SRC,
      password: LEGACY_EVENTSTORE_PASSWORD_SRC,
    },
    tcp: {
      host: LEGACY_EVENTSTORE_TCP_HOST_SOURCE,
      port: LEGACY_EVENTSTORE_TCP_PORT_SOURCE,
    },
    http: {
      host: LEGACY_EVENTSTORE_HTTP_HOST_SOURCE,
      port: LEGACY_EVENTSTORE_HTTP_PORT_SOURCE,
    },
  },
  destination: {
    credentials: {
      username: NEXT_EVENTSTORE_USERNAME_DEST,
      password: NEXT_EVENTSTORE_PASSWORD_DEST,
    },
    connectionString: NEXT_EVENTSTORE_CONNECTION_STRING_DEST,
  },
  eventStoreBusConfig: {
    subscriptions: {
      persistent: legacySubscriptions,
    },
  },
};
