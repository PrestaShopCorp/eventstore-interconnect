import {EventBusConfigType, EventStoreConnectionConfig, IEventStoreSubsystems} from '@eventstore-interconnect';

export interface ConfigurationV21x {
  eventBusConnectionConfig: EventStoreConnectionConfig,
  eventStoreSubsystems: IEventStoreSubsystems,
  eventBusConfig: EventBusConfigType
}
