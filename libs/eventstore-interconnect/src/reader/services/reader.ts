import { InterconnectionConfiguration } from '../../interconnection-configuration';

export const READER = Symbol();

export interface Reader {
  upsertPersistantSubscription(configuration: InterconnectionConfiguration);
}
