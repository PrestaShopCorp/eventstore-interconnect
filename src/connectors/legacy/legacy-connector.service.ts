import {
  CqrsEventStoreModule,
  EventBusConfigType,
  IEventStoreConfig,
  IEventStoreServiceConfig
} from 'event-store-legacy';

export default class LegacyConnectorService {

  public register(
    eventStoreConfig: IEventStoreConfig,
    eventStoreServiceConfig?: IEventStoreServiceConfig,
    eventBusConfig?: EventBusConfigType
  ) {
    const module = () => CqrsEventStoreModule.register(
	 eventStoreConfig,
	 eventStoreServiceConfig,
	 eventBusConfig
    );
    return module;
  }
}
