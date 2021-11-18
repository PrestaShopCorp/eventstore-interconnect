import { InterconnectionConfiguration } from '@eventstore-interconnect';
import {
  NEXT_EVENTSTORE_CONNECTION_STRING_DEST,
  NEXT_EVENTSTORE_CONNECTION_STRING_SOURCE,
  NEXT_EVENTSTORE_PASSWORD_DEST,
  NEXT_EVENTSTORE_PASSWORD_SRC,
  NEXT_EVENTSTORE_USERNAME_DEST,
  NEXT_EVENTSTORE_USERNAME_SRC,
} from '../../general.constants';
import { nextSubscriptions } from '../next-subscription';

export const nextSrcNextDestConfiguration: InterconnectionConfiguration = {
  source: {
    credentials: {
      username: NEXT_EVENTSTORE_USERNAME_SRC,
      password: NEXT_EVENTSTORE_PASSWORD_SRC,
    },
    connectionString: NEXT_EVENTSTORE_CONNECTION_STRING_SOURCE,
  },
  destination: {
    credentials: {
      username: NEXT_EVENTSTORE_USERNAME_DEST,
      password: NEXT_EVENTSTORE_PASSWORD_DEST,
    },
    connectionString: NEXT_EVENTSTORE_CONNECTION_STRING_DEST,
  },
  eventStoreSubsystems: {
    subscriptions: { persistent: nextSubscriptions },
  },
};
