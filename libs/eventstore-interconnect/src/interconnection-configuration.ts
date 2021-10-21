import { IEventStoreConfig } from 'nestjs-geteventstore-1.6.4';
import { IEventStoreBusConfig } from 'nestjs-geteventstore-1.6.4/dist/interfaces/event-store-bus-config.interface';

export interface LegacyEventStoreConfiguration {
  connectionConfig: IEventStoreConfig;
  eventStoreBusConfig: IEventStoreBusConfig;
}

export interface LatestEventStoreConfiguration {
  connectionConfig: IEventStoreConfig;
  eventStoreBusConfig: IEventStoreBusConfig;

  // temp, coming soon
}

export default interface InterconnectionConfiguration {
  sourceEventStoreConfiguration:
    | LegacyEventStoreConfiguration
    | LatestEventStoreConfiguration;
  destEventStoreConfiguration:
    | LegacyEventStoreConfiguration
    | LatestEventStoreConfiguration;
}
