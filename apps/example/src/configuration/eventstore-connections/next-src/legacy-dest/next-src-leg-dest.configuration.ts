import { InterconnectionConfiguration } from '@eventstore-interconnect';
import {
  EVENTSTORE_PASSWORD,
  EVENTSTORE_USERNAME,
  LEGACY_EVENTSTORE_HTTP_HOST_DEST,
  LEGACY_EVENTSTORE_HTTP_PORT_DEST,
  LEGACY_EVENTSTORE_TCP_HOST_DEST,
  LEGACY_EVENTSTORE_TCP_PORT_DEST,
  NEXT_EVENTSTORE_CONNECTION_STRING_SOURCE,
} from '../../general.constants';
import { nextSubscriptions } from '../next-subscription';

export const nextSrcLegDestConfiguration: InterconnectionConfiguration = {
  source: {
    credentials: {
      username: EVENTSTORE_USERNAME,
      password: EVENTSTORE_PASSWORD,
    },
    connectionString: NEXT_EVENTSTORE_CONNECTION_STRING_SOURCE,
  },
  destination: {
    credentials: {
      username: EVENTSTORE_USERNAME,
      password: EVENTSTORE_PASSWORD,
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
