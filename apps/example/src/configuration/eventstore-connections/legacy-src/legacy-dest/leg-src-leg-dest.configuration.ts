import { InterconnectionConfiguration } from '@eventstore-interconnect';
import {
  EVENTSTORE_PASSWORD,
  EVENTSTORE_USERNAME,
  LEGACY_EVENTSTORE_HTTP_HOST_DEST,
  LEGACY_EVENTSTORE_HTTP_HOST_SOURCE,
  LEGACY_EVENTSTORE_HTTP_PORT_DEST,
  LEGACY_EVENTSTORE_HTTP_PORT_SOURCE,
  LEGACY_EVENTSTORE_TCP_HOST_DEST,
  LEGACY_EVENTSTORE_TCP_HOST_SOURCE,
  LEGACY_EVENTSTORE_TCP_PORT_DEST,
  LEGACY_EVENTSTORE_TCP_PORT_SOURCE,
} from '../../general.constants';
import { legacySubscriptions } from '../legacy-subscriptions';

export const legSrcLegDestConfiguration: InterconnectionConfiguration = {
  source: {
    credentials: {
      username: EVENTSTORE_USERNAME,
      password: EVENTSTORE_PASSWORD,
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
  eventStoreBusConfig: {
    subscriptions: {
      persistent: legacySubscriptions,
    },
  },
};
