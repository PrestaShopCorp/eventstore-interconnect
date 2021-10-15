import {InterconnectionConfiguration} from './model/interconnection-configuration.interfaces';

export const EVENT_STORE_INTERCONNECTOR = Symbol.for('IEventStoreInterconnector');

export interface IEventStoreInterconnector {
  connectToV21x(conf: InterconnectionConfiguration);
}
