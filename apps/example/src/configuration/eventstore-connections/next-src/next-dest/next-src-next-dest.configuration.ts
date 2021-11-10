import { InterconnectionConfiguration } from '@eventstore-interconnect';
import {
  EVENTSTORE_PASSWORD,
  EVENTSTORE_USERNAME,
  NEXT_EVENTSTORE_CONNECTION_STRING_DEST,
  NEXT_EVENTSTORE_CONNECTION_STRING_SOURCE,
} from '../../general.constants';
import { nextSubscriptions } from '../next-subscription';

export const nextSrcNextDestConfiguration: InterconnectionConfiguration = {
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
    connectionString: NEXT_EVENTSTORE_CONNECTION_STRING_DEST,
  },
  eventStoreSubsystems: {
    subscriptions: { persistent: nextSubscriptions },
  },
};
