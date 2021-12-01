import { InterconnectionConfiguration } from '@eventstore-interconnect';
import {
  LEGACY_EVENTSTORE_HTTP_HOST_DEST,
  LEGACY_EVENTSTORE_HTTP_HOST_SOURCE,
  LEGACY_EVENTSTORE_HTTP_PORT_DEST,
  LEGACY_EVENTSTORE_HTTP_PORT_SOURCE,
  LEGACY_EVENTSTORE_PASSWORD_DEST,
  LEGACY_EVENTSTORE_PASSWORD_SRC,
  LEGACY_EVENTSTORE_TCP_HOST_DEST,
  LEGACY_EVENTSTORE_TCP_HOST_SOURCE,
  LEGACY_EVENTSTORE_TCP_PORT_DEST,
  LEGACY_EVENTSTORE_TCP_PORT_SOURCE,
  LEGACY_EVENTSTORE_USERNAME_DEST,
  LEGACY_EVENTSTORE_USERNAME_SRC,
} from '../../general.constants';
import { legacySubscriptions } from '../legacy-subscriptions';

export const legSrcLegDestConfiguration: InterconnectionConfiguration = {
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
    tcpConnectionName: 'legacy-source-connection',
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
    tcpConnectionName: 'legacy-destination-connection',
  },
  eventStoreBusConfig: {
    subscriptions: {
      persistent: legacySubscriptions,
    },
  },
};
