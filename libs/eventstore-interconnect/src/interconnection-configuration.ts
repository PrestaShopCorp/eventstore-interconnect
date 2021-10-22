import {
  EventBusConfigType,
  IEventStoreConfig,
  IEventStoreServiceConfig,
} from 'nestjs-geteventstore-legacy';

export interface LegacyEventStoreConfiguration {
  connectionConfig: IEventStoreConfig;
  eventStoreServiceConfig: IEventStoreServiceConfig;
  eventBusConfig: EventBusConfigType;
}

export interface LatestEventStoreConfiguration {
  connectionConfig: IEventStoreConfig;
  eventStoreServiceConfig: IEventStoreServiceConfig;
  eventBusConfig: EventBusConfigType;

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
