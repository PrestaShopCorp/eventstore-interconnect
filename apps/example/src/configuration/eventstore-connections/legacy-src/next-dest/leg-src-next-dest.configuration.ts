import { InterconnectionConfiguration } from '@eventstore-interconnect';
import {
  EVENTSTORE_PASSWORD,
  EVENTSTORE_USERNAME,
  LEGACY_EVENTSTORE_HTTP_HOST,
  LEGACY_EVENTSTORE_HTTP_PORT,
  LEGACY_EVENTSTORE_TCP_HOST,
  LEGACY_EVENTSTORE_TCP_PORT,
  NEXT_EVENTSTORE_CONNECTION_STRING,
} from '../../general.constants';
import { legacySubscriptions } from '../legacy-subscriptions';

export const legSrcNextDestConfiguration: InterconnectionConfiguration = {
  source: {
    credentials: {
      username: EVENTSTORE_USERNAME,
      password: EVENTSTORE_PASSWORD,
    },
    tcp: {
      host: LEGACY_EVENTSTORE_TCP_HOST,
      port: LEGACY_EVENTSTORE_TCP_PORT,
    },
    http: {
      host: LEGACY_EVENTSTORE_HTTP_HOST,
      port: LEGACY_EVENTSTORE_HTTP_PORT,
    },
  },
  destination: {
    credentials: {
      username: EVENTSTORE_USERNAME,
      password: EVENTSTORE_PASSWORD,
    },
    connectionString: NEXT_EVENTSTORE_CONNECTION_STRING,
  },
  eventStoreBusConfig: {
    subscriptions: {
      persistent: legacySubscriptions,
    },
  },
};
