import {
  EventBusConfigType as LegacyEventBusConfigType,
  IEventStoreConfig,
  IEventStoreServiceConfig,
} from 'nestjs-geteventstore-legacy';
import {
  EventStoreConnectionConfig,
  IEventStoreSubsystems,
  EventBusConfigType,
} from 'nestjs-geteventstore-next';

export interface LegacyEventStoreConfiguration {
  connectionConfig: IEventStoreConfig;
  eventStoreServiceConfig: IEventStoreServiceConfig;
  eventBusConfig: LegacyEventBusConfigType;
}

export interface NextEventStoreConfiguration {
  eventStoreConfig: EventStoreConnectionConfig;
  eventStoreSubsystems?: IEventStoreSubsystems;
  eventBusConfig?: EventBusConfigType;
}

export default interface InterconnectionConfiguration {
  sourceEventStoreConfiguration:
    | LegacyEventStoreConfiguration
    | NextEventStoreConfiguration;
  destEventStoreConfiguration:
    | LegacyEventStoreConfiguration
    | NextEventStoreConfiguration;
}
